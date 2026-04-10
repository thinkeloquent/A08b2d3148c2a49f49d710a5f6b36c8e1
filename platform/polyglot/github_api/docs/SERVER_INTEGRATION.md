# Server Integration Guide for GitHub API SDK

This guide covers framework-specific integration patterns for embedding the GitHub API SDK into HTTP servers. The Node.js implementation uses Fastify 4.x with its plugin system, while the Python implementation uses FastAPI 0.115.0 with dependency injection and the lifespan context manager.

## Fastify Integration (Node.js)

The integration uses `createServer()` to initialize a fully configured Fastify instance with the GitHub SDK client, CORS, error handling, and route registration.

### Pattern: Fastify Plugin

```typescript
import { createServer, startServer, loadConfig } from '@internal/github-api';

// Load configuration from environment
const config = loadConfig();

// Create and configure the Fastify server with SDK client
const { server, client } = await createServer({
  token: config.githubToken,
  baseUrl: config.githubApiBaseUrl,
  logLevel: config.logLevel,
  corsOptions: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});

// The server is fully configured with:
// - @fastify/cors for CORS handling
// - @fastify/sensible for standard HTTP errors
// - Custom error handler mapping SDK errors to HTTP responses
// - All GitHub API routes registered
```

### Usage

```typescript
import { createServer, startServer, loadConfig } from '@internal/github-api';

async function main() {
  const config = loadConfig();

  // Create server (registers plugins, routes, and error handler)
  const { server, client } = await createServer({
    token: config.githubToken,
    baseUrl: config.githubApiBaseUrl,
    logLevel: config.logLevel,
  });

  // Start listening
  const address = await startServer(server, {
    port: config.port,
    host: config.host,
  });

  console.log(`GitHub API server running at ${address}`);

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    await server.close();
    process.exit(0);
  });
}

main().catch(console.error);
```

### Error Handler Setup

The Fastify error handler maps SDK error classes to HTTP responses:

```typescript
import { createErrorHandler } from '@internal/github-api';

// Applied automatically by createServer(), or manually:
server.setErrorHandler(createErrorHandler());

// Error mapping:
// - ValidationError -> 400 Bad Request
// - AuthError       -> 401 Unauthorized
// - ForbiddenError  -> 403 Forbidden
// - NotFoundError   -> 404 Not Found
// - ConflictError   -> 409 Conflict
// - RateLimitError  -> 429 Too Many Requests
// - ServerError     -> 500 Internal Server Error
// - GitHubError     -> original status code
```

### Response Hooks

Fastify hooks for processing GitHub API responses:

```typescript
import {
  response204Hook,
  jsonFallbackHook,
  requestIdHook,
  rateLimitHook,
} from '@internal/github-api';

// response204Hook: Handles 204 No Content responses
// jsonFallbackHook: Ensures JSON content-type for responses
// requestIdHook: Forwards x-github-request-id headers
// rateLimitHook: Forwards rate limit headers to clients
```

## FastAPI Integration (Python)

The integration uses the `create_app()` factory function to build a FastAPI application with the GitHub SDK client, CORS middleware, error handlers, and route registration.

### Pattern: Lifespan Context Manager

The modern approach uses a lifespan context manager for startup and shutdown:

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, Request
from github_api.config import Config
from github_api.sdk.client import GitHubClient

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize the GitHub SDK client
    config = Config.from_env()
    client = GitHubClient(
        token=config.github_token or None,
        base_url=config.base_url,
        rate_limit_auto_wait=config.rate_limit_auto_wait,
        rate_limit_threshold=config.rate_limit_threshold,
    )
    app.state.github_client = client
    print(f"GitHub SDK client initialized (base_url={config.base_url})")

    yield

    # Shutdown: Close the HTTP client
    await client.close()
    print("GitHub SDK client closed")

app = FastAPI(
    title="GitHub API SDK Server",
    version="1.0.0",
    lifespan=lifespan,
)
```

### Factory Pattern

The `create_app()` factory provides a fully configured application:

```python
from github_api.server import create_app
from github_api.config import Config

# Option 1: Auto-load configuration from environment
app = create_app()

# Option 2: Provide explicit configuration
config = Config(
    github_token="ghp_...",
    base_url="https://api.github.com",
    log_level="INFO",
    port=3100,
    host="0.0.0.0",
    rate_limit_auto_wait=True,
    rate_limit_threshold=10,
)
app = create_app(config)

# The app is configured with:
# - CORS middleware (allow all origins)
# - Error handlers for all SDK error types
# - API routes for all domain clients
# - GitHubClient stored in app.state.github_client
```

### Dependency Injection

Access the SDK client in route handlers via FastAPI's dependency injection:

```python
from fastapi import FastAPI, Depends, Request
from github_api.sdk.client import GitHubClient
from github_api import ReposClient

def get_github_client(request: Request) -> GitHubClient:
    """Dependency that provides the GitHub SDK client."""
    return request.app.state.github_client

def get_repos_client(
    client: GitHubClient = Depends(get_github_client),
) -> ReposClient:
    """Dependency that provides a ReposClient."""
    return ReposClient(client)

@app.get("/api/repos/{owner}/{repo}")
async def get_repo(
    owner: str,
    repo: str,
    repos: ReposClient = Depends(get_repos_client),
):
    return await repos.get(owner, repo)
```

### Error Handler Registration

Exception handlers map SDK errors to HTTP responses:

```python
from github_api.middleware.error_handler import register_error_handlers

# Applied automatically by create_app(), or manually:
register_error_handlers(app)

# Error mapping:
# - ValidationError -> 400 Bad Request
# - AuthError       -> 401 Unauthorized
# - ForbiddenError  -> 403 Forbidden
# - NotFoundError   -> 404 Not Found
# - ConflictError   -> 409 Conflict
# - RateLimitError  -> 429 Too Many Requests (with Retry-After header)
# - ServerError     -> 502 Bad Gateway
# - GitHubError     -> original status code
```

### Full Server Example

```python
import uvicorn
from github_api.server import create_app
from github_api.config import Config

def main():
    config = Config.from_env()
    app = create_app(config)

    uvicorn.run(
        app,
        host=config.host,
        port=config.port,
        log_level=config.log_level.lower(),
    )

if __name__ == "__main__":
    main()
```

Or using the module entrypoint:

```python
# github_api/main.py
import uvicorn
from github_api.config import Config
from github_api.server import create_app

def main() -> None:
    config = Config.from_env()
    app = create_app(config)
    uvicorn.run(
        app,
        host=config.host,
        port=config.port,
        log_level=config.log_level.lower(),
    )

if __name__ == "__main__":
    main()
```
