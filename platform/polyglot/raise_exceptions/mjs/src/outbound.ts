/**
 * Outbound/Network exception classes for common-exceptions.
 *
 * Provides exception classes for handling outgoing HTTP call errors:
 * - ConnectTimeoutException (503)
 * - ReadTimeoutException (504)
 * - WriteTimeoutException (504)
 * - NetworkException (503)
 * - UpstreamServiceException (502)
 * - UpstreamTimeoutException (504)
 */

import { BaseHttpException } from './base.js';
import { ErrorCode } from './codes.js';
import { Logger, create } from './logger.js';

const logger = create('common-exceptions', __filename);

/**
 * Common options for outbound exceptions.
 */
export interface OutboundExceptionOptions {
  message?: string;
  service?: string;
  details?: Record<string, unknown>;
  requestId?: string;
  customLogger?: Logger;
}

/**
 * Options for timeout exceptions.
 */
export interface TimeoutExceptionOptions extends OutboundExceptionOptions {
  timeoutMs?: number;
}

/**
 * Exception for connection establishment timeout.
 *
 * HTTP Status: 503 Service Unavailable
 * Default Code: NETWORK_CONNECT_TIMEOUT
 */
export class ConnectTimeoutException extends BaseHttpException {
  public readonly service?: string;
  public readonly timeoutMs?: number;

  constructor(options: TimeoutExceptionOptions = {}) {
    const details: Record<string, unknown> = { ...options.details };
    if (options.service) details.service = options.service;
    if (options.timeoutMs !== undefined) details.timeoutMs = options.timeoutMs;

    let message = options.message ?? 'Connection timeout';
    if (options.service && !message.toLowerCase().includes('service')) {
      message = `Connection to '${options.service}' timed out`;
      if (options.timeoutMs) message += ` after ${options.timeoutMs}ms`;
    }

    super({
      code: ErrorCode.NETWORK_CONNECT_TIMEOUT,
      message,
      status: 503,
      details: Object.keys(details).length > 0 ? details : undefined,
      requestId: options.requestId,
      customLogger: options.customLogger,
    });

    this.service = options.service;
    this.timeoutMs = options.timeoutMs;
  }
}

/**
 * Exception for response read timeout.
 *
 * HTTP Status: 504 Gateway Timeout
 * Default Code: NETWORK_READ_TIMEOUT
 */
export class ReadTimeoutException extends BaseHttpException {
  public readonly service?: string;
  public readonly timeoutMs?: number;

  constructor(options: TimeoutExceptionOptions = {}) {
    const details: Record<string, unknown> = { ...options.details };
    if (options.service) details.service = options.service;
    if (options.timeoutMs !== undefined) details.timeoutMs = options.timeoutMs;

    let message = options.message ?? 'Read timeout';
    if (options.service && !message.toLowerCase().includes('service')) {
      message = `Read timeout from '${options.service}'`;
      if (options.timeoutMs) message += ` after ${options.timeoutMs}ms`;
    }

    super({
      code: ErrorCode.NETWORK_READ_TIMEOUT,
      message,
      status: 504,
      details: Object.keys(details).length > 0 ? details : undefined,
      requestId: options.requestId,
      customLogger: options.customLogger,
    });

    this.service = options.service;
    this.timeoutMs = options.timeoutMs;
  }
}

/**
 * Exception for request write timeout.
 *
 * HTTP Status: 504 Gateway Timeout
 * Default Code: NETWORK_WRITE_TIMEOUT
 */
export class WriteTimeoutException extends BaseHttpException {
  public readonly service?: string;
  public readonly timeoutMs?: number;

  constructor(options: TimeoutExceptionOptions = {}) {
    const details: Record<string, unknown> = { ...options.details };
    if (options.service) details.service = options.service;
    if (options.timeoutMs !== undefined) details.timeoutMs = options.timeoutMs;

    super({
      code: ErrorCode.NETWORK_WRITE_TIMEOUT,
      message: options.message ?? 'Write timeout',
      status: 504,
      details: Object.keys(details).length > 0 ? details : undefined,
      requestId: options.requestId,
      customLogger: options.customLogger,
    });

    this.service = options.service;
    this.timeoutMs = options.timeoutMs;
  }
}

