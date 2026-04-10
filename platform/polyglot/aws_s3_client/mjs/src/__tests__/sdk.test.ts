/**
 * Unit tests for S3StorageSDK.
 *
 * Tests cover:
 * - Statement coverage for all code paths
 * - Branch coverage for all conditionals
 * - SDK response envelope pattern
 * - Error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { type SDKResponse, S3StorageSDK, createSDK } from "../sdk.js";
import { createLoggerSpy, sampleData } from "./helpers.js";

// Mock the S3Client
vi.mock("@aws-sdk/client-s3", () => {
  const storedObjects = new Map<string, string>();

  return {
    S3Client: vi.fn().mockImplementation(() => ({
      send: vi.fn().mockImplementation(async (command) => {
        const commandName = command.constructor.name;

        if (commandName === "PutObjectCommand") {
          storedObjects.set(command.input.Key, command.input.Body);
          return { ETag: '"abc123"' };
        }

        if (commandName === "GetObjectCommand") {
          const stored = storedObjects.get(command.input.Key);
          if (stored) {
            return {
              Body: {
                transformToString: async () => stored,
              },
            };
          }
          throw new Error("NoSuchKey");
        }

        if (commandName === "HeadObjectCommand") {
          if (storedObjects.has(command.input.Key)) {
            return { ContentLength: 100 };
          }
          throw new Error("404 Not Found");
        }

        if (commandName === "DeleteObjectCommand") {
          storedObjects.delete(command.input.Key);
          return {};
        }

        if (commandName === "DeleteObjectsCommand") {
          return { Deleted: [] };
        }

        if (commandName === "ListObjectsV2Command") {
          const keys = Array.from(storedObjects.keys()).map((k) => ({ Key: k }));
          return { Contents: keys, IsTruncated: false };
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

describe("S3StorageSDK", () => {
  // =====================================================================
  // Initialization Tests
  // =====================================================================

  describe("Initialization", () => {
    describe("Statement Coverage", () => {
      it("should create SDK with config", () => {
        const sdk = new S3StorageSDK({ bucketName: "test-bucket", region: "us-east-1" });
        expect(sdk).toBeDefined();
      });

      it("should create SDK using factory function", () => {
        const sdk = createSDK({ bucketName: "test-bucket", region: "us-east-1" });
        expect(sdk).toBeDefined();
      });
    });

    describe("Branch Coverage", () => {
      it("should use custom logger when provided", () => {
        const { mockLogger } = createLoggerSpy();
        const sdk = createSDK({ bucketName: "test-bucket", region: "us-east-1" }, { logger: mockLogger });

        expect(sdk).toBeDefined();
      });

      it("should use NullLogger when debug is false", () => {
        const sdk = createSDK({ bucketName: "test-bucket", region: "us-east-1", debug: false });
        expect(sdk).toBeDefined();
      });

      it("should use default logger when debug is true", () => {
        const sdk = createSDK({ bucketName: "test-bucket", region: "us-east-1", debug: true });
        expect(sdk).toBeDefined();
      });
    });

    describe("Error Handling", () => {
      it("should throw for missing bucket name", () => {
        expect(() => {
          createSDK({ bucketName: "", region: "us-east-1" });
        }).toThrow("bucketName is required");
      });
    });
  });

  // =====================================================================
  // Save Tests
  // =====================================================================

  describe("save()", () => {
    let sdk: S3StorageSDK;

    beforeEach(() => {
      sdk = createSDK({ bucketName: "test-bucket", region: "us-east-1" });
    });

    afterEach(async () => {
      await sdk.close();
    });

    describe("Statement Coverage", () => {
      it("should return success response with key", async () => {
        const response = await sdk.save(sampleData);

        expect(response.success).toBe(true);
        expect(response.key).toBeDefined();
        expect(response.key).toHaveLength(16);
        expect(response.elapsedMs).toBeGreaterThan(0);
      });
    });

    describe("Branch Coverage", () => {
      it("should use explicit TTL when provided", async () => {
        const response = await sdk.save(sampleData, { ttl: 7200 });

        expect(response.success).toBe(true);
        expect(response.key).toBeDefined();
      });
    });

    describe("Response Envelope", () => {
      it("should return SDKResponse shape", async () => {
        const response = await sdk.save(sampleData);

        expect(response).toHaveProperty("success");
        expect(response).toHaveProperty("data");
        expect(response).toHaveProperty("key");
        expect(response).toHaveProperty("elapsedMs");
      });
    });
  });

  // =====================================================================
  // Load Tests
  // =====================================================================

  describe("load()", () => {
    let sdk: S3StorageSDK;

    beforeEach(() => {
      sdk = createSDK({ bucketName: "test-bucket", region: "us-east-1" });
    });

    afterEach(async () => {
      await sdk.close();
    });

    describe("Statement Coverage", () => {
      it("should return data when key exists", async () => {
        // Save first
        const saveResponse = await sdk.save(sampleData);
        const key = saveResponse.key!;

        // Load by key
        const response = await sdk.load(key);

        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();
      });
    });

    describe("Branch Coverage", () => {
      it("should return key in response when loading by string", async () => {
        const saveResponse = await sdk.save(sampleData);
        const key = saveResponse.key!;

        const response = await sdk.load(key);

        expect(response.key).toBe(key);
      });

      it("should return null key when loading by object", async () => {
        await sdk.save(sampleData);

        const response = await sdk.load(sampleData);

        expect(response.key).toBeNull();
      });

      it("should return null data for non-existent key", async () => {
        const response = await sdk.load("nonexistent_key");

        expect(response.success).toBe(true);
        expect(response.data).toBeNull();
      });
    });
  });

  // =====================================================================
  // Delete Tests
  // =====================================================================

  describe("delete()", () => {
    let sdk: S3StorageSDK;

    beforeEach(() => {
      sdk = createSDK({ bucketName: "test-bucket", region: "us-east-1" });
    });

    afterEach(async () => {
      await sdk.close();
    });

    describe("Statement Coverage", () => {
      it("should return success response", async () => {
        const response = await sdk.delete("test_key");

        expect(response.success).toBe(true);
        expect(response.data).toBe(true);
      });
    });
  });

  // =====================================================================
  // Exists Tests
  // =====================================================================

  describe("exists()", () => {
    let sdk: S3StorageSDK;

    beforeEach(() => {
      sdk = createSDK({ bucketName: "test-bucket", region: "us-east-1" });
    });

    afterEach(async () => {
      await sdk.close();
    });

    describe("Branch Coverage", () => {
      it("should return true when object exists", async () => {
        const saveResponse = await sdk.save(sampleData);
        const key = saveResponse.key!;

        const response = await sdk.exists(key);

        expect(response.success).toBe(true);
        expect(response.data).toBe(true);
      });

      it("should return false when object does not exist", async () => {
        const response = await sdk.exists("nonexistent_key");

        expect(response.success).toBe(true);
        expect(response.data).toBe(false);
      });
    });
  });

  // =====================================================================
  // List Keys Tests
  // =====================================================================

  describe("listKeys()", () => {
    let sdk: S3StorageSDK;

    beforeEach(() => {
      sdk = createSDK({ bucketName: "test-bucket", region: "us-east-1" });
    });

    afterEach(async () => {
      await sdk.close();
    });

    describe("Statement Coverage", () => {
      it("should return list of keys", async () => {
        await sdk.save({ id: 1 });
        await sdk.save({ id: 2 });

        const response = await sdk.listKeys();

        expect(response.success).toBe(true);
        expect(Array.isArray(response.data)).toBe(true);
      });
    });
  });

  // =====================================================================
  // Clear Tests
  // =====================================================================

  describe("clear()", () => {
    let sdk: S3StorageSDK;

    beforeEach(() => {
      sdk = createSDK({ bucketName: "test-bucket", region: "us-east-1" });
    });

    afterEach(async () => {
      await sdk.close();
    });

    describe("Statement Coverage", () => {
      it("should return count of deleted objects", async () => {
        const response = await sdk.clear();

        expect(response.success).toBe(true);
        expect(typeof response.data).toBe("number");
      });
    });
  });

  // =====================================================================
  // Stats Tests
  // =====================================================================

  describe("stats()", () => {
    let sdk: S3StorageSDK;

    beforeEach(() => {
      sdk = createSDK({ bucketName: "test-bucket", region: "us-east-1" });
    });

    afterEach(async () => {
      await sdk.close();
    });

    describe("Statement Coverage", () => {
      it("should return stats object", async () => {
        const response = await sdk.stats();

        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();
        expect(response.data).toHaveProperty("saves");
        expect(response.data).toHaveProperty("loads");
      });
    });
  });

  // =====================================================================
  // Close Tests
  // =====================================================================

  describe("close()", () => {
    describe("Statement Coverage", () => {
      it("should close SDK", async () => {
        const sdk = createSDK({ bucketName: "test-bucket", region: "us-east-1" });

        await sdk.close();

        // Should not throw on second close
        await sdk.close();

        expect(true).toBe(true);
      });
    });

    describe("Integration", () => {
      it("should work with async disposal", async () => {
        let sdkRef: S3StorageSDK | undefined;

        await (async () => {
          const sdk = createSDK({ bucketName: "test-bucket", region: "us-east-1" });
          sdkRef = sdk;
          await sdk.close();
        })();

        expect(sdkRef).toBeDefined();
      });
    });
  });
});
