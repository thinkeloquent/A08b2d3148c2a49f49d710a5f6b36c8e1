# Server Integration Guide -- @internal/github-api

> Node.js 20+ | ESM | Fastify 4

This guide covers the Fastify server integration layer of `@internal/github-api`. It describes how to create, configure, and run the HTTP server that proxies GitHub API operations through the SDK.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Quick Start](#quick-start)
- [Creating the Server](#creating-the-server)
- [Plugin Architecture](#plugin-architecture)
- [Route Registration](#route-registration)
- [Error Handler](#error-handler)
- [CORS Configuration](#cors-configuration)
- [Full Startup Example](#full-startup-example)
- [Server Lifecycle](#server-lifecycle)
- [Environment Configuration](#environment-configuration)
- [Custom Route Plugins](#custom-route-plugins)
- [Testing with Fastify inject()](#testing-with-fastify-inject)

---

## Architecture Overview

The server layer is structured as follows:

```
src/
  main.mjs               Entry point: loadConfig() + createServer() + startServer()
  server.mjs              createServer() and startServer() functions
  config.mjs              loadConfig() -- environment-based configuration
  middleware/
    error-handler.mjs     createErrorHandler() -- maps SDK errors to HTTP responses
    github-hooks.mjs      Response processing hooks (204, JSON fallback, request ID, rate limit)
    index.mjs             Barrel exports
  routes/
    index.mjs             registerRoutes() -- creates domain clients, registers all routes
    health.mjs            GET /health, GET /health/rate-limit
    repos.mjs             Repository CRUD endpoints
    branches.mjs          Branch management endpoints
    collaborators.mjs     Collaborator management endpoints
    tags.mjs              Tag and release endpoints
    webhooks.mjs          Webhook CRUD endpoints
    security.mjs          Security and ruleset endpoints
```

**Data flow:**

```
HTTP Request
  -> Fastify router
    -> Route handler
      -> Domain SDK client (ReposClient, BranchesClient, ...)
        -> GitHubClient._request()
          -> fetch() to api.github.com
          -> Rate limit parsing / auto-wait
          -> Error mapping
        <- Parsed JSON response
      <- Domain-specific result
    <- reply.send(result)
  -> Error handler (if thrown)
    -> Maps SDK error to HTTP status + JSON body
HTTP Response
```

---

## Quick Start

The fastest way to start the server:

```bash
export GITHUB_TOKEN=ghp_your_token_here
node src/main.mjs
```

The server starts on `http://0.0.0.0:3100` and exposes all GitHub API proxy routes under `/api/github/`.

For development with auto-reload:

```bash
node --watch src/main.mjs
```

Or using the package scripts:

```bash
pnpm start       # node src/main.mjs
pnpm dev          # node --watch src/main.mjs
```

---

## Creating the Server

### createServer()

The `createServer()` function creates a fully configured Fastify instance with all plugins, middleware, and routes registered.

```javascript
import { createServer } from '@internal/github-api';

const { server, client } = await createServer({
  token: process.env.GITHUB_TOKEN,       // optional; falls back to env var resolution
  baseUrl: 'https://api.github.com',     // optional; default: 'https://api.github.com'
  logLevel: 'info',                       // optional; default: 'info'
  corsOptions: { origin: true },          // optional; passed to @fastify/cors
});
```

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `server` | `FastifyInstance` | Fully configured Fastify server, ready to listen |
| `client` | `GitHubClient` | The underlying GitHub API client |

**What `createServer()` does internally:**

1. Resolves the GitHub token via `resolveToken(token)` -- throws `AuthError` if no token is found
2. Creates a `GitHubClient` with the resolved token and base URL
3. Creates a Fastify instance with structured logging at the specified log level
4. Registers `@fastify/cors` with the provided CORS options
5. Registers `@fastify/sensible` for standard HTTP error helpers
6. Sets the custom error handler via `createErrorHandler()`
7. Registers all routes via `registerRoutes(server, client)`

### startServer()

```javascript
import { startServer } from '@internal/github-api';

const address = await startServer(server, {
  port: 3100,        // optional; default: 3100
  host: '0.0.0.0',   // optional; default: '0.0.0.0'
});

console.log(`Listening on ${address}`);
```

Returns the address string (e.g., `http://0.0.0.0:3100`).

---

## Plugin Architecture

The server uses Fastify's plugin system for modular organization. Each route module is a standard Fastify plugin function.

### Registered Plugins

| Plugin | Purpose |
|--------|---------|
| `@fastify/cors` | Cross-origin resource sharing |
| `@fastify/sensible` | Standard HTTP errors and utilities |
| `createErrorHandler()` | Custom error handler mapping SDK errors to HTTP |

### Route Plugins

Each route module exports a default async function that accepts a Fastify instance and options:

```javascript
// Pattern used by every route module
export default async function repoRoutes(fastify, opts) {
  const { repos } = opts;  // Receives the domain SDK client

  fastify.get('/repos/:owner/:repo', async (request, reply) => {
    const { owner, repo } = request.params;
    const result = await repos.get(owner, repo);
    return reply.send(result);
  });

  // ... more routes
}
```

### Plugin Registration Hierarchy

```
server (Fastify root)
  +-- @fastify/cors
  +-- @fastify/sensible
  +-- healthRoutes (prefix: /)
  +-- apiRoutes (prefix: /api/github)
      +-- repoRoutes
      +-- branchRoutes
      +-- collaboratorRoutes
      +-- tagRoutes
      +-- webhookRoutes
      +-- securityRoutes
```

Health routes are registered at the root level. All domain routes are grouped under the `/api/github` prefix via a wrapping plugin.

---

## Route Registration

### registerRoutes()

The `registerRoutes()` function creates all domain SDK clients and registers every route module:

```javascript
import { registerRoutes } from '@internal/github-api';
```

```javascript
async function registerRoutes(server, client) {
  // Creates domain clients from the base GitHubClient
  const repos = new ReposClient(client);
  const branches = new BranchesClient(client);
  const collaborators = new CollaboratorsClient(client);
  const tags = new TagsClient(client);
  const webhooks = new WebhooksClient(client);
  const security = new SecurityClient(client);

  // Health routes at root level
  await server.register(healthRoutes, { client });

  // All domain routes under /api/github
  await server.register(
    async function apiRoutes(api) {
      await api.register(repoRoutes, { repos });
      await api.register(branchRoutes, { branches });
      await api.register(collaboratorRoutes, { collaborators });
      await api.register(tagRoutes, { tags });
      await api.register(webhookRoutes, { webhooks });
      await api.register(securityRoutes, { security });
    },
    { prefix: '/api/github' },
  );
}
```

### Route Summary

Health routes (no prefix):

```
GET  /health                     -> Server status + cached rate limit
GET  /health/rate-limit          -> Live rate limit from GitHub API
```

Domain routes (prefix `/api/github`):

```
# Repositories
GET    /api/github/repos/:owner/:repo
GET    /api/github/repos/user/:username
GET    /api/github/repos/me
GET    /api/github/repos/org/:org
POST   /api/github/repos
POST   /api/github/repos/org/:org
PATCH  /api/github/repos/:owner/:repo
DELETE /api/github/repos/:owner/:repo
GET    /api/github/repos/:owner/:repo/topics
PUT    /api/github/repos/:owner/:repo/topics
GET    /api/github/repos/:owner/:repo/languages
GET    /api/github/repos/:owner/:repo/contributors
POST   /api/github/repos/:owner/:repo/forks
GET    /api/github/repos/:owner/:repo/forks
PUT    /api/github/repos/:owner/:repo/subscription
DELETE /api/github/repos/:owner/:repo/subscription

# Branches
GET    /api/github/repos/:owner/:repo/branches
GET    /api/github/repos/:owner/:repo/branches/:branch
GET    /api/github/repos/:owner/:repo/branches/:branch/protection
PUT    /api/github/repos/:owner/:repo/branches/:branch/protection
DELETE /api/github/repos/:owner/:repo/branches/:branch/protection
POST   /api/github/repos/:owner/:repo/branches/:branch/rename
POST   /api/github/repos/:owner/:repo/merges
GET    /api/github/repos/:owner/:repo/compare/:base...:head

# Collaborators
GET    /api/github/repos/:owner/:repo/collaborators
PUT    /api/github/repos/:owner/:repo/collaborators/:username
DELETE /api/github/repos/:owner/:repo/collaborators/:username
GET    /api/github/repos/:owner/:repo/collaborators/:username/permission
GET    /api/github/repos/:owner/:repo/invitations

# Tags & Releases
GET    /api/github/repos/:owner/:repo/tags
GET    /api/github/repos/:owner/:repo/releases
POST   /api/github/repos/:owner/:repo/releases
GET    /api/github/repos/:owner/:repo/releases/latest
GET    /api/github/repos/:owner/:repo/releases/tags/:tag
GET    /api/github/repos/:owner/:repo/releases/:id
PATCH  /api/github/repos/:owner/:repo/releases/:id
DELETE /api/github/repos/:owner/:repo/releases/:id

# Webhooks
GET    /api/github/repos/:owner/:repo/hooks
GET    /api/github/repos/:owner/:repo/hooks/:hookId
POST   /api/github/repos/:owner/:repo/hooks
PATCH  /api/github/repos/:owner/:repo/hooks/:hookId
DELETE /api/github/repos/:owner/:repo/hooks/:hookId
POST   /api/github/repos/:owner/:repo/hooks/:hookId/tests
POST   /api/github/repos/:owner/:repo/hooks/:hookId/pings

# Security
GET    /api/github/repos/:owner/:repo/vulnerability-alerts
PUT    /api/github/repos/:owner/:repo/vulnerability-alerts
DELETE /api/github/repos/:owner/:repo/vulnerability-alerts
GET    /api/github/repos/:owner/:repo/rulesets
GET    /api/github/repos/:owner/:repo/rulesets/:id
POST   /api/github/repos/:owner/:repo/rulesets
PUT    /api/github/repos/:owner/:repo/rulesets/:id
DELETE /api/github/repos/:owner/:repo/rulesets/:id
```

---

## Error Handler

The custom error handler maps SDK error types to appropriate HTTP status codes and JSON response bodies.

### Setup

The error handler is set during `createServer()`:

```javascript
server.setErrorHandler(createErrorHandler());
```

### Error Mapping Table

| SDK Error Class | HTTP Status | Response `error` Field |
|----------------|-------------|----------------------|
| `ValidationError` | 400 | `"Validation Error"` |
| `AuthError` | 401 | `"Unauthorized"` |
| `ForbiddenError` | 403 | `"Forbidden"` |
| `NotFoundError` | 404 | `"Not Found"` |
| `ConflictError` | 409 | `"Conflict"` |
| `RateLimitError` | 429 | `"Rate Limit Exceeded"` |
| `ServerError` (5xx from GitHub) | 502 | `"Bad Gateway"` |
| `GitHubError` (generic) | `error.status` or 500 | `"GitHub API Error"` |
| Fastify schema validation | 400 | `"Validation Error"` |
| Unknown/unhandled | 500 | `"Internal Server Error"` |

### Response Format

Every error response has a consistent JSON structure:

```javascript
{
  "error": "Not Found",
  "message": "Repository not found",
  "statusCode": 404,
  "requestId": "ABCD:1234:5678:...",       // from GitHub, if available
  "documentationUrl": "https://docs.github.com/..."  // from GitHub, if available
}
```

For `RateLimitError`, additional response headers are set:

```
Retry-After: 60
X-RateLimit-Reset: 1706745600
```

And the body includes:

```javascript
{
  "error": "Rate Limit Exceeded",
  "message": "API rate limit exceeded",
  "statusCode": 429,
  "resetAt": "2025-02-01T00:00:00.000Z",
  "retryAfter": 60
}
```

### How Errors Flow

1. A route handler calls a domain SDK method (e.g., `repos.get(owner, repo)`)
2. The SDK method validates inputs (may throw `ValidationError`)
3. The SDK method calls `GitHubClient._request()` which calls `fetch()`
4. If the response is an error, `mapResponseToError()` throws the appropriate error class
5. Fastify catches the thrown error and passes it to `createErrorHandler()`
6. The error handler maps it to the correct HTTP status and JSON body

---

## CORS Configuration

CORS is handled by `@fastify/cors`, registered during `createServer()`.

### Default Configuration

By default, `corsOptions` is an empty object `{}`, which uses the `@fastify/cors` defaults (no specific origin, no credentials).

### Permissive CORS (Development)

```javascript
const { server } = await createServer({
  token: process.env.GITHUB_TOKEN,
  corsOptions: {
    origin: true,  // reflect the request origin
  },
});
```

### Restrictive CORS (Production)

```javascript
const { server } = await createServer({
  token: process.env.GITHUB_TOKEN,
  corsOptions: {
    origin: ['https://app.example.com', 'https://admin.example.com'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
  },
});
```

---

## Full Startup Example

This is the pattern used in `src/main.mjs`, the production entry point:

```javascript
import closeWithGrace from 'close-with-grace';
import { loadConfig } from '@internal/github-api';
import { createServer, startServer } from '@internal/github-api';

async function main() {
  // 1. Load configuration from environment variables
  const config = loadConfig();

  // 2. Create the fully configured Fastify server
  const { server } = await createServer({
    token: config.githubToken,
    baseUrl: config.githubApiBaseUrl,
    logLevel: config.logLevel,
  });

  // 3. Register graceful shutdown
  closeWithGrace({ delay: 5000 }, async ({ signal, err }) => {
    if (err) {
      server.log.error({ err }, 'Server closing due to error');
    } else {
      server.log.info(`Server closing due to ${signal}`);
    }
    await server.close();
  });

  // 4. Start listening
  await startServer(server, {
    port: config.port,
    host: config.host,
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
```

### Manual Server Assembly

For more control, you can assemble the server manually without `createServer()`:

```javascript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import {
  GitHubClient,
  resolveToken,
  createErrorHandler,
  registerRoutes,
} from '@internal/github-api';

async function buildCustomServer() {
  // Resolve token
  const { token } = resolveToken();

  // Create SDK client
  const client = new GitHubClient({
    token,
    rateLimitAutoWait: true,
    rateLimitThreshold: 10,
  });

  // Create Fastify instance
  const server = Fastify({
    logger: { level: 'info' },
  });

  // Register plugins
  await server.register(cors, { origin: true });
  await server.register(sensible);

  // Set error handler
  server.setErrorHandler(createErrorHandler());

  // Register SDK routes
  await registerRoutes(server, client);

  // Add your own custom routes
  server.get('/custom/status', async (request, reply) => {
    return { status: 'ok', rateLimit: client.lastRateLimit };
  });

  return server;
}

const server = await buildCustomServer();
await server.listen({ port: 3100, host: '0.0.0.0' });
```

---

## Server Lifecycle

### Startup Sequence

1. `loadConfig()` reads environment variables
2. `createServer()` initializes everything:
   - Token resolution (fails fast if no token)
   - GitHubClient creation
   - Fastify instance creation
   - Plugin registration (cors, sensible)
   - Error handler registration
   - Route registration (health + all domain routes)
3. `closeWithGrace()` registers shutdown handlers
4. `startServer()` binds to the configured port and host

### Shutdown Sequence

The `close-with-grace` package handles graceful shutdown:

1. Signal received (`SIGINT`, `SIGTERM`) or unhandled error
2. `closeWithGrace` callback fires
3. `server.close()` is called, which:
   - Stops accepting new connections
   - Waits for in-flight requests to complete (up to the delay)
   - Closes all plugins
4. Process exits

### Manual Shutdown

```javascript
// Programmatic shutdown
await server.close();
```

### Health Checking

The server exposes two health endpoints:

```javascript
// Basic health check -- returns immediately, no GitHub API call
// GET /health
{
  "status": "ok",
  "timestamp": "2025-01-15T12:00:00.000Z",
  "rateLimit": {
    "limit": 5000,
    "remaining": 4750,
    "reset": 1706745600,
    "used": 250,
    "resource": "core"
  }
}

// Live rate limit check -- calls GET /rate_limit on GitHub API
// GET /health/rate-limit
{
  "resources": {
    "core": { "limit": 5000, "remaining": 4750, "reset": 1706745600, "used": 250 },
    "search": { "limit": 30, "remaining": 30, "reset": 1706745600, "used": 0 },
    ...
  }
}
```

---

## Environment Configuration

All configuration is loaded from environment variables via `loadConfig()`:

| Variable | Default | Description |
|----------|---------|-------------|
| `GITHUB_TOKEN` | -- | GitHub API token (highest priority) |
| `GH_TOKEN` | -- | GitHub API token (second priority) |
| `GITHUB_ACCESS_TOKEN` | -- | GitHub API token (third priority) |
| `GITHUB_PAT` | -- | GitHub API token (lowest priority) |
| `GITHUB_API_BASE_URL` | `https://api.github.com` | API base URL (for GitHub Enterprise) |
| `LOG_LEVEL` | `info` | Fastify log level: `fatal`, `error`, `warn`, `info`, `debug`, `trace` |
| `PORT` | `3100` | Server listen port |
| `HOST` | `0.0.0.0` | Server bind host |

### GitHub Enterprise

```bash
export GITHUB_API_BASE_URL=https://github.example.com/api/v3
export GITHUB_TOKEN=ghp_your_enterprise_token
node src/main.mjs
```

---

## Custom Route Plugins

You can add custom route plugins alongside the built-in routes.

### Adding a Custom Plugin

```javascript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import {
  GitHubClient,
  resolveToken,
  ReposClient,
  BranchesClient,
  createErrorHandler,
  registerRoutes,
} from '@internal/github-api';

// Custom route plugin
async function analyticsRoutes(fastify, opts) {
  const { repos, branches } = opts;

  fastify.get('/analytics/:owner/:repo', async (request, reply) => {
    const { owner, repo } = request.params;

    // Fetch data from multiple SDK clients in parallel
    const [repoData, branchList] = await Promise.all([
      repos.get(owner, repo),
      branches.list(owner, repo),
    ]);

    return reply.send({
      name: repoData.full_name,
      stars: repoData.stargazers_count,
      language: repoData.language,
      branchCount: branchList.length,
      protectedBranches: branchList.filter((b) => b.protected).length,
    });
  });
}

// Assembly
async function buildServer() {
  const { token } = resolveToken();
  const client = new GitHubClient({ token });
  const repos = new ReposClient(client);
  const branches = new BranchesClient(client);

  const server = Fastify({ logger: { level: 'info' } });
  await server.register(cors, { origin: true });
  await server.register(sensible);
  server.setErrorHandler(createErrorHandler());

  // Register built-in routes
  await registerRoutes(server, client);

  // Register custom routes under /api/custom prefix
  await server.register(analyticsRoutes, {
    prefix: '/api/custom',
    repos,
    branches,
  });

  return server;
}
```

This registers `GET /api/custom/analytics/:owner/:repo` alongside all built-in routes.

---

## Testing with Fastify inject()

Fastify's `inject()` method allows you to test routes without starting a real HTTP server. This is ideal for integration tests.

### Basic Test Setup

```javascript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from '@internal/github-api';

describe('GitHub API Server', () => {
  let server;
  let client;

  beforeAll(async () => {
    const result = await createServer({
      token: process.env.GITHUB_TOKEN,
      logLevel: 'silent',
    });
    server = result.server;
    client = result.client;
  });

  afterAll(async () => {
    await server.close();
  });

  it('GET /health returns status ok', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
  });
});
```

### Testing Route Responses

```javascript
it('GET /api/github/repos/:owner/:repo returns repository data', async () => {
  const response = await server.inject({
    method: 'GET',
    url: '/api/github/repos/octocat/Hello-World',
  });

  expect(response.statusCode).toBe(200);
  const body = response.json();
  expect(body.full_name).toBe('octocat/Hello-World');
});
```

### Testing Error Responses

```javascript
it('returns 400 for invalid repository name', async () => {
  const response = await server.inject({
    method: 'GET',
    url: '/api/github/repos/octocat/settings',
  });

  expect(response.statusCode).toBe(400);
  const body = response.json();
  expect(body.error).toBe('Validation Error');
  expect(body.message).toContain('reserved');
});

it('returns 404 for nonexistent repository', async () => {
  const response = await server.inject({
    method: 'GET',
    url: '/api/github/repos/octocat/this-repo-does-not-exist-12345',
  });

  expect(response.statusCode).toBe(404);
  const body = response.json();
  expect(body.error).toBe('Not Found');
});
```

### Testing with POST Bodies

```javascript
it('POST /api/github/repos creates a repository', async () => {
  const response = await server.inject({
    method: 'POST',
    url: '/api/github/repos',
    headers: {
      'Content-Type': 'application/json',
    },
    payload: {
      name: 'test-repo-from-inject',
      description: 'Created via Fastify inject()',
      private: true,
      auto_init: true,
    },
  });

  expect(response.statusCode).toBe(201);
  const body = response.json();
  expect(body.full_name).toContain('test-repo-from-inject');
});
```

### Testing with Query Parameters

```javascript
it('GET /api/github/repos/user/:username supports query params', async () => {
  const response = await server.inject({
    method: 'GET',
    url: '/api/github/repos/user/octocat',
    query: {
      sort: 'updated',
      per_page: '5',
    },
  });

  expect(response.statusCode).toBe(200);
  const body = response.json();
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBeLessThanOrEqual(5);
});
```

### Isolated Test with Mock Client

For unit-level route tests without hitting the GitHub API, you can inject a mock `GitHubClient`:

```javascript
import Fastify from 'fastify';
import repoRoutes from '@internal/github-api/routes';

describe('Repo routes (mocked)', () => {
  let server;

  beforeAll(async () => {
    server = Fastify({ logger: false });

    // Mock ReposClient
    const mockRepos = {
      get: async (owner, repo) => ({
        full_name: `${owner}/${repo}`,
        stargazers_count: 42,
        default_branch: 'main',
      }),
      listForUser: async () => [],
    };

    // Register only the repos routes with the mock
    await server.register(
      async (api) => {
        await api.register(repoRoutes, { repos: mockRepos });
      },
      { prefix: '/api/github' },
    );
  });

  afterAll(async () => {
    await server.close();
  });

  it('returns mocked repository data', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/github/repos/test-owner/test-repo',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.full_name).toBe('test-owner/test-repo');
    expect(body.stargazers_count).toBe(42);
  });
});
```

### Running Tests

```bash
pnpm test               # vitest run
pnpm test:watch          # vitest (watch mode)
pnpm test:coverage       # vitest run --coverage
```
