/**
 * Helpers Module - Utility Functions
 *
 * Common utility functions used across the SDK with defensive logging.
 */

import { create } from './logger.mjs';
import { MODELS, DEFAULT_MODEL, SYSTEM_PROMPT } from './constants.mjs';
import { getApiKeySync as getApiKey } from './get_api_key.mjs';

const logger = create('gemini-openai-sdk', import.meta.url);

/**
 * Get Gemini API key from environment.
 * Delegates to {@link import('./get_api_key.mjs').getApiKeySync}.
 * @returns {string} API key
 * @throws {Error} If GEMINI_API_KEY is not configured
 */
export { getApiKey };

/**
 * Get full model name from type identifier.
 * @param {string} modelType - Model type ("flash" or "pro")
 * @returns {string} Full model name
 */
export function getModel(modelType) {
  logger.debug('getModel: resolving', { type: modelType });
  const model = MODELS[modelType] || MODELS[DEFAULT_MODEL];
  logger.debug('getModel: resolved', { model });
  return model;
}

/**
 * Build authorization headers for Gemini API.
 * @param {string} apiKey - Gemini API key
 * @returns {object} Headers object
 */
export function getHeaders(apiKey) {
  logger.debug('getHeaders: building auth headers');
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Extract JSON from response content with fallback strategies.
 *
 * Attempts extraction in order:
 * 1. Direct JSON parse
 * 2. Extract from markdown code block
 * 3. Regex match for JSON object
 *
 * @param {string} content - Raw content string
 * @returns {object|null} Parsed JSON or null
 */
export function extractJSON(content) {
  if (!content) {
    logger.debug('extractJSON: empty content');
    return null;
  }

  // Strategy 1: Direct parse
  logger.debug('extractJSON: attempting direct parse');
  try {
    const result = JSON.parse(content);
    logger.debug('extractJSON: direct parse succeeded');
    return result;
  } catch {
    logger.debug('extractJSON: direct parse failed, trying code block');
  }

  // Strategy 2: Markdown code block
  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      const result = JSON.parse(codeBlockMatch[1].trim());
      logger.debug('extractJSON: code block extraction succeeded');
      return result;
    } catch {
      logger.debug('extractJSON: code block parse failed, trying regex');
    }
  }

  // Strategy 3: Regex for JSON object
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const result = JSON.parse(jsonMatch[0]);
      logger.debug('extractJSON: regex extraction succeeded');
      return result;
    } catch {
      logger.debug('extractJSON: regex parse failed');
    }
  }

  logger.warn('extractJSON: all extraction strategies failed');
  return null;
}

/**
 * Validate data against a JSON schema.
 *
 * @param {object} data - Data to validate
 * @param {object} schema - JSON schema
 * @returns {object} Validation result with "valid" and "errors"
 */
export function validateSchema(data, schema) {
  logger.debug('validateSchema: validating data against schema');
  const errors = [];

  // Type check
  if (schema.type === 'object' && typeof data !== 'object') {
    logger.debug('validateSchema: type mismatch - expected object');
    return { valid: false, errors: ['Expected object'] };
  }

  // Required fields
  const requiredFields = schema.required || [];
  for (const field of requiredFields) {
    if (!(field in data)) {
      const errorMsg = `Missing required field: ${field}`;
      errors.push(errorMsg);
      logger.debug('validateSchema:', { error: errorMsg });
    }
  }

  // Property type validation
  const properties = schema.properties || {};
  for (const [key, propSchema] of Object.entries(properties)) {
    if (key in data) {
      const value = data[key];
      const propType = propSchema.type;

      let typeValid = true;
      if (propType === 'string' && typeof value !== 'string') {
        typeValid = false;
      } else if (propType === 'number' && typeof value !== 'number') {
        typeValid = false;
      } else if (propType === 'boolean' && typeof value !== 'boolean') {
        typeValid = false;
      } else if (propType === 'array' && !Array.isArray(value)) {
        typeValid = false;
      }

      if (!typeValid) {
        const errorMsg = `${key} should be ${propType}`;
        errors.push(errorMsg);
        logger.debug('validateSchema:', { error: errorMsg });
      }
    }
  }

  const isValid = errors.length === 0;
  logger.debug('validateSchema: validation', { result: isValid ? 'passed' : 'failed' });

  return { valid: isValid, errors };
}

/**
 * Normalize message list, optionally prepending system prompt.
 *
 * @param {Array} messages - List of message objects
 * @param {boolean} [includeSystemPrompt=true] - Whether to include system prompt
 * @param {string} [systemPrompt] - Custom system prompt
 * @returns {Array} Normalized messages
 */
export function normalizeMessages(messages, includeSystemPrompt = true, systemPrompt = null) {
  logger.debug('normalizeMessages: processing', { count: messages.length });

  const result = [...messages]; // Copy to avoid mutation

  if (includeSystemPrompt && (!result.length || result[0]?.role !== 'system')) {
    const prompt = systemPrompt || SYSTEM_PROMPT;
    result.unshift({ role: 'system', content: prompt });
    logger.debug('normalizeMessages: prepended system prompt');
  }

  return result;
}

export default {
  getApiKey,
  getModel,
  getHeaders,
  extractJSON,
  validateSchema,
  normalizeMessages,
};
