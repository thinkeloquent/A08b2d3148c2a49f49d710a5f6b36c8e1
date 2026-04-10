/**
 * Agent Module - LLM Agent-Friendly API
 *
 * Provides a simplified API surface for LLM agent integration.
 */

import { create } from './logger.mjs';
import { GeminiClient } from './gemini-client.mjs';

const logger = create('gemini-openai-sdk', import.meta.url);

// Singleton client
let agentClient = null;

/**
 * Get or create singleton client.
 */
export function getClient() {
  if (!agentClient) {
    agentClient = new GeminiClient();
  }
  return agentClient;
}

/**
 * Set custom client for agent use.
 * @param {GeminiClient} client - Custom client instance
 */
export function setClient(client) {
  agentClient = client;
}

/**
 * Invoke SDK action.
 *
 * @param {string} action - Action name
 * @param {object} [params] - Parameters for the action
 * @returns {Promise<object>} Result object
 */
export async function invoke(action, params = {}) {
  logger.debug('invoke: enter', { action });

  const client = getClient();

  try {
    let result;

    switch (action) {
      case 'chat':
        result = await client.chat(
          params.prompt || '',
          {
            model: params.model,
            temperature: params.temperature,
            maxTokens: params.max_tokens,
            useSystemPrompt: params.use_system_prompt ?? true,
          }
        );
        break;

      case 'chat_messages':
        result = await client.chatMessages(
          params.messages || [],
          {
            model: params.model,
            temperature: params.temperature,
            maxTokens: params.max_tokens,
          }
        );
        break;

      case 'stream':
        result = await client.stream(
          params.prompt || '',
          {
            model: params.model,
            temperature: params.temperature,
          }
        );
        break;

      case 'structure':
        result = await client.structure(
          params.prompt || '',
          params.schema || {},
          { model: params.model }
        );
        break;

      case 'tool_call':
        result = await client.toolCall(
          params.prompt || '',
          {
            tools: params.tools,
            model: params.model,
          }
        );
        break;

      case 'schema_mapping':
        result = await client.schemaMapping(
          params.prompt || '',
          params.schema || {},
          { model: params.model }
        );
        break;

      case 'conversation':
        result = await client.conversation(
          params.messages || [],
          {
            model: params.model,
            temperature: params.temperature,
            maxTokens: params.max_tokens,
          }
        );
        break;

      case 'json_mode':
        result = await client.jsonMode(
          params.prompt || '',
          { model: params.model }
        );
        break;

      case 'health':
        return client.healthCheck();

      default:
        logger.warn('invoke: unknown action', { action });
        return {
          success: false,
          error: `Unknown action: ${action}`,
          available_actions: [
            'chat', 'chat_messages', 'stream', 'structure',
            'tool_call', 'schema_mapping', 'conversation', 'json_mode', 'health'
          ],
        };
    }

    logger.info('invoke: success', { action });
    return result;
  } catch (err) {
    logger.error('invoke: failed', { action, error: err.message });
    return {
      success: false,
      error: err.message,
    };
  }
}

// =============================================================================
// Action Metadata for Agent Discovery
// =============================================================================

export const ACTION_METADATA = {
  chat: {
    description: 'Send a chat message and get a response',
    params: {
      prompt: { type: 'string', required: true },
      model: { type: 'string', default: 'flash' },
      temperature: { type: 'number', default: 0.7 },
      max_tokens: { type: 'integer', default: 1000 },
      use_system_prompt: { type: 'boolean', default: true },
    },
  },
  stream: {
    description: 'Stream a chat response (returns accumulated result)',
    params: {
      prompt: { type: 'string', required: true },
      model: { type: 'string', default: 'flash' },
      temperature: { type: 'number', default: 0.8 },
    },
  },
  structure: {
    description: 'Get structured JSON output matching a schema',
    params: {
      prompt: { type: 'string', required: true },
      schema: { type: 'object', required: true },
      model: { type: 'string', default: 'flash' },
    },
  },
  tool_call: {
    description: 'Execute with function calling (tools)',
    params: {
      prompt: { type: 'string', required: true },
      tools: { type: 'array', default: 'built-in tools' },
      model: { type: 'string', default: 'flash' },
    },
  },
  conversation: {
    description: 'Multi-turn conversation with message history',
    params: {
      messages: { type: 'array', required: true },
      model: { type: 'string', default: 'flash' },
      temperature: { type: 'number', default: 0.7 },
      max_tokens: { type: 'integer', default: 1000 },
    },
  },
  json_mode: {
    description: 'Request JSON object response',
    params: {
      prompt: { type: 'string', required: true },
      model: { type: 'string', default: 'flash' },
    },
  },
  health: {
    description: 'Check SDK health and configuration',
    params: {},
  },
};

/**
 * Get metadata for all available actions.
 */
export function getActionMetadata() {
  return ACTION_METADATA;
}

/**
 * List available action names.
 */
export function listActions() {
  return Object.keys(ACTION_METADATA);
}

export default {
  invoke,
  getClient,
  setClient,
  getActionMetadata,
  listActions,
  ACTION_METADATA,
};
