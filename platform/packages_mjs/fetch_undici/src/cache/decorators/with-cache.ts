/**
 * Cache Decorators and Higher-Order Functions
 *
 * Provides withCache HOF and @cached decorator for adding caching to functions.
 */

import type { Response } from '../../models/response.js'
import { logger } from '../../logger.js'
import { CacheManager } from '../core/cache-manager.js'
import type { CacheConfig, RequestCacheOptions } from '../types.js'

const log = logger.create('fetch-undici', import.meta.url)

/**
 * Function signature for fetch-like functions
 */
export type FetchFunction = (
  method: string,
  url: string,
  options?: Record<string, unknown>
) => Promise<Response>

/**
 * Function signature for simplified fetch (GET-only)
 */
export type SimpleFetchFunction = (
  url: string,
  options?: Record<string, unknown>
) => Promise<Response>

/**
 * Options for the withCache HOF
 */
export interface WithCacheOptions extends CacheConfig {
  /** Extract cache options from request options */
  getCacheOptions?: (options?: Record<string, unknown>) => RequestCacheOptions | undefined
}

/**
 * Higher-order function that adds caching to any fetch-like function
 *
 * @example
 * ```typescript
 * import { request } from 'fetch-undici'
 *
 * const cachedRequest = withCache(request, { ttl: 60000 })
 *
 * // First call - cache miss, fetches from network
 * const response1 = await cachedRequest('GET', 'https://api.example.com/users')
 *
 * // Second call - cache hit
 * const response2 = await cachedRequest('GET', 'https://api.example.com/users')
 * ```
 */
export function withCache(
  fetchFn: FetchFunction,
  config?: WithCacheOptions
): FetchFunction & { cache: CacheManager } {
  const cacheManager = new CacheManager(config)
  const _log = config?.logger ?? log

  const getCacheOpts =
    config?.getCacheOptions ?? ((opts) => opts?.cache as RequestCacheOptions | undefined)

  const cachedFetch: FetchFunction = async (
    method: string,
    url: string,
    options?: Record<string, unknown>
  ) => {
    const cacheOptions = getCacheOpts(options)

    // Check if caching is applicable
    if (!cacheManager.shouldCache(method, cacheOptions)) {
      return fetchFn(method, url, options)
    }

    const cacheKey =
      cacheOptions?.cacheKey ??
      cacheManager.generateKey(
        method,
        url,
        options?.headers as Record<string, string>,
        options?.json ?? options?.data,
        options?.params as Record<string, unknown>
      )

    // Check cache (unless force refresh)
    if (!cacheOptions?.forceRefresh) {
      const cached = await cacheManager.get(cacheKey)
      if (cached) {
        _log.debug('Cache hit (withCache)', { key: cacheKey })
        return cacheManager.createResponseFromCache(cached)
      }
    }

    // Fetch and cache
    _log.debug('Cache miss (withCache)', { key: cacheKey })
    const response = await fetchFn(method, url, options)

    if (response.ok) {
      await cacheManager.set(cacheKey, response, cacheOptions?.ttl)
    }

    return response
  }

  // Attach cache manager for manual operations
  ;(cachedFetch as FetchFunction & { cache: CacheManager }).cache = cacheManager

  return cachedFetch as FetchFunction & { cache: CacheManager }
}

/**
 * Higher-order function for simple GET functions
 *
 * @example
 * ```typescript
 * import { get } from 'fetch-undici'
 *
 * const cachedGet = withCacheSimple(get, { ttl: 60000 })
 * const response = await cachedGet('https://api.example.com/users')
 * ```
 */
export function withCacheSimple(
  fetchFn: SimpleFetchFunction,
  config?: WithCacheOptions
): SimpleFetchFunction & { cache: CacheManager } {
  const wrapped = withCache(
    (_method, url, options) => fetchFn(url, options),
    config
  )

  const simpleCachedFetch: SimpleFetchFunction = (url, options) => {
    return wrapped('GET', url, options)
  }

  ;(simpleCachedFetch as SimpleFetchFunction & { cache: CacheManager }).cache = wrapped.cache

  return simpleCachedFetch as SimpleFetchFunction & { cache: CacheManager }
}

/**
 * Decorator factory for caching method results
 *
 * @example
 * ```typescript
 * class UserService {
 *   private client = new AsyncClient({ baseUrl: 'https://api.example.com' })
 *
 *   @cached({ ttl: 60000 })
 *   async getUsers(): Promise<Response> {
 *     return this.client.get('/users')
 *   }
 *
 *   @cached({ ttl: 30000 })
 *   async getUser(id: number): Promise<Response> {
 *     return this.client.get(`/users/${id}`)
 *   }
 * }
 * ```
 */
export function cached(config?: CacheConfig) {
  const cacheManager = new CacheManager(config)
  const _log = config?.logger ?? log

  return function <T extends (...args: unknown[]) => Promise<Response>>(
    _target: object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ): TypedPropertyDescriptor<T> {
    const originalMethod = descriptor.value!

    descriptor.value = async function (this: unknown, ...args: unknown[]): Promise<Response> {
      // Generate cache key from method name and arguments
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`

      // Check cache
      const cachedEntry = await cacheManager.get(cacheKey)
      if (cachedEntry) {
        _log.debug('Cache hit (decorator)', { key: cacheKey })
        return cacheManager.createResponseFromCache(cachedEntry)
      }

      // Execute method
      _log.debug('Cache miss (decorator)', { key: cacheKey })
      const response = await originalMethod.apply(this, args)

      // Cache successful responses
      if (response.ok) {
        await cacheManager.set(cacheKey, response)
      }

      return response
    } as T

    return descriptor
  }
}

/**
 * Create a cached version of any async function
 *
 * @example
 * ```typescript
 * async function fetchUser(id: number): Promise<Response> {
 *   return client.get(`/users/${id}`)
 * }
 *
 * const cachedFetchUser = createCachedFunction(fetchUser, {
 *   ttl: 60000,
 *   keyFn: (id) => `user:${id}`
 * })
 *
 * const response = await cachedFetchUser(123)
 * ```
 */
export function createCachedFunction<TArgs extends unknown[], TResult extends Response>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: CacheConfig & {
    /** Custom key generation function */
    keyFn?: (...args: TArgs) => string
  }
): ((...args: TArgs) => Promise<TResult>) & { cache: CacheManager } {
  const cacheManager = new CacheManager(options)
  const _log = options?.logger ?? log
  const keyFn = options?.keyFn ?? ((...args: TArgs) => JSON.stringify(args))

  const cachedFn = async (...args: TArgs): Promise<TResult> => {
    const cacheKey = keyFn(...args)

    // Check cache
    const cached = await cacheManager.get(cacheKey)
    if (cached) {
      _log.debug('Cache hit (cachedFunction)', { key: cacheKey })
      return cacheManager.createResponseFromCache(cached) as TResult
    }

    // Execute function
    _log.debug('Cache miss (cachedFunction)', { key: cacheKey })
    const result = await fn(...args)

    // Cache successful responses
    if (result.ok) {
      await cacheManager.set(cacheKey, result)
    }

    return result
  }

  ;(cachedFn as ((...args: TArgs) => Promise<TResult>) & { cache: CacheManager }).cache =
    cacheManager

  return cachedFn as ((...args: TArgs) => Promise<TResult>) & { cache: CacheManager }
}
