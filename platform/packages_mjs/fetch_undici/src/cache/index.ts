/**
 * Cache Module for fetch-undici
 *
 * Provides response caching with multiple API patterns:
 * - CachingClient: Wrapper class with built-in caching
 * - withCache/cached: HOF and decorator patterns
 * - createCacheHooks: Event hooks middleware
 */

// Types
export type {
  CacheConfig,
  CacheStorage,
  CacheEntry,
  CacheEntryMetadata,
  CacheStats,
  CacheKeyStrategy,
  RequestCacheOptions,
  RequestContext
} from './types.js'

// Storage
export { MemoryStorage } from './storage/index.js'
export type { MemoryStorageOptions } from './storage/index.js'

// Core
export { CacheManager } from './core/index.js'
export {
  defaultKeyStrategy,
  createDotNotationKeyStrategy,
  createHashedKeyStrategy,
  combineKeyStrategies
} from './core/index.js'

// Wrapper
export { CachingClient } from './wrapper/index.js'
export type { CachingClientOptions, CachingRequestOptions } from './wrapper/index.js'

// Decorators
export { withCache, withCacheSimple, cached, createCachedFunction } from './decorators/index.js'
export type { FetchFunction, SimpleFetchFunction, WithCacheOptions } from './decorators/index.js'

// Middleware
export { createCacheHooks, createCacheAwareClient } from './middleware/index.js'
export type { CacheMiddlewareOptions, CacheHooks } from './middleware/index.js'
