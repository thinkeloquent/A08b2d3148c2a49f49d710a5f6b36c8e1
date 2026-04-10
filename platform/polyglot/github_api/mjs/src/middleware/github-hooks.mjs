/**
 * Response processing hooks for GitHub API responses.
 * These hooks normalize and extract metadata from API responses.
 * @module middleware/github-hooks
 */

import { parseRateLimitHeaders } from '../sdk/rate-limit.mjs';

/**
 * Normalize a 204 No Content response to an empty object.
 * @param {Response} response - Fetch Response object
 * @returns {Object|null} Empty object for 204, null otherwise
 */
export function response204Hook(response) {
  if (response.status === 204) {
    return {};
  }
  return null;
}

/**
 * Fallback for JSON parse failures: returns the raw text wrapped in an object.
 * @param {Response} response - Fetch Response object
 * @returns {Promise<Object|null>} Object with data property, or null if JSON parsed fine
 */
export async function jsonFallbackHook(response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    return { data: text };
  }
  return null;
}

/**
 * Extract x-github-request-id from response headers.
 * @param {Response} response - Fetch Response object
 * @returns {string|undefined} The request ID if present
 */
export function requestIdHook(response) {
  return response.headers.get('x-github-request-id') || undefined;
}

/**
 * Parse rate limit headers from a response.
 * @param {Response} response - Fetch Response object
 * @returns {import('../sdk/rate-limit.mjs').RateLimitInfo|null} Parsed rate limit info
 */
export function rateLimitHook(response) {
  return parseRateLimitHeaders(response.headers);
}
