/**
 * fetch-undici-gemini-openai-protocols
 *
 * Gemini API client with OpenAI-compatible interface and protocol translation
 * layer between OpenAI and Gemini API formats.
 * Extends fetch-undici to enable the Polyglot Bridge pattern for seamless
 * interoperability between different LLM providers.
 *
 * Features:
 * - Message format translation (OpenAI messages ↔ Gemini contents)
 * - Tool call normalization (function_call/tool_calls ↔ functionCall)
 * - Response schema mapping (chat.completion ↔ generateContent)
 * - Streaming format translation (SSE ↔ NDJSON)
 *
 * @example
 * ```typescript
 * import {
 *   openAIMessagesToGemini,
 *   geminiToOpenAIResponse,
 *   geminiStreamToOpenAI,
 *   translateOpenAIRequestToGemini,
 * } from 'fetch-undici-gemini-openai-protocols'
 *
 * // Translate OpenAI messages to Gemini format
 * const { data } = openAIMessagesToGemini(openAIMessages)
 * const geminiRequest = { contents: data.contents, systemInstruction: data.systemInstruction }
 *
 * // Translate Gemini response back to OpenAI format
 * const { data: openAIResponse } = geminiToOpenAIResponse(geminiResponse)
 *
 * // Stream translation
 * for await (const chunk of geminiStreamToOpenAI(stream)) {
 *   process.stdout.write(chunk)
 * }
 *
 * // High-level request translation
 * const { data: geminiRequest } = translateOpenAIRequestToGemini(openAIRequest)
 * ```
 *
 * @packageDocumentation
 */

// =============================================================================
// Client
// =============================================================================

export {
  GeminiClient,
  getGeminiClient,
  closeGeminiClient,
  GEMINI_ORIGIN,
  GEMINI_CHAT_COMPLETIONS_PATH,
} from './client.js'
export type {
  ChatMessage,
  ChatCompletionRequest,
  ChatCompletionResponse,
  GeminiClientConfig,
} from './client.js'

// =============================================================================
// Types
// =============================================================================

export type {
  // OpenAI Types
  OpenAIRole,
  OpenAIFunctionCall,
  OpenAIToolCall,
  OpenAIMessage,
  OpenAIFunctionDefinition,
  OpenAITool,
  OpenAIJSONSchema,
  OpenAIChatRequest,
  OpenAIChoice,
  OpenAIUsage,
  OpenAIChatResponse,
  OpenAIDelta,
  OpenAIStreamChoice,
  OpenAIStreamChunk,
  // Gemini Types
  GeminiRole,
  GeminiTextPart,
  GeminiFunctionCallPart,
  GeminiFunctionResponsePart,
  GeminiInlineDataPart,
  GeminiPart,
  GeminiContent,
  GeminiFunctionDeclaration,
  GeminiSchema,
  GeminiTool,
  GeminiToolConfig,
  GeminiGenerationConfig,
  GeminiSafetySetting,
  GeminiSystemInstruction,
  GeminiGenerateRequest,
  GeminiCandidate,
  GeminiUsageMetadata,
  GeminiGenerateResponse,
  // Translation Types
  TranslationContext,
  TranslationResult,
} from './types.js'

// =============================================================================
// Message Translation
// =============================================================================

export {
  // Role mapping
  mapOpenAIRoleToGemini,
  mapGeminiRoleToOpenAI,
  // Message translation
  openAIMessagesToGemini,
  geminiToOpenAIMessages,
  // Validation
  validateOpenAIMessages,
  validateGeminiContents,
} from './messages.js'

// =============================================================================
// Tool Translation
// =============================================================================

export {
  // ID generation
  generateToolCallId,
  resetToolCallIdCounter,
  // Schema translation
  openAISchemaToGemini,
  geminiSchemaToOpenAI,
  // Tool definition translation
  openAIFunctionToGemini,
  geminiFunctionToOpenAI,
  openAIToolsToGemini,
  geminiToolsToOpenAI,
  // Tool choice/config translation
  openAIToolChoiceToGemini,
  geminiToolConfigToOpenAI,
  // Tool call translation
  openAIToolCallsToGemini,
  openAIFunctionCallToGemini,
  geminiFunctionCallsToOpenAI,
  // Utilities
  isGeminiFunctionCallPart,
  extractFunctionCalls,
} from './tools.js'

// =============================================================================
// Response Translation
// =============================================================================

export {
  // Finish reason mapping
  mapGeminiFinishReason,
  mapOpenAIFinishReason,
  // Usage translation
  geminiUsageToOpenAI,
  openAIUsageToGemini,
  // Response translation
  geminiToOpenAIResponse,
  openAIToGeminiResponse,
  // Structured output utilities
  extractJSON,
  validateAgainstSchema,
} from './response.js'

// =============================================================================
// Streaming Translation
// =============================================================================

export {
  // Chunk translation
  geminiChunkToOpenAI,
  openAIChunkToGemini,
  // Stream translation (async generators)
  geminiStreamToOpenAI,
  openAIStreamToGemini,
  // Stream aggregation
  aggregateOpenAIStream,
  aggregateGeminiStream,
} from './streaming.js'

