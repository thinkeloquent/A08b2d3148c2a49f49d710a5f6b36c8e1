# Aiobotocore Setup Guide

This guide covers setting up `aiobotocore` for use with the Python `cache_json_awss3_storage` package.

## Installation

```bash
pip install aiobotocore[boto3]
```

Or with the storage package:

```bash
pip install cache_json_awss3_storage[aws]
```

## Quick Start

### Using Client Factory (Recommended)

The client factory simplifies setup by combining all connection parameters into a single config object:

```python
import asyncio
from cache_json_awss3_storage import get_client_factory, ClientAsync, create_storage

async def main():
    config = get_client_factory(
        bucket_name="my-bucket",
        region_name="us-east-1",
    )

    async with ClientAsync(config) as s3_client:
        storage = create_storage(s3_client, config.bucket_name, ttl=config.ttl)

        key = await storage.save({"user_id": 123, "name": "Alice"})
        data = await storage.load(key)

        await storage.close()

asyncio.run(main())
```

### Using Client Factory with Custom Endpoint (LocalStack/MinIO)

```python
config = get_client_factory(
    bucket_name="my-bucket",
    region_name="us-east-1",
    endpoint_url="http://localhost:4566",
    aws_access_key_id="test",
    aws_secret_access_key="test",
    ttl=3600.0,
)

async with ClientAsync(config) as client:
    storage = create_storage(client, config.bucket_name, ttl=config.ttl)
    # ...
```

### Using Sync Client (boto3)

```python
from cache_json_awss3_storage import get_client_factory, ClientSync

config = get_client_factory(
    bucket_name="my-bucket",
    region_name="us-east-1",
)

with ClientSync(config) as client:
    client.put_object(Bucket=config.bucket_name, Key="test", Body=b"data")
```

### Manual Session Setup

```python
import asyncio
from aiobotocore.session import get_session
from cache_json_awss3_storage import create_storage

async def main():
    session = get_session()
    async with session.create_client('s3', region_name='us-east-1') as s3_client:
        storage = create_storage(s3_client, bucket_name='my-bucket')

        # Use storage
        key = await storage.save({'user_id': 123, 'name': 'Alice'})
        data = await storage.load(key)

        await storage.close()

asyncio.run(main())
```

## Configuration Options

### Region Configuration

```python
from aiobotocore.session import get_session

session = get_session()

# Option 1: Specify region in create_client
async with session.create_client('s3', region_name='us-west-2') as client:
    pass

# Option 2: Use environment variable
# export AWS_DEFAULT_REGION=us-west-2
async with session.create_client('s3') as client:
    pass
```

### Credential Configuration

#### Environment Variables (Recommended for Development)

```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1
```

#### Explicit Credentials

```python
from aiobotocore.session import get_session

session = get_session()
async with session.create_client(
    's3',
    region_name='us-east-1',
    aws_access_key_id='YOUR_ACCESS_KEY',
    aws_secret_access_key='YOUR_SECRET_KEY',
) as client:
    pass
```

#### AWS Profile

```python
from aiobotocore.session import AioSession

# Use a named profile from ~/.aws/credentials
session = AioSession(profile='my-profile')
async with session.create_client('s3') as client:
    pass
```

#### IAM Role (EC2/ECS/Lambda)

```python
from aiobotocore.session import get_session

# Automatically uses instance metadata or task role
session = get_session()
async with session.create_client('s3', region_name='us-east-1') as client:
    pass
```

### Custom Endpoint (LocalStack, MinIO)

```python
from aiobotocore.session import get_session

session = get_session()

# LocalStack
async with session.create_client(
    's3',
    region_name='us-east-1',
    endpoint_url='http://localhost:4566',
    aws_access_key_id='test',
    aws_secret_access_key='test',
) as client:
    pass

# MinIO
async with session.create_client(
    's3',
    region_name='us-east-1',
    endpoint_url='http://localhost:9000',
    aws_access_key_id='minioadmin',
    aws_secret_access_key='minioadmin',
) as client:
    pass
```

## Client Lifecycle Management

### Context Manager (Recommended)

```python
from aiobotocore.session import get_session
from cache_json_awss3_storage import create_storage

async def main():
    session = get_session()

    # Client is automatically closed when exiting context
    async with session.create_client('s3', region_name='us-east-1') as s3_client:
        async with create_storage(s3_client, bucket_name='my-bucket') as storage:
            key = await storage.save({'data': 'value'})
            print(f'Saved: {key}')
        # Storage closed here
    # S3 client closed here

asyncio.run(main())
```

### Manual Management

