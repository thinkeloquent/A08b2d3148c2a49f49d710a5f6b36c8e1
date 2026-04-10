/**
 * Protocol Translation Types
 *
 * Type definitions for OpenAI and Gemini API formats to enable
 * bidirectional protocol translation.
 */

// =============================================================================
// OpenAI Types
// =============================================================================

/**
 * OpenAI chat message role
 */
export type OpenAIRole = 'system' | 'user' | 'assistant' | 'tool' | 'function'

/**
 * OpenAI function call in a message
 */
export interface OpenAIFunctionCall {
  name: string
  arguments: string // JSON string
}

/**
 * OpenAI tool call in a message
 */
export interface OpenAIToolCall {
  id: string
  type: 'function'
  function: OpenAIFunctionCall
}

/**
 * OpenAI chat message
 */
export interface OpenAIMessage {
  role: OpenAIRole
  content: string | null
  name?: string
  function_call?: OpenAIFunctionCall
  tool_calls?: OpenAIToolCall[]
  tool_call_id?: string
}

/**
 * OpenAI function definition for tools
 */
export interface OpenAIFunctionDefinition {
  name: string
  description?: string
  parameters?: OpenAIJSONSchema
}

/**
 * OpenAI tool definition
 */
export interface OpenAITool {
  type: 'function'
  function: OpenAIFunctionDefinition
}

/**
 * OpenAI JSON Schema (subset)
 */
export interface OpenAIJSONSchema {
  type?: string
  properties?: Record<string, OpenAIJSONSchema>
  required?: string[]
  items?: OpenAIJSONSchema
  enum?: unknown[]
  description?: string
  [key: string]: unknown
}

/**
 * OpenAI chat completion request
 */
export interface OpenAIChatRequest {
  model: string
  messages: OpenAIMessage[]
  temperature?: number
  top_p?: number
  n?: number
  stream?: boolean
  stop?: string | string[]
  max_tokens?: number
  presence_penalty?: number
  frequency_penalty?: number
  logit_bias?: Record<string, number>
  user?: string
  tools?: OpenAITool[]
  tool_choice?: 'none' | 'auto' | 'required' | { type: 'function'; function: { name: string } }
  response_format?: { type: 'text' | 'json_object' | 'json_schema'; json_schema?: OpenAIJSONSchema }
}

/**
 * OpenAI chat completion choice
 */
export interface OpenAIChoice {
  index: number
  message: OpenAIMessage
  finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'function_call' | null
}

/**
 * OpenAI usage stats
 */
export interface OpenAIUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

/**
 * OpenAI chat completion response
 */
export interface OpenAIChatResponse {
  id: string
  object: 'chat.completion'
  created: number
  model: string
  choices: OpenAIChoice[]
  usage?: OpenAIUsage
  system_fingerprint?: string
}

/**
 * OpenAI streaming delta
 */
export interface OpenAIDelta {
  role?: OpenAIRole
  content?: string
  function_call?: Partial<OpenAIFunctionCall>
  tool_calls?: Array<{
    index: number
    id?: string
    type?: 'function'
    function?: Partial<OpenAIFunctionCall>
  }>
}

/**
 * OpenAI streaming choice
 */
export interface OpenAIStreamChoice {
  index: number
  delta: OpenAIDelta
  finish_reason: string | null
}

/**
 * OpenAI streaming chunk
 */
export interface OpenAIStreamChunk {
  id: string
  object: 'chat.completion.chunk'
  created: number
  model: string
  choices: OpenAIStreamChoice[]
  system_fingerprint?: string
}

// =============================================================================
// Gemini Types
// =============================================================================

/**
 * Gemini content role
 */
export type GeminiRole = 'user' | 'model'

/**
 * Gemini text part
 */
export interface GeminiTextPart {
  text: string
}

/**
 * Gemini function call part
 */
export interface GeminiFunctionCallPart {
  functionCall: {
    name: string
    args: Record<string, unknown>
  }
}

