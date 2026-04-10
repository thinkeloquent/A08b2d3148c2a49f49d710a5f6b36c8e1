# Cache JSON AWS S3 Storage (Python)

AWS S3-backed JSON storage with TTL support for Python (FastAPI).

## Installation

```bash
pip install -e ".[dev,fastapi]"
```

## Quick Start

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

## API

See the main [README](../README.md) for full API documentation.

## License

MIT
