/**
 * 04-streaming.mjs - Response Streaming Examples
 *
 * This file demonstrates how to stream response bodies
 * as bytes, text, and lines using fetch-undici.
 */

import {
  get,
  AsyncClient,
  Response
} from 'fetch-undici'

// =============================================================================
// Example 1: Basic Byte Streaming
// =============================================================================

export async function example1_byteStreaming() {
  console.log('=== Example 1: Basic Byte Streaming ===')

  const response = await get('https://jsonplaceholder.typicode.com/posts')

  let totalBytes = 0

  for await (const chunk of response.aiterBytes()) {
    totalBytes += chunk.length
    console.log(`Received chunk: ${chunk.length} bytes`)
  }

  console.log(`Total received: ${totalBytes} bytes`)
}

// =============================================================================
// Example 2: Text Streaming
// =============================================================================

export async function example2_textStreaming() {
  console.log('\n=== Example 2: Text Streaming ===')

  const response = await get('https://jsonplaceholder.typicode.com/posts/1')

  let fullText = ''

  for await (const text of response.aiterText()) {
    fullText += text
    console.log(`Received text chunk: ${text.length} characters`)
  }

  console.log(`Total text length: ${fullText.length} characters`)
}

// =============================================================================
// Example 3: Line-by-Line Streaming
// =============================================================================

export async function example3_lineStreaming() {
  console.log('\n=== Example 3: Line-by-Line Streaming ===')

  // Simulate line-based content
  const response = new Response({
    statusCode: 200,
    body: 'line 1\nline 2\nline 3\nline 4\nline 5'
  })

  let lineCount = 0

  for await (const line of response.aiterLines()) {
    lineCount++
    console.log(`Line ${lineCount}: ${line}`)
  }

  console.log(`Total lines: ${lineCount}`)
}

// =============================================================================
// Example 4: Streaming with Progress
// =============================================================================

export async function example4_streamingWithProgress() {
  console.log('\n=== Example 4: Streaming with Progress ===')

  const response = await get('https://jsonplaceholder.typicode.com/posts')

  // Get content length if available
  const contentLength = response.contentLength

  let downloadedBytes = 0

  for await (const chunk of response.aiterBytes()) {
    downloadedBytes += chunk.length

    if (contentLength) {
      const percent = ((downloadedBytes / contentLength) * 100).toFixed(1)
      console.log(`Progress: ${percent}% (${downloadedBytes}/${contentLength} bytes)`)
    } else {
      console.log(`Downloaded: ${downloadedBytes} bytes`)
    }
  }

  console.log('Download complete!')
}

// =============================================================================
// Example 5: Chunked Byte Streaming
// =============================================================================

export async function example5_chunkedStreaming() {
  console.log('\n=== Example 5: Chunked Byte Streaming ===')

  // Create a response with known content
  const response = new Response({
    statusCode: 200,
    body: Buffer.alloc(1000, 'a') // 1000 bytes of 'a'
  })

  let chunkCount = 0

  // Request specific chunk sizes
  for await (const chunk of response.aiterBytes(256)) {
    chunkCount++
    console.log(`Chunk ${chunkCount}: ${chunk.length} bytes`)
  }

  console.log(`Total chunks: ${chunkCount}`)
}

// =============================================================================
// Example 6: Text Streaming with Encoding
// =============================================================================

export async function example6_encodedTextStreaming() {
  console.log('\n=== Example 6: Text Streaming with Encoding ===')

  // Response with specific encoding
  const response = new Response({
    statusCode: 200,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
    body: 'Hello, World! Привет мир! 你好世界!'
  })

  for await (const text of response.aiterText('utf-8')) {
    console.log(`Text chunk: ${text}`)
  }
}

// =============================================================================
// Example 7: NDJSON Streaming
// =============================================================================

export async function example7_ndjsonStreaming() {
  console.log('\n=== Example 7: NDJSON Streaming ===')

  // Simulate NDJSON (newline-delimited JSON) response
  const ndjsonContent = [
    '{"id": 1, "event": "start"}',
    '{"id": 2, "event": "progress", "percent": 50}',
    '{"id": 3, "event": "progress", "percent": 100}',
    '{"id": 4, "event": "complete"}'
  ].join('\n')

  const response = new Response({
    statusCode: 200,
    headers: { 'content-type': 'application/x-ndjson' },
    body: ndjsonContent
  })

  for await (const line of response.aiterLines()) {
    if (line.trim()) {
      const event = JSON.parse(line)
      console.log(`Event ${event.id}:`, event.event, event.percent ? `(${event.percent}%)` : '')
    }
  }
}

