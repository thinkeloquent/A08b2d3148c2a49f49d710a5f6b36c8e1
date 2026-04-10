# Sauce Labs API SDK -- Fastify Server Integration Guide

> Package: `saucelabs-api-client` | Module format: ESM (`.mjs`) | Runtime: Node.js 20+
>
> Server framework: Fastify ^4.0.0

---

## Table of Contents

- [Quick Start](#quick-start)
- [Architecture: Decorate Pattern](#architecture-decorate-pattern)
- [Route Registration](#route-registration)
- [Error Handler Middleware](#error-handler-middleware)
- [Graceful Shutdown](#graceful-shutdown)
- [Lifecycle Plugin Pattern](#lifecycle-plugin-pattern)
- [Complete Fastify Server Example](#complete-fastify-server-example)
- [Environment Configuration](#environment-configuration)

---

## Quick Start

Create a Fastify server with `createSaucelabsClient` and expose Sauce Labs API operations as HTTP routes.

```javascript
import Fastify from 'fastify';
import { createSaucelabsClient } from 'saucelabs-api-client';

const server = Fastify({ logger: true });

// Create the SDK client with all domain modules
const client = createSaucelabsClient({
  username: process.env.SAUCE_USERNAME,
  apiKey: process.env.SAUCE_ACCESS_KEY,
  region: process.env.SAUCE_REGION || 'us-west-1',
  rateLimitAutoWait: true,
});

// Decorate the server with the client
server.decorate('saucelabs', client);

// Health check route
server.get('/health', async () => ({
  status: 'ok',
  service: 'saucelabs-api',
  timestamp: new Date().toISOString(),
}));

// Example route: list jobs
server.get('/api/jobs', async (request) => {
  const { limit = 10 } = request.query;
  const jobs = await server.saucelabs.jobs.list({ limit: parseInt(limit, 10) });
  return { success: true, data: jobs };
});

// Start the server
await server.listen({ port: 3000, host: '0.0.0.0' });
```

---

## Architecture: Decorate Pattern

The recommended integration pattern uses Fastify's `decorate()` method to register the SDK client and its domain modules on the server instance. This makes them available in every route handler and plugin.

### Single Decoration (`server.saucelabs`)

The simplest approach decorates the server with the full client:

```javascript
import { createSaucelabsClient } from 'saucelabs-api-client';

const client = createSaucelabsClient({
  username: process.env.SAUCE_USERNAME,
  apiKey: process.env.SAUCE_ACCESS_KEY,
});

// Single decoration -- access everything via server.saucelabs
server.decorate('saucelabs', client);

// In route handlers:
server.get('/api/status', async () => {
  return server.saucelabs.platform.getStatus();
});
```

### Dual Decoration (`server.saucelabs` + `server.saucelabsClients`)

For clearer separation, decorate with both the root client and an explicit clients object:

```javascript
import { createSaucelabsClient } from 'saucelabs-api-client';

const client = createSaucelabsClient({
  username: process.env.SAUCE_USERNAME,
  apiKey: process.env.SAUCE_ACCESS_KEY,
  region: process.env.SAUCE_REGION || 'us-west-1',
  rateLimitAutoWait: true,
});

// Root client -- for close(), username, lastRateLimit, raw HTTP
server.decorate('saucelabs', client);

// Domain modules -- for explicit access to each module
server.decorate('saucelabsClients', {
  jobs: client.jobs,
  platform: client.platform,
  users: client.users,
  upload: client.upload,
});

// In route handlers:
server.get('/api/jobs', async (request) => {
  const { limit = 10 } = request.query;
  return server.saucelabsClients.jobs.list({ limit: parseInt(limit, 10) });
});

server.get('/api/platform/status', async () => {
  return server.saucelabsClients.platform.getStatus();
});
```

---

## Route Registration

### Inline Routes

Register routes directly on the server instance:

```javascript
// GET /api/jobs -- List recent test jobs
server.get('/api/jobs', async (request, reply) => {
  const { limit = 10, skip = 0 } = request.query;
  const jobs = await server.saucelabs.jobs.list({
    limit: parseInt(limit, 10),
    skip: parseInt(skip, 10),
  });
  return { success: true, data: jobs };
});

// GET /api/jobs/:jobId -- Get a specific job by ID
server.get('/api/jobs/:jobId', async (request, reply) => {
  const { jobId } = request.params;
  const job = await server.saucelabs.jobs.get(jobId);
  return { success: true, data: job };
});

// GET /api/platform/status -- Service status (public)
server.get('/api/platform/status', async () => {
  const status = await server.saucelabs.platform.getStatus();
  return { success: true, data: status };
});

// GET /api/platform/:automationApi -- Supported platforms
server.get('/api/platform/:automationApi', async (request) => {
  const { automationApi } = request.params;
  const platforms = await server.saucelabs.platform.getPlatforms(automationApi);
  return { success: true, data: platforms };
});

// GET /api/users/:username -- User info
server.get('/api/users/:username', async (request) => {
  const { username } = request.params;
  const user = await server.saucelabs.users.getUser(username);
  return { success: true, data: user };
});

// GET /api/users/:username/concurrency -- Concurrency stats
server.get('/api/users/:username/concurrency', async (request) => {
  const { username } = request.params;
  const concurrency = await server.saucelabs.users.getConcurrency(username);
  return { success: true, data: concurrency };
});
```

### Route Plugin Pattern

For larger applications, organize routes into separate plugin files:

```javascript
// routes/jobs.mjs
export default async function jobRoutes(fastify) {
  fastify.get('/api/jobs', async (request) => {
    const { limit = 10, skip = 0 } = request.query;
    return fastify.saucelabs.jobs.list({
      limit: parseInt(limit, 10),
      skip: parseInt(skip, 10),
    });
  });

  fastify.get('/api/jobs/:jobId', async (request) => {
    const { jobId } = request.params;
    return fastify.saucelabs.jobs.get(jobId);
  });
}
```

```javascript
// routes/platform.mjs
export default async function platformRoutes(fastify) {
  fastify.get('/api/platform/status', async () => {
    return fastify.saucelabs.platform.getStatus();
  });

  fastify.get('/api/platform/:automationApi', async (request) => {
    const { automationApi } = request.params;
    return fastify.saucelabs.platform.getPlatforms(automationApi);
  });
}
```

```javascript
// Register route plugins
import jobRoutes from './routes/jobs.mjs';
import platformRoutes from './routes/platform.mjs';

await server.register(jobRoutes);
await server.register(platformRoutes);
```

---

## Error Handler Middleware

### Global Error Handler with SaucelabsError Mapping

Register a global error handler that maps SDK errors to appropriate HTTP responses:

```javascript
import {
  SaucelabsError,
  SaucelabsAuthError,
  SaucelabsNotFoundError,
  SaucelabsRateLimitError,
  SaucelabsValidationError,
  SaucelabsServerError,
} from 'saucelabs-api-client';

function registerErrorHandler(server) {
  server.setErrorHandler((error, request, reply) => {
    // Log the error with request context
    request.log.error({
      err: error,
      url: request.url,
      method: request.method,
    });

    // Map SDK errors to HTTP responses
    if (error instanceof SaucelabsAuthError) {
      return reply.status(401).send({
        error: true,
        name: 'Unauthorized',
        message: 'Invalid or missing Sauce Labs credentials.',
        statusCode: 401,
      });
    }

    if (error instanceof SaucelabsNotFoundError) {
      return reply.status(404).send({
        error: true,
        name: 'NotFound',
        message: error.message,
        statusCode: 404,
      });
    }

    if (error instanceof SaucelabsValidationError) {
      return reply.status(error.statusCode || 400).send({
        error: true,
        name: 'ValidationError',
        message: error.message,
        statusCode: error.statusCode || 400,
      });
    }

    if (error instanceof SaucelabsRateLimitError) {
      return reply.status(429).send({
        error: true,
        name: 'RateLimited',
        message: 'Sauce Labs API rate limit exceeded. Try again later.',
        statusCode: 429,
        retryAfter: error.retryAfter,
      });
    }

    if (error instanceof SaucelabsServerError) {
      return reply.status(502).send({
        error: true,
        name: 'BadGateway',
        message: 'The Sauce Labs API returned a server error.',
        statusCode: 502,
      });
    }

    if (error instanceof SaucelabsError) {
      const status = error.statusCode || 500;
      return reply.status(status).send({
        error: true,
        name: error.name,
        message: error.message,
        statusCode: status,
      });
    }

    // Non-SDK errors -- use Fastify default handling
    return reply.status(error.statusCode || 500).send({
      error: true,
      name: 'InternalError',
      message: 'An unexpected error occurred.',
    });
  });
}
```

### Using the Error Handler

```javascript
const server = Fastify({ logger: true });

registerErrorHandler(server);

// Routes registered after the error handler will use it automatically
```

### Per-Route Error Handling

For routes that need specific error behavior:

```javascript
import { SaucelabsNotFoundError } from 'saucelabs-api-client';

server.get('/api/jobs/:jobId', async (request, reply) => {
  try {
    const { jobId } = request.params;
    return await server.saucelabs.jobs.get(jobId);
  } catch (error) {
    if (error instanceof SaucelabsNotFoundError) {
      return reply.status(404).send({
        error: true,
        message: `Job ${request.params.jobId} not found`,
        suggestion: 'Verify the job ID from the Sauce Labs dashboard.',
      });
    }
    // Let the global error handler deal with everything else
    throw error;
  }
});
```

---

## Graceful Shutdown

Proper shutdown ensures in-flight requests complete and the SDK client is closed.

### Using the Fastify `onClose` Hook

```javascript
// Register an onClose hook to clean up the SDK client
server.addHook('onClose', async (instance) => {
  instance.log.info('Closing Sauce Labs API client...');
  instance.saucelabs.close();
  instance.log.info('Sauce Labs API client closed.');
});
```

### Signal Handling with Graceful Shutdown

```javascript
const shutdown = async (signal) => {
  server.log.info(`Received ${signal}. Shutting down gracefully...`);

  try {
    // server.close() triggers the onClose hook
    await server.close();
    server.log.info('Server closed successfully.');
    process.exit(0);
  } catch (error) {
    server.log.error(error, 'Error during shutdown');
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
```

### Shutdown with Timeout

```javascript
function setupGracefulShutdown(server, timeoutMs = 10000) {
  let isShuttingDown = false;

  async function shutdown(signal) {
    if (isShuttingDown) return;
    isShuttingDown = true;

    server.log.info(`Received ${signal}. Starting graceful shutdown...`);

    const forceExitTimer = setTimeout(() => {
      server.log.error('Graceful shutdown timed out. Forcing exit.');
      process.exit(1);
    }, timeoutMs);
    forceExitTimer.unref();

    try {
      await server.close();
      server.log.info('All connections closed.');
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

---

## Lifecycle Plugin Pattern

For production systems following the internal MTA lifecycle convention, organize the Sauce Labs integration as a numbered lifecycle plugin.

### File: `520.saucelabs_api.lifecycle.mjs`

**Path:** `/~/api/rest/02-01-2026/providers/saucelabs_api/520.saucelabs_api.lifecycle.mjs`

```javascript
// 520.saucelabs_api.lifecycle.mjs
//
// Lifecycle plugin for Sauce Labs API integration.
// Registered during server bootstrap, this plugin:
//   1. Creates a SaucelabsClient with all domain modules
//   2. Decorates the Fastify instance with server.saucelabs + server.saucelabsClients
//   3. Registers the error handler for SaucelabsError mapping
//   4. Registers an onClose hook for graceful client shutdown

import fp from 'fastify-plugin';
import {
  createSaucelabsClient,
  SaucelabsError,
  SaucelabsAuthError,
  SaucelabsNotFoundError,
  SaucelabsRateLimitError,
  SaucelabsValidationError,
  SaucelabsServerError,
} from 'saucelabs-api-client';

async function saucelabsLifecyclePlugin(fastify, options) {
  const {
    username = process.env.SAUCE_USERNAME,
    apiKey = process.env.SAUCE_ACCESS_KEY,
    region = process.env.SAUCE_REGION || 'us-west-1',
    timeout = 30000,
    rateLimitAutoWait = true,
    logLevel = process.env.LOG_LEVEL || 'info',
  } = options;

  // ── 1. Create client ────────────────────────────────────────────────
  const client = createSaucelabsClient({
    username,
    apiKey,
    region,
    timeout,
    rateLimitAutoWait,
    onRateLimit: (info) => {
      fastify.log.warn({
        retryAfter: info.retryAfter,
        remaining: info.remaining,
        limit: info.limit,
      }, 'Sauce Labs API rate limit hit');
      return true;
    },
  });

  fastify.log.info({
    username: username || '(not set)',
    region,
    timeout,
    rateLimitAutoWait,
  }, 'Sauce Labs API client initialized');

  // ── 2. Decorate server ──────────────────────────────────────────────
  fastify.decorate('saucelabs', client);
  fastify.decorate('saucelabsClients', {
    jobs: client.jobs,
    platform: client.platform,
    users: client.users,
    upload: client.upload,
  });

  // ── 3. Error handler ────────────────────────────────────────────────
  fastify.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error, url: request.url, method: request.method });

    if (error instanceof SaucelabsError) {
      const status = error.statusCode || 500;
      return reply.status(status).send({
        error: true,
        name: error.name,
        message: error.message,
        statusCode: status,
      });
    }

    return reply.status(error.statusCode || 500).send({
      error: true,
      name: 'InternalError',
      message: error.message,
    });
  });

  // ── 4. Graceful shutdown ────────────────────────────────────────────
  fastify.addHook('onClose', async (instance) => {
    instance.log.info('Closing Sauce Labs API client...');
    instance.saucelabs.close();
    instance.log.info('Sauce Labs API client closed.');
  });
}

export default fp(saucelabsLifecyclePlugin, {
  name: '520-saucelabs-api-lifecycle',
  fastify: '4.x',
});
```

### Registering the Lifecycle Plugin

```javascript
import Fastify from 'fastify';
import saucelabsLifecycle from './520.saucelabs_api.lifecycle.mjs';

const server = Fastify({ logger: true });

await server.register(saucelabsLifecycle, {
  username: process.env.SAUCE_USERNAME,
  apiKey: process.env.SAUCE_ACCESS_KEY,
  region: 'us-west-1',
  timeout: 30000,
});

// After registration, server.saucelabs and server.saucelabsClients are available
server.get('/api/jobs', async (request) => {
  const { limit = 10 } = request.query;
  return server.saucelabsClients.jobs.list({ limit: parseInt(limit, 10) });
});

await server.listen({ port: 3000 });
```

---

## Complete Fastify Server Example

A production-ready server combining all patterns.

```javascript
// server.mjs
import Fastify from 'fastify';
import {
  createSaucelabsClient,
  SaucelabsError,
  SaucelabsNotFoundError,
  SaucelabsAuthError,
  SaucelabsRateLimitError,
  SaucelabsValidationError,
} from 'saucelabs-api-client';

// =============================================================================
// Configuration
// =============================================================================

const CONFIG = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  username: process.env.SAUCE_USERNAME || '',
  apiKey: process.env.SAUCE_ACCESS_KEY || '',
  region: process.env.SAUCE_REGION || 'us-west-1',
  logLevel: process.env.LOG_LEVEL || 'info',
};

// =============================================================================
// Server Bootstrap
// =============================================================================

async function buildServer() {
  const server = Fastify({
    logger: {
      level: CONFIG.logLevel,
    },
    trustProxy: true,
  });

  // ── SDK Client ────────────────────────────────────────────────────────
  const client = createSaucelabsClient({
    username: CONFIG.username,
    apiKey: CONFIG.apiKey,
    region: CONFIG.region,
    rateLimitAutoWait: true,
    onRateLimit: (info) => {
      server.log.warn({
        retryAfter: info.retryAfter,
        remaining: info.remaining,
      }, 'Sauce Labs API rate limit hit');
      return true;
    },
  });

  // ── Decorate ──────────────────────────────────────────────────────────
  server.decorate('saucelabs', client);
  server.decorate('saucelabsClients', {
    jobs: client.jobs,
    platform: client.platform,
    users: client.users,
    upload: client.upload,
  });

  // ── Error Handler ─────────────────────────────────────────────────────
  server.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error, url: request.url, method: request.method });

    if (error instanceof SaucelabsError) {
      const status = error.statusCode || 500;
      return reply.status(status).send({
        error: true,
        name: error.name,
        message: error.message,
        statusCode: status,
      });
    }

    return reply.status(500).send({
      error: true,
      name: 'InternalError',
      message: error.message,
    });
  });

  // ── Graceful Shutdown ─────────────────────────────────────────────────
  server.addHook('onClose', async (instance) => {
    instance.log.info('Closing Sauce Labs API client...');
    instance.saucelabs.close();
    instance.log.info('Sauce Labs API client closed.');
  });

  // ── Health & Stats ────────────────────────────────────────────────────
  server.get('/health', async () => ({
    status: 'ok',
    service: 'saucelabs-api',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }));

  // ── Job Routes ────────────────────────────────────────────────────────
  server.get('/demo/jobs', async (request, reply) => {
    const { limit = 10, skip = 0 } = request.query;
    try {
      const jobs = await server.saucelabsClients.jobs.list({
        limit: parseInt(limit, 10),
        skip: parseInt(skip, 10),
      });
      return { success: true, data: jobs };
    } catch (err) {
      if (err instanceof SaucelabsError) {
        return reply.status(err.statusCode || 500).send({ success: false, error: err.toJSON() });
      }
      throw err;
    }
  });

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

  // ── Platform Routes ───────────────────────────────────────────────────
  server.get('/demo/platform/status', async (request, reply) => {
    try {
      const status = await server.saucelabsClients.platform.getStatus();
      return { success: true, data: status };
    } catch (err) {
      if (err instanceof SaucelabsError) {
        return reply.status(err.statusCode || 500).send({ success: false, error: err.toJSON() });
      }
      throw err;
    }
  });

  server.get('/demo/platform/:automationApi', async (request, reply) => {
    const { automationApi } = request.params;
    try {
      const platforms = await server.saucelabsClients.platform.getPlatforms(automationApi);
      return { success: true, data: platforms };
    } catch (err) {
      if (err instanceof SaucelabsValidationError) {
        return reply.status(400).send({ success: false, error: err.message });
      }
      if (err instanceof SaucelabsError) {
        return reply.status(err.statusCode || 500).send({ success: false, error: err.toJSON() });
      }
      throw err;
    }
  });

  // ── User Routes ───────────────────────────────────────────────────────
  server.get('/demo/users/:username', async (request, reply) => {
    const { username } = request.params;
    try {
      const user = await server.saucelabsClients.users.getUser(username);
      return { success: true, data: user };
    } catch (err) {
      if (err instanceof SaucelabsError) {
        return reply.status(err.statusCode || 500).send({ success: false, error: err.toJSON() });
      }
      throw err;
    }
  });

  server.get('/demo/users/:username/concurrency', async (request, reply) => {
    const { username } = request.params;
    try {
      const concurrency = await server.saucelabsClients.users.getConcurrency(username);
      return { success: true, data: concurrency };
    } catch (err) {
      if (err instanceof SaucelabsError) {
        return reply.status(err.statusCode || 500).send({ success: false, error: err.toJSON() });
      }
      throw err;
    }
  });

  return server;
}

