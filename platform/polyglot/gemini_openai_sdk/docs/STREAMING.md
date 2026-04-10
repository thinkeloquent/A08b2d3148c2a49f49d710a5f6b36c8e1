# Streaming

This document describes the streaming capabilities of the Gemini OpenAI SDK.

## Overview

Streaming allows you to receive chat completion responses incrementally, providing a better user experience for long responses. The SDK provides multiple streaming approaches:

| Method | Returns | Use Case |
|--------|---------|----------|
| `stream()` | Accumulated result | Simple streaming with final result |
| `streamGenerator()` | Async generator | Fine-grained control over chunks |
| `streamFormat()` | Detailed analysis | Debugging and protocol analysis |

## Quick Start

### Python

```python
from gemini_openai_sdk import GeminiClient

async def main():
    client = GeminiClient()

    # Simple streaming (accumulates result)
    result = await client.stream("Tell me a story")
    print(result.content)

    # Generator streaming (chunk by chunk)
    async for chunk in client.stream_generator("Tell me a story"):
        parsed = json.loads(chunk)
        content = parsed["choices"][0]["delta"].get("content", "")
        print(content, end="", flush=True)
```

### Node.js

```javascript
import { GeminiClient } from 'gemini-openai-sdk';

async function main() {
  const client = new GeminiClient();

  // Simple streaming (accumulates result)
  const result = await client.stream('Tell me a story');
  console.log(result.content);

  // Generator streaming (chunk by chunk)
  for await (const chunk of client.streamGenerator('Tell me a story')) {
    const parsed = JSON.parse(chunk);
    const content = parsed.choices[0]?.delta?.content || '';
    process.stdout.write(content);
  }
}
```

## API Reference

### stream()

Streams the response and returns accumulated content.

**Python:**
```python
async def stream(
    prompt: str,
    model: Optional[str] = None,
    temperature: Optional[float] = None,
) -> ChatResponse
```

**Node.js:**
```javascript
async stream(prompt, options = {})
// options: { model, temperature }
```

**Response:**
```javascript
{
  success: true,
  content: "Full accumulated response text...",
  chunk_count: 25,
  usage: {
    prompt_tokens: 10,
    completion_tokens: 150,
    total_tokens: 160
  },
  execution_time_ms: 2500
}
```

### streamGenerator()

Yields raw JSON chunks for custom processing.

**Python:**
```python
async def stream_generator(
    prompt: str,
    model: Optional[str] = None,
    temperature: Optional[float] = None,
) -> AsyncGenerator[str, None]
```

**Node.js:**
```javascript
async *streamGenerator(prompt, options = {})
// Yields: JSON string chunks
```

**Chunk Format:**
```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion.chunk",
  "created": 1700000000,
  "model": "gemini-2.0-flash",
  "choices": [{
    "index": 0,
    "delta": {
      "content": "Hello"
    },
    "finish_reason": null
  }]
}
```

## Usage Patterns

### 1. Simple Accumulated Response

Best for: Getting complete response with metadata

```python
result = await client.stream("Explain quantum computing")

if result.success:
    print(f"Response: {result.content}")
    print(f"Chunks received: {result.chunk_count}")
    print(f"Time: {result.execution_time_ms}ms")
```

### 2. Real-Time Display

Best for: Showing response as it generates

```python
import sys

async for chunk in client.stream_generator("Write a poem"):
    try:
        parsed = json.loads(chunk)
        content = parsed["choices"][0]["delta"].get("content", "")
        sys.stdout.write(content)
        sys.stdout.flush()
    except json.JSONDecodeError:
        pass

print()  # Newline at end
```

### 3. Progress Tracking

Best for: Showing progress indicators

```javascript
let totalChunks = 0;
let content = '';

for await (const chunk of client.streamGenerator(prompt)) {
  totalChunks++;
  const parsed = JSON.parse(chunk);
  const delta = parsed.choices[0]?.delta?.content || '';
  content += delta;

  // Update progress every 5 chunks
  if (totalChunks % 5 === 0) {
    updateProgress(totalChunks, content.length);
  }
}
```

### 4. Cancellation Support

Best for: User-initiated cancellation

