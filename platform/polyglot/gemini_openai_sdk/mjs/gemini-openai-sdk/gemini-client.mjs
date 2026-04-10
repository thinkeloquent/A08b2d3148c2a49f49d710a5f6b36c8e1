/**
 * GeminiClient - High-Level SDK Interface
 *
 * Provides a unified interface for all Gemini operations with
 * consistent response handling and defensive logging.
 */

import { create } from './logger.mjs';
import { MODELS, DEFAULT_MODEL, SYSTEM_PROMPT, DEFAULTS } from './constants.mjs';
import { getApiKey, getModel, extractJSON, validateSchema, normalizeMessages } from './helpers.mjs';
import { chatCompletion, streamChatCompletion, accumulateStream } from './client.mjs';
import { DEFAULT_TOOLS, processToolCalls } from './tools.mjs';
import {
  createChatResponse,
  createErrorResponse,
  createUsageStats,
  createToolResult,
} from './types.mjs';
import { resolveGeminiEnv } from '@internal/env-resolver';

const logger = create('gemini-openai-sdk', import.meta.url);

const _geminiEnv = resolveGeminiEnv();

/**
 * High-level client for Gemini OpenAI-compatible API.
 */
export class GeminiClient {
  /**
   * @param {object} [options] - Client options
   * @param {string} [options.apiKey] - API key (uses env var if not provided)
   * @param {string} [options.model] - Default model type
   * @param {string} [options.systemPrompt] - Custom system prompt
   * @param {object} [options.loggerInstance] - Custom logger
   */
  constructor(options = {}) {
    this._apiKey = options.apiKey;
    this._modelType = options.model || DEFAULT_MODEL;
    this._model = getModel(this._modelType);
    this._systemPrompt = options.systemPrompt || SYSTEM_PROMPT;
    this._logger = options.loggerInstance || logger;

    this._logger.debug('GeminiClient: initialized', {
      model: this._modelType,
      hasApiKey: !!(options.apiKey || _geminiEnv.apiKey),
    });
  }

  /**
   * Simple chat completion with a single prompt.
   */
  async chat(prompt, options = {}) {
    const startTime = Date.now();
    this._logger.debug('chat: enter', { promptLength: prompt.length });

    try {
      const messages = [];
      if (options.useSystemPrompt !== false) {
        messages.push({ role: 'system', content: this._systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await chatCompletion(messages, {
        model: getModel(options.model || this._modelType),
        temperature: options.temperature,
        max_tokens: options.maxTokens,
      });

      const elapsedMs = Date.now() - startTime;
      const choice = response.choices?.[0] || {};
      const usage = response.usage || {};

      this._logger.info('chat: success', { elapsedMs: Math.round(elapsedMs) });

      return createChatResponse({
        success: true,
        content: choice.message?.content,
        model: response.model,
        finish_reason: choice.finish_reason,
        usage: createUsageStats(usage),
        execution_time_ms: elapsedMs,
      });
    } catch (err) {
      const elapsedMs = Date.now() - startTime;
      this._logger.error('chat: failed', { error: err.message });
      return createErrorResponse(err.message, elapsedMs);
    }
  }

  /**
   * Chat completion with custom messages array.
   */
  async chatMessages(messages, options = {}) {
    const startTime = Date.now();
    this._logger.debug('chatMessages: enter', { messagesCount: messages.length });

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return createErrorResponse('messages array is required');
    }

    try {
      const response = await chatCompletion(messages, {
        model: getModel(options.model || this._modelType),
        temperature: options.temperature,
        max_tokens: options.maxTokens,
      });

      const elapsedMs = Date.now() - startTime;
      const choice = response.choices?.[0] || {};
      const usage = response.usage || {};

      return createChatResponse({
        success: true,
        content: choice.message?.content,
        model: response.model,
        finish_reason: choice.finish_reason,
        usage: createUsageStats(usage),
        execution_time_ms: elapsedMs,
      });
    } catch (err) {
      const elapsedMs = Date.now() - startTime;
      this._logger.error('chatMessages: failed', { error: err.message });
      return createErrorResponse(err.message, elapsedMs);
    }
  }

  /**
   * Structured output with JSON schema.
   */
  async structure(prompt, schema, options = {}) {
    const startTime = Date.now();
    this._logger.debug('structure: enter');

    try {
      const messages = [
        { role: 'system', content: 'Return ONLY valid JSON matching the schema.' },
        { role: 'user', content: prompt },
      ];

      const response = await chatCompletion(messages, {
        model: getModel(options.model || this._modelType),
        temperature: 0,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'StructuredResponse',
            schema,
            strict: true,
          },
        },
      });

      const elapsedMs = Date.now() - startTime;
      const content = response.choices?.[0]?.message?.content;
      const parsed = extractJSON(content);
      const usage = response.usage || {};

      this._logger.info('structure: success', { elapsedMs: Math.round(elapsedMs) });

      return createChatResponse({
        success: true,
        content,
        model: response.model,
        parsed,
        schema,
        usage: createUsageStats(usage),
        execution_time_ms: elapsedMs,
      });
    } catch (err) {
      const elapsedMs = Date.now() - startTime;
      this._logger.error('structure: failed', { error: err.message });
      return createErrorResponse(err.message, elapsedMs);
    }
  }

