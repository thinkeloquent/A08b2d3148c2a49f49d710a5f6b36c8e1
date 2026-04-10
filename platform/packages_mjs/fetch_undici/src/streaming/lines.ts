/**
 * Line streaming utilities for fetch-undici
 */

import { Readable } from 'stream'
import { logger } from '../logger.js'
import { iterText } from './text.js'

const log = logger.create('fetch-undici', import.meta.url)

/**
 * Iterate over readable stream line by line
 */
export async function* iterLines(
  stream: Readable,
  encoding: BufferEncoding = 'utf-8'
): AsyncGenerator<string> {
  log.trace('Starting line iteration', { encoding })

  let buffer = ''
  let lineCount = 0

  for await (const chunk of iterText(stream, encoding)) {
    buffer += chunk
    const lines = buffer.split('\n')

    // Keep last partial line in buffer
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      lineCount++
      yield line
    }
  }

  // Yield remaining content
  if (buffer) {
    lineCount++
    yield buffer
  }

  log.trace('Line iteration complete', { lineCount })
}

/**
 * Iterate over NDJSON (Newline Delimited JSON) stream
 */
export async function* iterNDJSON<T = unknown>(
  stream: Readable,
  encoding: BufferEncoding = 'utf-8'
): AsyncGenerator<T> {
  log.trace('Starting NDJSON iteration', { encoding })

  let objectCount = 0

  for await (const line of iterLines(stream, encoding)) {
    const trimmed = line.trim()
    if (!trimmed) continue

    try {
      objectCount++
      yield JSON.parse(trimmed) as T
    } catch (err) {
      log.warn('Failed to parse NDJSON line', {
        lineNumber: objectCount,
        error: (err as Error).message
      })
      throw err
    }
  }

  log.trace('NDJSON iteration complete', { objectCount })
}

/**
 * Collect stream into array of lines
 */
export async function collectLines(
  stream: Readable,
  encoding: BufferEncoding = 'utf-8'
): Promise<string[]> {
  const lines: string[] = []

  for await (const line of iterLines(stream, encoding)) {
    lines.push(line)
  }

  log.trace('Collected lines', { count: lines.length })

  return lines
}

/**
 * Iterate over Server-Sent Events stream
 */
export async function* iterSSE(stream: Readable): AsyncGenerator<{
  event?: string
  data: string
  id?: string
  retry?: number
}> {
  log.trace('Starting SSE iteration')

  let currentEvent: { event?: string; data: string[]; id?: string; retry?: number } = {
    data: []
  }

  for await (const line of iterLines(stream, 'utf-8')) {
    if (line === '') {
      // Empty line = dispatch event
      if (currentEvent.data.length > 0) {
        yield {
          event: currentEvent.event,
          data: currentEvent.data.join('\n'),
          id: currentEvent.id,
          retry: currentEvent.retry
        }
      }
      currentEvent = { data: [] }
      continue
    }

    // Parse SSE field
    const colonIndex = line.indexOf(':')

    if (colonIndex === 0) {
      // Comment (starts with :)
      continue
    }

    let field: string
    let value: string

    if (colonIndex === -1) {
      field = line
      value = ''
    } else {
      field = line.slice(0, colonIndex)
      value = line.slice(colonIndex + 1)
      // Remove single leading space if present
      if (value.startsWith(' ')) {
        value = value.slice(1)
      }
    }

    switch (field) {
      case 'event':
        currentEvent.event = value
        break
      case 'data':
        currentEvent.data.push(value)
        break
      case 'id':
        currentEvent.id = value
        break
      case 'retry':
        const retry = parseInt(value, 10)
        if (!isNaN(retry)) {
          currentEvent.retry = retry
        }
        break
    }
  }

  // Dispatch any remaining event
  if (currentEvent.data.length > 0) {
    yield {
      event: currentEvent.event,
      data: currentEvent.data.join('\n'),
      id: currentEvent.id,
      retry: currentEvent.retry
    }
  }

  log.trace('SSE iteration complete')
}
