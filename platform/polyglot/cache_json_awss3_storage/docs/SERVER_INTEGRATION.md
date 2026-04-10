# Server Integration Guide for cache_json_awss3_storage

This guide covers framework-specific integration patterns for Fastify (Node.js) and FastAPI (Python).

## Fastify Integration (Node.js)

The integration uses a Fastify plugin pattern to initialize storage during server startup and provide per-request access.

### Pattern: Fastify Plugin (Client Factory)

```typescript
import Fastify, { FastifyInstance, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import {
  getClientFactory, createAsyncClient,
  JsonS3Storage, createStorage, createLogger,
} from "cache_json_awss3_storage";

declare module "fastify" {
  interface FastifyInstance {
    storage: JsonS3Storage;
  }
  interface FastifyRequest {
    storage: JsonS3Storage;
  }
}

const logger = createLogger("my_app", import.meta.url);

const config = getClientFactory({
  bucketName: "my-bucket",
  regionName: "us-east-1",
  ttl: 3600,
});

const storagePlugin = fp(async (fastify: FastifyInstance) => {
  const { client, destroy } = createAsyncClient(config);

  const storage = createStorage({
    s3Client: client,
    bucketName: config.bucketName,
    keyPrefix: "cache:",
    ttl: config.ttl,
    logger,
  });

  fastify.decorate("storage", storage);

  fastify.decorateRequest("storage", null);
  fastify.addHook("preHandler", async (request: FastifyRequest) => {
    request.storage = fastify.storage;
  });

  fastify.addHook("onClose", async () => {
    await storage.close();
    destroy();
  });

  fastify.log.info("Storage plugin initialized");
});
```

### Pattern: Fastify Plugin (Manual S3Client)

```typescript
import Fastify, { FastifyInstance, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { S3Client } from "@aws-sdk/client-s3";
import { JsonS3Storage, createStorage, createLogger } from "cache_json_awss3_storage";

declare module "fastify" {
  interface FastifyInstance {
    storage: JsonS3Storage;
  }
  interface FastifyRequest {
    storage: JsonS3Storage;
  }
}

const logger = createLogger("my_app", import.meta.url);

const storagePlugin = fp(async (fastify: FastifyInstance, opts) => {
  const s3Client = new S3Client({ region: "us-east-1" });

  const storage = createStorage({
    s3Client,
    bucketName: opts.bucketName,
    keyPrefix: "cache:",
    ttl: 3600,
    logger,
  });

  fastify.decorate("storage", storage);

  fastify.decorateRequest("storage", null);
  fastify.addHook("preHandler", async (request: FastifyRequest) => {
    request.storage = fastify.storage;
  });

  fastify.addHook("onClose", async () => {
    await storage.close();
    s3Client.destroy();
  });

  fastify.log.info("Storage plugin initialized");
});
```

### Usage

```typescript
const server = Fastify({ logger: true });

// Register plugin
await server.register(storagePlugin, { bucketName: "my-bucket" });

// Use in routes
server.post("/cache", async (request) => {
  const key = await request.storage.save(request.body);
  return { key };
});

server.get("/cache/:key", async (request, reply) => {
  const data = await request.storage.load(request.params.key);
  if (data === null) {
    reply.code(404);
    return { error: "Not found" };
  }
  return { data };
});

await server.listen({ port: 3000 });
```

### Lifecycle Hooks

```typescript
// Execute code when server is ready
server.addHook("onReady", async () => {
  console.log("Server ready, storage available");
});

// Execute code on graceful shutdown
server.addHook("onClose", async () => {
  await server.storage.close();
  console.log("Storage closed");
});
```

## FastAPI Integration (Python)

The integration uses the `lifespan` context manager pattern for startup/shutdown and dependency injection for per-request access.

### Pattern: Lifespan Context Manager (Client Factory)

