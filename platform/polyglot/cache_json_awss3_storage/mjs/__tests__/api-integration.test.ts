/**
 * Fastify Integration Tests for cache_json_awss3_storage.
 *
 * Tests cover:
 * - Fastify endpoint integration
 * - Plugin pattern and decoration
 * - Request lifecycle with storage
 * - Lifecycle hooks (onReady, onClose)
 */

import Fastify, { FastifyInstance, FastifyRequest } from "fastify";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NullLogger } from "../src/logger.js";
import { JsonS3Storage, createStorage } from "../src/storage.js";
import type { S3ClientInterface } from "../src/types.js";
import { createMockS3Client, createSampleEntry, createGetObjectResponse } from "./helpers.js";

// =============================================================================
// Type Augmentation for Fastify
// =============================================================================

declare module "fastify" {
  interface FastifyInstance {
    storage: JsonS3Storage;
  }
  interface FastifyRequest {
    storage: JsonS3Storage;
  }
}

// =============================================================================
// Test Server Setup
// =============================================================================

async function createTestServer(
  mockS3Client: S3ClientInterface
): Promise<FastifyInstance> {
  const server = Fastify({ logger: false });

  // Create storage instance
  const storage = createStorage({
    s3Client: mockS3Client,
    bucketName: "test-bucket",
    logger: new NullLogger(),
  });

  // Decorate server with storage
  server.decorate("storage", storage);

  // Decorate request with storage (per-request access pattern)
  server.decorateRequest("storage", null);
  server.addHook("preHandler", async (request: FastifyRequest) => {
    request.storage = server.storage;
  });

  // Health endpoint
  server.get("/health", async () => ({
    status: "ok",
    stats: server.storage.getStats(),
  }));

  // Cache endpoints
  server.post<{ Body: Record<string, unknown> }>("/cache", async (request) => {
    const key = await request.storage.save(request.body);
    return { key };
  });

  server.get<{ Params: { key: string } }>("/cache/:key", async (request, reply) => {
    const data = await request.storage.load(request.params.key);
    if (data === null) {
      reply.code(404);
      return { error: "Not found" };
    }
    return { data };
  });

  server.delete<{ Params: { key: string } }>("/cache/:key", async (request) => {
    await request.storage.delete(request.params.key);
    return { deleted: true };
  });

  server.get("/cache", async (request) => {
    const keys = await request.storage.listKeys();
    return { keys, count: keys.length };
  });

  // Lifecycle hooks
  server.addHook("onClose", async () => {
    await server.storage.close();
  });

  await server.ready();
  return server;
}

// =============================================================================
// Test Suite
// =============================================================================

