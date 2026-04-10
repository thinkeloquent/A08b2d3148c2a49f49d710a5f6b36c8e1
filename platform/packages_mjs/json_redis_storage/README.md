# json_redis_storage

Redis-based JSON storage with size limits, TTL, and configurable eviction policies for Node.js/TypeScript.

## Installation

```bash
npm install json_redis_storage
```

## Quick Start

```typescript
import Redis from 'ioredis';
import { JsonRedisStorage } from 'json_redis_storage';

const client = new Redis();
const storage = new JsonRedisStorage({
  redisClient: client,
  keyPrefix: 'myapp:cache:',
  hashKeys: ['userId', 'action'],
  ttl: 3600, // 1 hour
  debug: true,
});

// Save data - key is generated from hash of userId + action
await storage.save({
  userId: '123',
  action: 'login',
  timestamp: 1234567890,
  details: { ip: '192.168.1.1' }
});

// Load data - provide the same keys to find the entry
const data = await storage.load({ userId: '123', action: 'login' });
console.log(data); // { userId: '123', action: 'login', ... }

await storage.close();
```

## How Key Hashing Works

The `hashKeys` option specifies which keys from your data are used to generate the storage key:

```typescript
const storage = new JsonRedisStorage({
  redisClient: client,
  keyPrefix: 'myapp:',
  hashKeys: ['userId', 'action'],
});

// These will create the SAME entry (same userId + action):
await storage.save({ userId: '123', action: 'login', time: 1000 });
await storage.save({ userId: '123', action: 'login', time: 2000 });

// This creates a DIFFERENT entry (different action):
await storage.save({ userId: '123', action: 'logout', time: 3000 });
```

## Custom Keys

You can bypass hash key generation and use custom keys:

```typescript
// Save with custom key
await storage.save(data, { customKey: 'my-custom-identifier' });

// Load with custom key
const data = await storage.load('my-custom-identifier');
```

## TTL (Time-To-Live)

Set expiration for stored data. Redis handles TTL natively for automatic expiration.

**TTL is specified in seconds.** Use the formula: `minutes * 60` or `hours * 3600`

| Duration | TTL Value |
|----------|-----------|
| 10 minutes | `600` |
| 15 minutes | `900` |
| 20 minutes | `1200` |
| 45 minutes | `2700` |
| 1 hour | `3600` |
| 24 hours | `86400` |

```typescript
// Default TTL for all saves
const storage = new JsonRedisStorage({
  redisClient: client,
  keyPrefix: 'myapp:',
  ttl: 900, // 15 minutes
});

// Common TTL values
await storage.save(data, { ttl: 600 });   // 10 minutes
await storage.save(data, { ttl: 900 });   // 15 minutes
await storage.save(data, { ttl: 1200 });  // 20 minutes
await storage.save(data, { ttl: 2700 });  // 45 minutes
await storage.save(data, { ttl: 3600 });  // 1 hour

// Using formula for clarity
await storage.save(data, { ttl: 10 * 60 });   // 10 minutes
await storage.save(data, { ttl: 15 * 60 });   // 15 minutes
await storage.save(data, { ttl: 24 * 3600 }); // 24 hours

// Override TTL per save
await storage.save(data, { ttl: 60 });  // Expires in 1 minute
await storage.save(data, { ttl: 0 });   // Never expires (overrides default)

// Load ignoring expiry (returns data even if expired)
const data = await storage.load(key, { ignoreExpiry: true });

// Clean up expired entries (soft cleanup for entries with expiresAt field)
const removed = await storage.cleanupExpired();
```

## Eviction Policies

When storage limits are reached, entries are automatically evicted based on the configured policy:

```typescript
import { JsonRedisStorage, EvictionPolicy } from 'json_redis_storage';

// FIFO (First In First Out) - default
const storage = new JsonRedisStorage({
  redisClient: client,
  keyPrefix: 'myapp:',
  evictionPolicy: EvictionPolicy.FIFO,
  maxEntries: 1000,
});

// LRU (Least Recently Used)
const storage = new JsonRedisStorage({
  redisClient: client,
  keyPrefix: 'myapp:',
  evictionPolicy: EvictionPolicy.LRU,
  maxEntries: 1000,
});

// LFU (Least Frequently Used)
const storage = new JsonRedisStorage({
  redisClient: client,
  keyPrefix: 'myapp:',
  evictionPolicy: EvictionPolicy.LFU,
  maxEntries: 1000,
});
```