// =============================================================================
// Start
// =============================================================================

const server = await buildServer();

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
    server.log.info('Shutdown complete.');
    process.exit(0);
  } catch (err) {
    server.log.error(err, 'Shutdown error');
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Listen
await server.listen({ port: CONFIG.port, host: CONFIG.host });

server.log.info('');
server.log.info('='.repeat(60));
server.log.info(' Sauce Labs API SDK -- Fastify Server');
server.log.info('='.repeat(60));
server.log.info('');
server.log.info(`  Listening on http://${CONFIG.host}:${CONFIG.port}`);
server.log.info(`  Region: ${CONFIG.region}`);
server.log.info(`  Username: ${CONFIG.username || '(not set)'}`);
server.log.info('');
server.log.info('  Routes:');
server.log.info('    GET /health                             -- Health check');
server.log.info('    GET /demo/jobs?limit=10&skip=0          -- List jobs');
server.log.info('    GET /demo/jobs/:jobId                   -- Get job');
server.log.info('    GET /demo/platform/status               -- Service status');
server.log.info('    GET /demo/platform/:automationApi       -- Supported platforms');
server.log.info('    GET /demo/users/:username               -- User info');
server.log.info('    GET /demo/users/:username/concurrency   -- Concurrency stats');
server.log.info('');
server.log.info('  Press Ctrl+C to stop.');
server.log.info('='.repeat(60));
```

---

## Environment Configuration

All server and SDK behavior can be configured via environment variables.

```bash
# Authentication (required for authenticated endpoints)
export SAUCE_USERNAME="your_sauce_username"
export SAUCE_ACCESS_KEY="your_sauce_access_key"

# Region
export SAUCE_REGION="us-west-1"     # us-west-1 | us-east-4 | eu-central-1

# Server
export PORT=3000
export HOST="0.0.0.0"

# Logging
export LOG_LEVEL=info               # debug | info | warn | error | silent
```

### Running the Server

```bash
export SAUCE_USERNAME="your_username"
export SAUCE_ACCESS_KEY="your_access_key"
export SAUCE_REGION="us-west-1"
export PORT=3000
export LOG_LEVEL=info

node server.mjs
```

### Testing Routes

```bash
# Health check
curl http://localhost:3000/health

# Service status (public, no auth needed)
curl http://localhost:3000/demo/platform/status

# Supported platforms
curl http://localhost:3000/demo/platform/webdriver

# List recent jobs
curl "http://localhost:3000/demo/jobs?limit=5"

# Get a specific job
curl http://localhost:3000/demo/jobs/abc123def456

# User info
curl http://localhost:3000/demo/users/your_username

# Concurrency stats
curl http://localhost:3000/demo/users/your_username/concurrency
```
