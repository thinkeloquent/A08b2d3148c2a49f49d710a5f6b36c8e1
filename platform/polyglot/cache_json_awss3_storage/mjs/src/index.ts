/**
 * Cache JSON AWS S3 Storage
 *
 * AWS S3-backed JSON storage with TTL support and polyglot parity.
 * Provides a unified interface for saving and loading JSON data to Amazon S3.
 */

// Main class
export { JsonS3Storage, createStorage } from "./storage.js";

// Client Factory
export type { ClientConfig, ClientFactoryOptions, AsyncClientHandle } from "./client-factory.js";
export { getClientFactory, createAsyncClient } from "./client-factory.js";

// Client Factory with HTTP Client (undici Dispatcher injection)
export {
  getClientFactoryWithHttpClient,
  ClientAsyncWithHttpClient,
  ClientSyncWithHttpClient,
  createAsyncClientWithHttpClient,
  createSyncClientWithHttpClient,
} from "./client-factory-with-http-client.js";

// Undici HTTP Handler
export { UndiciHttpHandler } from "./undici-http-handler.js";
export type { UndiciHttpHandlerOptions } from "./undici-http-handler.js";

// Config Bridge (AppYamlConfig / env → ClientConfig)
export type { AppConfigOverrides } from "./config-bridge.js";
export { getClientFactoryFromAppConfig } from "./config-bridge.js";

// Logger
export type { Logger } from "./logger.js";
export { create as createLogger, NullLogger } from "./logger.js";

// Types
export type {
  StorageEntry,
  ErrorRecord,
  StorageStats,
  RetryConfig,
  EncryptionConfig,
  JsonS3StorageOptions,
  DebugInfo,
  S3ClientInterface,
} from "./types.js";

export { StorageClass, EncryptionType } from "./types.js";

// Errors
export {
  JsonS3StorageError,
  JsonS3StorageReadError,
  JsonS3StorageWriteError,
  JsonS3StorageSerializationError,
  JsonS3StorageAuthError,
  JsonS3StorageConfigError,
  JsonS3StorageClosedError,
} from "./errors.js";

// Key Generation Utilities
export {
  generateKey,
  generateKeyString,
  generateKeyFromValue,
  generateKeyFromFields,
} from "./key-generator.js";

// Cached HTTP Client (HOF pattern)
export type { S3CacheConfig, RequestOptions } from "./cached-http-client.js";
export { withS3Cache, CachedHttpClient, CachedResponse } from "./cached-http-client.js";
