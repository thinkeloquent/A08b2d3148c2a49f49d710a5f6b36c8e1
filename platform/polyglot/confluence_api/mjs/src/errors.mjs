/**
 * @module errors
 * @description Structured error hierarchy for the Confluence Data Center REST API client.
 *
 * Maps HTTP status codes and failure modes to specific error subclasses, enabling
 * precise error handling in consuming code. Every error carries machine-readable
 * metadata (code, status, url, method, responseData) and serializes cleanly to JSON.
 *
 * Confluence-specific statuses handled:
 * - 400 — Validation / bad request
 * - 401 — Authentication failure
 * - 403 — Permission denied
 * - 404 — Resource not found
 * - 409 — Conflict (version mismatch, concurrent edit)
 * - 429 — Rate limited (with Retry-After)
 * - 5xx — Server errors
 */

/**
 * Machine-readable error codes used across the error hierarchy.
 * @type {Readonly<Record<string, string>>}
 */
export const ErrorCode = Object.freeze({
  /** Network-level failure (DNS, connection refused, socket hang-up). */
  NETWORK: 'NETWORK',
  /** HTTP response error (non-2xx status). */
  RESPONSE: 'RESPONSE',
  /** Request exceeded the configured timeout. */
  TIMEOUT: 'TIMEOUT',
  /** Invalid or missing client configuration. */
  CONFIGURATION: 'CONFIGURATION',
  /** HTTP 429 — rate limit exceeded. */
  RATE_LIMIT: 'RATE_LIMIT',
});

/**
 * Base error class for all Confluence API errors.
 *
 * Carries structured metadata about the failure including the HTTP status,
 * response payload, request URL, and HTTP method. Subclasses provide
 * status-specific defaults and additional fields (e.g. retryAfter).
 *
 * @extends Error
 */
export class ConfluenceApiError extends Error {
  /** @type {string} Machine-readable error code from ErrorCode. */
  code;
  /** @type {number|undefined} HTTP status code, if applicable. */
  status;
  /** @type {unknown} Parsed response body from the server. */
  responseData;
  /** @type {string|undefined} Request URL that triggered the error. */
  url;
  /** @type {string|undefined} HTTP method of the failed request. */
  method;

  /**
   * @param {string} message - Human-readable error description.
   * @param {Object} [opts={}] - Error metadata options.
   * @param {string} [opts.code] - Machine-readable error code (defaults to RESPONSE).
   * @param {number} [opts.status] - HTTP status code.
   * @param {unknown} [opts.responseData] - Parsed response body.
   * @param {string} [opts.url] - Request URL.
   * @param {string} [opts.method] - HTTP method.
   * @param {unknown} [opts.cause] - Original error that caused this one.
   */
  constructor(message, opts = {}) {
    super(message, opts.cause ? { cause: opts.cause } : undefined);
    this.name = 'ConfluenceApiError';
    this.code = opts.code || ErrorCode.RESPONSE;
    this.status = opts.status;
    this.responseData = opts.responseData;
    this.url = opts.url;
    this.method = opts.method;
  }

  /**
   * Serialize the error to a plain JSON-safe object.
   * @returns {{ name: string, message: string, code: string, status: number|undefined, responseData: unknown, url: string|undefined, method: string|undefined }}
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      responseData: this.responseData,
      url: this.url,
      method: this.method,
    };
  }

  /**
   * Type guard: check if a value is a ConfluenceApiError instance.
   * @param {unknown} error
   * @returns {boolean}
   */
  static isConfluenceApiError(error) {
    return error instanceof ConfluenceApiError;
  }

  /**
   * Check if an error is a ConfluenceApiError with a specific HTTP status.
   * @param {unknown} error
   * @param {number} status
   * @returns {boolean}
   */
  static hasStatusCode(error, status) {
    return error instanceof ConfluenceApiError && error.status === status;
  }
}

/**
 * 401 — Authentication failed. Invalid credentials or expired API token.
 * @extends ConfluenceApiError
 */
export class ConfluenceAuthenticationError extends ConfluenceApiError {
  /**
   * @param {string} [message='Authentication failed']
   * @param {Object} [opts={}]
   */
  constructor(message = 'Authentication failed', opts = {}) {
    super(message, { ...opts, code: ErrorCode.RESPONSE, status: 401 });
    this.name = 'ConfluenceAuthenticationError';
  }
}

/**
 * 403 — Permission denied. The authenticated user lacks the required permissions.
 * @extends ConfluenceApiError
 */
export class ConfluencePermissionError extends ConfluenceApiError {
  /**
   * @param {string} [message='Permission denied']
   * @param {Object} [opts={}]
   */
  constructor(message = 'Permission denied', opts = {}) {
    super(message, { ...opts, code: ErrorCode.RESPONSE, status: 403 });
    this.name = 'ConfluencePermissionError';
  }
}

/**
 * 404 — Resource not found. The requested content, space, or entity does not exist.
 * @extends ConfluenceApiError
 */
export class ConfluenceNotFoundError extends ConfluenceApiError {
  /**
   * @param {string} [message='Resource not found']
   * @param {Object} [opts={}]
   */
  constructor(message = 'Resource not found', opts = {}) {
    super(message, { ...opts, code: ErrorCode.RESPONSE, status: 404 });
    this.name = 'ConfluenceNotFoundError';
  }
}

/**
 * 400 — Validation failed. The request body or parameters are invalid.
 * @extends ConfluenceApiError
 */
export class ConfluenceValidationError extends ConfluenceApiError {
  /**
   * @param {string} [message='Validation failed']
   * @param {Object} [opts={}]
   */
  constructor(message = 'Validation failed', opts = {}) {
    super(message, { ...opts, code: ErrorCode.RESPONSE, status: 400 });
    this.name = 'ConfluenceValidationError';
  }
}

