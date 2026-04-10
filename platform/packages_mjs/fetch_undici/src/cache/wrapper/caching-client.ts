/**
 * Caching Client
 *
 * Wrapper class that adds caching to AsyncClient.
 */

import { AsyncClient } from '../../client/client.js'
import type { AsyncClientOptions, RequestOptions } from '../../client/options.js'
import type { Response } from '../../models/response.js'
import { logger, type Logger } from '../../logger.js'
import { CacheManager } from '../core/cache-manager.js'
import type { CacheConfig, RequestCacheOptions } from '../types.js'

const log = logger.create('fetch-undici', import.meta.url)

/**
 * Caching client options
 */
export interface CachingClientOptions extends AsyncClientOptions {
  /** Cache configuration */
  cache?: CacheConfig
}

/**
 * Request options with cache support
 */
export interface CachingRequestOptions extends RequestOptions {
  /** Per-request cache options */
  cache?: RequestCacheOptions
}

/**
 * CachingClient - HTTP client with built-in response caching
 *
 * Wraps AsyncClient and adds transparent caching support.
 *
 * @example
 * ```typescript
 * const client = new CachingClient({
 *   baseUrl: 'https://api.example.com',
 *   cache: { ttl: 60000 }
 * })
 *
 * // First request - cache miss, fetches from network
 * const response1 = await client.get('/users')
 *
 * // Second request - cache hit, returns cached data
 * const response2 = await client.get('/users')
 *
 * // Skip cache for this request
 * const response3 = await client.get('/users', { cache: { noCache: true } })
 *
 * // Force refresh
 * const response4 = await client.get('/users', { cache: { forceRefresh: true } })
 *
 * // Manual cache operations
 * await client.cache.invalidate('GET:https://api.example.com/users')
 * await client.cache.invalidatePattern('GET:https://api.example.com/users/*')
 * await client.cache.clear()
 *
 * await client.close()
 * ```
 */
export class CachingClient {
  private readonly _client: AsyncClient
  private readonly _cacheManager: CacheManager
  private readonly _baseUrl?: string
  private readonly _log: Logger

  constructor(options?: CachingClientOptions) {
    this._log = options?.logger ?? log
    this._baseUrl = options?.baseUrl
    this._client = new AsyncClient(options)
    this._cacheManager = new CacheManager(options?.cache)

    this._log.info('CachingClient created', {
      hasBaseUrl: !!this._baseUrl,
      cacheEnabled: true,
      ttl: options?.cache?.ttl ?? 60000
    })
  }

  /**
   * Access the cache manager for manual operations
   */
  get cache(): CacheManager {
    return this._cacheManager
  }

  /**
   * Access the underlying AsyncClient
   */
  get client(): AsyncClient {
    return this._client
  }

  /**
   * Make HTTP request with caching
   */
  async request(
    method: string,
    url: string,
    options?: CachingRequestOptions
  ): Promise<Response> {
    const cacheOptions = options?.cache

    // Check if caching is applicable
    if (!this._cacheManager.shouldCache(method, cacheOptions)) {
      return this._client.request(method, url, options)
    }

    // Resolve full URL
    const fullUrl = this._resolveUrl(url)

    // Generate cache key
    const cacheKey =
      cacheOptions?.cacheKey ??
      this._cacheManager.generateKey(
        method,
        fullUrl,
        options?.headers as Record<string, string>,
        options?.json ?? options?.data,
        options?.params as Record<string, unknown>
      )

    // Check cache (unless force refresh)
    if (!cacheOptions?.forceRefresh) {
      const cached = await this._cacheManager.get(cacheKey)
      if (cached) {
        this._log.debug('Cache hit', { key: cacheKey, method, url })
        return this._cacheManager.createResponseFromCache(cached)
      }
    }

    // Cache miss - fetch from network
    this._log.debug('Cache miss', { key: cacheKey, method, url })
    const response = await this._client.request(method, url, options)

    // Store in cache if successful
    if (response.ok) {
      await this._cacheManager.set(cacheKey, response, cacheOptions?.ttl)
    }

    return response
  }

  /**
   * GET request
   */
  async get(url: string, options?: CachingRequestOptions): Promise<Response> {
    return this.request('GET', url, options)
  }

  /**
   * POST request
   */
  async post(url: string, options?: CachingRequestOptions): Promise<Response> {
    return this.request('POST', url, options)
  }

  /**
   * PUT request
   */
  async put(url: string, options?: CachingRequestOptions): Promise<Response> {
    return this.request('PUT', url, options)
  }

  /**
   * PATCH request
   */
  async patch(url: string, options?: CachingRequestOptions): Promise<Response> {
    return this.request('PATCH', url, options)
  }

  /**
   * DELETE request
   */
  async delete(url: string, options?: CachingRequestOptions): Promise<Response> {
    return this.request('DELETE', url, options)
  }

  /**
   * HEAD request
   */
  async head(url: string, options?: CachingRequestOptions): Promise<Response> {
    return this.request('HEAD', url, options)
  }

  /**
   * OPTIONS request
   */
  async options(url: string, options?: CachingRequestOptions): Promise<Response> {
    return this.request('OPTIONS', url, options)
  }

  /**
   * Close client and cache
   */
  async close(): Promise<void> {
    await this._cacheManager.close()
    await this._client.close()
    this._log.info('CachingClient closed')
  }

  /**
   * Symbol.asyncDispose for `await using` syntax
   */
  async [Symbol.asyncDispose](): Promise<void> {
    await this.close()
  }

  /**
   * Resolve URL against base URL
   */
  private _resolveUrl(url: string): string {
    if (!this._baseUrl) {
      return url
    }

    // If URL is absolute, return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }

    // Join with base URL
    const base = this._baseUrl.endsWith('/') ? this._baseUrl.slice(0, -1) : this._baseUrl
    const path = url.startsWith('/') ? url : `/${url}`
    return `${base}${path}`
  }
}
