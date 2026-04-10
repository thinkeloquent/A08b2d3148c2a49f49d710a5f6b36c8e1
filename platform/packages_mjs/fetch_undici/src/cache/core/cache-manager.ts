/**
 * Cache Manager
 *
 * Core cache logic for managing cached responses.
 */

import { Response, type ResponseInit } from '../../models/response.js'
import type { Headers } from '../../models/headers.js'
import { logger, type Logger } from '../../logger.js'
import { MemoryStorage } from '../storage/memory.js'
import type {
  CacheConfig,
  CacheStorage,
  CacheEntry,
  CacheKeyStrategy,
  RequestCacheOptions
} from '../types.js'
import { defaultKeyStrategy } from './key-strategy.js'

const log = logger.create('fetch-undici', import.meta.url)

/**
 * Cache Manager - Core caching logic
 *
 * Handles cache key generation, storage operations, and response serialization.
 *
 * @example
 * ```typescript
 * const manager = new CacheManager({ ttl: 60000 })
 *
 * const key = manager.generateKey('GET', 'https://api.example.com/users')
 * await manager.set(key, response)
 *
 * const cached = await manager.get(key)
 * const response = manager.createResponseFromCache(cached)
 * ```
 */
export class CacheManager {
  private readonly _storage: CacheStorage
  private readonly _ttl: number
  private readonly _methods: string[]
  private readonly _keyStrategy: CacheKeyStrategy
  private readonly _staleWhileRevalidate: boolean
  private readonly _staleGracePeriod: number
  private readonly _log: Logger

  /** Track in-flight requests for deduplication */
  private readonly _pending = new Map<string, Promise<Response>>()

  constructor(config?: CacheConfig) {
    this._storage =
      config?.storage ??
      new MemoryStorage({
        maxEntries: config?.maxEntries ?? 1000
      })

    this._ttl = config?.ttl ?? 60000
    this._methods = (config?.methods ?? ['GET', 'HEAD']).map((m) => m.toUpperCase())
    this._keyStrategy = config?.keyStrategy ?? defaultKeyStrategy
    this._staleWhileRevalidate = config?.staleWhileRevalidate ?? false
    this._staleGracePeriod = config?.staleGracePeriod ?? 30000
    this._log = config?.logger ?? log

    this._log.debug('CacheManager created', {
      ttl: this._ttl,
      methods: this._methods
    })
  }

  /**
   * Generate a cache key for a request
   */
  generateKey(
    method: string,
    url: string,
    headers?: Record<string, string> | Headers,
    body?: unknown,
    params?: Record<string, unknown>
  ): string {
    const headersObj =
      headers instanceof Map
        ? Object.fromEntries(headers)
        : (headers as Record<string, string> | undefined)

    return this._keyStrategy(method, url, headersObj, body, params)
  }

  /**
   * Check if a request should be cached
   */
  shouldCache(method: string, options?: RequestCacheOptions): boolean {
    if (options?.noCache) return false
    return this._methods.includes(method.toUpperCase())
  }

  /**
   * Get an entry from cache
   */
  async get(key: string): Promise<CacheEntry | undefined> {
    const entry = await this._storage.get(key)

    if (entry) {
      this._log.trace('Cache hit', { key })
    } else {
      this._log.trace('Cache miss', { key })
    }

    return entry
  }

  /**
   * Get with stale-while-revalidate support
   */
  async getStale(key: string): Promise<{
    entry: CacheEntry | undefined
    isStale: boolean
  }> {
    const entry = await this._storage.get(key)

    if (!entry) {
      return { entry: undefined, isStale: false }
    }

    const now = Date.now()
    const isStale = now > entry.expiresAt
    const withinGrace = now < entry.expiresAt + this._staleGracePeriod

    if (isStale && !withinGrace) {
      return { entry: undefined, isStale: true }
    }

    return { entry, isStale }
  }

  /**
   * Store a response in cache
   */
  async set(key: string, response: Response, ttl?: number): Promise<void> {
    const effectiveTtl = ttl ?? this._ttl
    const now = Date.now()

    // Read response body (must be done before caching)
    let data: unknown
    const contentType = response.headers.get('content-type') ?? ''

    try {
      if (contentType.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }
    } catch {
      // If body reading fails, store empty
      data = null
    }

    const entry: CacheEntry = {
      key,
      data,
      createdAt: now,
      expiresAt: now + effectiveTtl,
      metadata: {
        statusCode: response.statusCode,
        headers: this._headersToObject(response.headers),
        url: response.url ?? '',
        method: response.request?.method ?? 'GET',
        contentType: contentType || undefined,
        size: typeof data === 'string' ? data.length : undefined
      }
    }

    await this._storage.set(key, entry)
    this._log.debug('Cached response', { key, ttl: effectiveTtl })
  }

  /**
   * Create a Response from a cached entry
   */
  createResponseFromCache(entry: CacheEntry): Response {
    let body: string

    if (typeof entry.data === 'string') {
      body = entry.data
    } else if (entry.data === null || entry.data === undefined) {
      body = ''
    } else {
      body = JSON.stringify(entry.data)
    }

    const init: ResponseInit = {
      statusCode: entry.metadata.statusCode,
      headers: entry.metadata.headers,
      body
    }

    return new Response(init)
  }

  /**
   * Get or fetch with deduplication
   *
   * Prevents multiple identical requests from hitting the origin.
   */
  async getOrFetch(
    key: string,
    fetchFn: () => Promise<Response>,
    options?: { ttl?: number }
  ): Promise<Response> {
    // Check cache first
    const cached = await this.get(key)
    if (cached) {
      return this.createResponseFromCache(cached)
    }

    // Check if request is already in flight
    const pending = this._pending.get(key)
    if (pending) {
      this._log.trace('Deduplicating request', { key })
      return pending
    }

    // Create new request
    const promise = fetchFn()
    this._pending.set(key, promise)

    try {
      const response = await promise

      // Cache successful responses
      if (response.ok) {
        await this.set(key, response, options?.ttl)
      }

      return response
    } finally {
      this._pending.delete(key)
    }
  }

  /**
   * Invalidate a single cache key
   */
  async invalidate(key: string): Promise<boolean> {
    const deleted = await this._storage.delete(key)
    this._log.debug('Cache invalidated', { key, deleted })
    return deleted
  }

  /**
   * Invalidate keys matching a pattern
   */
  async invalidatePattern(pattern: string | RegExp): Promise<number> {
    const count = await this._storage.deletePattern(pattern)
    this._log.debug('Cache pattern invalidated', { pattern: String(pattern), count })
    return count
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    await this._storage.clear()
    this._log.info('Cache cleared')
  }

  /**
   * Get all cache keys
   */
  async keys(pattern?: string | RegExp): Promise<string[]> {
    return this._storage.keys(pattern)
  }

  /**
   * Get cache statistics
   */
  async stats() {
    return this._storage.stats()
  }

  /**
   * Check if stale-while-revalidate is enabled
   */
  get staleWhileRevalidateEnabled(): boolean {
    return this._staleWhileRevalidate
  }

  /**
   * Close the cache manager
   */
  async close(): Promise<void> {
    await this._storage.close()
    this._log.debug('CacheManager closed')
  }

  /**
   * Convert Headers to plain object
   */
  private _headersToObject(headers: Headers): Record<string, string> {
    const obj: Record<string, string> = {}
    for (const [key, value] of headers) {
      obj[key] = value
    }
    return obj
  }
}
