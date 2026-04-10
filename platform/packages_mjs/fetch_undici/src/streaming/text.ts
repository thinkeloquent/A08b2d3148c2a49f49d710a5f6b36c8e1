/**
 * Text streaming utilities for fetch-undici
 */

import { Readable } from 'stream'
import { logger } from '../logger.js'
import { iterBytes } from './bytes.js'

const log = logger.create('fetch-undici', import.meta.url)

/**
 * Iterate over readable stream as text chunks
 */
export async function* iterText(
  stream: Readable,
  encoding: BufferEncoding = 'utf-8'
): AsyncGenerator<string> {
  log.trace('Starting text iteration', { encoding })

  const decoder = new TextDecoder(encoding)

  for await (const chunk of iterBytes(stream)) {
    yield decoder.decode(chunk, { stream: true })
  }

  // Flush remaining
  const final = decoder.decode()
  if (final) {
    yield final
  }

  log.trace('Text iteration complete')
}

/**
 * Collect stream into string
 */
export async function collectText(
  stream: Readable,
  encoding: BufferEncoding = 'utf-8'
): Promise<string> {
  const chunks: string[] = []

  for await (const chunk of iterText(stream, encoding)) {
    chunks.push(chunk)
  }

  const result = chunks.join('')
  log.trace('Collected text', { length: result.length })

  return result
}
