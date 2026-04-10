/**
 * SDK module for server-provider-cache.
 *
 * Provides convenience functions for standalone usage without framework dependencies.
 * Use this module for CLI tools, LLM agents, and development utilities.
 *
 * Usage:
 *     import { createCacheFactory, createCache, CacheNames } from 'server-provider-cache';
 *
 *     // Multi-instance usage
 *     const factory = createCacheFactory();
 *     factory.create(CacheNames.PROVIDERS, { defaultTtl: 600 });
 *     const providers = factory.get(CacheNames.PROVIDERS);
 *
 *     // Single cache convenience
 *     const cache = createCache('my-cache', { defaultTtl: 300 });
 */

import { CacheFactory, createCacheFactory } from "./factory.mjs";
import { CacheService, createCacheService } from "./service.mjs";
import { CacheNames, DefaultTTLs, DEFAULT_TTL, DEFAULT_BACKEND } from "./constants.mjs";

/**
 * Create a single cache instance for simple use cases.
 *
 * This is a convenience function that creates a factory with a single cache.
 * For multi-cache scenarios, use createCacheFactory() directly.
 *
 * @param {string} name - Cache name
 * @param {object} [options] - Cache options
 * @param {number} [options.defaultTtl] - Default TTL in seconds
 * @param {string} [options.backend] - Backend type ('memory' | 'redis')
 * @param {string} [options.namespace] - Key namespace prefix
 * @returns {CacheService} The cache instance
 *
 * @example
 * const cache = createCache('api-cache', { defaultTtl: 600 });
 * await cache.set('user:123', userData);
 * const user = await cache.getOrSet('user:456', fetchUser, 300);
 */
export function createCache(name, options = {}) {
    return createCacheService({
        name,
        defaultTtl: options.defaultTtl ?? DEFAULT_TTL,
        backend: options.backend ?? DEFAULT_BACKEND,
        namespace: options.namespace ?? "",
    });
}

// Re-export everything for SDK consumers
export {
    // Factory
    CacheFactory,
    createCacheFactory,

    // Service
    CacheService,
    createCacheService,

    // Constants
    CacheNames,
    DefaultTTLs,
    DEFAULT_TTL,
    DEFAULT_BACKEND,
};
