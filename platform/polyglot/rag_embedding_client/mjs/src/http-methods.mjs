/**
 * @fileoverview Overridable HTTP method wrappers for the embedding client.
 *
 * Provides a base `HttpMethods` class that delegates to `fetch()`.
 * Deployments can subclass to inject custom headers, error handling,
 * or additional telemetry without modifying the core client.
 *
 * @example
 * import { HttpMethods } from '@internal/rag-embedding-client';
 *
 * class CustomHttpMethods extends HttpMethods {
 *   async post(endpoint, payload, headers, timeout) {
 *     headers['X-Custom-Source'] = 'ai-platform';
 *     return super.post(endpoint, payload, headers, timeout);
 *   }
 * }
 *
 * const client = new EmbeddingClient({ ..., httpMethods: new CustomHttpMethods() });
 */

export class HttpMethods {
  /**
   * @param {{ dispatcher?: import('undici').Dispatcher }} [opts]
   */
  constructor(opts) {
    this._dispatcher = opts?.dispatcher ?? undefined;
  }

  /**
   * POST JSON and return parsed response.
   * @param {string} url
   * @param {object} payload
   * @param {Record<string, string>} headers
   * @param {number} timeout - Timeout in ms
   * @returns {Promise<any>}
   */
  async post(url, payload, headers, timeout) {
    const resp = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeout),
      ...(this._dispatcher ? { dispatcher: this._dispatcher } : {}),
    });
    if (!resp.ok) {
      const body = await resp.text();
      const err = new Error(`Embedding API error ${resp.status}: ${body}`);
      err.status = resp.status;
      err.responseBody = body;
      throw err;
    }
    return resp.json();
  }

  /**
   * GET and return parsed response.
   * @param {string} url
   * @param {Record<string, string>} headers
   * @param {number} timeout
   * @returns {Promise<any>}
   */
  async get(url, headers, timeout) {
    const resp = await fetch(url, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(timeout),
      ...(this._dispatcher ? { dispatcher: this._dispatcher } : {}),
    });
    if (!resp.ok) {
      const body = await resp.text();
      throw new Error(`Embedding API error ${resp.status}: ${body}`);
    }
    return resp.json();
  }

  /**
   * PUT JSON and return parsed response.
   * @param {string} url
   * @param {object} payload
   * @param {Record<string, string>} headers
   * @param {number} timeout
   * @returns {Promise<any>}
   */
  async put(url, payload, headers, timeout) {
    const resp = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeout),
      ...(this._dispatcher ? { dispatcher: this._dispatcher } : {}),
    });
    if (!resp.ok) {
      const body = await resp.text();
      throw new Error(`Embedding API error ${resp.status}: ${body}`);
    }
    return resp.json();
  }

  /**
   * DELETE and return parsed response.
   * @param {string} url
   * @param {Record<string, string>} headers
   * @param {number} timeout
   * @returns {Promise<any>}
   */
  async delete(url, headers, timeout) {
    const resp = await fetch(url, {
      method: 'DELETE',
      headers,
      signal: AbortSignal.timeout(timeout),
      ...(this._dispatcher ? { dispatcher: this._dispatcher } : {}),
    });
    if (!resp.ok) {
      const body = await resp.text();
      throw new Error(`Embedding API error ${resp.status}: ${body}`);
    }
    return resp.json();
  }
}
