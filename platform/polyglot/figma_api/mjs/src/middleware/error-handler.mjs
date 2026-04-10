/**
 * Error Handler Middleware — Figma API SDK
 *
 * Maps SDK error types to Fastify HTTP error responses.
 */

import {
  FigmaError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ConfigurationError,
} from '../sdk/errors.mjs';
import { create } from '../logger.mjs';

const log = create('figma-api', import.meta.url);

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
      const retryAfter = error.rateLimitInfo?.retryAfter || 60;
      return reply
        .status(429)
        .header('Retry-After', String(retryAfter))
        .send({
          error: true,
          message: error.message,
          type: 'RateLimitError',
          context: {
            retryAfter,
            retryAfterMs: Math.ceil(retryAfter * 1000),
            retryAfterSeconds: Math.ceil(retryAfter),
            retryAfterMinutes: +(retryAfter / 60).toFixed(2),
            planTier: error.rateLimitInfo?.planTier,
            rateLimitType: error.rateLimitInfo?.rateLimitType,
          },
        });
    }

    if (error instanceof ValidationError) {
      return reply.status(400).send({
        error: true,
        message: error.message,
        type: 'ValidationError',
        context: error.meta,
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

    if (error instanceof AuthorizationError) {
      return reply.status(403).send({
        error: true,
        message: error.message,
        type: 'AuthorizationError',
        context: {},
      });
    }

    if (error instanceof NotFoundError) {
      return reply.status(404).send({
        error: true,
        message: error.message,
        type: 'NotFoundError',
        context: error.meta,
      });
    }

    if (error instanceof FigmaError) {
      return reply.status(error.status || 500).send({
        error: true,
        message: error.message,
        type: error.name,
        context: error.meta,
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
