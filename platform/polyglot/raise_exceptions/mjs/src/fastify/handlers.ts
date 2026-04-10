/**
 * Fastify exception handlers for common-exceptions.
 *
 * Provides handlers for:
 * - BaseHttpException and subclasses
 * - Validation errors (AJV)
 * - Generic errors (catch-all)
 */

import type { FastifyInstance, FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { BaseHttpException } from '../base.js';
import { ErrorCode } from '../codes.js';
import { ValidationException } from '../inbound.js';
import { InternalServerException } from '../internal.js';
import { Logger, create } from '../logger.js';
import { serializeErrorResponse } from '../response.js';
import { normalizeAjvErrors } from './normalizers.js';

const logger = create('common-exceptions', __filename);

/**
 * Options for registering exception handlers.
 */
export interface RegisterHandlersOptions {
  customLogger?: Logger;
}

/**
 * Get request ID from Fastify request.
 */
function getRequestId(request: FastifyRequest): string | undefined {
  // Fastify provides request.id by default
  return request.id;
}

/**
 * Create the main error handler for Fastify.
 */
export function createErrorHandler(customLogger?: Logger) {
  const _logger = customLogger ?? logger;

  return function errorHandler(
    error: FastifyError | BaseHttpException | Error,
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const requestId = getRequestId(request);

    // Handle BaseHttpException and subclasses
    if (error instanceof BaseHttpException) {
      if (requestId) {
        error.requestId = requestId;
      }

      _logger.debug(`Handling ${error.code} for ${request.url}`);

      return reply.status(error.status).send(error.toResponse());
    }

    // Handle Fastify validation errors
    if ('validation' in error && Array.isArray((error as any).validation)) {
      _logger.debug(`Validation error for ${request.url}`);

      const normalizedErrors = normalizeAjvErrors((error as any).validation);
      const validationExc = ValidationException.fromFieldErrors(
        normalizedErrors,
        'Validation failed',
        requestId
      );

      return reply.status(422).send(validationExc.toResponse());
    }

    // Handle Fastify errors with statusCode
    if ('statusCode' in error && typeof error.statusCode === 'number') {
      const statusCode = error.statusCode;
      _logger.debug(`Fastify error for ${request.url}: ${statusCode}`);

      const statusToCode: Record<number, ErrorCode> = {
        400: ErrorCode.BAD_REQUEST,
        401: ErrorCode.AUTH_NOT_AUTHENTICATED,
        403: ErrorCode.AUTHZ_FORBIDDEN,
        404: ErrorCode.NOT_FOUND,
        409: ErrorCode.CONFLICT,
        413: ErrorCode.BAD_REQUEST,
        422: ErrorCode.VALIDATION_FAILED,
        429: ErrorCode.TOO_MANY_REQUESTS,
        500: ErrorCode.INTERNAL_SERVER_ERROR,
        502: ErrorCode.BAD_GATEWAY,
        503: ErrorCode.SERVICE_UNAVAILABLE,
        504: ErrorCode.UPSTREAM_TIMEOUT,
      };

      const code = statusToCode[statusCode] ?? ErrorCode.INTERNAL_SERVER_ERROR;
      const response = serializeErrorResponse(code, error.message, statusCode, undefined, requestId);

      return reply.status(statusCode).send(response);
    }

    // Handle generic errors as internal server errors
    _logger.error(`Unhandled exception for ${request.url}: ${error.name}: ${error.message}`);

    const internalExc = new InternalServerException({
      message: error.message,
      details: { exceptionType: error.name },
      requestId,
      customLogger: _logger,
      exposeMessage: false,
    });

    return reply.status(500).send(internalExc.toResponse());
  };
}

/**
 * Create schema error formatter for Fastify.
 *
 * This formats AJV validation errors to match our standardized format.
 */
export function createSchemaErrorFormatter(customLogger?: Logger) {
  const _logger = customLogger ?? logger;

  return function schemaErrorFormatter(
    errors: { keyword: string; dataPath?: string; instancePath?: string; message?: string }[],
    dataVar: string
  ) {
    _logger.debug(`Schema validation errors: ${errors.length} errors in ${dataVar}`);

    const normalizedErrors = normalizeAjvErrors(errors);
    const errorMessages = normalizedErrors.map((e) => `${e.field}: ${e.message}`).join(', ');

    return new Error(errorMessages);
  };
}

/**
 * Register all exception handlers on a Fastify app.
 *
 * Registers:
 * - Error handler for BaseHttpException and all errors
 * - Schema error formatter for AJV validation
 *
 * @param app - Fastify application instance
 * @param options - Optional configuration
 *
 * @example
 * const app = Fastify();
 * registerExceptionHandlers(app);
 */
export function registerExceptionHandlers(
  app: FastifyInstance,
  options: RegisterHandlersOptions = {}
): void {
  const _logger = options.customLogger ?? logger;

  _logger.info('Registering exception handlers');

  // Set error handler
  app.setErrorHandler(createErrorHandler(_logger));

  // Set schema error formatter
  app.setSchemaErrorFormatter(createSchemaErrorFormatter(_logger));

  _logger.info('Exception handlers registered successfully');
}
