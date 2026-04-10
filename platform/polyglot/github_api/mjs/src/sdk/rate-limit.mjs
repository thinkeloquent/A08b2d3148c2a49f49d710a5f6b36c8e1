/**
 * Rate limit parsing, detection, and auto-wait utilities.
 * @module sdk/rate-limit
 */

/**
 * @typedef {Object} RateLimitInfo
 * @property {number} limit - Maximum requests per window
 * @property {number} remaining - Remaining requests in current window
 * @property {number} reset - Unix timestamp when the limit resets
 * @property {number} used - Requests used in current window
 * @property {string} resource - Rate limit resource category
 */

/**
 * Parse rate limit information from response headers.
 * @param {Headers|Object} headers - Response headers
 * @returns {RateLimitInfo|null} Parsed rate limit info, or null if headers missing
 */
export function parseRateLimitHeaders(headers) {
  const get = (name) =>
    headers?.get ? headers.get(name) : headers?.[name];

  const limit = get('x-ratelimit-limit');
  const remaining = get('x-ratelimit-remaining');
  const reset = get('x-ratelimit-reset');
  const used = get('x-ratelimit-used');
  const resource = get('x-ratelimit-resource');

  if (limit == null && remaining == null) {
    return null;
  }

  return {
    limit: limit ? parseInt(limit, 10) : 0,
    remaining: remaining ? parseInt(remaining, 10) : 0,
    reset: reset ? parseInt(reset, 10) : 0,
    used: used ? parseInt(used, 10) : 0,
    resource: resource || 'core',
  };
}

/**
 * Determine whether the client should wait for rate limit reset.
 * @param {RateLimitInfo} info - Current rate limit info
 * @param {Object} [options]
 * @param {boolean} [options.autoWait=true] - Whether auto-wait is enabled
 * @param {number} [options.threshold=0] - Remaining count threshold to trigger wait
 * @returns {boolean} True if the client should wait
 */
export function shouldWaitForRateLimit(info, options = {}) {
  const { autoWait = true, threshold = 0 } = options;

  if (!autoWait || !info) {
    return false;
  }

  return info.remaining <= threshold;
}

/**
 * Sleep until the rate limit resets.
 * @param {RateLimitInfo} info - Rate limit info with reset timestamp
 * @param {Object} [logger] - Logger instance
 * @returns {Promise<void>}
 */
export async function waitForRateLimit(info, logger) {
  if (!info || !info.reset) {
    return;
  }

  const now = Math.floor(Date.now() / 1000);
  const waitSeconds = Math.max(info.reset - now + 1, 1);

  if (logger) {
    logger.warn(`Rate limit reached. Waiting ${waitSeconds}s until reset.`, {
      reset: new Date(info.reset * 1000).toISOString(),
      remaining: info.remaining,
    });
  }

  await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000));
}

/**
 * Detect whether a response represents a secondary rate limit.
 * Secondary rate limits use 403 or 429 with Retry-After header or specific messages.
 * @param {number} status - HTTP status code
 * @param {Object} body - Parsed response body
 * @returns {boolean} True if this is a secondary rate limit
 */
export function isSecondaryRateLimit(status, body) {
  if (status !== 403 && status !== 429) {
    return false;
  }

  const message = body?.message?.toLowerCase() || '';
  return (
    message.includes('secondary rate limit') ||
    message.includes('abuse detection') ||
    message.includes('you have exceeded a secondary rate limit')
  );
}
