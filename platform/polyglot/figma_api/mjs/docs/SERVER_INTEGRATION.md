# Figma API SDK -- Fastify Server Integration Guide

> Package: `@internal/figma-api` | Module format: ESM (`.mjs`) | Runtime: Node.js
>
> Server framework: Fastify ^4.0.0 with `@fastify/cors` and `@fastify/sensible`

---

## Table of Contents

- [Quick Start with createServer](#quick-start-with-createserver)
- [Starting the Server](#starting-the-server)
- [Built-in Routes](#built-in-routes)
- [Custom Fastify Setup with SDK Decoration](#custom-fastify-setup-with-sdk-decoration)
- [Plugin Pattern](#plugin-pattern)
- [Route Registration](#route-registration)
- [Error Handler Middleware](#error-handler-middleware)
- [CORS Configuration](#cors-configuration)
- [Graceful Shutdown](#graceful-shutdown)
- [Full Production Example](#full-production-example)

---

## Quick Start with createServer

The SDK provides a `createServer()` factory that builds a fully configured Fastify instance with all routes, error handling, CORS, and SDK clients pre-wired.

```javascript
import { createServer, startServer } from '@internal/figma-api';

const { server, client } = createServer({
  token: process.env.FIGMA_TOKEN,
  baseUrl: 'https://api.figma.com',
  logLevel: 'info',
  rateLimitAutoWait: true,
  rateLimitThreshold: 0,
});

await startServer(server, {
  port: 3108,
  host: '0.0.0.0',
});
```

### `createServer(options)`

Creates a Fastify server instance with the Figma SDK fully integrated.

```javascript
const { server, client } = createServer({
  token,              // string, optional -- falls back to env vars
  baseUrl,            // string, default: "https://api.figma.com"
  logLevel,           // string, default: "info"
  rateLimitAutoWait,  // boolean, default: true
  rateLimitThreshold, // number, default: 0
});
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `token` | `string` | env var | Figma API token. |
| `baseUrl` | `string` | `"https://api.figma.com"` | API base URL. |
| `logLevel` | `string` | `"info"` | Fastify log level. |
| `rateLimitAutoWait` | `boolean` | `true` | Auto-wait on 429 responses. |
| `rateLimitThreshold` | `number` | `0` | Proactive rate limit threshold. |

**Returns:** `{ server: FastifyInstance, client: FigmaClient }`

### `startServer(server, options)`

Starts the Fastify server listening on the specified port and host.

```javascript
await startServer(server, {
  port: 3108,      // number, default: 3108
  host: '0.0.0.0', // string, default: "0.0.0.0"
});
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `server` | `FastifyInstance` | -- | The Fastify instance from `createServer()`. |
| `options.port` | `number` | `3108` | Port to listen on. |
| `options.host` | `string` | `"0.0.0.0"` | Host to bind to. |

---

## Starting the Server

### From the Command Line

```bash
# Set required environment variables
export FIGMA_TOKEN="fig_your_token"
export PORT=3108
export LOG_LEVEL=info

# Run the server entry point
node src/server.mjs
```

### Programmatic Startup

```javascript
import { createServer, startServer } from '@internal/figma-api';

async function main() {
  const { server, client } = createServer();

  // The server is now configured but not yet listening
  console.log('Server created. Client stats:', client.stats);

  await startServer(server);
  console.log('Server is listening on port 3108');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
```

---

## Built-in Routes

The `createServer()` factory registers the following routes automatically.

### Health Check

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Returns server health status. |

```javascript
// GET /health
// => { status: "ok" }
```

### Files

| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/files/:fileKey` | Get a file document tree. |
| `GET` | `/v1/files/:fileKey/nodes` | Get specific nodes from a file. |
| `GET` | `/v1/images/:fileKey` | Export nodes as images. |
| `GET` | `/v1/files/:fileKey/images` | Get image fill URLs. |
| `GET` | `/v1/files/:fileKey/versions` | List file versions. |

### Projects

| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/teams/:teamId/projects` | List team projects. |
| `GET` | `/v1/projects/:projectId/files` | List project files. |

### Comments

| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/files/:fileKey/comments` | List file comments. |
| `POST` | `/v1/files/:fileKey/comments` | Add a comment. |
| `DELETE` | `/v1/files/:fileKey/comments/:commentId` | Delete a comment. |

### Components and Styles

| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/components/:key` | Get component metadata. |
| `GET` | `/v1/files/:fileKey/components` | List file components. |
| `GET` | `/v1/teams/:teamId/components` | List team components. |
| `GET` | `/v1/component_sets/:key` | Get component set metadata. |
| `GET` | `/v1/teams/:teamId/component_sets` | List team component sets. |
| `GET` | `/v1/teams/:teamId/styles` | List team styles. |
| `GET` | `/v1/styles/:key` | Get style metadata. |

### Variables

| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/files/:fileKey/variables/local` | Get local variables. |
| `GET` | `/v1/files/:fileKey/variables/published` | Get published variables. |
| `POST` | `/v1/files/:fileKey/variables` | Create/update/delete variables. |

### Webhooks (v2)

| Method | Path | Description |
|---|---|---|
| `GET` | `/v2/webhooks/:webhookId` | Get a webhook. |
| `GET` | `/v2/teams/:teamId/webhooks` | List team webhooks. |
| `POST` | `/v2/webhooks` | Create a webhook. |
| `PUT` | `/v2/webhooks/:webhookId` | Update a webhook. |
| `DELETE` | `/v2/webhooks/:webhookId` | Delete a webhook. |
| `GET` | `/v2/webhooks/:webhookId/requests` | Get webhook requests. |

---

## Custom Fastify Setup with SDK Decoration

If you need more control over the Fastify instance, you can build the server yourself and decorate it with SDK clients.

```javascript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import { FigmaClient, FilesClient, ProjectsClient, CommentsClient } from '@internal/figma-api';

const server = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: { colorize: true },
    },
  },
});

// Register plugins
await server.register(cors, { origin: true });
await server.register(sensible);

// Create SDK clients
const figmaClient = new FigmaClient({
  cache: { maxSize: 200, ttl: 600 },
});

// Decorate Fastify with SDK clients
server.decorate('figma', figmaClient);
server.decorate('figmaFiles', new FilesClient(figmaClient));
server.decorate('figmaProjects', new ProjectsClient(figmaClient));
server.decorate('figmaComments', new CommentsClient(figmaClient));

// Now use them in route handlers
server.get('/api/files/:fileKey', async (request, reply) => {
  const { fileKey } = request.params;
  const file = await server.figmaFiles.getFile(fileKey);
  return file;
});

await server.listen({ port: 3108, host: '0.0.0.0' });
```

---

## Plugin Pattern

Organize your SDK integration as a Fastify plugin for clean separation of concerns.

### SDK Plugin

```javascript
// plugins/figma-sdk.mjs
import fp from 'fastify-plugin';
import {
  FigmaClient,
  FilesClient,
  ProjectsClient,
  CommentsClient,
  ComponentsClient,
  VariablesClient,
  WebhooksClient,
} from '@internal/figma-api';

async function figmaSdkPlugin(fastify, options) {
  const client = new FigmaClient({
    token: options.token,
    baseUrl: options.baseUrl,
    timeout: options.timeout || 30000,
    maxRetries: options.maxRetries || 3,
    rateLimitAutoWait: options.rateLimitAutoWait ?? true,
    cache: options.cache || { maxSize: 100, ttl: 300 },
  });

  const sdk = {
    client,
    files: new FilesClient(client),
    projects: new ProjectsClient(client),
    comments: new CommentsClient(client),
    components: new ComponentsClient(client),
    variables: new VariablesClient(client),
    webhooks: new WebhooksClient(client),
  };

  fastify.decorate('figma', sdk);

  // Log SDK stats on server close
  fastify.addHook('onClose', async () => {
    fastify.log.info({ stats: sdk.client.stats }, 'Figma SDK final stats');
  });
}

export default fp(figmaSdkPlugin, {
  name: 'figma-sdk',
  fastify: '4.x',
});
```

### Registering the Plugin

```javascript
import Fastify from 'fastify';
import figmaSdkPlugin from './plugins/figma-sdk.mjs';

const server = Fastify({ logger: true });

await server.register(figmaSdkPlugin, {
  token: process.env.FIGMA_TOKEN,
  cache: { maxSize: 200, ttl: 600 },
});

// Access SDK clients via server.figma
server.get('/files/:fileKey', async (request) => {
  const { fileKey } = request.params;
  return server.figma.files.getFile(fileKey);
});

await server.listen({ port: 3108 });
```

---

## Route Registration

### Route Plugin Pattern

Organize routes into separate plugin files for maintainability.

```javascript
// routes/files.mjs
export default async function fileRoutes(fastify) {
  fastify.get('/v1/files/:fileKey', async (request, reply) => {
    const { fileKey } = request.params;
    const { version, ids, depth, geometry, plugin_data } = request.query;

    const options = {};
    if (version) options.version = version;
    if (ids) options.ids = ids.split(',');
    if (depth) options.depth = parseInt(depth, 10);
    if (geometry) options.geometry = geometry;
    if (plugin_data) options.pluginData = plugin_data;

    const file = await fastify.figma.files.getFile(fileKey, options);
    return file;
  });

  fastify.get('/v1/files/:fileKey/nodes', async (request, reply) => {
    const { fileKey } = request.params;
    const { ids, version, depth, geometry, plugin_data } = request.query;

    if (!ids) {
      return reply.badRequest('Query parameter "ids" is required');
    }

    const nodeIds = ids.split(',');
    const options = {};
    if (version) options.version = version;
    if (depth) options.depth = parseInt(depth, 10);
    if (geometry) options.geometry = geometry;
    if (plugin_data) options.pluginData = plugin_data;

    const nodes = await fastify.figma.files.getFileNodes(fileKey, nodeIds, options);
    return nodes;
  });

  fastify.get('/v1/images/:fileKey', async (request, reply) => {
    const { fileKey } = request.params;
    const { ids, scale, format } = request.query;

    if (!ids) {
      return reply.badRequest('Query parameter "ids" is required');
    }

    const nodeIds = ids.split(',');
    const options = {};
    if (scale) options.scale = parseFloat(scale);
    if (format) options.format = format;

    const images = await fastify.figma.files.getImages(fileKey, nodeIds, options);
    return images;
  });

  fastify.get('/v1/files/:fileKey/versions', async (request) => {
    const { fileKey } = request.params;
    return fastify.figma.files.getFileVersions(fileKey);
  });

  fastify.get('/v1/files/:fileKey/images', async (request) => {
    const { fileKey } = request.params;
    return fastify.figma.files.getImageFills(fileKey);
  });
}
```

```javascript
// routes/comments.mjs
export default async function commentRoutes(fastify) {
  fastify.get('/v1/files/:fileKey/comments', async (request) => {
    const { fileKey } = request.params;
    const { as_md } = request.query;
    return fastify.figma.comments.listComments(fileKey, { as_md: as_md === 'true' });
  });

  fastify.post('/v1/files/:fileKey/comments', async (request) => {
    const { fileKey } = request.params;
    const { message, client_meta, comment_id } = request.body;
    return fastify.figma.comments.addComment(fileKey, {
      message,
      clientMeta: client_meta,
      commentId: comment_id,
    });
  });

  fastify.delete('/v1/files/:fileKey/comments/:commentId', async (request) => {
    const { fileKey, commentId } = request.params;
    await fastify.figma.comments.deleteComment(fileKey, commentId);
    return { status: 'deleted' };
  });
}
```

```javascript
// routes/webhooks.mjs
export default async function webhookRoutes(fastify) {
  fastify.get('/v2/webhooks/:webhookId', async (request) => {
    const { webhookId } = request.params;
    return fastify.figma.webhooks.getWebhook(webhookId);
  });

  fastify.get('/v2/teams/:teamId/webhooks', async (request) => {
    const { teamId } = request.params;
    return fastify.figma.webhooks.listTeamWebhooks(teamId);
  });

  fastify.post('/v2/webhooks', async (request) => {
    const { team_id, event_type, endpoint, passcode, status, description } = request.body;
    return fastify.figma.webhooks.createWebhook(team_id, {
      eventType: event_type,
      endpoint,
      passcode,
      status,
      description,
    });
  });

  fastify.put('/v2/webhooks/:webhookId', async (request) => {
    const { webhookId } = request.params;
    return fastify.figma.webhooks.updateWebhook(webhookId, request.body);
  });

  fastify.delete('/v2/webhooks/:webhookId', async (request) => {
    const { webhookId } = request.params;
    await fastify.figma.webhooks.deleteWebhook(webhookId);
    return { status: 'deleted' };
  });

  fastify.get('/v2/webhooks/:webhookId/requests', async (request) => {
    const { webhookId } = request.params;
    return fastify.figma.webhooks.getWebhookRequests(webhookId);
  });
}
```

### Registering Route Plugins

```javascript
import Fastify from 'fastify';
import figmaSdkPlugin from './plugins/figma-sdk.mjs';
import fileRoutes from './routes/files.mjs';
import commentRoutes from './routes/comments.mjs';
import webhookRoutes from './routes/webhooks.mjs';

const server = Fastify({ logger: true });

// Register SDK plugin first
await server.register(figmaSdkPlugin, {
  token: process.env.FIGMA_TOKEN,
});

// Register route plugins
await server.register(fileRoutes);
await server.register(commentRoutes);
await server.register(webhookRoutes);

// Health check (always register directly)
server.get('/health', async () => ({ status: 'ok' }));

await server.listen({ port: 3108 });
```

---

## Error Handler Middleware

### Global Error Handler with SDK Error Mapping

```javascript
import {
  FigmaError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ServerError,
  NetworkError,
  TimeoutError,
} from '@internal/figma-api';

function registerErrorHandler(server) {
  server.setErrorHandler((error, request, reply) => {
    // Log the error with request context
    request.log.error({
      err: error,
      requestId: error.requestId,
      url: request.url,
      method: request.method,
    });

    // Map SDK errors to HTTP responses
    if (error instanceof AuthenticationError) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid or missing Figma API token.',
        code: error.code,
      });
    }

    if (error instanceof AuthorizationError) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Insufficient permissions for this resource.',
        code: error.code,
      });
    }

    if (error instanceof NotFoundError) {
      return reply.status(404).send({
        error: 'Not Found',
        message: error.message,
        code: error.code,
      });
    }

    if (error instanceof ValidationError) {
      return reply.status(422).send({
        error: 'Validation Error',
        message: error.message,
        code: error.code,
        meta: error.meta,
      });
    }

    if (error instanceof RateLimitError) {
      return reply.status(429).send({
        error: 'Rate Limited',
        message: 'Figma API rate limit exceeded. Try again later.',
        code: error.code,
        retryAfter: error.meta?.retryAfter,
      });
    }

    if (error instanceof TimeoutError) {
      return reply.status(504).send({
        error: 'Gateway Timeout',
        message: 'The request to Figma API timed out.',
        code: error.code,
      });
    }

    if (error instanceof NetworkError) {
      return reply.status(502).send({
        error: 'Bad Gateway',
        message: 'Unable to reach the Figma API.',
        code: error.code,
      });
    }

    if (error instanceof ServerError) {
      return reply.status(502).send({
        error: 'Bad Gateway',
        message: 'The Figma API returned a server error.',
        code: error.code,
      });
    }

    if (error instanceof FigmaError) {
      return reply.status(error.status || 500).send({
        error: 'Figma API Error',
        message: error.message,
        code: error.code,
      });
    }

    // Non-Figma errors -- use Fastify default handling
    return reply.status(error.statusCode || 500).send({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred.',
    });
  });
}
```

### Registering the Error Handler

```javascript
import Fastify from 'fastify';

