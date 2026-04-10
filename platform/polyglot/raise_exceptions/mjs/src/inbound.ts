/**
 * Inbound request exception classes for common-exceptions.
 *
 * Provides exception classes for handling incoming request errors:
 * - NotAuthenticatedException (401)
 * - NotAuthorizedException (403)
 * - NotFoundException (404)
 * - BadRequestException (400)
 * - ValidationException (422)
 * - ConflictException (409)
 * - TooManyRequestsException (429)
 */

import { BaseHttpException } from './base.js';
import { ErrorCode } from './codes.js';
import { Logger, create } from './logger.js';
import { ValidationErrorDetail } from './response.js';

const logger = create('common-exceptions', __filename);

/**
 * Common options for inbound exceptions.
 */
export interface InboundExceptionOptions {
  message?: string;
  details?: Record<string, unknown>;
  requestId?: string;
  customLogger?: Logger;
}

/**
 * Exception for missing or invalid authentication credentials.
 *
 * HTTP Status: 401 Unauthorized
 * Default Code: AUTH_NOT_AUTHENTICATED
 */
export class NotAuthenticatedException extends BaseHttpException {
  constructor(options: InboundExceptionOptions = {}) {
    super({
      code: ErrorCode.AUTH_NOT_AUTHENTICATED,
      message: options.message ?? 'Authentication required',
      status: 401,
      details: options.details,
      requestId: options.requestId,
      customLogger: options.customLogger,
    });
  }
}

/**
 * Exception for valid authentication but insufficient permissions.
 *
 * HTTP Status: 403 Forbidden
 * Default Code: AUTHZ_FORBIDDEN
 */
export class NotAuthorizedException extends BaseHttpException {
  constructor(options: InboundExceptionOptions = {}) {
    super({
      code: ErrorCode.AUTHZ_FORBIDDEN,
      message: options.message ?? 'Access denied',
      status: 403,
      details: options.details,
      requestId: options.requestId,
      customLogger: options.customLogger,
    });
  }
}

/**
 * Exception for requested resource not found.
 *
 * HTTP Status: 404 Not Found
 * Default Code: NOT_FOUND
 */
export class NotFoundException extends BaseHttpException {
  constructor(options: InboundExceptionOptions = {}) {
    super({
      code: ErrorCode.NOT_FOUND,
      message: options.message ?? 'Resource not found',
      status: 404,
      details: options.details,
      requestId: options.requestId,
      customLogger: options.customLogger,
    });
  }
}

/**
 * Exception for malformed request syntax.
 *
 * HTTP Status: 400 Bad Request
 * Default Code: BAD_REQUEST
 */
export class BadRequestException extends BaseHttpException {
  constructor(options: InboundExceptionOptions = {}) {
    super({
      code: ErrorCode.BAD_REQUEST,
      message: options.message ?? 'Bad request',
      status: 400,
      details: options.details,
      requestId: options.requestId,
      customLogger: options.customLogger,
    });
  }
}

/**
 * Options for ValidationException.
 */
export interface ValidationExceptionOptions extends InboundExceptionOptions {
  errors?: ValidationErrorDetail[];
}

/**
 * Exception for request body/params failing validation.
 *
 * HTTP Status: 422 Unprocessable Entity
 * Default Code: VALIDATION_FAILED
 */
export class ValidationException extends BaseHttpException {
  public readonly errors: ValidationErrorDetail[];

  constructor(options: ValidationExceptionOptions = {}) {
    const errors = options.errors ?? [];
    const details = { ...options.details };

    if (errors.length > 0) {
      details.errors = errors;
    }

    super({
      code: ErrorCode.VALIDATION_FAILED,
      message: options.message ?? 'Validation failed',
      status: 422,
      details: Object.keys(details).length > 0 ? details : undefined,
      requestId: options.requestId,
      customLogger: options.customLogger,
    });

    this.errors = errors;
  }

  /**
   * Create ValidationException from a list of field error objects.
   */
  static fromFieldErrors(
    fieldErrors: Array<{ field: string; message: string; code?: string }>,
    message: string = 'Validation failed',
    requestId?: string
  ): ValidationException {
    const errors: ValidationErrorDetail[] = fieldErrors.map((err) => ({
      field: err.field,
      message: err.message,
      code: err.code,
    }));

    return new ValidationException({ message, errors, requestId });
  }
}

/**
 * Exception for resource state conflict.
 *
 * HTTP Status: 409 Conflict
 * Default Code: CONFLICT
 */
export class ConflictException extends BaseHttpException {
  constructor(options: InboundExceptionOptions = {}) {
    super({
      code: ErrorCode.CONFLICT,
      message: options.message ?? 'Resource conflict',
      status: 409,
      details: options.details,
      requestId: options.requestId,
      customLogger: options.customLogger,
    });
  }
}

/**
 * Options for TooManyRequestsException.
 */
export interface TooManyRequestsExceptionOptions extends InboundExceptionOptions {
  retryAfterMs?: number;
}

/**
 * Exception for rate limit exceeded.
 *
 * HTTP Status: 429 Too Many Requests
 * Default Code: TOO_MANY_REQUESTS
 */
export class TooManyRequestsException extends BaseHttpException {
  public readonly retryAfterMs?: number;

  constructor(options: TooManyRequestsExceptionOptions = {}) {
    const details = { ...options.details };

    if (options.retryAfterMs !== undefined) {
      details.retryAfterMs = options.retryAfterMs;
    }

    super({
      code: ErrorCode.TOO_MANY_REQUESTS,
      message: options.message ?? 'Too many requests',
      status: 429,
      details: Object.keys(details).length > 0 ? details : undefined,
      requestId: options.requestId,
      customLogger: options.customLogger,
    });

    this.retryAfterMs = options.retryAfterMs;
  }
}

logger.debug('Inbound exception classes initialized');
