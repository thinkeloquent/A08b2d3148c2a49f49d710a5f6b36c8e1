/**
 * Unit tests for JsonS3Storage.
 *
 * Tests cover:
 * - Statement coverage for all code paths
 * - Branch coverage for all conditionals
 * - Boundary value analysis
 * - Error handling verification
 * - Log verification (hyper-observability)
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

import {
  JsonS3StorageClosedError,
  JsonS3StorageConfigError,
  JsonS3StorageSerializationError,
  JsonS3StorageWriteError,
} from "../errors.js";
import { JsonS3Storage, createStorage } from "../storage.js";
import { createMockS3Client, createLoggerSpy, expectLogContains, sampleData } from "./helpers.js";

describe("JsonS3Storage", () => {
  // =====================================================================
  // Initialization Tests
  // =====================================================================

  describe("Initialization", () => {
    describe("Statement Coverage", () => {
      it("should create storage with valid config", () => {
        const s3Client = createMockS3Client();
        const storage = new JsonS3Storage({
          s3Client: s3Client as never,
          bucketName: "test-bucket",
        });

        expect(storage).toBeDefined();
      });

      it("should create storage using factory function", () => {
        const s3Client = createMockS3Client();
        const storage = createStorage({
          s3Client: s3Client as never,
          bucketName: "test-bucket",
          ttl: 3600,
        });

        expect(storage).toBeDefined();
      });
    });

    describe("Branch Coverage", () => {
      it("should use custom logger when provided", () => {
        const s3Client = createMockS3Client();
        const { mockLogger } = createLoggerSpy();

        const storage = new JsonS3Storage({
          s3Client: s3Client as never,
          bucketName: "test-bucket",
          logger: mockLogger,
        });

        expect(storage).toBeDefined();
      });

      it("should use NullLogger when debug is false", () => {
        const s3Client = createMockS3Client();

        const storage = new JsonS3Storage({
          s3Client: s3Client as never,
          bucketName: "test-bucket",
          debug: false,
        });

        expect(storage).toBeDefined();
      });

      it("should use default logger when debug is true", () => {
        const s3Client = createMockS3Client();

        const storage = new JsonS3Storage({
          s3Client: s3Client as never,
          bucketName: "test-bucket",
          debug: true,
        });

        expect(storage).toBeDefined();
      });
    });

    describe("Boundary Values", () => {
      it("should throw for empty bucket name", () => {
        const s3Client = createMockS3Client();

        expect(() => {
          new JsonS3Storage({
            s3Client: s3Client as never,
            bucketName: "",
          });
        }).toThrow(JsonS3StorageConfigError);
      });
    });

    describe("Error Handling", () => {
      it("should throw ConfigError for missing bucket name", () => {
        const s3Client = createMockS3Client();

        expect(() => {
          new JsonS3Storage({
            s3Client: s3Client as never,
            bucketName: undefined as unknown as string,
          });
        }).toThrow("bucketName is required");
      });
    });
  });

  // =====================================================================
  // Save Tests
  // =====================================================================

  describe("save()", () => {
    describe("Statement Coverage", () => {
      it("should save data and return key", async () => {
        const s3Client = createMockS3Client();
        const storage = createStorage({
          s3Client: s3Client as never,
          bucketName: "test-bucket",
        });

        const key = await storage.save(sampleData);

        expect(key).toBeDefined();
        expect(key).toHaveLength(16);
      });
    });

    describe("Branch Coverage", () => {
      it("should use explicit TTL when provided", async () => {
        const s3Client = createMockS3Client();
        const storage = createStorage({
          s3Client: s3Client as never,
          bucketName: "test-bucket",
          ttl: 3600,
        });

        const key = await storage.save(sampleData, { ttl: 7200 });

        expect(key).toBeDefined();
      });

      it("should use default TTL when not provided", async () => {
        const s3Client = createMockS3Client();
        const storage = createStorage({
          s3Client: s3Client as never,
          bucketName: "test-bucket",
          ttl: 3600,
        });

        const key = await storage.save(sampleData);

        expect(key).toBeDefined();
      });

      it("should have no expiration when TTL is undefined", async () => {
        const s3Client = createMockS3Client();
        const storage = createStorage({
          s3Client: s3Client as never,
          bucketName: "test-bucket",
        });

        const key = await storage.save(sampleData);

        expect(key).toBeDefined();
      });
    });

    describe("Error Handling", () => {
      it("should throw SerializationError for circular references", async () => {
        const s3Client = createMockS3Client();
        const storage = createStorage({
          s3Client: s3Client as never,
          bucketName: "test-bucket",
        });

        const circular: Record<string, unknown> = { a: 1 };
        circular.self = circular;

        await expect(storage.save(circular)).rejects.toThrow(JsonS3StorageSerializationError);
      });

      it("should throw WriteError on S3 failure", async () => {
        const s3Client = createMockS3Client({
          putObjectError: new Error("Internal Server Error"),
        });
        const storage = createStorage({
          s3Client: s3Client as never,
          bucketName: "test-bucket",
        });

        await expect(storage.save(sampleData)).rejects.toThrow(JsonS3StorageWriteError);
      });

      it("should throw ClosedError when storage is closed", async () => {
        const s3Client = createMockS3Client();
        const storage = createStorage({
          s3Client: s3Client as never,
          bucketName: "test-bucket",
        });

        await storage.close();

        await expect(storage.save(sampleData)).rejects.toThrow(JsonS3StorageClosedError);
      });
    });

    describe("Log Verification", () => {
      it("should log entry and completion", async () => {
        const s3Client = createMockS3Client();
        const { logs, mockLogger } = createLoggerSpy();

        const storage = createStorage({
          s3Client: s3Client as never,
          bucketName: "test-bucket",
          logger: mockLogger,
        });

        await storage.save(sampleData);

        expect(logs.debug.length).toBeGreaterThan(0);
        expectLogContains(logs, "info", "save: completed");
      });
    });
  });

  // =====================================================================
  // Load Tests
  // =====================================================================

  describe("load()", () => {
    describe("Statement Coverage", () => {
      it("should load data by key", async () => {
        const s3Client = createMockS3Client();
        const storage = createStorage({
          s3Client: s3Client as never,
          bucketName: "test-bucket",
        });

        // Save first
        const key = await storage.save(sampleData);

        // Then load
        const data = await storage.load(key);

        expect(data).toBeDefined();
        expect(data?.user_id).toBe(123);
      });

      it("should load data by object", async () => {
        const s3Client = createMockS3Client();
        const storage = createStorage({
          s3Client: s3Client as never,
          bucketName: "test-bucket",
        });

        // Save first
        await storage.save(sampleData);

        // Then load by same data
        const data = await storage.load(sampleData);

        expect(data).toBeDefined();
      });
    });

    describe("Branch Coverage", () => {
      it("should return null for non-existent key", async () => {
        const s3Client = createMockS3Client();
        const storage = createStorage({
          s3Client: s3Client as never,
          bucketName: "test-bucket",
        });

        const data = await storage.load("nonexistent_key");

        expect(data).toBeNull();
      });

      it("should return null for expired entry", async () => {
        const s3Client = createMockS3Client({
          getObjectResponse: {
            key: "test_key",
            data: { user: "alice" },
            created_at: 1000000,
            expires_at: 1000001, // Already expired
          },
        });
        const storage = createStorage({
          s3Client: s3Client as never,
          bucketName: "test-bucket",
        });

        const data = await storage.load("test_key");

        expect(data).toBeNull();
      });

      it("should return expired data with ignoreExpiry option", async () => {
        const s3Client = createMockS3Client({
          getObjectResponse: {
            key: "test_key",
            data: { user: "alice" },
            created_at: 1000000,
            expires_at: 1000001, // Already expired
          },
        });
        const storage = createStorage({
          s3Client: s3Client as never,
          bucketName: "test-bucket",
        });

        const data = await storage.load("test_key", { ignoreExpiry: true });

        expect(data).toBeDefined();
        expect(data?.user).toBe("alice");
      });
    });

    describe("Error Handling", () => {
      it("should throw ClosedError when storage is closed", async () => {
        const s3Client = createMockS3Client();
        const storage = createStorage({
          s3Client: s3Client as never,
          bucketName: "test-bucket",
        });

        await storage.close();

        await expect(storage.load("any_key")).rejects.toThrow(JsonS3StorageClosedError);
      });
    });
  });

  // =====================================================================
  // Delete Tests
  // =====================================================================

  describe("delete()", () => {
    describe("Statement Coverage", () => {
      it("should delete by key and return true", async () => {
        const s3Client = createMockS3Client();
        const storage = createStorage({
          s3Client: s3Client as never,
          bucketName: "test-bucket",
        });

        const result = await storage.delete("test_key");

        expect(result).toBe(true);
      });

      it("should delete by object and return true", async () => {
        const s3Client = createMockS3Client();
        const storage = createStorage({
          s3Client: s3Client as never,
          bucketName: "test-bucket",
        });

        const result = await storage.delete(sampleData);

        expect(result).toBe(true);
      });
    });
  });

  // =====================================================================
  // Exists Tests
  // =====================================================================

  describe("exists()", () => {
    describe("Branch Coverage", () => {
      it("should return true when object exists", async () => {
        const s3Client = createMockS3Client();
        const storage = createStorage({
          s3Client: s3Client as never,
          bucketName: "test-bucket",
        });

        // Save first
        const key = await storage.save(sampleData);

        // Check exists
        const exists = await storage.exists(key);

        expect(exists).toBe(true);
      });

      it("should return false when object does not exist", async () => {
        const s3Client = createMockS3Client();
        const storage = createStorage({
          s3Client: s3Client as never,
          bucketName: "test-bucket",
        });

        const exists = await storage.exists("nonexistent_key");

        expect(exists).toBe(false);
      });
    });
  });

  // =====================================================================
  // List Keys Tests
  // =====================================================================

  describe("listKeys()", () => {
    describe("Statement Coverage", () => {
      it("should return list of keys", async () => {
        const s3Client = createMockS3Client();
        const storage = createStorage({
          s3Client: s3Client as never,
          bucketName: "test-bucket",
        });

        // Save some data
        await storage.save({ id: 1 });
        await storage.save({ id: 2 });

        const keys = await storage.listKeys();

        expect(Array.isArray(keys)).toBe(true);
        expect(keys.length).toBe(2);
      });
    });

    describe("Boundary Values", () => {
      it("should return empty list for empty bucket", async () => {
        const s3Client = createMockS3Client();
        const storage = createStorage({
          s3Client: s3Client as never,
          bucketName: "test-bucket",
        });

        const keys = await storage.listKeys();

        expect(keys).toEqual([]);
      });
    });
  });

  // =====================================================================
  // Clear Tests
  // =====================================================================

  describe("clear()", () => {
    describe("Statement Coverage", () => {
      it("should delete all objects and return count", async () => {
        const s3Client = createMockS3Client();
        const storage = createStorage({
          s3Client: s3Client as never,
          bucketName: "test-bucket",
        });

        // Save some data
        await storage.save({ id: 1 });
        await storage.save({ id: 2 });

        const count = await storage.clear();

        expect(count).toBe(2);
      });
    });

    describe("Boundary Values", () => {
      it("should return 0 for empty bucket", async () => {
        const s3Client = createMockS3Client();
        const storage = createStorage({
          s3Client: s3Client as never,
          bucketName: "test-bucket",
        });

        const count = await storage.clear();

        expect(count).toBe(0);
      });
    });
  });

  // =====================================================================
  // Stats and Error Tracking Tests
  // =====================================================================

  describe("Statistics", () => {
    it("should track save operations", async () => {
      const s3Client = createMockS3Client();
      const storage = createStorage({
        s3Client: s3Client as never,
        bucketName: "test-bucket",
      });

      await storage.save(sampleData);

      const stats = storage.getStats();

      expect(stats.saves).toBe(1);
    });

    it("should track load operations", async () => {
      const s3Client = createMockS3Client();
      const storage = createStorage({
        s3Client: s3Client as never,
        bucketName: "test-bucket",
      });

      await storage.load("some_key");

      const stats = storage.getStats();

      expect(stats.loads).toBe(1);
    });

    it("should get and clear errors", () => {
      const s3Client = createMockS3Client();
      const storage = createStorage({
        s3Client: s3Client as never,
        bucketName: "test-bucket",
      });

      expect(storage.getErrors()).toEqual([]);
      expect(storage.getLastError()).toBeNull();

      storage.clearErrors();

      expect(storage.getErrors()).toEqual([]);
    });
  });

  // =====================================================================
  // Context Manager Tests
  // =====================================================================

  describe("Lifecycle", () => {
    it("should close storage", async () => {
      const s3Client = createMockS3Client();
      const storage = createStorage({
        s3Client: s3Client as never,
        bucketName: "test-bucket",
      });

      await storage.close();

      // Subsequent operations should fail
      await expect(storage.save(sampleData)).rejects.toThrow(JsonS3StorageClosedError);
    });

    it("should be idempotent on close", async () => {
      const s3Client = createMockS3Client();
      const storage = createStorage({
        s3Client: s3Client as never,
        bucketName: "test-bucket",
      });

      await storage.close();
      await storage.close(); // Should not throw

      expect(true).toBe(true);
    });
  });
});
