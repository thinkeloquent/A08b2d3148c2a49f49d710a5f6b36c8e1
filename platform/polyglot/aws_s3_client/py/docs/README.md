# AWS S3 Client - Python Documentation

Python-specific documentation for the AWS S3 Client SDK.

## Quick Links

- [API Reference](../../docs/API_REFERENCE.md) - Complete API documentation
- [SDK Guide](../../docs/SDK_GUIDE.md) - Usage guide and examples
- [Server Integration](../../docs/SERVER_INTEGRATION.md) - FastAPI integration patterns
- [Behavioral Differences](../../docs/BEHAVIORAL_DIFFERENCES.md) - Python vs TypeScript differences

## Quick Start

### Installation

```bash
pip install aws-s3-client
# or
poetry add aws-s3-client
```

### Basic Usage

```python
import asyncio
from aws_s3_client import create_sdk, SDKConfig

async def main():
    config = SDKConfig(
        bucket_name="my-bucket",
        region="us-east-1",
        ttl=3600,
    )

    sdk = create_sdk(config)

    # Save data
    response = await sdk.save({"user": "alice", "score": 100})
    print(f"Saved: {response.key}")

    # Load data
    response = await sdk.load(response.key)
    print(f"Data: {response.data}")

    await sdk.close()

asyncio.run(main())
```

### FastAPI Integration

```python
from fastapi import FastAPI, Depends
from typing import Annotated

from aws_s3_client import SDKConfig, S3StorageSDK
from aws_s3_client.adapters.fastapi import create_fastapi_adapter

config = SDKConfig(bucket_name="my-bucket", region="us-east-1")
adapter = create_fastapi_adapter(config)

app = FastAPI(lifespan=adapter.lifespan)
SDK = Annotated[S3StorageSDK, Depends(adapter.get_sdk)]

@app.post("/save")
async def save(data: dict, sdk: SDK):
    return await sdk.save(data)
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `AWS_S3_BUCKET_NAME` | S3 bucket name |
| `AWS_REGION` | AWS region (default: us-east-1) |
| `AWS_ENDPOINT_URL` | Custom endpoint for LocalStack |
| `AWS_ACCESS_KEY_ID` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key |

## Examples

See the [examples/](../examples/) directory for complete examples:

- `basic_usage.py` - Core SDK features
- `fastapi_app/` - FastAPI integration example

## API Overview

### Core SDK

```python
from aws_s3_client import create_sdk, SDKConfig

sdk = create_sdk(config)

# Save with auto-generated key
await sdk.save(data, ttl=300)

# Save with custom key
await sdk.save(data, custom_key="my-custom-id")

# Load, exists, delete
await sdk.load(key)
await sdk.exists(key)
await sdk.delete(key)

# List operations
await sdk.list_keys()
await sdk.list_expired()      # List expired entries
await sdk.cleanup_expired()   # Delete expired entries

# Utilities
await sdk.stats()
await sdk.close()
```

### Agent Interface

```python
from aws_s3_client import create_agent_interface

agent = create_agent_interface(config)
await agent.store(data)
await agent.retrieve(key)
await agent.check(key)
await agent.remove(key)
await agent.list_all()
await agent.close()
```

### Key Generation

```python
from aws_s3_client import generate_key

key = generate_key({"user": "alice"})
```
