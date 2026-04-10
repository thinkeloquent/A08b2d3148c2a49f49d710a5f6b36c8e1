# Figma API SDK -- Server Integration Guide

This guide covers how to use the SDK's built-in server, and how to integrate the SDK into your own custom server applications.

---

## Table of Contents

1. [Built-in Server (Quick Start)](#built-in-server-quick-start)
2. [JavaScript: Fastify Integration](#javascript-fastify-integration)
3. [Python: FastAPI Integration](#python-fastapi-integration)
4. [Route Reference](#route-reference)
5. [Custom Application Integration](#custom-application-integration)
6. [Environment Configuration](#environment-configuration)

---

## Built-in Server (Quick Start)

Both implementations ship a ready-to-run HTTP server that exposes every Figma API endpoint as a REST route.

### JavaScript

```javascript
import { createServer, startServer } from '@internal/figma-api';

const { server, client } = createServer({
  token: process.env.FIGMA_TOKEN,
  timeout: 30000,
  maxRetries: 3,
  rateLimitAutoWait: true,
  cache: { maxSize: 100, ttl: 300 },
});

await startServer(server, {
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || '0.0.0.0',
});
```

### Python

```python
# figma_api/server.py (or your entry point)
from figma_api import create_app, Config

config = Config.from_env()
app = create_app(config)
```

Run with uvicorn:

```bash
export FIGMA_TOKEN="figd_your_token"
uvicorn figma_api.server:app --host 0.0.0.0 --port 3000
```

Both servers expose identical routes and response shapes. See [Route Reference](#route-reference) below.

---

## JavaScript: Fastify Integration

The JavaScript server is built on **Fastify** with `@fastify/cors` and `@fastify/sensible` plugins.

### Architecture Overview

```
createServer(options)
  |
  +-- Creates FigmaClient with provided options
  +-- Creates all domain clients (FilesClient, ProjectsClient, etc.)
  +-- Instantiates Fastify with @fastify/cors, @fastify/sensible
  +-- Registers all route handlers
  +-- Decorates domain clients onto the Fastify instance
  +-- Returns { server, client }

startServer(server, { port, host })
  |
  +-- Calls server.listen({ port, host })
  +-- Logs startup info
```

### Using `createServer`

```javascript
import { createServer, startServer } from '@internal/figma-api';

const { server, client } = createServer({
  token: 'figd_...',
  baseUrl: 'https://api.figma.com',
  timeout: 30000,
  maxRetries: 3,
  rateLimitAutoWait: true,
  cache: { maxSize: 100, ttl: 300 },
});
```

`createServer` returns:
- `server` -- The Fastify instance with all routes registered and domain clients decorated.
- `client` -- The `FigmaClient` instance, available for direct use outside route handlers.

### Accessing Domain Clients Inside Route Handlers

Domain clients are decorated onto the Fastify instance and can be accessed within custom route handlers:

```javascript
import { createServer, startServer } from '@internal/figma-api';

const { server, client } = createServer({ token: 'figd_...' });

// Add a custom route that uses SDK clients
server.get('/custom/file-summary/:fileKey', async (request, reply) => {
  const { fileKey } = request.params;

  // Access the files client from the decorated Fastify instance
  const file = await server.filesClient.getFile(fileKey, { depth: 1 });

  return {
    name: file.name,
    lastModified: file.lastModified,
    version: file.version,
    pageCount: file.document.children.length,
  };
});

await startServer(server, { port: 3000, host: '0.0.0.0' });
```

### Adding Middleware and Hooks

Fastify hooks can be added before or after `startServer`:

```javascript
import { createServer, startServer } from '@internal/figma-api';

const { server } = createServer({ token: 'figd_...' });

// Add an authentication hook
server.addHook('onRequest', async (request, reply) => {
  const apiKey = request.headers['x-api-key'];
  if (apiKey !== process.env.INTERNAL_API_KEY) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
});

// Add a logging hook
server.addHook('onResponse', async (request, reply) => {
  console.log(`${request.method} ${request.url} -> ${reply.statusCode}`);
});

await startServer(server, { port: 3000 });
```

### Embedding in an Existing Fastify App

If you already have a Fastify application, you can register the SDK routes as a plugin:

```javascript
import Fastify from 'fastify';
import { FigmaClient, FilesClient, ProjectsClient } from '@internal/figma-api';

const app = Fastify({ logger: true });

// Create SDK clients
const figmaClient = new FigmaClient({ token: 'figd_...' });
const filesClient = new FilesClient(figmaClient);
const projectsClient = new ProjectsClient(figmaClient);

// Decorate your app with the clients
app.decorate('figmaClient', figmaClient);
app.decorate('filesClient', filesClient);
app.decorate('projectsClient', projectsClient);

// Register your own routes that use the SDK
app.get('/api/files/:fileKey', async (request) => {
  const { fileKey } = request.params;
  return app.filesClient.getFile(fileKey);
});

app.get('/api/teams/:teamId/projects', async (request) => {
  const { teamId } = request.params;
  return app.projectsClient.getTeamProjects(teamId);
});

// Add your other routes and plugins
app.register(import('./my-other-plugin.mjs'));

await app.listen({ port: 3000 });
```

### CORS Configuration

The built-in server enables CORS via `@fastify/cors` with permissive defaults. To customize:

```javascript
import { createServer, startServer } from '@internal/figma-api';

const { server } = createServer({ token: 'figd_...' });

// Override CORS (must be done before startServer)
await server.register(import('@fastify/cors'), {
  origin: ['https://your-app.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
});

await startServer(server, { port: 3000 });
```

### Error Handling in Routes

The built-in routes map SDK errors to appropriate HTTP responses. For custom routes:

```javascript
import { FigmaError, NotFoundError, RateLimitError } from '@internal/figma-api';

server.get('/custom/:fileKey', async (request, reply) => {
  try {
    return await server.filesClient.getFile(request.params.fileKey);
  } catch (err) {
    if (err instanceof NotFoundError) {
      reply.code(404).send({ error: 'File not found' });
    } else if (err instanceof RateLimitError) {
      reply.code(429).send({
        error: 'Rate limited',
        retryAfter: err.meta.rateLimitInfo?.retryAfter,
      });
    } else if (err instanceof FigmaError) {
      reply.code(err.status || 500).send({ error: err.message });
    } else {
      throw err;
    }
  }
});
```

---

## Python: FastAPI Integration

The Python server is built on **FastAPI** with a lifespan context manager for startup/shutdown and `CORSMiddleware` for cross-origin requests.

### Architecture Overview

```
create_app(config)
  |
  +-- Defines lifespan context manager:
  |     +-- On startup: creates FigmaClient, all domain clients
  |     +-- Stores clients on app.state
  |     +-- On shutdown: closes FigmaClient
  |
  +-- Creates FastAPI app with lifespan
  +-- Adds CORSMiddleware
  +-- Registers all route handlers
  +-- Returns FastAPI app
```

### Using `create_app`

```python
from figma_api import create_app, Config

config = Config.from_env()
app = create_app(config)
```

The `Config.from_env()` classmethod reads all configuration from environment variables. The returned `app` is a standard FastAPI application.

### Accessing Domain Clients via Dependency Injection

Domain clients are stored on `app.state` and accessed through FastAPI's dependency injection:

```python
from fastapi import Depends, Request
from figma_api import create_app, Config, FilesClient

config = Config.from_env()
app = create_app(config)

def get_files_client(request: Request) -> FilesClient:
    return request.app.state.files_client

@app.get("/custom/file-summary/{file_key}")
async def file_summary(
    file_key: str,
    files: FilesClient = Depends(get_files_client),
):
    file = await files.get_file(file_key, depth=1)
    return {
        "name": file["name"],
        "last_modified": file["lastModified"],
        "version": file["version"],
        "page_count": len(file["document"]["children"]),
    }
```

### Lifespan Context Manager

The SDK uses FastAPI's lifespan for resource management:

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from figma_api import FigmaClient, FilesClient, ProjectsClient, Config

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create clients
    config = Config.from_env()
    client = FigmaClient(
        token=config.token,
        base_url=config.base_url,
        timeout=config.timeout,
        max_retries=config.max_retries,
        rate_limit_auto_wait=config.rate_limit_auto_wait,
    )
    app.state.figma_client = client
    app.state.files_client = FilesClient(client)
    app.state.projects_client = ProjectsClient(client)
    # ... other domain clients

    yield  # Application runs here

    # Shutdown: cleanup
    await client.close()

app = FastAPI(lifespan=lifespan)
```

### Embedding in an Existing FastAPI App

If you already have a FastAPI application, you can mount the SDK routes or use the clients directly:

**Option A: Use SDK clients in your own routes**

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Depends
from figma_api import (
    FigmaClient,
    FilesClient,
    ProjectsClient,
    CommentsClient,
    ComponentsClient,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    client = FigmaClient(token="figd_...")
    app.state.figma_client = client
    app.state.files = FilesClient(client)
    app.state.projects = ProjectsClient(client)
    app.state.comments = CommentsClient(client)
    app.state.components = ComponentsClient(client)
    yield
    await client.close()

app = FastAPI(title="My Design Tool API", lifespan=lifespan)

def get_files(request: Request) -> FilesClient:
    return request.app.state.files

def get_comments(request: Request) -> CommentsClient:
    return request.app.state.comments

@app.get("/api/files/{file_key}")
async def get_file(file_key: str, files: FilesClient = Depends(get_files)):
    return await files.get_file(file_key)

@app.get("/api/files/{file_key}/comments")
async def list_comments(
    file_key: str,
    comments: CommentsClient = Depends(get_comments),
):
    return await comments.list_comments(file_key, as_md=True)

@app.post("/api/files/{file_key}/comments")
async def add_comment(
    file_key: str,
    body: dict,
    comments: CommentsClient = Depends(get_comments),
):
    return await comments.add_comment(file_key, message=body["message"])
```

**Option B: Mount the SDK app as a sub-application**

```python
from fastapi import FastAPI
from figma_api import create_app, Config

# Your main application
main_app = FastAPI(title="My Platform")

# SDK sub-application
figma_config = Config.from_env()
figma_app = create_app(figma_config)

# Mount at a prefix
main_app.mount("/figma", figma_app)

# Now SDK routes are available at /figma/v1/files/:fileKey, etc.
```

### CORS Configuration

The built-in server adds `CORSMiddleware` with permissive defaults. To customize:

```python
from fastapi.middleware.cors import CORSMiddleware
from figma_api import create_app, Config

config = Config.from_env()
app = create_app(config)

# The SDK already adds CORSMiddleware. To override, create the app
# manually and add your own middleware configuration:
from contextlib import asynccontextmanager
from fastapi import FastAPI
from figma_api import FigmaClient, FilesClient

@asynccontextmanager
async def lifespan(app: FastAPI):
    client = FigmaClient()
    app.state.files = FilesClient(client)
    yield
    await client.close()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-app.com"],
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_credentials=True,
    allow_headers=["*"],
)
```

### Error Handling in Routes

The built-in routes map SDK errors to HTTP responses. For custom routes, use FastAPI exception handlers:

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from figma_api import FigmaError, NotFoundError, RateLimitError

app = FastAPI()

@app.exception_handler(FigmaError)
async def figma_error_handler(request: Request, exc: FigmaError):
    if isinstance(exc, NotFoundError):
        return JSONResponse(
            status_code=404,
            content={"error": "File not found", "detail": exc.message},
        )
    elif isinstance(exc, RateLimitError):
        retry_after = exc.rate_limit_info.retry_after if exc.rate_limit_info else None
        return JSONResponse(
            status_code=429,
            content={"error": "Rate limited", "retry_after": retry_after},
        )
    else:
        return JSONResponse(
            status_code=exc.status or 500,
            content={"error": exc.message},
        )
```

---

## Route Reference

Both servers expose the same REST API surface. All routes proxy to the Figma API through the SDK's domain clients, with automatic caching, retries, and rate-limit handling.

### Health Check

```
GET /health
```

Response:

```json
{
  "status": "ok",
  "service": "figma-api-proxy",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### Files

```
GET  /v1/files/:fileKey                  → FilesClient.getFile / get_file
GET  /v1/files/:fileKey/nodes            → FilesClient.getFileNodes / get_file_nodes
GET  /v1/images/:fileKey                 → FilesClient.getImages / get_images
GET  /v1/files/:fileKey/images           → FilesClient.getImageFills / get_image_fills
GET  /v1/files/:fileKey/versions         → FilesClient.getFileVersions / get_file_versions
```

Query parameters for `/v1/files/:fileKey`:

| Parameter | Type | Description |
|-----------|------|-------------|
| `version` | string | File version ID |
| `ids` | string (comma-separated) | Node IDs to retrieve |
| `depth` | number | Tree traversal depth |
| `geometry` | string | Geometry format (`paths`) |
| `plugin_data` | string | Plugin data to include |

Query parameters for `/v1/images/:fileKey`:

| Parameter | Type | Description |
|-----------|------|-------------|
| `ids` | string (comma-separated) | Node IDs to render |
| `scale` | number | Image scale (0.01 to 4) |
| `format` | string | Image format (`jpg`, `png`, `svg`, `pdf`) |

### Projects

```
GET  /v1/teams/:teamId/projects         → ProjectsClient.getTeamProjects / get_team_projects
GET  /v1/projects/:projectId/files       → ProjectsClient.getProjectFiles / get_project_files
```

### Comments

```
GET    /v1/files/:fileKey/comments                → CommentsClient.listComments / list_comments
POST   /v1/files/:fileKey/comments                → CommentsClient.addComment / add_comment
DELETE /v1/files/:fileKey/comments/:commentId      → CommentsClient.deleteComment / delete_comment
```

### Components and Styles

```
GET  /v1/components/:key                 → ComponentsClient.getComponent / get_component
GET  /v1/files/:fileKey/components       → ComponentsClient.getFileComponents / get_file_components
GET  /v1/teams/:teamId/components        → ComponentsClient.getTeamComponents / get_team_components
GET  /v1/component_sets/:key             → ComponentsClient.getComponentSet / get_component_set
GET  /v1/teams/:teamId/component_sets    → ComponentsClient.getTeamComponentSets / get_team_component_sets
GET  /v1/teams/:teamId/styles            → ComponentsClient.getTeamStyles / get_team_styles
GET  /v1/styles/:key                     → ComponentsClient.getStyle / get_style
```

Pagination query parameters for team endpoints:

| Parameter | Type | Description |
|-----------|------|-------------|
| `page_size` | number | Results per page |
| `cursor` | string | Pagination cursor |

### Variables

```
GET  /v1/files/:fileKey/variables/local      → VariablesClient.getLocalVariables / get_local_variables
GET  /v1/files/:fileKey/variables/published   → VariablesClient.getPublishedVariables / get_published_variables
POST /v1/files/:fileKey/variables             → VariablesClient.createVariables / create_variables
```

### Webhooks (v2)

```
GET    /v2/webhooks/:webhookId           → WebhooksClient.getWebhook / get_webhook
GET    /v2/teams/:teamId/webhooks        → WebhooksClient.listTeamWebhooks / list_team_webhooks
POST   /v2/webhooks                      → WebhooksClient.createWebhook / create_webhook
PUT    /v2/webhooks/:webhookId           → WebhooksClient.updateWebhook / update_webhook
DELETE /v2/webhooks/:webhookId           → WebhooksClient.deleteWebhook / delete_webhook
GET    /v2/webhooks/:webhookId/requests  → WebhooksClient.getWebhookRequests / get_webhook_requests
```

---

## Custom Application Integration

### JavaScript: Using SDK Clients Without the Server

```javascript
import {
  FigmaClient,
  FilesClient,
  ProjectsClient,
  CommentsClient,
  ComponentsClient,
  VariablesClient,
  WebhooksClient,
} from '@internal/figma-api';

// Create the core client once
const figmaClient = new FigmaClient({
  token: process.env.FIGMA_TOKEN,
  timeout: 30000,
  maxRetries: 3,
  rateLimitAutoWait: true,
  cache: { maxSize: 100, ttl: 300 },
});

// Create domain clients
const files = new FilesClient(figmaClient);
const projects = new ProjectsClient(figmaClient);
const comments = new CommentsClient(figmaClient);
const components = new ComponentsClient(figmaClient);
const variables = new VariablesClient(figmaClient);
const webhooks = new WebhooksClient(figmaClient);

// Use in your application logic
export async function getDesignSystem(teamId) {
  const teamComponents = await components.getTeamComponents(teamId);
  const teamStyles = await components.getTeamStyles(teamId);
  return { components: teamComponents, styles: teamStyles };
}

export async function exportFileAssets(fileKey, nodeIds) {
  const images = await files.getImages(fileKey, nodeIds, {
    scale: 2,
    format: 'png',
  });
  return images;
}
```

### Python: Using SDK Clients Without the Server

```python
import asyncio
from figma_api import (
    FigmaClient,
    FilesClient,
    ProjectsClient,
    CommentsClient,
    ComponentsClient,
    VariablesClient,
    WebhooksClient,
)

async def main():
    async with FigmaClient(
        timeout=30,
        max_retries=3,
        rate_limit_auto_wait=True,
        cache_max_size=100,
        cache_ttl=300,
    ) as client:
        files = FilesClient(client)
        projects = ProjectsClient(client)
        comments = CommentsClient(client)
        components = ComponentsClient(client)
        variables = VariablesClient(client)
        webhooks = WebhooksClient(client)

        # Use in your application logic
        team_components = await components.get_team_components('TEAM_ID')
        team_styles = await components.get_team_styles('TEAM_ID')

        file_data = await files.get_file('FILE_KEY', depth=1)
        node_ids = [
            child['id']
            for child in file_data['document']['children']
            if child['type'] == 'COMPONENT'
        ]

        if node_ids:
            images = await files.get_images('FILE_KEY', node_ids,
                                            scale=2, format='png')
            print(images)

asyncio.run(main())
```

---

## Environment Configuration

Both server implementations read configuration from the same environment variables:

```bash
# Authentication
export FIGMA_TOKEN="figd_your_token"
# export FIGMA_ACCESS_TOKEN="figd_fallback"   # Used if FIGMA_TOKEN is not set

# API settings
export FIGMA_API_BASE_URL="https://api.figma.com"
export FIGMA_TIMEOUT="30000"        # JS reads as ms; Python reads as seconds
export MAX_RETRIES="3"

# Rate limiting
export RATE_LIMIT_AUTO_WAIT="true"
export RATE_LIMIT_THRESHOLD="0"

# Caching
export CACHE_MAX_SIZE="100"
export CACHE_TTL="300"

# Server
export PORT="3000"
export HOST="0.0.0.0"

# Logging
export LOG_LEVEL="info"             # trace | debug | info | warn | error
```

### Production Deployment

**JavaScript with Docker:**

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
ENV FIGMA_TOKEN=""
ENV PORT=3000
ENV HOST=0.0.0.0
ENV LOG_LEVEL=info
EXPOSE 3000
CMD ["node", "server.mjs"]
```

**Python with Docker:**

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV FIGMA_TOKEN=""
ENV PORT=3000
ENV HOST=0.0.0.0
ENV LOG_LEVEL=info
EXPOSE 3000
CMD ["uvicorn", "figma_api.server:app", "--host", "0.0.0.0", "--port", "3000"]
```

### Health Monitoring

Both servers expose a `/health` endpoint suitable for load balancer health checks:

```bash
curl http://localhost:3000/health
# {"status":"ok","service":"figma-api-proxy","timestamp":"2025-01-15T10:30:00.000Z"}
```
