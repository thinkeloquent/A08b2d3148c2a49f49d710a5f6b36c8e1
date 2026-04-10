/**
 * Undici error wrappers for common-exceptions.
 *
 * Provides utilities to wrap Undici/fetch exceptions.
 */

import { BaseHttpException } from '../base.js';
import { ErrorCode } from '../codes.js';
import { BadRequestException } from '../inbound.js';
import { InternalServerException, ServiceUnavailableException } from '../internal.js';
import {
  ConnectTimeoutException,
  NetworkException,
  ReadTimeoutException,
  UpstreamServiceException,
} from '../outbound.js';
import { create } from '../logger.js';

const logger = create('common-exceptions', __filename);

/**
 * Options for wrapUndiciErrors.
 */
export interface WrapUndiciErrorsOptions {
  service?: string;
  operation?: string;
}

/**
 * Extract service name from URL.
 */
export function extractServiceFromUrl(url: string | URL): string {
  try {
    const urlObj = typeof url === 'string' ? new URL(url) : url;
    return urlObj.hostname || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Check if error is an Undici-specific error.
 */
function isUndiciError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const undiciErrorNames = [
    'UndiciError',
    'ConnectTimeoutError',
    'HeadersTimeoutError',
    'BodyTimeoutError',
    'SocketError',
    'RequestAbortedError',
    'InvalidArgumentError',
    'ClientClosedError',
    'ClientDestroyedError',
    'ResponseError',
  ];

  return undiciErrorNames.includes(error.name) || error.name.includes('Undici');
}

/**
 * Convert an Undici error to a common exception.
 *
 * @param error - Undici error or any error
 * @param service - Optional service name override
 * @param operation - Optional operation name
 * @returns Appropriate BaseHttpException subclass
 */
export function undiciErrorToException(
  error: Error,
  service?: string,
  _operation?: string
): BaseHttpException {
  const errorName = error.name;
  const errorMessage = error.message;

  logger.debug(`Converting Undici error: ${errorName}`);

  // Map Undici error types to common exceptions
  switch (errorName) {
    case 'ConnectTimeoutError':
      return new ConnectTimeoutException({ service });

    case 'HeadersTimeoutError':
    case 'BodyTimeoutError':
      return new ReadTimeoutException({ service });

    case 'SocketError':
      return new NetworkException({
        service,
        originalError: errorMessage,
      });

    case 'RequestAbortedError':
      return new NetworkException({
        message: 'Request was aborted',
        service,
        originalError: errorName,
        code: ErrorCode.NETWORK_ERROR,
      });

    case 'InvalidArgumentError':
      return new BadRequestException({
        message: `Invalid argument: ${errorMessage}`,
      });

    case 'ClientClosedError':
    case 'ClientDestroyedError':
      return new ServiceUnavailableException({
        message: 'HTTP client is closed',
      });

    default:
      // Check for common Node.js network errors
      if (errorMessage.includes('ECONNREFUSED')) {
        return new NetworkException({
          message: 'Connection refused',
          service,
          originalError: errorMessage,
          code: ErrorCode.NETWORK_CONNECTION_REFUSED,
        });
      }

      if (errorMessage.includes('ECONNRESET')) {
        return new NetworkException({
          message: 'Connection reset',
          service,
          originalError: errorMessage,
        });
      }

      if (errorMessage.includes('ENOTFOUND')) {
        return new NetworkException({
          message: 'DNS lookup failed',
          service,
          originalError: errorMessage,
          code: ErrorCode.NETWORK_DNS_FAILURE,
        });
      }

      if (errorMessage.includes('ETIMEDOUT')) {
        return new ConnectTimeoutException({ service });
      }

      // Generic network error for other cases
      return new NetworkException({
        message: errorMessage,
        service,
        originalError: errorName,
      });
  }
}

/**
 * Check upstream response status and throw if error.
 *
 * Undici/fetch doesn't auto-throw on 4xx/5xx, so this utility
 * checks the status and throws an UpstreamServiceException if needed.
 *
 * @param response - Fetch Response object
 * @param service - Service name for error context
 * @param operation - Optional operation name
 * @throws UpstreamServiceException if status >= 400
 */
export function checkUpstreamStatus(
  response: Response,
  service: string,
  operation?: string
): void {
  if (response.ok) return;

  logger.debug(`Upstream ${service} returned ${response.status}`);

  throw new UpstreamServiceException({
    service,
    operation,
    upstreamStatus: response.status,
  });
}

/**
 * Higher-order function to wrap async functions with Undici error handling.
 *
 * @param fn - Async function to wrap
 * @param options - Service and operation context
 * @returns Wrapped function that converts Undici errors
 *
 * @example
 * const fetchUser = wrapUndiciErrors(
 *   async (userId: string) => {
 *     const response = await fetch(`/users/${userId}`);
 *     checkUpstreamStatus(response, 'user-service');
 *     return response.json();
 *   },
 *   { service: 'user-service', operation: 'fetchUser' }
 * );
 */
export function wrapUndiciErrors<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: WrapUndiciErrorsOptions = {}
): T {
  const { service, operation } = options;

  const wrapped = async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof BaseHttpException) {
        // Already a common exception, rethrow
        throw error;
      }

      if (error instanceof Error) {
        logger.debug(`Caught error in wrapped function: ${error.name}`);

        if (isUndiciError(error) || error.name === 'TypeError') {
          throw undiciErrorToException(error, service, operation);
        }

        // For other errors, wrap as network exception
        throw new NetworkException({
          message: error.message,
          service,
          originalError: error.name,
        });
      }

      // Unknown error type
      throw new InternalServerException({
        message: String(error),
      });
    }
  };

  return wrapped as T;
}

logger.debug('Undici wrappers initialized');