const server = Fastify({ logger: true });

registerErrorHandler(server);

// Routes registered after the error handler will use it automatically
```

### Per-Route Error Handling

For routes that need specific error behavior:

```javascript
server.get('/v1/files/:fileKey', async (request, reply) => {
  try {
    const { fileKey } = request.params;
    return await server.figma.files.getFile(fileKey);
  } catch (error) {
    if (error instanceof NotFoundError) {
      // Return a custom 404 response for this specific route
      return reply.status(404).send({
        error: 'File not found',
        fileKey: request.params.fileKey,
        suggestion: 'Verify the file key from your Figma URL.',
      });
    }
    // Let the global error handler deal with everything else
    throw error;
  }
});
```

---

## CORS Configuration

### Default CORS (via createServer)

The `createServer()` factory enables CORS with permissive defaults suitable for development. For production, configure CORS explicitly.

### Custom CORS Configuration

```javascript
import Fastify from 'fastify';
import cors from '@fastify/cors';

const server = Fastify({ logger: true });

// Development: allow all origins
await server.register(cors, {
  origin: true,
});

// Production: restrict to specific origins
await server.register(cors, {
  origin: [
    'https://your-app.example.com',
    'https://staging.your-app.example.com',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // preflight cache for 24 hours
});
```

### Environment-Based CORS

```javascript
const isDevelopment = process.env.NODE_ENV !== 'production';

await server.register(cors, {
  origin: isDevelopment
    ? true
    : (process.env.CORS_ORIGINS || '').split(',').filter(Boolean),
  credentials: true,
});
```

---

## Graceful Shutdown

Proper shutdown ensures in-flight requests complete and resources are released.

### Basic Graceful Shutdown

```javascript
import { createServer, startServer } from '@internal/figma-api';

const { server, client } = createServer();

// Handle process signals
const signals = ['SIGINT', 'SIGTERM'];

for (const signal of signals) {
  process.on(signal, async () => {
    server.log.info(`Received ${signal}, shutting down gracefully...`);

    try {
      await server.close();
      server.log.info('Server closed successfully.');
      server.log.info({ stats: client.stats }, 'Final SDK stats');
      process.exit(0);
    } catch (error) {
      server.log.error(error, 'Error during shutdown');
      process.exit(1);
    }
  });
}

await startServer(server);
```

### Shutdown with Timeout

```javascript
function setupGracefulShutdown(server, client, timeoutMs = 10000) {
  let isShuttingDown = false;

  async function shutdown(signal) {
    if (isShuttingDown) return;
    isShuttingDown = true;

    server.log.info(`Received ${signal}. Starting graceful shutdown...`);

    // Force exit after timeout
    const forceExitTimer = setTimeout(() => {
      server.log.error('Graceful shutdown timed out. Forcing exit.');
      process.exit(1);
    }, timeoutMs);

    // Prevent the timer from keeping the process alive
    forceExitTimer.unref();

    try {
      // Stop accepting new connections and wait for in-flight requests
      await server.close();

      server.log.info('All connections closed.');
      server.log.info({ stats: client.stats }, 'Final Figma SDK stats');

      clearTimeout(forceExitTimer);
      process.exit(0);
    } catch (error) {
      server.log.error(error, 'Error during graceful shutdown');
      clearTimeout(forceExitTimer);
      process.exit(1);
    }
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    server.log.fatal(error, 'Uncaught exception');
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason) => {
    server.log.fatal({ reason }, 'Unhandled rejection');
    shutdown('unhandledRejection');
  });
}
```

### Using the Shutdown Helper

```javascript
import { createServer, startServer } from '@internal/figma-api';

