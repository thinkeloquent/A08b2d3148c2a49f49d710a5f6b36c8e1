# Sauce Labs API SDK -- Server Integration Guide

This guide covers how to integrate the Sauce Labs API SDK into Fastify (Node.js) and FastAPI (Python) server applications, including the lifecycle plugin pattern used by the platform.

---

## Table of Contents

1. [JavaScript: Fastify Integration](#javascript-fastify-integration)
2. [Python: FastAPI Integration](#python-fastapi-integration)
3. [Route Reference](#route-reference)
4. [Custom Application Integration](#custom-application-integration)
5. [Lifecycle Plugin Pattern](#lifecycle-plugin-pattern)
6. [Environment Configuration](#environment-configuration)

---

## JavaScript: Fastify Integration

The JavaScript server is built on **Fastify** using `fastify.decorate()` to register the SDK client and domain modules on the server instance, then exposes demo routes with structured error handling and graceful shutdown.

### Architecture Overview

```
buildServer()
  |
  +-- Creates Fastify instance
  +-- Creates SaucelabsClient via createSaucelabsClient()
  +-- Decorates server with client and domain modules
  +-- Sets global error handler for SaucelabsError
  +-- Registers all route handlers
  +-- Returns configured Fastify server

start()
  |
  +-- Calls buildServer()
  +-- Registers SIGINT/SIGTERM handlers for graceful shutdown
  +-- Calls server.listen({ port, host })
```

### Plugin Pattern with `fastify.decorate()`

The SDK client and its domain modules are made available throughout the Fastify application via `decorate()`:

```javascript
import Fastify from 'fastify';
import { createSaucelabsClient } from '../../src/index.mjs';

const server = Fastify({ logger: true });

// Create the unified client with all domain modules
const client = createSaucelabsClient({
  username: process.env.SAUCE_USERNAME,
  apiKey: process.env.SAUCE_ACCESS_KEY,
  region: process.env.SAUCE_REGION || 'us-west-1',
  rateLimitAutoWait: true,
});

// Decorate the server instance
server.decorate('saucelabs', client);
server.decorate('saucelabsClients', {
  jobs: client.jobs,
  platform: client.platform,
  users: client.users,
  upload: client.upload,
});
```

After decoration, route handlers access domain modules via `server.saucelabsClients`:

```javascript
server.get('/demo/jobs', async (request, reply) => {
  const { limit = 10, skip = 0 } = request.query;
  const jobs = await server.saucelabsClients.jobs.list({
    limit: parseInt(limit, 10),
    skip: parseInt(skip, 10),
  });
  return { success: true, data: jobs };
});

server.get('/demo/jobs/:jobId', async (request, reply) => {
  const { jobId } = request.params;
  const job = await server.saucelabsClients.jobs.get(jobId);
  return { success: true, data: job };
});
```

### Error Handler

The error handler maps `SaucelabsError` subclasses to structured JSON responses with the appropriate HTTP status code:

```javascript
import {
  SaucelabsError,
  SaucelabsNotFoundError,
  SaucelabsAuthError,
  SaucelabsRateLimitError,
  SaucelabsValidationError,
} from '../../src/index.mjs';

server.setErrorHandler((error, _request, reply) => {
  if (error instanceof SaucelabsError) {
    const status = error.statusCode || 500;
    reply.status(status).send({
      error: true,
      name: error.name,
      message: error.message,
      statusCode: status,
    });
  } else {
    reply.status(500).send({
      error: true,
      name: 'InternalError',
      message: error.message,
    });
  }
});
```

For finer-grained control within individual routes:

```javascript
server.get('/demo/jobs/:jobId', async (request, reply) => {
  const { jobId } = request.params;
  try {
    const job = await server.saucelabsClients.jobs.get(jobId);
    return { success: true, data: job };
  } catch (err) {
    if (err instanceof SaucelabsNotFoundError) {
      return reply.status(404).send({ success: false, error: `Job ${jobId} not found` });
    }
    if (err instanceof SaucelabsError) {
      return reply.status(err.statusCode || 500).send({ success: false, error: err.toJSON() });
    }
    throw err;
  }
});
```

### Graceful Shutdown

The server calls `client.close()` to release resources on shutdown:

```javascript
// Via onClose hook (recommended for plugins)
server.addHook('onClose', async () => {
  if (server.saucelabs && typeof server.saucelabs.close === 'function') {
    await server.saucelabs.close();
  }
});

// Via signal handlers (for standalone servers)
const shutdown = async (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  server.saucelabs.close();
  await server.close();
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
```

### Running the Fastify Example

```bash
SAUCE_USERNAME=your_user SAUCE_ACCESS_KEY=your_key node examples/fastify-app/server.mjs
```

---

## Python: FastAPI Integration

The Python server is built on **FastAPI** with a lifespan context manager for startup/shutdown, `app.state` for client storage, and `Depends()` for dependency injection into route handlers.

### Architecture Overview

```
lifespan(app)
  |
  +-- On startup: creates SaucelabsClient via create_saucelabs_client()
  +-- Stores client and domain modules on app.state
  +-- yield (application runs)
  +-- On shutdown: calls client.close()

app = FastAPI(lifespan=lifespan)
  |
  +-- Dependency functions extract clients from app.state
  +-- Exception handler maps SaucelabsError to JSONResponse
  +-- Route handlers use Annotated[...] DI pattern
```

### Lifespan Context Manager

The SDK uses FastAPI's lifespan for resource management. The client is created on startup and closed on shutdown:

```python
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from saucelabs_api import create_saucelabs_client

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create client with all domain modules
    config = get_config()
    client = create_saucelabs_client(
        username=config["username"],
        api_key=config["api_key"],
        region=config["region"],
        timeout=config["timeout"],
        rate_limit_auto_wait=True,
    )

    # Store on app.state (matches the lifecycle plugin pattern)
    app.state.saucelabs = client
    app.state.saucelabs_clients = {
        "jobs": client.jobs,
        "platform": client.platform,
        "users": client.users,
        "upload": client.upload,
    }

    yield  # Application runs here

    # Shutdown: close the HTTP clients
    await client.close()

app = FastAPI(
    title="Sauce Labs API Example",
    version="1.0.0",
    lifespan=lifespan,
)
```

### Dependency Injection with `Depends()`

Domain modules are extracted from `app.state` via dependency functions and injected into route handlers using `Annotated` type aliases:

```python
from typing import Annotated
from fastapi import Depends, Request
from saucelabs_api import (
    SaucelabsClient,
    JobsModule,
    PlatformModule,
    UsersModule,
)

# Dependency functions
def get_saucelabs_client(request: Request) -> SaucelabsClient:
    return request.app.state.saucelabs

def get_jobs_client(request: Request) -> JobsModule:
    return request.app.state.saucelabs_clients["jobs"]

def get_platform_client(request: Request) -> PlatformModule:
    return request.app.state.saucelabs_clients["platform"]

def get_users_client(request: Request) -> UsersModule:
    return request.app.state.saucelabs_clients["users"]

# Type aliases for cleaner route signatures
SaucelabsClientDep = Annotated[SaucelabsClient, Depends(get_saucelabs_client)]
JobsDep = Annotated[JobsModule, Depends(get_jobs_client)]
PlatformDep = Annotated[PlatformModule, Depends(get_platform_client)]
UsersDep = Annotated[UsersModule, Depends(get_users_client)]
```

Use the type aliases in route handlers:

```python
@app.get("/demo/jobs")
async def list_jobs(jobs: JobsDep, limit: int = 10, skip: int = 0) -> dict:
    result = await jobs.list(params={"limit": limit, "skip": skip})
    return {"success": True, "data": result}

@app.get("/demo/jobs/{job_id}")
async def get_job(job_id: str, jobs: JobsDep) -> dict:
    result = await jobs.get(job_id)
    return {"success": True, "data": result}

@app.get("/demo/platform/status")
async def get_platform_status(platform: PlatformDep) -> dict:
    result = await platform.get_status()
    return {"success": True, "data": result}
```

### Exception Handler

The exception handler maps `SaucelabsError` to structured JSON responses:

```python
from fastapi import Request
from fastapi.responses import JSONResponse
from saucelabs_api import SaucelabsError

@app.exception_handler(SaucelabsError)
async def saucelabs_error_handler(_request: Request, exc: SaucelabsError):
    return JSONResponse(
        status_code=exc.status_code or 500,
        content={
            "success": False,
            "error": {
                "name": type(exc).__name__,
                "message": str(exc),
                "status_code": exc.status_code,
            },
        },
    )
```

For finer-grained control within individual routes:

```python
from saucelabs_api import SaucelabsError, SaucelabsNotFoundError, SaucelabsValidationError

@app.get("/demo/jobs/{job_id}")
async def get_job(job_id: str, jobs: JobsDep) -> dict:
    try:
        result = await jobs.get(job_id)
        return {"success": True, "data": result}
    except SaucelabsNotFoundError:
        return JSONResponse(
            status_code=404,
            content={"success": False, "error": f"Job {job_id} not found"},
        )
    except SaucelabsError as err:
        return JSONResponse(
            status_code=err.status_code or 500,
            content={"success": False, "error": str(err)},
        )
```

### Running the FastAPI Example

```bash
export SAUCE_USERNAME=your_user
export SAUCE_ACCESS_KEY=your_key
uvicorn fastapi_app.main:app --reload --port 3000
```

---

## Route Reference

Both servers expose the same REST API surface. All routes proxy to the Sauce Labs API through the SDK's domain modules, with automatic rate-limit handling and error mapping.

### Health Check

```
GET /health
```

Response:

```json
{
  "status": "ok",
  "service": "saucelabs-api-example",
  "uptime": 42.5,
  "timestamp": "2026-02-01T10:30:00.000Z"
}
```

### Jobs

```
GET  /demo/jobs                          -> JobsModule.list / jobs.list
GET  /demo/jobs/:jobId                   -> JobsModule.get / jobs.get           (Fastify)
GET  /demo/jobs/{job_id}                 -> JobsModule.get / jobs.get           (FastAPI)
```

Query parameters for `/demo/jobs`:

| Parameter | Type   | Default | Description                     |
|-----------|--------|---------|---------------------------------|
| `limit`   | number | 10      | Maximum number of jobs to return |
| `skip`    | number | 0       | Number of jobs to skip           |

### Platform

```
GET  /demo/platform/status               -> PlatformModule.getStatus / platform.get_status
GET  /demo/platform/:automationApi       -> PlatformModule.getPlatforms / platform.get_platforms     (Fastify)
GET  /demo/platform/{automation_api}     -> PlatformModule.get_platforms / platform.get_platforms     (FastAPI)
```

Valid `automationApi` values: `all`, `appium`, `webdriver`

### Users

```
GET  /demo/users/:username               -> UsersModule.getUser / users.get_user                     (Fastify)
GET  /demo/users/{username}              -> UsersModule.get_user / users.get_user                    (FastAPI)
GET  /demo/users/:username/concurrency   -> UsersModule.getConcurrency / users.get_concurrency       (Fastify)
GET  /demo/users/{username}/concurrency  -> UsersModule.get_concurrency / users.get_concurrency      (FastAPI)
```

### Lifecycle Plugin Routes (Prefixed)

When registered via the lifecycle plugin, all routes are served under a versioned prefix. The v1 sub-routes are nested under the provider prefix:

```
GET    {PREFIX}/health                    -> Health check with vendor metadata
GET    {PREFIX}/v1/jobs                   -> List jobs
GET    {PREFIX}/v1/jobs/:jobId            -> Get job        (Fastify)
GET    {PREFIX}/v1/jobs/{job_id}          -> Get job        (FastAPI)
GET    {PREFIX}/v1/platform/status        -> Platform status
GET    {PREFIX}/v1/platform/:automationApi   -> Get platforms   (Fastify)
GET    {PREFIX}/v1/platform/{automation_api} -> Get platforms   (FastAPI)
GET    {PREFIX}/v1/users/:username           -> Get user        (Fastify)
GET    {PREFIX}/v1/users/{username}          -> Get user        (FastAPI)
GET    {PREFIX}/v1/users/:username/concurrency   -> Get concurrency  (Fastify)
GET    {PREFIX}/v1/users/{username}/concurrency  -> Get concurrency  (FastAPI)
POST   {PREFIX}/v1/upload                        -> Upload app
```

Where `{PREFIX}` is `/~/api/rest/02-01-2026/providers/saucelabs_api`.

---

## Custom Application Integration

### JavaScript: Using SDK Clients Without a Server

```javascript
import {
  createSaucelabsClient,
  SaucelabsClient,
  JobsModule,
  PlatformModule,
  UsersModule,
  UploadModule,
} from '../../src/index.mjs';

// Create the unified client (attaches all domain modules)
const client = createSaucelabsClient({
  username: process.env.SAUCE_USERNAME,
  apiKey: process.env.SAUCE_ACCESS_KEY,
  region: 'us-west-1',
  rateLimitAutoWait: true,
});

// Use domain modules directly
const recentJobs = await client.jobs.list({ limit: 5 });
const status = await client.platform.getStatus();
const user = await client.users.getUser('my_username');

// Always close when done
client.close();
```

### JavaScript: Embedding in an Existing Fastify App

```javascript
import Fastify from 'fastify';
import { createSaucelabsClient } from '../../src/index.mjs';

const app = Fastify({ logger: true });

const client = createSaucelabsClient({
  username: process.env.SAUCE_USERNAME,
  apiKey: process.env.SAUCE_ACCESS_KEY,
});

// Decorate your app with the clients
app.decorate('saucelabs', client);
app.decorate('saucelabsClients', {
  jobs: client.jobs,
  platform: client.platform,
  users: client.users,
  upload: client.upload,
});

// Register your own routes that use the SDK
app.get('/api/jobs', async (request) => {
  return app.saucelabsClients.jobs.list(request.query);
});

app.get('/api/platform/status', async () => {
  return app.saucelabsClients.platform.getStatus();
});

// Cleanup on close
app.addHook('onClose', async () => {
  client.close();
});

await app.listen({ port: 3000 });
```

### Python: Using SDK Clients Without a Server

```python
import asyncio
from saucelabs_api import create_saucelabs_client

async def main():
    client = create_saucelabs_client(
        username="my_username",
        api_key="my_access_key",
        region="us-west-1",
        rate_limit_auto_wait=True,
    )

    async with client:
        # Use domain modules directly
        recent_jobs = await client.jobs.list(params={"limit": 5})
        status = await client.platform.get_status()
        user = await client.users.get_user("my_username")

        print(recent_jobs)
        print(status)
        print(user)

asyncio.run(main())
```

### Python: Embedding in an Existing FastAPI App

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Depends
from saucelabs_api import create_saucelabs_client, JobsModule, PlatformModule

@asynccontextmanager
async def lifespan(app: FastAPI):
    client = create_saucelabs_client(
        username="my_username",
        api_key="my_access_key",
    )
    app.state.saucelabs = client
    app.state.saucelabs_clients = {
        "jobs": client.jobs,
        "platform": client.platform,
        "users": client.users,
        "upload": client.upload,
    }
    yield
    await client.close()

app = FastAPI(title="My Platform API", lifespan=lifespan)

def get_jobs(request: Request) -> JobsModule:
    return request.app.state.saucelabs_clients["jobs"]

@app.get("/api/jobs")
async def list_jobs(jobs: JobsModule = Depends(get_jobs)):
    return await jobs.list()

@app.get("/api/platform/status")
async def platform_status(request: Request):
    return await request.app.state.saucelabs_clients["platform"].get_status()
```

---

## Lifecycle Plugin Pattern

The platform uses numbered lifecycle hooks to initialize SDK providers during server startup. The Sauce Labs API SDK is loaded at order **520** (after core services, GitHub SDK, and Figma SDK).

### Fastify Lifecycle Plugin

**File:** `fastify_server/config/lifecycle/520.saucelabs_api.lifecycle.mjs`

The lifecycle plugin:

1. Resolves credentials from server config or environment variables.
2. Creates the `SaucelabsClient` via `createSaucelabsClient()`.
3. Decorates the Fastify instance with `server.saucelabs` and `server.saucelabsClients`.
4. Determines the API release date from server config and constructs the route prefix.
5. Registers all routes under `{PREFIX}/health` and `{PREFIX}/v1/*`.
6. Adds an `onClose` hook to call `client.close()`.

```javascript
import { createSaucelabsClient } from '../../../polyglot/saucelabs_api/mjs/src/index.mjs';

const VENDOR = 'saucelabs_api';
const VENDOR_VERSION = 'v1';

export async function onStartup(server, config) {
  const { username, apiKey } = resolveSaucelabsCredentials(server);

  const saucelabs = createSaucelabsClient({ username, apiKey });

  const clients = {
    jobs: saucelabs.jobs,
    platform: saucelabs.platform,
    users: saucelabs.users,
    upload: saucelabs.upload,
  };

  // Decorate server instance
  server.decorate('saucelabs', saucelabs);
  server.decorate('saucelabsClients', clients);

  // Build prefix from API release date
  const apiReleaseDate = server.config.getNested([
    'api_release_date', 'contract_snapshot_date', 'provider_saucelabs',
  ]);
  const PREFIX = `/~/api/rest/${apiReleaseDate}/providers/${VENDOR}`;

  // Register routes
  await server.register(async function saucelabsApiRoutes(scope) {
    scope.get('/health', async () => ({
      status: 'ok',
      vendor: VENDOR,
      vendor_version: VENDOR_VERSION,
    }));

    await scope.register(async (v1) => {
      v1.get('/jobs', async (req) => clients.jobs.list(req.query));
      v1.get('/jobs/:jobId', async (req) => clients.jobs.get(req.params.jobId));
      v1.get('/platform/status', async () => clients.platform.getStatus());
      v1.get('/platform/:automationApi', async (req) => clients.platform.getPlatforms(req.params.automationApi));
      v1.get('/users/:username', async (req) => clients.users.getUser(req.params.username));
      v1.get('/users/:username/concurrency', async (req) => clients.users.getConcurrency(req.params.username));
      v1.post('/upload', async (req) => clients.upload.uploadApp(req.body));
    }, { prefix: '/v1' });
  }, { prefix: PREFIX });

  // Cleanup on close
  server.addHook('onClose', async () => {
    if (saucelabs && typeof saucelabs.close === 'function') {
      await saucelabs.close();
    }
  });
}

export async function onShutdown(server) {
  server.log?.info?.('[saucelabs_api] Sauce Labs API shutdown complete');
}
```

### FastAPI Lifecycle Plugin

**File:** `fastapi_server/config/lifecycle/520_saucelabs_api.lifecycle.py`

The lifecycle plugin follows the same pattern using `app.state` and `APIRouter`:

1. Resolves credentials from app config or environment variables.
2. Creates the `SaucelabsClient` via `create_saucelabs_client()`.
3. Stores the client and domain modules on `app.state.saucelabs` and `app.state.saucelabs_clients`.
4. Determines the API release date and constructs the route prefix.
5. Registers all routes via `APIRouter(prefix=PREFIX)` with a nested `v1` sub-router.
6. The `onShutdown` hook calls `client.close()`.

```python
from saucelabs_api import create_saucelabs_client
from fastapi import APIRouter, FastAPI, Request
from fastapi.responses import JSONResponse

VENDOR = "saucelabs_api"
VENDOR_VERSION = "v1"

async def onStartup(app: FastAPI, config: dict) -> None:
    creds = _resolve_saucelabs_credentials(app)

    saucelabs = create_saucelabs_client(
        username=creds["username"],
        api_key=creds["api_key"],
    )

    clients = {
        "jobs": saucelabs.jobs,
        "platform": saucelabs.platform,
        "users": saucelabs.users,
        "upload": saucelabs.upload,
    }

    # Store on app.state
    app.state.saucelabs = saucelabs
    app.state.saucelabs_clients = clients

    # Build prefix from API release date
    api_release_date = app.state.config.get_nested(
        "api_release_date", "contract_snapshot_date", "provider_saucelabs"
    )
    PREFIX = f"/~/api/rest/{api_release_date}/providers/{VENDOR}"

    # Register routes
    router = APIRouter(prefix=PREFIX)

    @router.get("/health")
    async def saucelabs_health():
        return JSONResponse(content={
            "status": "ok",
            "vendor": VENDOR,
            "vendor_version": VENDOR_VERSION,
        })

    v1 = APIRouter(prefix="/v1")

    @v1.get("/jobs")
    async def list_jobs(request: Request):
        return await request.app.state.saucelabs_clients["jobs"].list(
            params=dict(request.query_params)
        )

    @v1.get("/jobs/{job_id}")
    async def get_job(job_id: str, request: Request):
        return await request.app.state.saucelabs_clients["jobs"].get(job_id)

    # ... platform, users, upload routes ...

    router.include_router(v1)
    app.include_router(router)

async def onShutdown(app: FastAPI, config: dict) -> None:
    client = getattr(app.state, "saucelabs", None)
    if client:
        await client.close()
```

### Accessing SDK Clients in Other Lifecycle Plugins

Once the Sauce Labs lifecycle plugin has run (order 520+), any subsequent plugin or route handler can access the clients:

**Fastify:**

```javascript
// In a later lifecycle plugin or route handler
const jobs = req.server.saucelabsClients.jobs;
const result = await jobs.list({ limit: 5 });
```

**FastAPI:**

```python
# In a later lifecycle plugin or route handler
jobs = request.app.state.saucelabs_clients["jobs"]
result = await jobs.list(params={"limit": 5})
```

---

## Environment Configuration

Both server implementations read configuration from the same environment variables:

```bash
# Authentication (required)
export SAUCE_USERNAME="your_username"
export SAUCE_ACCESS_KEY="your_access_key"

# Region (optional, default: us-west-1)
export SAUCE_REGION="us-west-1"         # us-west-1 | us-east-4 | eu-central-1

# Server (optional)
export PORT="3000"
export HOST="0.0.0.0"

# Logging (optional)
export LOG_LEVEL="info"                 # trace | debug | info | warn | error | silent

# Timeout (optional, Python only -- in seconds)
export SAUCE_TIMEOUT="30"
```

### Fallback Environment Variables

The SDK also checks alternate variable names when the primary ones are not set:

| Primary              | Fallback               | Description          |
|----------------------|------------------------|----------------------|
| `SAUCE_USERNAME`     | `SAUCELABS_USERNAME`   | Sauce Labs username  |
| `SAUCE_ACCESS_KEY`   | `SAUCELABS_ACCESS_KEY` | Sauce Labs access key |

### Production Deployment

**JavaScript with Docker:**

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
ENV SAUCE_USERNAME=""
ENV SAUCE_ACCESS_KEY=""
ENV SAUCE_REGION="us-west-1"
ENV PORT=3000
ENV HOST=0.0.0.0
ENV LOG_LEVEL=info
EXPOSE 3000
CMD ["node", "examples/fastify-app/server.mjs"]
```

**Python with Docker:**

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV SAUCE_USERNAME=""
ENV SAUCE_ACCESS_KEY=""
ENV SAUCE_REGION="us-west-1"
ENV PORT=3000
ENV HOST=0.0.0.0
ENV LOG_LEVEL=info
EXPOSE 3000
CMD ["uvicorn", "fastapi_app.main:app", "--host", "0.0.0.0", "--port", "3000"]
```

### Health Monitoring

Both servers expose a `/health` endpoint suitable for load balancer health checks:

```bash
# Standalone example server
curl http://localhost:3000/health
# {"status":"ok","service":"saucelabs-api-example","uptime":42.5,"timestamp":"2026-02-01T10:30:00.000Z"}

# Lifecycle plugin (prefixed)
curl http://localhost:3000/~/api/rest/02-01-2026/providers/saucelabs_api/health
# {"status":"ok","vendor":"saucelabs_api","vendor_version":"v1"}
```