/**
 * 409 — Conflict. Typically a version mismatch during content update, or a
 * concurrent edit conflict in Confluence.
 * @extends ConfluenceApiError
 */
export class ConfluenceConflictError extends ConfluenceApiError {
  /**
   * @param {string} [message='Conflict — version mismatch or concurrent edit']
   * @param {Object} [opts={}]
   */
  constructor(message = 'Conflict — version mismatch or concurrent edit', opts = {}) {
    super(message, { ...opts, code: ErrorCode.RESPONSE, status: 409 });
    this.name = 'ConfluenceConflictError';
  }
}

/**
 * 429 — Rate limited. Includes the server-specified retry delay when available.
 * @extends ConfluenceApiError
 */
export class ConfluenceRateLimitError extends ConfluenceApiError {
  /** @type {number|undefined} Seconds to wait before retrying, from Retry-After header. */
  retryAfter;

  /**
   * @param {string} [message='Rate limited']
   * @param {Object} [opts={}]
   * @param {number} [opts.retryAfter] - Seconds to wait before retrying.
   */
  constructor(message = 'Rate limited', opts = {}) {
    super(message, { ...opts, code: ErrorCode.RATE_LIMIT, status: 429 });
    this.name = 'ConfluenceRateLimitError';
    this.retryAfter = opts.retryAfter;
  }
}

/**
 * 5xx — Confluence server error. The status code is preserved from the response.
 * @extends ConfluenceApiError
 */
export class ConfluenceServerError extends ConfluenceApiError {
  /**
   * @param {string} [message='Confluence server error']
   * @param {Object} [opts={}]
   */
  constructor(message = 'Confluence server error', opts = {}) {
    super(message, { ...opts, code: ErrorCode.RESPONSE, status: opts.status || 500 });
    this.name = 'ConfluenceServerError';
  }
}

/**
 * Network-level failure — DNS resolution, connection refused, socket hang-up, etc.
 * No HTTP status code is available for these errors.
 * @extends ConfluenceApiError
 */
export class ConfluenceNetworkError extends ConfluenceApiError {
  /**
   * @param {string} [message='Network error']
   * @param {Object} [opts={}]
   */
  constructor(message = 'Network error', opts = {}) {
    super(message, { ...opts, code: ErrorCode.NETWORK });
    this.name = 'ConfluenceNetworkError';
  }
}

/**
 * Request timed out before a response was received.
 * @extends ConfluenceApiError
 */
export class ConfluenceTimeoutError extends ConfluenceApiError {
  /**
   * @param {string} [message='Request timed out']
   * @param {Object} [opts={}]
   */
  constructor(message = 'Request timed out', opts = {}) {
    super(message, { ...opts, code: ErrorCode.TIMEOUT });
    this.name = 'ConfluenceTimeoutError';
  }
}

/**
 * Configuration error — missing required parameters or invalid configuration values.
 * @extends ConfluenceApiError
 */
export class ConfluenceConfigurationError extends ConfluenceApiError {
  /**
   * @param {string} [message='Configuration error']
   * @param {Object} [opts={}]
   */
  constructor(message = 'Configuration error', opts = {}) {
    super(message, { ...opts, code: ErrorCode.CONFIGURATION });
    this.name = 'ConfluenceConfigurationError';
  }
}

/**
 * SDK-specific error for the REST proxy client or higher-level SDK wrapper.
 * @extends ConfluenceApiError
 */
export class SDKError extends ConfluenceApiError {
  /**
   * @param {string} [message='SDK error']
   * @param {Object} [opts={}]
   */
  constructor(message = 'SDK error', opts = {}) {
    super(message, opts);
    this.name = 'SDKError';
  }
}

/**
 * Factory: create a typed error from an HTTP response status code and body.
 *
 * Extracts a human-readable detail message from the response body using
 * Confluence's common error payload shapes:
 * - `body.message` — standard Confluence REST error
 * - `body.data?.message` — nested error detail
 * - Falls back to `HTTP ${status}`
 *
 * @param {number} status - HTTP status code.
 * @param {unknown} body - Parsed response body (may be null/undefined).
 * @param {string} [url] - Request URL.
 * @param {string} [method] - HTTP method.
 * @param {{ retryAfter?: number }} [headers={}] - Parsed response headers.
 * @returns {ConfluenceApiError} A status-specific error subclass instance.
 */
export function createErrorFromResponse(status, body, url, method, headers = {}) {
  const detail =
    body && typeof body === 'object' && 'message' in body
      ? /** @type {{ message: string }} */ (body).message
      : body &&
          typeof body === 'object' &&
          'data' in body &&
          /** @type {{ data?: { message?: string } }} */ (body).data?.message
        ? /** @type {{ data: { message: string } }} */ (body).data.message
        : `HTTP ${status}`;

  const opts = { responseData: body, url, method };

  switch (status) {
    case 400:
      return new ConfluenceValidationError(detail, opts);
    case 401:
      return new ConfluenceAuthenticationError(detail, opts);
    case 403:
      return new ConfluencePermissionError(detail, opts);
    case 404:
      return new ConfluenceNotFoundError(detail, opts);
    case 409:
      return new ConfluenceConflictError(detail, opts);
    case 429:
      return new ConfluenceRateLimitError(detail, {
        ...opts,
        retryAfter: headers.retryAfter,
      });
    default:
      if (status >= 500) return new ConfluenceServerError(detail, { ...opts, status });
      return new ConfluenceApiError(detail, { ...opts, status });
  }
}
