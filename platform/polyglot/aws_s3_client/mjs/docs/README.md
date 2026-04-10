# AWS S3 Client - TypeScript Documentation

TypeScript-specific documentation for the AWS S3 Client SDK.

## Quick Links

- [API Reference](../../docs/API_REFERENCE.md) - Complete API documentation
- [SDK Guide](../../docs/SDK_GUIDE.md) - Usage guide and examples
- [Server Integration](../../docs/SERVER_INTEGRATION.md) - Fastify integration patterns
- [Behavioral Differences](../../docs/BEHAVIORAL_DIFFERENCES.md) - TypeScript vs Python differences

## Quick Start

### Installation

```bash
npm install aws-s3-client
# or
yarn add aws-s3-client
```

### Basic Usage

```typescript
import { createSDK, type SDKConfig } from "aws-s3-client";

const config: SDKConfig = {
  bucketName: "my-bucket",
  region: "us-east-1",
  ttl: 3600,
};

const sdk = createSDK(config);

// Save data
const response = await sdk.save({ user: "alice", score: 100 });
console.log(`Saved: ${response.key}`);

// Load data
const loadResponse = await sdk.load(response.key!);
console.log(`Data:`, loadResponse.data);

await sdk.close();
```

### Fastify Integration

```typescript
import Fastify from "fastify";
import { fastifyS3Storage, type SDKConfig } from "aws-s3-client";

const config: SDKConfig = {
  bucketName: "my-bucket",
  region: "us-east-1",
};

const app = Fastify();
await app.register(fastifyS3Storage, { config });

app.post("/save", async (request) => {
  return app.s3Storage.save(request.body as Record<string, unknown>);
});
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `AWS_S3_BUCKET` | S3 bucket name |
| `AWS_REGION` | AWS region |
| `AWS_ENDPOINT_URL` | Custom endpoint for LocalStack |
| `AWS_ACCESS_KEY_ID` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key |

## Examples

See the [examples/](../examples/) directory for complete examples:

- `basic-usage.ts` - Core SDK features
- `fastify-app/` - Fastify integration example

## API Overview

### Core SDK

```typescript
import { createSDK, type SDKConfig } from "aws-s3-client";

const sdk = createSDK(config);

// Save with auto-generated key
await sdk.save(data, { ttl: 300 });

// Save with custom key
await sdk.save(data, { customKey: "my-custom-id" });

// Load, exists, delete
await sdk.load(key);
await sdk.exists(key);
await sdk.delete(key);

// List operations
await sdk.listKeys();
await sdk.listExpired();      // List expired entries
await sdk.cleanupExpired();   // Delete expired entries

// Utilities
await sdk.stats();
await sdk.close();
```

### Agent Interface

```typescript
import { createAgentInterface } from "aws-s3-client";

const agent = createAgentInterface(config);
await agent.store(data);
await agent.retrieve(key);
await agent.check(key);
await agent.remove(key);
await agent.listAll();
await agent.close();
```

### Key Generation

```typescript
import { generateKey } from "aws-s3-client";

const key = generateKey({ user: "alice" });
```

### Fastify Plugin

```typescript
import { fastifyS3Storage, registerDiagnosticRoutes } from "aws-s3-client";

await app.register(fastifyS3Storage, { config });
registerDiagnosticRoutes(app, app.s3Storage, config);
```

## TypeScript Support

Full TypeScript support with type definitions:

```typescript
import type {
  SDKConfig,
  SDKResponse,
  S3StorageSDK,
  AgentInterface,
  AgentResponse,
  FastifyS3StorageOptions,
} from "aws-s3-client";
```
