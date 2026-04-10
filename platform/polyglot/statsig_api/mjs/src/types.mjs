/**
 * Types Module — Statsig Console API Client
 *
 * JSDoc type definitions and shared constants.
 * This module exports no runtime classes — only constants and
 * documentation-only typedefs consumed by IDEs and tooling.
 */

/**
 * @typedef {Object} RateLimitInfo
 * @property {number} retryAfter - Seconds to wait before next request (from Retry-After header)
 * @property {number|null} remaining - Remaining requests in the current window (null if unknown)
 * @property {number|null} limit - Total request limit for the current window (null if unknown)
 * @property {Date|null} resetAt - Timestamp when the rate limit window resets (null if unknown)
 * @property {Date} timestamp - When this rate limit info was captured
 */

/**
 * @typedef {Object} StatsigClientOptions
 * @property {string} [apiKey] - Statsig Console API key. Falls back to STATSIG_API_KEY env var.
 * @property {string} [baseUrl='https://statsigapi.net/console/v1'] - API base URL
 * @property {boolean} [rateLimitAutoWait=true] - Automatically wait and retry on HTTP 429
 * @property {number} [rateLimitThreshold=0] - Reserved for future proactive rate limit handling
 * @property {function(RateLimitInfo): boolean|void} [onRateLimit] - Rate limit callback; return false to skip auto-wait
 * @property {object} [logger] - Custom logger with debug/info/warn/error methods
 * @property {number} [timeout=30000] - Request timeout in milliseconds
 * @property {string} [proxy] - HTTP proxy URL (reserved for future use)
 * @property {boolean} [verifySsl=true] - Whether to verify SSL certificates (reserved for future use)
 */

/**
 * @typedef {Object} RequestOptions
 * @property {Object<string, string>} [headers] - Additional request headers
 * @property {Object<string, string|number|boolean>} [params] - URL query parameters
 * @property {number} [timeout] - Per-request timeout override in milliseconds
 */

/**
 * @typedef {Object} PaginationMeta
 * @property {string|null} nextPage - URL for the next page of results, or null if at the end
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {Array<*>} data - Array of result items for this page
 * @property {PaginationMeta} [pagination] - Pagination metadata
 */

/**
 * Default base URL for the Statsig Console API v1.
 * @type {string}
 */
export const DEFAULT_BASE_URL = 'https://statsigapi.net/console/v1';

/**
 * Default request timeout in milliseconds (30 seconds).
 * @type {number}
 */
export const DEFAULT_TIMEOUT = 30000;

/**
 * Default maximum number of retries on HTTP 429 responses.
 * @type {number}
 */
export const DEFAULT_MAX_RETRIES = 3;
