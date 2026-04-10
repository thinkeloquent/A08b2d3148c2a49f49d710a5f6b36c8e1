/**
 * @fileoverview JSDoc type definitions for LLM synthesis.
 */

/**
 * @typedef {Object} SynthesisConfig
 * @property {string} [llmProvider='openai'] - Default provider
 * @property {string} [openaiModel='gpt-4o'] - OpenAI model name
 * @property {string} [anthropicModel='claude-sonnet-4-5-20250514'] - Anthropic model name
 * @property {string} [geminiModel='gemini-2.0-flash'] - Gemini model name
 * @property {string} [rerankerModel='gemini-2.0-flash'] - Reranker model name
 * @property {number} [temperature=0.2] - Default temperature
 * @property {number} [maxTokens=4096] - Default max tokens
 */

/**
 * @typedef {Object} AskOptions
 * @property {string} [systemPrompt] - Custom system prompt
 * @property {string} [provider] - Provider override
 * @property {string} [outputFormat='markdown'] - Desired output format
 * @property {string} [schemaLanguage] - Schema language identifier
 * @property {string} [schemaText] - Schema definition text
 * @property {string} [schemaName] - Schema name for native JSON mode
 */

export {};
