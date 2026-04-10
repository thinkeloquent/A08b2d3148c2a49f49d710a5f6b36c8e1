/**
 * In-Memory Cache Storage
 *
 * Default storage backend using Map with TTL support and automatic cleanup.
 */

import { logger, type Logger } from '../../logger.js'
import type { CacheStorage, CacheEntry, CacheStats } from '../types.js'

const log = logger.create('fetch-undici', import.meta.url)

/**
 * Memory storage options
 */
export interface MemoryStorageOptions {
  /** Maximum number of entries (default: 1000) */
  maxEntries?: number
  /** Cleanup interval in ms (default: 60000) */
  cleanupInterval?: number
  /** Custom logger */
  logger?: Logger
}

/**
 * In-memory cache storage with TTL support
 *
 * Features:
 * - Automatic expired entry cleanup
 * - LRU-style eviction when at capacity
 * - Pattern matching for bulk deletion
 *
 * @example
 * ```typescript
 * const storage = new MemoryStorage({ maxEntries: 500 })
 *
 * await storage.set('key', { data: 'value', ... })
 * const entry = await storage.get('key')
 *
 * await storage.deletePattern('user:*')
 * await storage.close()
 * ```
 */
export class MemoryStorage<T = unknown> implements CacheStorage<T> {
  private readonly _cache = new Map<string, CacheEntry<T>>()
  private readonly _maxEntries: number
  private readonly _log: Logger
  private _cleanupTimer: ReturnType<typeof setInterval> | null = null
  private _stats: CacheStats = { size: 0, hits: 0, misses: 0, evictions: 0 }

  constructor(options?: MemoryStorageOptions) {
    this._maxEntries = options?.maxEntries ?? 1000
    this._log = options?.logger ?? log

    // Start cleanup timer
    const interval = options?.cleanupInterval ?? 60000
    this._cleanupTimer = setInterval(() => this._cleanup(), interval)
    this._cleanupTimer.unref() // Don't keep process alive

    this._log.debug('MemoryStorage created', { maxEntries: this._maxEntries })
  }

  async get(key: string): Promise<CacheEntry<T> | undefined> {
    const entry = this._cache.get(key)

    if (!entry) {
      this._stats.misses++
      return undefined
    }

    if (Date.now() > entry.expiresAt) {
      this._cache.delete(key)
      this._stats.misses++
      this._stats.evictions++
      this._stats.size = this._cache.size
      return undefined
    }

    this._stats.hits++
    return entry
  }

  async set(key: string, entry: CacheEntry<T>): Promise<void> {
    // Evict if at capacity
    if (this._cache.size >= this._maxEntries && !this._cache.has(key)) {
      this._evictOldest()
    }

    this._cache.set(key, entry)
    this._stats.size = this._cache.size
    this._log.trace('Cache set', { key, expiresAt: entry.expiresAt })
  }

  async has(key: string): Promise<boolean> {
    const entry = await this.get(key)
    return entry !== undefined
  }

  async delete(key: string): Promise<boolean> {
    const deleted = this._cache.delete(key)
    this._stats.size = this._cache.size
    return deleted
  }

  async deletePattern(pattern: string | RegExp): Promise<number> {
    const regex =
      typeof pattern === 'string'
        ? this._globToRegex(pattern)
        : pattern

    let count = 0
    for (const key of this._cache.keys()) {
      if (regex.test(key)) {
        this._cache.delete(key)
        count++
      }
    }
    this._stats.size = this._cache.size
    this._log.debug('Deleted by pattern', { pattern: String(pattern), count })
    return count
  }

  async clear(): Promise<void> {
    this._cache.clear()
    this._stats.size = 0
    this._log.debug('Cache cleared')
  }

  async keys(pattern?: string | RegExp): Promise<string[]> {
    const allKeys = Array.from(this._cache.keys())
    if (!pattern) return allKeys

    const regex =
      typeof pattern === 'string'
        ? this._globToRegex(pattern)
        : pattern

    return allKeys.filter((key) => regex.test(key))
  }

  async stats(): Promise<CacheStats> {
    return { ...this._stats }
  }

  async close(): Promise<void> {
    if (this._cleanupTimer) {
      clearInterval(this._cleanupTimer)
      this._cleanupTimer = null
    }
    this._cache.clear()
    this._log.debug('MemoryStorage closed')
  }

  /**
   * Clean up expired entries
   */
  private _cleanup(): void {
    const now = Date.now()
    let evicted = 0

    for (const [key, entry] of this._cache.entries()) {
      if (now > entry.expiresAt) {
        this._cache.delete(key)
        evicted++
      }
    }

    if (evicted > 0) {
      this._stats.evictions += evicted
      this._stats.size = this._cache.size
      this._log.trace('Cleanup evicted expired entries', { count: evicted })
    }
  }

  /**
   * Evict the oldest entry (LRU-style)
   */
  private _evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Infinity

    for (const [key, entry] of this._cache.entries()) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt
        oldestKey = key
      }
    }

    if (oldestKey) {
      this._cache.delete(oldestKey)
      this._stats.evictions++
      this._log.trace('Evicted oldest entry', { key: oldestKey })
    }
  }

  /**
   * Convert glob pattern to regex
   *
   * Supports:
   * - `*` matches any characters except `:` (for key segments)
   * - `**` matches any characters including `:`
   */
  private _globToRegex(pattern: string): RegExp {
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
      .replace(/\*\*/g, '.*') // ** matches anything
      .replace(/\*/g, '[^:]*') // * matches segment

    return new RegExp(`^${escaped}$`)
  }
}
