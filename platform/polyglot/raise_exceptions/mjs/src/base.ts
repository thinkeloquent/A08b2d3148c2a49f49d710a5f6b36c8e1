/**
 * Base exception class for common-exceptions.
 *
 * Provides BaseHttpException with serialization, logging, and SDK-compatible interface.
 * All specific exception classes inherit from this base.
 */

import { ErrorCode, getStatusForCode, isValidErrorCode } from './codes.js';
import { create, Logger } from './logger.js';
import { serializeErrorResponse, ErrorResponse } from './response.js';

const logger = create('common-exceptions', __filename);

/**
 * Options for BaseHttpException constructor.
 */
export interface BaseHttpExceptionOptions {
  code: ErrorCode | string;
  message: string;
  status?: number;
  details?: Record<string, unknown>;
  requestId?: string;
  customLogger?: Logger;
}

/**
 * Log entry format for structured logging.
 */
export interface LogEntry {
  level: string;
  category: string;
  message: string;
  error: {
    type: string;
    code: string;
    message: string;
    status: number;
    traceback?: string;
  };
  context: {
    details?: Record<string, unknown>;
    requestId?: string;
  };
  timestamp: string;
}

/**
 * Base HTTP exception class with standardized serialization and logging.
 *
 * All exception subclasses inherit from this base class. Provides:
 * - Consistent error response serialization via toResponse()
 * - Logger-compatible output via toLogEntry()
 * - Debug logging on instantiation
 * - Support for custom logger injection
 *
 * @example
 * const exc = new BaseHttpException({
 *   code: ErrorCode.NOT_FOUND,
 *   message: 'User not found',
 *   details: { userId: '123' }
 * });
 * const response = exc.toResponse();
 */
export class BaseHttpException extends Error {
  public readonly code: ErrorCode;
  public readonly status: number;
  public readonly details: Record<string, unknown>;
  public requestId?: string;
  public readonly timestamp: string;

  private readonly _codeStr: string;
  private readonly _logger: Logger;

  constructor(options: BaseHttpExceptionOptions) {
    super(options.message);

    // Set prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);

    // Normalize code to ErrorCode
    if (typeof options.code === 'string' && isValidErrorCode(options.code)) {
      this.code = options.code;
      this._codeStr = options.code;
    } else if (typeof options.code === 'string') {
      this.code = ErrorCode.INTERNAL_SERVER_ERROR;
      this._codeStr = options.code;
    } else {
      this.code = options.code;
      this._codeStr = options.code;
    }

    this.status = options.status ?? getStatusForCode(this.code);
    this.details = options.details ?? {};
    this.requestId = options.requestId;
    this.timestamp = new Date().toISOString();

    // Use custom logger or default
    this._logger = options.customLogger ?? logger;

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Log exception creation
    this._logger.debug(`Exception raised: ${this._codeStr} - ${options.message}`);
  }

  /**
   * Serialize exception to standardized error response format.
   *
   * @returns Object matching ErrorResponse schema
   */
  toResponse(): ErrorResponse {
    return serializeErrorResponse(
      this.code,
      this.message,
      this.status,
      Object.keys(this.details).length > 0 ? this.details : undefined,
      this.requestId
    );
  }

  /**
   * Convert exception to logger-compatible entry.
   *
   * @returns Object suitable for structured logging with error context
   */
  toLogEntry(): LogEntry {
    return {
      level: 'ERROR',
      category: 'exception',
      message: this.message,
      error: {
        type: this.constructor.name,
        code: this._codeStr,
        message: this.message,
        status: this.status,
        traceback: this.stack,
      },
      context: {
        details: Object.keys(this.details).length > 0 ? this.details : undefined,
        requestId: this.requestId,
      },
      timestamp: this.timestamp,
    };
  }

  /**
   * Return this exception with request_id set.
   *
   * @param requestId - Correlation ID to set
   * @returns This exception with requestId updated
   */
  withRequestId(requestId: string): this {
    this.requestId = requestId;
    return this;
  }

  /**
   * String representation for debugging.
   */
  toString(): string {
    return `${this.constructor.name}(${this._codeStr}): ${this.message}`;
  }
}

logger.debug('BaseHttpException initialized');
