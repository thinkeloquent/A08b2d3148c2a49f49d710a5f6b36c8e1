/**
 * Basic usage examples for JsonRedisStorage.
 *
 * This example demonstrates:
 * - Basic save/load operations
 * - TTL (time-to-live) expiration
 * - Custom keys
 * - Size limits and eviction
 * - Rotation mode for logs
 * - Different eviction policies
 *
 * To run with ioredis:
 *   npm install ioredis
 *   npx ts-node examples/basic_usage.ts
 *
 * Or use ioredis-mock for testing without Redis:
 *   npm install ioredis-mock
 */

import {
  JsonRedisStorage,
  EvictionPolicy,
  type RedisClientInterface,
} from "../src/index.js";

// Mock Redis client for examples (replace with real ioredis in production)
function createMockRedisClient(): RedisClientInterface {
  const store = new Map<string, { value: string; expiresAt?: number }>();

  return {
    async get(key: string): Promise<string | null> {
      const entry = store.get(key);
      if (!entry) return null;
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        store.delete(key);
        return null;
      }
      return entry.value;
    },

    async set(
      key: string,
      value: string,
      exMode?: "EX",
      exValue?: number
    ): Promise<"OK"> {
      const expiresAt =
        exMode === "EX" && exValue ? Date.now() + exValue * 1000 : undefined;
      store.set(key, { value, expiresAt });
      return "OK";
    },

    async del(...keys: string[]): Promise<number> {
      let count = 0;
      for (const key of keys) {
        if (store.delete(key)) count++;
      }
      return count;
    },

    async exists(...keys: string[]): Promise<number> {
      return keys.filter((k) => store.has(k)).length;
    },

    async keys(pattern: string): Promise<string[]> {
      const regex = new RegExp(
        "^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$"
      );
      return Array.from(store.keys()).filter((k) => regex.test(k));
    },

    async ttl(key: string): Promise<number> {
      const entry = store.get(key);
      if (!entry) return -2;
      if (!entry.expiresAt) return -1;
      return Math.ceil((entry.expiresAt - Date.now()) / 1000);
    },

    async expire(key: string, seconds: number): Promise<number> {
      const entry = store.get(key);
      if (!entry) return 0;
      entry.expiresAt = Date.now() + seconds * 1000;
      return 1;
    },

    async incr(key: string): Promise<number> {
      const entry = store.get(key);
      const value = entry ? parseInt(entry.value, 10) + 1 : 1;
      store.set(key, { value: String(value) });
      return value;
    },

    async incrby(key: string, increment: number): Promise<number> {
      const entry = store.get(key);
      const value = entry ? parseInt(entry.value, 10) + increment : increment;
      store.set(key, { value: String(value) });
      return value;
    },

    async scan(
      cursor: number | string,
      ...args: (string | number)[]
    ): Promise<[string, string[]]> {
      // Simple implementation: return all matching keys in one scan
      let pattern = "*";
      for (let i = 0; i < args.length; i += 2) {
        if (args[i] === "MATCH") {
          pattern = String(args[i + 1]);
        }
      }
      const regex = new RegExp(
        "^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$"
      );
      const keys = Array.from(store.keys()).filter((k) => regex.test(k));
      return ["0", keys];
    },
  };
}

// Helper to wait
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function basicSaveLoad(): Promise<void> {
  console.log("\n=== Basic Save/Load ===");

  const client = createMockRedisClient();
  const storage = new JsonRedisStorage({
    redisClient: client,
    keyPrefix: "example:basic:",
  });

  // Save data
  const data = { userId: "123", name: "Alice", email: "alice@example.com" };
  const key = await storage.save(data);
  console.log(`Saved with key: ${key}`);

  // Load data back
  const loaded = await storage.load(data);
  console.log(`Loaded: ${JSON.stringify(loaded)}`);

  // Load by key string
  const loadedByKey = await storage.load(key);
  console.log(`Loaded by key: ${JSON.stringify(loadedByKey)}`);

  // Check existence
  const exists = await storage.exists(data);
  console.log(`Exists: ${exists}`);

  // Delete
  const deleted = await storage.delete(data);
  console.log(`Deleted: ${deleted}`);

  await storage.close();
}

