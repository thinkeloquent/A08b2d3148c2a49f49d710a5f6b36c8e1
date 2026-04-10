# Server Integration Guide for Confluence API

This guide covers framework-specific integration patterns for embedding the `confluence_api` package into Fastify (Node.js) and FastAPI (Python) applications.

---

## Fastify Integration (Node.js)

The integration registers Confluence services within the Fastify plugin system and maps API errors to structured HTTP responses.

### Built-in Server

```typescript
import { createServer, startServer, createErrorHandler } from 'confluence_api';

const server = createServer({ logger: true });
server.setErrorHandler(createErrorHandler());
await startServer(server, { host: '0.0.0.0', port: 3000 });
```

### Custom Integration: Server Factory

```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import {
  ConfluenceFetchClient,
  getConfig,
  ContentService,
  SpaceService,
  SearchService,
  ConfluenceApiError,
  ConfluenceConfigurationError,
  createErrorHandler,
  createLogger,
} from 'confluence_api';

const log = createLogger('confluence-server', import.meta.url);

async function buildServer() {
  const server = Fastify({ logger: false });
  await server.register(cors, { origin: true });

  // Error handler -- maps ConfluenceApiError to JSON responses
  server.setErrorHandler(createErrorHandler());

  // Client factory
  const config = getConfig();

  function getClient() {
    if (!config?.baseUrl || !config?.username || !config?.apiToken) {
      throw new ConfluenceConfigurationError(
        'Set CONFLUENCE_BASE_URL, CONFLUENCE_USERNAME, CONFLUENCE_API_TOKEN',
      );
    }
    return new ConfluenceFetchClient({
      baseUrl: config.baseUrl,
      username: config.username,
      apiToken: config.apiToken,
    });
  }

  // Health
  server.get('/health', async () => ({
    status: 'healthy',
    confluenceConfigured: !!config?.baseUrl,
  }));

  // Content routes
  await server.register(async (scope) => {
    scope.get('/', async (request) => {
      const c = getClient();
      const { type, spaceKey, limit = 25, start = 0, expand } = request.query;
      return new ContentService(c).getContents({ type, spaceKey, expand, start, limit });
    });

    scope.get('/:contentId', async (request) => {
      const c = getClient();
      const { expand } = request.query;
      return new ContentService(c).getContent(request.params.contentId, { expand });
    });

    scope.post('/', async (request) => {
      const c = getClient();
      return new ContentService(c).createContent(request.body);
    });

    scope.put('/:contentId', async (request) => {
      const c = getClient();
      return new ContentService(c).updateContent(request.params.contentId, request.body);
    });

    scope.delete('/:contentId', async (request) => {
      const c = getClient();
      await new ContentService(c).deleteContent(request.params.contentId);
      return { message: 'Deleted' };
    });
  }, { prefix: '/content' });

  // Space routes
  await server.register(async (scope) => {
    scope.get('/', async (request) => {
      const c = getClient();
      const { limit = 25, start = 0, expand } = request.query;
      return new SpaceService(c).getSpaces({ expand, start, limit });
    });

    scope.get('/:spaceKey', async (request) => {
      const c = getClient();
      return new SpaceService(c).getSpace(request.params.spaceKey);
    });
  }, { prefix: '/spaces' });

  // Search routes
  await server.register(async (scope) => {
    scope.get('/', async (request) => {
      const c = getClient();
      const { cql, limit = 25, start = 0, expand } = request.query;
      return new SearchService(c).searchContent(cql, { expand, start, limit });
    });
  }, { prefix: '/search' });

  return server;
}
```

### Middleware: Error Handler

The `createErrorHandler()` function returns a Fastify error handler that maps Confluence errors to HTTP responses:

| Error Class | HTTP Status |
|------------|-------------|
| `ConfluenceValidationError` | 400 |
| `ConfluenceAuthenticationError` | 401 |
| `ConfluencePermissionError` | 403 |
| `ConfluenceNotFoundError` | 404 |
| `ConfluenceConflictError` | 409 |
| `ConfluenceRateLimitError` | 429 |
| `ConfluenceServerError` | 5xx |
| `ConfluenceConfigurationError` | 500 |
| Other errors | 500 |

### Middleware: Auth Hook

Optional API key authentication via Basic Auth:

```typescript
const apiKey = process.env.SERVER_API_KEY;
if (apiKey) {
  server.addHook('preHandler', async (request, reply) => {
    if (request.url === '/health') return;

    const authHeader = request.headers.authorization;
    if (!authHeader) {
      reply.code(401).send({ error: 'Authentication required' });
      return;
    }

    const encoded = authHeader.replace('Basic ', '');
    const decoded = Buffer.from(encoded, 'base64').toString();
    const [username] = decoded.split(':');
    if (username !== apiKey) {
      reply.code(401).send({ error: 'Invalid API key' });
    }
  });
}
```

