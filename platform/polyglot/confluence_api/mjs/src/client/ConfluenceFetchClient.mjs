/**
 * @module client/ConfluenceFetchClient
 * @description Confluence Data Center REST API v9.2.3 fetch client.
 *
 * Wraps the generic FetchClient with Confluence-specific concerns:
 * - Base URL management and path interpolation (`{key}` replacement)
 * - Query parameter serialization (including array params)
 * - Basic Auth header construction (username + API token)
 * - Automatic rate-limit handling (429 + Retry-After)
 * - Exponential backoff retry on 5xx errors
 * - Debug/error logging of all requests
 * - Convenience methods: get, post, put, delete, patch, getRaw
 *
 * @example
 * import { ConfluenceFetchClient } from './ConfluenceFetchClient.mjs';
 *
 * const client = new ConfluenceFetchClient({
 *   baseUrl: 'https://confluence.example.com',
 *   username: 'admin',
 *   apiToken: 'your-api-token',
 *   timeoutMs: 30_000,
 *   rateLimitAutoWait: true,
 *   maxRetries: 3,
 * });
 *
 * const space = await client.get('/rest/api/space/DEV');
 * const content = await client.post('/rest/api/content', { ... });
 */

import { FetchClient } from './FetchClient.mjs';
import { UndiciFetchAdapter } from '../adapters/UndiciFetchAdapter.mjs';
import {
  ConfluenceConfigurationError,
  ConfluenceRateLimitError,
  ConfluenceServerError,
  ConfluenceApiError,
} from '../errors.mjs';
import { createLogger, nullLogger } from '../logger.mjs';

const _defaultLog = createLogger('confluence-api', import.meta.url);

/**
 * @typedef {Object} ConfluenceClientOptions
 * @property {string} baseUrl - Confluence Data Center base URL (e.g. https://confluence.example.com).
 * @property {string} username - Username for Basic Auth.
 * @property {string} apiToken - API token or password for Basic Auth.
 * @property {number} [timeoutMs=30000] - Request timeout in milliseconds.
 * @property {boolean} [rateLimitAutoWait=true] - Automatically wait and retry on 429.
 * @property {number} [maxRetries=3] - Maximum retries on 5xx errors.
 * @property {Object} [logger] - Custom logger instance (must have trace/debug/info/warn/error).
 * @property {Object} [fetchClientOptions] - Additional options passed to FetchClient.
 */

/**
 * @typedef {Object} ConfluenceRequestConfig
 * @property {string} method - HTTP method (GET, POST, PUT, DELETE, PATCH).
 * @property {string} path - API path with optional `{key}` placeholders.
 * @property {Record<string, string>} [pathParams] - Values for `{key}` placeholders.
 * @property {Record<string, unknown>} [queryParams] - Query string parameters.
 * @property {unknown} [body] - Request body (will be JSON-serialized).
 * @property {Record<string, string>} [headers] - Additional request headers.
 */

/**
 * Confluence Data Center REST API fetch client.
 *
 * Handles authentication, URL construction, rate-limiting, retries, and logging
 * for all Confluence REST API requests.
 */
export class ConfluenceFetchClient {
  /**
   * Create a new ConfluenceFetchClient instance.
   *
   * @param {ConfluenceClientOptions} options - Client configuration.
   * @throws {ConfluenceConfigurationError} If required options (baseUrl, username, apiToken) are missing.
   */
  constructor(options) {
    if (!options.baseUrl) {
      throw new ConfluenceConfigurationError('baseUrl is required');
    }
    if (!options.username) {
      throw new ConfluenceConfigurationError('username is required');
    }
    if (!options.apiToken) {
      throw new ConfluenceConfigurationError('apiToken is required');
    }

    /** @private @type {string} */
    this._baseUrl = options.baseUrl.replace(/\/$/, '');
    /** @private @type {string} */
    this._username = options.username;
    /** @private @type {string} */
    this._apiToken = options.apiToken;
    /** @private @type {string} */
    this._authHeader =
      'Basic ' +
      Buffer.from(`${options.username}:${options.apiToken}`).toString('base64');
    /** @private @type {boolean} */
    this._rateLimitAutoWait = options.rateLimitAutoWait ?? true;
    /** @private @type {number} */
    this._maxRetries = options.maxRetries ?? 3;
    /** @private @type {number} */
    this._timeoutMs = options.timeoutMs ?? 30_000;
    /** @private */
    this._log = options.logger || _defaultLog;

    /**
     * Timestamp and details of the most recent rate-limit response.
     * Useful for monitoring and diagnostics.
     * @type {{ timestamp: string, retryAfter: number|undefined, url: string|undefined }|null}
     */
    this.lastRateLimit = null;

    const fetchOpts = {
      fetchAdapter: new UndiciFetchAdapter(),
      timeoutMs: this._timeoutMs,
      ...options.fetchClientOptions,
    };

    /** @private @type {FetchClient} */
    this._fetchClient = new FetchClient(fetchOpts);

    this._log.debug('ConfluenceFetchClient initialized', {
      baseUrl: this._baseUrl,
    });
  }

