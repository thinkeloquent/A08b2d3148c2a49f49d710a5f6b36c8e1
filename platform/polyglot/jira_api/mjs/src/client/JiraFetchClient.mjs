/**
 * @module client/JiraFetchClient
 * @description JIRA-specific fetch client wrapping the generic FetchClient.
 * Provides base URL handling, path interpolation, query serialization,
 * Basic Auth, and typed convenience methods.
 */

import { FetchClient } from './FetchClient.mjs';
import { UndiciFetchAdapter } from '../adapters/UndiciFetchAdapter.mjs';
import { JiraConfigurationError } from '../errors.mjs';
import { createLogger } from '../logger.mjs';

const log = createLogger('jira-api', import.meta.url);

export class JiraFetchClient {
  /**
   * @param {import('../types.d.ts').JiraClientOptions} options
   */
  constructor(options) {
    if (!options.baseUrl) throw new JiraConfigurationError('baseUrl is required');
    if (!options.email) throw new JiraConfigurationError('email is required');
    if (!options.apiToken) throw new JiraConfigurationError('apiToken is required');

    this._baseUrl = options.baseUrl.replace(/\/$/, '');
    this._email = options.email;
    this._apiToken = options.apiToken;
    this._authHeader = 'Basic ' + Buffer.from(`${options.email}:${options.apiToken}`).toString('base64');

    const fetchOpts = {
      fetchAdapter: new UndiciFetchAdapter(),
      timeoutMs: options.timeoutMs ?? 30_000,
      ...options.fetchClientOptions,
    };
    this._fetchClient = new FetchClient(fetchOpts);

    log.debug('JiraFetchClient initialized', { baseUrl: this._baseUrl });
  }

  /**
   * Make a typed JIRA API request.
   * @template T
   * @param {import('../types.d.ts').JiraRequestConfig} config
   * @returns {Promise<T>}
   */
  async request(config) {
    const url = this._buildUrl(config);
    const init = {
      method: config.method,
      headers: this._buildHeaders(config),
    };
    if (config.body !== undefined && config.method !== 'GET') {
      init.body = JSON.stringify(config.body);
    }
    return this._fetchClient.request(url, init);
  }

  /**
   * Build full URL with path and query parameters.
   * @param {import('../types.d.ts').JiraRequestConfig} config
   * @returns {string}
   * @private
   */
  _buildUrl(config) {
    let path = config.path;

    if (config.pathParams) {
      for (const [key, value] of Object.entries(config.pathParams)) {
        const placeholder = `{${key}}`;
        if (!path.includes(placeholder)) {
          throw new JiraConfigurationError(
            `Path parameter "${key}" not found in path: ${path}`,
          );
        }
        path = path.replace(placeholder, encodeURIComponent(String(value)));
      }
    }

    const remaining = path.match(/\{[^}]+\}/g);
    if (remaining) {
      throw new JiraConfigurationError(
        `Missing path parameters: ${remaining.join(', ')}`,
      );
    }

    let url = `${this._baseUrl}${path}`;

    if (config.queryParams) {
      const parts = [];
      for (const [key, value] of Object.entries(config.queryParams)) {
        if (value === undefined) continue;
        if (Array.isArray(value)) {
          for (const item of value) {
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
          }
        } else {
          parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
        }
      }
      if (parts.length > 0) url += `?${parts.join('&')}`;
    }

    return url;
  }

  /**
   * Build request headers with auth.
   * @param {import('../types.d.ts').JiraRequestConfig} config
   * @returns {Record<string, string>}
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

  /** @template T @param {string} path @param {Omit<import('../types.d.ts').JiraRequestConfig, 'method'|'path'>} [opts] @returns {Promise<T>} */
  async get(path, opts = {}) { return this.request({ ...opts, method: 'GET', path }); }
  /** @template T */
  async post(path, body, opts = {}) { return this.request({ ...opts, method: 'POST', path, body }); }
  /** @template T */
  async put(path, body, opts = {}) { return this.request({ ...opts, method: 'PUT', path, body }); }
  /** @template T */
  async delete(path, opts = {}) { return this.request({ ...opts, method: 'DELETE', path }); }
  /** @template T */
  async patch(path, body, opts = {}) { return this.request({ ...opts, method: 'PATCH', path, body }); }
}
