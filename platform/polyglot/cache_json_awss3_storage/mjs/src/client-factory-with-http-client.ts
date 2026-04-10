/**
 * S3 Client Factory with HTTP Client Injection
 *
 * Companion to client-factory.ts that accepts an undici Dispatcher from
 * fetch_client as the transport layer instead of the default NodeHttpHandler.
 * This enables unified proxy/SSL/timeout configuration and connection pooling
 * across the codebase.
 *
 * Polyglot parity with Python client_factory_with_http_client.py.
 *
 * @example
 * ```typescript
 * import { Agent } from "undici";
 * import {
 *   getClientFactoryWithHttpClient,
 *   ClientAsyncWithHttpClient,
 *   createStorage,
 * } from "cache_json_awss3_storage";
 *
 * const dispatcher = new Agent({ connect: { timeout: 10_000 } });
 * const config = getClientFactoryWithHttpClient({
 *   bucketName: "my-bucket",
 *   regionName: "us-east-1",
 * });
 *
 * const handle = new ClientAsyncWithHttpClient(config, dispatcher);
 * try {
 *   const storage = createStorage({ s3Client: handle.client, bucketName: config.bucketName });
 *   await storage.save("key", { data: "value" });
 * } finally {
 *   handle.destroy();
 * }
 * ```
 */

import { S3Client } from "@aws-sdk/client-s3";
import type { Dispatcher } from "undici";
import type { ClientConfig, ClientFactoryOptions, AsyncClientHandle } from "./client-factory.js";
import { JsonS3StorageConfigError } from "./errors.js";
import { create as createLogger } from "./logger.js";
import type { S3ClientInterface } from "./types.js";
import { UndiciHttpHandler } from "./undici-http-handler.js";

const logger = createLogger("cache_json_awss3_storage", import.meta.url);

/**
 * Create an S3 ClientConfig from connection parameters for use with
 * an injected HTTP client.
 *
 * Same validation as getClientFactory. The returned config is used with
 * ClientAsyncWithHttpClient or ClientSyncWithHttpClient.
 *
 * Polyglot parity with Python get_client_factory_with_http_client().
 *
 * @param options - Connection parameters (same as getClientFactory)
 * @returns ClientConfig instance
 *
 * @example
 * ```typescript
 * const config = getClientFactoryWithHttpClient({
 *   bucketName: "my-cache-bucket",
 *   regionName: "us-east-1",
 * });
 *
 * const handle = new ClientAsyncWithHttpClient(config, dispatcher);
 * ```
 */
export function getClientFactoryWithHttpClient(
  options: ClientFactoryOptions
): ClientConfig {
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
    `getClientFactoryWithHttpClient: created config bucket=${config.bucketName}, ` +
      `region=${config.regionName}, endpoint=${config.endpointUrl}, ttl=${config.ttl}`
  );

  return config;
}

/**
 * Build an S3Client using the UndiciHttpHandler as the transport layer.
 */
function buildS3ClientWithHttpClient(
  config: ClientConfig,
  dispatcher: Dispatcher
): S3Client {
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

  clientConfig.requestHandler = new UndiciHttpHandler(dispatcher, {
    connectionTimeout: (config.connectionTimeout ?? 20) * 1000,
    requestTimeout: (config.readTimeout ?? 60) * 1000,
  });

  clientConfig.maxAttempts = config.retriesMaxAttempts ?? 3;

  return new S3Client(clientConfig as any);
}

/**
 * Async S3 client wrapper using an undici Dispatcher.
 *
 * Polyglot parity with Python ClientAsyncWithHttpClient(config, httpx_client).
 * The caller owns the Dispatcher lifecycle — destroy() only tears down the S3Client.
 *
 * @example
 * ```typescript
 * const handle = new ClientAsyncWithHttpClient(config, dispatcher);
 * try {
 *   const storage = createStorage({ s3Client: handle.client, bucketName: config.bucketName });
 *   await storage.save("key", { data: "value" });
 * } finally {
 *   handle.destroy();
 * }
 *
 * // Or with Symbol.asyncDispose (Node 20+ / TypeScript 5.2+):
 * await using handle = new ClientAsyncWithHttpClient(config, dispatcher);
 * ```
 */
