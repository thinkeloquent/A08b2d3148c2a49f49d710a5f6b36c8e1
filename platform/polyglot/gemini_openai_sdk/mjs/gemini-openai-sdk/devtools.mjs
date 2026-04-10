/**
 * DevTools Module - Developer Utilities
 *
 * Provides debugging utilities for SDK development and testing.
 */

import { create } from './logger.mjs';
import { MODELS, DEFAULT_MODEL, CHAT_ENDPOINT, DEFAULTS, SYSTEM_PROMPT } from './constants.mjs';
import { getApiKey, getModel, getHeaders } from './helpers.mjs';
import { GeminiClient } from './gemini-client.mjs';
import { resolveGeminiEnv } from '@internal/env-resolver';

const logger = create('gemini-openai-sdk', import.meta.url);

const _geminiEnv = resolveGeminiEnv();

/**
 * Create a client with verbose logging enabled.
 * @param {string} [model] - Model type
 * @param {boolean} [verbose=true] - Enable verbose logging
 * @returns {GeminiClient} Debug-configured client
 */
export function createDebugClient(model = DEFAULT_MODEL, verbose = true) {
  if (verbose) {
    process.env.LOG_LEVEL = 'DEBUG';
  }

  logger.info('createDebugClient: creating debug client', { model });
  return new GeminiClient({ model });
}

/**
 * Inspect what would be sent to API without executing.
 * @param {Array} messages - Messages array
 * @param {object} [options] - Request options
 * @returns {object} Request preview
 */
export function inspectRequest(messages, options = {}) {
  logger.debug('inspectRequest: building request preview');

  const apiKey = _geminiEnv.apiKey || null;
  const resolvedModel = getModel(options.model || DEFAULT_MODEL);

  const payload = {
    model: resolvedModel,
    messages,
    temperature: options.temperature ?? DEFAULTS.temperature,
    max_tokens: options.max_tokens ?? DEFAULTS.max_tokens,
    ...options,
  };

  delete payload.model; // Remove from spread
  payload.model = resolvedModel; // Re-add at top

  const headers = getHeaders(apiKey || 'API_KEY_NOT_SET');
  const headersDisplay = {
    ...headers,
    Authorization: 'Bearer ***' + (apiKey ? apiKey.slice(-4) : '****'),
  };

  return {
    endpoint: CHAT_ENDPOINT,
    method: 'POST',
    headers: headersDisplay,
    payload,
    api_key_set: !!apiKey,
    resolved_model: resolvedModel,
  };
}

/**
 * Create a mock API response for testing.
 * @param {object} [options] - Mock options
 * @returns {object} Mock API response
 */
export function mockResponse(options = {}) {
  logger.debug('mockResponse: creating mock response');

  const {
    content = 'Mock response content',
    model = 'gemini-2.0-flash',
    finishReason = 'stop',
    promptTokens = 10,
    completionTokens = 20,
  } = options;

  return {
    id: 'chatcmpl-mock-12345',
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content,
        },
        finish_reason: finishReason,
      },
    ],
    usage: {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: promptTokens + completionTokens,
    },
  };
}

/**
 * Create mock streaming chunks for testing.
 * @param {string} [content='Hello world'] - Content to split
 * @param {string} [model='gemini-2.0-flash'] - Model name
 * @returns {Array<string>} SSE data strings
 */
export function mockStreamChunks(content = 'Hello world', model = 'gemini-2.0-flash') {
  logger.debug('mockStreamChunks: creating mock stream');

  const chunks = [];

  // First chunk with role
  chunks.push(JSON.stringify({
    id: 'chatcmpl-mock-stream',
    object: 'chat.completion.chunk',
    model,
    choices: [
      {
        index: 0,
        delta: { role: 'assistant' },
        finish_reason: null,
      },
    ],
  }));

  // Content chunks
  for (const char of content) {
    chunks.push(JSON.stringify({
      id: 'chatcmpl-mock-stream',
      object: 'chat.completion.chunk',
      model,
      choices: [
        {
          index: 0,
          delta: { content: char },
          finish_reason: null,
        },
      ],
    }));
  }

  // Final chunk
  chunks.push(JSON.stringify({
    id: 'chatcmpl-mock-stream',
    object: 'chat.completion.chunk',
    model,
    choices: [
      {
        index: 0,
        delta: {},
        finish_reason: 'stop',
      },
    ],
  }));

  return chunks;
}

/**
 * Display current SDK configuration.
 * @returns {object} Configuration object
 */
export function showConfig() {
  const apiKey = _geminiEnv.apiKey || null;

  return {
    models: MODELS,
    default_model: DEFAULT_MODEL,
    base_url: CHAT_ENDPOINT.split('/').slice(0, -1).join('/'),
    chat_endpoint: CHAT_ENDPOINT,
    defaults: DEFAULTS,
    system_prompt: SYSTEM_PROMPT.length > 50
      ? SYSTEM_PROMPT.slice(0, 50) + '...'
      : SYSTEM_PROMPT,
    api_key_configured: !!apiKey,
    api_key_preview: apiKey ? '***' + apiKey.slice(-4) : null,
  };
}

/**
 * Validate environment setup.
 * @returns {Promise<object>} Validation result
 */
export async function validateEnvironment() {
  const issues = [];

  const apiKey = _geminiEnv.apiKey || null;
  if (!apiKey) {
    issues.push('GEMINI_API_KEY environment variable not set');
  }

  const nodeVersion = process.versions.node.split('.').map(Number);
  if (nodeVersion[0] < 20) {
    issues.push(`Node.js 20.x+ required, found ${process.version}`);
  }

  // Check for undici
  try {
    await import('undici');
  } catch {
    issues.push('undici package not installed');
  }

  return {
    valid: issues.length === 0,
    issues,
    node_version: process.version,
    api_key_set: !!apiKey,
  };
}

export default {
  createDebugClient,
  inspectRequest,
  mockResponse,
  mockStreamChunks,
  showConfig,
  validateEnvironment,
};
