/**
 * Response Schema Mapping
 *
 * Converts between OpenAI chat completion responses and Gemini generateContent responses.
 * Handles structured output, finish reasons, and usage statistics.
 */

import { logger } from 'fetch-undici'
import type {
  OpenAIChatResponse,
  OpenAIChoice,
  OpenAIUsage,
  OpenAIMessage,
  GeminiGenerateResponse,
  GeminiCandidate,
  GeminiUsageMetadata,
  GeminiContent,
  GeminiFunctionCallPart,
  TranslationResult,
} from './types.js'
import {
  geminiFunctionCallsToOpenAI,
  isGeminiFunctionCallPart,
  generateToolCallId,
} from './tools.js'
import { mapGeminiRoleToOpenAI } from './messages.js'

const log = logger.create('fetch-undici-gemini-openai-protocols:response', import.meta.url)

// =============================================================================
// Finish Reason Mapping
// =============================================================================

type OpenAIFinishReason = 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'function_call' | null
type GeminiFinishReason = 'STOP' | 'MAX_TOKENS' | 'SAFETY' | 'RECITATION' | 'OTHER' | undefined

/**
 * Map Gemini finish reason to OpenAI finish reason
 */
export function mapGeminiFinishReason(reason: GeminiFinishReason): OpenAIFinishReason {
  switch (reason) {
    case 'STOP':
      return 'stop'
    case 'MAX_TOKENS':
      return 'length'
    case 'SAFETY':
    case 'RECITATION':
      return 'content_filter'
    case 'OTHER':
    default:
      return null
  }
}

/**
 * Map OpenAI finish reason to Gemini finish reason
 */
export function mapOpenAIFinishReason(reason: OpenAIFinishReason): GeminiFinishReason {
  switch (reason) {
    case 'stop':
      return 'STOP'
    case 'length':
      return 'MAX_TOKENS'
    case 'content_filter':
      return 'SAFETY'
    case 'tool_calls':
    case 'function_call':
      return 'STOP' // Tool calls are considered successful completion
    default:
      return 'OTHER'
  }
}

// =============================================================================
// Usage Statistics Mapping
// =============================================================================

/**
 * Convert Gemini usage metadata to OpenAI usage
 */
export function geminiUsageToOpenAI(metadata: GeminiUsageMetadata): OpenAIUsage {
  return {
    prompt_tokens: metadata.promptTokenCount,
    completion_tokens: metadata.candidatesTokenCount,
    total_tokens: metadata.totalTokenCount,
  }
}

/**
 * Convert OpenAI usage to Gemini usage metadata
 */
export function openAIUsageToGemini(usage: OpenAIUsage): GeminiUsageMetadata {
  return {
    promptTokenCount: usage.prompt_tokens,
    candidatesTokenCount: usage.completion_tokens,
    totalTokenCount: usage.total_tokens,
  }
}

// =============================================================================
// Gemini → OpenAI Response Translation
// =============================================================================

/**
 * Extract text content from Gemini content
 */
function extractTextContent(content: GeminiContent): string {
  return content.parts
    .filter((p): p is { text: string } => 'text' in p)
    .map(p => p.text)
    .join('')
}

/**
 * Extract function call parts from Gemini content
 */
function extractFunctionCallParts(content: GeminiContent): GeminiFunctionCallPart[] {
  return content.parts.filter(isGeminiFunctionCallPart)
}

/**
 * Convert Gemini candidate to OpenAI choice
 */
function geminiCandidateToOpenAIChoice(
  candidate: GeminiCandidate,
  index: number,
  idGenerator: () => string = generateToolCallId
): OpenAIChoice {
  const { content, finishReason } = candidate

  // Build the message
  const message: OpenAIMessage = {
    role: mapGeminiRoleToOpenAI(content.role),
    content: extractTextContent(content) || null,
  }

  // Check for function calls
  const functionCallParts = extractFunctionCallParts(content)
  if (functionCallParts.length > 0) {
    const { data: toolCalls } = geminiFunctionCallsToOpenAI(functionCallParts, idGenerator)
    message.tool_calls = toolCalls
    // If there are tool calls, the finish reason should reflect that
    return {
      index,
      message,
      finish_reason: toolCalls.length > 0 ? 'tool_calls' : mapGeminiFinishReason(finishReason),
    }
  }

  return {
    index,
    message,
    finish_reason: mapGeminiFinishReason(finishReason),
  }
}

/**
 * Convert Gemini generateContent response to OpenAI chat completion response
 */
