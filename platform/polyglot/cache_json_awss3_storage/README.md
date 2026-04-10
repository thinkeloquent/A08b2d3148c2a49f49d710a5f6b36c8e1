# Cache JSON AWS S3 Storage

AWS S3-backed JSON storage with TTL support and polyglot parity for Python (FastAPI) and TypeScript (Fastify).

## Features

- **Polyglot Implementation**: Identical API in Python and TypeScript
- **TTL Support**: Automatic expiration with lazy cleanup
- **Deterministic Keys**: SHA256-based key generation for reproducible storage
- **Comprehensive Logging**: Defensive programming with verbose logging
- **Error Handling**: Typed exceptions with full context
- **Statistics Tracking**: Operation metrics for monitoring
- **S3-Specific Features**: Encryption, storage classes, retry logic

## Requirements

- **Python**: 3.11.x with FastAPI 0.115.0+
- **Node.js**: 20.x with Fastify 4.x
- **AWS**: S3 bucket with appropriate IAM permissions

## Installation

```bash
# Install all dependencies
make install

# Or install individually
make install-py  # Python
make install-mjs  # TypeScript
```

## Quick Start

### Python

```python
import asyncio
from aiobotocore.session import get_session
from cache_json_awss3_storage import create_storage

async def main():
    session = get_session()
    async with session.create_client('s3', region_name='us-east-1') as s3_client:
        storage = create_storage(
            s3_client,
            bucket_name='my-bucket',
            ttl=3600,  # 1 hour TTL
        )

        # Save data
        key = await storage.save({'user_id': 123, 'name': 'Alice'})
        print(f'Saved with key: {key}')

        # Load data
        data = await storage.load(key)
        print(f'Loaded: {data}')

        # Close storage
        await storage.close()

asyncio.run(main())
```

### TypeScript

```typescript
import { S3Client } from '@aws-sdk/client-s3';
import { createStorage } from 'cache_json_awss3_storage';

const s3Client = new S3Client({ region: 'us-east-1' });

const storage = createStorage({
  s3Client,
  bucketName: 'my-bucket',
  ttl: 3600,  // 1 hour TTL
});

// Save data
const key = await storage.save({ user_id: 123, name: 'Alice' });
console.log(`Saved with key: ${key}`);

// Load data
const data = await storage.load(key);
console.log('Loaded:', data);

// Close storage
await storage.close();
```

## API

### Core Methods

| Method | Description |
|--------|-------------|
| `save(data, options?)` | Save JSON data, returns storage key |
| `load(dataOrKey, options?)` | Load data by key or data object |
| `delete(dataOrKey)` | Delete data by key or data object |
| `exists(dataOrKey)` | Check if data exists |
| `listKeys()` | List all storage keys |
| `clear()` | Delete all objects |
| `cleanupExpired()` | Delete expired objects |
| `close()` | Close storage instance |

### Diagnostics

| Method | Description |
|--------|-------------|
| `getStats()` | Get operation statistics |
| `getErrors()` | Get error history |
| `getLastError()` | Get most recent error |
| `clearErrors()` | Clear error history |
| `debugInfo()` | Get comprehensive debug info |

## Configuration

| Option | Python | TypeScript | Default | Description |
|--------|--------|------------|---------|-------------|
| `s3_client` / `s3Client` | Required | Required | - | AWS S3 client |
| `bucket_name` / `bucketName` | Required | Required | - | S3 bucket name |
| `key_prefix` / `keyPrefix` | Optional | Optional | `"jss3:"` | Key namespace prefix |
| `hash_keys` / `hashKeys` | Optional | Optional | - | Fields for key generation |
| `ttl` | Optional | Optional | - | Default TTL in seconds |
| `storage_class` / `storageClass` | Optional | Optional | `STANDARD` | S3 storage class |
| `encryption` | Optional | Optional | - | Encryption config |
| `debug` | Optional | Optional | `false` | Enable debug logging |
| `logger` | Optional | Optional | - | Custom logger instance |

## Logger Interface

The package provides a unified logging interface for defensive programming:

```python
# Python
from cache_json_awss3_storage import create_logger

logger = create_logger("my_app", __file__)
logger.debug("Debug message")
logger.info("Info message")
logger.warn("Warning message")
logger.error("Error message")
```

```typescript
// TypeScript
import { createLogger } from 'cache_json_awss3_storage';

const logger = createLogger("my_app", import.meta.url);
logger.debug("Debug message");
logger.info("Info message");
logger.warn("Warning message");
logger.error("Error message");
```

## Development

```bash
# Build all
make build

# Run all tests
make test

# Lint all code
make lint

# Verify cross-language parity
make verify-parity

# Clean artifacts
make clean
```

## License

MIT
