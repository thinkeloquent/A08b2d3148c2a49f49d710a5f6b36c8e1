/**
 * server-provider-cache - Multi-instance cache factory for polyglot applications.
 *
 * Entry point re-exporting all public API components.
 */

// SDK (includes factory, service, constants)
export * from "./src/sdk.mjs";

// Logger (for advanced customization)
export { create as createLogger, Logger, DEBUG, INFO, WARN, ERROR } from "./src/logger.mjs";

// Backends (for direct backend access)
export { MemoryBackend, createMemoryBackend } from "./src/backends/memory.mjs";
export { RedisBackend, createRedisBackend } from "./src/backends/redis.mjs";
