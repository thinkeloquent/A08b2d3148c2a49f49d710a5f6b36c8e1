# json_file_storage

File-based JSON storage with hash-based filenames for Node.js/TypeScript.

## Installation

```bash
npm install json_file_storage
```

## Quick Start

```typescript
import { JsonFileStorage } from 'json_file_storage';

const storage = new JsonFileStorage({
  saveToDirectory: '.data/cache',
  fileNameHashKeys: ['userId', 'action'],
  ttl: 3600, // 1 hour
  debug: true,
});

await storage.init();

// Save data - filename is generated from hash of userId + action
await storage.save({
  userId: '123',
  action: 'login',
  timestamp: 1234567890,
  details: { ip: '192.168.1.1' }
});

// Load data - provide the same keys to find the file
const data = await storage.load({ userId: '123', action: 'login' });
console.log(data); // { userId: '123', action: 'login', ... }

await storage.close();
```

## How Filename Hashing Works

The `fileNameHashKeys` option specifies which keys from your data are used to generate the filename:

```typescript
const storage = new JsonFileStorage({
  saveToDirectory: '.data',
  fileNameHashKeys: ['userId', 'action'],
});

await storage.init();

// These will create the SAME file (same userId + action):
await storage.save({ userId: '123', action: 'login', time: 1000 });
await storage.save({ userId: '123', action: 'login', time: 2000 });

// This creates a DIFFERENT file (different action):
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

Set expiration for stored data.

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
const storage = new JsonFileStorage({
  saveToDirectory: '.data',
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
await storage.save(data, { ttl: 0 });   // Never expires

// Load ignoring expiry
const data = await storage.load(key, { ignoreExpiry: true });

// Clean up expired entries
const removed = await storage.cleanupExpired();
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
const storage = new JsonFileStorage({
  saveToDirectory: '.data',      // Directory to store files
  fileNameHashKeys: ['id'],      // Keys to hash for filename
  ttl: 3600,                     // TTL in seconds (undefined = no expiry)
  fileExtension: '.json',        // File extension
  createDir: true,               // Create directory if not exists
  debug: false,                  // Enable debug logging
  maxErrorHistory: 100,          // Max errors to keep in history
});
```

## Error Handling

```typescript
import {
  JsonFileStorage,
  JsonFileStorageError,
  JsonFileStorageReadError,
  JsonFileStorageWriteError,
  JsonFileStorageSerializationError,
} from 'json_file_storage';

try {
  await storage.save(data);
} catch (e) {
  if (e instanceof JsonFileStorageWriteError) {
    console.log(`Write failed: ${e.message}`);
    console.log(`  Operation: ${e.operation}`);
    console.log(`  Key: ${e.key}`);
    console.log(`  Filepath: ${e.filepath}`);
    console.log(`  Original error: ${e.originalError}`);
  } else if (e instanceof JsonFileStorageError) {
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
const storage = new JsonFileStorage({
  saveToDirectory: '.data',
  fileNameHashKeys: ['id'],
  debug: true,
});

// Output:
// [json_file_storage DEBUG] Initializing JsonFileStorage: directory=/path/.data
// [json_file_storage INFO] SAVE: key=id:123... -> a1b2c3d4.json
// [json_file_storage INFO] SUCCESS: File created: a1b2c3d4.json (256 bytes)

// Get debug info programmatically
console.log(await storage.debugInfo());
// {
//   saveToDirectory: '/path/.data',
//   directoryExists: true,
//   fileNameHashKeys: ['id'],
//   ttl: 3600,
//   fileCount: 5,
//   stats: { saves: 10, loads: 20, hits: 18, misses: 2 },
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
