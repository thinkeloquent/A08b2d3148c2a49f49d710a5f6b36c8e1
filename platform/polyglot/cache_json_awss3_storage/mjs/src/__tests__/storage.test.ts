/**
 * Tests for JsonS3Storage class.
 */

import { Readable } from "node:stream";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  JsonS3StorageClosedError,
  JsonS3StorageConfigError,
} from "../errors.js";
import { NullLogger } from "../logger.js";
import { JsonS3Storage, createStorage } from "../storage.js";
import type { S3ClientInterface, StorageEntry } from "../types.js";

// Mock S3 client
function createMockS3Client(): S3ClientInterface {
  return {
    send: vi.fn(),
  } as unknown as S3ClientInterface;
}

// Helper to create readable stream from string
function createReadableStream(content: string) {
  return {
    transformToString: () => Promise.resolve(content),
  };
}

describe("JsonS3Storage", () => {
  let mockS3Client: S3ClientInterface;
  let nullLogger: NullLogger;

  beforeEach(() => {
    mockS3Client = createMockS3Client();
    nullLogger = new NullLogger();
  });

  describe("constructor", () => {
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
      const storage = new JsonS3Storage({
        s3Client: mockS3Client,
        bucketName: "test-bucket",
        logger: nullLogger,
      });

      expect(storage).toBeDefined();
    });

    it("uses default configuration", () => {
      const storage = new JsonS3Storage({
        s3Client: mockS3Client,
        bucketName: "test-bucket",
        logger: nullLogger,
      });

      expect(storage.getStats().saves).toBe(0);
    });
  });

  describe("save", () => {
    it("returns the provided key", async () => {
      (mockS3Client.send as ReturnType<typeof vi.fn>).mockResolvedValue({
        ETag: '"abc123"',
      });

      const storage = new JsonS3Storage({
        s3Client: mockS3Client,
        bucketName: "test-bucket",
        keyPrefix: "test:",
        logger: nullLogger,
      });

      const key = await storage.save("my-custom-key", { user_id: 123, name: "Alice" });

      expect(key).toBe("my-custom-key");
    });

    it("increments save stats", async () => {
      (mockS3Client.send as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const storage = new JsonS3Storage({
        s3Client: mockS3Client,
        bucketName: "test-bucket",
        logger: nullLogger,
      });

      expect(storage.getStats().saves).toBe(0);

      await storage.save("test-key", { test: "data" });

      expect(storage.getStats().saves).toBe(1);
    });

    it("calls S3 putObject", async () => {
      (mockS3Client.send as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const storage = new JsonS3Storage({
        s3Client: mockS3Client,
        bucketName: "test-bucket",
        keyPrefix: "test:",
        logger: nullLogger,
      });

      await storage.save("test-key", { test: "data" });

      expect(mockS3Client.send).toHaveBeenCalled();
    });

    it("saves with TTL", async () => {
      (mockS3Client.send as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const storage = new JsonS3Storage({
        s3Client: mockS3Client,
        bucketName: "test-bucket",
        logger: nullLogger,
      });

      await storage.save("test-key", { test: "data" }, { ttl: 3600 });

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

      await storage.save("test-key", { test: "data" });

      const call = (mockS3Client.send as ReturnType<typeof vi.fn>).mock
        .calls[0]![0];
      const body = JSON.parse(call.input.Body as string) as StorageEntry;
      expect(body.expires_at).toBeNull();
    });
  });

  describe("load", () => {
    it("loads by key", async () => {
      const entry: StorageEntry = {
        key: "test123",
        data: { user_id: 123, name: "Alice" },
        created_at: Date.now() / 1000,
        expires_at: null,
      };

      (mockS3Client.send as ReturnType<typeof vi.fn>).mockResolvedValue({
        Body: createReadableStream(JSON.stringify(entry)),
      });

      const storage = new JsonS3Storage({
        s3Client: mockS3Client,
        bucketName: "test-bucket",
        logger: nullLogger,
      });

      const result = await storage.load("test123");

      expect(result).toEqual({ user_id: 123, name: "Alice" });
    });

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
      const entry: StorageEntry = {
        key: "test123",
        data: { test: "data" },
        created_at: Date.now() / 1000 - 3600,
        expires_at: Date.now() / 1000 - 1800, // Expired 30 min ago
      };

      // First call returns the expired entry, second is the delete
      (mockS3Client.send as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          Body: createReadableStream(JSON.stringify(entry)),
        })
        .mockResolvedValueOnce({});

      const storage = new JsonS3Storage({
        s3Client: mockS3Client,
        bucketName: "test-bucket",
        logger: nullLogger,
      });

      const result = await storage.load("test123");

      expect(result).toBeNull();
      expect(storage.getStats().misses).toBe(1);
    });

    it("returns expired data with ignoreExpiry", async () => {
      const entry: StorageEntry = {
        key: "test123",
        data: { test: "data" },
        created_at: Date.now() / 1000 - 3600,
        expires_at: Date.now() / 1000 - 1800, // Expired 30 min ago
      };

      (mockS3Client.send as ReturnType<typeof vi.fn>).mockResolvedValue({
        Body: createReadableStream(JSON.stringify(entry)),
      });

      const storage = new JsonS3Storage({
        s3Client: mockS3Client,
        bucketName: "test-bucket",
        logger: nullLogger,
      });

      const result = await storage.load("test123", { ignoreExpiry: true });

      expect(result).toEqual({ test: "data" });
      expect(storage.getStats().hits).toBe(1);
    });

    it("increments hits on success", async () => {
      const entry: StorageEntry = {
        key: "test",
        data: { test: "data" },
        created_at: Date.now() / 1000,
        expires_at: null,
      };

      (mockS3Client.send as ReturnType<typeof vi.fn>).mockResolvedValue({
        Body: createReadableStream(JSON.stringify(entry)),
      });

      const storage = new JsonS3Storage({
        s3Client: mockS3Client,
        bucketName: "test-bucket",
        logger: nullLogger,
      });

      await storage.load("test");

      expect(storage.getStats().hits).toBe(1);
    });
  });

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
  });

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

  describe("close", () => {
    it("marks storage as closed", async () => {
      const storage = new JsonS3Storage({
        s3Client: mockS3Client,
        bucketName: "test-bucket",
        logger: nullLogger,
      });

      await storage.close();

      await expect(storage.save("test-key", { test: "data" })).rejects.toThrow(
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

      // Manually add an error to test clearing
      (storage as unknown as { errors: unknown[] }).errors.push({});

      storage.clearErrors();

      expect(storage.getErrors()).toEqual([]);
    });
  });

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
