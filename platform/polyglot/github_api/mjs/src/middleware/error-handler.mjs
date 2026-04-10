/**
 * Error-to-HTTP response mapper for Fastify.
 * Maps SDK error types to appropriate HTTP status codes and JSON bodies.
 * @module middleware/error-handler
 */

import {
  GitHubError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
  RateLimitError,
  ServerError,
} from '../sdk/errors.mjs';

/**
 * Create a Fastify error handler that maps GitHub SDK errors to HTTP responses.
 * @returns {function(Error, import('fastify').FastifyRequest, import('fastify').FastifyReply): void}
 */
export function createErrorHandler() {
  return function errorHandler(error, request, reply) {
    const log = request.log || console;

    // Validation errors from the SDK
    if (error instanceof ValidationError) {
      log.warn({ err: error }, 'Validation error');
      return reply.status(400).send({
        error: 'Validation Error',
        message: error.message,
        statusCode: 400,
        requestId: error.requestId,
        documentationUrl: error.documentationUrl,
      });
    }

    // Authentication errors
    if (error instanceof AuthError) {
      log.warn({ err: error }, 'Authentication error');
      return reply.status(401).send({
        error: 'Unauthorized',
        message: error.message,
        statusCode: 401,
        requestId: error.requestId,
        documentationUrl: error.documentationUrl,
      });
    }

    // Rate limit errors
    if (error instanceof RateLimitError) {
      log.warn({ err: error }, 'Rate limit error');
      const headers = {};
      if (error.retryAfter) {
        headers['Retry-After'] = String(error.retryAfter);
      }
      if (error.resetAt) {
        headers['X-RateLimit-Reset'] = String(
          Math.floor(error.resetAt.getTime() / 1000),
        );
      }
      return reply.status(429).headers(headers).send({
        error: 'Rate Limit Exceeded',
        message: error.message,
        statusCode: 429,
        resetAt: error.resetAt?.toISOString(),
        retryAfter: error.retryAfter,
        requestId: error.requestId,
        documentationUrl: error.documentationUrl,
      });
    }

    // Forbidden (non-rate-limit)
    if (error instanceof ForbiddenError) {
      log.warn({ err: error }, 'Forbidden error');
      return reply.status(403).send({
        error: 'Forbidden',
        message: error.message,
        statusCode: 403,
        requestId: error.requestId,
        documentationUrl: error.documentationUrl,
      });
    }

    // Not found
    if (error instanceof NotFoundError) {
      log.info({ err: error }, 'Not found');
      return reply.status(404).send({
        error: 'Not Found',
        message: error.message,
        statusCode: 404,
        requestId: error.requestId,
        documentationUrl: error.documentationUrl,
      });
    }

    // Conflict
    if (error instanceof ConflictError) {
      log.warn({ err: error }, 'Conflict error');
      return reply.status(409).send({
        error: 'Conflict',
        message: error.message,
        statusCode: 409,
        requestId: error.requestId,
        documentationUrl: error.documentationUrl,
      });
    }

    // Server errors (5xx from GitHub)
    if (error instanceof ServerError) {
      log.error({ err: error }, 'GitHub server error');
      return reply.status(502).send({
        error: 'Bad Gateway',
        message: error.message,
        statusCode: 502,
        requestId: error.requestId,
        documentationUrl: error.documentationUrl,
      });
    }

    // Generic GitHub errors
    if (error instanceof GitHubError) {
      log.error({ err: error }, 'GitHub API error');
      return reply.status(error.status || 500).send({
        error: 'GitHub API Error',
        message: error.message,
        statusCode: error.status || 500,
        requestId: error.requestId,
        documentationUrl: error.documentationUrl,
      });
    }

    // Fastify validation errors (from schema validation)
    if (error.validation) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: error.message,
        statusCode: 400,
      });
    }

    // Unknown errors
    log.error({ err: error }, 'Unhandled error');
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      statusCode: 500,
    });
  };
}