  /**
   * Execute a Confluence API request with full URL construction, auth, and error handling.
   *
   * Handles:
   * - Path parameter interpolation (`{key}` replacement)
   * - Query string serialization
   * - Basic Auth header
   * - Rate-limit auto-wait (429 + Retry-After)
   * - Exponential backoff retry on 5xx errors
   *
   * @template T
   * @param {ConfluenceRequestConfig} config - Request configuration.
   * @returns {Promise<T>} Parsed response data.
   * @throws {ConfluenceApiError} On any API error.
   */
  async request(config) {
    const url = this._buildUrl(config);
    const headers = this._buildHeaders(config);
    const init = {
      method: config.method,
      headers,
    };

    // Attach body for non-GET requests
    if (config.body !== undefined && config.method !== 'GET') {
      // If the body is FormData, let the runtime set Content-Type with boundary
      if (config.body instanceof FormData) {
        init.body = config.body;
        // Remove Content-Type so the browser/runtime sets multipart boundary
        delete init.headers['Content-Type'];
      } else {
        init.body = JSON.stringify(config.body);
      }
    }

    this._log.debug('request', {
      method: config.method,
      url,
    });

    return this._executeWithRetry(url, init, 0);
  }

  /**
   * Execute a request with rate-limit and 5xx retry logic.
   *
   * @template T
   * @param {string} url - Full request URL.
   * @param {RequestInit} init - Fetch init options.
   * @param {number} attempt - Current attempt number (0-based).
   * @returns {Promise<T>}
   * @private
   */
  async _executeWithRetry(url, init, attempt) {
    try {
      return await this._fetchClient.request(url, init);
    } catch (error) {
      // Handle rate limiting (429)
      if (
        error instanceof ConfluenceRateLimitError &&
        this._rateLimitAutoWait
      ) {
        const retryAfter = error.retryAfter ?? 5;
        this.lastRateLimit = {
          timestamp: new Date().toISOString(),
          retryAfter,
          url,
        };
        this._log.warn('rate limited, waiting before retry', {
          retryAfter,
          url,
          attempt,
        });
        await this._sleep(retryAfter * 1000);
        return this._executeWithRetry(url, init, attempt + 1);
      }

      // Handle 5xx server errors with exponential backoff
      if (
        error instanceof ConfluenceServerError &&
        attempt < this._maxRetries
      ) {
        const backoffMs = Math.min(1000 * 2 ** attempt, 30_000);
        this._log.warn('server error, retrying with backoff', {
          status: error.status,
          url,
          attempt,
          backoffMs,
        });
        await this._sleep(backoffMs);
        return this._executeWithRetry(url, init, attempt + 1);
      }

      // Log and re-throw all other errors
      if (error instanceof ConfluenceApiError) {
        this._log.error('request failed', {
          method: init.method,
          url,
          status: error.status,
          code: error.code,
          message: error.message,
        });
      }

      throw error;
    }
  }

  /**
   * Build a fully-qualified URL from the base URL, path, path parameters, and query parameters.
   *
   * Path parameters are interpolated by replacing `{key}` placeholders with
   * URI-encoded values. Unresolved placeholders trigger a configuration error.
   *
   * Query parameters are serialized to a query string. Array values are expanded
   * to multiple key=value pairs. Undefined values are silently omitted.
   *
   * @param {ConfluenceRequestConfig} config - Request configuration.
   * @returns {string} Fully-qualified URL string.
   * @throws {ConfluenceConfigurationError} If path params are missing or path contains unresolved placeholders.
   * @private
   */
  _buildUrl(config) {
    let path = config.path;

    // Interpolate path parameters
    if (config.pathParams) {
      for (const [key, value] of Object.entries(config.pathParams)) {
        const placeholder = `{${key}}`;
        if (!path.includes(placeholder)) {
          throw new ConfluenceConfigurationError(
            `Path parameter "${key}" not found in path: ${path}`,
          );
        }
        path = path.replace(placeholder, encodeURIComponent(String(value)));
      }
    }

    // Verify no unresolved placeholders remain
    const remaining = path.match(/\{[^}]+\}/g);
    if (remaining) {
      throw new ConfluenceConfigurationError(
        `Missing path parameters: ${remaining.join(', ')}`,
      );
    }

