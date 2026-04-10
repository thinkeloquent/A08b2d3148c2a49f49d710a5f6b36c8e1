# Server Integration Guide for AWS S3 Client

This guide covers framework-specific integration patterns for Fastify (Node.js) and FastAPI (Python). Both integrations provide lifecycle management, dependency injection, and diagnostic routes.

## Fastify Integration (Node.js)

The Fastify integration uses the plugin pattern with decorators for SDK access.

### Installation

```bash
npm install aws-s3-client fastify
```

### Pattern: Fastify Plugin

```typescript
import Fastify from "fastify";
import {
  fastifyS3Storage,
  registerDiagnosticRoutes,
  type SDKConfig,
} from "aws-s3-client";

// Configuration
const config: SDKConfig = {
  bucketName: process.env.AWS_S3_BUCKET ?? "my-bucket",
  region: process.env.AWS_REGION ?? "us-east-1",
  endpointUrl: process.env.AWS_ENDPOINT_URL, // For LocalStack
  keyPrefix: "myapp:",
  ttl: 3600,
  debug: true,
};

// Create Fastify app
const app = Fastify({ logger: true });

// Register S3 storage plugin
await app.register(fastifyS3Storage, { config });

// Register health and debug routes (optional)
registerDiagnosticRoutes(app, app.s3Storage, config);
// Creates: GET /s3/health, GET /s3/debug
```

### Usage in Routes

```typescript
// Access SDK via decorator
app.post("/save", async (request, reply) => {
  const data = request.body as Record<string, unknown>;
  const response = await app.s3Storage.save(data);

  if (!response.success) {
    reply.status(500);
    return { error: response.error };
  }

  return {
    success: true,
    key: response.key,
    elapsedMs: response.elapsedMs,
  };
});

app.get("/load/:key", async (request, reply) => {
  const { key } = request.params as { key: string };
  const response = await app.s3Storage.load(key);

  if (!response.success) {
    reply.status(500);
    return { error: response.error };
  }

  return {
    success: true,
    data: response.data,
    elapsedMs: response.elapsedMs,
  };
});
```

### Custom Decorator Name

```typescript
await app.register(fastifyS3Storage, {
  config,
  decoratorName: "storage", // Access via app.storage instead of app.s3Storage
});
```

### Lifecycle Management

The plugin automatically handles cleanup on server shutdown:

```typescript
// SDK is closed automatically when server stops
await app.close(); // Triggers onClose hook, calls sdk.close()
```

### Complete Example

```typescript
import Fastify from "fastify";
import { fastifyS3Storage, registerDiagnosticRoutes, type SDKConfig } from "aws-s3-client";

const config: SDKConfig = {
  bucketName: "my-bucket",
  region: "us-east-1",
  ttl: 3600,
};

async function main() {
  const app = Fastify({ logger: true });

  await app.register(fastifyS3Storage, { config });
  registerDiagnosticRoutes(app, app.s3Storage, config);

  app.post("/storage/save", async (request) => {
    const response = await app.s3Storage.save(request.body as Record<string, unknown>);
    return { key: response.key, success: response.success };
  });

  app.get("/storage/load/:key", async (request) => {
    const { key } = request.params as { key: string };
    const response = await app.s3Storage.load(key);
    return { data: response.data, success: response.success };
  });

  await app.listen({ host: "0.0.0.0", port: 8000 });
}

main();
```

## FastAPI Integration (Python)

The FastAPI integration uses the lifespan context manager with dependency injection.

### Installation

```bash
pip install aws-s3-client fastapi uvicorn
```

### Pattern: Lifespan Context Manager

```python
from fastapi import FastAPI, Depends
from typing import Annotated

from aws_s3_client import SDKConfig, S3StorageSDK
from aws_s3_client.adapters.fastapi import create_fastapi_adapter

# Configuration
config = SDKConfig(
    bucket_name=os.environ.get("AWS_S3_BUCKET_NAME", "my-bucket"),
    region=os.environ.get("AWS_REGION", "us-east-1"),
    endpoint_url=os.environ.get("AWS_ENDPOINT_URL"),  # For LocalStack
    key_prefix="myapp:",
    ttl=3600,
    debug=True,
)

# Create adapter
adapter = create_fastapi_adapter(config)

# Create app with lifespan
app = FastAPI(
    title="My App",
    lifespan=adapter.lifespan,
)

# Register diagnostic routes (optional)
app.get("/health")(adapter.create_health_route())
app.get("/debug")(adapter.create_debug_route())
```

### Usage with Dependency Injection

