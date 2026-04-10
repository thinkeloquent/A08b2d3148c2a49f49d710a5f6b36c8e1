/**
 * Client Module - HTTP Client Functions
 *
 * Async HTTP client functions for Gemini API communication.
 * Delegates HTTP transport to {@link HttpMethods}.
 */

import { create } from './logger.mjs';
import { CHAT_ENDPOINT, DEFAULTS, MODELS, DEFAULT_MODEL } from './constants.mjs';
import { getApiKey } from './get_api_key.mjs';
import { getHeaders } from './helpers.mjs';
import { HttpMethods } from './client_http_methods.mjs';

const logger = create('gemini-openai-sdk', import.meta.url);

const _http = new HttpMethods();

/**
 * Execute chat completion request to Gemini API.
 *
 * @param {Array} messages - List of message objects
 * @param {object} [options] - Request options
 * @param {string} [options.model] - Model name
 * @param {number} [options.temperature] - Sampling temperature
 * @param {number} [options.max_tokens] - Maximum tokens
 * @param {boolean} [options.stream] - Whether to stream
 * @param {number} [options.timeout] - Request timeout in ms
 * @returns {Promise<object>} Parsed JSON response
 * @throws {Error} On API error or missing API key
 */
export async function chatCompletion(messages, options = {}) {
  logger.debug('chatCompletion: enter', {
    messagesCount: messages.length,
    model: options.model,
    stream: options.stream,
  });

  const apiKey = await getApiKey();

  const payload = {
    model: options.model || MODELS[DEFAULT_MODEL],
    messages,
    temperature: options.temperature ?? DEFAULTS.temperature,
    max_tokens: options.max_tokens ?? DEFAULTS.max_tokens,
    stream: options.stream || false,
    ...options,
  };
  if (options.reasoning_effort) {
    payload.reasoning_effort = options.reasoning_effort;
  }

  // Remove internal options from payload
  delete payload.timeout;

  const requestTimeout = options.timeout || DEFAULTS.timeout_ms;

  logger.debug('chatCompletion: sending request', {
    endpoint: CHAT_ENDPOINT.slice(0, 50) + '...',
    model: payload.model,
  });

  return _http.post(
    CHAT_ENDPOINT,
    getHeaders(apiKey),
    payload,
    requestTimeout,
  );
}

/**
 * Stream chat completion request to Gemini API.
 *
 * @param {Array} messages - List of message objects
 * @param {object} [options] - Request options
 * @yields {string} JSON string chunks from SSE stream
 * @throws {Error} On API error or missing API key
 */
export async function* streamChatCompletion(messages, options = {}) {
  logger.debug('streamChatCompletion: enter', {
    messagesCount: messages.length,
    model: options.model,
  });

  const apiKey = await getApiKey();

  const payload = {
    model: options.model || MODELS[DEFAULT_MODEL],
    messages,
    temperature: options.temperature ?? DEFAULTS.temperature,
    max_tokens: options.max_tokens ?? DEFAULTS.max_tokens,
    stream: true,
    ...options,
  };
  if (options.reasoning_effort) {
    payload.reasoning_effort = options.reasoning_effort;
  }

  delete payload.timeout;

  const requestTimeout = options.timeout || DEFAULTS.timeout_ms;

  yield* _http.postStream(
    CHAT_ENDPOINT,
    getHeaders(apiKey),
    payload,
    requestTimeout,
  );
}

/**
 * Stream and accumulate response into single result.
 *
 * @param {Array} messages - List of message objects
 * @param {object} [options] - Request options
 * @returns {Promise<object>} Accumulated result
 */
export async function accumulateStream(messages, options = {}) {
  logger.debug('accumulateStream: enter');

  const chunks = [];
  let fullContent = '';
  let usage = null;

  for await (const data of streamChatCompletion(messages, options)) {
    try {
      const parsed = JSON.parse(data);
      const choice = parsed.choices?.[0] || {};
      const delta = choice.delta || {};
      const content = delta.content;

      if (content) {
        fullContent += content;
        chunks.push(content);
      }

      if (parsed.usage) {
        usage = parsed.usage;
      }
    } catch {
      logger.debug('accumulateStream: skipping invalid JSON chunk');
    }
  }

  logger.debug('accumulateStream: accumulated', { chunkCount: chunks.length });

  return {
    content: fullContent,
    chunk_count: chunks.length,
    usage,
  };
}

export default {
  chatCompletion,
  streamChatCompletion,
  accumulateStream,
};
