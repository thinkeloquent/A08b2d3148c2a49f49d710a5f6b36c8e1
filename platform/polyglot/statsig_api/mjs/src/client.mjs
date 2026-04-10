/**
 * Client Module — Statsig Console API Client
 *
 * Core HTTP client for the Statsig Console API (v1).
 * Handles authentication, rate limiting, error mapping, pagination,
 * and structured logging using native Node.js 20+ fetch.
 *
 * Authentication: STATSIG-API-KEY custom header.
 * Rate limits: ~100 req/10s, ~900 req/15min. HTTP 429 + Retry-After.
 *
 * @module client
 */

import { create } from './logger.mjs';
import { createErrorFromResponse } from './errors.mjs';
import { RateLimiter } from './rate-limiter.mjs';
import { listAll } from './pagination.mjs';
import { DEFAULT_BASE_URL, DEFAULT_TIMEOUT, DEFAULT_MAX_RETRIES } from './types.mjs';
import { resolveStatsigEnv } from '@internal/env-resolver';

const log = create('statsig-api', import.meta.url);

/**
 * Normalize a Headers object (from fetch Response) into a plain lowercase-key object.
 *
 * @param {Headers|object} headers - Response headers
 * @returns {Object<string, string>} Plain object with lowercase keys
 */
function _normalizeHeaders(headers) {
  const result = {};
  if (headers && typeof headers.forEach === 'function') {
    headers.forEach((value, key) => {
      result[key.toLowerCase()] = value;
    });
  } else if (headers && typeof headers === 'object') {
    for (const [k, v] of Object.entries(headers)) {
      result[k.toLowerCase()] = v;
    }
  }
  return result;
}

/**
 * Core HTTP client for the Statsig Console API.
 *
 * Provides typed HTTP methods (get, post, put, patch, delete) with:
 *   - Automatic STATSIG-API-KEY header injection
 *   - Rate limit handling with auto-wait + retry
 *   - Error mapping to typed StatsigError subclasses
 *   - Request timeout via AbortSignal.timeout()
 *   - Structured debug/error logging
 *   - Auto-pagination support via `list()` method
 *
 * Domain modules (experiments, gates, etc.) are registered after construction
 * and delegate their HTTP calls back to this client.
 *
 * @example
 * import { StatsigClient } from './client.mjs';
 *
 * const client = new StatsigClient({ apiKey: 'console-xxx' });
 * const experiments = await client.get('/experiments');
 * const gates = await client.list('/gates');
 * client.close();
 */
export class StatsigClient {
  /**
   * @param {import('./types.mjs').StatsigClientOptions} [options={}]
   */
  constructor(options = {}) {
    const {
      apiKey,
      baseUrl = DEFAULT_BASE_URL,
      rateLimitAutoWait = true,
      rateLimitThreshold = 0,
      onRateLimit = null,
      logger = null,
      timeout = DEFAULT_TIMEOUT,
      proxy = null,
      verifySsl = true,
    } = options;

    /** @type {string} */
    this._apiKey = apiKey || resolveStatsigEnv().apiKey || '';

    /** @type {string} */
    this._baseUrl = baseUrl.replace(/\/+$/, '');

    /** @type {number} */
    this._timeout = timeout;

    /** @type {number} */
    this._rateLimitThreshold = rateLimitThreshold;

    /** @type {string|null} */
    this._proxy = proxy;

    /** @type {boolean} */
    this._verifySsl = verifySsl;

    /** @type {object} */
    this._logger = logger || log;

    /** @type {RateLimiter} */
    this._rateLimiter = new RateLimiter({
      autoWait: rateLimitAutoWait,
      maxRetries: DEFAULT_MAX_RETRIES,
      onRateLimit,
      logger: this._logger,
    });

    this._logger.info('client initialized', {
      baseUrl: this._baseUrl,
      timeout: this._timeout,
      rateLimitAutoWait,
      hasApiKey: !!this._apiKey,
    });
  }

  /**
   * The most recent rate limit event info, or null if no 429 has been received.
   * Delegates to the internal RateLimiter instance.
   *
   * @type {import('./types.mjs').RateLimitInfo|null}
   */
  get lastRateLimit() {
    return this._rateLimiter.lastRateLimit;
  }

