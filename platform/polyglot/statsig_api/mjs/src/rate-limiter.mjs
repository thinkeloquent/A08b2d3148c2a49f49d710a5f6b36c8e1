/**
 * Rate Limiter Module — Statsig Console API Client
 *
 * Reactive rate limiter for the Statsig Console API.
 * The Statsig API uses HTTP 429 + Retry-After header to signal rate limits.
 * Approximate thresholds: ~100 req/10s, ~900 req/15min.
 *
 * This limiter reacts to 429 responses rather than proactively throttling:
 *   - Parses the Retry-After header
 *   - Optionally auto-waits and retries
 *   - Invokes an onRateLimit callback for visibility
 *   - Tracks the last rate limit event
 */

import { create } from './logger.mjs';
import { RateLimitError } from './errors.mjs';

const log = create('statsig-api', import.meta.url);

/**
 * Parse the Retry-After header value into seconds.
 * Handles both numeric seconds and HTTP-date formats.
 *
 * @param {string|null|undefined} headerValue - Raw Retry-After header value
 * @returns {number} Seconds to wait (defaults to 60 if unparseable)
 */
export function parseRetryAfter(headerValue) {
  if (!headerValue) return 60;

  const numeric = parseFloat(headerValue);
  if (!Number.isNaN(numeric) && numeric > 0) {
    return Math.ceil(numeric);
  }

  // Try parsing as HTTP-date (e.g. "Wed, 21 Oct 2025 07:28:00 GMT")
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

  return {
    retryAfter,
    remaining,
    limit,
    resetAt,
    timestamp: new Date(),
  };
}

/**
 * Sleep for the specified number of seconds.
 *
 * @param {number} seconds - Duration to sleep
 * @returns {Promise<void>}
 */
function _sleep(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

/**
 * Reactive rate limiter for the Statsig Console API.
 *
 * Handles HTTP 429 responses by:
 *  1. Parsing the Retry-After header
 *  2. Notifying via onRateLimit callback
 *  3. Optionally auto-waiting and retrying the request
 *
 * @example
 * const limiter = new RateLimiter({ autoWait: true, maxRetries: 3 });
 * // Called internally by StatsigClient on 429 responses
 */
export class RateLimiter {
  /**
   * @param {object} [options={}]
   * @param {boolean} [options.autoWait=true] - Automatically sleep and retry on 429
   * @param {number} [options.maxRetries=3] - Maximum number of retry attempts per request
   * @param {function(import('./types.mjs').RateLimitInfo): boolean|void} [options.onRateLimit] - Callback on 429; return false to skip auto-wait
   * @param {object} [options.logger] - Custom logger instance
   */
  constructor({ autoWait = true, maxRetries = 3, onRateLimit = null, logger = null } = {}) {
    /** @type {boolean} */
    this._autoWait = autoWait;

    /** @type {number} */
    this._maxRetries = maxRetries;

    /** @type {function|null} */
    this._onRateLimit = onRateLimit;

    /** @type {object} */
    this._logger = logger || log;

    /**
     * The most recent rate limit event, or null if none has occurred.
     * @type {import('./types.mjs').RateLimitInfo|null}
     */
    this.lastRateLimit = null;
  }

  /**
   * Handle an HTTP 429 response.
   *
   * Workflow:
   *  1. Parse rate limit info from response headers
   *  2. Log a warning
   *  3. Update `lastRateLimit`
   *  4. Call `onRateLimit` callback if provided
   *  5. If auto-wait is enabled and retries remain, sleep and invoke retryFn
   *  6. Otherwise, throw a RateLimitError
   *
   * @param {Response} response - The fetch Response object (must have status 429)
   * @param {function(): Promise<*>} retryFn - Function to call for retrying the request
   * @param {number} [retryCount=0] - Current retry attempt number
   * @returns {Promise<*>} Result of the retried request, or throws RateLimitError
   * @throws {RateLimitError} When auto-wait is disabled, retries exhausted, or callback returns false
   */
  async handleResponse(response, retryFn, retryCount = 0) {
    // Normalize headers to a plain object with lowercase keys
    const headers = {};
    if (response.headers && typeof response.headers.forEach === 'function') {
      response.headers.forEach((value, key) => {
        headers[key.toLowerCase()] = value;
      });
    } else if (response.headers && typeof response.headers === 'object') {
      for (const [k, v] of Object.entries(response.headers)) {
        headers[k.toLowerCase()] = v;
      }
    }

    const rateLimitInfo = buildRateLimitInfo(headers);
    this.lastRateLimit = rateLimitInfo;

    this._logger.warn('rate limited by Statsig API (HTTP 429)', {
      retryAfter: rateLimitInfo.retryAfter,
      retryCount,
      maxRetries: this._maxRetries,
      remaining: rateLimitInfo.remaining,
    });

    // Invoke callback; if it returns false, throw immediately
    if (this._onRateLimit) {
      const callbackResult = this._onRateLimit(rateLimitInfo);
      if (callbackResult === false) {
        this._logger.info('onRateLimit callback returned false, skipping auto-wait');
        let body;
        try { body = await response.json(); } catch { body = null; }
        throw new RateLimitError('Rate limit exceeded (callback declined retry)', {
          retryAfter: rateLimitInfo.retryAfter,
          responseBody: body,
          headers,
        });
      }
    }

    // Check if auto-wait is enabled and retries remain
    if (!this._autoWait || retryCount >= this._maxRetries) {
      const reason = !this._autoWait
        ? 'auto-wait disabled'
        : `max retries exhausted (${retryCount}/${this._maxRetries})`;
      this._logger.warn(`not retrying: ${reason}`);
      let body;
      try { body = await response.json(); } catch { body = null; }
      throw new RateLimitError(`Rate limit exceeded (${reason})`, {
        retryAfter: rateLimitInfo.retryAfter,
        responseBody: body,
        headers,
      });
    }

    // Auto-wait and retry
    this._logger.info(`waiting ${rateLimitInfo.retryAfter}s before retry ${retryCount + 1}/${this._maxRetries}`);
    await _sleep(rateLimitInfo.retryAfter);
    return retryFn();
  }
}
