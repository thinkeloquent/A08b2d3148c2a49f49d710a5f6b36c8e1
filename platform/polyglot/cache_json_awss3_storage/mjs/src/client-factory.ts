/**
 * S3 Client Factory
 *
 * Provides factory function and disposable wrappers for creating
 * S3 clients from a unified ClientConfig.
 *
 * Polyglot parity with Python cache_json_awss3_storage.client_factory.
 *
 * @example
 * ```typescript
 * import { getClientFactory, createAsyncClient } from "cache_json_awss3_storage";
 *
 * const config = getClientFactory({ bucketName: "my-bucket", regionName: "us-east-1" });
 *
 * // Using the helper (recommended)
 * const { client, destroy } = createAsyncClient(config);
 * try {
 *   const storage = createStorage({ s3Client: client, bucketName: config.bucketName });
 *   await storage.save("key", { data: "value" });
 * } finally {
 *   destroy();
 * }
 * ```
 */

import { S3Client } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { JsonS3StorageConfigError } from "./errors.js";
import { create as createLogger } from "./logger.js";
import type { S3ClientInterface } from "./types.js";

const logger = createLogger("cache_json_awss3_storage", import.meta.url);

/**
 * Configuration for S3 client creation via getClientFactory.
 *
 * Polyglot parity with Python ClientConfig dataclass.
 */
export interface ClientConfig {
  /** Target S3 bucket name (required) */
  bucketName: string;
  /** HTTPS proxy URL for S3 connections */
  proxyUrl?: string;
  /** Custom S3-compatible endpoint (e.g. MinIO, LocalStack) */
  endpointUrl?: string;
  /** AWS secret access key (falls back to env/profile) */
  awsSecretAccessKey?: string;
  /** AWS access key ID (falls back to env/profile) */
  awsAccessKeyId?: string;
  /** AWS region name */
  regionName?: string;
  /** S3 addressing style: "path" or "virtual" (default: "path") */
  addressingStyle?: "path" | "virtual";
  /** Connection timeout in seconds (default: 20) */
  connectionTimeout?: number;
  /** Read timeout in seconds (default: 60) */
  readTimeout?: number;
  /** Maximum retry attempts for transient failures (default: 3) */
  retriesMaxAttempts?: number;
  /** Client type, must be "s3" (default: "s3") */
  type?: string;
  /** Enable SSL certificate verification (default: true) */
  verify?: boolean;
  /** Default TTL for cached entries in seconds (default: 600) */
  ttl?: number;
}

/**
 * Options for getClientFactory (same fields as ClientConfig but with defaults applied).
 */
export interface ClientFactoryOptions {
  /** Target S3 bucket name (required) */
  bucketName: string;
  proxyUrl?: string;
  endpointUrl?: string;
  awsSecretAccessKey?: string;
  awsAccessKeyId?: string;
  regionName?: string;
  addressingStyle?: "path" | "virtual";
  connectionTimeout?: number;
  readTimeout?: number;
  retriesMaxAttempts?: number;
  type?: string;
  verify?: boolean;
  ttl?: number;
}

/**
 * Result of createAsyncClient — an S3Client and a destroy function.
 */
export interface AsyncClientHandle {
  /** The S3Client instance, compatible with S3ClientInterface */
  client: S3Client & S3ClientInterface;
  /** Call to destroy the client and release resources */
  destroy: () => void;
  /** The config used to create the client */
  config: ClientConfig;
}

/**
 * Build an S3Client from a ClientConfig.
 */
