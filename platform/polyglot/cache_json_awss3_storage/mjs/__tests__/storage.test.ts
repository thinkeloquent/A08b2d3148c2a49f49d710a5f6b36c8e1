/**
 * Unit tests for storage module.
 *
 * Tests cover:
 * - Statement coverage for all code paths
 * - Branch coverage for all conditionals
 * - Boundary value analysis
 * - Error handling verification
 * - Log verification (hyper-observability)
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  JsonS3StorageClosedError,
  JsonS3StorageConfigError,
} from "../src/errors.js";
import { NullLogger } from "../src/logger.js";
import { JsonS3Storage, createStorage } from "../src/storage.js";
import type { S3ClientInterface, StorageEntry } from "../src/types.js";
import {
  createExpiredEntry,
  createGetObjectResponse,
  createLoggerSpy,
  createMockS3Client,
  createSampleEntry,
  expectLogContains,
  sampleData,
} from "./helpers.js";

describe("JsonS3Storage", () => {
  let mockS3Client: S3ClientInterface;
  let nullLogger: NullLogger;

  beforeEach(() => {
    mockS3Client = createMockS3Client();
    nullLogger = new NullLogger();
  });

  // ===========================================================================
  // Constructor Tests
  // ===========================================================================

  describe("constructor", () => {
    describe("Statement Coverage", () => {
      it("creates instance with required params", () => {
        const storage = new JsonS3Storage({
          s3Client: mockS3Client,
          bucketName: "test-bucket",
          logger: nullLogger,
        });

        expect(storage).toBeDefined();
        expect(storage.getStats().saves).toBe(0);
      });

      it("accepts all optional params", () => {
        const storage = new JsonS3Storage({
          s3Client: mockS3Client,
          bucketName: "test-bucket",
          keyPrefix: "custom:",
          hashKeys: ["user_id"],
          ttl: 3600,
          region: "us-west-2",
          debug: true,
          maxErrorHistory: 50,
          logger: nullLogger,
        });

        expect(storage).toBeDefined();
      });
    });

    describe("Branch Coverage", () => {
      it("requires bucketName", () => {
        expect(
          () =>
            new JsonS3Storage({
              s3Client: mockS3Client,
              bucketName: "",
            })
        ).toThrow(JsonS3StorageConfigError);
      });

      it("accepts custom logger", () => {
        const { mockLogger } = createLoggerSpy();

        const storage = new JsonS3Storage({
          s3Client: mockS3Client,
          bucketName: "test-bucket",
          logger: mockLogger,
        });

        expect(storage).toBeDefined();
      });
    });
  });

  // ===========================================================================
  // Save Operation Tests
  // ===========================================================================

  describe("save", () => {
    describe("Statement Coverage", () => {
      it("returns generated key", async () => {
        (mockS3Client.send as ReturnType<typeof vi.fn>).mockResolvedValue({
          ETag: '"abc123"',
        });

        const storage = new JsonS3Storage({
          s3Client: mockS3Client,
          bucketName: "test-bucket",
          keyPrefix: "test:",
          logger: nullLogger,
        });

        const key = await storage.save(sampleData);

        expect(key).toHaveLength(16);
        expect(/^[a-f0-9]+$/.test(key)).toBe(true);
      });

      it("increments save stats", async () => {
        (mockS3Client.send as ReturnType<typeof vi.fn>).mockResolvedValue({});

        const storage = new JsonS3Storage({
          s3Client: mockS3Client,
          bucketName: "test-bucket",
          logger: nullLogger,
        });

        expect(storage.getStats().saves).toBe(0);
        await storage.save({ test: "data" });
        expect(storage.getStats().saves).toBe(1);
      });

      it("calls S3 putObject", async () => {
        (mockS3Client.send as ReturnType<typeof vi.fn>).mockResolvedValue({});

        const storage = new JsonS3Storage({
          s3Client: mockS3Client,
          bucketName: "test-bucket",
          logger: nullLogger,
        });

        await storage.save({ test: "data" });

        expect(mockS3Client.send).toHaveBeenCalled();
      });
    });

    describe("Branch Coverage", () => {
      it("saves with TTL", async () => {
        (mockS3Client.send as ReturnType<typeof vi.fn>).mockResolvedValue({});

        const storage = new JsonS3Storage({
          s3Client: mockS3Client,
          bucketName: "test-bucket",
          logger: nullLogger,
        });

        await storage.save({ test: "data" }, { ttl: 3600 });

        const call = (mockS3Client.send as ReturnType<typeof vi.fn>).mock
          .calls[0]![0];
        const body = JSON.parse(call.input.Body as string) as StorageEntry;
        expect(body.expires_at).not.toBeNull();
      });

      it("saves without TTL", async () => {
        (mockS3Client.send as ReturnType<typeof vi.fn>).mockResolvedValue({});

        const storage = new JsonS3Storage({
          s3Client: mockS3Client,
          bucketName: "test-bucket",
          logger: nullLogger,
        });

        await storage.save({ test: "data" });

        const call = (mockS3Client.send as ReturnType<typeof vi.fn>).mock
          .calls[0]![0];
        const body = JSON.parse(call.input.Body as string) as StorageEntry;
        expect(body.expires_at).toBeNull();
      });

      it("uses default TTL from constructor", async () => {
        (mockS3Client.send as ReturnType<typeof vi.fn>).mockResolvedValue({});

        const storage = new JsonS3Storage({
          s3Client: mockS3Client,
          bucketName: "test-bucket",
          ttl: 1800,
          logger: nullLogger,
        });

        await storage.save({ test: "data" });

        const call = (mockS3Client.send as ReturnType<typeof vi.fn>).mock
          .calls[0]![0];
        const body = JSON.parse(call.input.Body as string) as StorageEntry;
        expect(body.expires_at).not.toBeNull();
      });
    });

    describe("Error Handling", () => {
      it("throws after close", async () => {
        const storage = new JsonS3Storage({
          s3Client: mockS3Client,
          bucketName: "test-bucket",
          logger: nullLogger,
        });

        await storage.close();

        await expect(storage.save({ test: "data" })).rejects.toThrow(
          JsonS3StorageClosedError
        );
      });

      it("records error on failure", async () => {
        (mockS3Client.send as ReturnType<typeof vi.fn>).mockRejectedValue(
          new Error("Connection refused")
        );

        const storage = new JsonS3Storage({
          s3Client: mockS3Client,
          bucketName: "test-bucket",
          logger: nullLogger,
        });

        await expect(storage.save({ test: "data" })).rejects.toThrow();
        expect(storage.getStats().errors).toBeGreaterThanOrEqual(1);
      });
    });

    describe("Log Verification", () => {
      it("logs entry and completion", async () => {
        (mockS3Client.send as ReturnType<typeof vi.fn>).mockResolvedValue({});
        const { logs, mockLogger } = createLoggerSpy();

        const storage = new JsonS3Storage({
          s3Client: mockS3Client,
          bucketName: "test-bucket",
          logger: mockLogger,
        });

        await storage.save(sampleData);

        expectLogContains(logs, "debug", "save:");
        expectLogContains(logs, "info", "completed");
      });
    });
  });

  // ===========================================================================
  // Load Operation Tests
  // ===========================================================================

  describe("load", () => {
    describe("Statement Coverage", () => {
      it("loads by key", async () => {
        const entry = createSampleEntry();
        (mockS3Client.send as ReturnType<typeof vi.fn>).mockResolvedValue(
          createGetObjectResponse(entry)
        );

        const storage = new JsonS3Storage({
          s3Client: mockS3Client,
          bucketName: "test-bucket",
          logger: nullLogger,
        });

        const result = await storage.load("abc123def456");

        expect(result).toEqual(entry.data);
      });

      it("loads by data (generates key)", async () => {
        const entry = createSampleEntry();
        (mockS3Client.send as ReturnType<typeof vi.fn>).mockResolvedValue(
          createGetObjectResponse(entry)
        );

        const storage = new JsonS3Storage({
          s3Client: mockS3Client,
          bucketName: "test-bucket",
          logger: nullLogger,
        });

        const result = await storage.load({ user_id: 123, name: "Alice" });

        expect(result).not.toBeNull();
      });
    });

    describe("Branch Coverage", () => {
      it("returns null for not found", async () => {
        (mockS3Client.send as ReturnType<typeof vi.fn>).mockRejectedValue(
          new Error("NoSuchKey")
        );

        const storage = new JsonS3Storage({
          s3Client: mockS3Client,
          bucketName: "test-bucket",
          logger: nullLogger,
        });

        const result = await storage.load("nonexistent");

        expect(result).toBeNull();
        expect(storage.getStats().misses).toBe(1);
      });

      it("returns null for expired entry", async () => {
        const expiredEntry = createExpiredEntry();
        (mockS3Client.send as ReturnType<typeof vi.fn>)
          .mockResolvedValueOnce(createGetObjectResponse(expiredEntry))
          .mockResolvedValueOnce({}); // For delete

        const storage = new JsonS3Storage({
          s3Client: mockS3Client,
          bucketName: "test-bucket",
          logger: nullLogger,
        });

        const result = await storage.load("expired123");

        expect(result).toBeNull();
        expect(storage.getStats().misses).toBe(1);
      });

      it("returns expired data with ignoreExpiry", async () => {
        const expiredEntry = createExpiredEntry();
        (mockS3Client.send as ReturnType<typeof vi.fn>).mockResolvedValue(
          createGetObjectResponse(expiredEntry)
        );

        const storage = new JsonS3Storage({
          s3Client: mockS3Client,
          bucketName: "test-bucket",
          logger: nullLogger,
        });

        const result = await storage.load("expired123", { ignoreExpiry: true });

        expect(result).toEqual(expiredEntry.data);
        expect(storage.getStats().hits).toBe(1);
      });
    });

    describe("Log Verification", () => {
      it("logs hit on success", async () => {
        const entry = createSampleEntry();
        (mockS3Client.send as ReturnType<typeof vi.fn>).mockResolvedValue(
          createGetObjectResponse(entry)
        );
        const { logs, mockLogger } = createLoggerSpy();

        const storage = new JsonS3Storage({
          s3Client: mockS3Client,
          bucketName: "test-bucket",
          logger: mockLogger,
        });

        await storage.load("test123");

        expectLogContains(logs, "info", "hit");
      });

      it("logs miss on not found", async () => {
        (mockS3Client.send as ReturnType<typeof vi.fn>).mockRejectedValue(
          new Error("NoSuchKey")
        );
        const { logs, mockLogger } = createLoggerSpy();

        const storage = new JsonS3Storage({
          s3Client: mockS3Client,
          bucketName: "test-bucket",
          logger: mockLogger,
        });

        await storage.load("nonexistent");

        expectLogContains(logs, "info", "miss");
      });
    });
  });

  // ===========================================================================
  // Delete Operation Tests
  // ===========================================================================

  describe("delete", () => {
    it("returns true", async () => {
      (mockS3Client.send as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const storage = new JsonS3Storage({
        s3Client: mockS3Client,
        bucketName: "test-bucket",
        logger: nullLogger,
      });

      const result = await storage.delete("test123");

      expect(result).toBe(true);
    });

    it("increments delete stats", async () => {
      (mockS3Client.send as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const storage = new JsonS3Storage({
        s3Client: mockS3Client,
        bucketName: "test-bucket",
        logger: nullLogger,
      });

      await storage.delete("test123");

      expect(storage.getStats().deletes).toBe(1);
    });

    it("deletes by data object", async () => {
      (mockS3Client.send as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const storage = new JsonS3Storage({
        s3Client: mockS3Client,
        bucketName: "test-bucket",
        logger: nullLogger,
      });

      const result = await storage.delete({ user_id: 123 });

      expect(result).toBe(true);
    });
  });

  // ===========================================================================
  // Exists Operation Tests
  // ===========================================================================

  describe("exists", () => {
    it("returns true for existing object", async () => {
      (mockS3Client.send as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const storage = new JsonS3Storage({
        s3Client: mockS3Client,
        bucketName: "test-bucket",
        logger: nullLogger,
      });

      const result = await storage.exists("test123");

      expect(result).toBe(true);
    });

    it("returns false for non-existent object", async () => {
      (mockS3Client.send as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("404 Not Found")
      );

      const storage = new JsonS3Storage({
        s3Client: mockS3Client,
        bucketName: "test-bucket",
        logger: nullLogger,
      });

      const result = await storage.exists("nonexistent");

      expect(result).toBe(false);
    });
  });

  // ===========================================================================
  // Bulk Operations Tests
  // ===========================================================================

  describe("listKeys", () => {
    it("returns empty list for empty bucket", async () => {
      (mockS3Client.send as ReturnType<typeof vi.fn>).mockResolvedValue({
        Contents: [],
        IsTruncated: false,
      });

      const storage = new JsonS3Storage({
        s3Client: mockS3Client,
        bucketName: "test-bucket",
        keyPrefix: "test:",
        logger: nullLogger,
      });

      const keys = await storage.listKeys();

      expect(keys).toEqual([]);
    });

    it("returns list of keys", async () => {
      (mockS3Client.send as ReturnType<typeof vi.fn>).mockResolvedValue({
        Contents: [{ Key: "test:key1" }, { Key: "test:key2" }],
        IsTruncated: false,
      });

      const storage = new JsonS3Storage({
        s3Client: mockS3Client,
        bucketName: "test-bucket",
        keyPrefix: "test:",
        logger: nullLogger,
      });

      const keys = await storage.listKeys();

      expect(keys).toEqual(["key1", "key2"]);
    });
  });

  describe("clear", () => {
    it("returns 0 for empty bucket", async () => {
      (mockS3Client.send as ReturnType<typeof vi.fn>).mockResolvedValue({
        Contents: [],
        IsTruncated: false,
      });

      const storage = new JsonS3Storage({
        s3Client: mockS3Client,
        bucketName: "test-bucket",
        logger: nullLogger,
      });

      const count = await storage.clear();

      expect(count).toBe(0);
    });

    it("deletes all objects", async () => {
      (mockS3Client.send as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          Contents: [{ Key: "test:key1" }, { Key: "test:key2" }],
          IsTruncated: false,
        })
        .mockResolvedValueOnce({ Deleted: [{}, {}] });

      const storage = new JsonS3Storage({
        s3Client: mockS3Client,
        bucketName: "test-bucket",
        keyPrefix: "test:",
        logger: nullLogger,
      });

      const count = await storage.clear();

      expect(count).toBe(2);
    });
  });

  // ===========================================================================
  // Close Operation Tests
  // ===========================================================================

  describe("close", () => {
    it("marks storage as closed", async () => {
      const storage = new JsonS3Storage({
        s3Client: mockS3Client,
        bucketName: "test-bucket",
        logger: nullLogger,
      });

      await storage.close();

      await expect(storage.save({ test: "data" })).rejects.toThrow(
        JsonS3StorageClosedError
      );
    });

    it("is idempotent", async () => {
      const storage = new JsonS3Storage({
        s3Client: mockS3Client,
        bucketName: "test-bucket",
        logger: nullLogger,
      });

      await storage.close();
      await storage.close(); // Should not throw

      expect(true).toBe(true);
    });
  });

  // ===========================================================================
  // Error Handling Tests
  // ===========================================================================

  describe("error handling", () => {
    it("getErrors returns empty list initially", () => {
      const storage = new JsonS3Storage({
        s3Client: mockS3Client,
        bucketName: "test-bucket",
        logger: nullLogger,
      });

      expect(storage.getErrors()).toEqual([]);
    });

    it("getLastError returns null initially", () => {
      const storage = new JsonS3Storage({
        s3Client: mockS3Client,
        bucketName: "test-bucket",
        logger: nullLogger,
      });

      expect(storage.getLastError()).toBeNull();
    });

    it("clearErrors clears error history", () => {
      const storage = new JsonS3Storage({
        s3Client: mockS3Client,
        bucketName: "test-bucket",
        logger: nullLogger,
      });

      // Force an error record (implementation detail)
      (storage as unknown as { errors: unknown[] }).errors.push({});

      storage.clearErrors();

      expect(storage.getErrors()).toEqual([]);
    });
  });

  // ===========================================================================
  // Factory Function Tests
  // ===========================================================================

  describe("createStorage factory", () => {
    it("returns JsonS3Storage instance", () => {
      const storage = createStorage({
        s3Client: mockS3Client,
        bucketName: "test-bucket",
      });

      expect(storage).toBeInstanceOf(JsonS3Storage);
    });

    it("accepts configuration options", () => {
      const storage = createStorage({
        s3Client: mockS3Client,
        bucketName: "test-bucket",
        keyPrefix: "custom:",
        ttl: 3600,
        debug: true,
      });

      expect(storage).toBeInstanceOf(JsonS3Storage);
    });
  });
});
