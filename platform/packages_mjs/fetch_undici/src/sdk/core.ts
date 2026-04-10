/**
 * SDK Core for fetch-undici
 *
 * Provides simplified SDK interface with industry-standard retry patterns:
 * - Capped exponential backoff with jitter
 * - Retry-After header support
 * - Idempotency-aware retry
 * - Circuit breaker pattern
 */

import { logger, type Logger } from '../logger.js'
import { AsyncClient, type RequestOptions } from '../client/index.js'
import { BasicAuth, BearerAuth, type Auth } from '../auth/index.js'
import { Response } from '../models/response.js'
import {
  JitterStrategy,
  calculateDelay,
  parseRetryAfter,
  shouldRetryMethod,
  isRetryableError,
  CircuitBreaker,
  CircuitOpenError,
  type CircuitBreakerConfig,
  type RetryConfig
} from '../retry/index.js'

const defaultLog = logger.create('fetch-undici', import.meta.url)

/** SDK authentication configuration */
export interface SDKAuthConfig {
  type: 'basic' | 'bearer' | 'api-key' | 'custom'
  username?: string
  password?: string
  token?: string
  apiKey?: string
  headerName?: string
  auth?: Auth
}

/** SDK configuration */
export interface SDKConfig {
  /** Base URL */
  baseUrl: string
  /** Authentication */
  auth?: SDKAuthConfig
  /** Timeout in milliseconds */
  timeout?: number

  /** Maximum retry attempts (default: 3) */
  maxRetries?: number
  /** Initial delay in milliseconds (default: 500) */
  retryDelay?: number
  /** Backoff multiplier (default: 2.0) */
  retryBackoff?: number
  /** Maximum delay cap in milliseconds (default: 30000) */
  maxRetryDelay?: number
  /** Jitter strategy (default: FULL) */
  jitter?: JitterStrategy
  /** HTTP status codes to retry (default: [429, 500, 502, 503, 504]) */
  retryOnStatus?: number[]
  /** Retry on connection/timeout errors (default: true) */
  retryOnException?: boolean
  /** Honor Retry-After header (default: true) */
  respectRetryAfter?: boolean
  /** Methods to retry, undefined = idempotent only */
  retryMethods?: string[]

  /** Circuit breaker configuration */
  circuitBreaker?: CircuitBreakerConfig

  /** Custom logger */
  logger?: Logger
}

/** SDK response format */
export interface SDKResponse<T = unknown> {
  success: boolean
  statusCode: number
  data?: T
  error?: string
  headers: Record<string, string>
  duration: number
}

/**
 * SDK - Simplified HTTP client for programmatic use
 *
 * Provides a simplified interface with industry-standard retry patterns.
 *
 * @example
 * ```typescript
 * const sdk = createSDK({
 *   baseUrl: 'https://api.example.com',
 *   auth: { type: 'bearer', token: 'your-token' },
 *   maxRetries: 5,
 *   jitter: JitterStrategy.FULL,
 *   circuitBreaker: { failureThreshold: 5 }
 * })
 *
 * const result = await sdk.get('/users')
 * if (result.success) {
 *   console.log(result.data)
 * }
 * ```
 */
export class SDK {
  private readonly _client: AsyncClient
  private readonly _log: Logger

  // Retry configuration
  private readonly _maxRetries: number
  private readonly _retryDelay: number
  private readonly _retryBackoff: number
  private readonly _maxRetryDelay: number
  private readonly _jitter: JitterStrategy
  private readonly _retryOnStatus: number[]
  private readonly _retryOnException: boolean
  private readonly _respectRetryAfter: boolean
  private readonly _retryMethods?: string[]

  // Circuit breaker
  private readonly _circuitBreaker: CircuitBreaker | null

  // Track last delay for decorrelated jitter
  private _lastDelay: number

  constructor(config: SDKConfig) {
    this._log = config.logger ?? defaultLog

    // Retry configuration with defaults
    this._maxRetries = config.maxRetries ?? 3
    this._retryDelay = config.retryDelay ?? 500
    this._retryBackoff = config.retryBackoff ?? 2.0
    this._maxRetryDelay = config.maxRetryDelay ?? 30000
    this._jitter = config.jitter ?? JitterStrategy.FULL
    this._retryOnStatus = config.retryOnStatus ?? [429, 500, 502, 503, 504]
    this._retryOnException = config.retryOnException ?? true
    this._respectRetryAfter = config.respectRetryAfter ?? true
    this._retryMethods = config.retryMethods
    this._lastDelay = this._retryDelay

    // Circuit breaker
    this._circuitBreaker = config.circuitBreaker
      ? new CircuitBreaker(config.circuitBreaker)
      : null

    // Build auth
    const auth = this._buildAuth(config.auth)

    // Create client (without retry - SDK handles it)
    this._client = new AsyncClient({
      baseUrl: config.baseUrl,
      auth,
      timeout: config.timeout ?? 30000,
      logger: this._log
    })

    this._log.info('SDK initialized', {
      baseUrl: config.baseUrl,
      hasAuth: !!auth,
      maxRetries: this._maxRetries,
      jitter: this._jitter,
      circuitBreakerEnabled: !!this._circuitBreaker
    })
  }

  /**
   * Get circuit breaker instance
   */
  get circuitBreaker(): CircuitBreaker | null {
    return this._circuitBreaker
  }

  /**
   * Make GET request
   */
  async get<T = unknown>(
    url: string,
    options?: RequestOptions
  ): Promise<SDKResponse<T>> {
    return this._request<T>('GET', url, options)
  }

