# AWS SDK S3 Client Setup Guide

This guide covers setting up `@aws-sdk/client-s3` for use with the TypeScript `cache_json_awss3_storage` package.

## Installation

```bash
npm install @aws-sdk/client-s3
```

Or with the storage package:

```bash
npm install cache_json_awss3_storage @aws-sdk/client-s3
```

## Quick Start

### Using Client Factory (Recommended)

The client factory simplifies setup by combining all connection parameters into a single config object:

```typescript
import { getClientFactory, createAsyncClient, createStorage } from 'cache_json_awss3_storage';

const config = getClientFactory({
  bucketName: 'my-bucket',
  regionName: 'us-east-1',
});

const { client, destroy } = createAsyncClient(config);

try {
  const storage = createStorage({
    s3Client: client,
    bucketName: config.bucketName,
  });

  const key = await storage.save({ user_id: 123, name: 'Alice' });
  const data = await storage.load(key);

  await storage.close();
} finally {
  destroy();
}
```

### Using Client Factory with Custom Endpoint (LocalStack/MinIO)

```typescript
import { getClientFactory, createAsyncClient, createStorage } from 'cache_json_awss3_storage';

const config = getClientFactory({
  bucketName: 'my-bucket',
  regionName: 'us-east-1',
  endpointUrl: 'http://localhost:4566',
  awsAccessKeyId: 'test',
  awsSecretAccessKey: 'test',
  ttl: 3600,
});

const { client, destroy } = createAsyncClient(config);
// ...
```

### Manual S3Client Setup

```typescript
import { S3Client } from '@aws-sdk/client-s3';
import { createStorage } from 'cache_json_awss3_storage';

const s3Client = new S3Client({ region: 'us-east-1' });

const storage = createStorage({
  s3Client,
  bucketName: 'my-bucket',
});

// Save data
const key = await storage.save({ user_id: 123, name: 'Alice' });

// Load data
const data = await storage.load(key);

// Close storage
await storage.close();
```

## Configuration Options

### Region Configuration

```typescript
import { S3Client } from '@aws-sdk/client-s3';

// Option 1: Explicit region
const client = new S3Client({ region: 'us-west-2' });

// Option 2: Environment variable
// export AWS_REGION=us-west-2
const clientFromEnv = new S3Client({});
```

### Credential Configuration

#### Environment Variables (Recommended for Development)

```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1
```

```typescript
import { S3Client } from '@aws-sdk/client-s3';

// Automatically uses environment variables
const client = new S3Client({ region: 'us-east-1' });
```

#### Explicit Credentials

```typescript
import { S3Client } from '@aws-sdk/client-s3';

const client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'YOUR_ACCESS_KEY',
    secretAccessKey: 'YOUR_SECRET_KEY',
  },
});
```

#### AWS Profile

```typescript
import { S3Client } from '@aws-sdk/client-s3';
import { fromIni } from '@aws-sdk/credential-providers';

// Use a named profile from ~/.aws/credentials
const client = new S3Client({
  region: 'us-east-1',
  credentials: fromIni({ profile: 'my-profile' }),
});
```

#### IAM Role (EC2/ECS/Lambda)

```typescript
import { S3Client } from '@aws-sdk/client-s3';

// Automatically uses instance metadata or task role
const client = new S3Client({ region: 'us-east-1' });
```

#### Assumed Role

```typescript
import { S3Client } from '@aws-sdk/client-s3';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';

const client = new S3Client({
  region: 'us-east-1',
  credentials: fromTemporaryCredentials({
    params: {
      RoleArn: 'arn:aws:iam::123456789012:role/MyRole',
      RoleSessionName: 'my-session',
    },
  }),
});
```

### Custom Endpoint (LocalStack, MinIO)

```typescript
import { S3Client } from '@aws-sdk/client-s3';

// LocalStack
const localStackClient = new S3Client({
  region: 'us-east-1',
  endpoint: 'http://localhost:4566',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
  forcePathStyle: true,  // Required for LocalStack
});

// MinIO
const minioClient = new S3Client({
  region: 'us-east-1',
  endpoint: 'http://localhost:9000',
  credentials: {
    accessKeyId: 'minioadmin',
    secretAccessKey: 'minioadmin',
  },
  forcePathStyle: true,  // Required for MinIO
});
```

## Client Lifecycle Management

### Using AsyncDisposable (ES2023+)

```typescript
import { S3Client } from '@aws-sdk/client-s3';
import { createStorage } from 'cache_json_awss3_storage';

async function main() {
  const s3Client = new S3Client({ region: 'us-east-1' });

  await using storage = createStorage({
    s3Client,
    bucketName: 'my-bucket',
  });

  const key = await storage.save({ data: 'value' });
  console.log(`Saved: ${key}`);

  // Storage automatically closed when scope exits
}
```

