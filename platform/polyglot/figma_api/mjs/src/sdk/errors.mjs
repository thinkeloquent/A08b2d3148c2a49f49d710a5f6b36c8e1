/**
 * Errors Module — Figma API SDK
 *
 * Typed error hierarchy for Figma API responses.
 * All errors include code, meta, and timestamp fields.
 */

export class FigmaError extends Error {
  constructor(message, { status = 500, code = 'FIGMA_ERROR', meta = {}, requestId = null } = {}) {
    super(message);
    this.name = 'FigmaError';
    this.status = status;
    this.code = code;
    this.meta = meta;
    this.requestId = requestId;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      error: true,
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      meta: this.meta,
      requestId: this.requestId,
      timestamp: this.timestamp,
    };
  }
}

export class AuthenticationError extends FigmaError {
  constructor(message = 'Authentication failed', meta = {}) {
    super(message, { status: 401, code: 'AUTHENTICATION_ERROR', meta });
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends FigmaError {
  constructor(message = 'Access forbidden', meta = {}) {
    super(message, { status: 403, code: 'AUTHORIZATION_ERROR', meta });
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends FigmaError {
  constructor(message = 'Resource not found', meta = {}) {
    super(message, { status: 404, code: 'NOT_FOUND', meta });
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends FigmaError {
  constructor(message = 'Validation failed', meta = {}) {
    super(message, { status: 422, code: 'VALIDATION_ERROR', meta });
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends FigmaError {
  constructor(message = 'Rate limit exceeded', { rateLimitInfo = null, ...meta } = {}) {
    super(message, { status: 429, code: 'RATE_LIMIT_ERROR', meta });
    this.name = 'RateLimitError';
    this.rateLimitInfo = rateLimitInfo;
  }
}

export class ApiError extends FigmaError {
  constructor(message = 'API error', meta = {}) {
    super(message, { status: meta.status || 400, code: 'API_ERROR', meta });
    this.name = 'ApiError';
  }
}

export class ServerError extends FigmaError {
  constructor(message = 'Server error', meta = {}) {
    super(message, { status: meta.status || 500, code: 'SERVER_ERROR', meta });
    this.name = 'ServerError';
  }
}

export class NetworkError extends FigmaError {
  constructor(message = 'Network error', meta = {}) {
    super(message, { status: 0, code: 'NETWORK_ERROR', meta });
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends FigmaError {
  constructor(message = 'Request timed out', meta = {}) {
    super(message, { status: 408, code: 'TIMEOUT_ERROR', meta });
    this.name = 'TimeoutError';
  }
}

export class ConfigurationError extends FigmaError {
  constructor(message = 'Configuration error', meta = {}) {
    super(message, { status: 0, code: 'CONFIGURATION_ERROR', meta });
    this.name = 'ConfigurationError';
  }
}

/**
 * Map an HTTP response to the appropriate error type.
 */
export function mapResponseToError(status, body, headers = {}) {
  const message = (body && typeof body === 'object' ? body.message || body.err : String(body)) || `HTTP ${status}`;
  const meta = { status, body };

  switch (status) {
    case 401:
      return new AuthenticationError(message, meta);
    case 403:
      return new AuthorizationError(message, meta);
    case 404:
      return new NotFoundError(message, meta);
    case 422:
      return new ValidationError(message, meta);
    case 429: {
      const retryAfter = parseFloat(headers['retry-after']) || 60;
      const rateLimitInfo = {
        retryAfter,
        planTier: headers['x-figma-plan-tier'] || null,
        rateLimitType: headers['x-figma-rate-limit-type'] || null,
        upgradeLink: headers['x-figma-upgrade-link'] || null,
        timestamp: new Date(),
      };
      return new RateLimitError(message, { rateLimitInfo, ...meta });
    }
    default:
      if (status >= 500) return new ServerError(message, meta);
      return new ApiError(message, meta);
  }
}
