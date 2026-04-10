/**
 * AWS S3 Client - Polyglot JSON Storage SDK
 *
 * Provides AWS S3-backed JSON storage with TTL support, defensive programming,
 * and polyglot parity with the Python implementation.
 *
 * @example
 * ```typescript
 * import { createSDK, SDKConfig } from "aws-s3-client";
 *
 * const config: SDKConfig = { bucketName: "my-bucket" };
 * const sdk = createSDK(config);
 *
 * const response = await sdk.save({ user: "alice" });
 * console.log(response.key);
 *
 * await sdk.close();
 * ```
 */

// Configuration
export { type SDKConfig, configFromEnv, validateConfig, assertValidConfig } from "./config.js";

// Logger
export {
  type Logger,
  LogLevel,
  DefaultLogger,
  NullLogger,
  create as createLogger,
} from "./logger.js";

// Errors
export {
  type ErrorContext,
  JsonS3StorageError,
  JsonS3StorageConfigError,
  JsonS3StorageAuthError,
  JsonS3StorageReadError,
  JsonS3StorageWriteError,
  JsonS3StorageSerializationError,
  JsonS3StorageClosedError,
} from "./errors.js";

// Types
export {
  StorageClass,
  EncryptionType,
  type StorageEntry,
  type ErrorRecord,
  type StorageStats,
  type RetryConfig,
  type EncryptionConfig,
  type JsonS3StorageOptions,
  type DebugInfo,
  type S3ClientInterface,
  type SaveOptions,
  type LoadOptions,
  DEFAULT_RETRY_CONFIG,
  calculateRetryDelay,
  encryptionToS3Params,
} from "./types.js";

// Key Generation
export { generateKey, generateKeyString } from "./key-generator.js";

// Storage
export { JsonS3Storage, createStorage } from "./storage.js";

// SDK
export { type SDKResponse, S3StorageSDK, createSDK } from "./sdk.js";

// Agent
export {
  type AgentResponse,
  AgentStorageInterface,
  createAgentInterface,
  TOOL_SCHEMA,
} from "./agent.js";
