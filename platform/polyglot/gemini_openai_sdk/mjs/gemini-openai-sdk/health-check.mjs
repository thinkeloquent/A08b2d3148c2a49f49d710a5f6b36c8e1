/**
 * Health Check Module
 *
 * Performs health check by making a minimal LLM call using the flash model.
 */

import { create } from './logger.mjs';
import { MODELS, DEFAULT_MODEL, SYSTEM_PROMPT } from './constants.mjs';
import { chatCompletion } from './client.mjs';

const logger = create('gemini-openai-sdk', import.meta.url);

/**
 * Perform health check with LLM status verification.
 *
 * @param {object} options - Health check options
 * @param {string} [options.modelType] - Default model type
 * @param {string} [options.systemPrompt] - System prompt
 * @returns {Promise<object>} Health status with LLM connectivity check
 */
export async function healthCheck(options = {}) {
  const startTime = Date.now();
  logger.debug('healthCheck: starting');

  const modelType = options.modelType || DEFAULT_MODEL;
  const systemPrompt = options.systemPrompt || SYSTEM_PROMPT;

  let llmStatus = 'unknown';
  let llmError = null;
  let llmResponseTime = null;

  try {
    // Make a minimal LLM call using flash model for speed
    const response = await chatCompletion(
      [{ role: 'user', content: 'ping' }],
      {
        model: MODELS.flash,
        max_tokens: 5,
        temperature: 0,
      }
    );

    llmResponseTime = Date.now() - startTime;
    llmStatus = response.choices?.[0]?.message?.content ? 'connected' : 'error';
    logger.debug('healthCheck: LLM ping successful', { responseTimeMs: llmResponseTime });
  } catch (err) {
    llmResponseTime = Date.now() - startTime;
    llmStatus = 'error';
    llmError = err.message;
    logger.error('healthCheck: LLM ping failed', { error: err.message });
  }

  const totalTime = Date.now() - startTime;

  return {
    status: llmStatus === 'connected' ? 'healthy' : 'unhealthy',
    llm_status: llmStatus,
    llm_error: llmError,
    llm_response_time_ms: llmResponseTime,
    models: MODELS,
    default_model: modelType,
    system_prompt: systemPrompt,
    total_time_ms: totalTime,
  };
}

export default healthCheck;
