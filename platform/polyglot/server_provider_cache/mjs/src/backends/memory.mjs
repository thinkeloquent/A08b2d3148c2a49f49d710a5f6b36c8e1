/**
 * In-memory backend for server-provider-cache.
 *
 * Provides a simple Map-based storage with TTL support via setTimeout.
 * Suitable for single-process applications.
 *
 * Note: Data is NOT shared across worker processes or instances.
 */

import { create as createLogger } from "../logger.mjs";

const logger = createLogger("server-provider-cache", import.meta.url);

/**
 * Cache entry structure with value and expiration timer.
 * @typedef {Object} CacheEntry
 * @property {any} value - The cached value
 * @property {number} expires - Expiration timestamp (ms since epoch)
 * @property {NodeJS.Timeout|null} timerId - Timer reference for cleanup
 */

/**
 * In-memory cache backend using Map with TTL support.
 */
export class MemoryBackend {
    /** @type {Map<string, CacheEntry>} */
    #store;
    #name;

    /**
     * @param {string} name - Backend instance name (for logging)
     */
    constructor(name = "memory") {
        this.#store = new Map();
        this.#name = name;
    }

    /**
     * Get a value from the cache.
     * @param {string} key - Cache key
     * @returns {Promise<any|undefined>} Cached value or undefined if not found/expired
     */
    async get(key) {
        const entry = this.#store.get(key);

        if (!entry) {
            return undefined;
        }

        // Check if expired (lazy expiration)
        if (entry.expires && Date.now() > entry.expires) {
            await this.del(key);
            return undefined;
        }

        return entry.value;
    }

    /**
     * Set a value in the cache with TTL.
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttlMs - Time-to-live in milliseconds
     * @returns {Promise<void>}
     */
    async set(key, value, ttlMs) {
        // Clear existing timer if overwriting
        const existing = this.#store.get(key);
        if (existing?.timerId) {
            clearTimeout(existing.timerId);
        }

        const expires = ttlMs > 0 ? Date.now() + ttlMs : 0;

        // Set up expiration timer
        let timerId = null;
        if (ttlMs > 0) {
            timerId = setTimeout(() => {
                this.#store.delete(key);
                logger.debug(`key expired: ${key}`);
            }, ttlMs);
        }

        this.#store.set(key, { value, expires, timerId });
    }

    /**
     * Delete a key from the cache.
     * @param {string} key - Cache key
     * @returns {Promise<void>}
     */
    async del(key) {
        const entry = this.#store.get(key);
        if (entry?.timerId) {
            clearTimeout(entry.timerId);
        }
        this.#store.delete(key);
    }

    /**
     * Clear all entries from the cache.
     * @returns {Promise<void>}
     */
    async clear() {
        // Clear all timers
        for (const entry of this.#store.values()) {
            if (entry.timerId) {
                clearTimeout(entry.timerId);
            }
        }
        this.#store.clear();
    }

    /**
     * Get all keys in the cache.
     * @returns {Promise<string[]>}
     */
    async keys() {
        return Array.from(this.#store.keys());
    }

    /**
     * Get the number of entries in the cache.
     * @returns {Promise<number>}
     */
    async size() {
        return this.#store.size;
    }

    /**
     * Optional connect method (no-op for memory backend).
     * @returns {Promise<void>}
     */
    async connect() {
        logger.debug("Memory backend ready (no connection needed)");
    }

    /**
     * Optional disconnect method - clears all data.
     * @returns {Promise<void>}
     */
    async disconnect() {
        await this.clear();
        logger.debug("Memory backend disconnected");
    }
}

/**
 * Create a new MemoryBackend instance.
 * @param {string} name - Backend name for logging
 * @returns {MemoryBackend}
 */
export function createMemoryBackend(name = "memory") {
    return new MemoryBackend(name);
}
