/**
 * Message Format Translation
 *
 * Converts between OpenAI chat message format and Gemini content format.
 * Handles role mapping, content structure, and system instructions.
 */

import { logger } from 'fetch-undici'
import type {
  OpenAIMessage,
  OpenAIRole,
  GeminiContent,
  GeminiPart,
  GeminiRole,
  GeminiSystemInstruction,
  GeminiTextPart,
  GeminiFunctionResponsePart,
  TranslationContext,
  TranslationResult,
} from './types.js'

const log = logger.create('fetch-undici-gemini-openai-protocols', import.meta.url)

// =============================================================================
// Role Mapping
// =============================================================================

const OPENAI_TO_GEMINI_ROLE: Record<OpenAIRole, GeminiRole | 'system'> = {
  system: 'system', // Special handling
  user: 'user',
  assistant: 'model',
  tool: 'user', // Tool responses go as user
  function: 'user', // Legacy function responses
}

const GEMINI_TO_OPENAI_ROLE: Record<GeminiRole, OpenAIRole> = {
  user: 'user',
  model: 'assistant',
}

/**
 * Map OpenAI role to Gemini role
 */
export function mapOpenAIRoleToGemini(role: OpenAIRole): GeminiRole | 'system' {
  return OPENAI_TO_GEMINI_ROLE[role] ?? 'user'
}

/**
 * Map Gemini role to OpenAI role
 */
export function mapGeminiRoleToOpenAI(role: GeminiRole): OpenAIRole {
  return GEMINI_TO_OPENAI_ROLE[role] ?? 'user'
}

// =============================================================================
// OpenAI → Gemini Translation
// =============================================================================

/**
 * Convert OpenAI message to Gemini content parts
 */
function openAIMessageToParts(message: OpenAIMessage): GeminiPart[] {
  const parts: GeminiPart[] = []

  // Handle text content
  if (message.content) {
    parts.push({ text: message.content })
  }

  // Handle tool/function response
  if (message.role === 'tool' && message.tool_call_id && message.content) {
    // Tool response format
    parts.push({
      functionResponse: {
        name: message.name ?? 'unknown',
        response: {
          result: message.content,
        },
      },
    } as GeminiFunctionResponsePart)
  }

  // Handle legacy function response
  if (message.role === 'function' && message.name && message.content) {
    parts.push({
      functionResponse: {
        name: message.name,
        response: {
          result: message.content,
        },
      },
    } as GeminiFunctionResponsePart)
  }

  return parts
}

/**
 * Convert OpenAI messages to Gemini contents and system instruction
 */
export function openAIMessagesToGemini(
  messages: OpenAIMessage[],
  _context?: TranslationContext
): TranslationResult<{ contents: GeminiContent[]; systemInstruction?: GeminiSystemInstruction }> {
  log.debug('Converting OpenAI messages to Gemini', { messageCount: messages.length })

  const warnings: string[] = []
  const contents: GeminiContent[] = []
  let systemInstruction: GeminiSystemInstruction | undefined

  // Group consecutive messages by role for Gemini format
  let currentContent: GeminiContent | null = null

  for (const message of messages) {
    // Handle system messages separately
    if (message.role === 'system') {
      if (systemInstruction) {
        // Append to existing system instruction
        if (message.content) {
          systemInstruction.parts.push({ text: message.content })
        }
      } else {
        // Create new system instruction
        systemInstruction = {
          parts: message.content ? [{ text: message.content }] : [],
        }
      }
      continue
    }

    const geminiRole = mapOpenAIRoleToGemini(message.role)
    if (geminiRole === 'system') {
      continue // Already handled
    }

    const parts = openAIMessageToParts(message)

    // If empty parts, skip or add warning
    if (parts.length === 0) {
      if (message.tool_calls && message.tool_calls.length > 0) {
        // Assistant message with tool calls but no content - valid
        // We'll handle tool calls in the tool translator
        continue
      }
      warnings.push(`Skipped empty message with role: ${message.role}`)
      continue
    }

    // Gemini requires alternating user/model roles
    // If same role as current, append parts
    if (currentContent && currentContent.role === geminiRole) {
      currentContent.parts.push(...parts)
    } else {
      // Push current and start new
      if (currentContent) {
        contents.push(currentContent)
      }
      currentContent = {
        role: geminiRole,
        parts,
      }
    }
  }

  // Push final content
  if (currentContent) {
    contents.push(currentContent)
  }

  log.debug('Converted to Gemini format', {
    contentCount: contents.length,
    hasSystemInstruction: !!systemInstruction,
    warnings: warnings.length,
  })

  return {
    data: { contents, systemInstruction },
    warnings,
  }
}

