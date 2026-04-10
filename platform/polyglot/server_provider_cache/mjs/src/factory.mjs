/**
 * CacheFactory - Multi-instance cache factory for server-provider-cache.
 *
 * Creates and manages multiple named cache instances with independent configurations.
 * Each cache instance is isolated with its own TTL, backend, and namespace.
 *
 * Usage:
 *     const factory = createCacheFactory({ defaults: { defaultTtl: 300 } });
 *     factory.create(CacheNames.PROVIDERS, { defaultTtl: 600 });
 *     const providers = factory.get(CacheNames.PROVIDERS);
 *     await providers.set('oauth:google', tokenData);
 */

import { create as createLogger } from "./logger.mjs";
import { CacheService } from "./service.mjs";
import { DEFAULT_TTL, DEFAULT_BACKEND } from "./constants.mjs";

const PKG = "server-provider-cache";

/**
 * Factory options.
 * @typedef {Object} FactoryOptions
 * @property {object} [defaults] - Default options for all cache instances
 * @property {number} [defaults.defaultTtl] - Default TTL in seconds
 * @property {string} [defaults.backend] - Default backend type
 * @property {object} [logger] - Custom logger instance
 */

/**
 * Cache instance creation options.
 * @typedef {Object} CreateOptions
 * @property {number} [defaultTtl] - TTL override for this instance
 * @property {string} [backend] - Backend override for this instance
 * @property {string} [namespace] - Key namespace for this instance
 */

/**
 * Factory for creating and managing multiple named cache instances.
 */
export class CacheFactory {
    /** @type {Map<string, CacheService>} */
    #registry;
    #defaults;
    #logger;

    /**
     * Create a new cache factory.
     * @param {FactoryOptions} options - Factory configuration
     */
    constructor(options = {}) {
        const { defaults = {}, logger = null } = options;

        this.#registry = new Map();
        this.#defaults = {
            defaultTtl: defaults.defaultTtl ?? DEFAULT_TTL,
            backend: defaults.backend ?? DEFAULT_BACKEND,
        };
        this.#logger = logger || createLogger(PKG, "factory.mjs");

        this.#logger.info(
            `initialized: defaultTtl=${this.#defaults.defaultTtl}s, backend=${this.#defaults.backend}`
        );
    }

    /**
     * Create a new named cache instance.
     *
     * @param {string} name - Cache instance name (e.g., CacheNames.PROVIDERS)
     * @param {CreateOptions} [options] - Instance-specific options
     * @returns {CacheService} The created cache instance
     * @throws {Error} If a cache with this name already exists
     */
    create(name, options = {}) {
        if (this.#registry.has(name)) {
            throw new Error(`Cache '${name}' already exists. Use get() to retrieve it.`);
        }

        const mergedOptions = {
            name,
            defaultTtl: options.defaultTtl ?? this.#defaults.defaultTtl,
            backend: options.backend ?? this.#defaults.backend,
            namespace: options.namespace ?? "",
        };

        const cache = new CacheService(mergedOptions);
        this.#registry.set(name, cache);

        this.#logger.info(
            `created cache: ${name} (ttl=${mergedOptions.defaultTtl}s, backend=${mergedOptions.backend})`
        );

        return cache;
    }

    /**
     * Get an existing cache instance by name.
     *
     * @param {string} name - Cache instance name
     * @returns {CacheService} The cache instance
     * @throws {Error} If no cache with this name exists
     */
    get(name) {
        const cache = this.#registry.get(name);
        if (!cache) {
            throw new Error(
                `Cache '${name}' not found. Create it first with factory.create('${name}')`
            );
        }
        return cache;
    }

    /**
     * Check if a cache instance exists.
     *
     * @param {string} name - Cache instance name
     * @returns {boolean} True if cache exists
     */
    has(name) {
        return this.#registry.has(name);
    }

    /**
     * Destroy a cache instance and remove it from the registry.
     *
     * @param {string} name - Cache instance name
     * @returns {Promise<void>}
     */
    async destroy(name) {
        const cache = this.#registry.get(name);
        if (cache) {
            await cache.destroy();
            this.#registry.delete(name);
            this.#logger.info(`destroyed cache: ${name}`);
        }
    }

    /**
     * Destroy all cache instances.
     *
     * @returns {Promise<void>}
     */
    async destroyAll() {
        const names = Array.from(this.#registry.keys());
        for (const name of names) {
            await this.destroy(name);
        }
        this.#logger.info(`destroyed all caches (${names.length} instances)`);
    }

    /**
     * Get the names of all registered cache instances.
     *
     * @returns {string[]}
     */
    getNames() {
        return Array.from(this.#registry.keys());
    }

    /**
     * Get the number of registered cache instances.
     *
     * @returns {number}
     */
    getCount() {
        return this.#registry.size;
    }
}

/**
 * Create a new CacheFactory instance.
 *
 * @param {FactoryOptions} options - Factory configuration
 * @returns {CacheFactory}
 *
 * @example
 * const factory = createCacheFactory({
 *     defaults: { backend: 'memory', defaultTtl: 300 }
 * });
 * factory.create(CacheNames.PROVIDERS, { defaultTtl: 600 });
 * const providers = factory.get(CacheNames.PROVIDERS);
 */
export function createCacheFactory(options = {}) {
    return new CacheFactory(options);
}
