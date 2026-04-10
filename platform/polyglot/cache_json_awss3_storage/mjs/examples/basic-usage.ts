/**
 * Basic Usage Examples for cache_json_awss3_storage (TypeScript)
 *
 * This script demonstrates the core features of the cache_json_awss3_storage
 * package including:
 * - Creating storage instances
 * - Saving and loading JSON data
 * - TTL-based expiration
 * - Key generation and lookups
 * - Error handling
 * - Statistics and debugging
 *
 * Prerequisites:
 *   npm install cache_json_awss3_storage @aws-sdk/client-s3
 *
 * The @aws-sdk/client-s3 package is a peer dependency - you must install it
 * separately and pass your own S3Client instance to createStorage().
 *
 * Run with: npx tsx basic-usage.ts
 */

import { S3Client } from "@aws-sdk/client-s3";
import {
  JsonS3Storage,
  JsonS3StorageClosedError,
  createLogger,
  createStorage,
  generateKey,
  generateKeyFromValue,
  generateKeyFromFields,
} from "../src/index.js";

// Mock S3 client for demo (use real client in production)
// In production: const s3Client = new S3Client({ region: 'us-east-1' });

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
// Example 1: Basic Save and Load
// =============================================================================
async function example1_basicSaveLoad(storage: JsonS3Storage): Promise<void> {
  console.log("\n" + "=".repeat(60));
  console.log("Example 1: Basic Save and Load");
  console.log("=".repeat(60));

  // Save with custom key
  const userData = { user_id: 123, name: "Alice", email: "alice@example.com" };

  await storage.save("user-alice", userData);
  console.log("Saved data with custom key: user-alice");

  // Load the data back
  const loaded = await storage.load("user-alice");
  console.log(`Loaded data: ${JSON.stringify(loaded)}`);

  // Verify it matches
  console.log(
    `Data matches: ${JSON.stringify(loaded) === JSON.stringify(userData)}`
  );
  console.log("✓ Data matches!");

  // Save with generated key from object
  const key = generateKey({ user_id: 123, action: "login" });
  await storage.save(key, userData);
  console.log(`Saved data with generated key: ${key}`);
}

// =============================================================================
// Example 2: Key Generation
// =============================================================================
async function example2_keyGeneration(storage: JsonS3Storage): Promise<void> {
  console.log("\n" + "=".repeat(60));
  console.log("Example 2: Key Generation");
  console.log("=".repeat(60));

  // Same data produces same key
  const data = { user_id: 123, name: "Alice" };

  const key1 = generateKey(data);
  const key2 = generateKey(data);

  console.log(`Key 1: ${key1}`);
  console.log(`Key 2: ${key2}`);
  console.log(`Keys match: ${key1 === key2}`);

  // Key order doesn't matter (when no hashKeys specified)
  const dataReordered = { name: "Alice", user_id: 123 };
  const key3 = generateKey(dataReordered);
  console.log(`Reordered key: ${key3}`);
  console.log(`Matches original: ${key1 === key3}`);

  // Generate key from entire value (content-addressable)
  const keyFromValue = generateKeyFromValue(data);
  console.log(`Key from value: ${keyFromValue}`);

  // Generate key from specific fields only
  const keyFromFields = generateKeyFromFields(
    { user_id: 123, name: "Alice", timestamp: 1234567890 },
    ["user_id", "name"]
  );
  console.log(`Key from fields (ignores timestamp): ${keyFromFields}`);

  // Save and load using generated key
  await storage.save(key1, data);
  const loaded = await storage.load(key1);
  console.log(`Loaded with generated key: ${JSON.stringify(loaded)}`);
}

// =============================================================================
// Example 3: TTL (Time-To-Live)
// =============================================================================
async function example3_ttlExpiration(storage: JsonS3Storage): Promise<void> {
  console.log("\n" + "=".repeat(60));
  console.log("Example 3: TTL Expiration");
  console.log("=".repeat(60));

  // Save with very short TTL (1 second)
  const data = { message: "This will expire soon", timestamp: "now" };
  const key = "expiring-data";

  await storage.save(key, data, { ttl: 1 });
  console.log(`Saved with 1-second TTL, key: ${key}`);

  // Load immediately (should succeed)
  const loaded = await storage.load(key);
  console.log(`Immediate load: ${JSON.stringify(loaded)}`);

  // Wait for expiration
  console.log("Waiting 1.5 seconds for expiration...");
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Load after expiration (should return null)
  const loadedAfter = await storage.load(key);
  console.log(`Load after expiration: ${loadedAfter}`);

  // Load with ignoreExpiry to get expired data
  const loadedForced = await storage.load(key, { ignoreExpiry: true });
  console.log(`Load with ignoreExpiry: ${JSON.stringify(loadedForced)}`);
}

