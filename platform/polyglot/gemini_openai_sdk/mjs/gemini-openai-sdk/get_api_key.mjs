/**
 * @fileoverview Async API key resolution for Gemini OpenAI SDK.
 *
 * Centralizes API key lookup so it can be awaited from any transport builder.
 * Resolution order:
 *
 *   1. `GEMINI_API_KEY` env var
 *   2. Throws Error if not found
 */

import { create } from './logger.mjs';
import { resolveGeminiEnv } from '@internal/env-resolver';

const logger = create('gemini-openai-sdk', import.meta.url);

const _geminiEnv = resolveGeminiEnv();

/**
 * Return the resolved Gemini API key.
 *
 * @returns {Promise<string>} API key
 * @throws {Error} If GEMINI_API_KEY is not configured
 */
export async function getApiKey() {
  return _resolve();
}

/**
 * Synchronous variant of {@link getApiKey}.
 *
 * @returns {string} API key
 * @throws {Error} If GEMINI_API_KEY is not configured
 */
export function getApiKeySync() {
  return _resolve();
}

/**
 * Shared resolution logic.
 * @returns {string}
 */
function _resolve() {
  logger.debug('getApiKey: checking environment');
  const apiKey = _geminiEnv.apiKey;

  if (apiKey) {
    logger.debug('getApiKey: found key', { length: apiKey.length });
    return apiKey;
  }

  const error = new Error('GEMINI_API_KEY not found in environment');
  logger.error('getApiKey: API key not configured', { error: error.message });
  throw error;
}