```python
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI

from cache_json_awss3_storage import (
    get_client_factory,
    ClientAsync,
    JsonS3Storage,
    create_logger,
    create_storage,
)

logger = create_logger("my_app", __file__)

config = get_client_factory(
    bucket_name="my-bucket",
    region_name="us-east-1",
    ttl=3600,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown."""
    logger.info("Starting application...")

    async with ClientAsync(config) as s3_client:
        storage = create_storage(
            s3_client,
            bucket_name=config.bucket_name,
            key_prefix="cache:",
            ttl=config.ttl,
            logger=logger,
        )

        app.state.storage = storage
        logger.info("Storage initialized")

        yield

        logger.info("Shutting down...")
        await storage.close()
        logger.info("Storage closed")


app = FastAPI(lifespan=lifespan)
```

### Pattern: Lifespan Context Manager (Manual Session)

```python
from contextlib import asynccontextmanager
from typing import Annotated

from aiobotocore.session import get_session
from fastapi import Depends, FastAPI

from cache_json_awss3_storage import (
    JsonS3Storage,
    create_logger,
    create_storage,
)

logger = create_logger("my_app", __file__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown."""
    logger.info("Starting application...")

    session = get_session()
    async with session.create_client("s3", region_name="us-east-1") as s3_client:
        storage = create_storage(
            s3_client,
            bucket_name="my-bucket",
            key_prefix="cache:",
            ttl=3600,
            logger=logger,
        )

        app.state.storage = storage
        logger.info("Storage initialized")

        yield

        logger.info("Shutting down...")
        await storage.close()
        logger.info("Storage closed")


app = FastAPI(lifespan=lifespan)
```

### Pattern: Dependency Injection

```python
async def get_storage() -> JsonS3Storage:
    """Dependency to get storage instance."""
    return app.state.storage


# Type alias for cleaner signatures
StorageDep = Annotated[JsonS3Storage, Depends(get_storage)]


@app.post("/cache")
async def cache_data(data: dict, storage: StorageDep):
    """Cache JSON data."""
    key = await storage.save(data)
    return {"key": key}


@app.get("/cache/{key}")
async def get_cached(key: str, storage: StorageDep):
    """Get cached data by key."""
    data = await storage.load(key)
    if data is None:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}
```

### Complete Example

```python
from contextlib import asynccontextmanager
from typing import Annotated, Any

from aiobotocore.session import get_session
from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel

from cache_json_awss3_storage import (
    JsonS3Storage,
    create_logger,
    create_storage,
)

logger = create_logger("cache_api", __file__)


class CacheData(BaseModel):
    data: dict[str, Any]
    ttl: int | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    session = get_session()
    async with session.create_client("s3", region_name="us-east-1") as s3_client:
        app.state.storage = create_storage(
            s3_client,
            bucket_name="my-bucket",
            key_prefix="api:",
            ttl=3600,
            logger=logger,
        )
        yield
        await app.state.storage.close()


app = FastAPI(title="Cache API", lifespan=lifespan)


async def get_storage() -> JsonS3Storage:
    return app.state.storage


StorageDep = Annotated[JsonS3Storage, Depends(get_storage)]


@app.get("/health")
async def health(storage: StorageDep):
    stats = storage.get_stats()
    return {"status": "ok", "stats": stats.__dict__}


@app.post("/cache")
async def create_cache(body: CacheData, storage: StorageDep):
    key = await storage.save(body.data, ttl=body.ttl)
    return {"key": key}


@app.get("/cache/{key}")
async def read_cache(key: str, storage: StorageDep):
    data = await storage.load(key)
    if data is None:
        raise HTTPException(status_code=404, detail="Not found")
    return {"key": key, "data": data}


@app.delete("/cache/{key}")
async def delete_cache(key: str, storage: StorageDep):
    await storage.delete(key)
    return {"key": key, "deleted": True}
```

## AppYamlConfig Integration

Both server and CLI contexts can use the config bridge to resolve S3 connection parameters from AppYamlConfig (YAML) and environment variables.

### Fastify (Server Context)

```typescript
import {
  getClientFactoryFromAppConfig, createAsyncClient, createStorage,
} from "cache_json_awss3_storage";

export async function mount(server) {
  // Resolve config from AppYamlConfig → env vars → defaults
  const yaml = server.config.getNested(["storage", "s3"]);
  const config = getClientFactoryFromAppConfig(yaml);
  const { client, destroy } = createAsyncClient(config);

  const storage = createStorage({
    s3Client: client,
    bucketName: config.bucketName,
    ttl: config.ttl,
  });

  server.addHook("onClose", async () => {
    await storage.close();
    destroy();
  });
}
```

