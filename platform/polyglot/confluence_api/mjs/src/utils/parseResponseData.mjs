/**
 * @module utils/parseResponseData
 * @description HTTP response data parser for the Confluence API client.
 *
 * Automatically detects the response content type and parses accordingly:
 * - `application/json` — parsed via JSON.parse
 * - `text/*` — returned as a string
 * - 204 / empty body — returns an empty object `{}`
 * - Binary content — returned as an ArrayBuffer
 *
 * This utility is used internally by FetchClient to normalize response data
 * across all content types without requiring callers to handle parsing.
 *
 * @example
 * import { parseResponseData } from './parseResponseData.mjs';
 *
 * const response = await fetch('https://confluence.example.com/rest/api/content');
 * const data = await parseResponseData(response);
 */

/**
 * Parse the response data based on content type and status code.
 *
 * Handles the following cases:
 * - **204 No Content**: Returns an empty object `{}` since there is no body.
 * - **JSON responses**: Parses the body as JSON. Returns `null` for empty JSON bodies.
 * - **Text responses**: Returns the body as a plain string.
 * - **Other content types**: Returns the body as an ArrayBuffer (useful for binary data).
 *
 * @param {Response} response - The fetch Response object to parse.
 * @returns {Promise<unknown>} Parsed response data — JSON object, string, ArrayBuffer, or `{}`.
 *
 * @example
 * // JSON response
 * const data = await parseResponseData(jsonResponse);
 * // => { id: '12345', title: 'My Page', ... }
 *
 * // 204 No Content
 * const data = await parseResponseData(noContentResponse);
 * // => {}
 *
 * // Text response
 * const data = await parseResponseData(textResponse);
 * // => 'Some plain text content'
 */
export async function parseResponseData(response) {
  // Handle 204 No Content — no body to parse
  if (response.status === 204) {
    return {};
  }

  const contentType = response.headers.get('content-type') ?? '';

  // JSON responses
  if (contentType.includes('application/json')) {
    const text = await response.text();
    if (!text || text.trim() === '') return null;
    return JSON.parse(text);
  }

  // Text responses (text/plain, text/html, etc.)
  if (contentType.includes('text/')) {
    return response.text();
  }

  // Check for empty body (no content-type, no body)
  const contentLength = response.headers.get('content-length');
  if (contentLength === '0') {
    return {};
  }

  // Binary/other content types — return as ArrayBuffer
  return response.arrayBuffer();
}
