/**
 * Proxy configuration for fetch-undici
 *
 * Provides httpx-compatible proxy configuration with Undici mapping.
 */

import { logger } from '../logger.js'

const log = logger.create('fetch-undici', import.meta.url)

/** Proxy authentication credentials */
export interface ProxyAuth {
  username: string
  password: string
}

/** Proxy configuration options */
export interface ProxyOptions {
  /** Proxy URL (e.g., http://proxy:8080) */
  url: string
  /** Proxy authentication */
  auth?: ProxyAuth | null
  /** Additional headers to send to proxy */
  headers?: Record<string, string> | null
  /** Patterns to bypass proxy (no_proxy) */
  noProxy?: string[]
}

/** Undici ProxyAgent options */
export interface UndiciProxyOptions {
  uri: string
  token?: string
  proxyTls?: Record<string, unknown>
  requestTls?: Record<string, unknown>
}

/**
 * Proxy configuration class
 *
 * Provides httpx-compatible proxy configuration.
 *
 * @example
 * ```typescript
 * // Simple proxy
 * const proxy1 = new Proxy({ url: 'http://proxy:8080' })
 *
 * // Proxy with authentication
 * const proxy2 = new Proxy({
 *   url: 'http://proxy:8080',
 *   auth: { username: 'user', password: 'pass' }
 * })
 * ```
 */
export class Proxy {
  /** Proxy URL */
  readonly url: string

  /** Proxy authentication */
  readonly auth: ProxyAuth | null

  /** Additional headers */
  readonly headers: Record<string, string> | null

  /** No-proxy patterns */
  readonly noProxy: string[]

  constructor(options: ProxyOptions | string) {
    if (typeof options === 'string') {
      this.url = options
      this.auth = null
      this.headers = null
      this.noProxy = []
    } else {
      this.url = options.url
      this.auth = options.auth ?? null
      this.headers = options.headers ?? null
      this.noProxy = options.noProxy ?? []
    }

    // Extract auth from URL if present
    if (!this.auth) {
      const parsedAuth = this.extractAuthFromUrl()
      if (parsedAuth) {
        // Create new instance with extracted auth (immutability)
        Object.defineProperty(this, 'auth', { value: parsedAuth })
      }
    }

    log.debug('Proxy created', {
      url: this.sanitizedUrl,
      hasAuth: !!this.auth,
      noProxyPatterns: this.noProxy.length
    })
  }

  /**
   * Get URL without credentials for logging
   */
  get sanitizedUrl(): string {
    try {
      const parsed = new URL(this.url)
      parsed.username = ''
      parsed.password = ''
      return parsed.toString()
    } catch {
      return this.url
    }
  }

  /**
   * Extract auth from URL if present
   */
  private extractAuthFromUrl(): ProxyAuth | null {
    try {
      const parsed = new URL(this.url)
      if (parsed.username || parsed.password) {
        return {
          username: decodeURIComponent(parsed.username),
          password: decodeURIComponent(parsed.password)
        }
      }
    } catch {
      // Invalid URL, ignore
    }
    return null
  }

  /**
   * Convert to Undici ProxyAgent options
   */
  toUndiciOptions(tlsOptions?: Record<string, unknown>): UndiciProxyOptions {
    const result: UndiciProxyOptions = {
      uri: this.url
    }

    // Add Basic auth token if credentials present
    if (this.auth) {
      const credentials = Buffer.from(`${this.auth.username}:${this.auth.password}`).toString(
        'base64'
      )
      result.token = `Basic ${credentials}`
    }

    // Propagate TLS settings to both proxy and request connections
    if (tlsOptions) {
      result.proxyTls = tlsOptions
      result.requestTls = tlsOptions
    }

    log.trace('Converted to Undici options', {
      uri: this.sanitizedUrl,
      hasToken: !!result.token,
      hasTls: !!tlsOptions
    })

    return result
  }

  /**
   * Check if URL should bypass proxy
   */
  shouldBypass(url: string): boolean {
    if (this.noProxy.length === 0) {
      return false
    }

    try {
      const parsed = new URL(url)
      const hostname = parsed.hostname.toLowerCase()

      for (const pattern of this.noProxy) {
        const normalizedPattern = pattern.toLowerCase().trim()

        // Exact match
        if (hostname === normalizedPattern) {
          return true
        }

        // Wildcard match (e.g., *.example.com)
        if (normalizedPattern.startsWith('*.')) {
          const suffix = normalizedPattern.slice(1) // .example.com
          if (hostname.endsWith(suffix) || hostname === normalizedPattern.slice(2)) {
            return true
          }
        }

        // Suffix match (e.g., .example.com)
        if (normalizedPattern.startsWith('.')) {
          if (hostname.endsWith(normalizedPattern) || hostname === normalizedPattern.slice(1)) {
            return true
          }
        }
      }
    } catch {
      // Invalid URL
    }

    return false
  }
}

/**
 * Create a Proxy instance from various input types
 */
export function createProxy(input?: ProxyOptions | Proxy | string | null): Proxy | null {
  if (!input) {
    return null
  }
  if (input instanceof Proxy) {
    return input
  }
  return new Proxy(input)
}

/**
 * Get proxy configuration from environment variables
 */
export function getEnvProxy(): {
  http?: Proxy
  https?: Proxy
  noProxy: string[]
} {
  const httpProxy = process.env['HTTP_PROXY'] || process.env['http_proxy']
  const httpsProxy =
    process.env['HTTPS_PROXY'] || process.env['https_proxy'] || process.env['HTTP_PROXY']
  const noProxy = (process.env['NO_PROXY'] || process.env['no_proxy'] || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  return {
    http: httpProxy ? new Proxy({ url: httpProxy, noProxy }) : undefined,
    https: httpsProxy ? new Proxy({ url: httpsProxy, noProxy }) : undefined,
    noProxy
  }
}
