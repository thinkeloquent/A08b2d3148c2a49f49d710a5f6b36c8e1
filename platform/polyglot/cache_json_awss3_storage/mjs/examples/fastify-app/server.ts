/**
 * Fastify Integration Example for cache_json_awss3_storage
 *
 * This example demonstrates:
 * - Fastify plugin pattern for storage integration
 * - Server decoration with storage instance
 * - Request decoration for per-request access
 * - CRUD endpoints for cached data
 * - Lifecycle hooks for startup/shutdown
 *
 * Prerequisites:
 *   npm install cache_json_awss3_storage @aws-sdk/client-s3 fastify fastify-plugin
 *
 * The @aws-sdk/client-s3 package is a peer dependency - you must install it
 * separately and pass your own S3Client instance to createStorage().
 *
 * Run with:
 *     npx tsx server.ts
 *
 * Or with the parent Makefile:
 *     make dev
 */

import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import { S3Client } from "@aws-sdk/client-s3";
import {
  JsonS3Storage,
  createLogger,
  createStorage,
  generateKey,
} from "../../src/index.js";

// =============================================================================
// Type Augmentation
// =============================================================================

declare module "fastify" {
  interface FastifyInstance {
    storage: JsonS3Storage;
    config: AppConfig;
  }
  interface FastifyRequest {
    storage: JsonS3Storage;
  }
}

// =============================================================================
// Configuration
// =============================================================================

interface AppConfig {
  bucketName: string;
  keyPrefix: string;
  ttl: number;
  region: string;
  port: number;
  host: string;
}

const config: AppConfig = {
  bucketName: "cache-demo-bucket",
  keyPrefix: "fastify:",
  ttl: 3600, // 1 hour default TTL
  region: "us-east-1",
  port: 3000,
  host: "0.0.0.0",
};

// Create logger
const logger = createLogger("fastify_app", import.meta.url);

// =============================================================================
// Mock S3 Client (for demo)
// =============================================================================

interface MockS3Client {
  send: (command: unknown) => Promise<unknown>;
}

function createMockS3Client(): MockS3Client {
  const storage = new Map<string, string>();

  return {
    send: async (command: unknown): Promise<unknown> => {
      const cmd = command as { input: Record<string, unknown> };
      const commandName = (command as { constructor: { name: string } })
        .constructor.name;

      switch (commandName) {
        case "PutObjectCommand": {
          const key = cmd.input.Key as string;
          const body = cmd.input.Body as string;
          storage.set(key, body);
          return { ETag: '"mock-etag"' };
        }

        case "GetObjectCommand": {
          const key = cmd.input.Key as string;
          const body = storage.get(key);
          if (!body) {
            throw new Error("NoSuchKey: Key not found");
          }
          return {
            Body: {
              transformToString: () => Promise.resolve(body),
            },
          };
        }

        case "DeleteObjectCommand": {
          const key = cmd.input.Key as string;
          storage.delete(key);
          return {};
        }

        case "HeadObjectCommand": {
          const key = cmd.input.Key as string;
          if (!storage.has(key)) {
            throw new Error("404 Not Found");
          }
          return {};
        }

        case "ListObjectsV2Command": {
          const prefix = (cmd.input.Prefix as string) || "";
          const keys = Array.from(storage.keys()).filter((k) =>
            k.startsWith(prefix)
          );
          return {
            Contents: keys.map((key) => ({ Key: key })),
            IsTruncated: false,
          };
        }

        case "DeleteObjectsCommand": {
          const objects = (
            cmd.input.Delete as { Objects: Array<{ Key: string }> }
          ).Objects;
          for (const obj of objects) {
            storage.delete(obj.Key);
          }
          return { Deleted: objects };
        }

        default:
          return {};
      }
    },
  } as unknown as MockS3Client;
}

// =============================================================================
// Storage Plugin
// =============================================================================

/**
 * Fastify plugin for cache_json_awss3_storage integration.
 *
 * Decorates:
 * - fastify.storage - Storage instance
 * - fastify.config - Application config
 * - request.storage - Per-request storage access
 */