### Manual Management

```typescript
import { S3Client } from '@aws-sdk/client-s3';
import { createStorage } from 'cache_json_awss3_storage';

async function main() {
  const s3Client = new S3Client({ region: 'us-east-1' });
  const storage = createStorage({
    s3Client,
    bucketName: 'my-bucket',
  });

  try {
    const key = await storage.save({ data: 'value' });
    console.log(`Saved: ${key}`);
  } finally {
    await storage.close();
    s3Client.destroy();
  }
}
```

## Fastify Integration

### Plugin Pattern (Client Factory)

```typescript
import Fastify, { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import {
  getClientFactory, createAsyncClient, createStorage, JsonS3Storage,
} from 'cache_json_awss3_storage';

declare module 'fastify' {
  interface FastifyInstance {
    storage: JsonS3Storage;
  }
}

const config = getClientFactory({
  bucketName: 'my-bucket',
  regionName: 'us-east-1',
  ttl: 3600,
});

const storagePlugin = fp(async (fastify: FastifyInstance) => {
  const { client, destroy } = createAsyncClient(config);

  const storage = createStorage({
    s3Client: client,
    bucketName: config.bucketName,
    ttl: config.ttl,
  });

  fastify.decorate('storage', storage);

  fastify.addHook('onClose', async () => {
    await storage.close();
    destroy();
  });
});

const server = Fastify({ logger: true });
await server.register(storagePlugin);

server.post('/cache', async (request) => {
  const key = await server.storage.save(request.body as Record<string, unknown>);
  return { key };
});

await server.listen({ port: 3000 });
```

### Plugin Pattern (Manual S3Client)

```typescript
import Fastify, { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { S3Client } from '@aws-sdk/client-s3';
import { createStorage, JsonS3Storage } from 'cache_json_awss3_storage';

declare module 'fastify' {
  interface FastifyInstance {
    storage: JsonS3Storage;
  }
}

interface StoragePluginOptions {
  bucketName: string;
  region?: string;
}

const storagePlugin = fp<StoragePluginOptions>(async (fastify, opts) => {
  const s3Client = new S3Client({
    region: opts.region ?? 'us-east-1',
  });

  const storage = createStorage({
    s3Client,
    bucketName: opts.bucketName,
    ttl: 3600,
  });

  fastify.decorate('storage', storage);

  fastify.addHook('onClose', async () => {
    await storage.close();
    s3Client.destroy();
  });
});

const server = Fastify({ logger: true });

await server.register(storagePlugin, {
  bucketName: 'my-bucket',
  region: 'us-east-1',
});

server.post('/cache', async (request) => {
  const key = await server.storage.save(request.body as Record<string, unknown>);
  return { key };
});

await server.listen({ port: 3000 });
```

## Express Integration

```typescript
import express from 'express';
import { S3Client } from '@aws-sdk/client-s3';
import { createStorage, JsonS3Storage } from 'cache_json_awss3_storage';

const app = express();
app.use(express.json());

let storage: JsonS3Storage;
let s3Client: S3Client;

// Initialize on startup
async function initialize() {
  s3Client = new S3Client({ region: 'us-east-1' });
  storage = createStorage({
    s3Client,
    bucketName: 'my-bucket',
  });
}

// Cleanup on shutdown
async function shutdown() {
  await storage.close();
  s3Client.destroy();
}

app.post('/cache', async (req, res) => {
  try {
    const key = await storage.save(req.body);
    res.json({ key });
  } catch (error) {
    res.status(500).json({ error: 'Storage error' });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await shutdown();
  process.exit(0);
});

initialize().then(() => {
  app.listen(3000, () => console.log('Server running'));
});
```

## Advanced Configuration

### Retry Configuration

```typescript
import { S3Client } from '@aws-sdk/client-s3';

const client = new S3Client({
  region: 'us-east-1',
  maxAttempts: 5,
  retryMode: 'adaptive', // or 'standard'
});
```

### Custom Retry Strategy

```typescript
import { S3Client } from '@aws-sdk/client-s3';
import { ConfiguredRetryStrategy } from '@aws-sdk/util-retry';

const retryStrategy = new ConfiguredRetryStrategy(
  5, // max attempts
  (attempt) => 100 + attempt * 1000 // backoff: 100ms, 1100ms, 2100ms...
);

const client = new S3Client({
  region: 'us-east-1',
  retryStrategy,
});
```

### Request Timeout

