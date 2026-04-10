/**
 * Standardized error codes for common-exceptions.
 *
 * Provides ErrorCode enum with 22 standardized codes across categories:
 * - Authentication & Authorization (AUTH_*, AUTHZ_*)
 * - Request Errors (BAD_REQUEST, NOT_FOUND, etc.)
 * - Network Errors (NETWORK_*)
 * - Upstream Errors (UPSTREAM_*)
 * - Internal Errors (INTERNAL_*, SERVICE_*, BAD_GATEWAY)
 */

import { create } from './logger.js';

const logger = create('common-exceptions', __filename);

/**
 * Standardized error codes for cross-framework exception handling.
 *
 * All codes follow the pattern: CATEGORY_SPECIFIC_ERROR
 * Values are identical strings in Python and TypeScript for parity.
 */
export const ErrorCode = {
  // Authentication & Authorization
  AUTH_NOT_AUTHENTICATED: 'AUTH_NOT_AUTHENTICATED',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTHZ_FORBIDDEN: 'AUTHZ_FORBIDDEN',
  AUTHZ_INSUFFICIENT_SCOPE: 'AUTHZ_INSUFFICIENT_SCOPE',

  // Request Errors
  BAD_REQUEST: 'BAD_REQUEST',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',

  // Network Errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  NETWORK_CONNECT_TIMEOUT: 'NETWORK_CONNECT_TIMEOUT',
  NETWORK_READ_TIMEOUT: 'NETWORK_READ_TIMEOUT',
  NETWORK_WRITE_TIMEOUT: 'NETWORK_WRITE_TIMEOUT',
  NETWORK_CONNECTION_REFUSED: 'NETWORK_CONNECTION_REFUSED',
  NETWORK_DNS_FAILURE: 'NETWORK_DNS_FAILURE',

  // Upstream Errors
  UPSTREAM_SERVICE_ERROR: 'UPSTREAM_SERVICE_ERROR',
  UPSTREAM_TIMEOUT: 'UPSTREAM_TIMEOUT',
  UPSTREAM_INVALID_RESPONSE: 'UPSTREAM_INVALID_RESPONSE',

  // Internal Errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  BAD_GATEWAY: 'BAD_GATEWAY',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/**
 * Error code to HTTP status mapping.
 */
const CODE_TO_STATUS: Record<ErrorCode, number> = {
  // Auth errors -> 401
  [ErrorCode.AUTH_NOT_AUTHENTICATED]: 401,
  [ErrorCode.AUTH_TOKEN_EXPIRED]: 401,
  [ErrorCode.AUTH_TOKEN_INVALID]: 401,
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 401,
  // Authz errors -> 403
  [ErrorCode.AUTHZ_FORBIDDEN]: 403,
  [ErrorCode.AUTHZ_INSUFFICIENT_SCOPE]: 403,
  // Request errors
  [ErrorCode.BAD_REQUEST]: 400,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.VALIDATION_FAILED]: 422,
  [ErrorCode.TOO_MANY_REQUESTS]: 429,
  // Network errors -> 503 (connect) or 504 (read/write)
  [ErrorCode.NETWORK_ERROR]: 503,
  [ErrorCode.NETWORK_CONNECT_TIMEOUT]: 503,
  [ErrorCode.NETWORK_READ_TIMEOUT]: 504,
  [ErrorCode.NETWORK_WRITE_TIMEOUT]: 504,
  [ErrorCode.NETWORK_CONNECTION_REFUSED]: 503,
  [ErrorCode.NETWORK_DNS_FAILURE]: 503,
  // Upstream errors
  [ErrorCode.UPSTREAM_SERVICE_ERROR]: 502,
  [ErrorCode.UPSTREAM_TIMEOUT]: 504,
  [ErrorCode.UPSTREAM_INVALID_RESPONSE]: 502,
  // Internal errors
  [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.BAD_GATEWAY]: 502,
};

/**
 * Get the HTTP status code for a given error code.
 *
 * @param code - ErrorCode value
 * @returns HTTP status code (400-599)
 *
 * @example
 * const status = getStatusForCode(ErrorCode.NOT_FOUND); // Returns 404
 */
export function getStatusForCode(code: ErrorCode): number {
  const status = CODE_TO_STATUS[code] ?? 500;
  logger.debug(`Mapped ${code} to HTTP ${status}`);
  return status;
}

/**
 * Get the category of an error code.
 *
 * @param code - ErrorCode value
 * @returns Category string (auth, authz, request, network, upstream, internal)
 */
export function getCodeCategory(code: ErrorCode): string {
  if (code.startsWith('AUTH_')) return 'auth';
  if (code.startsWith('AUTHZ_')) return 'authz';
  if (code.startsWith('NETWORK_')) return 'network';
  if (code.startsWith('UPSTREAM_')) return 'upstream';
  if (
    code === ErrorCode.INTERNAL_SERVER_ERROR ||
    code === ErrorCode.SERVICE_UNAVAILABLE ||
    code === ErrorCode.BAD_GATEWAY
  ) {
    return 'internal';
  }
  return 'request';
}

/**
 * Check if a string is a valid ErrorCode.
 */
export function isValidErrorCode(code: string): code is ErrorCode {
  return Object.values(ErrorCode).includes(code as ErrorCode);
}

logger.debug(`ErrorCode enum initialized with ${Object.keys(ErrorCode).length} codes`);