```javascript
const controller = new AbortController();

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
  for await (const chunk of client.streamGenerator(prompt)) {
    if (controller.signal.aborted) {
      console.log('Stream cancelled by user');
      break;
    }
    processChunk(chunk);
  }
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Stream aborted');
  }
}
```

### 5. Buffered Processing

Best for: Processing complete sentences

```python
buffer = ""

async for chunk in client.stream_generator(prompt):
    parsed = json.loads(chunk)
    content = parsed["choices"][0]["delta"].get("content", "")
    buffer += content

    # Process complete sentences
    while ". " in buffer:
        sentence, buffer = buffer.split(". ", 1)
        await process_sentence(sentence + ".")

# Process remaining buffer
if buffer.strip():
    await process_sentence(buffer)
```

## Server Integration

### Fastify (Node.js)

```javascript
fastify.post('/api/stream', async (request, reply) => {
  const { prompt } = request.body;
  const client = new GeminiClient();

  reply.raw.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  try {
    for await (const chunk of client.streamGenerator(prompt)) {
      reply.raw.write(`data: ${chunk}\n\n`);
    }
    reply.raw.write('data: [DONE]\n\n');
  } catch (error) {
    reply.raw.write(`data: {"error": "${error.message}"}\n\n`);
  }

  reply.raw.end();
});
```

### FastAPI (Python)

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()

@app.post("/api/stream")
async def stream_endpoint(request: ChatRequest):
    client = GeminiClient()

    async def event_generator():
        try:
            async for chunk in client.stream_generator(request.prompt):
                yield f"data: {chunk}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f'data: {{"error": "{str(e)}"}}\n\n'

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )
```

## Error Handling

### Stream-Level Errors

```python
try:
    result = await client.stream("Hello")
    if not result.success:
        print(f"Stream error: {result.error}")
except Exception as e:
    print(f"Connection error: {e}")
```

### Chunk-Level Errors

```javascript
for await (const chunk of client.streamGenerator(prompt)) {
  try {
    const parsed = JSON.parse(chunk);

    // Check for error in response
    if (parsed.error) {
      console.error('API Error:', parsed.error);
      break;
    }

    processChunk(parsed);
  } catch (e) {
    // JSON parse error - skip malformed chunk
    console.warn('Malformed chunk:', chunk.slice(0, 50));
  }
}
```

## Performance Tips

### 1. Use Appropriate Method

```javascript
// For simple use cases - use stream()
const result = await client.stream(prompt);

// For custom processing - use streamGenerator()
for await (const chunk of client.streamGenerator(prompt)) { ... }

// For debugging only - use streamFormat()
const analysis = await client.streamFormat(prompt);
```

### 2. Minimize Processing Per Chunk

```javascript
// Good: Quick processing
for await (const chunk of client.streamGenerator(prompt)) {
  const parsed = JSON.parse(chunk);
  appendToUI(parsed.choices[0]?.delta?.content || '');
}

// Avoid: Heavy processing per chunk
for await (const chunk of client.streamGenerator(prompt)) {
  const parsed = JSON.parse(chunk);
  await heavyDatabaseOperation(parsed);  // Blocks stream
}
```

### 3. Buffer for Batch Processing

```python
chunks = []
async for chunk in client.stream_generator(prompt):
    chunks.append(chunk)
    if len(chunks) >= 10:
        await batch_process(chunks)
        chunks = []

if chunks:
    await batch_process(chunks)
```

## Comparison with Non-Streaming

| Aspect | Streaming | Non-Streaming |
|--------|-----------|---------------|
| First token | ~100ms | ~1-3s |
| Memory usage | Lower | Higher (full response) |
| Error recovery | Per-chunk | All-or-nothing |
| Progress feedback | Yes | No |
| Complexity | Higher | Lower |

## Related Documentation

- [SSE.md](./SSE.md) - Server-Sent Events protocol
- [STREAM_FORMAT.md](./STREAM_FORMAT.md) - Stream format analysis
- [API_REFERENCE.md](./API_REFERENCE.md) - Complete API reference
- [SERVER_INTEGRATION.md](./SERVER_INTEGRATION.md) - Framework integration
