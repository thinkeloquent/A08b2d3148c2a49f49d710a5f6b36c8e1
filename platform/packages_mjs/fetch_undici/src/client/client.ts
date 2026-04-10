/**
 * AsyncClient for fetch-undici
 *
 * Main HTTP client class providing httpx-compatible API.
 * Includes industry-standard retry patterns and circuit breaker.
 */

import { request as undiciRequest, ProxyAgent, type Dispatcher } from 'undici'
import { Readable } from 'stream'
import { logger, type Logger } from '../logger.js'
import { Request, normalizeMethod, type HttpMethod } from '../models/request.js'
import { Response } from '../models/response.js'
import { Headers, createHeaders } from '../models/headers.js'
import { buildURL, type QueryParams } from '../models/url.js'
import { createTimeout, Timeout } from '../config/timeout.js'
import { createLimits, Limits } from '../config/limits.js'
import { createTLSConfig, TLSConfig } from '../config/tls.js'
import { DispatcherFactory } from '../transport/dispatcher.js'
import { MountRouter, createMountRouter } from '../transport/router.js'
import { processBody, hasBodyOptions } from '../request/body.js'
import { buildURLWithParams } from '../request/params.js'
import { mapUndiciError } from '../exceptions/index.js'
import { createProxy, getEnvProxy, type Proxy } from '../config/proxy.js'
import type { Auth } from '../auth/base.js'
import {
  type AsyncClientOptions,
  type RequestOptions,
  type EventHooks,
  normalizeClientOptions,
  normalizeRequestOptions
} from './options.js'
import {
  type RetryConfig,
  normalizeRetryConfig,
  isRetryableError,
  calculateDelay,
  parseRetryAfter,
  shouldRetryMethod,
  CircuitBreaker,
  CircuitOpenError
} from '../retry/index.js'

const defaultLog = logger.create('fetch-undici', import.meta.url)

/**
 * AsyncClient - Main HTTP client
 *
 * Provides httpx-compatible HTTP client functionality using Undici.
 *
 * @example
 * ```typescript
 * const client = new AsyncClient({
 *   baseUrl: 'https://api.example.com',
 *   auth: new BasicAuth('user', 'pass'),
 *   timeout: { connect: 5000, read: 30000 }
 * })
 *
 * const response = await client.get('/users')
 * const data = await response.json()
 *
 * await client.close()
 * ```
 */
export class AsyncClient {
  private readonly _baseUrl?: URL
  private readonly _defaultHeaders: Headers
  private readonly _defaultParams?: QueryParams
  private readonly _auth?: Auth
  private readonly _timeout: Timeout
  private readonly _limits: Limits
  private readonly _tls?: TLSConfig
  private readonly _http2: boolean
  private readonly _allowH2: boolean
  private readonly _maxResponseSize: number
  private readonly _pipelining: number
  private readonly _followRedirects: boolean
  private readonly _maxRedirects: number
  private readonly _eventHooks: EventHooks
  protected readonly _dispatcherFactory: DispatcherFactory
  protected readonly _mountRouter: MountRouter
  protected readonly _log: Logger
  private readonly _proxy?: Proxy

  // Retry configuration
  private readonly _retry: Required<RetryConfig> | null
  private readonly _circuitBreaker: CircuitBreaker | null
  private _lastDelay: number = 500

  protected _closed = false

