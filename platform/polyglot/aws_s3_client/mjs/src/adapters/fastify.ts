/**
 * Fastify Adapter for AWS S3 Client
 *
 * Provides Fastify plugin integration with decorator and lifecycle hooks.
 */

import type { FastifyInstance, FastifyPluginAsync } from "fastify";

import { type SDKConfig, assertValidConfig } from "../config.js";
import { type Logger, create as createLogger } from "../logger.js";
import { type SDKResponse, S3StorageSDK, createSDK } from "../sdk.js";

const logger = createLogger("aws_s3_client.fastify", import.meta.url);

/**
 * Options for the Fastify S3 storage plugin.
 */
export interface FastifyS3StorageOptions {
  /** SDK configuration */
  config: SDKConfig;
  /** Custom logger instance */
  logger?: Logger;
  /** Decorator name (default: "s3Storage") */
  decoratorName?: string;
}

/**
 * Declare Fastify instance augmentation.
 */
declare module "fastify" {
  interface FastifyInstance {
    s3Storage: S3StorageSDK;
  }
}

/**
 * Fastify plugin for S3 storage integration.
 *
 * @example
 * ```typescript
 * import Fastify from "fastify";
 * import { fastifyS3Storage } from "aws-s3-client/adapters/fastify";
 *
 * const app = Fastify();
 *
 * await app.register(fastifyS3Storage, {
 *   config: { bucketName: "my-bucket" },
 * });
 *
 * app.post("/save", async (request, reply) => {
 *   const response = await app.s3Storage.save(request.body);
 *   return response;
 * });
 * ```
 */
export const fastifyS3Storage: FastifyPluginAsync<FastifyS3StorageOptions> = async (
  fastify: FastifyInstance,
  options: FastifyS3StorageOptions
) => {
  const { config, logger: customLogger, decoratorName = "s3Storage" } = options;

  const log = customLogger ?? logger;

  // Validate configuration
  assertValidConfig(config);

  log.info(`fastifyS3Storage: registering plugin for bucket=${config.bucketName}`);

  // Create SDK instance
  const sdk = createSDK(config, { logger: log });

  // Decorate fastify instance
  fastify.decorate(decoratorName, sdk);

  // Register close hook for cleanup
  fastify.addHook("onClose", async () => {
    log.info("fastifyS3Storage: closing SDK on server shutdown");
    await sdk.close();
  });

  log.info("fastifyS3Storage: plugin registered successfully");
};

/**
 * Create a health check route handler.
 */
export function createHealthRoute(
  sdk: S3StorageSDK,
  config: SDKConfig
): () => Promise<Record<string, unknown>> {
  return async (): Promise<Record<string, unknown>> => {
    try {
      const response = await sdk.stats();
      return {
        status: "healthy",
        bucket: config.bucketName,
        stats: response.data,
      };
    } catch (e) {
      const error = e as Error;
      return {
        status: "unhealthy",
        error: error.message,
      };
    }
  };
}

/**
 * Create a debug info route handler.
 */
export function createDebugRoute(
  sdk: S3StorageSDK
): () => Promise<SDKResponse<Record<string, unknown>>> {
  return async (): Promise<SDKResponse<Record<string, unknown>>> => {
    return sdk.debugInfo();
  };
}

/**
 * Register health and debug routes on a Fastify instance.
 */
export function registerDiagnosticRoutes(
  fastify: FastifyInstance,
  sdk: S3StorageSDK,
  config: SDKConfig,
  options?: { prefix?: string }
): void {
  const prefix = options?.prefix ?? "/s3";

  fastify.get(`${prefix}/health`, createHealthRoute(sdk, config));
  fastify.get(`${prefix}/debug`, createDebugRoute(sdk));
}

export default fastifyS3Storage;