async function ttlExample(): Promise<void> {
  console.log("\n=== TTL Expiration ===");

  const client = createMockRedisClient();
  const storage = new JsonRedisStorage({
    redisClient: client,
    keyPrefix: "example:ttl:",
    ttl: 2, // Default 2 second TTL
  });

  // Save with default TTL
  await storage.save({ id: "1", message: "expires in 2 seconds" });
  console.log("Saved with default TTL (2s)");

  // Save with custom TTL
  await storage.save({ id: "2", message: "expires in 5 seconds" }, { ttl: 5 });
  console.log("Saved with custom TTL (5s)");

  // Verify both exist
  console.log(`Entry 1 exists: ${await storage.exists({ id: "1" })}`);
  console.log(`Entry 2 exists: ${await storage.exists({ id: "2" })}`);

  // Wait for first to expire
  console.log("Waiting 3 seconds...");
  await sleep(3000);

  // Check again (entry 1 should be expired)
  console.log(`Entry 1 exists after 3s: ${await storage.exists({ id: "1" })}`);
  console.log(`Entry 2 exists after 3s: ${await storage.exists({ id: "2" })}`);

  await storage.close();
}

async function customKeysExample(): Promise<void> {
  console.log("\n=== Custom Keys ===");

  const client = createMockRedisClient();

  // Storage with specific hash keys
  const storage = new JsonRedisStorage({
    redisClient: client,
    keyPrefix: "example:custom:",
    hashKeys: ["userId", "action"], // Only these fields determine the key
  });

  // These two saves will use the same key (same userId and action)
  const data1 = { userId: "123", action: "login", timestamp: 1000 };
  const data2 = { userId: "123", action: "login", timestamp: 2000 };

  const key1 = await storage.save(data1);
  const key2 = await storage.save(data2);

  console.log(`Key 1: ${key1}`);
  console.log(`Key 2: ${key2}`);
  console.log(`Keys are same: ${key1 === key2}`);

  // The second save overwrites the first
  const loaded = await storage.load<{ timestamp: number }>({
    userId: "123",
    action: "login",
  });
  console.log(`Loaded timestamp: ${loaded?.timestamp}`); // Will be 2000

  // Using a completely custom key
  await storage.save({ any: "data", here: true }, { customKey: "my-custom-key-123" });
  const loadedCustom = await storage.load("my-custom-key-123");
  console.log(`Loaded by custom key: ${JSON.stringify(loadedCustom)}`);

  await storage.close();
}

async function sizeLimitsExample(): Promise<void> {
  console.log("\n=== Size Limits (Max Entries) ===");

  const client = createMockRedisClient();
  const storage = new JsonRedisStorage({
    redisClient: client,
    keyPrefix: "example:limits:",
    maxEntries: 3, // Only keep 3 entries
    evictionPolicy: EvictionPolicy.FIFO,
  });

  // Save 5 entries (first 2 will be evicted)
  for (let i = 0; i < 5; i++) {
    await storage.save({ id: String(i), value: `entry-${i}` });
    console.log(`Saved entry ${i}`);
  }

  // List remaining keys
  const keys = await storage.listKeys();
  console.log(`Remaining keys (${keys.length}): ${keys.join(", ")}`);

  // Check stats
  const info = await storage.debugInfo();
  const stats = info.stats as { evictions: number };
  console.log(`Evictions: ${stats.evictions}`);

  await storage.close();
}

async function rotationModeExample(): Promise<void> {
  console.log("\n=== Rotation Mode (Logs) ===");

  const client = createMockRedisClient();
  const storage = new JsonRedisStorage({
    redisClient: client,
    keyPrefix: "example:logs:",
    rotationSize: 5, // Keep only last 5 log entries
  });

  // Simulate logging 10 events
  for (let i = 0; i < 10; i++) {
    await storage.save(
      { event: `log-${i}`, level: "info" },
      { customKey: `log-${i}` }
    );
  }

  const keys = await storage.listKeys();
  console.log(`Stored logs (${keys.length}): ${keys.sort().join(", ")}`);

  const info = await storage.debugInfo();
  const stats = info.stats as { rotations: number };
  console.log(`Rotations: ${stats.rotations}`);

  await storage.close();
}

