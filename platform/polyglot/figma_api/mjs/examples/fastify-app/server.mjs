/**
 * server.mjs — Fastify Integration Example (Figma API SDK)
 *
 * Minimal Fastify server demonstrating how to integrate the SDK into a
 * custom application. Uses fastify.decorate() to register the FigmaClient
 * and domain clients on the server instance, then exposes demo routes.
 *
 * This example does NOT use the SDK's built-in createServer(). Instead it
 * constructs everything manually so you can see each integration point.
 *
 * Usage:
 *   PORT=3000 FIGMA_TOKEN=figd_... node examples/fastify-app/server.mjs
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';

import {
  FigmaClient,
  FilesClient,
  ProjectsClient,
  CommentsClient,
  ComponentsClient,
  FigmaError,
  createErrorHandler,
} from '../../src/index.mjs';

// =============================================================================
// Configuration
// =============================================================================
/**
 * Mock config object simulating what an external config service or .env
 * loader might provide. In production you would use loadConfig() or your
 * own configuration layer.
 */
const CONFIG = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  figmaToken: process.env.FIGMA_TOKEN || 'figd_demo_token_for_examples_only',
  figmaBaseUrl: process.env.FIGMA_API_BASE_URL || 'https://api.figma.com',
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

  // --- CORS ---
  await server.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Figma-Token', 'Authorization'],
  });

  // --- FigmaClient ---
  const client = new FigmaClient({
    token: CONFIG.figmaToken,
    baseUrl: CONFIG.figmaBaseUrl,
    rateLimitAutoWait: true,
    maxRetries: 3,
    cache: { maxSize: 100, ttl: 300 },
  });

  // --- Domain clients ---
  const filesClient = new FilesClient(client);
  const projectsClient = new ProjectsClient(client);
  const commentsClient = new CommentsClient(client);
  const componentsClient = new ComponentsClient(client);

  // --- Decorate the server instance ---
  // This makes clients available as server.figmaClient, server.files, etc.
  // in route handlers and plugins.
  server.decorate('figmaClient', client);
  server.decorate('files', filesClient);
  server.decorate('projects', projectsClient);
  server.decorate('comments', commentsClient);
  server.decorate('components', componentsClient);

  // --- Error handler ---
  server.setErrorHandler(createErrorHandler());

  // ---------------------------------------------------------------------------
  // Routes
  // ---------------------------------------------------------------------------

  // GET /health — Basic health check.
  server.get('/health', async () => {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  });

  // GET /demo/file/:fileKey — Fetch a Figma file via FilesClient.
  server.get('/demo/file/:fileKey', async (request, reply) => {
    const { fileKey } = request.params;
    const { version, ids, depth } = request.query;

    try {
      const data = await server.files.getFile(fileKey, {
        version: version || undefined,
        ids: ids || undefined,
        depth: depth ? parseInt(depth, 10) : undefined,
      });
      return data;
    } catch (err) {
      if (err instanceof FigmaError) {
        return reply.status(err.status || 500).send(err.toJSON());
      }
      throw err;
    }
  });

  // GET /demo/team/:teamId/projects — List team projects.
  server.get('/demo/team/:teamId/projects', async (request, reply) => {
    const { teamId } = request.params;

    try {
      const data = await server.projects.getTeamProjects(teamId);
      return data;
    } catch (err) {
      if (err instanceof FigmaError) {
        return reply.status(err.status || 500).send(err.toJSON());
      }
      throw err;
    }
  });

  // GET /demo/file/:fileKey/comments — List comments on a file.
  server.get('/demo/file/:fileKey/comments', async (request, reply) => {
    const { fileKey } = request.params;
    const { as_md } = request.query;

    try {
      const data = await server.comments.listComments(fileKey, {
        as_md: as_md === 'true' ? true : undefined,
      });
      return data;
    } catch (err) {
      if (err instanceof FigmaError) {
        return reply.status(err.status || 500).send(err.toJSON());
      }
      throw err;
    }
  });

  // GET /demo/stats — Return SDK client stats and cache stats.
  server.get('/demo/stats', async () => {
    const stats = server.figmaClient.stats;
    return {
      client: {
        requestsMade: stats.requestsMade,
        requestsFailed: stats.requestsFailed,
        cacheHits: stats.cacheHits,
        cacheMisses: stats.cacheMisses,
        rateLimitWaits: stats.rateLimitWaits,
        rateLimitTotalWaitSeconds: stats.rateLimitTotalWaitSeconds,
      },
      cache: stats.cache,
      lastRateLimit: server.figmaClient.lastRateLimit,
    };
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
    console.log(' Figma API SDK — Fastify Demo Server');
    console.log('='.repeat(60));
    console.log('');
    console.log(`  Listening on http://${CONFIG.host}:${CONFIG.port}`);
    console.log('');
    console.log('  Routes:');
    console.log('    GET /health                          — Health check');
    console.log('    GET /demo/file/:fileKey              — Fetch a file');
    console.log('    GET /demo/team/:teamId/projects      — List team projects');
    console.log('    GET /demo/file/:fileKey/comments     — List file comments');
    console.log('    GET /demo/stats                      — SDK client stats');
    console.log('');
    console.log('  Press Ctrl+C to stop.');
    console.log('='.repeat(60));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
