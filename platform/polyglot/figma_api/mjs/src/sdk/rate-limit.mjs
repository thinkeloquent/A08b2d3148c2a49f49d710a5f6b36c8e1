/**
 * Rate Limit Module — Figma API SDK
 *
 * Figma-specific reactive rate limiting.
 * Figma uses a leaky bucket algorithm and signals rate limiting
 * exclusively via HTTP 429 + Retry-After header.
 */

import { create } from '../logger.mjs';

const log = create('figma-api', import.meta.url);

/**
 * Parse rate limit headers from a 429 response.
 * @param {Record<string, string>} headers - Response headers
 * @returns {object} RateLimitInfo
 */
export function parseRateLimitHeaders(headers) {
  const retryAfter = parseFloat(headers['retry-after']) || 60;

  return {
    retryAfter,
    retryAfterMinutes: +(retryAfter / 60).toFixed(2),
    planTier: headers['x-figma-plan-tier'] || null,
    rateLimitType: headers['x-figma-rate-limit-type'] || null,
    upgradeLink: headers['x-figma-upgrade-link'] || null,
    timestamp: new Date(),
  };
}

/**
 * Wait for the specified duration (Retry-After seconds).
 * @param {number} seconds - Seconds to wait
 * @returns {Promise<void>}
 */
export function waitForRetryAfter(seconds) {
  log.warn('rate limited, waiting', { retryAfterSeconds: seconds });
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

/**
 * Determine whether to auto-wait on rate limit.
 * @param {object} rateLimitInfo - Parsed rate limit info
 * @param {object} options - Client rate limit options
 * @returns {boolean} true if should auto-wait
 */
export function shouldAutoWait(rateLimitInfo, options = {}) {
  const { rateLimitAutoWait = true, maxRetryAfter = 60, onRateLimit } = options;

  if (onRateLimit) {
    const result = onRateLimit(rateLimitInfo);
    if (result === false) {
      log.info('onRateLimit callback returned false, skipping auto-wait');
      return false;
    }
  }

  if (!rateLimitAutoWait) return false;

  if (rateLimitInfo.retryAfter > maxRetryAfter) {
    log.warn('retryAfter exceeds maxRetryAfter, skipping auto-wait', {
      retryAfter: rateLimitInfo.retryAfter,
      maxRetryAfter,
    });
    return false;
  }

  return true;
}

/**
 * Handle a 429 rate limit response.
 * Returns true if the request should be retried.
 */
export async function handleRateLimit(headers, options = {}) {
  const info = parseRateLimitHeaders(headers);

  log.warn('rate limited by Figma API', {
    retryAfter: info.retryAfter,
    planTier: info.planTier,
    rateLimitType: info.rateLimitType,
  });

  if (shouldAutoWait(info, options)) {
    await waitForRetryAfter(info.retryAfter);
    return { retry: true, rateLimitInfo: info };
  }

  return { retry: false, rateLimitInfo: info };
}
