/**
 * @fileoverview Multi-provider LLM synthesis client.
 */

import { extractJson } from './json-extractor.mjs';
import { buildFormatInstructions } from './structured-output.mjs';

/** @type {import('./types.mjs').SynthesisConfig} */
const DEFAULT_CONFIG = {
  llmProvider: 'openai',
  openaiModel: 'gpt-4o',
  anthropicModel: 'claude-sonnet-4-5-20250514',
  geminiModel: 'gemini-2.0-flash',
  rerankerModel: 'gemini-2.0-flash',
  temperature: 0.2,
  maxTokens: 4096,
};

export class LlmSynthesisClient {
  /**
   * @param {import('./types.mjs').SynthesisConfig} [config]
   */
  constructor(config) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this._openaiClient = null;
    this._anthropicClient = null;
    this._geminiClient = null;
  }

  async _getOpenaiClient() {
    if (!this._openaiClient) {
      const { getOpenaiClient } = await import('./providers/openai.mjs');
      this._openaiClient = await getOpenaiClient();
    }
    return this._openaiClient;
  }

  async _getAnthropicClient() {
    if (!this._anthropicClient) {
      const { getAnthropicClient } = await import('./providers/anthropic.mjs');
      this._anthropicClient = await getAnthropicClient();
    }
    return this._anthropicClient;
  }

  async _getGeminiClient() {
    if (!this._geminiClient) {
      const { getGeminiClient } = await import('./providers/gemini.mjs');
      this._geminiClient = await getGeminiClient();
    }
    return this._geminiClient;
  }

  /**
   * Ask the LLM a question with context.
   *
   * @param {string} question
   * @param {string} context
   * @param {import('./types.mjs').AskOptions} [opts]
   * @returns {Promise<string>}
   */
  async ask(question, context, opts = {}) {
    const {
      systemPrompt,
      provider,
      outputFormat = 'markdown',
      schemaLanguage,
      schemaText,
      schemaName,
    } = opts;

    const cfg = this.config;
    const prov = provider || cfg.llmProvider;
    let sysMsg = systemPrompt || 'You are a helpful assistant. Answer based on the provided context.';
    const userMsg = `Context:\n\n${context}\n\n---\n\nQuestion: ${question}`;

    // Determine enforcement strategy
    let useNative = false;
    let nativeSchema = null;
    if (outputFormat === 'json' && schemaLanguage === 'json_schema' && schemaText) {
      try {
        nativeSchema = JSON.parse(schemaText);
        useNative = true;
      } catch {
        useNative = false;
      }
    }

    // Anthropic never uses native enforcement
    if (prov === 'anthropic') {
      useNative = false;
    }

    // Prompt-engineering path
    if (!useNative) {
      sysMsg += buildFormatInstructions(outputFormat, schemaLanguage, schemaText);
    }

    if (prov === 'anthropic') {
      const client = await this._getAnthropicClient();
      const response = await client.messages.create({
        model: cfg.anthropicModel,
        max_tokens: cfg.maxTokens,
        system: sysMsg,
        messages: [{ role: 'user', content: userMsg }],
        temperature: cfg.temperature,
      });
      let text = response.content[0].text;
      if (outputFormat === 'json') {
        text = extractJson(text);
      }
      return text;
    }

    if (prov === 'gemini') {
      const client = await this._getGeminiClient();
      const kwargs = {};
      if (useNative && nativeSchema) {
        kwargs.response_format = {
          type: 'json_schema',
          json_schema: {
            name: schemaName || 'structured_output',
            schema: nativeSchema,
            strict: true,
          },
        };
      }
      const response = await client.chat.completions.create({
        model: cfg.geminiModel,
        messages: [
          { role: 'system', content: sysMsg },
          { role: 'user', content: userMsg },
        ],
        temperature: cfg.temperature,
        ...kwargs,
      });
      return response.choices[0].message.content;
    }

    // Default: OpenAI
    const client = await this._getOpenaiClient();
    const kwargs = {};
    if (useNative && nativeSchema) {
      kwargs.response_format = {
        type: 'json_schema',
        json_schema: {
          name: schemaName || 'structured_output',
          schema: nativeSchema,
          strict: true,
        },
      };
    }
    const response = await client.chat.completions.create({
      model: cfg.openaiModel,
      messages: [
        { role: 'system', content: sysMsg },
        { role: 'user', content: userMsg },
      ],
      temperature: cfg.temperature,
      ...kwargs,
    });
    return response.choices[0].message.content;
  }
}