describe("Fastify Integration", () => {
  let server: FastifyInstance;
  let mockS3Client: S3ClientInterface;

  beforeEach(async () => {
    mockS3Client = createMockS3Client();
    server = await createTestServer(mockS3Client);
  });

  afterEach(async () => {
    await server.close();
  });

  // ===========================================================================
  // Health Endpoint Tests
  // ===========================================================================

  describe("Health Endpoint", () => {
    it("should return 200 OK", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/health",
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().status).toBe("ok");
    });

    it("should include storage stats", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/health",
      });

      const body = response.json();
      expect(body.stats).toBeDefined();
      expect(body.stats.saves).toBe(0);
      expect(body.stats.loads).toBe(0);
    });
  });

  // ===========================================================================
  // Cache Endpoint Tests
  // ===========================================================================

  describe("Cache Endpoints", () => {
    it("should save data and return key", async () => {
      (mockS3Client.send as ReturnType<typeof vi.fn>).mockResolvedValue({
        ETag: '"abc123"',
      });

      const response = await server.inject({
        method: "POST",
        url: "/cache",
        payload: { user_id: 123, name: "Alice" },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.key).toBeDefined();
      expect(body.key).toHaveLength(16);
    });

    it("should list empty cache", async () => {
      (mockS3Client.send as ReturnType<typeof vi.fn>).mockResolvedValue({
        Contents: [],
        IsTruncated: false,
      });

      const response = await server.inject({
        method: "GET",
        url: "/cache",
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.keys).toEqual([]);
      expect(body.count).toBe(0);
    });

    it("should delete cached data", async () => {
      (mockS3Client.send as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const response = await server.inject({
        method: "DELETE",
        url: "/cache/test123",
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().deleted).toBe(true);
    });

    it("should return 404 for non-existent key", async () => {
      (mockS3Client.send as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("NoSuchKey")
      );

      const response = await server.inject({
        method: "GET",
        url: "/cache/nonexistent",
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().error).toBe("Not found");
    });

    it("should load existing data", async () => {
      const entry = createSampleEntry();
      (mockS3Client.send as ReturnType<typeof vi.fn>).mockResolvedValue(
        createGetObjectResponse(entry)
      );

      const response = await server.inject({
        method: "GET",
        url: "/cache/abc123",
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().data).toEqual(entry.data);
    });
  });

  // ===========================================================================
  // Server Decorator Tests
  // ===========================================================================

  describe("Server Decorators", () => {
    it("should decorate server with storage", () => {
      expect(server.storage).toBeDefined();
      expect(server.storage).toBeInstanceOf(JsonS3Storage);
    });

    it("should decorate request with storage", async () => {
      let capturedStorage: JsonS3Storage | null = null;

      server.get("/capture-storage", async (request) => {
        capturedStorage = request.storage;
        return { captured: true };
      });

      await server.inject({
        method: "GET",
        url: "/capture-storage",
      });

      expect(capturedStorage).toBeDefined();
      expect(capturedStorage).toBeInstanceOf(JsonS3Storage);
    });
  });

  // ===========================================================================
  // Lifecycle Hook Tests
  // ===========================================================================

  describe("Lifecycle Hooks", () => {
    it("should execute onReady hooks", async () => {
      let hookCalled = false;

      const testServer = Fastify({ logger: false });
      testServer.decorate(
        "storage",
        createStorage({
          s3Client: mockS3Client,
          bucketName: "test-bucket",
          logger: new NullLogger(),
        })
      );

      testServer.addHook("onReady", async () => {
        hookCalled = true;
      });

      await testServer.ready();

      expect(hookCalled).toBe(true);

      await testServer.close();
    });

    it("should execute onClose hooks", async () => {
      let shutdownCalled = false;

      const testServer = Fastify({ logger: false });
      const storage = createStorage({
        s3Client: mockS3Client,
        bucketName: "test-bucket",
        logger: new NullLogger(),
      });
      testServer.decorate("storage", storage);

      testServer.addHook("onClose", async () => {
        shutdownCalled = true;
        await storage.close();
      });

      await testServer.ready();
      await testServer.close();

      expect(shutdownCalled).toBe(true);
    });
  });

  // ===========================================================================
  // Request State Isolation Tests
  // ===========================================================================

  describe("Request State Isolation", () => {
    it("should handle concurrent requests", async () => {
      (mockS3Client.send as ReturnType<typeof vi.fn>).mockResolvedValue({
        ETag: '"abc123"',
      });

      // Make multiple concurrent requests
      const responses = await Promise.all([
        server.inject({
          method: "POST",
          url: "/cache",
          payload: { request: 1 },
        }),
        server.inject({
          method: "POST",
          url: "/cache",
          payload: { request: 2 },
        }),
        server.inject({
          method: "POST",
          url: "/cache",
          payload: { request: 3 },
        }),
      ]);

      // All should succeed
      for (const response of responses) {
        expect(response.statusCode).toBe(200);
        expect(response.json().key).toBeDefined();
      }
    });

    it("should maintain storage instance across requests", async () => {
      (mockS3Client.send as ReturnType<typeof vi.fn>).mockResolvedValue({
        ETag: '"abc123"',
      });

      // First request
      await server.inject({
        method: "POST",
        url: "/cache",
        payload: { test: 1 },
      });

      // Second request
      await server.inject({
        method: "POST",
        url: "/cache",
        payload: { test: 2 },
      });

      // Check stats reflect both saves
      const response = await server.inject({
        method: "GET",
        url: "/health",
      });

      expect(response.json().stats.saves).toBe(2);
    });
  });
});
