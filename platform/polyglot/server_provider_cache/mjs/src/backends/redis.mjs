/**
 * Redis backend stub for server-provider-cache.
 *
 * This is a placeholder for future Redis integration.
 * Currently throws NotImplementedError for all operations.
 *
 * When implemented, this will support:
 * - Connection via REDIS_URL environment variable
 * - Key namespacing for multi-tenant isolation
 * - Native Redis TTL via SETEX/PSETEX
 * - Automatic reconnection
 */

import { create as createLogger } from "../logger.mjs";

const logger = createLogger("server-provider-cache", import.meta.url);

/**
 * Redis backend stub (not yet implemented).
 */
export class RedisBackend {
    #name;
    #connected;

    /**
     * @param {string} name - Backend instance name
     * @param {object} options - Redis connection options
     * @param {string} [options.url] - Redis URL (default: process.env.REDIS_URL)
     * @param {string} [options.namespace] - Key namespace prefix
     */
    constructor(name = "redis", options = {}) {
        this.#name = name;
        this.#connected = false;
        logger.warn("RedisBackend is a stub - Redis support not yet implemented");
    }

    /**
     * Get a value from Redis.
     * @param {string} key - Cache key
     * @returns {Promise<any|undefined>}
     */
    async get(key) {
        throw new Error("RedisBackend.get() not implemented - use MemoryBackend");
    }

    /**
     * Set a value in Redis with TTL.
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttlMs - Time-to-live in milliseconds
     * @returns {Promise<void>}
     */
    async set(key, value, ttlMs) {
        throw new Error("RedisBackend.set() not implemented - use MemoryBackend");
    }

    /**
     * Delete a key from Redis.
     * @param {string} key - Cache key
     * @returns {Promise<void>}
     */
    async del(key) {
        throw new Error("RedisBackend.del() not implemented - use MemoryBackend");
    }

    /**
     * Clear all entries with the configured namespace.
     * @returns {Promise<void>}
     */
    async clear() {
        throw new Error("RedisBackend.clear() not implemented - use MemoryBackend");
    }

    /**
     * Get all keys matching the namespace pattern.
     * @returns {Promise<string[]>}
     */
    async keys() {
        throw new Error("RedisBackend.keys() not implemented - use MemoryBackend");
    }

    /**
     * Get the number of keys in the namespace.
     * @returns {Promise<number>}
     */
    async size() {
        throw new Error("RedisBackend.size() not implemented - use MemoryBackend");
    }

    /**
     * Connect to Redis.
     * @returns {Promise<void>}
     */
    async connect() {
        throw new Error("RedisBackend.connect() not implemented - use MemoryBackend");
    }

    /**
     * Disconnect from Redis.
     * @returns {Promise<void>}
     */
    async disconnect() {
        this.#connected = false;
        logger.debug("Redis backend disconnected (stub)");
    }
}

/**
 * Create a new RedisBackend instance.
 * @param {string} name - Backend name
 * @param {object} options - Redis options
 * @returns {RedisBackend}
 */
export function createRedisBackend(name = "redis", options = {}) {
    return new RedisBackend(name, options);
}
