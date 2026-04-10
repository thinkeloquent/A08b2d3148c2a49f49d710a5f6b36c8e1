/**
 * Error Handler Plugin
 *
 * Provides global error handling with structured responses.
 *
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

    // Handle Fastify validation errors
    if (error.validation) {
      return reply.status(400).send({
        success: false,
        error: "Validation Error",
        message: error.message,
        statusCode: 400,
      });
    }

    fastify.log.error({
      err: error,
      request: {
        method: request.method,
        url: request.url,
        params: request.params,
      },
    });

    reply.status(statusCode).send({
      success: false,
      error: error.name || "InternalServerError",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "An unexpected error occurred",
      statusCode,
    });
  });
}

export default registerErrorHandlers;
