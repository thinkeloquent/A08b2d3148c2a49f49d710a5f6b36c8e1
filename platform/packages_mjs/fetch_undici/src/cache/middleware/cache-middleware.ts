/**
 * Cache Middleware for Event Hooks
 *
 * Provides cache hooks that can be used with AsyncClient event hooks.
 *
 * Note: Due to the design of event hooks, they cannot short-circuit requests.
 * This middleware caches responses after they are received.
 */

import type { Request } from '../../models/request.js'
import type { Response } from '../../models/response.js'
import { logger } from '../../logger.js'
import { CacheManager } from '../core/cache-manager.js'
import type { CacheConfig } from '../types.js'

const log = logger.create('fetch-undici', import.meta.url)

/**
 * Cache middleware options
 */
export interface CacheMiddlewareOptions extends CacheConfig {}

/**
 * Cache hooks for use with AsyncClient
 */
export interface CacheHooks {
  /** The cache manager instance */
  cacheManager: CacheManager

  /** Request hook - marks requests for potential caching */
  requestHook: (request: Request) => Promise<void>

  /** Response hook - caches successful responses */
  responseHook: (response: Response) => Promise<void>
}

/**
 * Create cache hooks for AsyncClient
 *
 * Note: Event hooks cannot short-circuit requests in fetch-undici.
 * This middleware tracks which requests should be cached and stores
 * successful responses. For full cache-before-fetch functionality,
 * use CachingClient instead.
 *
 * @example
 * ```typescript
 * const { cacheManager, requestHook, responseHook } = createCacheHooks({ ttl: 60000 })
 *
 * const client = new AsyncClient({
 *   baseUrl: 'https://api.example.com',
 *   eventHooks: {
 *     request: [requestHook],
 *     response: [responseHook]
 *   }
 * })
 *
 * // Responses are automatically cached
 * const response = await client.get('/users')
 *
 * // Manual cache operations
 * const cached = await cacheManager.get('GET:https://api.example.com/users')
 * await cacheManager.invalidate('GET:https://api.example.com/users')
 * ```
 */
export function createCacheHooks(options?: CacheMiddlewareOptions): CacheHooks {
  const cacheManager = new CacheManager(options)
  const _log = options?.logger ?? log

  /** Track requests that should be cached */
  const pendingCache = new Map<string, { key: string; method: string }>()

  const requestHook = async (request: Request): Promise<void> => {
    const method = request.method
    const url = request.urlString

    // Check if this method should be cached
    if (!cacheManager.shouldCache(method)) {
      return
    }

    // Generate cache key and mark for caching
    const cacheKey = cacheManager.generateKey(method, url)
    pendingCache.set(url, { key: cacheKey, method })

    _log.trace('Request marked for caching', { key: cacheKey })
  }

  const responseHook = async (response: Response): Promise<void> => {
    const url = response.url
    if (!url) return

    const pending = pendingCache.get(url)
    if (!pending) return

    pendingCache.delete(url)

    // Only cache successful responses
    if (response.ok) {
      await cacheManager.set(pending.key, response)
      _log.debug('Response cached', { key: pending.key })
    } else {
      _log.trace('Response not cached (non-2xx)', {
        key: pending.key,
        statusCode: response.statusCode
      })
    }
  }

  return {
    cacheManager,
    requestHook,
    responseHook
  }
}

/**
 * Create a cache-aware request function
 *
 * This provides a way to check the cache before making a request,
 * which event hooks cannot do.
 *
 * @example
 * ```typescript
 * const { cacheManager, makeRequest } = createCacheAwareClient(client, { ttl: 60000 })
 *
 * // This will check cache first, then fetch if needed
 * const response = await makeRequest('GET', '/users')
 * ```
 */
export function createCacheAwareClient(
  client: { request: (method: string, url: string, options?: unknown) => Promise<Response> },
  options?: CacheMiddlewareOptions
) {
  const cacheManager = new CacheManager(options)
  const _log = options?.logger ?? log

  const makeRequest = async (
    method: string,
    url: string,
    requestOptions?: Record<string, unknown>
  ): Promise<Response> => {
    // Check if caching is applicable
    if (!cacheManager.shouldCache(method)) {
      return client.request(method, url, requestOptions)
    }

    const cacheKey = cacheManager.generateKey(
      method,
      url,
      requestOptions?.headers as Record<string, string>,
      requestOptions?.json ?? requestOptions?.data,
      requestOptions?.params as Record<string, unknown>
    )

    // Check cache first
    const cached = await cacheManager.get(cacheKey)
    if (cached) {
      _log.debug('Cache hit', { key: cacheKey })
      return cacheManager.createResponseFromCache(cached)
    }

    // Fetch from network
    _log.debug('Cache miss', { key: cacheKey })
    const response = await client.request(method, url, requestOptions)

    // Cache successful responses
    if (response.ok) {
      await cacheManager.set(cacheKey, response)
    }

    return response
  }

  return {
    cacheManager,
    makeRequest,

    // Convenience methods
    get: (url: string, options?: Record<string, unknown>) => makeRequest('GET', url, options),
    post: (url: string, options?: Record<string, unknown>) => makeRequest('POST', url, options),
    put: (url: string, options?: Record<string, unknown>) => makeRequest('PUT', url, options),
    patch: (url: string, options?: Record<string, unknown>) => makeRequest('PATCH', url, options),
    delete: (url: string, options?: Record<string, unknown>) => makeRequest('DELETE', url, options)
  }
}
