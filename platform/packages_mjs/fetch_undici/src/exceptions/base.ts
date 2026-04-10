/**
 * Base exception classes for fetch-undici
 *
 * Provides httpx-compatible exception hierarchy for consistent error handling.
 */

import type { Request } from '../models/request.js'

/**
 * Base class for all HTTP-related errors
 *
 * @example
 * ```typescript
 * try {
 *   await client.get('/users')
 * } catch (err) {
 *   if (err instanceof HTTPError) {
 *     console.log('HTTP error:', err.message)
 *     console.log('Request:', err.request?.url)
 *   }
 * }
 * ```
 */
export class HTTPError extends Error {
  /** The request that caused this error (if available) */
  readonly request?: Request

  constructor(message: string, request?: Request, options?: ErrorOptions) {
    super(message, options)
    this.name = 'HTTPError'
    this.request = request

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, new.target.prototype)

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

/**
 * Error during request preparation or sending
 *
 * Base class for errors that occur before a response is received.
 */
export class RequestError extends HTTPError {
  constructor(message: string, request?: Request, options?: ErrorOptions) {
    super(message, request, options)
    this.name = 'RequestError'
  }
}

/**
 * Error indicating invalid URL
 */
export class InvalidURLError extends RequestError {
  readonly url: string

  constructor(url: string, request?: Request, options?: ErrorOptions) {
    super(`Invalid URL: ${url}`, request, options)
    this.name = 'InvalidURLError'
    this.url = url
  }
}

/**
 * Error indicating conflicting request options
 */
export class RequestOptionsError extends RequestError {
  constructor(message: string, request?: Request, options?: ErrorOptions) {
    super(message, request, options)
    this.name = 'RequestOptionsError'
  }
}