export class ClientAsyncWithHttpClient {
  /** The S3Client instance, compatible with S3ClientInterface */
  readonly client: S3Client & S3ClientInterface;
  /** The config used to create the client */
  readonly config: ClientConfig;

  constructor(config: ClientConfig, dispatcher: Dispatcher) {
    if (config.type !== "s3") {
      throw new JsonS3StorageConfigError(
        `Unsupported client type: "${config.type}", expected "s3"`
      );
    }

    if (!dispatcher) {
      throw new JsonS3StorageConfigError("dispatcher is required");
    }

    this.config = config;
    this.client = buildS3ClientWithHttpClient(config, dispatcher) as S3Client &
      S3ClientInterface;

    logger.debug(
      `ClientAsyncWithHttpClient: opened connection ` +
        `endpoint=${config.endpointUrl}, ` +
        `region=${config.regionName}, ` +
        `bucket=${config.bucketName}`
    );
  }

  /** Destroy the S3Client and release resources. The Dispatcher is NOT closed. */
  destroy(): void {
    try {
      this.client.destroy();
      logger.debug("ClientAsyncWithHttpClient: closed connection");
    } catch {
      // ignore destroy errors
    }
  }

  /** Support for `await using handle = new ClientAsyncWithHttpClient(...)` */
  async [Symbol.asyncDispose](): Promise<void> {
    this.destroy();
  }
}

/**
 * Sync S3 client wrapper using an undici Dispatcher.
 *
 * In Node.js all S3 operations are async-native. This class is an alias
 * for ClientAsyncWithHttpClient, provided for polyglot API parity
 * with Python's ClientSyncWithHttpClient(config, httpx_client).
 *
 * @example
 * ```typescript
 * const handle = new ClientSyncWithHttpClient(config, dispatcher);
 * try {
 *   // still async under the hood — Node.js is async-native
 *   await handle.client.send(new GetObjectCommand({ ... }));
 * } finally {
 *   handle.destroy();
 * }
 * ```
 */
export class ClientSyncWithHttpClient extends ClientAsyncWithHttpClient {
  constructor(config: ClientConfig, dispatcher: Dispatcher) {
    super(config, dispatcher);
  }
}

/**
 * Create an S3Client from a ClientConfig using an undici Dispatcher.
 *
 * Convenience function wrapping ClientAsyncWithHttpClient.
 *
 * @param config - ClientConfig from getClientFactoryWithHttpClient
 * @param dispatcher - undici Dispatcher/Agent from fetch_client
 * @returns AsyncClientHandle with client, destroy, and config
 */
export function createAsyncClientWithHttpClient(
  config: ClientConfig,
  dispatcher: Dispatcher
): AsyncClientHandle {
  const handle = new ClientAsyncWithHttpClient(config, dispatcher);
  return {
    client: handle.client,
    destroy: () => handle.destroy(),
    config: handle.config,
  };
}

/**
 * Create an S3Client from a ClientConfig using an undici Dispatcher (sync alias).
 *
 * In Node.js, all S3 operations are async-native. This function is an alias
 * for createAsyncClientWithHttpClient, provided for polyglot API parity
 * with Python's ClientSyncWithHttpClient.
 *
 * @param config - ClientConfig from getClientFactoryWithHttpClient
 * @param dispatcher - undici Dispatcher/Agent from fetch_client
 * @returns AsyncClientHandle with client, destroy, and config
 */
export function createSyncClientWithHttpClient(
  config: ClientConfig,
  dispatcher: Dispatcher
): AsyncClientHandle {
  return createAsyncClientWithHttpClient(config, dispatcher);
}
