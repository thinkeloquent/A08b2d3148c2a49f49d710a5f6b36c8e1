/**
 * @module adapters/UndiciFetchAdapter
 * @description Default fetch adapter using undici for Node.js.
 *
 * Provides a thin wrapper around undici's fetch implementation, conforming to
 * the FetchAdapter interface expected by FetchClient. This enables swapping
 * the HTTP transport layer for testing (mock adapters) or alternative
 * implementations (node-fetch, cross-fetch, etc.) without modifying client code.
 *
 * undici is the recommended HTTP client for Node.js, providing a high-performance,
 * spec-compliant fetch implementation. It ships as a dependency of this package
 * rather than relying on Node.js's experimental global fetch.
 *
 * @example
 * import { UndiciFetchAdapter } from './UndiciFetchAdapter.mjs';
 *
 * const adapter = new UndiciFetchAdapter();
 * const response = await adapter.fetch('https://confluence.example.com/rest/api/space', {
 *   headers: { Authorization: 'Basic ...' },
 * });
 */

/**
 * Fetch adapter implementation using the undici HTTP client library.
 *
 * Uses a dynamic import to lazily load undici, ensuring the module is resolved
 * at call time rather than at import time. This provides better compatibility
 * with environments where undici may need to be resolved differently.
 *
 * @implements {FetchAdapter}
 */
export class UndiciFetchAdapter {
  /**
   * Execute an HTTP request using undici's fetch implementation.
   *
   * @param {string} url - The fully-qualified request URL.
   * @param {RequestInit} [init={}] - Standard fetch init options (method, headers, body, signal, etc.).
   * @returns {Promise<Response>} The fetch Response object.
   *
   * @example
   * const adapter = new UndiciFetchAdapter();
   * const response = await adapter.fetch('https://confluence.example.com/rest/api/content', {
   *   method: 'GET',
   *   headers: {
   *     Accept: 'application/json',
   *     Authorization: 'Basic *********',
   *   },
   * });
   * const data = await response.json();
   */
  async fetch(url, init = {}) {
    const { default: undici } = await import("undici");
    return undici.fetch(url, init);
  }
}
