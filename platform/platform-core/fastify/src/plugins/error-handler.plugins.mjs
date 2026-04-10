/**
 * Error Handler Plugin
 *
 * IMPORTANT: Direct function call, NOT fp-wrapped (avoids FSTWRN004).
 * Call as: registerErrorHandlers(server)
 *
 * Sets server.setErrorHandler with a structured error response.
 * Error format: { statusCode, error, message }
 */

/**
 * Register error handlers on the Fastify server instance.
 * Must be called directly, not registered as a plugin.
 * @param {import('fastify').FastifyInstance} server
 */
export function registerErrorHandlers(server) {
  server.setErrorHandler(async (error, request, reply) => {
    const statusCode = error.statusCode || error.status || 500;
    const isServerError = statusCode >= 500;

    if (isServerError) {
      server.log.error(
        {
          requestId: request.id,
          method: request.method,
          url: request.url,
          statusCode,
          error: error.message,
          stack: error.stack,
        },
        'Unhandled server error'
      );
    } else {
      server.log.warn(
        {
          requestId: request.id,
          method: request.method,
          url: request.url,
          statusCode,
          error: error.message,
        },
        'Request error'
      );
    }

    const errorName = getHttpErrorName(statusCode);

    const body = {
      statusCode,
      error: errorName,
      message: isServerError && process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : (error.message || 'An error occurred'),
    };

    if (error.validation) {
      body.validation = error.validation;
    }

    return reply.status(statusCode).send(body);
  });
}

/**
 * Map numeric HTTP status codes to their standard reason phrase.
 * @param {number} statusCode
 * @returns {string}
 */
function getHttpErrorName(statusCode) {
  const names = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    409: 'Conflict',
    410: 'Gone',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
  };
  return names[statusCode] || 'Error';
}
