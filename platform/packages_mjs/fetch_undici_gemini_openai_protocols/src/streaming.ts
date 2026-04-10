/**
 * Streaming Format Translation
 *
 * Handles translation between OpenAI SSE streaming format and Gemini streaming format.
 * Provides async iterators for real-time translation of streaming responses.
 */

import { Readable } from 'stream'
import { logger, iterSSE, iterLines } from 'fetch-undici'
import type {
  OpenAIStreamChunk,
  OpenAIDelta,
  OpenAIStreamChoice,
  GeminiGenerateResponse,
  GeminiCandidate,
  GeminiContent,
  TranslationResult,
} from './types.js'
import { mapGeminiFinishReason } from './response.js'
import { isGeminiFunctionCallPart, generateToolCallId } from './tools.js'
import { mapGeminiRoleToOpenAI } from './messages.js'

const log = logger.create('fetch-undici-gemini-openai-protocols:streaming', import.meta.url)

// =============================================================================
// OpenAI Streaming Types (extended for streaming)
// =============================================================================

/**
 * State for accumulating streamed content
 */
interface StreamAccumulator {
  id: string
  model: string
  content: string
  toolCalls: Map<number, {
    id: string
    name: string
    arguments: string
  }>
  role?: string
  finishReason: string | null
}

// =============================================================================
// Gemini → OpenAI Streaming Translation
// =============================================================================

/**
 * Convert a single Gemini streaming chunk to OpenAI format
 */
export function geminiChunkToOpenAI(
  chunk: GeminiGenerateResponse,
  options: {
    id?: string
    model?: string
    isFirst?: boolean
    idGenerator?: () => string
  } = {}
): TranslationResult<OpenAIStreamChunk> {
  const warnings: string[] = []
  const {
    id = `chatcmpl-${Date.now()}`,
    model = 'gemini-model',
    isFirst = false,
    idGenerator = generateToolCallId,
  } = options

  const choices: OpenAIStreamChoice[] = []

  for (const candidate of chunk.candidates || []) {
    const delta: OpenAIDelta = {}

    // On first chunk, include the role
    if (isFirst) {
      delta.role = mapGeminiRoleToOpenAI(candidate.content?.role || 'model')
    }

    // Extract text content
    if (candidate.content?.parts) {
      const textParts = candidate.content.parts.filter(
        (p): p is { text: string } => 'text' in p
      )
      if (textParts.length > 0) {
        delta.content = textParts.map(p => p.text).join('')
      }

      // Extract function calls
      const functionCallParts = candidate.content.parts.filter(isGeminiFunctionCallPart)
      if (functionCallParts.length > 0) {
        delta.tool_calls = functionCallParts.map((part, index) => ({
          index,
          id: idGenerator(),
          type: 'function' as const,
          function: {
            name: part.functionCall.name,
            arguments: JSON.stringify(part.functionCall.args),
          },
        }))
      }
    }

    choices.push({
      index: candidate.index ?? 0,
      delta,
      finish_reason: candidate.finishReason
        ? mapGeminiFinishReason(candidate.finishReason)
        : null,
    })
  }

  return {
    data: {
      id,
      object: 'chat.completion.chunk',
      created: Math.floor(Date.now() / 1000),
      model,
      choices,
    },
    warnings,
  }
}

/**
 * Create an async iterator that converts Gemini NDJSON stream to OpenAI SSE format
 */