  constructor(options?: AsyncClientOptions) {
    const opts = normalizeClientOptions(options)

    // Logger
    this._log = opts.logger ?? defaultLog

    // Base URL
    if (opts.baseUrl) {
      this._baseUrl = new URL(opts.baseUrl)
      this._log.debug('Base URL set', { baseUrl: this._baseUrl.toString() })
    }

    // Headers
    this._defaultHeaders = createHeaders(opts.headers)

    // Params
    this._defaultParams = opts.params

    // Auth
    this._auth = opts.auth

    // Timeout
    this._timeout = createTimeout(opts.timeout)

    // Limits
    this._limits = createLimits(opts.limits)

    // TLS
    if (opts.tls) {
      this._tls = createTLSConfig(opts.tls)
    }

    // HTTP/2
    this._http2 = opts.http2 ?? false
    this._allowH2 = opts.allowH2 ?? true
    this._maxResponseSize = opts.maxResponseSize ?? -1
    this._pipelining = opts.pipelining ?? 1

    // Redirects
    this._followRedirects = opts.followRedirects ?? true
    this._maxRedirects = opts.maxRedirects ?? 10

    // Event hooks
    this._eventHooks = opts.eventHooks ?? {}

    // Dispatcher factory
    this._dispatcherFactory = new DispatcherFactory({
      timeout: this._timeout,
      limits: this._limits,
      tls: this._tls,
      http2: this._http2,
      allowH2: this._allowH2,
      maxResponseSize: this._maxResponseSize,
      connect: opts.connect,
      pipelining: this._pipelining,
      interceptors: opts.interceptors,
      followRedirects: this._followRedirects,
      maxRedirects: this._maxRedirects
    })

    // Mount router
    this._mountRouter = createMountRouter(opts.mounts)

    // Proxy — create ProxyAgent and mount on router for http:// and https://
    const tlsOpts = this._tls ? this._tls.toUndiciOptions() as Record<string, unknown> : undefined
    const proxy = createProxy(opts.proxy)
    if (proxy) {
      const proxyAgent = new ProxyAgent(proxy.toUndiciOptions(tlsOpts))
      this._proxy = proxy
      this._mountRouter.mount('https://', proxyAgent as unknown as Dispatcher)
      this._mountRouter.mount('http://', proxyAgent as unknown as Dispatcher)
      this._log.info('Proxy mounted on router', { url: proxy.sanitizedUrl })
    } else if (opts.trustEnv) {
      const envProxy = getEnvProxy()
      if (envProxy.https) {
        const httpsAgent = new ProxyAgent(envProxy.https.toUndiciOptions(tlsOpts))
        this._proxy = envProxy.https
        this._mountRouter.mount('https://', httpsAgent as unknown as Dispatcher)
        this._log.info('Environment HTTPS proxy mounted', { url: envProxy.https.sanitizedUrl })
      }
      if (envProxy.http) {
        const httpAgent = new ProxyAgent(envProxy.http.toUndiciOptions(tlsOpts))
        if (!this._proxy) this._proxy = envProxy.http
        this._mountRouter.mount('http://', httpAgent as unknown as Dispatcher)
        this._log.info('Environment HTTP proxy mounted', { url: envProxy.http.sanitizedUrl })
      }
    }

    // Retry configuration
    this._retry = normalizeRetryConfig(opts.retry)
    if (this._retry) {
      this._lastDelay = this._retry.retryDelay
    }

    // Circuit breaker
    this._circuitBreaker = opts.circuitBreaker ? new CircuitBreaker(opts.circuitBreaker) : null

    this._log.info('AsyncClient created', {
      hasBaseUrl: !!this._baseUrl,
      hasAuth: !!this._auth,
      http2: this._http2,
      allowH2: this._allowH2,
      maxResponseSize: this._maxResponseSize,
      pipelining: this._pipelining,
      followRedirects: this._followRedirects,
      retryEnabled: !!this._retry,
      circuitBreakerEnabled: !!this._circuitBreaker
    })
  }

  /**
   * Get circuit breaker instance
   */
  get circuitBreaker(): CircuitBreaker | null {
    return this._circuitBreaker
  }

  // ============================================================================
  // HTTP Methods
  // ============================================================================

  /**
   * Make HTTP request
   */
  async request(method: string, url: string, options?: RequestOptions): Promise<Response> {
    this._ensureNotClosed()

    const httpMethod = normalizeMethod(method)
    const opts = normalizeRequestOptions(options)

    // If no retry config, execute directly
    if (!this._retry) {
      return this._executeRequest(httpMethod, url, opts)
    }

    // Execute with retry logic
    return this._executeWithRetry(httpMethod, url, opts)
  }