```typescript
import { S3Client } from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@smithy/node-http-handler';

const client = new S3Client({
  region: 'us-east-1',
  requestHandler: new NodeHttpHandler({
    connectionTimeout: 5000,  // 5 seconds
    socketTimeout: 30000,     // 30 seconds
  }),
});
```

### Logging

```typescript
import { S3Client } from '@aws-sdk/client-s3';

const client = new S3Client({
  region: 'us-east-1',
  logger: {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
  },
});
```

## Testing with Mocks

### Using Vitest

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStorage } from 'cache_json_awss3_storage';

function createMockS3Client() {
  const store = new Map<string, string>();

  return {
    send: vi.fn().mockImplementation(async (command) => {
      const commandName = command.constructor.name;

      if (commandName === 'PutObjectCommand') {
        store.set(command.input.Key, command.input.Body);
        return { ETag: '"abc123"' };
      }

      if (commandName === 'GetObjectCommand') {
        const body = store.get(command.input.Key);
        if (!body) {
          throw new Error('NoSuchKey: Key not found');
        }
        return {
          Body: {
            transformToString: () => Promise.resolve(body),
          },
        };
      }

      if (commandName === 'DeleteObjectCommand') {
        store.delete(command.input.Key);
        return {};
      }

      if (commandName === 'HeadObjectCommand') {
        if (!store.has(command.input.Key)) {
          throw new Error('404 Not Found');
        }
        return {};
      }

      if (commandName === 'ListObjectsV2Command') {
        const keys = Array.from(store.keys())
          .filter((k) => k.startsWith(command.input.Prefix || ''))
          .map((Key) => ({ Key }));
        return { Contents: keys, IsTruncated: false };
      }

      return {};
    }),
    destroy: vi.fn(),
  };
}

describe('Storage', () => {
  let mockClient: ReturnType<typeof createMockS3Client>;

  beforeEach(() => {
    mockClient = createMockS3Client();
  });

  it('should save and load data', async () => {
    const storage = createStorage({
      s3Client: mockClient as any,
      bucketName: 'test-bucket',
    });

    const key = await storage.save({ user_id: 1, name: 'Test' });
    const data = await storage.load(key);

    expect(data).toEqual({ user_id: 1, name: 'Test' });

    await storage.close();
  });
});
```

### Using AWS SDK Mock

```typescript
import { mockClient } from 'aws-sdk-client-mock';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { sdkStreamMixin } from '@smithy/util-stream';
import { Readable } from 'stream';

const s3Mock = mockClient(S3Client);

beforeEach(() => {
  s3Mock.reset();
});

it('should save data', async () => {
  s3Mock.on(PutObjectCommand).resolves({ ETag: '"abc123"' });

  const storage = createStorage({
    s3Client: new S3Client({}),
    bucketName: 'test-bucket',
  });

  const key = await storage.save({ test: 'data' });
  expect(key).toHaveLength(16);
});
```

## Troubleshooting

### Common Errors

#### CredentialsProviderError

```
CredentialsProviderError: Could not load credentials from any providers
```

**Solution**: Set AWS credentials via environment variables, AWS profile, or IAM role.

```bash
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
```

#### TimeoutError

```
TimeoutError: Connection timed out
```

**Solution**: Increase timeout or check network connectivity.

```typescript
import { NodeHttpHandler } from '@smithy/node-http-handler';

const client = new S3Client({
  region: 'us-east-1',
  requestHandler: new NodeHttpHandler({
    connectionTimeout: 10000,
    socketTimeout: 60000,
  }),
});
```

#### AccessDenied

```
AccessDenied: Access Denied
```

**Solution**: Verify IAM permissions include required S3 actions.

Required IAM permissions:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket",
                "s3:HeadObject"
            ],
            "Resource": [
                "arn:aws:s3:::my-bucket",
                "arn:aws:s3:::my-bucket/*"
            ]
        }
    ]
}
```

#### InvalidBucketName

```
InvalidBucketName: The specified bucket is not valid
```

**Solution**: Ensure bucket name follows S3 naming rules:
- 3-63 characters long
- Lowercase letters, numbers, and hyphens only
- Must start with a letter or number

## ES Module vs CommonJS

### ES Modules (Recommended)

```typescript
// package.json: "type": "module"
import { S3Client } from '@aws-sdk/client-s3';
```

### CommonJS

```javascript
// package.json: "type": "commonjs"
const { S3Client } = require('@aws-sdk/client-s3');
```

## Resources

- [AWS SDK v3 Developer Guide](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/)
- [S3 Client Documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/)
- [Credential Providers](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-credential-providers/)
- [AWS IAM Policies for S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/example-policies-s3.html)
