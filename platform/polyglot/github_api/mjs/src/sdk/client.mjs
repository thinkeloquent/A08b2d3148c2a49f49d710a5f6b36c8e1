/**
 * Base GitHub HTTP client.
 * Handles authentication, rate limiting, error mapping, and structured logging.
 * @module sdk/client
 */

import { resolveGithubEnv } from '@internal/env-resolver';
import { httpRequest } from './client-factory.mjs';
import { mapResponseToError } from './errors.mjs';
import {
  parseRateLimitHeaders,
  shouldWaitForRateLimit,
  waitForRateLimit,
  isSecondaryRateLimit,
} from './rate-limit.mjs';

/**
 * @typedef {Object} Logger
 * @property {function(string, Object=): void} info
 * @property {function(string, Object=): void} debug
 * @property {function(string, Object=): void} warn
 * @property {function(string, Object=): void} error
 */

/**
 * @typedef {Object} RateLimitCallback
 * @property {import('./rate-limit.mjs').RateLimitInfo} info
 */

/**
 * Create a simple console-based structured logger.
 * @param {string} name - Logger namespace
 * @returns {Logger} A logger instance
 */
export function createLogger(name) {
  return {
    info(msg, ctx) {
      console.info(`[${name}] ${msg}`, ctx !== undefined ? ctx : '');
    },
    debug(msg, ctx) {
      console.debug(`[${name}] ${msg}`, ctx !== undefined ? ctx : '');
    },
    warn(msg, ctx) {
      console.warn(`[${name}] ${msg}`, ctx !== undefined ? ctx : '');
    },
    error(msg, ctx) {
      console.error(`[${name}] ${msg}`, ctx !== undefined ? ctx : '');
    },
  };
}

/**
 * Core HTTP client for the GitHub API.
 * Manages authentication, rate limit handling, and error mapping.
 */
export class GitHubClient {
  /**
   * @param {Object} options
   * @param {string} options.token - GitHub API token
   * @param {string} [options.baseUrl] - API base URL (resolved from env-resolver if not set)
   * @param {boolean} [options.rateLimitAutoWait=true] - Auto-wait on rate limit exhaustion
   * @param {number} [options.rateLimitThreshold=0] - Remaining threshold to trigger wait
   * @param {function} [options.onRateLimit] - Callback when rate limit info is updated
   * @param {Logger} [options.logger] - Logger instance
   */
  constructor(options = {}) {
    const {
      token,
      baseUrl = resolveGithubEnv().baseApiUrl,
      rateLimitAutoWait = true,
      rateLimitThreshold = 0,
      onRateLimit,
      logger,
    } = options;

    this.token = token;
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.rateLimitAutoWait = rateLimitAutoWait;
    this.rateLimitThreshold = rateLimitThreshold;
    this.onRateLimit = onRateLimit;
    this.logger = logger || createLogger('github-client');
    this.lastRateLimit = null;
  }

