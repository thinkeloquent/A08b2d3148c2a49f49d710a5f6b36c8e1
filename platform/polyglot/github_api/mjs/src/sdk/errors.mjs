/**
 * Error hierarchy for GitHub API SDK.
 * Each error class maps to a specific GitHub API failure mode.
 * @module sdk/errors
 */

/**
 * Base error for all GitHub API errors.
 */
export class GitHubError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} [status] - HTTP status code
   * @param {string} [requestId] - GitHub request ID
   * @param {string} [documentationUrl] - GitHub documentation URL
   */
  constructor(message, status, requestId, documentationUrl) {
    super(message);
    this.name = 'GitHubError';
    this.status = status;
    this.requestId = requestId;
    this.documentationUrl = documentationUrl;
  }
}

/**
 * Authentication failure (401).
 */
export class AuthError extends GitHubError {
  /**
   * @param {string} message
   * @param {string} [requestId]
   * @param {string} [documentationUrl]
   */
  constructor(message, requestId, documentationUrl) {
    super(message, 401, requestId, documentationUrl);
    this.name = 'AuthError';
  }
}

/**
 * Resource not found (404).
 */
export class NotFoundError extends GitHubError {
  /**
   * @param {string} message
   * @param {string} [requestId]
   * @param {string} [documentationUrl]
   */
  constructor(message, requestId, documentationUrl) {
    super(message, 404, requestId, documentationUrl);
    this.name = 'NotFoundError';
  }
}

/**
 * Validation failure (422).
 */
export class ValidationError extends GitHubError {
  /**
   * @param {string} message
   * @param {string} [requestId]
   * @param {string} [documentationUrl]
   */
  constructor(message, requestId, documentationUrl) {
    super(message, 422, requestId, documentationUrl);
    this.name = 'ValidationError';
  }
}

/**
 * Rate limit exceeded (429 or 403 with rate limit headers).
 */
export class RateLimitError extends GitHubError {
  /**
   * @param {string} message
   * @param {Date} [resetAt] - When the rate limit resets
   * @param {number} [retryAfter] - Seconds to wait before retry
   * @param {string} [requestId]
   * @param {string} [documentationUrl]
   */
  constructor(message, resetAt, retryAfter, requestId, documentationUrl) {
    super(message, 429, requestId, documentationUrl);
    this.name = 'RateLimitError';
    this.resetAt = resetAt;
    this.retryAfter = retryAfter;
  }
}

/**
 * Conflict error (409).
 */
export class ConflictError extends GitHubError {
  /**
   * @param {string} message
   * @param {string} [requestId]
   * @param {string} [documentationUrl]
   */
  constructor(message, requestId, documentationUrl) {
    super(message, 409, requestId, documentationUrl);
    this.name = 'ConflictError';
  }
}

/**
 * Forbidden error (403, non-rate-limit).
 */
export class ForbiddenError extends GitHubError {
  /**
   * @param {string} message
   * @param {string} [requestId]
   * @param {string} [documentationUrl]
   */
  constructor(message, requestId, documentationUrl) {
    super(message, 403, requestId, documentationUrl);
    this.name = 'ForbiddenError';
  }
}

/**
 * Server-side error (5xx).
 */
export class ServerError extends GitHubError {
  /**
   * @param {string} message
   * @param {number} [status=500]
   * @param {string} [requestId]
   * @param {string} [documentationUrl]
   */
  constructor(message, status = 500, requestId, documentationUrl) {
    super(message, status, requestId, documentationUrl);
    this.name = 'ServerError';
  }
}

/**
 * Map an HTTP response to the appropriate error class.
 * @param {number} status - HTTP status code
 * @param {Object} body - Parsed response body
 * @param {Headers|Object} headers - Response headers
 * @returns {GitHubError} The mapped error instance
 */
export function mapResponseToError(status, body, headers) {
  const message = body?.message || `GitHub API error: ${status}`;
  const requestId =
    (headers?.get ? headers.get('x-github-request-id') : headers?.['x-github-request-id']) || undefined;
  const documentationUrl = body?.documentation_url || undefined;

  if (status === 401) {
    return new AuthError(message, requestId, documentationUrl);
  }

  if (status === 403) {
    // Check if this is a rate limit response
    const remaining = headers?.get
      ? headers.get('x-ratelimit-remaining')
      : headers?.['x-ratelimit-remaining'];
    const retryAfter = headers?.get
      ? headers.get('retry-after')
      : headers?.['retry-after'];

    if (
      remaining === '0' ||
      retryAfter ||
      (body?.message && body.message.toLowerCase().includes('rate limit'))
    ) {
      const resetHeader = headers?.get
        ? headers.get('x-ratelimit-reset')
        : headers?.['x-ratelimit-reset'];
      const resetAt = resetHeader ? new Date(parseInt(resetHeader, 10) * 1000) : undefined;
      const retryAfterSec = retryAfter ? parseInt(retryAfter, 10) : undefined;
      return new RateLimitError(message, resetAt, retryAfterSec, requestId, documentationUrl);
    }

    return new ForbiddenError(message, requestId, documentationUrl);
  }

  if (status === 404) {
    return new NotFoundError(message, requestId, documentationUrl);
  }

  if (status === 409) {
    return new ConflictError(message, requestId, documentationUrl);
  }

  if (status === 422) {
    return new ValidationError(message, requestId, documentationUrl);
  }

  if (status === 429) {
    const resetHeader = headers?.get
      ? headers.get('x-ratelimit-reset')
      : headers?.['x-ratelimit-reset'];
    const retryAfter = headers?.get
      ? headers.get('retry-after')
      : headers?.['retry-after'];
    const resetAt = resetHeader ? new Date(parseInt(resetHeader, 10) * 1000) : undefined;
    const retryAfterSec = retryAfter ? parseInt(retryAfter, 10) : undefined;
    return new RateLimitError(message, resetAt, retryAfterSec, requestId, documentationUrl);
  }

  if (status >= 500) {
    return new ServerError(message, status, requestId, documentationUrl);
  }

  return new GitHubError(message, status, requestId, documentationUrl);
}
