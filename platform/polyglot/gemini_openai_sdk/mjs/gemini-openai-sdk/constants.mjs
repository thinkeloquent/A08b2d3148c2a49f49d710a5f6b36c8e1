/**
 * Constants Module - Configuration and Defaults
 *
 * Centralized configuration constants for the Gemini OpenAI SDK.
 * Values can be overridden via environment variables where applicable.
 */

import { create } from './logger.mjs';
import { resolveGeminiEnv } from '@internal/env-resolver';

const logger = create('gemini-openai-sdk', import.meta.url);

const _geminiEnv = resolveGeminiEnv();

// =============================================================================
// Model Configurations
// =============================================================================

export const MODELS = {
  flash: 'gemini-2.0-flash',
  pro: 'gemini-2.0-pro-exp-02-05',
};

export const DEFAULT_MODEL = _geminiEnv.defaultModel;

// =============================================================================
// System Prompt
// =============================================================================

export const SYSTEM_PROMPT = _geminiEnv.systemPrompt;

// =============================================================================
// API Endpoints
// =============================================================================

export const BASE_URL = _geminiEnv.baseUrl;

export const CHAT_ENDPOINT = `${BASE_URL}/chat/completions`;

// =============================================================================
// Default Settings
// =============================================================================

export const DEFAULTS = {
  temperature: _geminiEnv.defaultTemperature,
  max_tokens: _geminiEnv.defaultMaxTokens,
  timeout_ms: _geminiEnv.timeoutMs,
};

// =============================================================================
// Route Configuration
// =============================================================================

export const ROUTE_PREFIX = '/api/llm/gemini-openai-v1';

// =============================================================================
// Logging
// =============================================================================

logger.debug('constants loaded', {
  defaultModel: DEFAULT_MODEL,
  baseUrl: BASE_URL.slice(0, 50) + '...',
  defaults: DEFAULTS,
});

export default {
  MODELS,
  DEFAULT_MODEL,
  SYSTEM_PROMPT,
  BASE_URL,
  CHAT_ENDPOINT,
  DEFAULTS,
  ROUTE_PREFIX,
};
