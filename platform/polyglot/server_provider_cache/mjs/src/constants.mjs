/**
 * Cache name constants for server-provider-cache package.
 *
 * Pre-defined cache names ensure consistency across the codebase.
 * Use these constants when creating or accessing cache instances.
 *
 * Usage:
 *     import { CacheNames } from './constants.mjs';
 *     factory.create(CacheNames.PROVIDERS, { defaultTtl: 600 });
 */

/**
 * Pre-defined cache instance names.
 * @readonly
 * @enum {string}
 */
export const CacheNames = Object.freeze({
    /** OAuth tokens, API credentials - suggested TTL: 600s */
    PROVIDERS: "providers",

    /** Service discovery, health checks - suggested TTL: 300s */
    SERVICES: "services",

    /** Feature flags, application settings - suggested TTL: 3600s */
    CONFIG: "config",

    /** User sessions, auth state - suggested TTL: 1800s */
    SESSIONS: "sessions",

    /** JWT tokens, refresh tokens - suggested TTL: 900s */
    TOKENS: "tokens",
});

/**
 * Default TTL values for each cache type (in seconds).
 * @readonly
 */
export const DefaultTTLs = Object.freeze({
    [CacheNames.PROVIDERS]: 600,
    [CacheNames.SERVICES]: 300,
    [CacheNames.CONFIG]: 3600,
    [CacheNames.SESSIONS]: 1800,
    [CacheNames.TOKENS]: 900,
});

/**
 * Default cache backend.
 */
export const DEFAULT_BACKEND = "memory";

/**
 * Default TTL in seconds.
 */
export const DEFAULT_TTL = parseInt(process.env.CACHE_DEFAULT_TTL || "300", 10);
