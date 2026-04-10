/**
 * @module server/middleware/error-handler
 * @description Fastify error handler mapping JiraApiError to HTTP responses.
 */

import { JiraApiError } from '../../errors.mjs';
import { createLogger } from '../../logger.mjs';

const log = createLogger('jira-api', import.meta.url);

/**
 * Create a Fastify error handler for Jira API errors.
 * @returns {import('fastify').FastifyErrorHandler}
 */
export function createErrorHandler() {
  return (error, request, reply) => {
    if (error instanceof JiraApiError) {
      const status = error.status || 500;
      log.warn('jira api error', { status, message: error.message, url: request.url });
      reply.code(status).send({
        error: true,
        message: error.message,
        type: error.name,
        code: error.code,
      });
      return;
    }

    log.error('unhandled error', { message: error.message, url: request.url });
    reply.code(500).send({
      error: true,
      message: 'Internal server error',
      type: 'InternalError',
    });
  };
}