  /**
   * Build the full URL for a request.
   * @param {string} path - API path or full URL
   * @returns {string} Full URL
   */
  _buildUrl(path) {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${cleanPath}`;
  }

  /**
   * Build default headers for GitHub API requests.
   * @returns {Object} Headers object
   */
  _buildHeaders() {
    const headers = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'github-api-sdk-node/1.0.0',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Execute an HTTP request to the GitHub API with full error handling and rate limit support.
   * @param {string} method - HTTP method
   * @param {string} path - API path
   * @param {Object} [options]
   * @param {Object} [options.body] - Request body (will be JSON-serialized)
   * @param {Object} [options.headers] - Additional headers
   * @param {Object} [options.params] - Query parameters
   * @returns {Promise<Object>} Parsed response body
   */
  async _request(method, path, options = {}) {
    const { body, headers: extraHeaders, params } = options;

    let url = this._buildUrl(path);

    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value));
        }
      }
      const sep = url.includes('?') ? '&' : '?';
      url = `${url}${sep}${searchParams.toString()}`;
    }

    const headers = { ...this._buildHeaders(), ...extraHeaders };

    const requestOptions = { headers };
    if (body !== undefined && body !== null) {
      requestOptions.json = body;
    }

    this.logger.debug(`${method} ${url}`);

    const response = await httpRequest(method, url, requestOptions);

    // Parse rate limit headers from every response
    const rateLimitInfo = parseRateLimitHeaders(response.headers);
    if (rateLimitInfo) {
      this.lastRateLimit = rateLimitInfo;
      if (this.onRateLimit) {
        this.onRateLimit(rateLimitInfo);
      }
    }

    // Extract request ID
    const requestId = response.headers.get('x-github-request-id') || undefined;

    // Handle rate limiting
    if (response.statusCode === 429 || (response.statusCode === 403 && rateLimitInfo?.remaining === 0)) {
      const retryAfter = response.headers.get('retry-after');

      // Try to parse body for secondary rate limit detection
      let errorBody;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = { message: `Rate limit exceeded (${response.statusCode})` };
      }

      if (isSecondaryRateLimit(response.statusCode, errorBody)) {
        const waitSec = retryAfter ? parseInt(retryAfter, 10) : 60;
        this.logger.warn(`Secondary rate limit hit. Waiting ${waitSec}s`, { requestId });
        await new Promise((resolve) => setTimeout(resolve, waitSec * 1000));
        // Retry once
        return this._request(method, path, options);
      }

      if (rateLimitInfo && shouldWaitForRateLimit(rateLimitInfo, {
        autoWait: this.rateLimitAutoWait,
        threshold: this.rateLimitThreshold,
      })) {
        await waitForRateLimit(rateLimitInfo, this.logger);
        // Retry after waiting
        return this._request(method, path, options);
      }

      throw mapResponseToError(response.statusCode, errorBody, response.headers);
    }

    // Auto-wait for primary rate limit approaching zero
    if (
      rateLimitInfo &&
      shouldWaitForRateLimit(rateLimitInfo, {
        autoWait: this.rateLimitAutoWait,
        threshold: this.rateLimitThreshold,
      })
    ) {
      this.logger.warn('Primary rate limit approaching zero, pre-emptive wait', {
        remaining: rateLimitInfo.remaining,
      });
      await waitForRateLimit(rateLimitInfo, this.logger);
    }

    // Handle 204 No Content
    if (response.statusCode === 204) {
      return {};
    }

    // Handle error responses
    if (!response.ok) {
      let errorBody;
      try {
        errorBody = await response.json();
      } catch {
        const text = await response.text();
        errorBody = { message: text || `GitHub API error: ${response.statusCode}` };
      }

      throw mapResponseToError(response.statusCode, errorBody, response.headers);
    }

    // Parse successful response
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        return await response.json();
      } catch {
        const text = await response.text();
        return { data: text };
      }
    }

    // Non-JSON success response
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return { data: text };
    }
  }

  /**
   * Execute a raw GET request, returning the full Response object.
   * Used by pagination to access headers.
   * @param {string} path - API path or full URL
   * @returns {Promise<Response>} The raw fetch Response
   */
  async getRaw(path) {
    const url = this._buildUrl(path);
    const headers = this._buildHeaders();

    this.logger.debug(`GET (raw) ${url}`);

    const response = await httpRequest('GET', url, { headers });

    const rateLimitInfo = parseRateLimitHeaders(response.headers);
    if (rateLimitInfo) {
      this.lastRateLimit = rateLimitInfo;
      if (this.onRateLimit) {
        this.onRateLimit(rateLimitInfo);
      }
    }

    return response;
  }

  /**
   * Perform a GET request.
   * @param {string} path - API path
   * @param {Object} [options] - Request options (headers, params)
   * @returns {Promise<Object>} Parsed response
   */
  async get(path, options = {}) {
    return this._request('GET', path, options);
  }

  /**
   * Perform a POST request.
   * @param {string} path - API path
   * @param {Object} [body] - Request body
   * @param {Object} [options] - Request options (headers, params)
   * @returns {Promise<Object>} Parsed response
   */
  async post(path, body, options = {}) {
    return this._request('POST', path, { ...options, body });
  }

  /**
   * Perform a PUT request.
   * @param {string} path - API path
   * @param {Object} [body] - Request body
   * @param {Object} [options] - Request options (headers, params)
   * @returns {Promise<Object>} Parsed response
   */
  async put(path, body, options = {}) {
    return this._request('PUT', path, { ...options, body });
  }

  /**
   * Perform a PATCH request.
   * @param {string} path - API path
   * @param {Object} [body] - Request body
   * @param {Object} [options] - Request options (headers, params)
   * @returns {Promise<Object>} Parsed response
   */
  async patch(path, body, options = {}) {
    return this._request('PATCH', path, { ...options, body });
  }

  /**
   * Perform a DELETE request.
   * @param {string} path - API path
   * @param {Object} [options] - Request options (headers, params)
   * @returns {Promise<Object>} Parsed response
   */
  async delete(path, options = {}) {
    return this._request('DELETE', path, options);
  }

  /**
   * Get the current rate limit status from the GitHub API.
   * @returns {Promise<Object>} Rate limit information from GET /rate_limit
   */
  async getRateLimit() {
    return this.get('/rate_limit');
  }
}
