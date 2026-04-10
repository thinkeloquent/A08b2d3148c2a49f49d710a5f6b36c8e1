#!/usr/bin/env npx tsx
/**
 * AWS S3 Client - Fastify Integration Example
 *
 * Demonstrates Fastify integration patterns:
 * - Plugin registration for SDK initialization
 * - Decorator access for SDK usage
 * - Health check and debug routes
 * - CRUD endpoints for S3 storage
 */

import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import {
  type SDKConfig,
  createSDK,
  fastifyS3Storage,
  createHealthRoute,
  createDebugRoute,
  registerDiagnosticRoutes,
} from "../../src/index.js";

// =============================================================================
// Configuration
// =============================================================================

const config: SDKConfig = {
  bucketName: process.env.AWS_S3_BUCKET ?? "example-bucket",
  region: process.env.AWS_REGION ?? "us-east-1",
  endpointUrl: process.env.AWS_ENDPOINT_URL, // For LocalStack
  keyPrefix: "fastify-example:",
  ttl: 3600, // 1 hour default TTL
  debug: true,
};

// =============================================================================
// Request/Response Types
// =============================================================================

interface SaveBody {
  data: Record<string, unknown>;
  ttl?: number;
}

interface SaveResponse {
  success: boolean;
  key: string | null;
  elapsedMs: number;
}

interface LoadResponse {
  success: boolean;
  data: Record<string, unknown> | null;
  elapsedMs: number;
}

interface ExistsResponse {
  exists: boolean;
  elapsedMs: number;
}

interface DeleteResponse {
  success: boolean;
  elapsedMs: number;
}

interface ListKeysResponse {
  keys: string[];
  count: number;
  elapsedMs: number;
}

interface KeyParams {
  key: string;
}

interface UserQuery {
  user_id: number;
  name: string;
  email: string;
}

interface SessionQuery {
  user_id: number;
  ttl?: number;
}

// =============================================================================
// Fastify Application
// =============================================================================

async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true,
  });

  // Register S3 storage plugin
  await app.register(fastifyS3Storage, { config });

  // Register diagnostic routes (health and debug)
  registerDiagnosticRoutes(app, app.s3Storage, config);

  // =============================================================================
  // Storage CRUD Endpoints
  // =============================================================================

  /**
   * Save JSON data to S3.
   * Returns a unique storage key that can be used to retrieve the data.
   */
  app.post<{ Body: SaveBody }>("/storage/save", async (request, reply) => {
    const { data, ttl } = request.body;
    const response = await app.s3Storage.save(data, { ttl });

    if (!response.success) {
      reply.status(500);
      return { error: response.error };
    }

    const result: SaveResponse = {
      success: true,
      key: response.key ?? null,
      elapsedMs: response.elapsedMs,
    };
    return result;
  });

  /**
   * Load JSON data from S3 by key.
   * Returns the stored data or null if not found/expired.
   */
  app.get<{ Params: KeyParams }>("/storage/load/:key", async (request, reply) => {
    const { key } = request.params;
    const response = await app.s3Storage.load(key);

    if (!response.success) {
      reply.status(500);
      return { error: response.error };
    }

    const result: LoadResponse = {
      success: true,
      data: response.data ?? null,
      elapsedMs: response.elapsedMs,
    };
    return result;
  });

  /**
   * Check if data exists for a key.
   * Uses HEAD request for efficiency (no body download).
   */
  app.get<{ Params: KeyParams }>("/storage/exists/:key", async (request, reply) => {
    const { key } = request.params;
    const response = await app.s3Storage.exists(key);

    if (!response.success) {
      reply.status(500);
      return { error: response.error };
    }

    const result: ExistsResponse = {
      exists: response.data ?? false,
      elapsedMs: response.elapsedMs,
    };
    return result;
  });

  /**
   * Delete data from S3 by key.
   * This operation is idempotent - it succeeds even if the key doesn't exist.
   */
  app.delete<{ Params: KeyParams }>("/storage/delete/:key", async (request, reply) => {
    const { key } = request.params;
    const response = await app.s3Storage.delete(key);

    if (!response.success) {
      reply.status(500);
      return { error: response.error };
    }

    const result: DeleteResponse = {
      success: true,
      elapsedMs: response.elapsedMs,
    };
    return result;
  });

  /**
   * List all storage keys.
   * Returns all keys stored with the configured prefix.
   */
  app.get("/storage/keys", async (request, reply) => {
    const response = await app.s3Storage.listKeys();

    if (!response.success) {
      reply.status(500);
      return { error: response.error };
    }

    const keys = response.data ?? [];
    const result: ListKeysResponse = {
      keys,
      count: keys.length,
      elapsedMs: response.elapsedMs,
    };
    return result;
  });

  /**
   * Get operation statistics.
   * Returns counts of saves, loads, hits, misses, deletes, and errors.
   */
  app.get("/storage/stats", async (request, reply) => {
    const response = await app.s3Storage.stats();

    if (!response.success) {
      reply.status(500);
      return { error: response.error };
    }

    return {
      stats: response.data,
      elapsedMs: response.elapsedMs,
    };
  });

  // =============================================================================
  // Example Endpoints
  // =============================================================================

  /**
   * Example: Save a user record.
   * Demonstrates a typical use case with structured data.
   */
  app.post<{ Querystring: UserQuery }>("/example/user", async (request, reply) => {
    const { user_id, name, email } = request.query;

    const userData = {
      user_id,
      name,
      email,
      type: "user",
    };

    const response = await app.s3Storage.save(userData);

    return {
      message: "User saved",
      key: response.key,
      user: userData,
    };
  });

  /**
   * Example: Create a session with custom TTL.
   * Demonstrates TTL usage for temporary data.
   */
  app.post<{ Querystring: SessionQuery }>("/example/session", async (request, reply) => {
    const { user_id, ttl = 3600 } = request.query;

    const sessionData = {
      user_id,
      created_at: Date.now() / 1000,
      type: "session",
    };

    const response = await app.s3Storage.save(sessionData, { ttl });

    return {
      message: `Session created with ${ttl}s TTL`,
      session_key: response.key,
    };
  });

  return app;
}

// =============================================================================
// Main Entry Point
// =============================================================================

async function main(): Promise<void> {
  console.log("Starting Fastify example server...");
  console.log(`Bucket: ${config.bucketName}`);
  console.log(`Region: ${config.region}`);
  console.log(`Endpoint: ${config.endpointUrl ?? "AWS Default"}`);

  const app = await buildApp();

  try {
    await app.listen({ host: "0.0.0.0", port: 8000 });
    console.log("Server listening on http://0.0.0.0:8000");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main().catch(console.error);
