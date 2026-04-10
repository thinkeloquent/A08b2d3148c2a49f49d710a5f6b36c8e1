/**
 * Rate Limiter Module — Sauce Labs API Client
 *
 * Reactive rate limiter for the Sauce Labs REST API.
 * Sauce Labs allows ~10 req/sec (3,500/hour) for authenticated requests.
 * HTTP 429 + Retry-After header signals rate limits.
 *
 * This limiter reacts to 429 responses with exponential backoff:
 *   - Parses the Retry-After header
 *   - Applies exponential backoff with jitter
 *   - Optionally auto-waits and retries
 *   - Invokes an onRateLimit callback for visibility
 */

import { create } from './logger.mjs';
import { SaucelabsRateLimitError } from './errors.mjs';

const log = create('saucelabs-api', import.meta.url);

/**
 * Parse the Retry-After header value into seconds.
 * Handles both numeric seconds and HTTP-date formats.
 *
 * @param {string|null|undefined} headerValue
 * @returns {number} Seconds to wait (defaults to 60 if unparseable)
 */
export function parseRetryAfter(headerValue) {
  if (!headerValue) return 60;

  const numeric = parseFloat(headerValue);
  if (!Number.isNaN(numeric) && numeric > 0) {
    return Math.ceil(numeric);
  }

  const dateMs = Date.parse(headerValue);
  if (!Number.isNaN(dateMs)) {
    const diffSeconds = Math.ceil((dateMs - Date.now()) / 1000);
    return diffSeconds > 0 ? diffSeconds : 1;
  }

  return 60;
}

/**
 * Build a RateLimitInfo object from response headers.
 *
 * @param {object} headers - Response headers (plain object, lowercase keys)
 * @returns {import('./types.mjs').RateLimitInfo}
 */
export function buildRateLimitInfo(headers) {
  const retryAfterRaw = headers['retry-after'] ?? headers['Retry-After'];
  const retryAfter = parseRetryAfter(retryAfterRaw);

  const remaining = headers['x-ratelimit-remaining'] != null
    ? parseInt(headers['x-ratelimit-remaining'], 10)
    : null;

  const limit = headers['x-ratelimit-limit'] != null
    ? parseInt(headers['x-ratelimit-limit'], 10)
    : null;

  const resetRaw = headers['x-ratelimit-reset'];
  const resetAt = resetRaw ? new Date(parseInt(resetRaw, 10) * 1000) : null;

  return { retryAfter, remaining, limit, resetAt, timestamp: new Date() };
}

/**
 * Calculate exponential backoff with jitter.
 *
 * @param {number} retryCount - Current retry attempt (0-indexed)
 * @param {number} [baseDelay=1] - Base delay in seconds
 * @param {number} [maxDelay=60] - Maximum delay cap in seconds
 * @returns {number} Delay in seconds
 */
export function calculateBackoff(retryCount, baseDelay = 1, maxDelay = 60) {
  const exponential = baseDelay * Math.pow(2, retryCount);
  const jitter = Math.random() * baseDelay;
  return Math.min(exponential + jitter, maxDelay);
}

function _sleep(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

/**
 * Reactive rate limiter for the Sauce Labs REST API.
 */
export class RateLimiter {
  constructor({ autoWait = true, maxRetries = 5, onRateLimit = null, logger = null } = {}) {
    this._autoWait = autoWait;
    this._maxRetries = maxRetries;
    this._onRateLimit = onRateLimit;
    this._logger = logger || log;
    this.lastRateLimit = null;
  }

  /**
   * Handle an HTTP 429 response.
   *
   * @param {Response} response - The fetch Response object
   * @param {function(): Promise<*>} retryFn - Retry callback
   * @param {number} [retryCount=0] - Current retry attempt
   * @returns {Promise<*>}
   * @throws {SaucelabsRateLimitError}
   */
  async handleResponse(response, retryFn, retryCount = 0) {
    const headers = {};
    if (response.headers && typeof response.headers.forEach === 'function') {
      response.headers.forEach((value, key) => { headers[key.toLowerCase()] = value; });
    } else if (response.headers && typeof response.headers === 'object') {
      for (const [k, v] of Object.entries(response.headers)) { headers[k.toLowerCase()] = v; }
    }

    const rateLimitInfo = buildRateLimitInfo(headers);
    this.lastRateLimit = rateLimitInfo;

    this._logger.warn('rate limited by Sauce Labs API (HTTP 429)', {
      retryAfter: rateLimitInfo.retryAfter,
      retryCount,
      maxRetries: this._maxRetries,
      remaining: rateLimitInfo.remaining,
    });

    // Invoke callback
    if (this._onRateLimit) {
      const callbackResult = this._onRateLimit(rateLimitInfo);
      if (callbackResult === false) {
        this._logger.info('onRateLimit callback returned false, aborting retry');
        let body;
        try { body = await response.json(); } catch { body = null; }
        throw new SaucelabsRateLimitError('Rate limit exceeded (callback declined retry)', {
          retryAfter: rateLimitInfo.retryAfter, responseBody: body, headers,
        });
      }
    }

    // Check if we should retry
    if (!this._autoWait || retryCount >= this._maxRetries) {
      const reason = !this._autoWait
        ? 'auto-wait disabled'
        : `max retries exhausted (${retryCount}/${this._maxRetries})`;
      this._logger.warn(`not retrying: ${reason}`);
      let body;
      try { body = await response.json(); } catch { body = null; }
      throw new SaucelabsRateLimitError(`Rate limit exceeded (${reason})`, {
        retryAfter: rateLimitInfo.retryAfter, responseBody: body, headers,
      });
    }

    // Use Retry-After if present, otherwise exponential backoff
    const waitSeconds = rateLimitInfo.retryAfter > 0
      ? rateLimitInfo.retryAfter
      : calculateBackoff(retryCount);

    this._logger.info(`waiting ${waitSeconds}s before retry ${retryCount + 1}/${this._maxRetries}`);
    await _sleep(waitSeconds);
    return retryFn();
  }
}
