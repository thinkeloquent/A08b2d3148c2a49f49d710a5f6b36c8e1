/**
 * Fastify server setup.
 * Creates and configures the Fastify instance with plugins, routes, and error handling.
 * @module server
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import { resolveGithubEnv } from '@internal/env-resolver';

import { GitHubClient } from './sdk/client.mjs';
import { resolveToken } from './sdk/auth.mjs';
import { registerRoutes } from './routes/index.mjs';
import { createErrorHandler } from './middleware/error-handler.mjs';

/**
 * @typedef {Object} ServerOptions
 * @property {string} [token] - Explicit GitHub token
 * @property {string} [baseUrl] - GitHub API base URL
 * @property {string} [logLevel='info'] - Fastify log level
 * @property {Object} [corsOptions] - CORS options for @fastify/cors
 */

/**
 * Create and configure a Fastify server with GitHub API routes.
 *
 * @param {ServerOptions} [options={}] - Server configuration options
 * @returns {Promise<{server: import('fastify').FastifyInstance, client: GitHubClient}>}
 */
export async function createServer(options = {}) {
  const {
    token,
    baseUrl = resolveGithubEnv().baseApiUrl,
    logLevel = 'info',
    corsOptions = {},
  } = options;

  // Resolve GitHub token
  const resolved = resolveToken(token);

  // Create the GitHub client
  const client = new GitHubClient({
    token: resolved.token,
    baseUrl,
  });

  // Create Fastify instance
  const server = Fastify({
    logger: {
      level: logLevel,
    },
  });

  // Register plugins
  await server.register(cors, corsOptions);
  await server.register(sensible);

  // Set custom error handler
  server.setErrorHandler(createErrorHandler());

  // Register all routes
  await registerRoutes(server, client);

  return { server, client };
}

/**
 * Start a Fastify server listening on the specified host and port.
 *
 * @param {import('fastify').FastifyInstance} server - Configured Fastify instance
 * @param {Object} [options={}]
 * @param {number} [options.port=3100] - Port to listen on
 * @param {string} [options.host='0.0.0.0'] - Host to bind to
 * @returns {Promise<string>} The address the server is listening on
 */
export async function startServer(server, options = {}) {
  const { port = 3100, host = '0.0.0.0' } = options;

  const address = await server.listen({ port, host });
  server.log.info(`GitHub API server listening on ${address}`);
  return address;
}