export async function* geminiStreamToOpenAI(
  stream: Readable,
  options: {
    model?: string
    idGenerator?: () => string
  } = {}
): AsyncGenerator<string> {
  log.debug('Starting Gemini to OpenAI stream translation')

  const { model = 'gemini-model', idGenerator = generateToolCallId } = options
  const id = `chatcmpl-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

  let isFirst = true
  let chunkCount = 0

  for await (const line of iterLines(stream, 'utf-8')) {
    const trimmed = line.trim()
    if (!trimmed) continue

    try {
      const geminiChunk = JSON.parse(trimmed) as GeminiGenerateResponse
      const { data: openAIChunk } = geminiChunkToOpenAI(geminiChunk, {
        id,
        model,
        isFirst,
        idGenerator,
      })

      chunkCount++
      isFirst = false

      // Yield in SSE format
      yield `data: ${JSON.stringify(openAIChunk)}\n\n`
    } catch (err) {
      log.warn('Failed to parse Gemini streaming chunk', {
        error: (err as Error).message,
        line: trimmed.substring(0, 100),
      })
    }
  }

  // Send [DONE] marker
  yield 'data: [DONE]\n\n'

  log.debug('Gemini to OpenAI stream translation complete', { chunkCount })
}

// =============================================================================
// OpenAI → Gemini Streaming Translation
// =============================================================================

/**
 * Convert OpenAI SSE chunk to Gemini format
 */
export function openAIChunkToGemini(
  chunk: OpenAIStreamChunk,
  accumulator: StreamAccumulator
): TranslationResult<GeminiGenerateResponse | null> {
  const warnings: string[] = []

  const candidates: GeminiCandidate[] = []

  for (const choice of chunk.choices) {
    const { delta, finish_reason } = choice

    // Update accumulator
    if (delta.role) {
      accumulator.role = delta.role
    }

    if (delta.content) {
      accumulator.content += delta.content
    }

    // Handle tool calls (accumulated)
    if (delta.tool_calls) {
      for (const tc of delta.tool_calls) {
        const existing = accumulator.toolCalls.get(tc.index)
        if (existing) {
          if (tc.function?.arguments) {
            existing.arguments += tc.function.arguments
          }
        } else {
          accumulator.toolCalls.set(tc.index, {
            id: tc.id || generateToolCallId(),
            name: tc.function?.name || '',
            arguments: tc.function?.arguments || '',
          })
        }
      }
    }

    if (finish_reason) {
      accumulator.finishReason = finish_reason
    }

    // Build Gemini content from current delta
    const parts: GeminiContent['parts'] = []

    if (delta.content) {
      parts.push({ text: delta.content })
    }

    // Only emit function calls when complete (on finish)
    if (finish_reason && accumulator.toolCalls.size > 0) {
      for (const [, tc] of accumulator.toolCalls) {
        let args: Record<string, unknown>
        try {
          args = JSON.parse(tc.arguments)
        } catch {
          args = {}
        }
        parts.push({
          functionCall: {
            name: tc.name,
            args,
          },
        })
      }
    }

    if (parts.length > 0 || finish_reason) {
      candidates.push({
        content: {
          role: 'model',
          parts,
        },
        finishReason: finish_reason
          ? (['stop', 'tool_calls', 'function_call'].includes(finish_reason) ? 'STOP' : 'MAX_TOKENS')
          : undefined,
        index: choice.index,
      })
    }
  }

  // Only return a response if we have candidates
  if (candidates.length === 0) {
    return { data: null, warnings }
  }

  return {
    data: { candidates },
    warnings,
  }
}

/**
 * Create an async iterator that converts OpenAI SSE stream to Gemini NDJSON format
 */
export async function* openAIStreamToGemini(
  stream: Readable,
  _options: {
    model?: string
  } = {}
): AsyncGenerator<string> {
  log.debug('Starting OpenAI to Gemini stream translation')

  const accumulator: StreamAccumulator = {
    id: '',
    model: '',
    content: '',
    toolCalls: new Map(),
    finishReason: null,
  }

  let chunkCount = 0

  for await (const event of iterSSE(stream)) {
    // Skip empty data
    if (!event.data || event.data === '[DONE]') {
      continue
    }

    try {
      const openAIChunk = JSON.parse(event.data) as OpenAIStreamChunk

      // Update accumulator metadata
      if (!accumulator.id && openAIChunk.id) {
        accumulator.id = openAIChunk.id
      }
      if (!accumulator.model && openAIChunk.model) {
        accumulator.model = openAIChunk.model
      }

      const { data: geminiChunk } = openAIChunkToGemini(openAIChunk, accumulator)

      if (geminiChunk) {
        chunkCount++
        yield JSON.stringify(geminiChunk) + '\n'
      }
    } catch (err) {
      log.warn('Failed to parse OpenAI streaming chunk', {
        error: (err as Error).message,
      })
    }
  }

  log.debug('OpenAI to Gemini stream translation complete', { chunkCount })
}

// =============================================================================
// Stream Aggregation Utilities
// =============================================================================

/**
 * Aggregate OpenAI streaming chunks into a complete response
 */
export async function aggregateOpenAIStream(
  stream: Readable
): Promise<TranslationResult<OpenAIStreamChunk>> {
  log.debug('Aggregating OpenAI stream')

  const warnings: string[] = []
  let id = ''
  let model = ''
  let created = 0
  const content: string[] = []
  const toolCalls = new Map<number, {
    id: string
    type: 'function'
    function: { name: string; arguments: string }
  }>()
  let finishReason: string | null = null
  let role: string | undefined

  for await (const event of iterSSE(stream)) {
    if (!event.data || event.data === '[DONE]') continue

    try {
      const chunk = JSON.parse(event.data) as OpenAIStreamChunk

      // Capture metadata
      if (!id) id = chunk.id
      if (!model) model = chunk.model
      if (!created) created = chunk.created

      for (const choice of chunk.choices) {
        if (choice.delta.role && !role) {
          role = choice.delta.role
        }
        if (choice.delta.content) {
          content.push(choice.delta.content)
        }
        if (choice.delta.tool_calls) {
          for (const tc of choice.delta.tool_calls) {
            const existing = toolCalls.get(tc.index)
            if (existing) {
              if (tc.function?.arguments) {
                existing.function.arguments += tc.function.arguments
              }
            } else {
              toolCalls.set(tc.index, {
                id: tc.id || generateToolCallId(),
                type: 'function',
                function: {
                  name: tc.function?.name || '',
                  arguments: tc.function?.arguments || '',
                },
              })
            }
          }
        }
        if (choice.finish_reason) {
          finishReason = choice.finish_reason
        }
      }
    } catch (err) {
      warnings.push(`Failed to parse chunk: ${(err as Error).message}`)
    }
  }

  // Build final aggregated chunk
  const delta: OpenAIDelta = {}
  if (role) delta.role = role as OpenAIDelta['role']
  if (content.length > 0) delta.content = content.join('')
  if (toolCalls.size > 0) {
    delta.tool_calls = Array.from(toolCalls.entries()).map(([index, tc]) => ({
      index,
      id: tc.id,
      type: tc.type,
      function: tc.function,
    }))
  }

  return {
    data: {
      id,
      object: 'chat.completion.chunk',
      created,
      model,
      choices: [{
        index: 0,
        delta,
        finish_reason: finishReason,
      }],
    },
    warnings,
  }
}

/**
 * Aggregate Gemini NDJSON stream into a complete response
 */
export async function aggregateGeminiStream(
  stream: Readable
): Promise<TranslationResult<GeminiGenerateResponse>> {
  log.debug('Aggregating Gemini stream')

  const warnings: string[] = []
  const candidates = new Map<number, {
    content: GeminiContent
    finishReason?: GeminiCandidate['finishReason']
  }>()
  let usageMetadata: GeminiGenerateResponse['usageMetadata'] | undefined

  for await (const line of iterLines(stream, 'utf-8')) {
    const trimmed = line.trim()
    if (!trimmed) continue

    try {
      const chunk = JSON.parse(trimmed) as GeminiGenerateResponse

      // Aggregate candidates
      for (const candidate of chunk.candidates || []) {
        const index = candidate.index ?? 0
        const existing = candidates.get(index)

        if (existing) {
          // Merge parts
          if (candidate.content?.parts) {
            existing.content.parts.push(...candidate.content.parts)
          }
          if (candidate.finishReason) {
            existing.finishReason = candidate.finishReason
          }
        } else {
          candidates.set(index, {
            content: candidate.content || { role: 'model', parts: [] },
            finishReason: candidate.finishReason,
          })
        }
      }

      // Capture usage (usually in last chunk)
      if (chunk.usageMetadata) {
        usageMetadata = chunk.usageMetadata
      }
    } catch (err) {
      warnings.push(`Failed to parse chunk: ${(err as Error).message}`)
    }
  }

  // Build final response
  const finalCandidates: GeminiCandidate[] = Array.from(candidates.entries()).map(
    ([index, data]) => ({
      content: data.content,
      finishReason: data.finishReason,
      index,
    })
  )

  return {
    data: {
      candidates: finalCandidates,
      usageMetadata,
    },
    warnings,
  }
}
