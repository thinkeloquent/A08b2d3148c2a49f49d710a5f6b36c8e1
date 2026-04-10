/**
 * Error handler plugin for Overview app.
 * Direct function call pattern (not fp-wrapped) to avoid FSTWRN004.
 */
export function registerErrorHandlers(fastify) {
  fastify.setErrorHandler((error, request, reply) => {
    const statusCode = error.statusCode || 500;
    fastify.log.error(
      { err: error, reqId: request.id },
      `[overview] Request error: ${error.message}`
    );

    reply.status(statusCode).send({
      error: statusCode >= 500 ? "Internal Server Error" : error.message,
      statusCode,
    });
  });
}
