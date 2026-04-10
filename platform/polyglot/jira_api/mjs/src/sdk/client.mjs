/**
 * @module sdk/client
 * @description SDK client for interacting with the JIRA API server.
 * Communicates with the REST proxy (Fastify or FastAPI) rather than Jira Cloud directly.
 */

import { SDKError } from '../errors.mjs';
import { createLogger } from '../logger.mjs';

const log = createLogger('jira-api', import.meta.url);

export class JiraSDKClient {
  /**
   * @param {object} opts
   * @param {string} opts.baseUrl - Base URL of the JIRA API server
   * @param {string} [opts.apiKey] - Optional API key for authentication
   * @param {number} [opts.timeoutMs=30000] - Request timeout in ms
   */
  constructor({ baseUrl, apiKey, timeoutMs = 30_000 }) {
    this._baseUrl = baseUrl.replace(/\/$/, '');
    this._apiKey = apiKey;
    this._timeoutMs = timeoutMs;
    this._headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (apiKey) {
      this._headers.Authorization = `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`;
    }
  }

  /**
   * @param {string} method
   * @param {string} endpoint
   * @param {object} [opts]
   * @param {Record<string,string>} [opts.params]
   * @param {unknown} [opts.body]
   * @returns {Promise<unknown>}
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

  // ── Health ──────────────────────────────────────────────────────────

  async healthCheck() { return this._request('GET', 'health'); }

  // ── Users ───────────────────────────────────────────────────────────

  async searchUsers(query, maxResults = 50) {
    return this._request('GET', 'users/search', { params: { query, max_results: String(maxResults) } });
  }

  async getUser(identifier) {
    return this._request('GET', `users/${encodeURIComponent(identifier)}`);
  }

  // ── Issues ──────────────────────────────────────────────────────────

  async createIssue(issueData) {
    return this._request('POST', 'issues', { body: issueData });
  }

  async getIssue(issueKey) {
    return this._request('GET', `issues/${encodeURIComponent(issueKey)}`);
  }

  async updateIssue(issueKey, updateData) {
    return this._request('PATCH', `issues/${encodeURIComponent(issueKey)}`, { body: updateData });
  }

  async assignIssue(issueKey, email) {
    return this._request('PUT', `issues/${encodeURIComponent(issueKey)}/assign/${encodeURIComponent(email)}`);
  }

  async getIssueTransitions(issueKey) {
    return this._request('GET', `issues/${encodeURIComponent(issueKey)}/transitions`);
  }

  async transitionIssue(issueKey, transitionName, comment, resolutionName) {
    return this._request('POST', `issues/${encodeURIComponent(issueKey)}/transitions`, {
      body: { transition_name: transitionName, comment, resolution_name: resolutionName },
    });
  }

  // ── Projects ────────────────────────────────────────────────────────

  async getProject(projectKey) {
    return this._request('GET', `projects/${encodeURIComponent(projectKey)}`);
  }

  async getProjectVersions(projectKey, released) {
    const params = {};
    if (released !== undefined) params.released = String(released);
    return this._request('GET', `projects/${encodeURIComponent(projectKey)}/versions`, { params });
  }

  async createProjectVersion(projectKey, name, description) {
    const body = { name };
    if (description) body.description = description;
    return this._request('POST', `projects/${encodeURIComponent(projectKey)}/versions`, { body });
  }
}