  /**
   * Make POST request
   */
  async post<T = unknown>(
    url: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<SDKResponse<T>> {
    return this._request<T>('POST', url, { ...options, json: data })
  }

  /**
   * Make PUT request
   */
  async put<T = unknown>(
    url: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<SDKResponse<T>> {
    return this._request<T>('PUT', url, { ...options, json: data })
  }

  /**
   * Make PATCH request
   */
  async patch<T = unknown>(
    url: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<SDKResponse<T>> {
    return this._request<T>('PATCH', url, { ...options, json: data })
  }

  /**
   * Make DELETE request
   */
  async delete<T = unknown>(
    url: string,
    options?: RequestOptions
  ): Promise<SDKResponse<T>> {
    return this._request<T>('DELETE', url, options)
  }

  /**
   * Close SDK
   */
  async close(): Promise<void> {
    await this._client.close()
    this._log.info('SDK closed')
  }

  /**
   * Make request with retry
   */
  private async _request<T>(
    method: string,
    url: string,
    options?: RequestOptions
  ): Promise<SDKResponse<T>> {
    const startTime = Date.now()

    // Check circuit breaker
    if (this._circuitBreaker && !this._circuitBreaker.allowRequest()) {
      const duration = Date.now() - startTime
      return {
        success: false,
        statusCode: 0,
        error: 'Circuit breaker is open',
        headers: {},
        duration
      }
    }

    // Check if method is safe to retry
    const canRetry = shouldRetryMethod(
      method,
      options?.headers as Record<string, string>,
      this._retryMethods
    )

    let lastError: Error | null = null
    this._lastDelay = this._retryDelay

    for (let attempt = 0; attempt <= this._maxRetries; attempt++) {
      try {
        const response = await this._client.request(method, url, options)
        const duration = Date.now() - startTime
        const result = await this._formatResponse<T>(response, duration)

        // Check if we should retry based on status
        const shouldRetryStatus =
          this._retryOnStatus.includes(response.statusCode) &&
          attempt < this._maxRetries &&
          canRetry

        if (shouldRetryStatus) {
          let delay = calculateDelay(
            attempt,
            this._retryDelay,
            this._retryBackoff,
            this._maxRetryDelay,
            this._jitter,
            this._lastDelay
          )

          // Check Retry-After header
          if (this._respectRetryAfter) {
            const retryAfter = parseRetryAfter(response.headers.get('Retry-After'))
            if (retryAfter !== null) {
              delay = Math.min(retryAfter, this._maxRetryDelay)
              this._log.info('Using Retry-After header', {
                retryAfter,
                cappedTo: delay
              })
            }
          }

          this._log.warn('Retrying request', {
            statusCode: response.statusCode,
            attempt: attempt + 1,
            delay: Math.round(delay),
            method,
            url
          })

          // Record failure for circuit breaker
          if (this._circuitBreaker) {
            this._circuitBreaker.recordFailure()
          }

          this._lastDelay = delay
          await this._delay(delay)
          continue
        }

        // Success - record for circuit breaker
        if (this._circuitBreaker && result.success) {
          this._circuitBreaker.recordSuccess()
        }

        return result
      } catch (err) {
        lastError = err as Error

        // Record failure for circuit breaker
        if (this._circuitBreaker) {
          this._circuitBreaker.recordFailure()
        }

        // Check if error is retryable
        const isRetryable =
          this._retryOnException && isRetryableError(lastError) && canRetry

        if (!isRetryable) {
          this._log.warn('Not retrying non-retryable error', {
            method,
            error: lastError.message
          })
          break
        }

        if (attempt < this._maxRetries) {
          const delay = calculateDelay(
            attempt,
            this._retryDelay,
            this._retryBackoff,
            this._maxRetryDelay,
            this._jitter,
            this._lastDelay
          )

          this._log.warn('Request failed, retrying', {
            error: lastError.message,
            attempt: attempt + 1,
            delay: Math.round(delay),
            method
          })

          this._lastDelay = delay
          await this._delay(delay)
        }
      }
    }

    // All retries failed
    const duration = Date.now() - startTime
    return {
      success: false,
      statusCode: 0,
      error: lastError?.message ?? 'Unknown error',
      headers: {},
      duration
    }
  }

  /**
   * Format response into SDK format
   */
  private async _formatResponse<T>(
    response: Response,
    duration: number
  ): Promise<SDKResponse<T>> {
    const headers: Record<string, string> = {}
    for (const [name, value] of response.headers) {
      headers[name] = value
    }

    if (response.ok) {
      let data: T | undefined
      try {
        data = await response.json<T>()
      } catch {
        // Not JSON, leave data undefined
      }

      return {
        success: true,
        statusCode: response.statusCode,
        data,
        headers,
        duration
      }
    }

    return {
      success: false,
      statusCode: response.statusCode,
      error: `HTTP ${response.statusCode}`,
      headers,
      duration
    }
  }

  /**
   * Delay helper
   */
  private _delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Build auth from config
   */
  private _buildAuth(config?: SDKAuthConfig): Auth | undefined {
    if (!config) return undefined

    switch (config.type) {
      case 'basic':
        if (config.username && config.password) {
          return new BasicAuth(config.username, config.password)
        }
        break
      case 'bearer':
        if (config.token) {
          return new BearerAuth(config.token)
        }
        break
      case 'custom':
        return config.auth
    }

    return undefined
  }
}

/**
 * Create SDK instance
 */
export function createSDK(config: SDKConfig): SDK {
  return new SDK(config)
}

// Re-export types for convenience
export { JitterStrategy, CircuitBreaker, CircuitOpenError }
export type { CircuitBreakerConfig, RetryConfig }
