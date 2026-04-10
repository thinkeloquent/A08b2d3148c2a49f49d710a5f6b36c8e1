/**
 * Client Module — Sauce Labs API Client
 *
 * Core HTTP client for the Sauce Labs REST API.
 * Handles authentication (HTTP Basic Auth), rate limiting,
 * error mapping, and structured logging using native Node.js 20+ fetch.
 *
 * Authentication: HTTP Basic Auth (username:access_key)
 * Rate limits: ~10 req/sec, ~3,500/hour. HTTP 429 + Retry-After.
 */

import { create } from './logger.mjs';
import { createErrorFromResponse } from './errors.mjs';
import { RateLimiter } from './rate-limiter.mjs';
import { resolveConfig } from './config.mjs';
import { DEFAULT_MAX_RETRIES } from './types.mjs';

const log = create('saucelabs-api', import.meta.url);

/**
 * Normalize a Headers object into a plain lowercase-key object.
 * @param {Headers|object} headers
 * @returns {Object<string, string>}
 */
function _normalizeHeaders(headers) {
  const result = {};
  if (headers && typeof headers.forEach === 'function') {
    headers.forEach((value, key) => { result[key.toLowerCase()] = value; });
  } else if (headers && typeof headers === 'object') {
    for (const [k, v] of Object.entries(headers)) { result[k.toLowerCase()] = v; }
  }
  return result;
}

/**
 * Encode username:password for HTTP Basic Auth.
 * @param {string} username
 * @param {string} accessKey
 * @returns {string} Base64-encoded credentials
 */
function _encodeBasicAuth(username, accessKey) {
  return Buffer.from(`${username}:${accessKey}`).toString('base64');
}

/**
 * Core HTTP client for the Sauce Labs REST API.
 *
 * Provides typed HTTP methods (get, post, put, patch, delete) with:
 *   - Automatic Basic Auth header injection
 *   - Rate limit handling with auto-wait + exponential backoff
 *   - Error mapping to typed SaucelabsError subclasses
 *   - Request timeout via AbortSignal.timeout()
 *   - Structured debug/error logging
 */
export class SaucelabsClient {
  /**
   * @param {import('./types.mjs').SaucelabsClientOptions} [options={}]
   */
  constructor(options = {}) {
    const config = resolveConfig(options);

    this._username = config.username;
    this._apiKey = config.apiKey;
    this._baseUrl = config.baseUrl;
    this._mobileBaseUrl = config.mobileBaseUrl;
    this._timeout = config.timeout;
    this._proxy = config.proxy;
    this._verifySsl = config.verifySsl;
    this._logger = config.logger || log;

    this._rateLimiter = new RateLimiter({
      autoWait: config.rateLimitAutoWait,
      maxRetries: DEFAULT_MAX_RETRIES,
      onRateLimit: config.onRateLimit,
      logger: this._logger,
    });

    this._logger.info('client initialized', {
      baseUrl: this._baseUrl,
      mobileBaseUrl: this._mobileBaseUrl,
      timeout: this._timeout,
      hasUsername: !!this._username,
      hasApiKey: !!this._apiKey,
    });
  }

  /** @type {string} The configured username. */
  get username() { return this._username; }

  /** @type {import('./types.mjs').RateLimitInfo|null} */
  get lastRateLimit() { return this._rateLimiter.lastRateLimit; }

  _buildUrl(path, { mobile = false } = {}) {
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const base = mobile ? this._mobileBaseUrl : this._baseUrl;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  }

  _buildHeaders({ mobile = false, contentType = 'application/json' } = {}) {
    const headers = { 'Accept': 'application/json' };
    if (contentType) headers['Content-Type'] = contentType;
    if (this._username && this._apiKey) {
      headers['Authorization'] = `Basic ${_encodeBasicAuth(this._username, this._apiKey)}`;
    }
    return headers;
  }

  /**
   * Execute an HTTP request to the Sauce Labs API.
   *
   * @param {string} method - HTTP method
   * @param {string} path - API path
   * @param {object} [options={}]
   * @returns {Promise<*>} Parsed response body
   */
  async _request(method, path, options = {}) {
    const {
      body, headers: extraHeaders, params, timeout,
      mobile = false, contentType, _retryCount = 0,
    } = options;

    let url = this._buildUrl(path, { mobile });
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

    const headers = { ...this._buildHeaders({ mobile, contentType }), ...extraHeaders };
    const fetchOptions = {
      method,
      headers,
      signal: AbortSignal.timeout(timeout || this._timeout),
    };

    if (body !== undefined && body !== null && method !== 'GET') {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    this._logger.debug(`${method} ${url}`, { retryCount: _retryCount || undefined });

    const startMs = Date.now();
    let response;
    try {
      response = await fetch(url, fetchOptions);
    } catch (err) {
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        this._logger.error(`request timed out: ${method} ${path}`, { timeout: timeout || this._timeout });
      }
      throw err;
    }

    const latencyMs = Date.now() - startMs;
    this._logger.debug('response received', { status: response.status, method, path, latencyMs });

    // Handle HTTP 429
    if (response.status === 429) {
      return this._rateLimiter.handleResponse(
        response,
        () => this._request(method, path, { ...options, _retryCount: _retryCount + 1 }),
        _retryCount,
      );
    }

    // Handle 204 No Content
    if (response.status === 204) return {};

    // Handle error responses
    if (!response.ok) {
      let errorBody;
      try { errorBody = await response.json(); } catch {
        const text = await response.text();
        errorBody = { message: text || `Sauce Labs API error: ${response.status}` };
      }
      const normalizedHeaders = _normalizeHeaders(response.headers);
      const error = createErrorFromResponse(response.status, errorBody, normalizedHeaders);
      error.endpoint = path;
      error.method = method;
      this._logger.error(`API error: ${error.message}`, { statusCode: response.status, method, path, latencyMs });
      throw error;
    }

    // Parse successful response
    const ct = response.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      try { return await response.json(); } catch {
        return { data: await response.text() };
      }
    }

    const text = await response.text();
    try { return JSON.parse(text); } catch { return { data: text }; }
  }

  async get(path, options = {}) {
    return this._request('GET', path, options);
  }

  async post(path, body, options = {}) {
    return this._request('POST', path, { ...options, body });
  }

  async put(path, body, options = {}) {
    return this._request('PUT', path, { ...options, body });
  }

  async patch(path, body, options = {}) {
    return this._request('PATCH', path, { ...options, body });
  }

  async delete(path, options = {}) {
    return this._request('DELETE', path, options);
  }

  async getRaw(path, options = {}) {
    const { headers: extraHeaders, params, timeout, mobile = false } = options;
    let url = this._buildUrl(path, { mobile });
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) searchParams.set(key, String(value));
      }
      url = `${url}${url.includes('?') ? '&' : '?'}${searchParams.toString()}`;
    }
    const headers = { ...this._buildHeaders({ mobile }), ...extraHeaders };
    this._logger.debug(`GET (raw) ${url}`);
    return fetch(url, {
      method: 'GET', headers,
      signal: AbortSignal.timeout(timeout || this._timeout),
    });
  }

  close() {
    this._logger.debug('client closed');
  }
}