  /**
   * Build the full URL for a request.
   * If the path is already an absolute URL (starts with http), it is returned as-is.
   * Otherwise, it is joined to the base URL.
   *
   * @param {string} path - API path (e.g. "/experiments") or full URL
   * @returns {string} Full URL
   */
  _buildUrl(path) {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${this._baseUrl}${cleanPath}`;
  }

  /**
   * Build default request headers.
   * Includes the STATSIG-API-KEY, Content-Type, and Accept headers.
   *
   * @returns {Object<string, string>} Headers object
   */
  _buildHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (this._apiKey) {
      headers['STATSIG-API-KEY'] = this._apiKey;
    }

    return headers;
  }

  /**
   * Execute an HTTP request to the Statsig Console API.
   *
   * Handles:
   *   - URL construction and query parameter serialization
   *   - Header merging (defaults + custom)
   *   - Request body JSON serialization
   *   - Timeout via AbortSignal.timeout()
   *   - HTTP 429 rate limit handling (delegates to RateLimiter)
   *   - Error response mapping to typed StatsigError subclasses
   *   - JSON response parsing
   *
   * @param {string} method - HTTP method (GET, POST, PUT, PATCH, DELETE)
   * @param {string} path - API path or full URL
   * @param {object} [options={}]
   * @param {object} [options.body] - Request body (will be JSON-serialized)
   * @param {Object<string, string>} [options.headers] - Additional request headers
   * @param {Object<string, string|number|boolean>} [options.params] - URL query parameters
   * @param {number} [options.timeout] - Per-request timeout override (ms)
   * @param {number} [options._retryCount=0] - Internal retry counter (used by rate limiter)
   * @returns {Promise<*>} Parsed response body
   * @throws {import('./errors.mjs').StatsigError} On any non-2xx response
   */
  async _request(method, path, options = {}) {
    const { body, headers: extraHeaders, params, timeout, _retryCount = 0 } = options;

    // Build URL with query parameters
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

    // Merge headers
    const headers = { ...this._buildHeaders(), ...extraHeaders };

    // Build fetch options
    const fetchOptions = {
      method,
      headers,
      signal: AbortSignal.timeout(timeout || this._timeout),
    };

    if (body !== undefined && body !== null && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    this._logger.debug(`${method} ${url}`, { retryCount: _retryCount || undefined });

    // Execute request
    let response;
    try {
      response = await fetch(url, fetchOptions);
    } catch (err) {
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        this._logger.error(`request timed out: ${method} ${path}`, {
          timeout: timeout || this._timeout,
        });
      }
      throw err;
    }

    this._logger.debug(`response received`, {
      status: response.status,
      method,
      path: (path.startsWith('http://') || path.startsWith('https://')) ? undefined : path,
    });

    // Handle HTTP 429 — delegate to rate limiter
    if (response.status === 429) {
      return this._rateLimiter.handleResponse(
        response,
        () => this._request(method, path, { ...options, _retryCount: _retryCount + 1 }),
        _retryCount,
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {};
    }

    // Handle error responses (non-2xx, non-429)
    if (!response.ok) {
      let errorBody;
      try {
        errorBody = await response.json();
      } catch {
        const text = await response.text();
        errorBody = { message: text || `Statsig API error: ${response.status}` };
      }

      const normalizedHeaders = _normalizeHeaders(response.headers);
      const error = createErrorFromResponse(response.status, errorBody, normalizedHeaders);
      this._logger.error(`API error: ${error.message}`, {
        statusCode: response.status,
        method,
        path,
      });
      throw error;
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

    // Non-JSON success response — try parsing as JSON anyway, fall back to text
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return { data: text };
    }
  }

  /**
   * Perform a GET request.
   *
   * @param {string} path - API path (e.g. "/experiments")
   * @param {import('./types.mjs').RequestOptions} [options={}] - Request options
   * @returns {Promise<*>} Parsed response body
   */
  async get(path, options = {}) {
    return this._request('GET', path, options);
  }

  /**
   * Perform a POST request.
   *
   * @param {string} path - API path
   * @param {object} [body] - Request body
   * @param {import('./types.mjs').RequestOptions} [options={}] - Request options
   * @returns {Promise<*>} Parsed response body
   */
  async post(path, body, options = {}) {
    return this._request('POST', path, { ...options, body });
  }

  /**
   * Perform a PUT request.
   *
   * @param {string} path - API path
   * @param {object} [body] - Request body
   * @param {import('./types.mjs').RequestOptions} [options={}] - Request options
   * @returns {Promise<*>} Parsed response body
   */
  async put(path, body, options = {}) {
    return this._request('PUT', path, { ...options, body });
  }

  /**
   * Perform a PATCH request.
   *
   * @param {string} path - API path
   * @param {object} [body] - Request body
   * @param {import('./types.mjs').RequestOptions} [options={}] - Request options
   * @returns {Promise<*>} Parsed response body
   */
  async patch(path, body, options = {}) {
    return this._request('PATCH', path, { ...options, body });
  }

  /**
   * Perform a DELETE request.
   *
   * @param {string} path - API path
   * @param {import('./types.mjs').RequestOptions} [options={}] - Request options
   * @returns {Promise<*>} Parsed response body
   */
  async delete(path, options = {}) {
    return this._request('DELETE', path, options);
  }

  /**
   * Perform a raw GET request, returning the full fetch Response object.
   * Useful when you need access to response headers or status directly.
   *
   * @param {string} path - API path or full URL
   * @param {import('./types.mjs').RequestOptions} [options={}] - Request options
   * @returns {Promise<Response>} The raw fetch Response
   */
  async getRaw(path, options = {}) {
    const { headers: extraHeaders, params, timeout } = options;

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
    this._logger.debug(`GET (raw) ${url}`);

    return fetch(url, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(timeout || this._timeout),
    });
  }

  /**
   * List all items from a paginated endpoint.
   * Automatically follows `pagination.nextPage` URLs and collects
   * all `data` arrays into a single flat result array.
   *
   * @param {string} path - API path (e.g. "/experiments")
   * @param {import('./types.mjs').RequestOptions} [options={}] - Request options
   * @returns {Promise<Array<*>>} All items across all pages
   *
   * @example
   * const allGates = await client.list('/gates');
   */
  async list(path, options = {}) {
    return listAll(this, path, options);
  }

  /**
   * Close the client and release resources.
   * This is a no-op for native fetch but follows the convention
   * established by other API clients in the SDK ecosystem.
   * Safe to call multiple times.
   */
  close() {
    this._logger.debug('client closed');
  }
}
