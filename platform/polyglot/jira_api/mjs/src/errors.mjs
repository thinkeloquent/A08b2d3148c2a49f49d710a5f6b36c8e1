/**
 * @module errors
 * @description Structured error hierarchy for the Jira API client.
 * Maps HTTP status codes to specific error subclasses.
 */

/** Machine-readable error codes. */
export const ErrorCode = Object.freeze({
  NETWORK: 'NETWORK',
  RESPONSE: 'RESPONSE',
  TIMEOUT: 'TIMEOUT',
  CONFIGURATION: 'CONFIGURATION',
  RATE_LIMIT: 'RATE_LIMIT',
});

/**
 * Base error class for all Jira API errors.
 */
export class JiraApiError extends Error {
  /** @type {string} */
  code;
  /** @type {number|undefined} */
  status;
  /** @type {unknown} */
  responseData;
  /** @type {string|undefined} */
  url;
  /** @type {string|undefined} */
  method;

  /**
   * @param {string} message
   * @param {{ code?: string, status?: number, responseData?: unknown, url?: string, method?: string, cause?: unknown }} opts
   */
  constructor(message, opts = {}) {
    super(message, opts.cause ? { cause: opts.cause } : undefined);
    this.name = 'JiraApiError';
    this.code = opts.code || ErrorCode.RESPONSE;
    this.status = opts.status;
    this.responseData = opts.responseData;
    this.url = opts.url;
    this.method = opts.method;
  }

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

  static isJiraApiError(error) {
    return error instanceof JiraApiError;
  }

  static hasStatusCode(error, status) {
    return error instanceof JiraApiError && error.status === status;
  }
}

/** 401 - Invalid credentials or expired token. */
export class JiraAuthenticationError extends JiraApiError {
  constructor(message = 'Authentication failed', opts = {}) {
    super(message, { ...opts, code: ErrorCode.RESPONSE, status: 401 });
    this.name = 'JiraAuthenticationError';
  }
}

/** 403 - Insufficient permissions. */
export class JiraPermissionError extends JiraApiError {
  constructor(message = 'Permission denied', opts = {}) {
    super(message, { ...opts, code: ErrorCode.RESPONSE, status: 403 });
    this.name = 'JiraPermissionError';
  }
}

/** 404 - Resource not found. */
export class JiraNotFoundError extends JiraApiError {
  constructor(message = 'Resource not found', opts = {}) {
    super(message, { ...opts, code: ErrorCode.RESPONSE, status: 404 });
    this.name = 'JiraNotFoundError';
  }
}

/** 400 - Bad request / validation failure. */
export class JiraValidationError extends JiraApiError {
  constructor(message = 'Validation failed', opts = {}) {
    super(message, { ...opts, code: ErrorCode.RESPONSE, status: 400 });
    this.name = 'JiraValidationError';
  }
}

/** 429 - Rate limited. */
export class JiraRateLimitError extends JiraApiError {
  /** @type {number|undefined} */
  retryAfter;

  constructor(message = 'Rate limited', opts = {}) {
    super(message, { ...opts, code: ErrorCode.RATE_LIMIT, status: 429 });
    this.name = 'JiraRateLimitError';
    this.retryAfter = opts.retryAfter;
  }
}

/** 5xx - Server error. */
export class JiraServerError extends JiraApiError {
  constructor(message = 'Jira server error', opts = {}) {
    super(message, { ...opts, code: ErrorCode.RESPONSE, status: opts.status || 500 });
    this.name = 'JiraServerError';
  }
}

/** Network failure (DNS, connection refused, etc). */
export class JiraNetworkError extends JiraApiError {
  constructor(message = 'Network error', opts = {}) {
    super(message, { ...opts, code: ErrorCode.NETWORK });
    this.name = 'JiraNetworkError';
  }
}

/** Request timed out. */
export class JiraTimeoutError extends JiraApiError {
  constructor(message = 'Request timed out', opts = {}) {
    super(message, { ...opts, code: ErrorCode.TIMEOUT });
    this.name = 'JiraTimeoutError';
  }
}

/** Configuration error (missing params, invalid config). */
export class JiraConfigurationError extends JiraApiError {
  constructor(message = 'Configuration error', opts = {}) {
    super(message, { ...opts, code: ErrorCode.CONFIGURATION });
    this.name = 'JiraConfigurationError';
  }
}

/** SDK-specific error for REST proxy client. */
export class SDKError extends JiraApiError {
  constructor(message = 'SDK error', opts = {}) {
    super(message, opts);
    this.name = 'SDKError';
  }
}

/**
 * Create a typed error from an HTTP response status and body.
 * @param {number} status
 * @param {unknown} body
 * @param {string} [url]
 * @param {string} [method]
 * @param {{ retryAfter?: number }} [headers]
 * @returns {JiraApiError}
 */
export function createErrorFromResponse(status, body, url, method, headers = {}) {
  const detail = (body && typeof body === 'object' && 'message' in body)
    ? body.message
    : (body && typeof body === 'object' && 'errorMessages' in body && Array.isArray(body.errorMessages))
      ? body.errorMessages.join('; ')
      : `HTTP ${status}`;

  const opts = { responseData: body, url, method };

  switch (status) {
    case 400: return new JiraValidationError(detail, opts);
    case 401: return new JiraAuthenticationError(detail, opts);
    case 403: return new JiraPermissionError(detail, opts);
    case 404: return new JiraNotFoundError(detail, opts);
    case 429: return new JiraRateLimitError(detail, { ...opts, retryAfter: headers.retryAfter });
    default:
      if (status >= 500) return new JiraServerError(detail, { ...opts, status });
      return new JiraApiError(detail, { ...opts, status });
  }
}