```python
from aiobotocore.session import get_session
from cache_json_awss3_storage import create_storage

async def main():
    session = get_session()
    s3_client = await session.create_client('s3', region_name='us-east-1').__aenter__()

    try:
        storage = create_storage(s3_client, bucket_name='my-bucket')
        key = await storage.save({'data': 'value'})
        await storage.close()
    finally:
        await s3_client.__aexit__(None, None, None)

asyncio.run(main())
```

## FastAPI Integration

### Lifespan Pattern (Client Factory)

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from cache_json_awss3_storage import (
    get_client_factory, ClientAsync, create_storage, JsonS3Storage,
)

config = get_client_factory(
    bucket_name="my-bucket",
    region_name="us-east-1",
    ttl=3600,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage S3 client and storage lifecycle."""
    async with ClientAsync(config) as s3_client:
        app.state.storage = create_storage(
            s3_client,
            bucket_name=config.bucket_name,
            ttl=config.ttl,
        )
        yield
        await app.state.storage.close()

app = FastAPI(lifespan=lifespan)

async def get_storage() -> JsonS3Storage:
    return app.state.storage

@app.post('/cache')
async def cache_data(data: dict, storage: JsonS3Storage = Depends(get_storage)):
    key = await storage.save(data)
    return {'key': key}
```

### Lifespan Pattern (Manual Session)

```python
from contextlib import asynccontextmanager
from aiobotocore.session import get_session
from fastapi import FastAPI, Depends
from cache_json_awss3_storage import create_storage, JsonS3Storage

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage S3 client and storage lifecycle."""
    session = get_session()

    async with session.create_client(
        's3',
        region_name='us-east-1',
    ) as s3_client:
        app.state.storage = create_storage(
            s3_client,
            bucket_name='my-bucket',
            ttl=3600,
        )

        yield

        await app.state.storage.close()

app = FastAPI(lifespan=lifespan)

async def get_storage() -> JsonS3Storage:
    return app.state.storage

@app.post('/cache')
async def cache_data(data: dict, storage: JsonS3Storage = Depends(get_storage)):
    key = await storage.save(data)
    return {'key': key}
```

## Advanced Configuration

### Connection Pooling

```python
from aiobotocore.session import get_session
from aiobotocore.config import AioConfig

session = get_session()

config = AioConfig(
    max_pool_connections=50,
    connect_timeout=5,
    read_timeout=60,
    retries={'max_attempts': 3},
)

async with session.create_client('s3', config=config) as client:
    pass
```

### Retry Configuration

```python
from aiobotocore.session import get_session
from aiobotocore.config import AioConfig

config = AioConfig(
    retries={
        'max_attempts': 5,
        'mode': 'adaptive',  # or 'standard', 'legacy'
    }
)

session = get_session()
async with session.create_client('s3', config=config) as client:
    pass
```

### Timeouts

```python
from aiobotocore.session import get_session
from aiobotocore.config import AioConfig

config = AioConfig(
    connect_timeout=10,     # Connection timeout in seconds
    read_timeout=30,        # Read timeout in seconds
)

session = get_session()
async with session.create_client('s3', config=config) as client:
    pass
```

## Testing with Moto

```python
import pytest
from moto import mock_aws
from aiobotocore.session import get_session
from cache_json_awss3_storage import create_storage

@pytest.fixture
async def mock_s3():
    """Create mock S3 client with test bucket."""
    with mock_aws():
        session = get_session()
        async with session.create_client('s3', region_name='us-east-1') as client:
            await client.create_bucket(Bucket='test-bucket')
            yield client

@pytest.mark.asyncio
async def test_storage_operations(mock_s3):
    storage = create_storage(mock_s3, bucket_name='test-bucket')

    # Test save
    key = await storage.save({'user_id': 1, 'name': 'Test'})
    assert len(key) == 16

    # Test load
    data = await storage.load(key)
    assert data == {'user_id': 1, 'name': 'Test'}

    await storage.close()
```

## Troubleshooting

### Common Errors

#### NoCredentialsError

```
botocore.exceptions.NoCredentialsError: Unable to locate credentials
```

**Solution**: Set AWS credentials via environment variables, AWS profile, or IAM role.

```bash
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
```

#### EndpointConnectionError

```
botocore.exceptions.EndpointConnectionError: Could not connect to the endpoint URL
```

**Solution**: Check region configuration and network connectivity.

```python
# Verify region is correct
async with session.create_client('s3', region_name='us-east-1') as client:
    pass
```

#### ClientError (AccessDenied)

```
botocore.exceptions.ClientError: An error occurred (AccessDenied)
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

## Resources

- [aiobotocore Documentation](https://aiobotocore.readthedocs.io/)
- [boto3 S3 Documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3.html)
- [AWS IAM Policies for S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/example-policies-s3.html)
