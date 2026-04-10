/**
 * JSON S3 Storage Implementation
 *
 * Main storage class providing CRUD operations for JSON data in AWS S3.
 */

import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

import {
  JsonS3StorageAuthError,
  JsonS3StorageClosedError,
  JsonS3StorageConfigError,
  JsonS3StorageReadError,
  JsonS3StorageSerializationError,
  JsonS3StorageWriteError,
} from "./errors.js";
import { generateKey } from "./key-generator.js";
import { type Logger, NullLogger, create as createLogger } from "./logger.js";
import {
  DEFAULT_RETRY_CONFIG,
  type DebugInfo,
  type EncryptionConfig,
  type ErrorRecord,
  type JsonS3StorageOptions,
  type LoadOptions,
  type RetryConfig,
  type S3ClientInterface,
  type SaveOptions,
  StorageClass,
  type StorageEntry,
  type StorageStats,
  calculateRetryDelay,
  encryptionToS3Params,
} from "./types.js";

// Module-level logger
const logger = createLogger("aws_s3_client", import.meta.url);

/**
 * AWS S3-backed JSON storage with TTL support.
 *
 * Provides a unified interface for saving and loading JSON data to Amazon S3
 * with automatic key generation, TTL expiration, and comprehensive logging.
 *
 * @example
 * ```typescript
 * const storage = createStorage({
 *   s3Client,
 *   bucketName: "my-bucket",
 *   ttl: 3600,
 * });
 *
 * const key = await storage.save({ user_id: 123, name: "Alice" });
 * const data = await storage.load(key);
 *
 * await storage.close();
 * ```
 */
export class JsonS3Storage {
  private readonly s3Client: S3ClientInterface;
  private readonly bucketName: string;
  private readonly keyPrefix: string;
  private readonly hashKeys?: string[];
  private readonly ttl?: number;
  private readonly region?: string;
  private readonly storageClass: StorageClass;
  private readonly encryption?: EncryptionConfig;
  private readonly contentType: string;
  private readonly retryConfig: Required<RetryConfig>;
  private readonly debug: boolean;
  private readonly maxErrorHistory: number;
  private readonly _logger: Logger;

  private stats: StorageStats;
  private errors: ErrorRecord[];
  private closed: boolean;

  constructor(options: JsonS3StorageOptions) {
    if (!options.bucketName) {
      throw new JsonS3StorageConfigError("bucketName is required");
    }

    this.s3Client = options.s3Client;
    this.bucketName = options.bucketName;
    this.keyPrefix = options.keyPrefix ?? "jss3:";
    this.hashKeys = options.hashKeys;
    this.ttl = options.ttl;
    this.region = options.region;
    this.storageClass = options.storageClass ?? StorageClass.STANDARD;
    this.encryption = options.encryption;
    this.contentType = options.contentType ?? "application/json";
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...options.retryConfig };
    this.debug = options.debug ?? false;
    this.maxErrorHistory = options.maxErrorHistory ?? 100;

    // Initialize logger
    if (options.logger) {
      this._logger = options.logger;
    } else if (this.debug) {
      this._logger = logger;
    } else {
      this._logger = new NullLogger();
    }

    // Initialize state
    this.stats = {
      saves: 0,
      loads: 0,
      hits: 0,
      misses: 0,
      deletes: 0,
      errors: 0,
    };
    this.errors = [];
    this.closed = false;

