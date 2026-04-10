# Cache JSON AWS S3 Storage - TypeScript Documentation

## Installation

```bash
npm install cache_json_awss3_storage @aws-sdk/client-s3
```

This library requires `@aws-sdk/client-s3` as a peer dependency. You must install it separately and pass your own `S3Client` instance to the storage.

## Quick Start

```typescript
import { S3Client } from '@aws-sdk/client-s3';
import { createStorage, generateKey, generateKeyFromValue } from 'cache_json_awss3_storage';

const s3Client = new S3Client({ region: 'us-east-1' });

const storage = createStorage({
  s3Client,
  bucketName: 'my-bucket',
  ttl: 3600,  // 1 hour TTL
});

// Save with custom key
await storage.save('my-custom-key', { user_id: 123, name: 'Alice' });

// Load with custom key
const data = await storage.load('my-custom-key');
console.log('Loaded:', data);

// Close storage
await storage.close();
```

## Key Generation

Generate keys from objects using the provided utility functions:

```typescript
import {
  generateKey,
  generateKeyFromValue,
  generateKeyFromFields,
} from 'cache_json_awss3_storage';

// Generate key from specific fields (for lookup by identifiers)
const key1 = generateKey({ userId: 123, action: 'login' });
// key1 is based on userId + action

// Generate key from entire value (content-addressable)
const key2 = generateKeyFromValue({ name: 'Alice', score: 100 });
// Same data always produces same key

// Generate key from selected fields only
const key3 = generateKeyFromFields(
  { userId: 123, action: 'login', timestamp: Date.now() },
  ['userId', 'action']
);
// Key ignores timestamp field

// Use generated key with storage
await storage.save(key1, { userId: 123, action: 'login', details: '...' });
const data = await storage.load(key1);
```

## TTL Support

```typescript
import { S3Client } from '@aws-sdk/client-s3';
import { createStorage } from 'cache_json_awss3_storage';

const s3Client = new S3Client({ region: 'us-east-1' });

// Default TTL from config
const storage = createStorage({ s3Client, bucketName: 'my-bucket', ttl: 3600 });

// Override TTL per save
await storage.save('session-key', { session: 'data' }, { ttl: 300 });  // 5 minutes

// No expiration
await storage.save('permanent-key', { data: 'value' }, { ttl: 0 });
```

## Using with AsyncDispose (ES2023+)

```typescript
import { S3Client } from '@aws-sdk/client-s3';
import { createStorage } from 'cache_json_awss3_storage';

const s3Client = new S3Client({ region: 'us-east-1' });

await using storage = createStorage({
  s3Client,
  bucketName: 'my-bucket',
});

const key = await storage.save({ test: 'data' });
const data = await storage.load(key);
// Storage is automatically closed when scope exits
```

## Logger Integration

```typescript
import { S3Client } from '@aws-sdk/client-s3';
import { createLogger, createStorage } from 'cache_json_awss3_storage';

const s3Client = new S3Client({ region: 'us-east-1' });

// Create custom logger
const logger = createLogger("my_app", import.meta.url);

// Inject into storage
const storage = createStorage({
  s3Client,
  bucketName: 'my-bucket',
  logger,
});
```

## Fastify Integration

See `examples/fastify-app/server.ts` for a complete example.

```typescript
import { S3Client } from '@aws-sdk/client-s3';
import Fastify from 'fastify';
import fp from 'fastify-plugin';
import { createStorage, JsonS3Storage } from 'cache_json_awss3_storage';

const s3Client = new S3Client({ region: 'us-east-1' });

declare module 'fastify' {
  interface FastifyInstance {
    storage: JsonS3Storage;
  }
}

const storagePlugin = fp(async (fastify, opts) => {
  const storage = createStorage({
    s3Client,
    bucketName: opts.bucketName,
  });

  fastify.decorate('storage', storage);

  fastify.addHook('onClose', async () => {
    await storage.close();
  });
});

const server = Fastify();
await server.register(storagePlugin, { bucketName: 'my-bucket' });

server.post('/cache', async (request) => {
  const key = await server.storage.save(request.body);
  return { key };
});
```

## API Reference

See the main [API Reference](../../docs/API_REFERENCE.md) for complete documentation.

## Running Tests

```bash
# From the mjs/ directory
npm test

# With coverage
npm run test:coverage
```

## Building

```bash
npm run build
```

Output is in the `dist/` directory.
