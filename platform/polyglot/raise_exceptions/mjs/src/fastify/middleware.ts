/**
 * Request ID plugin for Fastify.
 *
 * Extracts X-Request-Id from headers or uses Fastify's built-in request.id.
 */

import type { FastifyInstance, FastifyPluginCallback } from 'fastify';
import { create } from '../logger.js';

const logger = create('common-exceptions', __filename);

/**
 * Options for request ID plugin.
 */
export interface RequestIdPluginOptions {
  header?: string;
}

/**
 * Fastify plugin to ensure request ID is available and logged.
 *
 * Fastify provides request.id by default, but this plugin:
 * - Logs the request ID for each request
 * - Adds it to response headers
 *
 * @example
 * const app = Fastify();
 * app.register(requestIdPlugin);
 */
export const requestIdPlugin: FastifyPluginCallback<RequestIdPluginOptions> = (
  fastify: FastifyInstance,
  options: RequestIdPluginOptions,
  done: (err?: Error) => void
) => {
  const headerName = options.header ?? 'x-request-id';

  // Add hook to log request ID and add to response
  fastify.addHook('onRequest', async (request, reply) => {
    const requestId = request.id;
    logger.debug(`Request ${requestId} started: ${request.method} ${request.url}`);

    // Add to response headers
    reply.header(headerName, requestId);
  });

  fastify.addHook('onResponse', async (request, reply) => {
    logger.debug(
      `Request ${request.id} completed: ${reply.statusCode} (${reply.elapsedTime?.toFixed(2) ?? '?'}ms)`
    );
  });

  logger.info('Request ID plugin registered');
  done();
};

// Support both named export and default for plugin registration
export default requestIdPlugin;
