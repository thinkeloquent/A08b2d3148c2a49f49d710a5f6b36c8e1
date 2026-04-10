/**
 * Types Module — Sauce Labs API Client
 *
 * JSDoc type definitions and shared constants for the Sauce Labs REST API.
 */

// ── Region URL mappings ─────────────────────────────────────────────

/**
 * Core Automation region base URLs.
 * @type {Record<string, string>}
 */
export const CORE_REGIONS = {
  'us-west-1': 'https://api.us-west-1.saucelabs.com',
  'us-east-4': 'https://api.us-east-4.saucelabs.com',
  'eu-central-1': 'https://api.eu-central-1.saucelabs.com',
};

/**
 * Mobile Distribution region base URLs.
 * @type {Record<string, string>}
 */
export const MOBILE_REGIONS = {
  'us-east': 'https://mobile.saucelabs.com',
  'eu-central-1': 'https://mobile.eu-central-1.saucelabs.com',
};

/**
 * Default Core Automation base URL (US West).
 * @type {string}
 */
export const DEFAULT_BASE_URL = 'https://api.us-west-1.saucelabs.com';

/**
 * Default Mobile Distribution base URL (US East).
 * @type {string}
 */
export const DEFAULT_MOBILE_BASE_URL = 'https://mobile.saucelabs.com';

/**
 * Default request timeout in milliseconds (30 seconds).
 * @type {number}
 */
export const DEFAULT_TIMEOUT = 30000;

/**
 * Default maximum retries on HTTP 429.
 * @type {number}
 */
export const DEFAULT_MAX_RETRIES = 5;

/**
 * Sauce Labs vendor identifier for internal routes.
 * @type {string}
 */
export const VENDOR = 'saucelabs_api';

/**
 * Sauce Labs vendor API version for internal routes.
 * @type {string}
 */
export const VENDOR_VERSION = 'v1';

/**
 * Valid automation API filter values for the platforms endpoint.
 * @type {string[]}
 */
export const AUTOMATION_API_VALUES = ['all', 'appium', 'webdriver'];

/**
 * Valid mobile file extensions for upload.
 * @type {string[]}
 */
export const VALID_UPLOAD_EXTENSIONS = ['.apk', '.ipa', '.aab'];

/**
 * @typedef {Object} RateLimitInfo
 * @property {number} retryAfter - Seconds to wait before next request
 * @property {number|null} remaining - Remaining requests in current window
 * @property {number|null} limit - Total request limit for current window
 * @property {Date|null} resetAt - Timestamp when the rate limit resets
 * @property {Date} timestamp - When this info was captured
 */

/**
 * @typedef {Object} SaucelabsClientOptions
 * @property {string} [apiKey] - Sauce Labs Access Key. Falls back to SAUCE_ACCESS_KEY env var.
 * @property {string} [username] - Sauce Labs Username. Falls back to SAUCE_USERNAME env var.
 * @property {string} [baseUrl] - Override Core Automation base URL
 * @property {string} [mobileBaseUrl] - Override Mobile Distribution base URL
 * @property {string} [region='us-west-1'] - Core Automation region
 * @property {string} [mobileRegion='us-east'] - Mobile Distribution region
 * @property {boolean} [rateLimitAutoWait=true] - Auto wait and retry on 429
 * @property {number} [rateLimitThreshold=0] - Buffer for rate limits
 * @property {function(RateLimitInfo): boolean|void} [onRateLimit] - Rate limit callback
 * @property {object} [logger] - Custom logger with debug/info/warn/error
 * @property {number} [timeout=30000] - Request timeout in milliseconds
 * @property {string} [proxy] - HTTP proxy URL
 * @property {boolean} [verifySsl=true] - Whether to verify SSL certificates
 */

/**
 * @typedef {Object} RequestOptions
 * @property {Object<string, string>} [headers] - Additional request headers
 * @property {Object<string, string|number|boolean>} [params] - URL query parameters
 * @property {number} [timeout] - Per-request timeout override in milliseconds
 */
