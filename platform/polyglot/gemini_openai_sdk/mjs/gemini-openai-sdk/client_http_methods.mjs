/**
 * @fileoverview Overridable HTTP method wrappers for the Gemini OpenAI SDK client.
 *
 * Provides a base `HttpMethods` class that delegates to `undici`.
 * Cloud deployments can subclass to inject corporate headers, custom
 * error handling, or additional telemetry without modifying the core client.
 *
 * @example
 * import { HttpMethods } from './client_http_methods.mjs';
 *
 * class CustomHttpMethods extends HttpMethods {
 *   async post(url, headers, payload, timeout) {
 *     headers['X-Custom-Source'] = 'ai-platform';
 *     return super.post(url, headers, payload, timeout);
 *   }
 * }
 */

import { request } from 'undici';
import { create } from './logger.mjs';

const logger = create('gemini-openai-sdk', import.meta.url);

export class HttpMethods {
  // ------------------------------------------------------------------
  // Non-streaming POST
  // ------------------------------------------------------------------

  /**
   * Async POST — returns parsed JSON response.
   *
   * @param {string} url - Request URL
   * @param {object} headers - Request headers
   * @param {object} payload - JSON payload
   * @param {number} timeout - Request timeout in ms
   * @returns {Promise<object>} Parsed JSON response
   * @throws {Error} On API error
   */
  async post(url, headers, payload, timeout) {
    const startTime = Date.now();

    const { statusCode, body } = await request(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      headersTimeout: timeout,
      bodyTimeout: timeout,
    });

    const text = await body.text();
    const elapsedMs = Date.now() - startTime;

    if (statusCode >= 400) {
      logger.error('post: API error', {
        status: statusCode,
        error: text.slice(0, 200),
      });
      throw new Error(`${statusCode}: ${text}`);
    }

    const result = JSON.parse(text);
    const usage = result.usage || {};

    logger.info('post: success', {
      model: result.model,
      tokens: usage.total_tokens,
      elapsedMs: Math.round(elapsedMs),
    });

    return result;
  }

  // ------------------------------------------------------------------
  // Streaming POST
  // ------------------------------------------------------------------

  /**
   * Async streaming POST — yields SSE data chunks.
   *
   * @param {string} url - Request URL
   * @param {object} headers - Request headers
   * @param {object} payload - JSON payload
   * @param {number} timeout - Request timeout in ms
   * @yields {string} JSON string chunks from SSE stream
   * @throws {Error} On API error
   */
  async *postStream(url, headers, payload, timeout) {
    const startTime = Date.now();
    let chunkCount = 0;

    logger.debug('postStream: opening stream');

    const { statusCode, body } = await request(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      headersTimeout: timeout,
      bodyTimeout: timeout,
    });

    if (statusCode >= 400) {
      const errorText = await body.text();
      logger.error('postStream: API error', {
        status: statusCode,
        error: errorText.slice(0, 200),
      });
      throw new Error(`${statusCode}: ${errorText}`);
    }

    let buffer = '';

    for await (const chunk of body) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const data = trimmed.slice(6);
          if (data === '[DONE]') {
            const elapsedMs = Date.now() - startTime;
            logger.info('postStream: complete', {
              chunkCount,
              elapsedMs: Math.round(elapsedMs),
            });
            return;
          }
          if (data) {
            chunkCount++;
            yield data;
          }
        }
      }
    }
  }
}