// =============================================================================
// Example 8: Server-Sent Events Pattern
// =============================================================================

export async function example8_ssePattern() {
  console.log('\n=== Example 8: Server-Sent Events Pattern ===')

  // Simulate SSE response
  const sseContent = [
    'event: message',
    'data: {"text": "Hello"}',
    '',
    'event: message',
    'data: {"text": "World"}',
    '',
    'event: done',
    'data: {"status": "complete"}',
    ''
  ].join('\n')

  const response = new Response({
    statusCode: 200,
    headers: { 'content-type': 'text/event-stream' },
    body: sseContent
  })

  let currentEvent = null
  let currentData = null

  for await (const line of response.aiterLines()) {
    if (line.startsWith('event: ')) {
      currentEvent = line.slice(7)
    } else if (line.startsWith('data: ')) {
      currentData = line.slice(6)
    } else if (line === '' && currentEvent && currentData) {
      // Empty line = end of event
      const data = JSON.parse(currentData)
      console.log(`SSE Event [${currentEvent}]:`, data)
      currentEvent = null
      currentData = null
    }
  }
}

// =============================================================================
// Example 9: Streaming to Buffer
// =============================================================================

export async function example9_streamToBuffer() {
  console.log('\n=== Example 9: Streaming to Buffer ===')

  const response = await get('https://jsonplaceholder.typicode.com/posts/1')

  const chunks = []

  for await (const chunk of response.aiterBytes()) {
    chunks.push(chunk)
  }

  const fullBuffer = Buffer.concat(chunks)
  console.log(`Collected ${fullBuffer.length} bytes`)

  // Parse as JSON
  const data = JSON.parse(fullBuffer.toString())
  console.log('Post title:', data.title)
}

// =============================================================================
// Example 10: Early Stream Termination
// =============================================================================

export async function example10_earlyTermination() {
  console.log('\n=== Example 10: Early Stream Termination ===')

  const response = new Response({
    statusCode: 200,
    body: 'line 1\nline 2\nSTOP\nline 4\nline 5'
  })

  for await (const line of response.aiterLines()) {
    console.log('Read:', line)

    if (line === 'STOP') {
      console.log('Early termination!')
      break
    }
  }

  console.log('Stream terminated early')
}

// =============================================================================
// Example 11: Using iterBytes Convenience Function
// =============================================================================

import { iterBytes, iterText, iterLines } from 'fetch-undici'

export async function example11_convenienceFunctions() {
  console.log('\n=== Example 11: Convenience Functions ===')

  // Using iterBytes
  const byteResponse = new Response({
    statusCode: 200,
    body: Buffer.from('Hello, World!')
  })

  console.log('Using iterBytes:')
  for await (const chunk of iterBytes(byteResponse)) {
    console.log(`  Chunk: ${chunk.length} bytes`)
  }

  // Using iterText
  const textResponse = new Response({
    statusCode: 200,
    body: 'Hello, World!'
  })

  console.log('Using iterText:')
  for await (const text of iterText(textResponse)) {
    console.log(`  Text: ${text}`)
  }

  // Using iterLines
  const linesResponse = new Response({
    statusCode: 200,
    body: 'line 1\nline 2\nline 3'
  })

  console.log('Using iterLines:')
  for await (const line of iterLines(linesResponse)) {
    console.log(`  Line: ${line}`)
  }
}

// =============================================================================
// Main Runner
// =============================================================================

async function main() {
  try {
    await example1_byteStreaming()
    await example2_textStreaming()
    await example3_lineStreaming()
    await example4_streamingWithProgress()
    await example5_chunkedStreaming()
    await example6_encodedTextStreaming()
    await example7_ndjsonStreaming()
    await example8_ssePattern()
    await example9_streamToBuffer()
    await example10_earlyTermination()
    await example11_convenienceFunctions()

    console.log('\n=== All streaming examples completed! ===')
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