---

## FastAPI Integration (Python)

The integration uses FastAPI's lifespan context manager and dependency injection to provide Confluence services to route handlers.

### Built-in Server

```python
from confluence_api.server import create_app

app = create_app()

# Run with: uvicorn confluence_api.server:create_app --factory --host 0.0.0.0 --port 8000
```

### Custom Integration: Lifespan + Dependency Injection

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from confluence_api import (
    ConfluenceClient,
    ContentService,
    SpaceService,
    SearchService,
    ConfluenceAPIError,
    ConfluenceConfigurationError,
    get_config,
    create_logger,
)

log = create_logger('confluence-server', __file__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    config = get_config()
    app.state.confluence_config = config
    if config.get('base_url'):
        log.info('Confluence configured', {'base_url': config['base_url']})
    else:
        log.warning('Confluence not configured')
    yield
    # Shutdown
    log.info('shutting down')

app = FastAPI(title="Confluence API Server", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_client() -> ConfluenceClient:
    """Dependency: create a Confluence client from app config."""
    config = app.state.confluence_config
    if not config.get('base_url') or not config.get('username') or not config.get('api_token'):
        raise ConfluenceConfigurationError(
            'Set CONFLUENCE_BASE_URL, CONFLUENCE_USERNAME, CONFLUENCE_API_TOKEN'
        )
    return ConfluenceClient(
        base_url=config['base_url'],
        username=config['username'],
        api_token=config['api_token'],
    )

Client = Depends(get_client)

@app.get("/health")
async def health():
    config = app.state.confluence_config
    return {"status": "healthy", "confluenceConfigured": bool(config.get("base_url"))}

# Content routes
@app.get("/content")
async def list_content(
    type: str | None = None,
    spaceKey: str | None = None,
    limit: int = 25,
    start: int = 0,
    expand: str | None = None,
    client: ConfluenceClient = Client,
):
    return ContentService(client).get_contents(
        type=type, space_key=spaceKey, expand=expand, start=start, limit=limit,
    )

@app.get("/content/{content_id}")
async def get_content(
    content_id: str,
    expand: str | None = None,
    client: ConfluenceClient = Client,
):
    return ContentService(client).get_content(content_id, expand=expand)

@app.post("/content")
async def create_content(data: dict, client: ConfluenceClient = Client):
    return ContentService(client).create_content(data)

@app.put("/content/{content_id}")
async def update_content(content_id: str, data: dict, client: ConfluenceClient = Client):
    return ContentService(client).update_content(content_id, data)

@app.delete("/content/{content_id}")
async def delete_content(content_id: str, client: ConfluenceClient = Client):
    ContentService(client).delete_content(content_id)
    return {"message": "Deleted"}
```

### Error Handling

Map `ConfluenceAPIError` subclasses to `HTTPException`:

```python
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(ConfluenceAPIError)
async def confluence_error_handler(request: Request, exc: ConfluenceAPIError):
    return JSONResponse(
        status_code=exc.status_code or 500,
        content={
            "error": True,
            "message": str(exc),
            "type": type(exc).__name__,
        },
    )
```

---

## Route Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/content` | List content |
| GET | `/content/:id` | Get content by ID |
| POST | `/content` | Create content |
| PUT | `/content/:id` | Update content |
| DELETE | `/content/:id` | Delete content |
| GET | `/content/:id/labels` | Get content labels |
| POST | `/content/:id/labels` | Add content labels |
| GET | `/content/:id/attachments` | List attachments |
| DELETE | `/content/:id/attachments/:aid` | Delete attachment |
| GET | `/spaces` | List spaces |
| GET | `/spaces/:key` | Get space by key |
| GET | `/search?cql=...` | CQL search |
| GET | `/user/current` | Get current user |
| GET | `/user/:username` | Get user by username |
| GET | `/labels/recent` | Get recent labels |
| GET | `/labels/:name/related` | Get related labels |
| GET | `/system/info` | Server information |
| GET | `/system/metrics` | Instance metrics |

## Environment Configuration

| Variable | Description | Required |
|----------|-------------|----------|
| `CONFLUENCE_BASE_URL` | Confluence Data Center base URL | Yes |
| `CONFLUENCE_USERNAME` | Username for Basic Auth | Yes |
| `CONFLUENCE_API_TOKEN` | API token / password | Yes |
| `SERVER_API_KEY` | Optional API key for the proxy server | No |
| `PORT` | Server port (default: 3000 / 8000) | No |
| `LOG_LEVEL` | Log level (default: info) | No |
