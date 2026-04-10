/**
 * SDK Client for AWS S3 Storage
 *
 * Provides a high-level SDK interface for CLI, LLM Agents, and programmatic access.
 * Wraps the storage implementation with configuration management and response envelopes.
 */

import { S3Client } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";

import { type SDKConfig, assertValidConfig } from "./config.js";
import { type Logger, NullLogger, create as createLogger } from "./logger.js";
import { JsonS3Storage } from "./storage.js";
import type { StorageStats } from "./types.js";

// Module-level logger
const logger = createLogger("aws_s3_client", import.meta.url);

/**
 * Response envelope for SDK operations.
 */
export interface SDKResponse<T> {
  /** Whether the operation succeeded */
  success: boolean;
  /** Result data (type depends on operation) */
  data: T | null;
  /** Storage key if applicable */
  key: string | null;
  /** Operation duration in milliseconds */
  elapsedMs: number;
  /** Error message if failed */
  error?: string;
}

/**
 * High-level SDK client for AWS S3 storage.
 *
 * Provides a simplified interface for CLI, LLM Agents, and programmatic access.
 * Handles S3 client instantiation, configuration, and response wrapping.
 *
 * @example
 * ```typescript
 * const config: SDKConfig = { bucketName: "my-bucket" };
 * const sdk = createSDK(config);
 *
 * const response = await sdk.save({ user_id: 123 });
 * console.log(response.key);
 *
 * await sdk.close();
 * ```
 */
export class S3StorageSDK {
  private readonly config: Required<SDKConfig>;
  private s3Client: S3Client | null = null;
  private storage: JsonS3Storage | null = null;
  private closed = false;
  private readonly _logger: Logger;

  constructor(config: SDKConfig, options?: { logger?: Logger }) {
    assertValidConfig(config);

    // Fill in defaults
    this.config = {
      bucketName: config.bucketName,
      region: config.region ?? "us-east-1",
      keyPrefix: config.keyPrefix ?? "jss3:",
      ttl: config.ttl,
      debug: config.debug ?? false,
      hashKeys: config.hashKeys,
      awsAccessKeyId: config.awsAccessKeyId,
      awsSecretAccessKey: config.awsSecretAccessKey,
      endpointUrl: config.endpointUrl,
      proxyUrl: config.proxyUrl,
      forcePathStyle: config.forcePathStyle,
    } as Required<SDKConfig>;

    // Initialize logger
    if (options?.logger) {
      this._logger = options.logger;
    } else if (config.debug) {
      this._logger = logger;
    } else {
      this._logger = new NullLogger();
    }

    this._logger.debug(`SDK initialized: bucket=${config.bucketName}`);
  }

  private async ensureInitialized(): Promise<JsonS3Storage> {
    if (this.storage) {
      return this.storage;
    }

    // Create S3 client
    const clientConfig: Record<string, unknown> = {
      region: this.config.region,
    };

    if (this.config.endpointUrl) {
      clientConfig.endpoint = this.config.endpointUrl;
    }

    // forcePathStyle from config (or default true when endpointUrl is set)
    clientConfig.forcePathStyle =
      this.config.forcePathStyle ?? !!this.config.endpointUrl;

    if (this.config.awsAccessKeyId && this.config.awsSecretAccessKey) {
      clientConfig.credentials = {
        accessKeyId: this.config.awsAccessKeyId,
        secretAccessKey: this.config.awsSecretAccessKey,
      };
    }

    // Proxy support via HttpOptions.agent
    if (this.config.proxyUrl) {
      const { HttpsProxyAgent } = await import("https-proxy-agent");
      const agent = new HttpsProxyAgent(this.config.proxyUrl);
      clientConfig.requestHandler = new NodeHttpHandler({
        httpAgent: agent,
        httpsAgent: agent,
      });
    }

    this.s3Client = new S3Client(clientConfig);

    // Create storage instance
    this.storage = new JsonS3Storage({
      s3Client: this.s3Client,
      bucketName: this.config.bucketName,
      keyPrefix: this.config.keyPrefix,
      hashKeys: this.config.hashKeys,
      ttl: this.config.ttl,
      region: this.config.region,
      debug: this.config.debug,
      logger: this._logger,
    });

    this._logger.info("SDK storage initialized");
    return this.storage;
  }

