/**
 * CacheService - Individual cache instance for server-provider-cache.
 *
 * Provides the core cache operations with TTL support, namespace prefixing,
 * and read-through caching via getOrSet.
 *
 * Usage:
 *     const cache = new CacheService({ name: 'providers', defaultTtl: 600 });
 *     await cache.set('oauth:google', tokenData);
 *     const token = await cache.getOrSet('oauth:google', fetchToken, 600);
 */

import { create as createLogger } from "./logger.mjs";
import { MemoryBackend } from "./backends/memory.mjs";
import { DEFAULT_TTL, DEFAULT_BACKEND } from "./constants.mjs";

const PKG = "server-provider-cache";

/**
 * Cache service options.
 * @typedef {Object} CacheOptions
 * @property {string} name - Cache instance name (required)
 * @property {number} [defaultTtl] - Default TTL in seconds
 * @property {string} [backend] - Backend type ('memory' | 'redis')
 * @property {string} [namespace] - Key namespace prefix
 * @property {object} [logger] - Custom logger instance
 */

/**
 * Individual cache instance with CRUD operations and read-through caching.
 */
export class CacheService {
    #name;
    #defaultTtl;
    #backend;
    #backendType;
    #namespace;
    #logger;

    /**
     * Create a new cache service instance.
     * @param {CacheOptions} options - Cache configuration
     */
    constructor(options) {
        const {
            name,
            defaultTtl = DEFAULT_TTL,
            backend = DEFAULT_BACKEND,
            namespace = "",
            logger = null,
        } = options;

        if (!name) {
            throw new Error("CacheService requires a name");
        }

        this.#name = name;
        this.#defaultTtl = defaultTtl;
        this.#backendType = backend;
        this.#namespace = namespace;
        this.#logger = logger || createLogger(PKG, "service.mjs").child(name);

        // Initialize backend
        if (backend === "memory") {
            this.#backend = new MemoryBackend(name);
        } else {
            // For now, fallback to memory
            this.#logger.warn(`Backend '${backend}' not available, using memory`);
            this.#backend = new MemoryBackend(name);
        }

        this.#logger.info(`initialized: backend=${backend}, ttl=${defaultTtl}s`);
    }

    /**
     * Cache instance name.
     * @type {string}
     */
    get name() {
        return this.#name;
    }

    /**
     * Default TTL in seconds.
     * @type {number}
     */
    get defaultTtl() {
        return this.#defaultTtl;
    }

    /**
     * Backend type.
     * @type {string}
     */
    get backend() {
        return this.#backendType;
    }

    /**
     * Apply namespace prefix to a key.
     * @param {string} key - Raw key
     * @returns {string} Namespaced key
     */
    #prefixKey(key) {
        return this.#namespace ? `${this.#namespace}:${key}` : key;
    }

    /**
     * Remove namespace prefix from a key.
     * @param {string} key - Namespaced key
     * @returns {string} Raw key
     */
    #unprefixKey(key) {
        if (this.#namespace && key.startsWith(this.#namespace + ":")) {
            return key.slice(this.#namespace.length + 1);
        }
        return key;
    }

    /**
     * Get a value from the cache.
     * @template T
     * @param {string} key - Cache key
     * @returns {Promise<T|undefined>} Cached value or undefined
     */
    async get(key) {
        const prefixedKey = this.#prefixKey(key);
        const value = await this.#backend.get(prefixedKey);
        return value;
    }

    /**
     * Set a value in the cache.
     * @template T
     * @param {string} key - Cache key
     * @param {T} value - Value to cache
     * @param {number} [ttl] - TTL in seconds (defaults to defaultTtl)
     * @returns {Promise<void>}
     */
    async set(key, value, ttl) {
        const ttlSeconds = ttl ?? this.#defaultTtl;
        const ttlMs = ttlSeconds * 1000;
        const prefixedKey = this.#prefixKey(key);

        await this.#backend.set(prefixedKey, value, ttlMs);
        this.#logger.debug(`set: ${key} (ttl=${ttlSeconds}s)`);
    }

    /**
     * Delete a key from the cache.
     * @param {string} key - Cache key
     * @returns {Promise<void>}
     */
    async del(key) {
        const prefixedKey = this.#prefixKey(key);
        await this.#backend.del(prefixedKey);
        this.#logger.debug(`del: ${key}`);
    }

    /**
     * Clear all entries from this cache instance.
     * @returns {Promise<void>}
     */
    async clear() {
        await this.#backend.clear();
        this.#logger.debug("cleared all keys");
    }

    /**
     * Get all keys in this cache instance.
     * @returns {Promise<string[]>}
     */
    async keys() {
        const allKeys = await this.#backend.keys();
        return allKeys.map((k) => this.#unprefixKey(k));
    }

    /**
     * Get the number of entries in this cache instance.
     * @returns {Promise<number>}
     */
    async size() {
        return await this.#backend.size();
    }

    /**
     * Get a value from cache, or fetch and cache if missing.
     *
     * Read-through caching pattern:
     * - On cache hit: return cached value (fetchFn not called)
     * - On cache miss: call fetchFn, cache result, return value
     * - On fetchFn error: propagate error (value not cached)
     *
     * @template T
     * @param {string} key - Cache key
     * @param {() => Promise<T>} fetchFn - Async function to fetch value on miss
     * @param {number} [ttl] - TTL in seconds (defaults to defaultTtl)
     * @returns {Promise<T>} Cached or freshly fetched value
     */
    async getOrSet(key, fetchFn, ttl) {
        const cached = await this.get(key);

        if (cached !== undefined) {
            this.#logger.debug(`cache hit: ${key}`);
            return cached;
        }

        this.#logger.debug(`cache miss: ${key}, fetching...`);

        try {
            const value = await fetchFn();
            await this.set(key, value, ttl);
            return value;
        } catch (error) {
            this.#logger.error(`fetch failed: ${key} - ${error.message}`);
            throw error;
        }
    }

    /**
     * Cleanup resources (disconnect backend).
     * @returns {Promise<void>}
     */
    async destroy() {
        await this.#backend.disconnect();
        this.#logger.info("destroyed");
    }
}

/**
 * Create a new CacheService instance.
 * @param {CacheOptions} options - Cache configuration
 * @returns {CacheService}
 */
export function createCacheService(options) {
    return new CacheService(options);
}