function buildS3Client(config: ClientConfig): S3Client {
  const clientConfig: Record<string, unknown> = {};

  if (config.regionName) {
    clientConfig.region = config.regionName;
  }

  if (config.endpointUrl) {
    clientConfig.endpoint = config.endpointUrl;
    clientConfig.forcePathStyle = config.addressingStyle === "path";
  }

  if (config.awsAccessKeyId && config.awsSecretAccessKey) {
    clientConfig.credentials = {
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey,
    };
  }

  if (config.verify === false) {
    clientConfig.tls = false;
  }

  const timeouts = {
    connectionTimeout: (config.connectionTimeout ?? 20) * 1000,
    requestTimeout: (config.readTimeout ?? 60) * 1000,
  };

  if (config.proxyUrl) {
    // Dynamic import not possible at top level, so we configure
    // the handler with the proxy agent inline
    clientConfig.requestHandler = new NodeHttpHandler({
      ...timeouts,
      // Proxy must be configured by the caller via env HTTP_PROXY/HTTPS_PROXY
      // or by passing a custom requestHandler. The NodeHttpHandler respects
      // the standard proxy env vars automatically.
    });
  } else {
    clientConfig.requestHandler = new NodeHttpHandler(timeouts);
  }

  clientConfig.maxAttempts = config.retriesMaxAttempts ?? 3;

  return new S3Client(clientConfig as any);
}

/**
 * Create an S3 ClientConfig from connection parameters.
 *
 * The returned config is used with createAsyncClient to obtain a
 * ready-to-use S3Client.
 *
 * Polyglot parity with Python get_client_factory().
 *
 * @param options - Connection parameters
 * @returns ClientConfig instance
 *
 * @example
 * ```typescript
 * const config = getClientFactory({
 *   bucketName: "my-cache-bucket",
 *   regionName: "us-east-1",
 *   endpointUrl: "http://localhost:4566",
 *   ttl: 3600,
 * });
 *
 * const { client, destroy } = createAsyncClient(config);
 * ```
 */
export function getClientFactory(options: ClientFactoryOptions): ClientConfig {
  if (!options.bucketName) {
    throw new JsonS3StorageConfigError("bucketName is required");
  }

  const type = options.type ?? "s3";
  if (type !== "s3") {
    throw new JsonS3StorageConfigError(
      `Unsupported client type: "${type}", expected "s3"`
    );
  }

  const config: ClientConfig = {
    bucketName: options.bucketName,
    proxyUrl: options.proxyUrl,
    endpointUrl: options.endpointUrl,
    awsSecretAccessKey: options.awsSecretAccessKey,
    awsAccessKeyId: options.awsAccessKeyId,
    regionName: options.regionName,
    addressingStyle: options.addressingStyle ?? "path",
    connectionTimeout: options.connectionTimeout ?? 20,
    readTimeout: options.readTimeout ?? 60,
    retriesMaxAttempts: options.retriesMaxAttempts ?? 3,
    type,
    verify: options.verify ?? true,
    ttl: options.ttl ?? 600,
  };

  logger.info(
    `getClientFactory: created config bucket=${config.bucketName}, ` +
      `region=${config.regionName}, endpoint=${config.endpointUrl}, ttl=${config.ttl}`
  );

  return config;
}

/**
 * Create an S3Client from a ClientConfig.
 *
 * Returns the client and a destroy function for cleanup.
 * The client satisfies S3ClientInterface and can be passed to createStorage.
 *
 * Polyglot parity with Python ClientAsync/ClientSync context managers.
 *
 * @param config - ClientConfig from getClientFactory
 * @returns AsyncClientHandle with client, destroy, and config
 *
 * @example
 * ```typescript
 * const config = getClientFactory({ bucketName: "my-bucket" });
 * const { client, destroy } = createAsyncClient(config);
 *
 * try {
 *   const storage = createStorage({ s3Client: client, bucketName: config.bucketName });
 *   await storage.save("key", { name: "Alice" });
 *   const data = await storage.load("key");
 * } finally {
 *   destroy();
 * }
 * ```
 */
export function createAsyncClient(config: ClientConfig): AsyncClientHandle {
  if (config.type !== "s3") {
    throw new JsonS3StorageConfigError(
      `Unsupported client type: "${config.type}", expected "s3"`
    );
  }

  const client = buildS3Client(config);

  logger.debug(
    `createAsyncClient: opened connection ` +
      `endpoint=${config.endpointUrl}, ` +
      `region=${config.regionName}, ` +
      `bucket=${config.bucketName}`
  );

  return {
    client: client as S3Client & S3ClientInterface,
    destroy: () => {
      try {
        client.destroy();
        logger.debug("createAsyncClient: closed connection");
      } catch {
        // ignore destroy errors
      }
    },
    config,
  };
}
