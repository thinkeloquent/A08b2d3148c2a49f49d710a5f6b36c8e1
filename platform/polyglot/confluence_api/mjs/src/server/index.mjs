/**
 * @module server
 * @description Fastify server factory and error handler for Confluence API operations.
 *
 * Provides a standalone Fastify server for proxying Confluence Data Center REST API
 * requests, along with a reusable error handler that maps ConfluenceApiError subclasses
 * to appropriate JSON responses.
 *
 * @example
 * import { createServer, startServer, createErrorHandler } from './server/index.mjs';
 *
 * const server = createServer({ logger: true });
 * server.setErrorHandler(createErrorHandler());
 * await startServer(server, { host: '0.0.0.0', port: 3000 });
 */

import Fastify from 'fastify';

/**
 * Create and configure a Fastify server instance for Confluence API operations.
 *
 * @param {import('fastify').FastifyServerOptions} [opts={}] - Fastify server options.
 * @returns {import('fastify').FastifyInstance} A configured Fastify instance.
 *
 * @example
 * const server = createServer({ logger: true });
 */
export function createServer(opts = {}) {
  return Fastify({ logger: true, ...opts });
}

/**
 * Start the Fastify server on the specified host and port.
 *
 * @param {import('fastify').FastifyInstance} server - The Fastify server instance.
 * @param {Object} [options={}] - Listen options.
 * @param {string} [options.host='0.0.0.0'] - Bind address.
 * @param {number} [options.port=3000] - Bind port.
 * @returns {Promise<void>}
 *
 * @example
 * await startServer(server, { host: '0.0.0.0', port: 3000 });
 */
export async function startServer(server, { host = '0.0.0.0', port = 3000 } = {}) {
  await server.listen({ host, port });
}

/**
 * Create a Fastify error handler that maps ConfluenceApiError instances to
 * structured JSON error responses.
 *
 * Non-Confluence errors are forwarded with a generic 500 response.
 *
 * @returns {import('fastify').FastifyErrorHandler} An error handler function.
 *
 * @example
 * server.setErrorHandler(createErrorHandler());
 */
export function createErrorHandler() {
  return function confluenceErrorHandler(error, request, reply) {
    if (error.status) {
      reply.status(error.status).send({
        error: true,
        message: error.message,
        type: error.name,
      });
    } else {
      reply.status(500).send({
        error: true,
        message: error.message,
        type: 'InternalError',
      });
    }
  };
}