const storagePlugin = fp(
  async (fastify: FastifyInstance, opts: { config: AppConfig }) => {
    const { config } = opts;

    logger.info("Initializing storage plugin...");

    // In production, use real S3 client:
    // const s3Client = new S3Client({ region: config.region });

    // For demo, use mock client
    const s3Client = createMockS3Client();

    // Create storage instance
    const storage = createStorage({
      s3Client: s3Client as unknown as S3Client,
      bucketName: config.bucketName,
      keyPrefix: config.keyPrefix,
      ttl: config.ttl,
      debug: true,
      logger,
    });

    // Decorate fastify instance
    fastify.decorate("storage", storage);
    fastify.decorate("config", config);

    // Decorate request with storage
    fastify.decorateRequest("storage", null);
    fastify.addHook("preHandler", async (request: FastifyRequest) => {
      request.storage = fastify.storage;
    });

    // Cleanup on close
    fastify.addHook("onClose", async () => {
      logger.info("Closing storage...");
      await storage.close();
      logger.info("Storage closed");
    });

    logger.info(
      `Storage plugin initialized: bucket=${config.bucketName}, prefix=${config.keyPrefix}`
    );
  },
  {
    name: "cache-storage",
  }
);

// =============================================================================
// Route Schemas
// =============================================================================

const healthSchema = {
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "string" },
        storage_stats: {
          type: "object",
          properties: {
            saves: { type: "number" },
            loads: { type: "number" },
            hits: { type: "number" },
            misses: { type: "number" },
            deletes: { type: "number" },
            errors: { type: "number" },
          },
        },
        object_count: { type: "number" },
      },
    },
  },
};

const cachePostSchema = {
  body: {
    type: "object",
    required: ["data"],
    properties: {
      key: { type: "string" },  // Optional custom key
      data: { type: "object" },
      ttl: { type: "number" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        key: { type: "string" },
        message: { type: "string" },
      },
    },
  },
};

// =============================================================================
// Server Setup
// =============================================================================

async function buildServer(): Promise<FastifyInstance> {
  const server = Fastify({
    logger: {
      level: "info",
    },
  });

  // Register storage plugin
  await server.register(storagePlugin, { config });

  // Health endpoint
  server.get("/health", { schema: healthSchema }, async (request) => {
    const stats = request.storage.getStats();
    const keys = await request.storage.listKeys();

    return {
      status: "ok",
      storage_stats: stats,
      object_count: keys.length,
    };
  });

  // Cache POST - save data
  server.post<{
    Body: { key?: string; data: Record<string, unknown>; ttl?: number };
  }>("/cache", { schema: cachePostSchema }, async (request) => {
    const { key: customKey, data, ttl } = request.body;

    // Use provided key or generate from data
    const key = customKey || generateKey(data);
    await request.storage.save(key, data, ttl ? { ttl } : undefined);

    logger.info(`Cached data with key: ${key}`);
    return { key, message: "Data cached successfully" };
  });

  // Cache GET by key
  server.get<{
    Params: { key: string };
  }>("/cache/:key", async (request, reply) => {
    const { key } = request.params;
    const data = await request.storage.load(key);

    if (data === null) {
      logger.info(`Cache miss for key: ${key}`);
      reply.code(404);
      return { error: "Key not found or expired" };
    }

    logger.info(`Cache hit for key: ${key}`);
    return { key, data };
  });

  // Cache DELETE by key
  server.delete<{
    Params: { key: string };
  }>("/cache/:key", async (request) => {
    const { key } = request.params;
    await request.storage.delete(key);

    logger.info(`Deleted cache key: ${key}`);
    return { key, message: "Data deleted successfully" };
  });

  // Cache GET all keys
  server.get("/cache", async (request) => {
    const keys = await request.storage.listKeys();
    return { keys, count: keys.length };
  });

  // Cache DELETE all (clear)
  server.delete("/cache", async (request) => {
    const count = await request.storage.clear();
    logger.warn(`Cleared ${count} items from cache`);
    return { message: `Cleared ${count} items` };
  });

  return server;
}

// =============================================================================
// Main Entry Point
// =============================================================================

async function main(): Promise<void> {
  const server = await buildServer();

  try {
    const address = await server.listen({
      port: config.port,
      host: config.host,
    });

    console.log(`
╔══════════════════════════════════════════════════════════════╗
║     cache_json_awss3_storage - Fastify Demo Server           ║
╠══════════════════════════════════════════════════════════════╣
║  Server running at: ${address.padEnd(40)}║
║                                                              ║
║  Endpoints:                                                  ║
║    GET    /health       - Health check with stats            ║
║    POST   /cache        - Cache JSON data                    ║
║    GET    /cache/:key   - Get cached data                    ║
║    DELETE /cache/:key   - Delete cached data                 ║
║    GET    /cache        - List all keys                      ║
║    DELETE /cache        - Clear all cached data              ║
╚══════════════════════════════════════════════════════════════╝
    `);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }

  // Graceful shutdown
  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\nReceived ${signal}, shutting down gracefully...`);
    await server.close();
    console.log("Server closed");
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch(console.error);
