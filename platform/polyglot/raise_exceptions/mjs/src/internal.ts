/**
 * Internal server exception classes for common-exceptions.
 *
 * Provides exception classes for internal server errors:
 * - InternalServerException (500)
 * - ServiceUnavailableException (503)
 * - BadGatewayException (502)
 */

import { BaseHttpException, LogEntry } from './base.js';
import { ErrorCode } from './codes.js';
import { Logger, create } from './logger.js';

const logger = create('common-exceptions', __filename);

/**
 * Common options for internal exceptions.
 */
export interface InternalExceptionOptions {
  message?: string;
  details?: Record<string, unknown>;
  requestId?: string;
  customLogger?: Logger;
}

/**
 * Options for InternalServerException.
 */
export interface InternalServerExceptionOptions extends InternalExceptionOptions {
  exposeMessage?: boolean;
}

/**
 * Exception for unhandled internal server errors.
 *
 * HTTP Status: 500 Internal Server Error
 * Default Code: INTERNAL_SERVER_ERROR
 *
 * Note: This exception sanitizes the message for client responses
 * to avoid leaking implementation details. Full details are logged.
 */
export class InternalServerException extends BaseHttpException {
  private static readonly SAFE_MESSAGE = 'An internal error occurred';

  private readonly _internalMessage: string;
  private readonly _internalDetails?: Record<string, unknown>;


  constructor(options: InternalServerExceptionOptions = {}) {
    const _logger = options.customLogger ?? logger;
    const message = options.message ?? 'Internal server error';

    // Log at ERROR level
    _logger.error(`Internal error: ${message}`);
    if (options.details) {
      _logger.error(`Internal error details: ${JSON.stringify(options.details)}`);
    }

    super({
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: options.exposeMessage ? message : InternalServerException.SAFE_MESSAGE,
      status: 500,
      details: undefined, // Never expose internal details
      requestId: options.requestId,
      customLogger: options.customLogger,
    });

    this._internalMessage = message;
    this._internalDetails = options.details;

  }

  /**
   * Convert to log entry with full internal details.
   */
  toLogEntry(): LogEntry {
    const entry = super.toLogEntry();
    // Include internal details in log (not in response)
    (entry.error as Record<string, unknown>).internalMessage = this._internalMessage;
    (entry.error as Record<string, unknown>).internalDetails = this._internalDetails;
    return entry;
  }
}

/**
 * Options for ServiceUnavailableException.
 */
export interface ServiceUnavailableExceptionOptions extends InternalExceptionOptions {
  retryAfterMs?: number;
}

/**
 * Exception for service temporarily unavailable.
 *
 * HTTP Status: 503 Service Unavailable
 * Default Code: SERVICE_UNAVAILABLE
 */
export class ServiceUnavailableException extends BaseHttpException {
  public readonly retryAfterMs?: number;

  constructor(options: ServiceUnavailableExceptionOptions = {}) {
    const details: Record<string, unknown> = { ...options.details };

    if (options.retryAfterMs !== undefined) {
      details.retryAfterMs = options.retryAfterMs;
    }

    super({
      code: ErrorCode.SERVICE_UNAVAILABLE,
      message: options.message ?? 'Service temporarily unavailable',
      status: 503,
      details: Object.keys(details).length > 0 ? details : undefined,
      requestId: options.requestId,
      customLogger: options.customLogger,
    });

    this.retryAfterMs = options.retryAfterMs;
  }
}

/**
 * Exception for invalid response from upstream server.
 *
 * HTTP Status: 502 Bad Gateway
 * Default Code: BAD_GATEWAY
 */
export class BadGatewayException extends BaseHttpException {
  constructor(options: InternalExceptionOptions = {}) {
    super({
      code: ErrorCode.BAD_GATEWAY,
      message: options.message ?? 'Bad gateway',
      status: 502,
      details: options.details,
      requestId: options.requestId,
      customLogger: options.customLogger,
    });
  }
}

logger.debug('Internal exception classes initialized');