const { server, client } = createServer();

setupGracefulShutdown(server, client, 15000); // 15-second timeout

await startServer(server);
```

---

## Full Production Example

A complete production-ready server setup combining all patterns.

```javascript
// server.mjs
import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import {
  FigmaClient,
  FilesClient,
  ProjectsClient,
  CommentsClient,
  ComponentsClient,
  VariablesClient,
  WebhooksClient,
  FigmaError,
  loadConfig,
} from '@internal/figma-api';

async function buildServer() {
  const config = loadConfig();

  // Create Fastify instance
  const server = Fastify({
    logger: {
      level: config.logLevel?.toLowerCase() || 'info',
    },
    trustProxy: true,
  });

  // Register core plugins
  await server.register(cors, {
    origin: process.env.NODE_ENV === 'production'
      ? (process.env.CORS_ORIGINS || '').split(',').filter(Boolean)
      : true,
    credentials: true,
  });
  await server.register(sensible);

  // Initialize Figma SDK
  const figmaClient = new FigmaClient({
    token: config.token,
    baseUrl: config.baseUrl,
    timeout: config.timeout,
    maxRetries: config.maxRetries,
    rateLimitAutoWait: config.rateLimitAutoWait,
    rateLimitThreshold: config.rateLimitThreshold,
    cache: {
      maxSize: config.cacheMaxSize,
      ttl: config.cacheTtl,
    },
    onRateLimit: (info) => {
      server.log.warn({
        retryAfter: info.retryAfter,
        planTier: info.planTier,
        rateLimitType: info.rateLimitType,
      }, 'Figma API rate limit hit');
      return true;
    },
  });

  // Decorate with SDK
  const sdk = {
    client: figmaClient,
    files: new FilesClient(figmaClient),
    projects: new ProjectsClient(figmaClient),
    comments: new CommentsClient(figmaClient),
    components: new ComponentsClient(figmaClient),
    variables: new VariablesClient(figmaClient),
    webhooks: new WebhooksClient(figmaClient),
  };
  server.decorate('figma', sdk);

  // Global error handler
  server.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error, url: request.url }, 'Request error');

    if (error instanceof FigmaError) {
      const statusMap = {
        401: 401,
        403: 403,
        404: 404,
        422: 422,
        429: 429,
      };
      const httpStatus = statusMap[error.status] || (error.status >= 500 ? 502 : 500);

      return reply.status(httpStatus).send({
        error: error.name,
        message: error.message,
        code: error.code,
        requestId: error.requestId,
      });
    }

    return reply.status(error.statusCode || 500).send({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred.',
    });
  });

  // Health and stats routes
  server.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }));

  server.get('/stats', async () => ({
    sdk: figmaClient.stats,
    uptime: process.uptime(),
  }));

  // File routes
  server.get('/v1/files/:fileKey', async (request) => {
    const { fileKey } = request.params;
    const { version, ids, depth, geometry, plugin_data } = request.query;
    const options = {};
    if (version) options.version = version;
    if (ids) options.ids = ids.split(',');
    if (depth) options.depth = parseInt(depth, 10);
    if (geometry) options.geometry = geometry;
    if (plugin_data) options.pluginData = plugin_data;
    return server.figma.files.getFile(fileKey, options);
  });

  server.get('/v1/files/:fileKey/nodes', async (request, reply) => {
    const { fileKey } = request.params;
    const { ids, version, depth } = request.query;
    if (!ids) return reply.badRequest('"ids" query parameter is required');
    return server.figma.files.getFileNodes(fileKey, ids.split(','), { version, depth: depth ? parseInt(depth, 10) : undefined });
  });

  server.get('/v1/images/:fileKey', async (request, reply) => {
    const { fileKey } = request.params;
    const { ids, scale, format } = request.query;
    if (!ids) return reply.badRequest('"ids" query parameter is required');
    return server.figma.files.getImages(fileKey, ids.split(','), {
      scale: scale ? parseFloat(scale) : undefined,
      format,
    });
  });

  server.get('/v1/files/:fileKey/images', async (request) => {
    return server.figma.files.getImageFills(request.params.fileKey);
  });

  server.get('/v1/files/:fileKey/versions', async (request) => {
    return server.figma.files.getFileVersions(request.params.fileKey);
  });

  // Project routes
  server.get('/v1/teams/:teamId/projects', async (request) => {
    return server.figma.projects.getTeamProjects(request.params.teamId);
  });

  server.get('/v1/projects/:projectId/files', async (request) => {
    const { branchData } = request.query;
    return server.figma.projects.getProjectFiles(request.params.projectId, {
      branchData: branchData === 'true',
    });
  });

  // Comment routes
  server.get('/v1/files/:fileKey/comments', async (request) => {
    const { as_md } = request.query;
    return server.figma.comments.listComments(request.params.fileKey, { as_md: as_md === 'true' });
  });

  server.post('/v1/files/:fileKey/comments', async (request) => {
    const { message, client_meta, comment_id } = request.body;
    return server.figma.comments.addComment(request.params.fileKey, {
      message, clientMeta: client_meta, commentId: comment_id,
    });
  });

  server.delete('/v1/files/:fileKey/comments/:commentId', async (request) => {
    await server.figma.comments.deleteComment(request.params.fileKey, request.params.commentId);
    return { status: 'deleted' };
  });

  return { server, client: figmaClient };
}

// Main entry point
const { server, client } = await buildServer();

// Graceful shutdown
let isShuttingDown = false;
async function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  server.log.info(`${signal} received. Shutting down...`);

  const timer = setTimeout(() => process.exit(1), 10000);
  timer.unref();

  try {
    await server.close();
    server.log.info({ stats: client.stats }, 'Shutdown complete');
    process.exit(0);
  } catch (err) {
    server.log.error(err, 'Shutdown error');
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Start
const port = parseInt(process.env.PORT || '3108', 10);
const host = process.env.HOST || '0.0.0.0';

await server.listen({ port, host });
server.log.info(`Figma API proxy listening on http://${host}:${port}`);
```
