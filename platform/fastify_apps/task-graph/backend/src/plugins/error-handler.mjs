/**
 * Error Handler Plugin
 *
 * Global error handling for Fastify.
 * Exports handler functions to be called directly on the app instance
 * (not as an fp-wrapped plugin) to avoid FSTWRN004 scope conflicts.
 *
 * @module plugins/error-handler
 */

import { ZodError } from 'zod';
import { AppError, ZodValidationError } from '../errors/index.mjs';
import { detectMissingTable, buildMissingTableResponse } from '../../../../_shared/sequelize-error-utils.mjs';

const APP_NAME = 'task-graph';

/**
 * Register error and not-found handlers on a Fastify instance.
 * Call this directly (not via fastify.register) to keep handlers in the correct scope.
 *
 * @param {import('fastify').FastifyInstance} app
 */
export function registerErrorHandlers(app) {
  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error }, 'Request error');

    // Check for missing database table
    const missingTable = detectMissingTable(error);
    if (missingTable) {
      request.log.warn(
        { table: missingTable.tableName },
        `Missing database table "${missingTable.tableName}" — database setup may not have been run`
      );
      return reply.status(503).send({
        success: false,
        error: buildMissingTableResponse(missingTable.tableName, APP_NAME),
      });
    }

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const validationError = new ZodValidationError(error);
      return reply.status(400).send({
        success: false,
        error: validationError.toJSON(),
      });
    }

    // Handle custom AppErrors
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        success: false,
        error: error.toJSON(),
      });
    }

    // Handle Fastify validation errors
    if (error.validation) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: error.validation,
        },
      });
    }

    // Handle other errors
    const statusCode = error.statusCode || 500;
    const isOperational = statusCode < 500;

    if (!isOperational) {
      console.error(`[${APP_NAME}] [ErrorHandler] Unexpected error:`, error);
    }

    return reply.status(statusCode).send({
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: isOperational ? error.message : 'An unexpected error occurred',
        ...(process.env.NODE_ENV === 'development' && {
          stack: error.stack,
        }),
      },
    });
  });

}
