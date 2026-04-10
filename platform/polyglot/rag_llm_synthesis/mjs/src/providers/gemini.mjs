/**
 * @fileoverview Gemini provider via OpenAI-compatible endpoint — lazy-loaded.
 */

import { resolveGeminiEnv } from '@internal/env-resolver';

const _geminiEnv = resolveGeminiEnv();

let _client = null;

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/';

/**
 * Get or create a lazy-initialized Gemini client (OpenAI-compatible).
 * Requires the `openai` npm package and GEMINI_API_KEY env var.
 * @returns {Promise<any>}
 */
export async function getGeminiClient() {
  if (!_client) {
    const apiKey = _geminiEnv.apiKey;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required for Gemini provider.');
    }
    try {
      const { default: OpenAI } = await import('openai');
      _client = new OpenAI({ apiKey, baseURL: GEMINI_BASE_URL });
    } catch {
      throw new Error('LLM provider is not available. Required dependency is not installed.');
    }
  }
  return _client;
}

export function resetClient() {
  _client = null;
}