// =============================================================================
// Gemini → OpenAI Translation
// =============================================================================

/**
 * Check if a part is a text part
 */
function isTextPart(part: GeminiPart): part is GeminiTextPart {
  return 'text' in part
}

/**
 * Check if a part is a function response part
 */
function isFunctionResponsePart(part: GeminiPart): part is GeminiFunctionResponsePart {
  return 'functionResponse' in part
}

/**
 * Extract text content from Gemini parts
 */
function extractTextFromParts(parts: GeminiPart[]): string {
  return parts
    .filter(isTextPart)
    .map(p => p.text)
    .join('')
}

/**
 * Convert Gemini content to OpenAI message
 */
function geminiContentToOpenAI(content: GeminiContent): OpenAIMessage[] {
  const messages: OpenAIMessage[] = []
  const role = mapGeminiRoleToOpenAI(content.role)

  // Check for function responses (these become separate tool messages)
  const functionResponses = content.parts.filter(isFunctionResponsePart)
  if (functionResponses.length > 0) {
    for (const fr of functionResponses) {
      messages.push({
        role: 'tool',
        content: JSON.stringify(fr.functionResponse.response),
        name: fr.functionResponse.name,
        tool_call_id: `call_${fr.functionResponse.name}`, // Synthesize ID
      })
    }
  }

  // Extract text content
  const textContent = extractTextFromParts(content.parts)
  if (textContent || content.parts.length === 0) {
    messages.push({
      role,
      content: textContent || null,
    })
  }

  return messages
}

/**
 * Convert Gemini contents and system instruction to OpenAI messages
 */
export function geminiToOpenAIMessages(
  contents: GeminiContent[],
  systemInstruction?: GeminiSystemInstruction,
  _context?: TranslationContext
): TranslationResult<OpenAIMessage[]> {
  log.debug('Converting Gemini contents to OpenAI', {
    contentCount: contents.length,
    hasSystemInstruction: !!systemInstruction,
  })

  const warnings: string[] = []
  const messages: OpenAIMessage[] = []

  // Add system instruction as first message
  if (systemInstruction && systemInstruction.parts.length > 0) {
    const systemText = extractTextFromParts(systemInstruction.parts)
    if (systemText) {
      messages.push({
        role: 'system',
        content: systemText,
      })
    }
  }

  // Convert contents
  for (const content of contents) {
    const converted = geminiContentToOpenAI(content)
    messages.push(...converted)
  }

  log.debug('Converted to OpenAI format', {
    messageCount: messages.length,
    warnings: warnings.length,
  })

  return {
    data: messages,
    warnings,
  }
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Validate OpenAI messages
 */
export function validateOpenAIMessages(messages: OpenAIMessage[]): string[] {
  const errors: string[] = []

  if (!Array.isArray(messages)) {
    errors.push('messages must be an array')
    return errors
  }

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]
    if (!msg.role) {
      errors.push(`Message ${i}: missing role`)
    }
    if (msg.content === undefined && !msg.tool_calls && !msg.function_call) {
      errors.push(`Message ${i}: missing content, tool_calls, or function_call`)
    }
  }

  return errors
}

/**
 * Validate Gemini contents
 */
export function validateGeminiContents(contents: GeminiContent[]): string[] {
  const errors: string[] = []

  if (!Array.isArray(contents)) {
    errors.push('contents must be an array')
    return errors
  }

  for (let i = 0; i < contents.length; i++) {
    const content = contents[i]
    if (!content.role) {
      errors.push(`Content ${i}: missing role`)
    }
    if (!content.parts || !Array.isArray(content.parts)) {
      errors.push(`Content ${i}: missing or invalid parts`)
    }
  }

  // Check for alternating roles (Gemini requirement)
  for (let i = 1; i < contents.length; i++) {
    if (contents[i].role === contents[i - 1].role) {
      errors.push(`Content ${i}: consecutive messages with same role '${contents[i].role}'`)
    }
  }

  return errors
}