  /**
   * Execute request with retry logic
   */
  private async _executeWithRetry(
    method: HttpMethod,
    url: string,
    options: RequestOptions
  ): Promise<Response> {
    const retry = this._retry!

    // Check circuit breaker
    if (this._circuitBreaker && !this._circuitBreaker.allowRequest()) {
      throw new CircuitOpenError(`Circuit breaker is open, request to ${url} blocked`)
    }

    // Check if method is safe to retry
    const canRetry = shouldRetryMethod(method, options.headers as Record<string, string>, retry.retryMethods)

    let lastError: Error | null = null
    this._lastDelay = retry.retryDelay

    for (let attempt = 0; attempt <= retry.maxRetries; attempt++) {
      try {
        const response = await this._executeRequest(method, url, options)

        // Check if we should retry based on status
        const shouldRetryStatus =
          retry.retryOnStatus.includes(response.statusCode) &&
          attempt < retry.maxRetries &&
          canRetry

        if (shouldRetryStatus) {
          let delay = calculateDelay(
            attempt,
            retry.retryDelay,
            retry.retryBackoff,
            retry.maxRetryDelay,
            retry.jitter,
            this._lastDelay
          )

          // Check Retry-After header
          if (retry.respectRetryAfter) {
            const retryAfter = parseRetryAfter(response.headers.get('Retry-After'))
            if (retryAfter !== null) {
              delay = Math.min(retryAfter, retry.maxRetryDelay)
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
        if (this._circuitBreaker && response.ok) {
          this._circuitBreaker.recordSuccess()
        }

        return response
      } catch (err) {
        lastError = err as Error

        // Record failure for circuit breaker
        if (this._circuitBreaker) {
          this._circuitBreaker.recordFailure()
        }

        // Check if error is retryable
        const isRetryable =
          retry.retryOnException && isRetryableError(lastError) && canRetry

        if (!isRetryable) {
          this._log.warn('Not retrying non-retryable error', {
            method,
            error: lastError.message
          })
          throw lastError
        }

        if (attempt < retry.maxRetries) {
          const delay = calculateDelay(
            attempt,
            retry.retryDelay,
            retry.retryBackoff,
            retry.maxRetryDelay,
            retry.jitter,
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
        } else {
          throw lastError
        }
      }
    }

    // Should never reach here
    if (lastError) {
      throw lastError
    }
    throw new Error('Unexpected error in retry loop')
  }

  /**
   * Delay helper
   */
  private _delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * GET request
   */
  async get(url: string, options?: RequestOptions): Promise<Response> {
    return this.request('GET', url, options)
  }

  /**
   * POST request
   */
  async post(url: string, options?: RequestOptions): Promise<Response> {
    return this.request('POST', url, options)
  }

  /**
   * PUT request
   */
  async put(url: string, options?: RequestOptions): Promise<Response> {
    return this.request('PUT', url, options)
  }

  /**
   * PATCH request
   */
  async patch(url: string, options?: RequestOptions): Promise<Response> {
    return this.request('PATCH', url, options)
  }

  /**
   * DELETE request
   */
  async delete(url: string, options?: RequestOptions): Promise<Response> {
    return this.request('DELETE', url, options)
  }

  /**
   * HEAD request
   */
  async head(url: string, options?: RequestOptions): Promise<Response> {
    return this.request('HEAD', url, options)
  }

  /**
   * OPTIONS request
   */
  async options(url: string, options?: RequestOptions): Promise<Response> {
    return this.request('OPTIONS', url, options)
  }

  // ============================================================================
  // Streaming
  // ============================================================================

  /**
   * Stream response body
   */
  async *stream(
    method: string,
    url: string,
    options?: RequestOptions
  ): AsyncGenerator<Buffer> {
    const response = await this.request(method, url, options)

    for await (const chunk of response.aiterBytes()) {
      yield chunk
    }
  }

  // ============================================================================
  // Lifecycle
  // ============================================================================

  /**
   * Close client and release resources
   */
  async close(): Promise<void> {
    if (this._closed) {
      return
    }

    this._log.info('Closing AsyncClient')

    this._closed = true
    await this._dispatcherFactory.closeAll()
    await this._mountRouter.closeAll()

    this._log.debug('AsyncClient closed')
  }

  /**
   * Symbol.asyncDispose for `await using` syntax
   */
  async [Symbol.asyncDispose](): Promise<void> {
    await this.close()
  }

  /**
   * Check if client is closed
   */
  get closed(): boolean {
    return this._closed
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Execute HTTP request
   */
  private async _executeRequest(
    method: HttpMethod,
    url: string,
    options: RequestOptions
  ): Promise<Response> {
    const startTime = Date.now()

    // Build URL
    const fullUrl = this._buildUrl(url, options.params)

    this._log.debug('Request starting', {
      method,
      url: fullUrl.toString()
    })

    // Build headers
    const headers = this._buildHeaders(options.headers)

    // Process body
    let body: string | Buffer | Readable | FormData | null = null
    if (hasBodyOptions(options)) {
      const processed = processBody(options, headers)
      body = processed.body

      // Merge processed headers (Content-Type)
      for (const [name, value] of processed.headers) {
        if (!headers.has(name)) {
          headers.set(name, value)
        }
      }
    }

    // Create request object
    let request = new Request(method, fullUrl, {
      headers,
      body
    })

    // Apply auth
    const auth = options.auth !== undefined ? options.auth : this._auth
    if (auth && options.auth !== null) {
      request = auth.apply(request)
      this._log.trace('Auth applied to request')
    }

    // Call request hooks
    await this._callRequestHooks(request)

    // Get dispatcher
    const dispatcher = this._getDispatcher(fullUrl)

    // Determine timeout
    const timeout = options.timeout !== undefined
      ? createTimeout(options.timeout)
      : this._timeout

    try {
      // Execute request with Undici
      // Redirect handling is configured on the dispatcher via interceptors.redirect()
      const requestOptions: Record<string, unknown> = {
        method: request.method,
        headers: request.headers.toUndiciHeaders(),
        body: request.body as Dispatcher.DispatchOptions['body'],
        dispatcher,
        signal: options.signal,
        headersTimeout: timeout.read ?? undefined,
        bodyTimeout: timeout.read ?? undefined,
      }
      console.log('[fetch-undici] outbound request', JSON.stringify({
        method: request.method,
        url: fullUrl.toString(),
        headers: request.headers.toUndiciHeaders(),
        body: request.body ? String(request.body).slice(0, 500) : null,
        headersTimeout: timeout.read ?? null,
        bodyTimeout: timeout.read ?? null,
        tls: this._tls ? { verify: this._tls.verify, cert: !!this._tls.cert, key: !!this._tls.key, ca: !!this._tls.ca } : null,
        http2: this._http2,
        allowH2: this._allowH2,
        followRedirects: this._followRedirects,
        maxRedirects: this._maxRedirects,
        pipelining: this._pipelining,
      }, null, 2))
      const undiciResponse = await undiciRequest(fullUrl.toString(), requestOptions as Parameters<typeof undiciRequest>[1])

      // Wrap response
      const response = new Response({
        statusCode: undiciResponse.statusCode,
        headers: undiciResponse.headers as Record<string, string | string[]>,
        body: undiciResponse.body as Readable,
        request
      })

      const duration = Date.now() - startTime

      this._log.debug('Request completed', {
        method,
        url: fullUrl.toString(),
        statusCode: response.statusCode,
        duration
      })

      // Call response hooks
      await this._callResponseHooks(response)

      return response
    } catch (err) {
      const duration = Date.now() - startTime

      this._log.error('Request failed', {
        method,
        url: fullUrl.toString(),
        error: (err as Error).message,
        duration
      })

      throw mapUndiciError(err, request)
    }
  }

  /**
   * Build full URL from path and params
   */
  private _buildUrl(url: string, params?: QueryParams): URL {
    // Build base URL
    let fullUrl = buildURL(this._baseUrl, url)

    // Merge default params
    if (this._defaultParams) {
      fullUrl = buildURLWithParams(fullUrl, this._defaultParams)
    }

    // Merge request params
    if (params) {
      fullUrl = buildURLWithParams(fullUrl, params)
    }

    return fullUrl
  }

  /**
   * Build headers (merge default + request headers)
   */
  private _buildHeaders(requestHeaders?: import('../models/headers.js').HeadersInit): Headers {
    const headers = this._defaultHeaders.clone()

    if (requestHeaders) {
      const additional = createHeaders(requestHeaders)
      for (const [name, value] of additional) {
        headers.set(name, value)
      }
    }

    return headers
  }

  /**
   * Get dispatcher for URL
   */
  private _getDispatcher(url: URL): Dispatcher {
    // Check mount router first
    const mounted = this._mountRouter.getDispatcher(url)
    if (mounted) {
      return mounted
    }

    // Use dispatcher factory
    return this._dispatcherFactory.getDispatcher(url)
  }

  /**
   * Call request hooks
   */
  private async _callRequestHooks(request: Request): Promise<void> {
    const hooks = this._eventHooks.request
    if (!hooks || hooks.length === 0) return

    for (const hook of hooks) {
      await hook(request)
    }
  }

  /**
   * Call response hooks
   */
  private async _callResponseHooks(response: Response): Promise<void> {
    const hooks = this._eventHooks.response
    if (!hooks || hooks.length === 0) return

    for (const hook of hooks) {
      await hook(response)
    }
  }

  /**
   * Ensure client is not closed
   */
  private _ensureNotClosed(): void {
    if (this._closed) {
      throw new Error('Client has been closed')
    }
  }
}

/**
 * Alias for AsyncClient (httpx compatibility)
 */
export const Client = AsyncClient
