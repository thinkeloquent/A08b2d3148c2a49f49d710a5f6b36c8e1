/**
 * Error Handler Plugin
 *
 * Provides global error handling with structured responses.
 * Exports a direct function (not fp-wrapped) to avoid FSTWRN004 scope conflicts.
 */

/**
 * Register the error handler on a Fastify instance.
 * Call this directly (not via fastify.register) to keep the handler in the correct scope.
 *
 * @param {import('fastify').FastifyInstance} fastify
 */
export function registerErrorHandlers(fastify) {
  fastify.setErrorHandler((error, request, reply) => {
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
      error: error.name || "InternalServerError",
      message: error.message,
      statusCode,
    });
  });
}

export default registerErrorHandlers;
