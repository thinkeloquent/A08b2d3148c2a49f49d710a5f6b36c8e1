/**
 * @module sdk/client
 * @description SDK client for interacting with the Confluence API REST proxy server.
 *
 * Communicates with the REST proxy (Fastify or FastAPI) rather than Confluence
 * Data Center directly. Provides typed methods for all proxied Confluence API endpoints.
 *
 * @example
 * import { ConfluenceSdkClient } from './sdk/client.mjs';
 *
 * const sdk = new ConfluenceSdkClient({
 *   baseUrl: 'http://localhost:3000/~/api/rest/2025-01-01/providers/confluence_api',
 * });
 *
 * const info = await sdk.serverInfo();
 * const spaces = await sdk.getSpaces();
 * const results = await sdk.search('type = "page" AND space = "DEV"');
 */

import { SDKError } from '../errors.mjs';
import { createLogger } from '../logger.mjs';

const log = createLogger('confluence-api', import.meta.url);

/**
 * SDK client for interacting with the Confluence API REST proxy server.
 */
export class ConfluenceSdkClient {
  /**
   * @param {Object} opts - Client options.
   * @param {string} opts.baseUrl - Base URL of the Confluence API proxy server.
   * @param {string} [opts.apiKey] - Optional API key for authentication.
   * @param {number} [opts.timeoutMs=30000] - Request timeout in milliseconds.
   * @param {Object} [opts.logger] - Optional custom logger.
   */
  constructor({ baseUrl, apiKey, timeoutMs = 30_000, logger } = {}) {
    this._baseUrl = baseUrl.replace(/\/$/, '');
    this._apiKey = apiKey;
    this._timeoutMs = timeoutMs;
    this._log = logger || log;
    this._headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (apiKey) {
      this._headers.Authorization = `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`;
    }
  }

  /**
   * Execute an HTTP request against the proxy server.
   *
   * @param {string} method - HTTP method.
   * @param {string} endpoint - URL path relative to baseUrl.
   * @param {Object} [opts={}] - Additional options.
   * @param {Record<string, string>} [opts.params] - Query parameters.
   * @param {unknown} [opts.body] - Request body (JSON-serialized).
   * @returns {Promise<unknown>} Parsed response data.
   */
  async _request(method, endpoint, opts = {}) {
    let url = `${this._baseUrl}/${endpoint.replace(/^\//, '')}`;
    if (opts.params) {
      const qs = new URLSearchParams(opts.params).toString();
      if (qs) url += `?${qs}`;
    }

    const init = {
      method,
      headers: { ...this._headers },
      signal: AbortSignal.timeout(this._timeoutMs),
    };
    if (opts.body !== undefined) {
      init.body = JSON.stringify(opts.body);
    }

    const response = await fetch(url, init);

    if (response.status >= 400) {
      let detail = `HTTP ${response.status}`;
      try {
        const data = await response.json();
        if (data.detail) detail = data.detail;
        if (data.message) detail = data.message;
      } catch { /* ignore */ }
      throw new SDKError(detail, { status: response.status });
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {};
    }

    return response.json();
  }

  // -- Health -----------------------------------------------------------------

  /** Check the health of the proxy server. */
  async healthCheck() {
    return this._request('GET', 'health');
  }

  // -- Content ----------------------------------------------------------------

  /** @returns {ContentProxy} */
  get content() {
    if (!this._contentProxy) this._contentProxy = new ContentProxy(this);
    return this._contentProxy;
  }

  /** @returns {SpaceProxy} */
  get space() {
    if (!this._spaceProxy) this._spaceProxy = new SpaceProxy(this);
    return this._spaceProxy;
  }

  /** @returns {SearchProxy} */
  get search() {
    if (!this._searchProxy) this._searchProxy = new SearchProxy(this);
    return this._searchProxy;
  }

  /** @returns {UserProxy} */
  get user() {
    if (!this._userProxy) this._userProxy = new UserProxy(this);
    return this._userProxy;
  }

  // -- Direct convenience methods ---------------------------------------------