  /**
   * Streaming chat completion (returns accumulated result).
   */
  async stream(prompt, options = {}) {
    const startTime = Date.now();
    this._logger.debug('stream: enter');

    try {
      const messages = [
        { role: 'system', content: this._systemPrompt },
        { role: 'user', content: prompt },
      ];

      const result = await accumulateStream(messages, {
        model: getModel(options.model || this._modelType),
        temperature: options.temperature,
      });

      const elapsedMs = Date.now() - startTime;

      let usage = null;
      if (result.usage) {
        usage = createUsageStats(result.usage);
      }

      this._logger.info('stream: success', {
        chunkCount: result.chunk_count,
        elapsedMs: Math.round(elapsedMs),
      });

      return createChatResponse({
        success: true,
        content: result.content,
        chunk_count: result.chunk_count,
        usage,
        execution_time_ms: elapsedMs,
      });
    } catch (err) {
      const elapsedMs = Date.now() - startTime;
      this._logger.error('stream: failed', { error: err.message });
      return createErrorResponse(err.message, elapsedMs);
    }
  }

  /**
   * Streaming chat completion as async generator.
   */
  async *streamGenerator(prompt, options = {}) {
    this._logger.debug('streamGenerator: enter');

    const messages = [
      { role: 'system', content: this._systemPrompt },
      { role: 'user', content: prompt },
    ];

    for await (const chunk of streamChatCompletion(messages, {
      model: getModel(options.model || this._modelType),
      temperature: options.temperature,
    })) {
      yield chunk;
    }
  }

  /**
   * Function calling (tool calls) with automatic execution.
   */
  async toolCall(prompt, options = {}) {
    const startTime = Date.now();
    this._logger.debug('toolCall: enter');

    try {
      const messages = [
        { role: 'system', content: 'You are a helpful assistant. Use the provided tools when appropriate.' },
        { role: 'user', content: prompt },
      ];

      const response = await chatCompletion(messages, {
        model: getModel(options.model || this._modelType),
        temperature: 0,
        tools: options.tools || DEFAULT_TOOLS,
        tool_choice: 'auto',
      });

      const elapsedMs = Date.now() - startTime;
      const choice = response.choices?.[0] || {};
      const toolCallsData = choice.message?.tool_calls || [];

      let toolResults = [];
      if (toolCallsData.length > 0) {
        const processed = processToolCalls(toolCallsData);
        toolResults = processed.map(r => createToolResult(
          r.id,
          r.function,
          r.arguments,
          r.result
        ));
      }

      this._logger.info('toolCall: success', {
        toolCount: toolResults.length,
        elapsedMs: Math.round(elapsedMs),
      });

      return createChatResponse({
        success: true,
        model: response.model,
        finish_reason: choice.finish_reason,
        content: choice.message?.content,
        tool_calls: toolResults,
        execution_time_ms: elapsedMs,
      });
    } catch (err) {
      const elapsedMs = Date.now() - startTime;
      this._logger.error('toolCall: failed', { error: err.message });
      return createErrorResponse(err.message, elapsedMs);
    }
  }