    let url = `${this._baseUrl}${path}`;

    // Serialize query parameters
    if (config.queryParams) {
      const parts = [];
      for (const [key, value] of Object.entries(config.queryParams)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
          for (const item of value) {
            parts.push(
              `${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`,
            );
          }
        } else {
          parts.push(
            `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
          );
        }
      }
      if (parts.length > 0) url += `?${parts.join('&')}`;
    }

    return url;
  }

  /**
   * Build request headers including Content-Type, Accept, and Basic Auth.
   *
   * Custom headers from the request config override defaults. The Authorization
   * header is always set unless explicitly overridden.
   *
   * @param {ConfluenceRequestConfig} config - Request configuration.
   * @returns {Record<string, string>} Merged headers object.
   * @private
   */
  _buildHeaders(config) {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: this._authHeader,
      ...config.headers,
    };
  }

  /**
   * Convenience: GET request.
   *
   * @template T
   * @param {string} path - API path (e.g. '/rest/api/content/12345').
   * @param {Omit<ConfluenceRequestConfig, 'method'|'path'>} [opts={}] - Additional options.
   * @returns {Promise<T>} Parsed response data.
   */
  async get(path, opts = {}) {
    return this.request({ ...opts, method: 'GET', path });
  }

  /**
   * Convenience: POST request.
   *
   * @template T
   * @param {string} path - API path.
   * @param {unknown} body - Request body.
   * @param {Omit<ConfluenceRequestConfig, 'method'|'path'|'body'>} [opts={}] - Additional options.
   * @returns {Promise<T>} Parsed response data.
   */
  async post(path, body, opts = {}) {
    return this.request({ ...opts, method: 'POST', path, body });
  }

  /**
   * Convenience: PUT request.
   *
   * @template T
   * @param {string} path - API path.
   * @param {unknown} body - Request body.
   * @param {Omit<ConfluenceRequestConfig, 'method'|'path'|'body'>} [opts={}] - Additional options.
   * @returns {Promise<T>} Parsed response data.
   */
  async put(path, body, opts = {}) {
    return this.request({ ...opts, method: 'PUT', path, body });
  }

  /**
   * Convenience: DELETE request.
   *
   * @template T
   * @param {string} path - API path.
   * @param {Omit<ConfluenceRequestConfig, 'method'|'path'>} [opts={}] - Additional options.
   * @returns {Promise<T>} Parsed response data.
   */
  async delete(path, opts = {}) {
    return this.request({ ...opts, method: 'DELETE', path });
  }

  /**
   * Convenience: PATCH request.
   *
   * @template T
   * @param {string} path - API path.
   * @param {unknown} body - Request body.
   * @param {Omit<ConfluenceRequestConfig, 'method'|'path'|'body'>} [opts={}] - Additional options.
   * @returns {Promise<T>} Parsed response data.
   */
  async patch(path, body, opts = {}) {
    return this.request({ ...opts, method: 'PATCH', path, body });
  }

  /**
   * Execute a GET request and return the raw Response object instead of parsed data.
   *
   * Useful for binary downloads, streaming responses, or when you need access to
   * response headers. Bypasses the normal JSON parsing and error-mapping pipeline
   * of the FetchClient — you must handle non-OK statuses yourself.
   *
   * @param {string} path - API path.
   * @param {Omit<ConfluenceRequestConfig, 'method'|'path'>} [opts={}] - Additional options.
   * @returns {Promise<Response>} The raw fetch Response object.
   * @throws {ConfluenceConfigurationError} If path parameters are invalid.
   */
  async getRaw(path, opts = {}) {
    const config = { ...opts, method: 'GET', path };
    const url = this._buildUrl(config);
    const headers = this._buildHeaders(config);

    const adapter = new UndiciFetchAdapter();
    const response = await adapter.fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => undefined);
      let parsed;
      try {
        parsed = body ? JSON.parse(body) : undefined;
      } catch {
        parsed = undefined;
      }
      const { createErrorFromResponse } = await import('../errors.mjs');
      throw createErrorFromResponse(response.status, parsed, url, 'GET', {
        retryAfter:
          Number(response.headers.get('retry-after')) || undefined,
      });
    }

    return response;
  }

  /**
   * Sleep for the specified duration.
   *
   * @param {number} ms - Duration in milliseconds.
   * @returns {Promise<void>}
   * @private
   */
  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
