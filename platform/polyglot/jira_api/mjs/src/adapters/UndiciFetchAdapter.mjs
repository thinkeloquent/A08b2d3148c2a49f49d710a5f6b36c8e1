/**
 * @module adapters/UndiciFetchAdapter
 * @description Default fetch adapter using undici for Node.js.
 * @implements {import('../types.d.ts').FetchAdapter}
 */

import { fetch as undiciFetch } from 'undici';

/**
 * Fetch adapter implementation using undici.
 * Users can provide their own fetch implementation (node-fetch, cross-fetch, etc.)
 */
export class UndiciFetchAdapter {
  /**
   * @param {string} url
   * @param {RequestInit} [init]
   * @returns {Promise<Response>}
   */
  async fetch(url, init) {
    return undiciFetch(url, init);
  }
}