  /**
   * JSON schema validation with structured outputs.
   */
  async schemaMapping(prompt, schema, options = {}) {
    const startTime = Date.now();
    this._logger.debug('schemaMapping: enter');

    try {
      const messages = [
        { role: 'system', content: 'Return ONLY valid JSON. No markdown, no explanation.' },
        { role: 'user', content: prompt },
      ];

      const response = await chatCompletion(messages, {
        model: getModel(options.model || this._modelType),
        temperature: 0,
        response_format: { type: 'json_object' },
      });

      const elapsedMs = Date.now() - startTime;
      const content = response.choices?.[0]?.message?.content;
      const parsed = extractJSON(content);

      const validation = parsed
        ? validateSchema(parsed, schema)
        : { valid: false, errors: ['Failed to parse JSON'] };

      const usage = response.usage || {};

      this._logger.info('schemaMapping: success', { valid: validation.valid });

      return createChatResponse({
        success: true,
        content,
        model: response.model,
        parsed,
        schema,
        validation,
        usage: createUsageStats(usage),
        execution_time_ms: elapsedMs,
      });
    } catch (err) {
      const elapsedMs = Date.now() - startTime;
      this._logger.error('schemaMapping: failed', { error: err.message });
      return createErrorResponse(err.message, elapsedMs);
    }
  }

  /**
   * Multi-turn conversation.
   */
  async conversation(messages, options = {}) {
    const startTime = Date.now();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      this._logger.debug('conversation: invalid messages');
      return createErrorResponse('messages array is required');
    }

    this._logger.debug('conversation: enter', { turns: messages.length });

