/**
 * server.mjs — Fastify Integration Example (Sauce Labs API SDK)
 *
 * Minimal Fastify server demonstrating how to integrate the SDK into a
 * custom application. Uses fastify.decorate() to register the SaucelabsClient
 * and domain modules on the server instance, then exposes demo routes.
 *
 * This example constructs everything manually so you can see each
 * integration point (client creation, decoration, route binding, shutdown).
 *
 * Usage:
 *   SAUCE_USERNAME=your_user SAUCE_ACCESS_KEY=your_key node examples/fastify-app/server.mjs
 */

import Fastify from 'fastify';

import {
  createSaucelabsClient,
  SaucelabsError,
  SaucelabsNotFoundError,
  SaucelabsAuthError,
  SaucelabsRateLimitError,
  SaucelabsValidationError,
} from '../../src/index.mjs';


// =============================================================================
// Configuration
// =============================================================================
/**
 * Mock config object simulating what an external config service or .env
 * loader might provide. In production you would use resolveConfig() or
 * your own configuration layer.
 */
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
/**
 * Build and configure the Fastify instance with SDK decorations and routes.
 *
 * @returns {import('fastify').FastifyInstance} Configured server
 */
async function buildServer() {
  // --- Fastify instance ---
  const server = Fastify({
    logger: CONFIG.logLevel === 'debug' || CONFIG.logLevel === 'trace',
  });

  // --- SaucelabsClient with all domain modules ---
  const client = createSaucelabsClient({
    username: CONFIG.username,
    apiKey: CONFIG.apiKey,
    region: CONFIG.region,
    rateLimitAutoWait: true,
  });

  // --- Decorate the server instance ---
  // This makes clients available as server.saucelabs, server.saucelabsClients
  // in route handlers and plugins.
  server.decorate('saucelabs', client);
  server.decorate('saucelabsClients', {
    jobs: client.jobs,
    platform: client.platform,
    users: client.users,
    upload: client.upload,
  });

  // --- Error handler ---
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

  // ---------------------------------------------------------------------------
  // Routes
  // ---------------------------------------------------------------------------

  // GET /health — Basic health check.
  server.get('/health', async () => {
    return {
      status: 'ok',
      service: 'saucelabs-api-example',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  });

  // GET /demo/jobs — List recent test jobs.
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

  // GET /demo/jobs/:jobId — Get a specific job by ID.
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

  // GET /demo/platform/status — Get Sauce Labs service status (public).
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

  // GET /demo/platform/:automationApi — Get supported platforms.
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

  // GET /demo/users/:username — Get user account info.
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

  // GET /demo/users/:username/concurrency — Get concurrency stats.
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
async function start() {
  const server = await buildServer();

  // --- Graceful shutdown ---
  const shutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    try {
      server.saucelabs.close();
      await server.close();
      console.log('Server closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // --- Listen ---
  try {
    await server.listen({ port: CONFIG.port, host: CONFIG.host });
    console.log('');
    console.log('='.repeat(60));
    console.log(' Sauce Labs API SDK — Fastify Demo Server');
    console.log('='.repeat(60));
    console.log('');
    console.log(`  Listening on http://${CONFIG.host}:${CONFIG.port}`);
    console.log(`  Region: ${CONFIG.region}`);
    console.log(`  Username: ${CONFIG.username || '(not set)'}`);
    console.log('');
    console.log('  Routes:');
    console.log('    GET /health                               — Health check');
    console.log('    GET /demo/jobs?limit=10&skip=0            — List jobs');
    console.log('    GET /demo/jobs/:jobId                     — Get job');
    console.log('    GET /demo/platform/status                 — Service status');
    console.log('    GET /demo/platform/:automationApi         — Supported platforms');
    console.log('    GET /demo/users/:username                 — User info');
    console.log('    GET /demo/users/:username/concurrency     — Concurrency stats');
    console.log('');
    console.log('  Press Ctrl+C to stop.');
    console.log('='.repeat(60));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
