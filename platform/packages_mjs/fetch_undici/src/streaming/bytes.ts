/**
 * Byte streaming utilities for fetch-undici
 */

import { Readable } from 'stream'
import { logger } from '../logger.js'

const log = logger.create('fetch-undici', import.meta.url)

/**
 * Iterate over readable stream as byte chunks
 */
export async function* iterBytes(
  stream: Readable,
  chunkSize?: number
): AsyncGenerator<Buffer> {
  log.trace('Starting byte iteration', { chunkSize })

  for await (const chunk of stream) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)

    if (chunkSize && buffer.length > chunkSize) {
      // Split into smaller chunks
      for (let i = 0; i < buffer.length; i += chunkSize) {
        yield buffer.subarray(i, Math.min(i + chunkSize, buffer.length))
      }
    } else {
      yield buffer
    }
  }

  log.trace('Byte iteration complete')
}

/**
 * Collect stream into buffer
 */
export async function collectBytes(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = []

  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  const result = Buffer.concat(chunks)
  log.trace('Collected bytes', { size: result.length })

  return result
}

/**
 * Create a passthrough stream that reports progress
 */
export function createProgressStream(
  onProgress: (bytesRead: number, totalBytes?: number) => void,
  totalBytes?: number
): {
  stream: Readable
  feed: (chunk: Buffer) => void
  end: () => void
} {
  let bytesRead = 0
  let ended = false

  const stream = new Readable({
    read() {
      // Chunks will be pushed via feed()
    }
  })

  return {
    stream,
    feed: (chunk: Buffer) => {
      if (ended) return
      bytesRead += chunk.length
      stream.push(chunk)
      onProgress(bytesRead, totalBytes)
    },
    end: () => {
      if (ended) return
      ended = true
      stream.push(null)
      log.trace('Progress stream ended', { bytesRead, totalBytes })
    }
  }
}
