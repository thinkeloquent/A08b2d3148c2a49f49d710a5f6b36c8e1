/**
 * Type definitions for JSON S3 Storage
 *
 * Provides structured types for storage entries, statistics, configuration,
 * and client interface definitions.
 *
 * NOTE: This module defines its own S3 command types to avoid a hard dependency
 * on @aws-sdk/client-s3. Users must provide their own S3Client instance.
 */

/**
 * Minimal S3 command interface.
 * Compatible with @aws-sdk/client-s3 commands.
 */
export interface S3Command {
  readonly input: unknown;
}

/**
 * Readable stream body interface for S3 responses.
 */
export interface StreamingBlobPayloadOutputTypes {
  transformToString(): Promise<string>;
}

/**
 * Minimal output type for PutObjectCommand.
 */
export interface PutObjectCommandOutput {
  $metadata: { httpStatusCode?: number };
}

/**
 * Minimal output type for GetObjectCommand.
 */
export interface GetObjectCommandOutput {
  $metadata: { httpStatusCode?: number };
  Body?: StreamingBlobPayloadOutputTypes;
}

/**
 * Minimal output type for DeleteObjectCommand.
 */
export interface DeleteObjectCommandOutput {
  $metadata: { httpStatusCode?: number };
}

/**
 * Minimal output type for HeadObjectCommand.
 */
export interface HeadObjectCommandOutput {
  $metadata: { httpStatusCode?: number };
}

/**
 * S3 object metadata.
 */
export interface S3Object {
  Key?: string;
}

/**
 * Minimal output type for ListObjectsV2Command.
 */
export interface ListObjectsV2CommandOutput {
  $metadata: { httpStatusCode?: number };
  Contents?: S3Object[];
  IsTruncated?: boolean;
  NextContinuationToken?: string;
}

/**
 * Minimal output type for DeleteObjectsCommand.
 */
export interface DeleteObjectsCommandOutput {
  $metadata: { httpStatusCode?: number };
}

/**
 * S3 storage class options.
 */
export enum StorageClass {
  STANDARD = "STANDARD",
  STANDARD_IA = "STANDARD_IA",
  ONEZONE_IA = "ONEZONE_IA",
  INTELLIGENT_TIERING = "INTELLIGENT_TIERING",
  GLACIER = "GLACIER",
  GLACIER_IR = "GLACIER_IR",
  DEEP_ARCHIVE = "DEEP_ARCHIVE",
}

/**
 * Server-side encryption types.
 */
export enum EncryptionType {
  SSE_S3 = "SSE-S3",
  SSE_KMS = "SSE-KMS",
  SSE_C = "SSE-C",
}

/**
 * Metadata wrapper for stored JSON data.
 */
export interface StorageEntry<T = Record<string, unknown>> {
  /** Generated storage key (SHA256 hash) */
  key: string;
  /** User's JSON payload */
  data: T;
  /** Unix timestamp of creation */
  created_at: number;
  /** Unix timestamp of expiration (null = never expires) */
  expires_at: number | null;
}

/**
 * Error tracking record for diagnostics.
 */
export interface ErrorRecord {
  /** ISO 8601 timestamp when error occurred */
  timestamp: string;
  /** Operation that failed (save, load, delete, etc.) */
  operation: string;
  /** Exception class name */
  error_type: string;
  /** Exception message */
  error_message: string;
  /** Full stack trace */
  traceback: string;
  /** Storage key if available */
  key: string | null;
  /** Full S3 object key if available */
  s3_key: string | null;
}

/**
 * Operation statistics for monitoring.
 */
export interface StorageStats {
  saves: number;
  loads: number;
  hits: number;
  misses: number;
  deletes: number;
  errors: number;
}

/**
 * Retry behavior configuration for transient failures.
 */
export interface RetryConfig {
  /** Maximum retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial delay between retries in ms (default: 100) */
  baseDelayMs?: number;
  /** Maximum delay between retries in ms (default: 5000) */
  maxDelayMs?: number;
  /** Exponential backoff multiplier (default: 2.0) */
  exponentialBase?: number;
  /** Add randomization to delays (default: true) */
  jitter?: boolean;
}

