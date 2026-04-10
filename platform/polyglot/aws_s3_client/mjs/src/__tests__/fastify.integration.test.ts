/**
 * Fastify Integration Tests for AWS S3 Client.
 *
 * Tests cover:
 * - Fastify plugin registration
 * - Server decoration
 * - Lifecycle hooks
 * - Health check routes
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import Fastify, { type FastifyInstance } from "fastify";

import { fastifyS3Storage, createHealthRoute, createDebugRoute, registerDiagnosticRoutes } from "../adapters/fastify.js";
import { createLoggerSpy } from "./helpers.js";

// Mock the S3Client
vi.mock("@aws-sdk/client-s3", () => {
  return {
    S3Client: vi.fn().mockImplementation(() => ({
      send: vi.fn().mockImplementation(async (command) => {
        const commandName = command.constructor.name;

        if (commandName === "ListObjectsV2Command") {
          return { Contents: [], IsTruncated: false };
        }

        return {};
      }),
      destroy: vi.fn(),
    })),
    PutObjectCommand: vi.fn().mockImplementation((input) => ({ constructor: { name: "PutObjectCommand" }, input })),
    GetObjectCommand: vi.fn().mockImplementation((input) => ({ constructor: { name: "GetObjectCommand" }, input })),
    HeadObjectCommand: vi.fn().mockImplementation((input) => ({ constructor: { name: "HeadObjectCommand" }, input })),
    DeleteObjectCommand: vi.fn().mockImplementation((input) => ({ constructor: { name: "DeleteObjectCommand" }, input })),
    DeleteObjectsCommand: vi.fn().mockImplementation((input) => ({ constructor: { name: "DeleteObjectsCommand" }, input })),
    ListObjectsV2Command: vi.fn().mockImplementation((input) => ({ constructor: { name: "ListObjectsV2Command" }, input })),
  };
});

// Default test config with required fields
const testConfig = { bucketName: "test-bucket", region: "us-east-1" };

describe("Fastify S3 Storage Plugin", () => {
  let server: FastifyInstance;

  beforeEach(async () => {
    server = Fastify({ logger: false });
  });

  afterEach(async () => {
    await server.close();
  });

  // =====================================================================
  // Plugin Registration Tests
  // =====================================================================

  describe("Plugin Registration", () => {
    describe("Statement Coverage", () => {
      it("should register plugin successfully", async () => {
        await server.register(fastifyS3Storage, {
          config: testConfig,
        });

        await server.ready();

        expect(server.s3Storage).toBeDefined();
      });

      it("should decorate server with s3Storage", async () => {
        await server.register(fastifyS3Storage, {
          config: testConfig,
        });

        await server.ready();

        expect(typeof server.s3Storage).toBe("object");
        expect(typeof server.s3Storage.save).toBe("function");
        expect(typeof server.s3Storage.load).toBe("function");
      });
    });

    describe("Branch Coverage", () => {
      it("should use custom logger when provided", async () => {
        const { mockLogger, logs } = createLoggerSpy();

        await server.register(fastifyS3Storage, {
          config: testConfig,
          logger: mockLogger,
        });

        await server.ready();

        expect(logs.info.some((l) => l.msg.includes("registering plugin"))).toBe(true);
      });

      it("should use custom decorator name", async () => {
        await server.register(fastifyS3Storage, {
          config: testConfig,
          decoratorName: "customS3",
        });

        await server.ready();

        expect((server as any).customS3).toBeDefined();
      });
    });

    describe("Error Handling", () => {
      it("should throw for invalid config", async () => {
        await expect(
          server.register(fastifyS3Storage, {
            config: { bucketName: "", region: "us-east-1" },
          })
        ).rejects.toThrow("bucketName is required");
      });
    });
  });

  // =====================================================================
  // Lifecycle Hooks Tests
  // =====================================================================

  describe("Lifecycle Hooks", () => {
    describe("Statement Coverage", () => {
      it("should close SDK on server close", async () => {
        const { mockLogger, logs } = createLoggerSpy();

        await server.register(fastifyS3Storage, {
          config: testConfig,
          logger: mockLogger,
        });

        await server.ready();
        await server.close();

        expect(logs.info.some((l) => l.msg.includes("closing SDK"))).toBe(true);
      });
    });
  });

  // =====================================================================
  // Health Route Tests
  // =====================================================================

  describe("Health Route", () => {
    describe("Statement Coverage", () => {
      it("should create health route handler", async () => {
        await server.register(fastifyS3Storage, {
          config: testConfig,
        });

        await server.ready();

        const healthRoute = createHealthRoute(server.s3Storage, testConfig);

        expect(typeof healthRoute).toBe("function");
      });

      it("should return healthy status", async () => {
        await server.register(fastifyS3Storage, {
          config: testConfig,
        });

        await server.ready();

        const healthRoute = createHealthRoute(server.s3Storage, testConfig);
        const result = await healthRoute();

        expect(result.status).toBe("healthy");
        expect(result.bucket).toBe("test-bucket");
      });
    });
  });

  // =====================================================================
  // Debug Route Tests
  // =====================================================================

  describe("Debug Route", () => {
    describe("Statement Coverage", () => {
      it("should create debug route handler", async () => {
        await server.register(fastifyS3Storage, {
          config: testConfig,
        });

        await server.ready();

        const debugRoute = createDebugRoute(server.s3Storage);

        expect(typeof debugRoute).toBe("function");
      });

      it("should return debug info", async () => {
        await server.register(fastifyS3Storage, {
          config: testConfig,
        });

        await server.ready();

        const debugRoute = createDebugRoute(server.s3Storage);
        const result = await debugRoute();

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
      });
    });
  });

  // =====================================================================
  // Diagnostic Routes Tests
  // =====================================================================

  describe("Diagnostic Routes", () => {
    describe("Statement Coverage", () => {
      it("should register diagnostic routes with default prefix", async () => {
        await server.register(fastifyS3Storage, {
          config: testConfig,
        });

        await server.ready();

        registerDiagnosticRoutes(server, server.s3Storage, testConfig);

        // Use inject to test routes
        const healthResponse = await server.inject({
          method: "GET",
          url: "/s3/health",
        });

        expect(healthResponse.statusCode).toBe(200);
        const body = JSON.parse(healthResponse.body);
        expect(body.status).toBe("healthy");
      });

      it("should register diagnostic routes with custom prefix", async () => {
        await server.register(fastifyS3Storage, {
          config: testConfig,
        });

        await server.ready();

        registerDiagnosticRoutes(server, server.s3Storage, testConfig, { prefix: "/storage" });

        const healthResponse = await server.inject({
          method: "GET",
          url: "/storage/health",
        });

        expect(healthResponse.statusCode).toBe(200);
      });
    });
  });

  // =====================================================================
  // Full Integration Tests
  // =====================================================================

  describe("Full Integration", () => {
    it("should work in a complete server setup", async () => {
      await server.register(fastifyS3Storage, {
        config: testConfig,
      });

      // Add a test route that uses the SDK
      server.post("/save", async (request) => {
        const data = request.body as Record<string, unknown>;
        return server.s3Storage.save(data);
      });

      server.get("/load/:key", async (request) => {
        const { key } = request.params as { key: string };
        return server.s3Storage.load(key);
      });

      await server.ready();

      // Test save
      const saveResponse = await server.inject({
        method: "POST",
        url: "/save",
        payload: { user: "alice", score: 100 },
      });

      expect(saveResponse.statusCode).toBe(200);
      const saveBody = JSON.parse(saveResponse.body);
      expect(saveBody.success).toBe(true);
      expect(saveBody.key).toBeDefined();
    });

    it("should isolate requests properly", async () => {
      await server.register(fastifyS3Storage, {
        config: testConfig,
      });

      // Add a route that checks stats
      server.get("/stats", async () => {
        return server.s3Storage.stats();
      });

      await server.ready();

      // Make multiple concurrent requests
      const [response1, response2] = await Promise.all([
        server.inject({ method: "GET", url: "/stats" }),
        server.inject({ method: "GET", url: "/stats" }),
      ]);

      expect(response1.statusCode).toBe(200);
      expect(response2.statusCode).toBe(200);
    });
  });

  // =====================================================================
  // Decorator Tests
  // =====================================================================

  describe("Server Decorators", () => {
    it("should decorate server with SDK methods", async () => {
      await server.register(fastifyS3Storage, {
        config: testConfig,
      });

      await server.ready();

      expect(typeof server.s3Storage.save).toBe("function");
      expect(typeof server.s3Storage.load).toBe("function");
      expect(typeof server.s3Storage.delete).toBe("function");
      expect(typeof server.s3Storage.exists).toBe("function");
      expect(typeof server.s3Storage.listKeys).toBe("function");
      expect(typeof server.s3Storage.clear).toBe("function");
      expect(typeof server.s3Storage.stats).toBe("function");
      expect(typeof server.s3Storage.close).toBe("function");
    });
  });
});
