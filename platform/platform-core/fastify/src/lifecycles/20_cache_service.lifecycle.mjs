/**
 * Cache Service Lifecycle Hook for Fastify
 *
 * Initializes the multi-instance cache factory and decorates the server
 * with the cache factory instance for use in routes and plugins.
 *
 * Loading Order: 20 (after config, before business logic)
 *
 * Usage in routes:
 *     // Get factory
 *     const factory = req.server.cache;
 *
 *     // Get specific cache instance
 *     const providers = req.server.cache.get(CacheNames.PROVIDERS);
 *     const token = await providers.getOrSet('oauth:google', fetchToken, 600);
 *
 *     // Or use convenience method
 *     const token = await req.server.cache.get(CacheNames.PROVIDERS).getOrSet(...);
 */

import {
    createCacheFactory,
    CacheNames,
    DefaultTTLs,
} from '../../../polyglot/server_provider_cache/mjs/index.mjs';
import { resolveRedisEnv } from '@internal/env-resolver';

/**
 * Get cache configuration from app config or environment variables.
 *
 * @param {object} server - Fastify server instance
 * @returns {object} Cache configuration
 */
function getCacheConfig(server) {
    // Try to get from app config first
    let cacheConfig = {};

    if (server.config && typeof server.config.get === 'function') {
        try {
            cacheConfig = server.config.get('cache') || {};
        } catch (e) {
            server.log.debug('No cache config in app config, using defaults');
        }
    }

    const redisEnv = resolveRedisEnv();
    return {
        defaultTtl: cacheConfig.defaultTtl
            || redisEnv.cacheDefaultTtl,
        backend: cacheConfig.backend
            || redisEnv.cacheBackend,
        // Per-cache TTL overrides
        ttls: {
            providers: cacheConfig.ttls?.providers || DefaultTTLs[CacheNames.PROVIDERS],
            services: cacheConfig.ttls?.services || DefaultTTLs[CacheNames.SERVICES],
            config: cacheConfig.ttls?.config || DefaultTTLs[CacheNames.CONFIG],
            sessions: cacheConfig.ttls?.sessions || DefaultTTLs[CacheNames.SESSIONS],
            tokens: cacheConfig.ttls?.tokens || DefaultTTLs[CacheNames.TOKENS],
        },
    };
}

/**
 * Startup hook - Initialize cache factory and create default cache instances.
 *
 * @param {object} server - Fastify server instance
 * @param {object} config - Bootstrap config (may be overridden by app config)
 */
export async function onStartup(server, config) {
    server.log.info('[lifecycle:cache-service] Initializing Cache Service...');

    try {
        const cacheConfig = getCacheConfig(server);

        server.log.info({
            defaultTtl: cacheConfig.defaultTtl,
            backend: cacheConfig.backend,
        }, '[lifecycle:cache-service] Cache configuration resolved');

        server.log.debug({ ttls: cacheConfig.ttls }, '[lifecycle:cache-service] Per-cache TTL overrides');

        // Create the factory with defaults
        server.log.info('[lifecycle:cache-service] Creating cache factory');
        const factory = createCacheFactory({
            defaults: {
                backend: cacheConfig.backend,
                defaultTtl: cacheConfig.defaultTtl,
            },
        });

        // Create default cache instances based on CacheNames
        // These can be customized via app config
        server.log.info('[lifecycle:cache-service] Creating default cache instances');
        factory.create(CacheNames.PROVIDERS, {
            defaultTtl: cacheConfig.ttls.providers,
        });
        factory.create(CacheNames.SERVICES, {
            defaultTtl: cacheConfig.ttls.services,
        });
        factory.create(CacheNames.CONFIG, {
            defaultTtl: cacheConfig.ttls.config,
        });
        factory.create(CacheNames.SESSIONS, {
            defaultTtl: cacheConfig.ttls.sessions,
        });
        factory.create(CacheNames.TOKENS, {
            defaultTtl: cacheConfig.ttls.tokens,
        });

        // Decorate server with cache factory
        if (!server.hasDecorator('cache')) {
            server.decorate('cache', factory);
            server.log.info('[lifecycle:cache-service] Decorated server with cache factory');
        } else {
            server.cache = factory;
            server.log.info('[lifecycle:cache-service] Overwrote existing server.cache with new factory');
        }

        // Also expose CacheNames for convenience
        if (!server.hasDecorator('CacheNames')) {
            server.decorate('CacheNames', CacheNames);
            server.log.info('[lifecycle:cache-service] Decorated server with CacheNames');
        }

        // Register cleanup hook
        server.addHook('onClose', async () => {
            server.log.info('[lifecycle:cache-service] Cleaning up cache service...');
            await factory.destroyAll();
            server.log.info('[lifecycle:cache-service] Cache service cleaned up');
        });

        server.log.info({
            caches: factory.getNames(),
            count: factory.getCount(),
        }, '[lifecycle:cache-service] Cache service initialized successfully');
    } catch (err) {
        server.log.error({ err, hookName: '20-cache-service' }, '[lifecycle:cache-service] Cache service initialization failed');
        throw err;
    }
}

/**
 * Shutdown hook - Cleanup cache resources.
 *
 * Note: This is also handled by the onClose hook registered in onStartup,
 * but this provides an explicit shutdown point if needed.
 *
 * @param {object} server - Fastify server instance
 */
export async function onShutdown(server) {
    if (server.cache && typeof server.cache.destroyAll === 'function') {
        server.log.info('Shutting down cache service...');
        await server.cache.destroyAll();
    }
}
