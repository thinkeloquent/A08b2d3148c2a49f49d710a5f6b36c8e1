/**
 * Error Handler Plugin
 *
 * Provides global error handling with structured responses.
 * Exports a direct function (not fp-wrapped) to avoid FSTWRN004 scope conflicts.
 */

import { detectMissingTable, buildMissingTableResponse } from '../../../../_shared/sequelize-error-utils.mjs';

/**
 * Register the error handler on a Fastify instance.
 * Call this directly (not via fastify.register) to keep the handler in the correct scope.
 *
 * @param {import('fastify').FastifyInstance} fastify
 */
export function registerErrorHandlers(fastify) {
  fastify.setErrorHandler((error, request, reply) => {
    const missingTable = detectMissingTable(error);
    if (missingTable) {
      fastify.log.warn(
        { err: error, table: missingTable.tableName },
        `Missing database table "${missingTable.tableName}" — database setup may not have been run`
      );
      return reply.status(503).send(buildMissingTableResponse(missingTable.tableName, 'prompt-oneshot-template'));
    }

    const statusCode = error.statusCode || 500;

    fastify.log.error({
      err: error,
      request: {
        method: request.method,
        url: request.url,
        params: request.params,
      },
    });

    reply.status(statusCode).send({
      error: error.name || 'InternalServerError',
      message: error.message,
      statusCode,
    });
  });
}

export default registerErrorHandlers;
