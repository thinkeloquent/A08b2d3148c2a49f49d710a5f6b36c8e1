/**
 * @module utils/parseResponseData
 * @description Parses HTTP response data based on content type.
 * Automatically detects JSON, text, or binary responses.
 */

/**
 * Parse the response data based on content type.
 * @param {Response} response - The fetch Response object
 * @returns {Promise<unknown>} Parsed response data (JSON object, text, or ArrayBuffer)
 */
export async function parseResponseData(response) {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const text = await response.text();
    if (!text || text.trim() === '') return null;
    return JSON.parse(text);
  }

  if (contentType.includes('text/')) {
    return response.text();
  }

  return response.arrayBuffer();
}
