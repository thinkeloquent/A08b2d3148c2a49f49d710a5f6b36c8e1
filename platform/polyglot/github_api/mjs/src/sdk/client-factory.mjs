/**
 * Factory for making HTTP requests via fetch-undici.
 * @module sdk/client-factory
 */

import { request } from 'fetch-undici';

/**
 * Send an HTTP request using fetch-undici.
 *
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {Object} [options] - Request options (headers, json, etc.)
 * @returns {Promise<import('fetch-undici').Response>} Response object
 */
export function httpRequest(method, url, options) {
  return request(method, url, options);
}
