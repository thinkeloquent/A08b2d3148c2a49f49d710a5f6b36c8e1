/**
 * Error Handler Middleware — Statsig Console API
 *
 * Maps SDK error types to Fastify HTTP error responses.
 */

import {
  StatsigError,
  AuthenticationError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ServerError,
} from '../errors.mjs';
import { create } from '../logger.mjs';

const log = create('statsig-api', import.meta.url);

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

    if (error instanceof RateLimitError) {
      const retryAfter = error.retryAfter || 60;
      return reply
        .status(429)
        .header('Retry-After', String(retryAfter))
        .send({
          error: true,
          message: error.message,
          type: 'RateLimitError',
          context: { retryAfter },
        });
    }

    if (error instanceof ValidationError) {
      return reply.status(error.statusCode || 400).send({
        error: true,
        message: error.message,
        type: 'ValidationError',
        context: { responseBody: error.responseBody },
      });
    }

    if (error instanceof AuthenticationError) {
      return reply.status(401).send({
        error: true,
        message: error.message,
        type: 'AuthenticationError',
        context: {},
      });
    }

    if (error instanceof NotFoundError) {
      return reply.status(404).send({
        error: true,
        message: error.message,
        type: 'NotFoundError',
        context: { responseBody: error.responseBody },
      });
    }

    if (error instanceof ServerError) {
      return reply.status(error.statusCode || 502).send({
        error: true,
        message: error.message,
        type: 'ServerError',
        context: {},
      });
    }

    if (error instanceof StatsigError) {
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