### FastAPI (Server Context)

```python
from cache_json_awss3_storage import (
    get_client_factory_from_app_config, ClientAsync, create_storage,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    yaml = app.state.config.get_nested("storage", "s3")
    config = get_client_factory_from_app_config(yaml)

    async with ClientAsync(config) as client:
        app.state.storage = create_storage(
            client, config.bucket_name, ttl=config.ttl,
        )
        yield
        await app.state.storage.close()
```

### CLI / Direct Call (No Server)

```typescript
// TypeScript — resolves from environment variables only
import { getClientFactoryFromAppConfig, createAsyncClient } from "cache_json_awss3_storage";

const config = getClientFactoryFromAppConfig();
const { client, destroy } = createAsyncClient(config);
// ... use client ...
destroy();
```

```python
# Python — resolves from environment variables only
from cache_json_awss3_storage import get_client_factory_from_app_config, ClientAsync

config = get_client_factory_from_app_config()
async with ClientAsync(config) as client:
    # ... use client ...
    pass
```

### CLI with AppYamlConfig Initialized

```typescript
// TypeScript — initialize AppYamlConfig first, then use YAML tier
import { AppYamlConfig } from "@internal/app-yaml-static-config";
import { getClientFactoryFromAppConfig, createAsyncClient } from "cache_json_awss3_storage";

await AppYamlConfig.initialize({ files: ["./config/base.yml"], configDir: "./config" });
const appConfig = AppYamlConfig.getInstance();
const yaml = appConfig.getNested(["storage", "s3"]);

const config = getClientFactoryFromAppConfig(yaml);
const { client, destroy } = createAsyncClient(config);
```

```python
# Python
from app_yaml_static_config import AppYamlConfig
from cache_json_awss3_storage import get_client_factory_from_app_config, ClientAsync

config_inst = AppYamlConfig.get_instance()
yaml = config_inst.get_nested("storage", "s3")

config = get_client_factory_from_app_config(yaml)
async with ClientAsync(config) as client:
    ...
```

## Common Patterns

### Health Check Endpoint

Both frameworks should include a health endpoint with storage stats:

**Fastify:**
```typescript
server.get("/health", async (request) => ({
  status: "ok",
  stats: request.storage.getStats(),
  objectCount: (await request.storage.listKeys()).length,
}));
```

**FastAPI:**
```python
@app.get("/health")
async def health(storage: StorageDep):
    stats = storage.get_stats()
    keys = await storage.list_keys()
    return {"status": "ok", "stats": stats.__dict__, "object_count": len(keys)}
```

### Error Handling

**Fastify:**
```typescript
server.setErrorHandler(async (error, request, reply) => {
  if (error instanceof JsonS3StorageClosedError) {
    reply.code(503).send({ error: "Storage unavailable" });
    return;
  }
  throw error;
});
```

**FastAPI:**
```python
@app.exception_handler(JsonS3StorageClosedError)
async def storage_closed_handler(request, exc):
    return JSONResponse(
        status_code=503,
        content={"error": "Storage unavailable"},
    )
```

### Graceful Shutdown

**Fastify:**
```typescript
process.on("SIGTERM", async () => {
  await server.close();
  process.exit(0);
});
```

**FastAPI:**
The lifespan context manager handles this automatically.

## Testing Integration

**Fastify (vitest):**
```typescript
describe("Cache API", () => {
  let server: FastifyInstance;

  beforeEach(async () => {
    server = await buildServer();
  });

  afterEach(async () => {
    await server.close();
  });

  it("should cache data", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/cache",
      payload: { data: { test: 1 } },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().key).toBeDefined();
  });
});
```

**FastAPI (pytest):**
```python
@pytest.fixture
def client(mock_storage):
    app.state.storage = mock_storage
    return TestClient(app)


def test_cache_data(client):
    response = client.post("/cache", json={"data": {"test": 1}})
    assert response.status_code == 200
    assert "key" in response.json()
```
