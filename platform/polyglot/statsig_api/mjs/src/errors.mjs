/**
 * Errors Module — Statsig Console API Client
 *
 * Typed error hierarchy for Statsig Console API responses.
 * All errors extend StatsigError and include statusCode, responseBody,
 * headers, and a timestamp for forensic debugging.
 *
 * Factory function `createErrorFromResponse` maps HTTP status codes
 * to the appropriate error subclass.
 */

/**
 * Base error class for all Statsig Console API errors.
 * Carries the HTTP status code, response body, headers, and a creation timestamp.
 *
 * @extends Error
 */
export class StatsigError extends Error {
  /**
   * @param {string} message - Human-readable error description
   * @param {object} [options={}]
   * @param {number} [options.statusCode=0] - HTTP status code from the response
   * @param {*} [options.responseBody=null] - Parsed response body (object or string)
   * @param {object} [options.headers={}] - Response headers
   */
  constructor(message, { statusCode = 0, responseBody = null, headers = {} } = {}) {
    super(message);
    /** @type {string} */
    this.name = 'StatsigError';
    /** @type {number} */
    this.statusCode = statusCode;
    /** @type {*} */
    this.responseBody = responseBody;
    /** @type {object} */
    this.headers = headers;
    /** @type {string} */
    this.timestamp = new Date().toISOString();
  }

  /**
   * Serialize the error to a plain object, suitable for logging or JSON responses.
   * @returns {object}
   */
  toJSON() {
    return {
      error: true,
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      responseBody: this.responseBody,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Thrown when the API returns HTTP 401 (Unauthorized).
 * Indicates the STATSIG-API-KEY is missing, invalid, or expired.
 *
 * @extends StatsigError
 */
export class AuthenticationError extends StatsigError {
  /**
   * @param {string} [message='Authentication failed'] - Error message
   * @param {object} [options={}]
   * @param {*} [options.responseBody=null] - Parsed response body
   * @param {object} [options.headers={}] - Response headers
   */
  constructor(message = 'Authentication failed', { responseBody = null, headers = {} } = {}) {
    super(message, { statusCode: 401, responseBody, headers });
    this.name = 'AuthenticationError';
  }
}

/**
 * Thrown when the API returns HTTP 404 (Not Found).
 * Indicates the requested resource (experiment, gate, etc.) does not exist.
 *
 * @extends StatsigError
 */
export class NotFoundError extends StatsigError {
  /**
   * @param {string} [message='Resource not found'] - Error message
   * @param {object} [options={}]
   * @param {*} [options.responseBody=null] - Parsed response body
   * @param {object} [options.headers={}] - Response headers
   */
  constructor(message = 'Resource not found', { responseBody = null, headers = {} } = {}) {
    super(message, { statusCode: 404, responseBody, headers });
    this.name = 'NotFoundError';
  }
}

/**
 * Thrown when the API returns HTTP 429 (Too Many Requests).
 * Carries the parsed `retryAfter` value (in seconds) from the Retry-After header.
 *
 * @extends StatsigError
 */
export class RateLimitError extends StatsigError {
  /**
   * @param {string} [message='Rate limit exceeded'] - Error message
   * @param {object} [options={}]
   * @param {number} [options.retryAfter=60] - Seconds to wait before retrying
   * @param {*} [options.responseBody=null] - Parsed response body
   * @param {object} [options.headers={}] - Response headers
   */
  constructor(message = 'Rate limit exceeded', { retryAfter = 60, responseBody = null, headers = {} } = {}) {
    super(message, { statusCode: 429, responseBody, headers });
    this.name = 'RateLimitError';
    /** @type {number} Seconds to wait before retrying */
    this.retryAfter = retryAfter;
  }

  /** @override */
  toJSON() {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter,
    };
  }
}

/**
 * Thrown when the API returns HTTP 400 or 422 (Bad Request / Unprocessable Entity).
 * Indicates invalid request parameters, missing required fields, or schema violations.
 *
 * @extends StatsigError
 */
export class ValidationError extends StatsigError {
  /**
   * @param {string} [message='Validation failed'] - Error message
   * @param {object} [options={}]
   * @param {number} [options.statusCode=400] - HTTP status code (400 or 422)
   * @param {*} [options.responseBody=null] - Parsed response body
   * @param {object} [options.headers={}] - Response headers
   */
  constructor(message = 'Validation failed', { statusCode = 400, responseBody = null, headers = {} } = {}) {
    super(message, { statusCode, responseBody, headers });
    this.name = 'ValidationError';
  }
}

/**
 * Thrown when the API returns an HTTP 5xx status code.
 * Indicates a server-side failure in the Statsig Console API.
 *
 * @extends StatsigError
 */
export class ServerError extends StatsigError {
  /**
   * @param {string} [message='Server error'] - Error message
   * @param {object} [options={}]
   * @param {number} [options.statusCode=500] - HTTP status code (500-599)
   * @param {*} [options.responseBody=null] - Parsed response body
   * @param {object} [options.headers={}] - Response headers
   */
  constructor(message = 'Server error', { statusCode = 500, responseBody = null, headers = {} } = {}) {
    super(message, { statusCode, responseBody, headers });
    this.name = 'ServerError';
  }
}

/**
 * Map an HTTP response status code to the appropriate typed error.
 *
 * @param {number} statusCode - HTTP status code
 * @param {*} body - Parsed response body
 * @param {object} [headers={}] - Response headers (plain object, lowercase keys)
 * @returns {StatsigError} The appropriate error subclass instance
 *
 * @example
 * const error = createErrorFromResponse(429, { message: 'Too many requests' }, { 'retry-after': '30' });
 * // error instanceof RateLimitError === true
 * // error.retryAfter === 30
 */
export function createErrorFromResponse(statusCode, body, headers = {}) {
  const message =
    (body && typeof body === 'object' ? body.message || body.error : String(body)) ||
    `Statsig API error: HTTP ${statusCode}`;

  const opts = { responseBody: body, headers };

  switch (statusCode) {
    case 401:
      return new AuthenticationError(message, opts);

    case 404:
      return new NotFoundError(message, opts);

    case 429: {
      const retryAfterRaw = headers['retry-after'] ?? headers['Retry-After'];
      const retryAfter = retryAfterRaw ? parseFloat(retryAfterRaw) : 60;
      return new RateLimitError(message, { retryAfter, ...opts });
    }

    case 400:
    case 422:
      return new ValidationError(message, { statusCode, ...opts });

    default:
      if (statusCode >= 500) {
        return new ServerError(message, { statusCode, ...opts });
      }
      return new StatsigError(message, { statusCode, ...opts });
  }
}