## Size Limits

Control storage size by entry count or memory usage:

```typescript
// Limit by entry count
const storage = new JsonRedisStorage({
  redisClient: client,
  keyPrefix: 'myapp:',
  maxEntries: 1000, // Maximum 1000 entries
});

// Limit by memory usage
const storage = new JsonRedisStorage({
  redisClient: client,
  keyPrefix: 'myapp:',
  maxMemoryBytes: 100_000_000, // 100 MB limit
});

// Combine limits
const storage = new JsonRedisStorage({
  redisClient: client,
  keyPrefix: 'myapp:',
  maxEntries: 1000,
  maxMemoryBytes: 100_000_000,
});
```

## Rotation Mode

Keep only the last N entries (useful for logs or token storage):

```typescript
const storage = new JsonRedisStorage({
  redisClient: client,
  keyPrefix: 'myapp:logs:',
  rotationSize: 100, // Keep only last 100 entries
});
```

## Operations

```typescript
// Check if data exists
const exists = await storage.exists({ userId: '123', action: 'login' });

// Delete data
const deleted = await storage.delete({ userId: '123', action: 'login' });

// List all stored keys
const keys = await storage.listKeys();

// Clear all data
const count = await storage.clear();

// Get debug info
console.log(await storage.debugInfo());
```

## Configuration

```typescript
const storage = new JsonRedisStorage({
  redisClient: client,              // Async Redis client instance (required)
  keyPrefix: 'jrs:',                // Prefix for all Redis keys
  hashKeys: ['id'],                 // Keys to hash for storage key
  ttl: 3600,                        // TTL in seconds (undefined = no expiry)
  evictionPolicy: EvictionPolicy.FIFO,  // FIFO, LRU, or LFU
  maxEntries: undefined,            // Maximum entry count
  maxMemoryBytes: undefined,        // Maximum memory usage
  rotationSize: undefined,          // Rotation mode: keep last N entries
  debug: false,                     // Enable debug logging
  maxErrorHistory: 100,             // Max errors to keep in history
});
```

## Error Handling

```typescript
import {
  JsonRedisStorage,
  JsonRedisStorageError,
  JsonRedisStorageReadError,
  JsonRedisStorageWriteError,
  JsonRedisStorageSerializationError,
  JsonRedisStorageConnectionError,
} from 'json_redis_storage';

try {
  await storage.save(data);
} catch (e) {
  if (e instanceof JsonRedisStorageWriteError) {
    console.log(`Write failed: ${e.message}`);
    console.log(`  Operation: ${e.operation}`);
    console.log(`  Key: ${e.key}`);
    console.log(`  Original error: ${e.originalError}`);
  } else if (e instanceof JsonRedisStorageError) {
    console.log(`Storage error: ${e.message}`);
  }
}

// Check error history
const errors = storage.getErrors();
const lastError = storage.getLastError();
storage.clearErrors();
```

## Debug Mode

```typescript
const storage = new JsonRedisStorage({
  redisClient: client,
  keyPrefix: 'myapp:',
  hashKeys: ['id'],
  debug: true,
});

// Output:
// [json_redis_storage INFO] JsonRedisStorage initialized with prefix: myapp:
// [json_redis_storage DEBUG] Generated key: id:123
// [json_redis_storage DEBUG] Saved key: id:123 -> myapp:a1b2c3d4

// Get debug info programmatically
console.log(await storage.debugInfo());
// {
//   keyPrefix: 'myapp:',
//   hashKeys: ['id'],
//   ttl: 3600,
//   evictionPolicy: 'fifo',
//   limits: { maxEntries: 1000, maxMemoryBytes: undefined, rotationSize: undefined },
//   entryCount: 5,
//   memoryUsageBytes: 0,
//   stats: { saves: 10, loads: 20, hits: 18, misses: 2, deletes: 0, evictions: 3, rotations: 0 },
//   errorCount: 0
// }
```

## TypeScript Support

Full TypeScript support with generics:

```typescript
interface UserData {
  userId: string;
  action: string;
  timestamp: number;
}

// Type-safe load
const data = await storage.load<UserData>({ userId: '123', action: 'login' });
if (data) {
  console.log(data.userId); // TypeScript knows this is string
}
```

## License

MIT