  /**
   * Save JSON data to S3.
   */
  async save(
    data: Record<string, unknown>,
    options?: { ttl?: number; customKey?: string }
  ): Promise<SDKResponse<string>> {
    const startTime = performance.now();
    this._logger.debug(`save: data with ${Object.keys(data).length} fields`);

    try {
      const storage = await this.ensureInitialized();
      const key = await storage.save(data, options);
      const elapsedMs = performance.now() - startTime;

      return {
        success: true,
        data: key,
        key,
        elapsedMs,
      };
    } catch (e) {
      const error = e as Error;
      const elapsedMs = performance.now() - startTime;
      this._logger.error(`save failed: ${error.message}`);

      return {
        success: false,
        data: null,
        key: null,
        elapsedMs,
        error: error.message,
      };
    }
  }

  /**
   * Load JSON data from S3.
   */
  async load(
    keyOrData: string | Record<string, unknown>
  ): Promise<SDKResponse<Record<string, unknown>>> {
    const startTime = performance.now();
    this._logger.debug(`load: keyOrData type=${typeof keyOrData}`);

    try {
      const storage = await this.ensureInitialized();
      const data = await storage.load(keyOrData);
      const elapsedMs = performance.now() - startTime;

      const key = typeof keyOrData === "string" ? keyOrData : null;

      return {
        success: true,
        data,
        key,
        elapsedMs,
      };
    } catch (e) {
      const error = e as Error;
      const elapsedMs = performance.now() - startTime;
      this._logger.error(`load failed: ${error.message}`);

      return {
        success: false,
        data: null,
        key: null,
        elapsedMs,
        error: error.message,
      };
    }
  }

  /**
   * Delete object from S3.
   */
  async delete(
    keyOrData: string | Record<string, unknown>
  ): Promise<SDKResponse<boolean>> {
    const startTime = performance.now();
    this._logger.debug(`delete: keyOrData type=${typeof keyOrData}`);

    try {
      const storage = await this.ensureInitialized();
      const result = await storage.delete(keyOrData);
      const elapsedMs = performance.now() - startTime;

      const key = typeof keyOrData === "string" ? keyOrData : null;

      return {
        success: true,
        data: result,
        key,
        elapsedMs,
      };
    } catch (e) {
      const error = e as Error;
      const elapsedMs = performance.now() - startTime;
      this._logger.error(`delete failed: ${error.message}`);

      return {
        success: false,
        data: false,
        key: null,
        elapsedMs,
        error: error.message,
      };
    }
  }

  /**
   * Check if object exists in S3.
   */
  async exists(
    keyOrData: string | Record<string, unknown>
  ): Promise<SDKResponse<boolean>> {
    const startTime = performance.now();
    this._logger.debug(`exists: keyOrData type=${typeof keyOrData}`);

    try {
      const storage = await this.ensureInitialized();
      const result = await storage.exists(keyOrData);
      const elapsedMs = performance.now() - startTime;

      const key = typeof keyOrData === "string" ? keyOrData : null;

      return {
        success: true,
        data: result,
        key,
        elapsedMs,
      };
    } catch (e) {
      const error = e as Error;
      const elapsedMs = performance.now() - startTime;
      this._logger.error(`exists failed: ${error.message}`);

      return {
        success: false,
        data: false,
        key: null,
        elapsedMs,
        error: error.message,
      };
    }
  }

  /**
   * List all storage keys.
   */
  async listKeys(): Promise<SDKResponse<string[]>> {
    const startTime = performance.now();
    this._logger.debug("listKeys: listing all keys");

    try {
      const storage = await this.ensureInitialized();
      const keys = await storage.listKeys();
      const elapsedMs = performance.now() - startTime;

      return {
        success: true,
        data: keys,
        key: null,
        elapsedMs,
      };
    } catch (e) {
      const error = e as Error;
      const elapsedMs = performance.now() - startTime;
      this._logger.error(`listKeys failed: ${error.message}`);

      return {
        success: false,
        data: [],
        key: null,
        elapsedMs,
        error: error.message,
      };
    }
  }