/**
 * Server-side encryption configuration.
 */
export interface EncryptionConfig {
  /** Encryption type */
  type: EncryptionType;
  /** KMS key ID (for SSE-KMS) */
  kmsKeyId?: string;
  /** Customer-provided key (for SSE-C) */
  customerKey?: string;
}

/**
 * Configuration options for JsonS3Storage.
 */
export interface JsonS3StorageOptions {
  /** AWS S3 client instance */
  s3Client: S3ClientInterface;
  /** Target S3 bucket name */
  bucketName: string;
  /** Prefix for all object keys (default: "jss3:") */
  keyPrefix?: string;
  /** Specific data fields to use for key generation */
  hashKeys?: string[];
  /** Default TTL in seconds (undefined = no expiration) */
  ttl?: number;
  /** AWS region (uses client default if not specified) */
  region?: string;
  /** S3 storage class (default: STANDARD) */
  storageClass?: StorageClass;
  /** Server-side encryption configuration */
  encryption?: EncryptionConfig;
  /** Content-Type header (default: "application/json") */
  contentType?: string;
  /** Retry configuration for transient failures */
  retryConfig?: RetryConfig;
  /** Enable debug logging */
  debug?: boolean;
  /** Maximum number of errors to retain (default: 100) */
  maxErrorHistory?: number;
  /** Custom logger instance */
  logger?: import("./logger.js").Logger;
}

/**
 * Comprehensive debug information for troubleshooting.
 */
export interface DebugInfo {
  bucketName: string;
  keyPrefix: string;
  hashKeys: string[] | null;
  ttl: number | null;
  region: string | null;
  storageClass: string;
  encryption: Record<string, string> | null;
  objectCount: number;
  stats: StorageStats;
  errorCount: number;
  lastError: ErrorRecord | null;
  errors: ErrorRecord[];
  closed: boolean;
}

/**
 * Interface for S3 client compatibility.
 *
 * Compatible with @aws-sdk/client-s3 S3Client.
 * Users must pass their own S3Client instance that satisfies this interface.
 *
 * @example
 * ```typescript
 * import { S3Client } from '@aws-sdk/client-s3';
 * const s3Client = new S3Client({ region: 'us-east-1' });
 * const storage = createStorage({ s3Client, bucketName: 'my-bucket' });
 * ```
 */
export interface S3ClientInterface {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  send(command: S3Command): Promise<any>;
}

/**
 * Options for save operation.
 */
export interface SaveOptions {
  /** TTL override in seconds */
  ttl?: number;
}

/**
 * Options for load operation.
 */
export interface LoadOptions {
  /** If true, return data even if expired */
  ignoreExpiry?: boolean;
}

/**
 * Default retry configuration values.
 */
export const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  baseDelayMs: 100,
  maxDelayMs: 5000,
  exponentialBase: 2.0,
  jitter: true,
};

/**
 * Calculate retry delay with exponential backoff and optional jitter.
 */
export function calculateRetryDelay(
  attempt: number,
  config: Required<RetryConfig>
): number {
  let delayMs = Math.min(
    config.baseDelayMs * Math.pow(config.exponentialBase, attempt),
    config.maxDelayMs
  );

  if (config.jitter) {
    delayMs = delayMs * (0.5 + Math.random());
  }

  return delayMs;
}

/**
 * Convert encryption config to S3 parameters.
 */
export function encryptionToS3Params(
  config: EncryptionConfig
): Record<string, string> {
  const params: Record<string, string> = {};

  if (config.type === EncryptionType.SSE_S3) {
    params["ServerSideEncryption"] = "AES256";
  } else if (config.type === EncryptionType.SSE_KMS) {
    params["ServerSideEncryption"] = "aws:kms";
    if (config.kmsKeyId) {
      params["SSEKMSKeyId"] = config.kmsKeyId;
    }
  } else if (config.type === EncryptionType.SSE_C) {
    if (config.customerKey) {
      params["SSECustomerAlgorithm"] = "AES256";
      params["SSECustomerKey"] = config.customerKey;
    }
  }

  return params;
}