/**
 * Options for NetworkException.
 */
export interface NetworkExceptionOptions extends OutboundExceptionOptions {
  originalError?: string;
  code?: ErrorCode;
}

/**
 * Exception for general network failures.
 *
 * HTTP Status: 503 Service Unavailable
 * Default Code: NETWORK_ERROR
 */
export class NetworkException extends BaseHttpException {
  public readonly service?: string;
  public readonly originalError?: string;

  constructor(options: NetworkExceptionOptions = {}) {
    const details: Record<string, unknown> = { ...options.details };
    if (options.service) details.service = options.service;
    if (options.originalError) details.originalError = options.originalError;

    super({
      code: options.code ?? ErrorCode.NETWORK_ERROR,
      message: options.message ?? 'Network error',
      status: 503,
      details: Object.keys(details).length > 0 ? details : undefined,
      requestId: options.requestId,
      customLogger: options.customLogger,
    });

    this.service = options.service;
    this.originalError = options.originalError;
  }
}

/**
 * Options for UpstreamServiceException.
 */
export interface UpstreamServiceExceptionOptions extends OutboundExceptionOptions {
  operation?: string;
  upstreamStatus?: number;
}

/**
 * Exception for upstream service returning error status.
 *
 * HTTP Status: 502 Bad Gateway
 * Default Code: UPSTREAM_SERVICE_ERROR
 */
export class UpstreamServiceException extends BaseHttpException {
  public readonly service?: string;
  public readonly operation?: string;
  public readonly upstreamStatus?: number;

  constructor(options: UpstreamServiceExceptionOptions = {}) {
    const details: Record<string, unknown> = { ...options.details };
    if (options.service) details.service = options.service;
    if (options.operation) details.operation = options.operation;
    if (options.upstreamStatus !== undefined) details.upstreamStatus = options.upstreamStatus;

    let message = options.message ?? 'Upstream service error';
    if (options.service && !message.toLowerCase().includes('service')) {
      message = `Upstream service '${options.service}' returned error`;
      if (options.upstreamStatus) message += ` (${options.upstreamStatus})`;
    }

    super({
      code: ErrorCode.UPSTREAM_SERVICE_ERROR,
      message,
      status: 502,
      details: Object.keys(details).length > 0 ? details : undefined,
      requestId: options.requestId,
      customLogger: options.customLogger,
    });

    this.service = options.service;
    this.operation = options.operation;
    this.upstreamStatus = options.upstreamStatus;
  }
}

/**
 * Options for UpstreamTimeoutException.
 */
export interface UpstreamTimeoutExceptionOptions extends OutboundExceptionOptions {
  operation?: string;
  timeoutMs?: number;
}

/**
 * Exception for upstream service timeout (catch-all).
 *
 * HTTP Status: 504 Gateway Timeout
 * Default Code: UPSTREAM_TIMEOUT
 */
export class UpstreamTimeoutException extends BaseHttpException {
  public readonly service?: string;
  public readonly operation?: string;
  public readonly timeoutMs?: number;

  constructor(options: UpstreamTimeoutExceptionOptions = {}) {
    const details: Record<string, unknown> = { ...options.details };
    if (options.service) details.service = options.service;
    if (options.operation) details.operation = options.operation;
    if (options.timeoutMs !== undefined) details.timeoutMs = options.timeoutMs;

    let message = options.message ?? 'Upstream service timeout';
    if (options.service && !message.toLowerCase().includes('service')) {
      message = `Upstream service '${options.service}' timed out`;
      if (options.operation) {
        message = `Upstream service '${options.service}' timed out during '${options.operation}'`;
      }
      if (options.timeoutMs) message += ` after ${options.timeoutMs}ms`;
    }

    super({
      code: ErrorCode.UPSTREAM_TIMEOUT,
      message,
      status: 504,
      details: Object.keys(details).length > 0 ? details : undefined,
      requestId: options.requestId,
      customLogger: options.customLogger,
    });

    this.service = options.service;
    this.operation = options.operation;
    this.timeoutMs = options.timeoutMs;
  }
}

logger.debug('Outbound exception classes initialized');
