/**
 * Cache Types for fetch-undici
 *
 * Core interfaces for the caching middleware.
 */

import type { Logger } from '../logger.js'

/**
 * Request context for cache key generation
 */
export interface RequestContext {
  method: string
  url: string
  headers?: Record<string, string>
  body?: unknown
  params?: Record<string, unknown>
}

/**
 * Cache key generation strategy
 *
 * @example
 * ```typescript
 * // Default strategy: METHOD:URL
 * const defaultStrategy: CacheKeyStrategy = (method, url) => `${method}:${url}`
 *
 * // Custom strategy with dot notation
 * const customStrategy = createDotNotationKeyStrategy(['headers.Authorization'])
 * ```
 */
export type CacheKeyStrategy = (
  method: string,
  url: string,
  headers?: Record<string, string>,
  body?: unknown,
  params?: Record<string, unknown>
) => string

/**
 * Metadata stored with each cache entry
 */
export interface CacheEntryMetadata {
  statusCode: number
  headers: Record<string, string>
  url: string
  method: string
  contentType?: string
  size?: number
}

/**
 * Cache entry structure
 */
export interface CacheEntry<T = unknown> {
  key: string
  data: T
  createdAt: number
  expiresAt: number
  metadata: CacheEntryMetadata
}

/**
 * Cache statistics
 */
export interface CacheStats {
  size: number
  hits: number
  misses: number
  evictions: number
}

/**
 * Cache storage interface
 *
 * Implement this for custom backends (Redis, file, etc.)
 *
 * @example
 * ```typescript
 * class RedisStorage implements CacheStorage {
 *   async get(key: string) { ... }
 *   async set(key: string, entry: CacheEntry) { ... }
 *   // ... other methods
 * }
 * ```
 */
export interface CacheStorage<T = unknown> {
  /** Get an entry by key */
  get(key: string): Promise<CacheEntry<T> | undefined>

  /** Set an entry */
  set(key: string, entry: CacheEntry<T>): Promise<void>

  /** Check if key exists and is not expired */
  has(key: string): Promise<boolean>

  /** Delete a single key */
  delete(key: string): Promise<boolean>

  /** Delete keys matching a pattern (regex or glob) */
  deletePattern(pattern: string | RegExp): Promise<number>

  /** Clear all entries */
  clear(): Promise<void>

  /** Get all keys (optionally matching pattern) */
  keys(pattern?: string | RegExp): Promise<string[]>

  /** Get storage statistics */
  stats(): Promise<CacheStats>

  /** Close/cleanup storage */
  close(): Promise<void>
}

/**
 * Cache configuration options
 */
export interface CacheConfig {
  /** Default TTL in milliseconds (default: 60000 = 1 minute) */
  ttl?: number

  /** Cache storage backend (default: in-memory) */
  storage?: CacheStorage

  /** Cache key generation strategy */
  keyStrategy?: CacheKeyStrategy

  /** HTTP methods to cache (default: ['GET', 'HEAD']) */
  methods?: string[]

  /** Maximum entries in cache (default: 1000, in-memory only) */
  maxEntries?: number

  /** Enable stale-while-revalidate (default: false) */
  staleWhileRevalidate?: boolean

  /** Grace period for stale-while-revalidate in ms */
  staleGracePeriod?: number

  /** Custom logger */
  logger?: Logger
}

/**
 * Per-request cache options
 */
export interface RequestCacheOptions {
  /** Override TTL for this request */
  ttl?: number

  /** Skip cache for this request */
  noCache?: boolean

  /** Force refresh (bypass read, still write) */
  forceRefresh?: boolean

  /** Custom cache key for this request */
  cacheKey?: string
}