```python
# Type alias for cleaner annotations
SDK = Annotated[S3StorageSDK, Depends(adapter.get_sdk)]


@app.post("/save")
async def save_data(data: dict, sdk: SDK):
    response = await sdk.save(data)

    if not response.success:
        raise HTTPException(status_code=500, detail=response.error)

    return {
        "success": True,
        "key": response.key,
        "elapsed_ms": response.elapsed_ms,
    }


@app.get("/load/{key}")
async def load_data(key: str, sdk: SDK):
    response = await sdk.load(key)

    if not response.success:
        raise HTTPException(status_code=500, detail=response.error)

    return {
        "success": True,
        "data": response.data,
        "elapsed_ms": response.elapsed_ms,
    }
```

### Lifecycle Management

The adapter handles startup and shutdown automatically:

```python
# Lifespan manages SDK lifecycle
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: SDK is created
    yield
    # Shutdown: SDK is closed automatically
```

### Complete Example

```python
import os
from typing import Annotated, Any

from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel

from aws_s3_client import SDKConfig, S3StorageSDK
from aws_s3_client.adapters.fastapi import create_fastapi_adapter

# Configuration
config = SDKConfig(
    bucket_name=os.environ.get("AWS_S3_BUCKET_NAME", "my-bucket"),
    region=os.environ.get("AWS_REGION", "us-east-1"),
    ttl=3600,
)

# Create adapter
adapter = create_fastapi_adapter(config)

# Create app
app = FastAPI(lifespan=adapter.lifespan)

# Dependency type
SDK = Annotated[S3StorageSDK, Depends(adapter.get_sdk)]

# Health routes
app.get("/health")(adapter.create_health_route())
app.get("/debug")(adapter.create_debug_route())


class SaveRequest(BaseModel):
    data: dict[str, Any]
    ttl: int | None = None


@app.post("/storage/save")
async def save_data(request: SaveRequest, sdk: SDK):
    response = await sdk.save(request.data, ttl=request.ttl)
    if not response.success:
        raise HTTPException(status_code=500, detail=response.error)
    return {"key": response.key, "success": True}


@app.get("/storage/load/{key}")
async def load_data(key: str, sdk: SDK):
    response = await sdk.load(key)
    if not response.success:
        raise HTTPException(status_code=500, detail=response.error)
    return {"data": response.data, "success": True}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## Diagnostic Routes

Both integrations provide health and debug endpoints.

### Health Route

Returns current health status and statistics.

```json
{
  "status": "healthy",
  "bucket": "my-bucket",
  "stats": {
    "saves": 10,
    "loads": 25,
    "hits": 20,
    "misses": 5
  }
}
```

### Debug Route

Returns detailed SDK information (for development only).

```json
{
  "success": true,
  "data": {
    "config": {
      "bucketName": "my-bucket",
      "region": "us-east-1",
      "keyPrefix": "myapp:"
    },
    "stats": {...},
    "lastError": null
  }
}
```

## LocalStack Development

For local development with LocalStack:

### Docker Compose

```yaml
version: "3.8"
services:
  localstack:
    image: localstack/localstack
    ports:
      - "4566:4566"
    environment:
      - SERVICES=s3
      - DEBUG=1
```

### Environment Setup

```bash
# Create bucket
aws --endpoint-url=http://localhost:4566 s3 mb s3://local-bucket

# Run application
export AWS_S3_BUCKET=local-bucket  # Node.js
export AWS_S3_BUCKET_NAME=local-bucket  # Python
export AWS_ENDPOINT_URL=http://localhost:4566
```

## Error Handling Patterns

### Fastify

```typescript
app.post("/save", async (request, reply) => {
  try {
    const response = await app.s3Storage.save(request.body);

    if (!response.success) {
      reply.status(500);
      return {
        error: response.error,
        elapsedMs: response.elapsedMs,
      };
    }

    return { key: response.key };
  } catch (error) {
    app.log.error(error, "Unexpected error");
    reply.status(500);
    return { error: "Internal server error" };
  }
});
```

### FastAPI

```python
@app.post("/save")
async def save_data(data: dict, sdk: SDK):
    try:
        response = await sdk.save(data)

        if not response.success:
            raise HTTPException(
                status_code=500,
                detail={
                    "error": response.error,
                    "elapsed_ms": response.elapsed_ms,
                },
            )

        return {"key": response.key}

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail="Internal server error")
```

## Type Safety

### Fastify TypeScript

```typescript
// Types are automatically available after plugin registration
declare module "fastify" {
  interface FastifyInstance {
    s3Storage: S3StorageSDK;
  }
}
```

### FastAPI with Pydantic

```python
from pydantic import BaseModel

class SaveRequest(BaseModel):
    data: dict[str, Any]
    ttl: int | None = None

class SaveResponse(BaseModel):
    success: bool
    key: str | None
    elapsed_ms: float

@app.post("/save", response_model=SaveResponse)
async def save_data(request: SaveRequest, sdk: SDK) -> SaveResponse:
    response = await sdk.save(request.data, ttl=request.ttl)
    return SaveResponse(
        success=response.success,
        key=response.key,
        elapsed_ms=response.elapsed_ms,
    )
```