async function evictionPoliciesExample(): Promise<void> {
  console.log("\n=== Eviction Policies ===");

  // LRU - Least Recently Used
  console.log("\nLRU Policy:");
  const clientLru = createMockRedisClient();
  const storageLru = new JsonRedisStorage({
    redisClient: clientLru,
    keyPrefix: "example:lru:",
    maxEntries: 3,
    evictionPolicy: EvictionPolicy.LRU,
  });

  // Save 3 entries
  for (let i = 0; i < 3; i++) {
    await storageLru.save({ id: String(i) }, { customKey: `item-${i}` });
  }

  // Access item-0 to make it recently used
  await storageLru.load("item-0");
  console.log("Accessed item-0");

  // Save a 4th entry - item-1 should be evicted (least recently used)
  await storageLru.save({ id: "3" }, { customKey: "item-3" });

  const keysLru = await storageLru.listKeys();
  console.log(`Remaining after LRU eviction: ${keysLru.sort().join(", ")}`);

  await storageLru.close();

  // LFU - Least Frequently Used
  console.log("\nLFU Policy:");
  const clientLfu = createMockRedisClient();
  const storageLfu = new JsonRedisStorage({
    redisClient: clientLfu,
    keyPrefix: "example:lfu:",
    maxEntries: 3,
    evictionPolicy: EvictionPolicy.LFU,
  });

  // Save 3 entries
  for (let i = 0; i < 3; i++) {
    await storageLfu.save({ id: String(i) }, { customKey: `item-${i}` });
  }

  // Access item-0 multiple times to increase frequency
  await storageLfu.load("item-0");
  await storageLfu.load("item-0");
  await storageLfu.load("item-0");
  console.log("Accessed item-0 three times");

  // Save a 4th entry - item-1 or item-2 should be evicted (least frequently used)
  await storageLfu.save({ id: "3" }, { customKey: "item-3" });

  const keysLfu = await storageLfu.listKeys();
  console.log(`Remaining after LFU eviction: ${keysLfu.sort().join(", ")}`);

  await storageLfu.close();
}

async function errorHandlingExample(): Promise<void> {
  console.log("\n=== Error Handling ===");

  const client = createMockRedisClient();
  const storage = new JsonRedisStorage({
    redisClient: client,
    keyPrefix: "example:errors:",
    debug: true,
  });

  // Normal operation
  await storage.save({ id: "1", data: "test" });

  // Try to load non-existent key
  const result = await storage.load("non-existent-key");
  console.log(`Non-existent key returns: ${result}`);

  // Get debug info
  const info = await storage.debugInfo();
  console.log(`Stats: ${JSON.stringify(info.stats)}`);
  console.log(`Error count: ${info.errorCount}`);

  // Clear all entries
  const count = await storage.clear();
  console.log(`Cleared ${count} entries`);

  await storage.close();
}

async function typedDataExample(): Promise<void> {
  console.log("\n=== Typed Data ===");

  interface UserSession {
    userId: string;
    token: string;
    permissions: string[];
    createdAt: number;
  }

  const client = createMockRedisClient();
  const storage = new JsonRedisStorage({
    redisClient: client,
    keyPrefix: "example:typed:",
    hashKeys: ["userId"],
  });

  // Save typed data
  const session: UserSession = {
    userId: "user-123",
    token: "abc123xyz",
    permissions: ["read", "write"],
    createdAt: Date.now(),
  };

  await storage.save(session);

  // Load with type safety
  const loaded = await storage.load<UserSession>({ userId: "user-123" });
  if (loaded) {
    console.log(`User ID: ${loaded.userId}`);
    console.log(`Token: ${loaded.token}`);
    console.log(`Permissions: ${loaded.permissions.join(", ")}`);
  }

  await storage.close();
}

async function main(): Promise<void> {
  console.log("=".repeat(60));
  console.log("JsonRedisStorage Examples");
  console.log("=".repeat(60));

  await basicSaveLoad();
  await ttlExample();
  await customKeysExample();
  await sizeLimitsExample();
  await rotationModeExample();
  await evictionPoliciesExample();
  await errorHandlingExample();
  await typedDataExample();

  console.log("\n" + "=".repeat(60));
  console.log("All examples completed!");
  console.log("=".repeat(60));
}

main().catch(console.error);
