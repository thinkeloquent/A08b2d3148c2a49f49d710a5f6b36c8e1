/**
 * Exception factory for SDK usage.
 *
 * Provides factory functions to create exceptions programmatically.
 */

import { BaseHttpException } from '../base.js';
import { ErrorCode, isValidErrorCode } from '../codes.js';
import {
  BadRequestException,
  ConflictException,
  NotAuthenticatedException,
  NotAuthorizedException,
  NotFoundException,
  TooManyRequestsException,
  ValidationException,
} from '../inbound.js';
import {
  ConnectTimeoutException,
  NetworkException,
  ReadTimeoutException,
  UpstreamServiceException,
  UpstreamTimeoutException,
  WriteTimeoutException,
} from '../outbound.js';
import { BadGatewayException, InternalServerException, ServiceUnavailableException } from '../internal.js';
import { create } from '../logger.js';
import { ErrorResponse } from '../response.js';

const logger = create('common-exceptions', __filename);

type ExceptionClass = new (options: any) => BaseHttpException;

/**
 * Map error codes to exception classes.
 */
const CODE_TO_EXCEPTION: Record<ErrorCode, ExceptionClass> = {
  // Auth
  [ErrorCode.AUTH_NOT_AUTHENTICATED]: NotAuthenticatedException,
  [ErrorCode.AUTH_TOKEN_EXPIRED]: NotAuthenticatedException,
  [ErrorCode.AUTH_TOKEN_INVALID]: NotAuthenticatedException,
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: NotAuthenticatedException,
  // Authz
  [ErrorCode.AUTHZ_FORBIDDEN]: NotAuthorizedException,
  [ErrorCode.AUTHZ_INSUFFICIENT_SCOPE]: NotAuthorizedException,
  // Request
  [ErrorCode.BAD_REQUEST]: BadRequestException,
  [ErrorCode.NOT_FOUND]: NotFoundException,
  [ErrorCode.CONFLICT]: ConflictException,
  [ErrorCode.VALIDATION_FAILED]: ValidationException,
  [ErrorCode.TOO_MANY_REQUESTS]: TooManyRequestsException,
  // Network
  [ErrorCode.NETWORK_ERROR]: NetworkException,
  [ErrorCode.NETWORK_CONNECT_TIMEOUT]: ConnectTimeoutException,
  [ErrorCode.NETWORK_READ_TIMEOUT]: ReadTimeoutException,
  [ErrorCode.NETWORK_WRITE_TIMEOUT]: WriteTimeoutException,
  [ErrorCode.NETWORK_CONNECTION_REFUSED]: NetworkException,
  [ErrorCode.NETWORK_DNS_FAILURE]: NetworkException,
  // Upstream
  [ErrorCode.UPSTREAM_SERVICE_ERROR]: UpstreamServiceException,
  [ErrorCode.UPSTREAM_TIMEOUT]: UpstreamTimeoutException,
  [ErrorCode.UPSTREAM_INVALID_RESPONSE]: BadGatewayException,
  // Internal
  [ErrorCode.INTERNAL_SERVER_ERROR]: InternalServerException,
  [ErrorCode.SERVICE_UNAVAILABLE]: ServiceUnavailableException,
  [ErrorCode.BAD_GATEWAY]: BadGatewayException,
};

/**
 * Create an exception instance from code and message.
 *
 * Factory function for programmatic exception creation.
 *
 * @param code - ErrorCode or string code
 * @param message - Error message
 * @param details - Optional additional context
 * @param requestId - Optional correlation ID
 * @returns Appropriate exception subclass instance
 *
 * @example
 * const exc = createException('NOT_FOUND', 'User not found', { userId: '123' });
 */
export function createException(
  code: ErrorCode | string,
  message: string,
  details?: Record<string, unknown>,
  requestId?: string
): BaseHttpException {
  // Normalize code to ErrorCode
  const errorCode = isValidErrorCode(code) ? code : ErrorCode.INTERNAL_SERVER_ERROR;

  if (!isValidErrorCode(code)) {
    logger.warn(`Unknown error code: ${code}, using INTERNAL_SERVER_ERROR`);
  }

  // Get exception class
  const ExcClass = CODE_TO_EXCEPTION[errorCode] ?? BaseHttpException;

  logger.debug(`Creating exception: ${errorCode} -> ${ExcClass.name}`);

  // Handle special cases with extra fields
  if (ExcClass === ValidationException && details?.errors) {
    return new ValidationException({ message, details, requestId });
  }

  if (ExcClass === ConnectTimeoutException || ExcClass === ReadTimeoutException || ExcClass === WriteTimeoutException) {
    return new ExcClass({
      message,
      service: details?.service as string,
      timeoutMs: details?.timeoutMs as number,
      details,
      requestId,
    });
  }

  if (ExcClass === UpstreamServiceException) {
    return new UpstreamServiceException({
      message,
      service: details?.service as string,
      upstreamStatus: details?.upstreamStatus as number,
      details,
      requestId,
    });
  }

  if (ExcClass === NetworkException) {
    return new NetworkException({
      message,
      service: details?.service as string,
      originalError: details?.originalError as string,
      code: errorCode,
      details,
      requestId,
    });
  }

  // Default construction
  return new ExcClass({ message, details, requestId });
}

/**
 * Parse an error response JSON and reconstruct the exception.
 *
 * Useful for client-side error handling.
 *
 * @param jsonData - Error response object {"error": {...}}
 * @returns Reconstructed exception instance
 *
 * @example
 * const response = await fetch('/users/123');
 * if (!response.ok) {
 *   const exc = parseErrorResponse(await response.json());
 *   throw exc;
 * }
 */
export function parseErrorResponse(jsonData: ErrorResponse | Record<string, unknown>): BaseHttpException {
  const error = (jsonData as ErrorResponse).error ?? jsonData;

  const code = (error as any).code ?? 'INTERNAL_SERVER_ERROR';
  const message = (error as any).message ?? 'Unknown error';
  const details = (error as any).details;
  const requestId = (error as any).requestId;

  logger.debug(`Parsing error response: ${code}`);

  return createException(code, message, details, requestId);
}

/**
 * Check if an error is a common exception.
 *
 * Type guard for exception handling.
 *
 * @param error - Error to check
 * @returns True if error is a BaseHttpException or subclass
 */
export function isCommonException(error: unknown): error is BaseHttpException {
  return error instanceof BaseHttpException;
}

logger.debug('SDK factory initialized');