// =============================================================================
// High-Level Translation Functions
// =============================================================================

import type {
  OpenAIChatRequest,
  OpenAIChatResponse,
  GeminiGenerateRequest,
  GeminiGenerateResponse,
  TranslationResult,
} from './types.js'
import { openAIMessagesToGemini, geminiToOpenAIMessages } from './messages.js'
import { openAIToolsToGemini, openAIToolChoiceToGemini, geminiToolsToOpenAI, geminiToolConfigToOpenAI } from './tools.js'
import { geminiToOpenAIResponse, openAIToGeminiResponse } from './response.js'

/**
 * Convert a complete OpenAI chat request to Gemini generateContent request
 */
export function translateOpenAIRequestToGemini(
  request: OpenAIChatRequest
): TranslationResult<GeminiGenerateRequest> {
  const warnings: string[] = []

  // Translate messages
  const { data: messageData, warnings: messageWarnings } = openAIMessagesToGemini(request.messages)
  warnings.push(...messageWarnings)

  // Build Gemini request
  const geminiRequest: GeminiGenerateRequest = {
    contents: messageData.contents,
  }

  // Add system instruction if present
  if (messageData.systemInstruction) {
    geminiRequest.systemInstruction = messageData.systemInstruction
  }

  // Translate tools if present
  if (request.tools && request.tools.length > 0) {
    const { data: tools, warnings: toolWarnings } = openAIToolsToGemini(request.tools)
    warnings.push(...toolWarnings)
    geminiRequest.tools = tools
  }

  // Translate tool choice if present
  if (request.tool_choice) {
    geminiRequest.toolConfig = openAIToolChoiceToGemini(request.tool_choice)
  }

  // Translate generation config
  const generationConfig: GeminiGenerateRequest['generationConfig'] = {}

  if (request.temperature !== undefined) {
    generationConfig.temperature = request.temperature
  }
  if (request.top_p !== undefined) {
    generationConfig.topP = request.top_p
  }
  if (request.max_tokens !== undefined) {
    generationConfig.maxOutputTokens = request.max_tokens
  }
  if (request.stop) {
    generationConfig.stopSequences = Array.isArray(request.stop) ? request.stop : [request.stop]
  }
  if (request.n !== undefined) {
    generationConfig.candidateCount = request.n
  }

  // Handle response format
  if (request.response_format) {
    if (request.response_format.type === 'json_object') {
      generationConfig.responseMimeType = 'application/json'
    } else if (request.response_format.type === 'json_schema' && request.response_format.json_schema) {
      generationConfig.responseMimeType = 'application/json'
    }
  }

  if (Object.keys(generationConfig).length > 0) {
    geminiRequest.generationConfig = generationConfig
  }

  return {
    data: geminiRequest,
    warnings,
  }
}

/**
 * Convert a complete Gemini generateContent request to OpenAI chat request
 */
export function translateGeminiRequestToOpenAI(
  request: GeminiGenerateRequest,
  model: string = 'gpt-4'
): TranslationResult<OpenAIChatRequest> {
  const warnings: string[] = []

  // Translate contents to messages
  const { data: messages, warnings: messageWarnings } = geminiToOpenAIMessages(
    request.contents,
    request.systemInstruction
  )
  warnings.push(...messageWarnings)

  // Build OpenAI request
  const openAIRequest: OpenAIChatRequest = {
    model,
    messages,
  }

  // Translate tools if present
  if (request.tools && request.tools.length > 0) {
    const { data: tools, warnings: toolWarnings } = geminiToolsToOpenAI(request.tools)
    warnings.push(...toolWarnings)
    openAIRequest.tools = tools
  }

  // Translate tool config if present
  if (request.toolConfig) {
    const toolChoice = geminiToolConfigToOpenAI(request.toolConfig)
    if (toolChoice) {
      openAIRequest.tool_choice = toolChoice
    }
  }

  // Translate generation config
  if (request.generationConfig) {
    const config = request.generationConfig

    if (config.temperature !== undefined) {
      openAIRequest.temperature = config.temperature
    }
    if (config.topP !== undefined) {
      openAIRequest.top_p = config.topP
    }
    if (config.maxOutputTokens !== undefined) {
      openAIRequest.max_tokens = config.maxOutputTokens
    }
    if (config.stopSequences) {
      openAIRequest.stop = config.stopSequences
    }
    if (config.candidateCount !== undefined) {
      openAIRequest.n = config.candidateCount
    }
    if (config.responseMimeType === 'application/json') {
      openAIRequest.response_format = { type: 'json_object' }
    }
  }

  return {
    data: openAIRequest,
    warnings,
  }
}

/**
 * Translate OpenAI response to Gemini format
 */
export function translateOpenAIResponseToGemini(
  response: OpenAIChatResponse
): TranslationResult<GeminiGenerateResponse> {
  return openAIToGeminiResponse(response)
}

/**
 * Translate Gemini response to OpenAI format
 */
export function translateGeminiResponseToOpenAI(
  response: GeminiGenerateResponse,
  options?: { model?: string; idGenerator?: () => string }
): TranslationResult<OpenAIChatResponse> {
  return geminiToOpenAIResponse(response, options)
}