// =============================================================================
// Example 4: Statistics and Debugging
// =============================================================================
async function example4_statistics(storage: JsonS3Storage): Promise<void> {
  console.log("\n" + "=".repeat(60));
  console.log("Example 4: Statistics and Debugging");
  console.log("=".repeat(60));

  // Perform some operations
  const data1 = { id: 1, value: "first" };
  const data2 = { id: 2, value: "second" };

  await storage.save("stats-key1", data1);
  await storage.save("stats-key2", data2);

  await storage.load("stats-key1"); // Hit
  await storage.load("stats-key2"); // Hit
  await storage.load("nonexistent"); // Miss

  // Get statistics
  const stats = storage.getStats();
  console.log(`Statistics: ${JSON.stringify(stats)}`);
  console.log(`  Saves: ${stats.saves}`);
  console.log(`  Loads: ${stats.loads}`);
  console.log(`  Hits: ${stats.hits}`);
  console.log(`  Misses: ${stats.misses}`);

  // Get debug info
  const debug = await storage.debugInfo();
  console.log("\nDebug Info:");
  console.log(`  Bucket: ${debug.bucketName}`);
  console.log(`  Prefix: ${debug.keyPrefix}`);
  console.log(`  Object count: ${debug.objectCount}`);
  console.log(`  Error count: ${debug.errorCount}`);
}

// =============================================================================
// Example 5: Bulk Operations
// =============================================================================
async function example5_bulkOperations(storage: JsonS3Storage): Promise<void> {
  console.log("\n" + "=".repeat(60));
  console.log("Example 5: Bulk Operations");
  console.log("=".repeat(60));

  // Save multiple items
  const items = [
    { item: 1, name: "First" },
    { item: 2, name: "Second" },
    { item: 3, name: "Third" },
  ];

  for (let i = 0; i < items.length; i++) {
    await storage.save(`bulk-item-${i + 1}`, items[i]!);
  }

  // List all keys
  const keys = await storage.listKeys();
  console.log(`Keys in storage: ${JSON.stringify(keys)}`);
  console.log(`Total: ${keys.length}`);

  // Clear all
  const deleted = await storage.clear();
  console.log(`Cleared ${deleted} items`);

  // Verify empty
  const keysAfter = await storage.listKeys();
  console.log(`Keys after clear: ${JSON.stringify(keysAfter)}`);
}

// =============================================================================
// Example 6: Error Handling
// =============================================================================
async function example6_errorHandling(storage: JsonS3Storage): Promise<void> {
  console.log("\n" + "=".repeat(60));
  console.log("Example 6: Error Handling");
  console.log("=".repeat(60));

  // Close the storage
  await storage.close();

  // Try to use after close
  try {
    await storage.save("fail-key", { should: "fail" });
  } catch (e) {
    if (e instanceof JsonS3StorageClosedError) {
      console.log(`✓ Caught JsonS3StorageClosedError: ${e.message}`);
    }
  }

  // Check error history
  const errors = storage.getErrors();
  console.log(`Errors in history: ${errors.length}`);

  const lastError = storage.getLastError();
  console.log(`Last error: ${lastError ? lastError.error_type : "none"}`);
}

// =============================================================================
// Example 7: Custom Logger
// =============================================================================
function example7_customLogger(): void {
  console.log("\n" + "=".repeat(60));
  console.log("Example 7: Custom Logger");
  console.log("=".repeat(60));

  // Create custom logger
  const logger = createLogger("example_app", import.meta.url);

  console.log(
    "Logger created with pattern: createLogger(packageName, import.meta.url)"
  );
  console.log("Log output goes to stderr by default");

  // In production, you'd pass this to createStorage:
  // const storage = createStorage({ s3Client, bucketName: 'bucket', logger });

  logger.info("This is an info message from the example");
  logger.debug("This is a debug message");
}

// =============================================================================
// Main Runner
// =============================================================================
async function main(): Promise<void> {
  console.log("=".repeat(60));
  console.log("cache_json_awss3_storage - Basic Usage Examples (TypeScript)");
  console.log("=".repeat(60));

  // Create mock S3 client
  const mockS3Client = createMockS3Client();

  // Create storage instance
  const storage = createStorage({
    s3Client: mockS3Client as unknown as S3Client,
    bucketName: "example-bucket",
    keyPrefix: "examples:",
    debug: true,
  });

  try {
    await example1_basicSaveLoad(storage);
    await example2_keyGeneration(storage);
    await example3_ttlExpiration(storage);
    await example4_statistics(storage);
    await example5_bulkOperations(storage);
    example7_customLogger();
    await example6_errorHandling(storage);
  } catch (error) {
    console.error("Error:", error);
  }

  console.log("\n" + "=".repeat(60));
  console.log("All examples completed!");
  console.log("=".repeat(60));
}

// Run main
main().catch(console.error);