  /**
   * List all expired storage keys.
   */
  async listExpired(): Promise<SDKResponse<string[]>> {
    const startTime = performance.now();
    this._logger.debug("listExpired: listing expired keys");

    try {
      const storage = await this.ensureInitialized();
      const keys = await storage.listExpired();
      const elapsedMs = performance.now() - startTime;

      return {
        success: true,
        data: keys,
        key: null,
        elapsedMs,
      };
    } catch (e) {
      const error = e as Error;
      const elapsedMs = performance.now() - startTime;
      this._logger.error(`listExpired failed: ${error.message}`);

      return {
        success: false,
        data: [],
        key: null,
        elapsedMs,
        error: error.message,
      };
    }
  }

  /**
   * Delete all expired objects.
   */
  async cleanupExpired(): Promise<SDKResponse<number>> {
    const startTime = performance.now();
    this._logger.debug("cleanupExpired: cleaning up expired entries");

    try {
      const storage = await this.ensureInitialized();
      const count = await storage.cleanupExpired();
      const elapsedMs = performance.now() - startTime;

      return {
        success: true,
        data: count,
        key: null,
        elapsedMs,
      };
    } catch (e) {
      const error = e as Error;
      const elapsedMs = performance.now() - startTime;
      this._logger.error(`cleanupExpired failed: ${error.message}`);

      return {
        success: false,
        data: 0,
        key: null,
        elapsedMs,
        error: error.message,
      };
    }
  }

  /**
   * Delete all objects with prefix.
   */
  async clear(): Promise<SDKResponse<number>> {
    const startTime = performance.now();
    this._logger.warn("clear: deleting all objects");

    try {
      const storage = await this.ensureInitialized();
      const count = await storage.clear();
      const elapsedMs = performance.now() - startTime;

      return {
        success: true,
        data: count,
        key: null,
        elapsedMs,
      };
    } catch (e) {
      const error = e as Error;
      const elapsedMs = performance.now() - startTime;
      this._logger.error(`clear failed: ${error.message}`);

      return {
        success: false,
        data: 0,
        key: null,
        elapsedMs,
        error: error.message,
      };
    }
  }

  /**
   * Get operation statistics.
   */
  async stats(): Promise<SDKResponse<StorageStats>> {
    const startTime = performance.now();

    try {
      const storage = await this.ensureInitialized();
      const stats = storage.getStats();
      const elapsedMs = performance.now() - startTime;

      return {
        success: true,
        data: stats,
        key: null,
        elapsedMs,
      };
    } catch (e) {
      const error = e as Error;
      const elapsedMs = performance.now() - startTime;
      this._logger.error(`stats failed: ${error.message}`);

      return {
        success: false,
        data: null,
        key: null,
        elapsedMs,
        error: error.message,
      };
    }
  }

  /**
   * Get comprehensive debug information.
   */
  async debugInfo(): Promise<SDKResponse<Record<string, unknown>>> {
    const startTime = performance.now();

    try {
      const storage = await this.ensureInitialized();
      const info = await storage.debugInfo();
      const elapsedMs = performance.now() - startTime;

      return {
        success: true,
        data: info as unknown as Record<string, unknown>,
        key: null,
        elapsedMs,
      };
    } catch (e) {
      const error = e as Error;
      const elapsedMs = performance.now() - startTime;
      this._logger.error(`debugInfo failed: ${error.message}`);

      return {
        success: false,
        data: null,
        key: null,
        elapsedMs,
        error: error.message,
      };
    }
  }

  /**
   * Close SDK and release resources.
   */
  async close(): Promise<void> {
    if (this.closed) {
      return;
    }

    if (this.storage) {
      await this.storage.close();
    }

    if (this.s3Client) {
      this.s3Client.destroy();
    }

    this.closed = true;
    this._logger.info("SDK closed");
  }

  /**
   * Support for async disposal.
   */
  async [Symbol.asyncDispose](): Promise<void> {
    await this.close();
  }
}

/**
 * Factory function to create an SDK client.
 */
export function createSDK(
  config: SDKConfig,
  options?: { logger?: Logger }
): S3StorageSDK {
  return new S3StorageSDK(config, options);
}
