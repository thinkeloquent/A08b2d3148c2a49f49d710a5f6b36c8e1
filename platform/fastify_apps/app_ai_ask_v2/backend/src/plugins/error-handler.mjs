import { detectMissingTable, buildMissingTableResponse } from '../../../../_shared/sequelize-error-utils.mjs';

export function registerErrorHandlers(fastify) {
  fastify.setErrorHandler((error, request, reply) => {
    const missingTable = detectMissingTable(error);
    if (missingTable) {
      fastify.log.warn(
        { err: error, table: missingTable.tableName },
        `Missing database table "${missingTable.tableName}" — database setup may not have been run`
      );
      return reply.status(503).send(buildMissingTableResponse(missingTable.tableName, 'ai-ask-v2'));
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