export function geminiToOpenAIResponse(
  response: GeminiGenerateResponse,
  options: {
    model?: string
    idGenerator?: () => string
  } = {}
): TranslationResult<OpenAIChatResponse> {
  log.debug('Converting Gemini response to OpenAI', {
    candidateCount: response.candidates?.length ?? 0,
  })

  const warnings: string[] = []
  const { model = 'gemini-model', idGenerator = generateToolCallId } = options

  // Generate a unique ID
  const id = `chatcmpl-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

  // Convert candidates to choices
  const choices: OpenAIChoice[] = (response.candidates || []).map((candidate, index) =>
    geminiCandidateToOpenAIChoice(candidate, index, idGenerator)
  )

  // Handle blocked responses
  if (response.promptFeedback?.blockReason) {
    warnings.push(`Prompt blocked: ${response.promptFeedback.blockReason}`)
  }

  const result: OpenAIChatResponse = {
    id,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model,
    choices,
  }

  // Add usage if available
  if (response.usageMetadata) {
    result.usage = geminiUsageToOpenAI(response.usageMetadata)
  }

  log.debug('Converted to OpenAI response', {
    id: result.id,
    choiceCount: choices.length,
    hasUsage: !!result.usage,
  })

  return {
    data: result,
    warnings,
  }
}

// =============================================================================
// OpenAI → Gemini Response Translation
// =============================================================================

/**
 * Convert OpenAI message to Gemini content
 */
function openAIMessageToGeminiContent(message: OpenAIMessage): GeminiContent {
  const parts: GeminiContent['parts'] = []

  // Add text content
  if (message.content) {
    parts.push({ text: message.content })
  }

  // Add function calls
  if (message.tool_calls) {
    for (const toolCall of message.tool_calls) {
      if (toolCall.type === 'function') {
        let args: Record<string, unknown>
        try {
          args = JSON.parse(toolCall.function.arguments)
        } catch {
          args = {}
        }
        parts.push({
          functionCall: {
            name: toolCall.function.name,
            args,
          },
        })
      }
    }
  }

  // Handle legacy function_call
  if (message.function_call) {
    let args: Record<string, unknown>
    try {
      args = JSON.parse(message.function_call.arguments)
    } catch {
      args = {}
    }
    parts.push({
      functionCall: {
        name: message.function_call.name,
        args,
      },
    })
  }

  return {
    role: message.role === 'assistant' ? 'model' : 'user',
    parts,
  }
}

/**
 * Convert OpenAI choice to Gemini candidate
 */
function openAIChoiceToGeminiCandidate(choice: OpenAIChoice): GeminiCandidate {
  return {
    content: openAIMessageToGeminiContent(choice.message),
    finishReason: mapOpenAIFinishReason(choice.finish_reason),
    index: choice.index,
  }
}

/**
 * Convert OpenAI chat completion response to Gemini generateContent response
 */
export function openAIToGeminiResponse(
  response: OpenAIChatResponse
): TranslationResult<GeminiGenerateResponse> {
  log.debug('Converting OpenAI response to Gemini', {
    id: response.id,
    choiceCount: response.choices.length,
  })

  const warnings: string[] = []

  const result: GeminiGenerateResponse = {
    candidates: response.choices.map(openAIChoiceToGeminiCandidate),
  }

  // Add usage metadata if available
  if (response.usage) {
    result.usageMetadata = openAIUsageToGemini(response.usage)
  }

  log.debug('Converted to Gemini response', {
    candidateCount: result.candidates.length,
    hasUsage: !!result.usageMetadata,
  })

  return {
    data: result,
    warnings,
  }
}

// =============================================================================
// Structured Output Helpers
// =============================================================================

/**
 * Extract JSON from response content (handles markdown code blocks)
 */
export function extractJSON<T = unknown>(content: string): T | null {
  // Try direct parse first
  try {
    return JSON.parse(content) as T
  } catch {
    // Try to extract from markdown code block
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1].trim()) as T
      } catch {
        // Fall through
      }
    }

    // Try to find JSON object in content
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as T
      } catch {
        // Fall through
      }
    }

    return null
  }
}

/**
 * Validate response against JSON schema (basic validation)
 */
export function validateAgainstSchema(
  data: unknown,
  _schema: Record<string, unknown>
): { valid: boolean; errors: string[] } {
  // Basic type validation - full JSON Schema validation would require a library
  if (data === null || data === undefined) {
    return { valid: false, errors: ['Data is null or undefined'] }
  }

  // For now, just check it's an object (full validation would use ajv or similar)
  if (typeof data !== 'object') {
    return { valid: false, errors: ['Data is not an object'] }
  }

  return { valid: true, errors: [] }
}
