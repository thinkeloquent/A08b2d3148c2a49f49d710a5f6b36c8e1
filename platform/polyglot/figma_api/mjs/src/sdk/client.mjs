/**
 * Client Module — Figma API SDK
 *
 * Core HTTP client wrapping undici for Figma API communication.
 * Integrates rate limiting, caching, retry, and error mapping.
 */

import { request } from 'undici';
import { create } from '../logger.mjs';
import { DEFAULTS } from '../config.mjs';
import { resolveToken, maskToken } from './auth.mjs';
import { mapResponseToError, RateLimitError, NetworkError, TimeoutError } from './errors.mjs';
import { handleRateLimit, parseRateLimitHeaders } from './rate-limit.mjs';
import { RequestCache } from './cache.mjs';
import { withRetry, isRetryable, sleep } from './retry.mjs';

const log = create('figma-api', import.meta.url);

export function createLogger(name) {
  return create(name, '');
}

export class FigmaClient {
  /**
   * @param {object} options
   * @param {string} [options.token] - Figma API token
   * @param {string} [options.baseUrl] - Base API URL
   * @param {boolean} [options.rateLimitAutoWait] - Auto-wait on 429
   * @param {number} [options.rateLimitThreshold] - Reserved for future use
   * @param {Function} [options.onRateLimit] - Rate limit callback
   * @param {object} [options.logger] - Custom logger instance
   * @param {number} [options.timeout] - Request timeout in ms
   * @param {number} [options.maxRetries] - Max retry attempts
   * @param {object} [options.cache] - Cache options { maxSize, ttl }
   */
  constructor(options = {}) {
    const tokenInfo = resolveToken(options.token);
    this._token = tokenInfo.token;
    this._tokenSource = tokenInfo.source;
    this._baseUrl = (options.baseUrl || DEFAULTS.baseUrl).replace(/\/+$/, '');
    this._timeout = options.timeout || DEFAULTS.timeout;
    this._maxRetries = options.maxRetries ?? DEFAULTS.maxRetries;
    this._rateLimitAutoWait = options.rateLimitAutoWait ?? DEFAULTS.rateLimitAutoWait;
    this._rateLimitThreshold = options.rateLimitThreshold ?? DEFAULTS.rateLimitThreshold;
    this._maxRetryAfter = options.maxRetryAfter ?? DEFAULTS.maxRetryAfter ?? 60;
    this._onRateLimit = options.onRateLimit || null;
    this._logger = options.logger || log;
    this._cache = new RequestCache(options.cache || {});
    this._lastRateLimit = null;

    this._stats = {
      requestsMade: 0,
      requestsFailed: 0,
      cacheHits: 0,
      cacheMisses: 0,
      rateLimitHits: 0,
      rateLimitWaits: 0,
      rateLimitTotalWaitSeconds: 0,
    };

    this._logger.info('client initialized', {
      baseUrl: this._baseUrl,
      tokenSource: this._tokenSource,
      token: maskToken(this._token),
    });
  }

  get lastRateLimit() {
    return this._lastRateLimit;
  }

  get stats() {
    return { ...this._stats, cache: this._cache.stats };
  }

