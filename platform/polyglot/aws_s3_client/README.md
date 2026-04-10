# AWS S3 Client

AWS S3-backed JSON storage with TTL support and polyglot parity for Python (FastAPI) and TypeScript (Fastify).

## Features

- **Polyglot Implementation**: Identical API in Python and TypeScript
- **SDK Interface**: High-level client for CLI, LLM Agents, and programmatic access
- **Framework Adapters**: FastAPI and Fastify integration
- **TTL Support**: Automatic expiration with lazy cleanup
- **Deterministic Keys**: SHA256-based key generation for reproducible storage
- **Custom Keys**: Override auto-generated keys with custom identifiers
- **Expired Entry Management**: List and cleanup expired entries
- **Defensive Programming**: Comprehensive logging with `logger.create()` pattern
- **CLI Tools**: Command-line interface for S3 operations

## Requirements

- **Python**: 3.11.x with FastAPI 0.115.0+
- **Node.js**: 20.x with Fastify 4.x
- **AWS**: S3 bucket with appropriate IAM permissions

## Installation

```bash
# Install all dependencies
make install

# Or install individually
make install-py   # Python
make install-mjs  # TypeScript
```

## Quick Start

### Python SDK

```python
import asyncio
from aws_s3_client import create_sdk, SDKConfig

async def main():
    config = SDKConfig(bucket_name="my-bucket", region="us-east-1")
    sdk = create_sdk(config)

    # Save data
    response = await sdk.save({"user_id": 123, "name": "Alice"})
    print(f"Saved with key: {response.key}")

    # Load data
    response = await sdk.load(response.key)
    print(f"Loaded: {response.data}")

    await sdk.close()

asyncio.run(main())
```

### TypeScript SDK

```typescript
import { createSDK, SDKConfig } from "aws-s3-client";

const config: SDKConfig = { bucketName: "my-bucket", region: "us-east-1" };
const sdk = createSDK(config);

// Save data
const saveResponse = await sdk.save({ user_id: 123, name: "Alice" });
console.log(`Saved with key: ${saveResponse.key}`);

// Load data
const loadResponse = await sdk.load(saveResponse.key!);
console.log("Loaded:", loadResponse.data);

await sdk.close();
```

## CLI Usage

```bash
# Python CLI
aws-s3-client save --bucket my-bucket < data.json
aws-s3-client load --bucket my-bucket abc123

# Node.js CLI
npx aws-s3-client save --bucket my-bucket < data.json
npx aws-s3-client load --bucket my-bucket abc123
```

## Logger Pattern

All modules use the defensive programming pattern with verbose logging:

```python
# Python
from aws_s3_client.logger import create as create_logger
logger = create_logger("aws_s3_client", __file__)
logger.info("Operation completed")
```

```typescript
// TypeScript
import { create as createLogger } from "./logger.js";
const logger = createLogger("aws_s3_client", import.meta.url);
logger.info("Operation completed");
```

## Development

```bash
# Build all
make build

# Run all tests
make test

# Lint all code
make lint

# Start development servers
make dev-py   # FastAPI on port 8000
make dev-mjs  # Fastify on port 3000
```

## License

MIT
