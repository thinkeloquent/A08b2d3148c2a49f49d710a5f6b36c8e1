/**
 * Gemini OpenAI SDK - Main Package Export
 *
 * Unified export for all SDK modules providing OpenAI-compatible
 * interface for Google Gemini API.
 *
 * @example
 * // Import everything
 * import * as gemini from 'gemini-openai-sdk';
 *
 * // Import specific modules
 * import { GeminiClient } from 'gemini-openai-sdk';
 * import { create as createLogger } from 'gemini-openai-sdk/logger.mjs';
 *
 * // Quick usage
 * const client = new gemini.GeminiClient();
 * const response = await client.chat('Hello!');
 */

// Logger
export { create, SDKLogger } from './logger.mjs';

// Constants
export {
  MODELS,
  DEFAULT_MODEL,
  CHAT_ENDPOINT,
  DEFAULTS,
  SYSTEM_PROMPT,
  ROUTE_PREFIX,
} from './constants.mjs';

// Helpers
export {
  getApiKey,
  getModel,
  getHeaders,
  extractJSON,
  validateSchema,
  normalizeMessages,
} from './helpers.mjs';

// Types
export {
  createChatResponse,
  createErrorResponse,
  createUsageStats,
  createToolResult,
} from './types.mjs';

// HTTP Client
export {
  chatCompletion,
  streamChatCompletion,
  accumulateStream,
} from './client.mjs';

// HTTP Methods (extensible transport layer)
export { HttpMethods } from './client_http_methods.mjs';

// API Key (async resolution)
export { getApiKey as getApiKeyAsync } from './get_api_key.mjs';

// Tools
export {
  WEATHER_TOOL,
  CALCULATOR_TOOL,
  DEFAULT_TOOLS,
  executeWeather,
  executeCalculate,
  registerTool,
  executeTool,
  processToolCalls,
  getAvailableTools,
} from './tools.mjs';

// Main Client
export { GeminiClient } from './gemini-client.mjs';

// Agent API
export {
  invoke,
  getClient,
  setClient,
  getActionMetadata,
  listActions,
  ACTION_METADATA,
} from './agent.mjs';

// DevTools
export {
  createDebugClient,
  inspectRequest,
  mockResponse,
  mockStreamChunks,
  showConfig,
  validateEnvironment,
} from './devtools.mjs';

// =============================================================================
// Default Export - Convenience Object
// =============================================================================

import { GeminiClient } from './gemini-client.mjs';
import { create } from './logger.mjs';
import { MODELS, DEFAULT_MODEL, CHAT_ENDPOINT, DEFAULTS, SYSTEM_PROMPT } from './constants.mjs';
import { chatCompletion, streamChatCompletion, accumulateStream } from './client.mjs';
import { invoke, getClient, setClient, getActionMetadata, listActions } from './agent.mjs';
import {
  createDebugClient,
  inspectRequest,
  mockResponse,
  mockStreamChunks,
  showConfig,
  validateEnvironment,
} from './devtools.mjs';
import {
  DEFAULT_TOOLS,
  registerTool,
  executeTool,
  processToolCalls,
  getAvailableTools,
} from './tools.mjs';

export default {
  // Main client
  GeminiClient,

  // Logger
  createLogger: create,

  // Constants
  MODELS,
  DEFAULT_MODEL,
  CHAT_ENDPOINT,
  DEFAULTS,
  SYSTEM_PROMPT,

  // Low-level client
  chatCompletion,
  streamChatCompletion,
  accumulateStream,

  // Agent API
  invoke,
  getClient,
  setClient,
  getActionMetadata,
  listActions,

  // DevTools
  createDebugClient,
  inspectRequest,
  mockResponse,
  mockStreamChunks,
  showConfig,
  validateEnvironment,

  // Tools
  DEFAULT_TOOLS,
  registerTool,
  executeTool,
  processToolCalls,
  getAvailableTools,
};