  _buildUrl(path, params) {
    const url = (path.startsWith('http://') || path.startsWith('https://')) ? path : `${this._baseUrl}${path}`;
    if (!params || Object.keys(params).length === 0) return url;
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    }
    return `${url}?${searchParams.toString()}`;
  }

  _buildHeaders() {
    return {
      'X-Figma-Token': this._token,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  _normalizeHeaders(rawHeaders) {
    const result = {};
    if (Array.isArray(rawHeaders)) {
      for (let i = 0; i < rawHeaders.length; i += 2) {
        result[rawHeaders[i].toLowerCase()] = rawHeaders[i + 1];
      }
    } else if (rawHeaders && typeof rawHeaders === 'object') {
      for (const [k, v] of Object.entries(rawHeaders)) {
        result[k.toLowerCase()] = v;
      }
    }
    return result;
  }

  async _request(method, path, { params, body, skipCache = false } = {}) {
    const url = this._buildUrl(path, params);
    const cacheKey = method === 'GET' ? url : null;

    // Check cache for GET requests
    if (cacheKey && !skipCache) {
      const cached = this._cache.get(cacheKey);
      if (cached !== undefined) {
        this._stats.cacheHits++;
        this._logger.debug('cache hit', { url });
        return cached;
      }
      this._stats.cacheMisses++;
    }

    this._stats.requestsMade++;
    this._logger.debug('request', { method, url: url.replace(this._baseUrl, '') });

    const result = await withRetry(
      async (attempt) => {
        const requestOptions = {
          method,
          headers: this._buildHeaders(),
          headersTimeout: this._timeout,
          bodyTimeout: this._timeout,
        };

        if (body && method !== 'GET') {
          requestOptions.body = JSON.stringify(body);
        }

        let response;
        try {
          response = await request(url, requestOptions);
        } catch (err) {
          if (err.code === 'UND_ERR_CONNECT_TIMEOUT' || err.code === 'UND_ERR_BODY_TIMEOUT') {
            throw new TimeoutError(`Request timed out: ${method} ${path}`, { url, method });
          }
          throw new NetworkError(`Network error: ${err.message}`, { url, method, cause: err.message });
        }

        const { statusCode, headers: rawHeaders, body: responseBody } = response;
        const headers = this._normalizeHeaders(rawHeaders);
        const text = await responseBody.text();

        // Handle 429 rate limit
        if (statusCode === 429) {
          const rateLimitInfo = parseRateLimitHeaders(headers);
          this._lastRateLimit = rateLimitInfo;
          this._stats.rateLimitHits++;

          const { retry } = await handleRateLimit(headers, {
            rateLimitAutoWait: this._rateLimitAutoWait,
            maxRetryAfter: this._maxRetryAfter,
            onRateLimit: this._onRateLimit,
          });

          if (!retry) {
            throw new RateLimitError('Rate limit exceeded', { rateLimitInfo });
          }

          // Auto-wait happened — track actual wait
          this._stats.rateLimitWaits++;
          this._stats.rateLimitTotalWaitSeconds += rateLimitInfo.retryAfter;

          // Retry by throwing a retryable error
          const err = new RateLimitError('Rate limit exceeded (retrying)', { rateLimitInfo });
          err.status = 429;
          throw err;
        }

        if (statusCode >= 400) {
          this._stats.requestsFailed++;
          let parsedBody;
          try { parsedBody = JSON.parse(text); } catch { parsedBody = text; }
          throw mapResponseToError(statusCode, parsedBody, headers);
        }

        let data;
        try { data = text ? JSON.parse(text) : {}; } catch { data = text; }

        this._logger.debug('response', { status: statusCode, url: url.replace(this._baseUrl, '') });
        return data;
      },
      { maxRetries: this._maxRetries }
    );

    // Cache GET responses
    if (cacheKey) {
      this._cache.set(cacheKey, result);
    }

    return result;
  }

  async get(path, { params } = {}) {
    return this._request('GET', path, { params });
  }

  async post(path, body, options = {}) {
    return this._request('POST', path, { body, ...options });
  }

  async put(path, body, options = {}) {
    return this._request('PUT', path, { body, ...options });
  }

  async patch(path, body, options = {}) {
    return this._request('PATCH', path, { body, ...options });
  }

  async delete(path, options = {}) {
    return this._request('DELETE', path, options);
  }

  async getRaw(path, { params } = {}) {
    const url = this._buildUrl(path, params);
    this._stats.requestsMade++;

    const response = await request(url, {
      method: 'GET',
      headers: this._buildHeaders(),
      headersTimeout: this._timeout,
      bodyTimeout: this._timeout,
    });

    return {
      statusCode: response.statusCode,
      headers: this._normalizeHeaders(response.headers),
      body: response.body,
    };
  }
}