    this._logger.debug(
      `Initialized storage: bucket=${this.bucketName}, prefix=${this.keyPrefix}, ` +
        `ttl=${this.ttl}, storageClass=${this.storageClass}, debug=${this.debug}`
    );
  }

  private buildS3Key(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  private checkClosed(operation: string): void {
    if (this.closed) {
      throw new JsonS3StorageClosedError(operation);
    }
  }

  private recordError(operation: string, error: Error, key?: string): void {
    const s3Key = key ? this.buildS3Key(key) : null;
    const record: ErrorRecord = {
      timestamp: new Date().toISOString(),
      operation,
      error_type: error.name,
      error_message: error.message,
      traceback: error.stack ?? "",
      key: key ?? null,
      s3_key: s3Key,
    };

    this.errors.push(record);
    if (this.errors.length > this.maxErrorHistory) {
      this.errors.shift(); // FIFO eviction
    }

    this.stats.errors++;
    this._logger.warn(
      `Error recorded: operation=${operation}, type=${record.error_type}, key=${key}`
    );
  }

  private async withRetry<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        const errorStr = String(error).toLowerCase();

        // Check if retryable (5xx errors, timeouts, connection errors)
        const isRetryable =
          errorStr.includes("timeout") ||
          errorStr.includes("connection") ||
          errorStr.includes("throttl") ||
          errorStr.includes("5");

        if (!isRetryable || attempt >= this.retryConfig.maxRetries) {
          throw error;
        }

        const delay = calculateRetryDelay(attempt, this.retryConfig);
        this._logger.warn(
          `Retry attempt ${attempt + 1}/${this.retryConfig.maxRetries} for ${operation} ` +
            `after ${delay.toFixed(0)}ms: ${lastError.name}`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Save JSON data to S3.
   */
  async save<T extends Record<string, unknown>>(
    data: T,
    options?: SaveOptions
  ): Promise<string> {
    this.checkClosed("save");

    const startTime = performance.now();

    // Use custom key if provided, otherwise generate from data
    let key: string;
    if (options?.customKey) {
      key = options.customKey;
      this._logger.debug(`save: using custom key=${key}`);
    } else {
      key = generateKey(data, this.hashKeys);
      this._logger.debug(
        `save: generating key for data with ${Object.keys(data).length} fields`
      );
      this._logger.debug(`save: generated key=${key}`);
    }

    const s3Key = this.buildS3Key(key);

    // Calculate expiration
    const effectiveTtl = options?.ttl ?? this.ttl;
    const expiresAt = effectiveTtl ? Date.now() / 1000 + effectiveTtl : null;

    // Build storage entry
    const entry: StorageEntry<T> = {
      key,
      data,
      created_at: Date.now() / 1000,
      expires_at: expiresAt,
    };

    // Serialize to JSON
    let body: string;
    try {
      body = JSON.stringify(entry);
    } catch (e) {
      const error = e as Error;
      this.recordError("save", error, key);
      throw new JsonS3StorageSerializationError(
        `Failed to serialize data: ${error.message}`,
        { operation: "save", key, s3Key }
      );
    }

    // Build S3 command params
    const params: Record<string, unknown> = {
      Bucket: this.bucketName,
      Key: s3Key,
      Body: body,
      ContentType: this.contentType,
      StorageClass: this.storageClass,
    };

    // Add encryption if configured
    if (this.encryption) {
      Object.assign(params, encryptionToS3Params(this.encryption));
    }

    // PUT to S3 with retry
    try {
      await this.withRetry("save", () =>
        this.s3Client.send(new PutObjectCommand(params as never))
      );
    } catch (e) {
      const error = e as Error;
      this.recordError("save", error, key);
      const errorStr = String(error).toLowerCase();

      if (errorStr.includes("accessdenied") || errorStr.includes("403")) {
        throw new JsonS3StorageAuthError(
          `Access denied writing to S3: ${error.message}`,
          { operation: "save", key, s3Key }
        );
      }

      throw new JsonS3StorageWriteError(
        `Failed to write to S3: ${error.message}`,
        { operation: "save", key, s3Key }
      );
    }

    this.stats.saves++;
    const elapsed = performance.now() - startTime;
    this._logger.info(`save: completed key=${key} in ${elapsed.toFixed(1)}ms`);

    return key;
  }

  /**
   * Load JSON data from S3.
   */
  async load<T extends Record<string, unknown>>(
    dataOrKey: T | string,
    options?: LoadOptions
  ): Promise<T | null> {
    this.checkClosed("load");

    const startTime = performance.now();
    this.stats.loads++;

    // Determine key
    let key: string;
    if (typeof dataOrKey === "string") {
      key = dataOrKey;
      this._logger.debug(`load: using provided key=${key}`);
    } else {
      key = generateKey(dataOrKey, this.hashKeys);
      this._logger.debug(`load: generated key=${key} from data`);
    }

    const s3Key = this.buildS3Key(key);

    // GET from S3
    let response;
    try {
      response = await this.withRetry("load", () =>
        this.s3Client.send(
          new GetObjectCommand({
            Bucket: this.bucketName,
            Key: s3Key,
          })
        )
      );
    } catch (e) {
      const error = e as Error;
      const errorStr = String(error).toLowerCase();

      // Handle not found
      if (
        errorStr.includes("nosuchkey") ||
        errorStr.includes("404") ||
        errorStr.includes("not found")
      ) {
        this.stats.misses++;
        const elapsed = performance.now() - startTime;
        this._logger.info(
          `load: miss key=${key} (not found) in ${elapsed.toFixed(1)}ms`
        );
        return null;
      }

      this.recordError("load", error, key);

      if (errorStr.includes("accessdenied") || errorStr.includes("403")) {
        throw new JsonS3StorageAuthError(
          `Access denied reading from S3: ${error.message}`,
          { operation: "load", key, s3Key }
        );
      }

      throw new JsonS3StorageReadError(
        `Failed to read from S3: ${error.message}`,
        { operation: "load", key, s3Key }
      );
    }

    // Read and parse response body
    let entry: StorageEntry<T>;
    try {
      const bodyStr = await response.Body?.transformToString();
      if (!bodyStr) {
        throw new Error("Empty response body");
      }
      entry = JSON.parse(bodyStr) as StorageEntry<T>;
    } catch (e) {
      const error = e as Error;
      this.recordError("load", error, key);
      throw new JsonS3StorageSerializationError(
        `Failed to deserialize data: ${error.message}`,
        { operation: "load", key, s3Key }
      );
    }

    // Check expiration
    const isExpired =
      entry.expires_at !== null && Date.now() / 1000 > entry.expires_at;

    if (!options?.ignoreExpiry && isExpired) {
      this._logger.debug(`load: entry expired, deleting key=${key}`);

      // Lazy cleanup: delete expired entry
      try {
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: s3Key,
          })
        );
      } catch (e) {
        this._logger.warn(`load: failed to delete expired entry: ${e}`);
      }

      this.stats.misses++;
      const elapsed = performance.now() - startTime;
      this._logger.info(
        `load: miss key=${key} (expired) in ${elapsed.toFixed(1)}ms`
      );
      return null;
    }

    this.stats.hits++;
    const elapsed = performance.now() - startTime;
    this._logger.info(`load: hit key=${key} in ${elapsed.toFixed(1)}ms`);

    return entry.data;
  }

  /**
   * Delete object from S3.
   */
  async delete<T extends Record<string, unknown>>(
    dataOrKey: T | string
  ): Promise<boolean> {
    this.checkClosed("delete");

    const startTime = performance.now();

    // Determine key
    let key: string;
    if (typeof dataOrKey === "string") {
      key = dataOrKey;
      this._logger.debug(`delete: using provided key=${key}`);
    } else {
      key = generateKey(dataOrKey, this.hashKeys);
      this._logger.debug(`delete: generated key=${key} from data`);
    }

    const s3Key = this.buildS3Key(key);

    // DELETE from S3
    try {
      await this.withRetry("delete", () =>
        this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: s3Key,
          })
        )
      );
    } catch (e) {
      const error = e as Error;
      this.recordError("delete", error, key);
      throw new JsonS3StorageWriteError(
        `Failed to delete from S3: ${error.message}`,
        { operation: "delete", key, s3Key }
      );
    }

    this.stats.deletes++;
    const elapsed = performance.now() - startTime;
    this._logger.info(`delete: completed key=${key} in ${elapsed.toFixed(1)}ms`);

    return true;
  }

  /**
   * Check if object exists in S3.
   */
  async exists<T extends Record<string, unknown>>(
    dataOrKey: T | string
  ): Promise<boolean> {
    this.checkClosed("exists");

    // Determine key
    let key: string;
    if (typeof dataOrKey === "string") {
      key = dataOrKey;
    } else {
      key = generateKey(dataOrKey, this.hashKeys);
    }

    const s3Key = this.buildS3Key(key);
    this._logger.debug(`exists: checking key=${key}`);

    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: s3Key,
        })
      );
      this._logger.debug(`exists: key=${key} exists`);
      return true;
    } catch (e) {
      const error = e as Error;
      const errorStr = String(error).toLowerCase();

      if (
        errorStr.includes("404") ||
        errorStr.includes("not found") ||
        errorStr.includes("nosuchkey")
      ) {
        this._logger.debug(`exists: key=${key} does not exist`);
        return false;
      }

      this.recordError("exists", error, key);
      throw new JsonS3StorageReadError(
        `Failed to check existence in S3: ${error.message}`,
        { operation: "exists", key, s3Key }
      );
    }
  }

  /**
   * List all storage keys.
   */
  async listKeys(): Promise<string[]> {
    this.checkClosed("listKeys");

    this._logger.info(`listKeys: listing objects with prefix=${this.keyPrefix}`);

    const keys: string[] = [];
    let continuationToken: string | undefined;
    let pageCount = 0;

    while (true) {
      let response;
      try {
        response = await this.withRetry("listKeys", () =>
          this.s3Client.send(
            new ListObjectsV2Command({
              Bucket: this.bucketName,
              Prefix: this.keyPrefix,
              ContinuationToken: continuationToken,
            })
          )
        );
      } catch (e) {
        const error = e as Error;
        this.recordError("listKeys", error);
        throw new JsonS3StorageReadError(
          `Failed to list objects: ${error.message}`,
          { operation: "listKeys" }
        );
      }

      // Extract keys
      for (const obj of response.Contents ?? []) {
        const s3Key = obj.Key ?? "";
        if (s3Key.startsWith(this.keyPrefix)) {
          keys.push(s3Key.slice(this.keyPrefix.length));
        }
      }

      pageCount++;
      this._logger.debug(
        `listKeys: page ${pageCount}, found ${response.Contents?.length ?? 0} objects`
      );

      // Check for more pages
      if (response.IsTruncated) {
        continuationToken = response.NextContinuationToken;
      } else {
        break;
      }
    }

    this._logger.info(`listKeys: found ${keys.length} keys in ${pageCount} pages`);
    return keys;
  }

  /**
   * Delete all objects with configured prefix.
   */
  async clear(): Promise<number> {
    this.checkClosed("clear");

    this._logger.warn(
      `clear: deleting all objects with prefix=${this.keyPrefix} in bucket=${this.bucketName}`
    );

    const keys = await this.listKeys();
    if (keys.length === 0) {
      this._logger.info("clear: no objects to delete");
      return 0;
    }

    // Delete in batches of 1000 (S3 limit)
    let deletedCount = 0;
    const batchSize = 1000;

    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize);
      const deleteObjects = {
        Objects: batch.map((k) => ({ Key: this.buildS3Key(k) })),
      };

      try {
        await this.withRetry("clear", () =>
          this.s3Client.send(
            new DeleteObjectsCommand({
              Bucket: this.bucketName,
              Delete: deleteObjects,
            })
          )
        );
        deletedCount += batch.length;
        this._logger.info(
          `clear: deleted batch ${Math.floor(i / batchSize) + 1}, total=${deletedCount}/${keys.length}`
        );
      } catch (e) {
        const error = e as Error;
        this.recordError("clear", error);
        throw new JsonS3StorageWriteError(
          `Failed to delete objects: ${error.message}`,
          { operation: "clear" }
        );
      }
    }

    this._logger.info(`clear: deleted ${deletedCount} objects`);
    return deletedCount;
  }

  /**
   * List all expired object keys without deleting them.
   */
  async listExpired(): Promise<string[]> {
    this.checkClosed("listExpired");

    this._logger.info("listExpired: scanning for expired entries");

    const keys = await this.listKeys();
    const expiredKeys: string[] = [];

    for (const key of keys) {
      const s3Key = this.buildS3Key(key);

      try {
        const response = await this.s3Client.send(
          new GetObjectCommand({
            Bucket: this.bucketName,
            Key: s3Key,
          })
        );

        const bodyStr = await response.Body?.transformToString();
        if (!bodyStr) continue;

        const entry = JSON.parse(bodyStr) as StorageEntry;
        const isExpired =
          entry.expires_at !== null && Date.now() / 1000 > entry.expires_at;

        if (isExpired) {
          expiredKeys.push(key);
          this._logger.debug(`listExpired: found expired key=${key}`);
        }
      } catch (e) {
        this._logger.warn(`listExpired: failed to check key=${key}: ${e}`);
        continue;
      }
    }

    this._logger.info(`listExpired: found ${expiredKeys.length} expired entries`);
    return expiredKeys;
  }

  /**
   * Delete all expired objects.
   */
  async cleanupExpired(): Promise<number> {
    this.checkClosed("cleanupExpired");

    this._logger.info("cleanupExpired: scanning for expired entries");

    const keys = await this.listKeys();
    const expiredKeys: string[] = [];

    for (const key of keys) {
      const s3Key = this.buildS3Key(key);

      try {
        const response = await this.s3Client.send(
          new GetObjectCommand({
            Bucket: this.bucketName,
            Key: s3Key,
          })
        );

        const bodyStr = await response.Body?.transformToString();
        if (!bodyStr) continue;

        const entry = JSON.parse(bodyStr) as StorageEntry;
        const isExpired =
          entry.expires_at !== null && Date.now() / 1000 > entry.expires_at;

        if (isExpired) {
          expiredKeys.push(key);
          this._logger.debug(`cleanupExpired: found expired key=${key}`);
        }
      } catch (e) {
        this._logger.warn(`cleanupExpired: failed to check key=${key}: ${e}`);
        continue;
      }
    }

    if (expiredKeys.length === 0) {
      this._logger.info("cleanupExpired: no expired entries found");
      return 0;
    }

    // Delete expired entries in batches
    let deletedCount = 0;
    const batchSize = 1000;

    for (let i = 0; i < expiredKeys.length; i += batchSize) {
      const batch = expiredKeys.slice(i, i + batchSize);
      const deleteObjects = {
        Objects: batch.map((k) => ({ Key: this.buildS3Key(k) })),
      };

      try {
        await this.s3Client.send(
          new DeleteObjectsCommand({
            Bucket: this.bucketName,
            Delete: deleteObjects,
          })
        );
        deletedCount += batch.length;
      } catch (e) {
        this._logger.warn(`cleanupExpired: failed to delete batch: ${e}`);
        continue;
      }
    }

    this._logger.info(`cleanupExpired: deleted ${deletedCount} expired entries`);
    return deletedCount;
  }

  /**
   * Close storage and mark instance as closed.
   */
  async close(): Promise<void> {
    if (this.closed) {
      this._logger.debug("close: already closed");
      return;
    }

    this.closed = true;
    this._logger.info("close: storage closed");
  }

  /**
   * Get operation statistics.
   */
  getStats(): StorageStats {
    return { ...this.stats };
  }

  /**
   * Get error history.
   */
  getErrors(): ErrorRecord[] {
    return [...this.errors];
  }

  /**
   * Get most recent error.
   */
  getLastError(): ErrorRecord | null {
    return this.errors.length > 0 ? this.errors[this.errors.length - 1]! : null;
  }

  /**
   * Clear error history.
   */
  clearErrors(): void {
    this.errors = [];
    this._logger.debug("clearErrors: error history cleared");
  }

  /**
   * Get comprehensive debug information.
   */
  async debugInfo(): Promise<DebugInfo> {
    const objectCount = (await this.listKeys()).length;

    return {
      bucketName: this.bucketName,
      keyPrefix: this.keyPrefix,
      hashKeys: this.hashKeys ?? null,
      ttl: this.ttl ?? null,
      region: this.region ?? null,
      storageClass: this.storageClass,
      encryption: this.encryption ? encryptionToS3Params(this.encryption) : null,
      objectCount,
      stats: this.getStats(),
      errorCount: this.errors.length,
      lastError: this.getLastError(),
      errors: this.errors.slice(-10),
      closed: this.closed,
    };
  }

  /**
   * Support for async disposal (using keyword).
   */
  async [Symbol.asyncDispose](): Promise<void> {
    await this.close();
  }
}

/**
 * Factory function to create a JsonS3Storage instance.
 */
export function createStorage(options: JsonS3StorageOptions): JsonS3Storage {
  return new JsonS3Storage(options);
}
