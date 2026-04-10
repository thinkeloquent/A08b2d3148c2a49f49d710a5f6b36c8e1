/**
 * Error Handler Middleware -- Sauce Labs API SDK
 *
 * Maps SDK error types to Fastify HTTP error responses.
 */

import {
  SaucelabsError,
  SaucelabsAuthError,
  SaucelabsNotFoundError,
  SaucelabsRateLimitError,
  SaucelabsValidationError,
  SaucelabsServerError,
} from '../errors.mjs';
import { create } from '../logger.mjs';

const log = create('saucelabs-api', import.meta.url);

/**
 * Create a Fastify error handler that maps SDK errors to HTTP responses.
 */
export function createErrorHandler() {
  return function errorHandler(error, request, reply) {
    log.error('request error', {
      method: request.method,
      url: request.url,
      error: error.message,
      name: error.name,
    });

    if (error instanceof SaucelabsRateLimitError) {
      const retryAfter = error.retryAfter || 60;
      return reply
        .status(429)
        .header('Retry-After', String(retryAfter))
        .send({
          error: true,
          message: error.message,
          type: 'SaucelabsRateLimitError',
          context: { retryAfter },
        });
    }

    if (error instanceof SaucelabsValidationError) {
      return reply.status(error.statusCode || 400).send({
        error: true,
        message: error.message,
        type: 'SaucelabsValidationError',
        context: {},
      });
    }

    if (error instanceof SaucelabsAuthError) {
      return reply.status(401).send({
        error: true,
        message: error.message,
        type: 'SaucelabsAuthError',
        context: {},
      });
    }

    if (error instanceof SaucelabsNotFoundError) {
      return reply.status(404).send({
        error: true,
        message: error.message,
        type: 'SaucelabsNotFoundError',
        context: {},
      });
    }

    if (error instanceof SaucelabsServerError) {
      return reply.status(error.statusCode || 500).send({
        error: true,
        message: error.message,
        type: 'SaucelabsServerError',
        context: {},
      });
    }

    if (error instanceof SaucelabsError) {
      return reply.status(error.statusCode || 500).send({
        error: true,
        message: error.message,
        type: error.name,
        context: {},
      });
    }

    // Fastify validation errors
    if (error.validation) {
      return reply.status(400).send({
        error: true,
        message: error.message,
        type: 'ValidationError',
        context: { validation: error.validation },
      });
    }

    // Unknown errors
    return reply.status(500).send({
      error: true,
      message: 'Internal server error',
      type: 'InternalError',
      context: {},
    });
  };
}
