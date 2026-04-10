/**
 * Tool Call Normalization
 *
 * Maps between OpenAI function_call/tool_calls and Gemini functionCall format.
 * Handles tool definitions, tool calls in messages, and tool responses.
 */

import { logger } from 'fetch-undici'
import type {
  OpenAITool,
  OpenAIFunctionDefinition,
  OpenAIToolCall,
  OpenAIFunctionCall,
  OpenAIJSONSchema,
  GeminiTool,
  GeminiFunctionDeclaration,
  GeminiFunctionCallPart,
  GeminiSchema,
  GeminiToolConfig,
  TranslationResult,
} from './types.js'

const log = logger.create('fetch-undici-gemini-openai-protocols:tools', import.meta.url)

// =============================================================================
// Tool Call ID Generation
// =============================================================================

let toolCallIdCounter = 0

/**
 * Generate a unique tool call ID (OpenAI format)
 */
export function generateToolCallId(): string {
  toolCallIdCounter++
  return `call_${Date.now()}_${toolCallIdCounter}`
}

/**
 * Reset tool call ID counter (for testing)
 */
export function resetToolCallIdCounter(): void {
  toolCallIdCounter = 0
}

// =============================================================================
// Schema Translation
// =============================================================================

/**
 * Convert OpenAI JSON Schema to Gemini Schema
 */
export function openAISchemaToGemini(schema: OpenAIJSONSchema): GeminiSchema {
  const result: GeminiSchema = {
    type: schema.type ?? 'object',
  }

  if (schema.description) {
    result.description = schema.description
  }

  if (schema.properties) {
    result.properties = {}
    for (const [key, value] of Object.entries(schema.properties)) {
      result.properties[key] = openAISchemaToGemini(value)
    }
  }

  if (schema.required) {
    result.required = schema.required
  }

  if (schema.items) {
    result.items = openAISchemaToGemini(schema.items)
  }

  if (schema.enum) {
    result.enum = schema.enum.map(String)
  }

  return result
}

/**
 * Convert Gemini Schema to OpenAI JSON Schema
 */
export function geminiSchemaToOpenAI(schema: GeminiSchema): OpenAIJSONSchema {
  const result: OpenAIJSONSchema = {
    type: schema.type,
  }

  if (schema.description) {
    result.description = schema.description
  }

  if (schema.properties) {
    result.properties = {}
    for (const [key, value] of Object.entries(schema.properties)) {
      result.properties[key] = geminiSchemaToOpenAI(value)
    }
  }

  if (schema.required) {
    result.required = schema.required
  }

  if (schema.items) {
    result.items = geminiSchemaToOpenAI(schema.items)
  }

  if (schema.enum) {
    result.enum = schema.enum
  }

  return result
}

// =============================================================================
// Tool Definition Translation
// =============================================================================

/**
 * Convert OpenAI function definition to Gemini function declaration
 */
export function openAIFunctionToGemini(
  func: OpenAIFunctionDefinition
): GeminiFunctionDeclaration {
  const declaration: GeminiFunctionDeclaration = {
    name: func.name,
  }

  if (func.description) {
    declaration.description = func.description
  }

  if (func.parameters) {
    declaration.parameters = openAISchemaToGemini(func.parameters)
  }

  return declaration
}

/**
 * Convert Gemini function declaration to OpenAI function definition
 */
export function geminiFunctionToOpenAI(
  declaration: GeminiFunctionDeclaration
): OpenAIFunctionDefinition {
  const func: OpenAIFunctionDefinition = {
    name: declaration.name,
  }

  if (declaration.description) {
    func.description = declaration.description
  }

  if (declaration.parameters) {
    func.parameters = geminiSchemaToOpenAI(declaration.parameters)
  }

  return func
}

/**
 * Convert OpenAI tools to Gemini tools
 */
export function openAIToolsToGemini(tools: OpenAITool[]): TranslationResult<GeminiTool[]> {
  log.debug('Converting OpenAI tools to Gemini', { toolCount: tools.length })

  const warnings: string[] = []
  const declarations: GeminiFunctionDeclaration[] = []

  for (const tool of tools) {
    if (tool.type !== 'function') {
      warnings.push(`Skipping unsupported tool type: ${tool.type}`)
      continue
    }
    declarations.push(openAIFunctionToGemini(tool.function))
  }

  // Gemini groups all functions into a single tool object
  const geminiTools: GeminiTool[] = declarations.length > 0
    ? [{ functionDeclarations: declarations }]
    : []

  return {
    data: geminiTools,
    warnings,
  }
}

/**
 * Convert Gemini tools to OpenAI tools
 */
export function geminiToolsToOpenAI(tools: GeminiTool[]): TranslationResult<OpenAITool[]> {
  log.debug('Converting Gemini tools to OpenAI', { toolCount: tools.length })

  const warnings: string[] = []
  const openAITools: OpenAITool[] = []

  for (const tool of tools) {
    if (tool.functionDeclarations) {
      for (const declaration of tool.functionDeclarations) {
        openAITools.push({
          type: 'function',
          function: geminiFunctionToOpenAI(declaration),
        })
      }
    }
  }

  return {
    data: openAITools,
    warnings,
  }
}