    try {
      const normalized = normalizeMessages(messages, true, this._systemPrompt);

      const response = await chatCompletion(normalized, {
        model: getModel(options.model || this._modelType),
        temperature: options.temperature,
        max_tokens: options.maxTokens,
      });

      const elapsedMs = Date.now() - startTime;
      const choice = response.choices?.[0] || {};
      const usage = response.usage || {};

      this._logger.info('conversation: success', { elapsedMs: Math.round(elapsedMs) });

      return createChatResponse({
        success: true,
        model: response.model,
        assistant_message: choice.message,
        finish_reason: choice.finish_reason,
        usage: createUsageStats(usage),
        execution_time_ms: elapsedMs,
      });
    } catch (err) {
      const elapsedMs = Date.now() - startTime;
      this._logger.error('conversation: failed', { error: err.message });
      return createErrorResponse(err.message, elapsedMs);
    }
  }

  /**
   * JSON mode - request JSON object response.
   */
  async jsonMode(prompt, options = {}) {
    const startTime = Date.now();
    this._logger.debug('jsonMode: enter');

    try {
      const messages = [{ role: 'user', content: prompt }];

      const response = await chatCompletion(messages, {
        model: getModel(options.model || this._modelType),
        temperature: 0,
        response_format: { type: 'json_object' },
      });

      const elapsedMs = Date.now() - startTime;
      const content = response.choices?.[0]?.message?.content;
      const parsed = extractJSON(content);
      const usage = response.usage || {};

      this._logger.info('jsonMode: success', { elapsedMs: Math.round(elapsedMs) });

      return createChatResponse({
        success: true,
        content,
        model: response.model,
        parsed,
        usage: createUsageStats(usage),
        execution_time_ms: elapsedMs,
      });
    } catch (err) {
      const elapsedMs = Date.now() - startTime;
      this._logger.error('jsonMode: failed', { error: err.message });
      return createErrorResponse(err.message, elapsedMs);
    }
  }

  /**
   * Stream format analysis - detailed chunk-by-chunk analysis.
   */
  async streamFormat(prompt, options = {}) {
    const startTime = Date.now();
    this._logger.debug('streamFormat: enter');

    try {
      const messages = [{ role: 'user', content: prompt }];

      const chunks = [];
      const accumulated = {
        id: null,
        model: null,
        role: null,
        content: '',
        finish_reason: null,
        usage: null,
      };

      for await (const data of streamChatCompletion(messages, {
        model: getModel(options.model || this._modelType),
        max_tokens: 50,
      })) {
        try {
          const parsed = JSON.parse(data);
          const chunkInfo = { raw_length: data.length };

          if (parsed.id) {
            accumulated.id = parsed.id;
            chunkInfo.id = parsed.id;
          }
          if (parsed.model) {
            accumulated.model = parsed.model;
            chunkInfo.model = parsed.model;
          }

          const choice = parsed.choices?.[0] || {};
          const delta = choice.delta || {};

          if (delta.role) {
            accumulated.role = delta.role;
            chunkInfo.role = delta.role;
          }
          if (delta.content) {
            accumulated.content += delta.content;
            chunkInfo.content = delta.content;
          }
          if (choice.finish_reason) {
            accumulated.finish_reason = choice.finish_reason;
            chunkInfo.finish_reason = choice.finish_reason;
          }
          if (parsed.usage) {
            accumulated.usage = parsed.usage;
            chunkInfo.usage = parsed.usage;
          }

          chunks.push(chunkInfo);
        } catch {
          chunks.push({ error: 'parse_error', raw: data.slice(0, 100) });
        }
      }

      const elapsedMs = Date.now() - startTime;

      this._logger.info('streamFormat: success', {
        chunkCount: chunks.length,
        elapsedMs: Math.round(elapsedMs),
      });

      return createChatResponse({
        success: true,
        chunk_count: chunks.length,
        chunks,
        accumulated,
        format_info: {
          content_type: 'text/event-stream',
          chunk_format: 'data: {"choices":[{"delta":{"content":"..."}}]}',
          end_marker: 'data: [DONE]',
        },
        execution_time_ms: elapsedMs,
      });
    } catch (err) {
      const elapsedMs = Date.now() - startTime;
      this._logger.error('streamFormat: failed', { error: err.message });
      return createErrorResponse(err.message, elapsedMs);
    }
  }

  /**
   * Connection pool demonstration with parallel requests.
   */
  async pool(prompt, options = {}) {
    const startTime = Date.now();
    const parallel = Math.max(1, Math.min(5, options.parallel || 3));
    this._logger.debug('pool: enter', { parallel });

    try {
      const messages = [
        { role: 'system', content: this._systemPrompt },
        { role: 'user', content: prompt },
      ];

      const tasks = Array(parallel).fill(null).map(() =>
        chatCompletion(messages, {
          model: getModel(options.model || this._modelType),
          max_tokens: 50,
        })
      );

      const results = await Promise.allSettled(tasks);

      const responses = results.map((r, i) => {
        if (r.status === 'rejected') {
          return { index: i, error: r.reason?.message || String(r.reason) };
        }
        return {
          index: i,
          content: r.value.choices?.[0]?.message?.content,
          model: r.value.model,
        };
      });

      const elapsedMs = Date.now() - startTime;

      this._logger.info('pool: success', {
        parallel,
        elapsedMs: Math.round(elapsedMs),
      });

      return createChatResponse({
        success: true,
        parsed: { parallel_requests: parallel, responses },
        execution_time_ms: elapsedMs,
      });
    } catch (err) {
      const elapsedMs = Date.now() - startTime;
      this._logger.error('pool: failed', { error: err.message });
      return createErrorResponse(err.message, elapsedMs);
    }
  }

  /**
   * Check client health and configuration.
   * Makes a minimal LLM call to verify connectivity.
   * @returns {Promise<object>} Health status with LLM connectivity check
   */
  async healthCheck() {
    const { healthCheck: performHealthCheck } = await import('./health-check.mjs');
    return performHealthCheck({
      modelType: this._modelType,
      systemPrompt: this._systemPrompt,
    });
  }
}

export default GeminiClient;