  /**
   * Retrieve a single piece of content by ID.
   * @param {string} contentId
   * @param {{ expand?: string }} [opts={}]
   */
  async getContent(contentId, { expand } = {}) {
    const params = {};
    if (expand) params.expand = expand;
    return this._request('GET', `v9/content/${encodeURIComponent(contentId)}`, {
      params: Object.keys(params).length > 0 ? params : undefined,
    });
  }

  /**
   * Retrieve a paginated list of content.
   * @param {{ type?: string, spaceKey?: string, title?: string, start?: number, limit?: number, expand?: string }} [opts={}]
   */
  async getContents({ type, spaceKey, title, start = 0, limit = 25, expand } = {}) {
    const params = { start: String(start), limit: String(limit) };
    if (type) params.type = type;
    if (spaceKey) params.spaceKey = spaceKey;
    if (title) params.title = title;
    if (expand) params.expand = expand;
    return this._request('GET', 'v9/content', { params });
  }

  /**
   * Create a new piece of content.
   * @param {Object} data - Content creation data.
   */
  async createContent(data) {
    return this._request('POST', 'v9/content', { body: data });
  }

  /**
   * Update an existing piece of content.
   * @param {string} contentId
   * @param {Object} data - Content update data.
   */
  async updateContent(contentId, data) {
    return this._request('PUT', `v9/content/${encodeURIComponent(contentId)}`, { body: data });
  }

  /**
   * Delete a piece of content.
   * @param {string} contentId
   */
  async deleteContent(contentId) {
    return this._request('DELETE', `v9/content/${encodeURIComponent(contentId)}`);
  }

  /**
   * Search using CQL.
   * @param {string} cql
   * @param {{ limit?: number, start?: number, expand?: string }} [opts={}]
   */
  async searchContent(cql, { limit = 25, start = 0, expand } = {}) {
    const params = { cql, start: String(start), limit: String(limit) };
    if (expand) params.expand = expand;
    return this._request('GET', 'v9/search', { params });
  }

  /**
   * Retrieve a paginated list of spaces.
   * @param {{ limit?: number, start?: number, expand?: string }} [opts={}]
   */
  async getSpaces({ limit = 25, start = 0, expand } = {}) {
    const params = { start: String(start), limit: String(limit) };
    if (expand) params.expand = expand;
    return this._request('GET', 'v9/space', { params });
  }

  /**
   * Retrieve a single space by key.
   * @param {string} spaceKey
   * @param {{ expand?: string }} [opts={}]
   */
  async getSpace(spaceKey, { expand } = {}) {
    const params = {};
    if (expand) params.expand = expand;
    return this._request('GET', `v9/space/${encodeURIComponent(spaceKey)}`, {
      params: Object.keys(params).length > 0 ? params : undefined,
    });
  }

  /**
   * Retrieve Confluence server information.
   */
  async serverInfo() {
    return this._request('GET', 'v9/server-information');
  }
}


class ContentProxy {
  constructor(sdk) { this._sdk = sdk; }
  async get(contentId, opts) { return this._sdk.getContent(contentId, opts); }
  async list(opts) { return this._sdk.getContents(opts); }
  async create(data) { return this._sdk.createContent(data); }
  async update(contentId, data) { return this._sdk.updateContent(contentId, data); }
  async delete(contentId) { return this._sdk.deleteContent(contentId); }
}


class SpaceProxy {
  constructor(sdk) { this._sdk = sdk; }
  async get(spaceKey, opts) { return this._sdk.getSpace(spaceKey, opts); }
  async list(opts) { return this._sdk.getSpaces(opts); }
}


class SearchProxy {
  constructor(sdk) { this._sdk = sdk; }
  async query(cql, opts) { return this._sdk.searchContent(cql, opts); }
}


class UserProxy {
  constructor(sdk) { this._sdk = sdk; }
  async getCurrent(opts = {}) {
    const params = {};
    if (opts.expand) params.expand = opts.expand;
    return this._sdk._request('GET', 'v9/user/current', {
      params: Object.keys(params).length > 0 ? params : undefined,
    });
  }
  async search(opts = {}) {
    const params = {};
    if (opts.username) params.username = opts.username;
    if (opts.key) params.key = opts.key;
    return this._sdk._request('GET', 'v9/user', {
      params: Object.keys(params).length > 0 ? params : undefined,
    });
  }
}