/**
 * Gemini function response part
 */
export interface GeminiFunctionResponsePart {
  functionResponse: {
    name: string
    response: Record<string, unknown>
  }
}

/**
 * Gemini inline data part (images, etc.)
 */
export interface GeminiInlineDataPart {
  inlineData: {
    mimeType: string
    data: string // base64
  }
}

/**
 * Gemini content part (union type)
 */
export type GeminiPart =
  | GeminiTextPart
  | GeminiFunctionCallPart
  | GeminiFunctionResponsePart
  | GeminiInlineDataPart

/**
 * Gemini content (message)
 */
export interface GeminiContent {
  role: GeminiRole
  parts: GeminiPart[]
}

/**
 * Gemini function declaration
 */
export interface GeminiFunctionDeclaration {
  name: string
  description?: string
  parameters?: GeminiSchema
}

/**
 * Gemini schema (JSON Schema-like)
 */
export interface GeminiSchema {
  type: string
  properties?: Record<string, GeminiSchema>
  required?: string[]
  items?: GeminiSchema
  enum?: string[]
  description?: string
  format?: string
  nullable?: boolean
}

/**
 * Gemini tool
 */
export interface GeminiTool {
  functionDeclarations: GeminiFunctionDeclaration[]
}

/**
 * Gemini tool config
 */
export interface GeminiToolConfig {
  functionCallingConfig?: {
    mode: 'AUTO' | 'ANY' | 'NONE'
    allowedFunctionNames?: string[]
  }
}

/**
 * Gemini generation config
 */
export interface GeminiGenerationConfig {
  temperature?: number
  topP?: number
  topK?: number
  maxOutputTokens?: number
  stopSequences?: string[]
  candidateCount?: number
  responseMimeType?: string
  responseSchema?: GeminiSchema
}

/**
 * Gemini safety setting
 */
export interface GeminiSafetySetting {
  category: string
  threshold: string
}

/**
 * Gemini system instruction
 */
export interface GeminiSystemInstruction {
  parts: GeminiPart[]
}

/**
 * Gemini generateContent request
 */
export interface GeminiGenerateRequest {
  contents: GeminiContent[]
  systemInstruction?: GeminiSystemInstruction
  tools?: GeminiTool[]
  toolConfig?: GeminiToolConfig
  generationConfig?: GeminiGenerationConfig
  safetySettings?: GeminiSafetySetting[]
}

/**
 * Gemini candidate
 */
export interface GeminiCandidate {
  content: GeminiContent
  finishReason?: 'STOP' | 'MAX_TOKENS' | 'SAFETY' | 'RECITATION' | 'OTHER'
  index?: number
  safetyRatings?: Array<{
    category: string
    probability: string
    blocked?: boolean
  }>
}

/**
 * Gemini usage metadata
 */
export interface GeminiUsageMetadata {
  promptTokenCount: number
  candidatesTokenCount: number
  totalTokenCount: number
}

/**
 * Gemini generateContent response
 */
export interface GeminiGenerateResponse {
  candidates: GeminiCandidate[]
  usageMetadata?: GeminiUsageMetadata
  promptFeedback?: {
    blockReason?: string
    safetyRatings?: Array<{
      category: string
      probability: string
    }>
  }
}

// =============================================================================
// Translation Context
// =============================================================================

/**
 * Context for protocol translation
 */
export interface TranslationContext {
  /** Source format */
  source: 'openai' | 'gemini'
  /** Target format */
  target: 'openai' | 'gemini'
  /** Model mapping (optional) */
  modelMap?: Record<string, string>
  /** Whether to preserve extra fields */
  preserveExtras?: boolean
  /** Custom tool call ID generator */
  generateToolCallId?: () => string
}

/**
 * Translation result with metadata
 */
export interface TranslationResult<T> {
  /** Translated data */
  data: T
  /** Any warnings during translation */
  warnings: string[]
  /** Original fields that couldn't be mapped */
  unmapped?: Record<string, unknown>
}
