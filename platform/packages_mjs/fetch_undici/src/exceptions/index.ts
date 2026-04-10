/**
 * Exception exports for fetch-undici
 *
 * Provides httpx-compatible exception hierarchy and error mapping utilities.
 */

import type { Request } from '../models/request.js'

// Re-export all exception classes
export {
  HTTPError,
  RequestError,
  InvalidURLError,
  RequestOptionsError
} from './base.js'

export {
  TransportError,
  TimeoutError,
  ConnectTimeoutError,
  ReadTimeoutError,
  WriteTimeoutError,
  PoolTimeoutError,
  NetworkError,
  ConnectError,
  SocketError,
  DNSError,
  TLSError,
  ProxyError
} from './transport.js'

export { HTTPStatusError, TooManyRedirectsError } from './status.js'

export { StreamError, StreamConsumedError, StreamClosedError, StreamDecodeError } from './stream.js'

// Import for internal use
import { HTTPError, RequestError } from './base.js'
import {
  TransportError,
  TimeoutError,
  ConnectTimeoutError,
  ReadTimeoutError,
  NetworkError,
  ConnectError,
  SocketError,
  DNSError,
  TLSError
} from './transport.js'

/**
 * Map Undici errors to fetch-undici exception hierarchy
 *
 * @param error - The original error from Undici
 * @param request - The request that caused the error (if available)
 * @returns Mapped fetch-undici exception
 */
export function mapUndiciError(error: unknown, request?: Request): HTTPError {
  if (error instanceof HTTPError) {
    return error
  }

  if (!(error instanceof Error)) {
    return new HTTPError(String(error), request)
  }

  const err = error as Error & { code?: string; hostname?: string }
  const code = err.code
  const message = err.message

  // Timeout errors
  if (
    err.name === 'HeadersTimeoutError' ||
    message.includes('Headers Timeout') ||
    code === 'UND_ERR_HEADERS_TIMEOUT'
  ) {
    return new ReadTimeoutError(undefined, request, { cause: error })
  }

  if (
    err.name === 'BodyTimeoutError' ||
    message.includes('Body Timeout') ||
    code === 'UND_ERR_BODY_TIMEOUT'
  ) {
    return new ReadTimeoutError(undefined, request, { cause: error })
  }

  if (
    err.name === 'ConnectTimeoutError' ||
    message.includes('Connect Timeout') ||
    code === 'UND_ERR_CONNECT_TIMEOUT'
  ) {
    return new ConnectTimeoutError(undefined, request, { cause: error })
  }

  if (code === 'ETIMEDOUT' || code === 'ESOCKETTIMEDOUT') {
    return new TimeoutError(message, undefined, request, { cause: error })
  }

  // Connection errors
  if (code === 'ECONNREFUSED') {
    return new ConnectError(
      `Connection refused: ${message}`,
      undefined,
      undefined,
      code,
      request,
      { cause: error }
    )
  }

  if (code === 'ECONNRESET') {
    return new SocketError(`Connection reset: ${message}`, code, request, { cause: error })
  }

  if (code === 'EPIPE' || code === 'ECONNABORTED') {
    return new SocketError(message, code, request, { cause: error })
  }

  if (code === 'ENOTFOUND' || code === 'EAI_AGAIN') {
    const hostname = err.hostname ?? 'unknown'
    return new DNSError(hostname, code, request, { cause: error })
  }

  if (code === 'EHOSTUNREACH' || code === 'ENETUNREACH') {
    return new NetworkError(`Host unreachable: ${message}`, code, request, { cause: error })
  }

  // TLS errors
  if (
    code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
    code === 'CERT_HAS_EXPIRED' ||
    code === 'DEPTH_ZERO_SELF_SIGNED_CERT' ||
    code === 'SELF_SIGNED_CERT_IN_CHAIN' ||
    code === 'ERR_TLS_CERT_ALTNAME_INVALID' ||
    message.includes('certificate') ||
    message.includes('SSL') ||
    message.includes('TLS')
  ) {
    return new TLSError(message, request, { cause: error })
  }

  // Socket errors
  if (err.name === 'SocketError' || code?.startsWith('UND_ERR_SOCKET')) {
    return new SocketError(message, code, request, { cause: error })
  }

  // Generic Undici errors
  if (code?.startsWith('UND_ERR_')) {
    return new TransportError(message, request, { cause: error })
  }

  // Request preparation errors
  if (err.name === 'TypeError' || err.name === 'InvalidArgumentError') {
    return new RequestError(message, request, { cause: error })
  }

  // Default to generic HTTPError
  return new HTTPError(message, request, { cause: error })
}

/**
 * Check if an error is a timeout error
 */
export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof TimeoutError
}

/**
 * Check if an error is a network error
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError
}

/**
 * Check if an error is a transport error
 */
export function isTransportError(error: unknown): error is TransportError {
  return error instanceof TransportError
}

/**
 * Check if an error is any HTTP error
 */
export function isHTTPError(error: unknown): error is HTTPError {
  return error instanceof HTTPError
}
