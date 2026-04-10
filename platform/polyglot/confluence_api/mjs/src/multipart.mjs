/**
 * @module multipart
 * @description Multipart upload and binary download utilities for the Confluence
 * Data Center REST API.
 *
 * Confluence uses multipart/form-data for file uploads (attachments). This module
 * provides helpers to construct FormData payloads compatible with undici's fetch
 * implementation and to download binary content (attachments, exports) as Buffers.
 *
 * @example
 * // Upload an attachment
 * import { buildMultipartFormData } from './multipart.mjs';
 * const formData = buildMultipartFormData(buffer, 'report.pdf', 'application/pdf', {
 *   comment: 'Q4 report',
 *   minorEdit: true,
 * });
 *
 * // Download binary content
 * import { downloadBinary } from './multipart.mjs';
 * const buffer = await downloadBinary(client, '/rest/api/content/123/child/attachment/456/download');
 */

/**
 * Build a multipart/form-data payload for uploading a file attachment to Confluence.
 *
 * Confluence's attachment upload endpoint (`POST /rest/api/content/{id}/child/attachment`)
 * expects:
 * - A `file` part with the binary content
 * - An optional `comment` part for the attachment comment
 * - An optional `minorEdit` part (string "true"/"false") to suppress notifications
 *
 * The returned FormData instance is compatible with undici's fetch and the
 * Web-standard FormData API available in Node.js 20+.
 *
 * @param {Buffer|Uint8Array} fileBuffer - The file content as a Buffer or Uint8Array.
 * @param {string} filename - The filename to use in the Content-Disposition header.
 * @param {string} [contentType='application/octet-stream'] - MIME type of the file.
 * @param {Object} [options={}] - Additional attachment metadata.
 * @param {string} [options.comment] - Attachment comment visible in Confluence.
 * @param {boolean} [options.minorEdit] - If true, suppresses notification emails.
 * @returns {FormData} A FormData instance ready for use with fetch.
 *
 * @example
 * import { readFileSync } from 'node:fs';
 * const buffer = readFileSync('./diagram.png');
 * const formData = buildMultipartFormData(buffer, 'diagram.png', 'image/png', {
 *   comment: 'Updated architecture diagram',
 *   minorEdit: true,
 * });
 *
 * await client.request({
 *   method: 'POST',
 *   path: '/rest/api/content/{contentId}/child/attachment',
 *   pathParams: { contentId: '12345' },
 *   body: formData,
 *   headers: {
 *     'X-Atlassian-Token': 'nocheck',
 *   },
 * });
 */
export function buildMultipartFormData(
  fileBuffer,
  filename,
  contentType = 'application/octet-stream',
  { comment, minorEdit } = {},
) {
  const formData = new FormData();

  // Create a Blob from the buffer with the specified content type.
  // Node.js 20+ supports the global Blob constructor.
  const blob = new Blob([fileBuffer], { type: contentType });
  formData.set('file', blob, filename);

  if (comment !== undefined && comment !== null) {
    formData.set('comment', String(comment));
  }

  if (minorEdit !== undefined && minorEdit !== null) {
    formData.set('minorEdit', String(minorEdit));
  }

  return formData;
}

/**
 * Download binary content from a Confluence endpoint as a Node.js Buffer.
 *
 * Useful for downloading attachments, PDF exports, or other binary resources.
 * Uses the client's `getRaw` method to obtain the raw Response, then reads
 * the body into a Buffer.
 *
 * @param {import('./client/ConfluenceFetchClient.mjs').ConfluenceFetchClient} client
 *   The Confluence fetch client instance.
 * @param {string} endpoint - API endpoint path (e.g. '/download/attachments/123/file.pdf').
 * @param {Record<string, unknown>} [params={}] - Optional query parameters.
 * @returns {Promise<Buffer>} The binary content as a Buffer.
 *
 * @example
 * const buffer = await downloadBinary(
 *   client,
 *   '/rest/api/content/12345/child/attachment/67890/download',
 * );
 * writeFileSync('./attachment.pdf', buffer);
 */
export async function downloadBinary(client, endpoint, params = {}) {
  const response = await client.getRaw(endpoint, { queryParams: params });

  // Read the response body as an ArrayBuffer, then wrap in a Node.js Buffer
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
