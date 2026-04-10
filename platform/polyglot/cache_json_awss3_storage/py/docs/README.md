# Cache JSON AWS S3 Storage - Python Documentation

## Installation

```bash
pip install -e ".[dev,fastapi]"
```

## Quick Start

```python
import asyncio
from aiobotocore.session import get_session
from cache_json_awss3_storage import create_storage, generate_key, generate_key_from_value

async def main():
    session = get_session()
    async with session.create_client('s3', region_name='us-east-1') as s3_client:
        storage = create_storage(
            s3_client,
            bucket_name='my-bucket',
            ttl=3600,  # 1 hour TTL
        )

        # Save with custom key
        await storage.save('my-custom-key', {'user_id': 123, 'name': 'Alice'})

        # Load with custom key
        data = await storage.load('my-custom-key')
        print(f'Loaded: {data}')

        # Close storage
        await storage.close()

asyncio.run(main())
```

## Key Generation

Generate keys from objects using the provided utility functions:

```python
from cache_json_awss3_storage import (
    generate_key,
    generate_key_from_value,
    generate_key_from_fields,
)

# Generate key from specific fields (for lookup by identifiers)
key1 = generate_key({"user_id": 123, "action": "login"})
# key1 is based on user_id + action

# Generate key from entire value (content-addressable)
key2 = generate_key_from_value({"name": "Alice", "score": 100})
# Same data always produces same key

# Generate key from selected fields only
key3 = generate_key_from_fields(
    {"user_id": 123, "action": "login", "timestamp": 1234567890},
    ["user_id", "action"]
)
# Key ignores timestamp field

# Use generated key with storage
await storage.save(key1, {"user_id": 123, "action": "login", "details": "..."})
data = await storage.load(key1)
```

## TTL Support

```python
# Default TTL from config
storage = create_storage(s3_client, bucket_name='my-bucket', ttl=3600)

# Override TTL per save
await storage.save('session-key', {'session': 'data'}, ttl=300)  # 5 minutes

# No expiration
await storage.save('permanent-key', {'data': 'value'}, ttl=0)
```

## Async Context Manager

```python
async with create_storage(s3_client, bucket_name='my-bucket') as storage:
    key = await storage.save({'test': 'data'})
    data = await storage.load(key)
# Storage is automatically closed
```

## Logger Integration

```python
from cache_json_awss3_storage import create_logger, create_storage

# Create custom logger
logger = create_logger("my_app", __file__)

# Inject into storage
storage = create_storage(
    s3_client,
    bucket_name='my-bucket',
    logger=logger,
)
```

## FastAPI Integration

See `examples/fastapi_app/main.py` for a complete example.

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from cache_json_awss3_storage import create_storage

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize storage at startup
    app.state.storage = create_storage(s3_client, bucket_name='my-bucket')
    yield
    # Cleanup at shutdown
    await app.state.storage.close()

app = FastAPI(lifespan=lifespan)

async def get_storage():
    return app.state.storage

@app.post("/cache")
async def cache_data(data: dict, storage = Depends(get_storage)):
    key = await storage.save(data)
    return {"key": key}
```

## API Reference

See the main [API Reference](../../docs/API_REFERENCE.md) for complete documentation.

## Running Tests

```bash
# From the py/ directory
pytest -v

# With coverage
pytest --cov=cache_json_awss3_storage --cov-report=html
```
