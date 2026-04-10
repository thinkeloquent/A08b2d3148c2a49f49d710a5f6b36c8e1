/**
 * Errors Module — Sauce Labs API Client
 *
 * Typed error hierarchy for Sauce Labs REST API responses.
 * All errors extend SaucelabsError and include statusCode, responseBody,
 * headers, endpoint, method, and a timestamp.
 */

import { create } from './logger.mjs';

const log = create('saucelabs-api', import.meta.url);

/**
 * Base error class for all Sauce Labs API errors.
 * @extends Error
 */
export class SaucelabsError extends Error {
  constructor(message, { statusCode = 0, responseBody = null, headers = {}, endpoint = '', method = '' } = {}) {
    super(message);
    this.name = 'SaucelabsError';
    this.statusCode = statusCode;
    this.responseBody = responseBody;
    this.headers = headers;
    this.endpoint = endpoint;
    this.method = method;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      error: true,
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      endpoint: this.endpoint,
      method: this.method,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Thrown on HTTP 401 — missing or invalid credentials.
 * @extends SaucelabsError
 */
export class SaucelabsAuthError extends SaucelabsError {
  constructor(message = 'Authentication failed — check SAUCE_USERNAME and SAUCE_ACCESS_KEY', options = {}) {
    super(message, { statusCode: 401, ...options });
    this.name = 'SaucelabsAuthError';
  }
}

/**
 * Thrown on HTTP 404 — resource not found.
 * @extends SaucelabsError
 */
export class SaucelabsNotFoundError extends SaucelabsError {
  constructor(message = 'Resource not found', options = {}) {
    super(message, { statusCode: 404, ...options });
    this.name = 'SaucelabsNotFoundError';
  }
}

/**
 * Thrown on HTTP 429 — rate limit exceeded.
 * @extends SaucelabsError
 */
export class SaucelabsRateLimitError extends SaucelabsError {
  constructor(message = 'Rate limit exceeded', { retryAfter = 60, ...options } = {}) {
    super(message, { statusCode: 429, ...options });
    this.name = 'SaucelabsRateLimitError';
    this.retryAfter = retryAfter;
  }

  toJSON() {
    return { ...super.toJSON(), retryAfter: this.retryAfter };
  }
}

/**
 * Thrown on HTTP 400 or 422 — invalid request.
 * @extends SaucelabsError
 */
export class SaucelabsValidationError extends SaucelabsError {
  constructor(message = 'Validation failed', { statusCode = 400, ...options } = {}) {
    super(message, { statusCode, ...options });
    this.name = 'SaucelabsValidationError';
  }
}

/**
 * Thrown on HTTP 5xx — server-side failure.
 * @extends SaucelabsError
 */
export class SaucelabsServerError extends SaucelabsError {
  constructor(message = 'Sauce Labs server error — check https://status.saucelabs.com', { statusCode = 500, ...options } = {}) {
    super(message, { statusCode, ...options });
    this.name = 'SaucelabsServerError';
  }
}

/**
 * Thrown when required configuration is missing.
 * @extends SaucelabsError
 */
export class SaucelabsConfigError extends SaucelabsError {
  constructor(message = 'Missing required configuration', options = {}) {
    super(message, { statusCode: 0, ...options });
    this.name = 'SaucelabsConfigError';
  }
}

/**
 * Map an HTTP status code to the appropriate SaucelabsError subclass.
 *
 * @param {number} statusCode
 * @param {*} body - Parsed response body
 * @param {object} [headers={}]
 * @returns {SaucelabsError}
 */
export function createErrorFromResponse(statusCode, body, headers = {}) {
  const message =
    (body && typeof body === 'object' ? body.message || body.error : String(body)) ||
    `Sauce Labs API error: HTTP ${statusCode}`;

  const opts = { responseBody: body, headers };

  switch (statusCode) {
    case 401:
      return new SaucelabsAuthError(message, opts);
    case 404:
      return new SaucelabsNotFoundError(message, opts);
    case 429: {
      const retryAfterRaw = headers['retry-after'] ?? headers['Retry-After'];
      const retryAfter = retryAfterRaw ? parseFloat(retryAfterRaw) : 60;
      return new SaucelabsRateLimitError(message, { retryAfter, ...opts });
    }
    case 400:
    case 422:
      return new SaucelabsValidationError(message, { statusCode, ...opts });
    default:
      if (statusCode >= 500) {
        return new SaucelabsServerError(message, { statusCode, ...opts });
      }
      return new SaucelabsError(message, { statusCode, ...opts });
  }
}
