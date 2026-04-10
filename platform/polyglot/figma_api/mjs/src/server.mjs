/**
 * Server Module — Figma API SDK
 *
 * Fastify server setup with CORS, error handling, and route registration.
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import { create } from './logger.mjs';
import { FigmaClient } from './sdk/client.mjs';
import { resolveToken } from './sdk/auth.mjs';
import { createErrorHandler } from './middleware/error-handler.mjs';
import { registerRoutes } from './routes/index.mjs';

const log = create('figma-api', import.meta.url);

/**
 * Create and configure the Fastify server.
 */
export async function createServer(options = {}) {
  const {
    token,
    baseUrl,
    logLevel = 'info',
    rateLimitAutoWait = true,
    rateLimitThreshold = 0,
  } = options;

  log.info('creating server', { baseUrl, logLevel });

  const client = new FigmaClient({
    token,
    baseUrl,
    rateLimitAutoWait,
    rateLimitThreshold,
  });

  const server = Fastify({
    logger: logLevel === 'debug' || logLevel === 'trace',
  });

  // Register plugins
  await server.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Figma-Token', 'Authorization'],
  });
  await server.register(sensible);

  // Error handler
  server.setErrorHandler(createErrorHandler());

  // Register all routes
  await registerRoutes(server, client);

  log.info('server configured');
  return { server, client };
}

/**
 * Start the server listening on the configured port.
 */
export async function startServer(server, { port = 3108, host = '0.0.0.0' } = {}) {
  await server.listen({ port, host });
  log.info('server listening', { port, host, address: `http://${host}:${port}` });
}