// =============================================================================
// Tool Choice Translation
// =============================================================================

/**
 * Convert OpenAI tool_choice to Gemini toolConfig
 */
export function openAIToolChoiceToGemini(
  toolChoice: 'none' | 'auto' | 'required' | { type: 'function'; function: { name: string } }
): GeminiToolConfig {
  if (toolChoice === 'none') {
    return {
      functionCallingConfig: {
        mode: 'NONE',
      },
    }
  }

  if (toolChoice === 'auto') {
    return {
      functionCallingConfig: {
        mode: 'AUTO',
      },
    }
  }

  if (toolChoice === 'required') {
    return {
      functionCallingConfig: {
        mode: 'ANY',
      },
    }
  }

  // Specific function
  if (typeof toolChoice === 'object' && toolChoice.function) {
    return {
      functionCallingConfig: {
        mode: 'ANY',
        allowedFunctionNames: [toolChoice.function.name],
      },
    }
  }

  // Default to auto
  return {
    functionCallingConfig: {
      mode: 'AUTO',
    },
  }
}

/**
 * Convert Gemini toolConfig to OpenAI tool_choice
 */
export function geminiToolConfigToOpenAI(
  config: GeminiToolConfig
): 'none' | 'auto' | 'required' | { type: 'function'; function: { name: string } } | undefined {
  if (!config.functionCallingConfig) {
    return undefined
  }

  const { mode, allowedFunctionNames } = config.functionCallingConfig

  if (mode === 'NONE') {
    return 'none'
  }

  if (mode === 'AUTO') {
    return 'auto'
  }

  if (mode === 'ANY') {
    // Check if specific function is required
    if (allowedFunctionNames && allowedFunctionNames.length === 1) {
      return {
        type: 'function',
        function: { name: allowedFunctionNames[0] },
      }
    }
    return 'required'
  }

  return 'auto'
}

// =============================================================================
// Tool Call Translation (in messages/responses)
// =============================================================================

/**
 * Convert OpenAI tool calls to Gemini function call parts
 */
export function openAIToolCallsToGemini(
  toolCalls: OpenAIToolCall[]
): TranslationResult<GeminiFunctionCallPart[]> {
  log.debug('Converting OpenAI tool calls to Gemini', { count: toolCalls.length })

  const warnings: string[] = []
  const parts: GeminiFunctionCallPart[] = []

  for (const call of toolCalls) {
    if (call.type !== 'function') {
      warnings.push(`Skipping unsupported tool call type: ${call.type}`)
      continue
    }

    let args: Record<string, unknown>
    try {
      args = JSON.parse(call.function.arguments)
    } catch {
      warnings.push(`Failed to parse arguments for tool call ${call.id}`)
      args = {}
    }

    parts.push({
      functionCall: {
        name: call.function.name,
        args,
      },
    })
  }

  return {
    data: parts,
    warnings,
  }
}

/**
 * Convert legacy OpenAI function_call to Gemini function call part
 */
export function openAIFunctionCallToGemini(
  functionCall: OpenAIFunctionCall
): TranslationResult<GeminiFunctionCallPart> {
  let args: Record<string, unknown>
  try {
    args = JSON.parse(functionCall.arguments)
  } catch {
    args = {}
    return {
      data: {
        functionCall: {
          name: functionCall.name,
          args,
        },
      },
      warnings: ['Failed to parse function_call arguments'],
    }
  }

  return {
    data: {
      functionCall: {
        name: functionCall.name,
        args,
      },
    },
    warnings: [],
  }
}

/**
 * Convert Gemini function call parts to OpenAI tool calls
 */
export function geminiFunctionCallsToOpenAI(
  parts: GeminiFunctionCallPart[],
  generateId: () => string = generateToolCallId
): TranslationResult<OpenAIToolCall[]> {
  log.debug('Converting Gemini function calls to OpenAI', { count: parts.length })

  const warnings: string[] = []
  const toolCalls: OpenAIToolCall[] = []

  for (const part of parts) {
    toolCalls.push({
      id: generateId(),
      type: 'function',
      function: {
        name: part.functionCall.name,
        arguments: JSON.stringify(part.functionCall.args),
      },
    })
  }

  return {
    data: toolCalls,
    warnings,
  }
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Check if a Gemini part is a function call
 */
export function isGeminiFunctionCallPart(part: unknown): part is GeminiFunctionCallPart {
  return (
    typeof part === 'object' &&
    part !== null &&
    'functionCall' in part &&
    typeof (part as GeminiFunctionCallPart).functionCall === 'object'
  )
}

/**
 * Extract function calls from Gemini parts
 */
export function extractFunctionCalls(parts: unknown[]): GeminiFunctionCallPart[] {
  return parts.filter(isGeminiFunctionCallPart)
}
