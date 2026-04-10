# Stream Format Analysis

This document describes the stream format analysis capabilities of the Gemini OpenAI SDK.

## Overview

The `streamFormat()` method provides detailed chunk-by-chunk analysis of streaming responses, enabling deep inspection of the SSE (Server-Sent Events) protocol and response structure.

## Use Cases

- **Debugging**: Inspect raw chunk data during development
- **Protocol Analysis**: Understand SSE stream structure
- **Performance Profiling**: Measure chunk timing and sizes
- **Client Development**: Build custom stream processors

## API Reference

### Python

```python
async def stream_format(
    prompt: str,
    model: Optional[str] = None,
) -> ChatResponse
```

### Node.js

```javascript
async streamFormat(prompt, options = {})
```

## Response Structure

```javascript
{
  success: true,
  chunk_count: 15,
  chunks: [
    {
      raw_length: 245,
      id: "chatcmpl-abc123",
      model: "gemini-2.0-flash",
      role: "assistant",      // First chunk only
      content: "Hello"        // Content delta
    },
    {
      raw_length: 89,
      content: " there"
    },
    // ... more chunks
    {
      raw_length: 156,
      finish_reason: "stop",
      usage: {
        prompt_tokens: 10,
        completion_tokens: 25,
        total_tokens: 35
      }
    }
  ],
  accumulated: {
    id: "chatcmpl-abc123",
    model: "gemini-2.0-flash",
    role: "assistant",
    content: "Hello there! How can I help you today?",
    finish_reason: "stop",
    usage: { ... }
  },
  format_info: {
    content_type: "text/event-stream",
    chunk_format: "data: {\"choices\":[{\"delta\":{\"content\":\"...\"}}]}",
    end_marker: "data: [DONE]"
  },
  execution_time_ms: 1250
}
```

## Chunk Analysis Fields

| Field | Description |
|-------|-------------|
| `raw_length` | Byte length of the raw JSON data |
| `id` | Response ID (first chunk only) |
| `model` | Model name (first chunk only) |
| `role` | Assistant role (first chunk only) |
| `content` | Content delta for this chunk |
| `finish_reason` | Completion reason (final chunk) |
| `usage` | Token usage stats (final chunk) |

## Usage Examples

### Python

```python
from gemini_openai_sdk import GeminiClient

async def analyze_stream():
    client = GeminiClient()

    result = await client.stream_format("Explain quantum computing briefly")

    if result.success:
        print(f"Total chunks: {result.chunk_count}")
        print(f"Format: {result.format_info['content_type']}")

        # Analyze individual chunks
        for i, chunk in enumerate(result.chunks):
            if chunk.get('content'):
                print(f"Chunk {i}: {len(chunk['content'])} chars")

        # Get accumulated content
        print(f"\nFull response: {result.accumulated['content']}")
```

### Node.js

```javascript
import { GeminiClient } from 'gemini-openai-sdk';

async function analyzeStream() {
  const client = new GeminiClient();

  const result = await client.streamFormat('Explain quantum computing briefly');

  if (result.success) {
    console.log(`Total chunks: ${result.chunk_count}`);
    console.log(`Format: ${result.format_info.content_type}`);

    // Analyze individual chunks
    result.chunks.forEach((chunk, i) => {
      if (chunk.content) {
        console.log(`Chunk ${i}: ${chunk.content.length} chars`);
      }
    });

    // Get accumulated content
    console.log(`\nFull response: ${result.accumulated.content}`);
  }
}
```

## Streaming Protocol Details

### SSE Format

Each chunk follows the Server-Sent Events specification:

```
data: {"id":"chatcmpl-abc","choices":[{"delta":{"content":"Hello"}}]}\n\n
```

### Chunk Structure

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion.chunk",
  "created": 1700000000,
  "model": "gemini-2.0-flash",
  "choices": [{
    "index": 0,
    "delta": {
      "role": "assistant",     // First chunk only
      "content": "chunk text"  // Content delta
    },
    "finish_reason": null      // "stop" on final chunk
  }],
  "usage": null                // Present on final chunk only
}
```

### End Marker

The stream terminates with:

```
data: [DONE]\n\n
```

## Comparison with Regular Streaming

| Feature | `stream()` | `streamFormat()` |
|---------|-----------|------------------|
| Returns | Accumulated content | Detailed chunk analysis |
| Purpose | Production use | Debugging/analysis |
| Overhead | Minimal | Higher (stores all chunks) |
| Chunk access | No | Yes, with metadata |

## Error Handling

```python
result = await client.stream_format("Hello")

if not result.success:
    print(f"Error: {result.error}")
else:
    # Check for parse errors in chunks
    for chunk in result.chunks:
        if chunk.get('error') == 'parse_error':
            print(f"Parse error on chunk: {chunk.get('raw')}")
```

## Best Practices

1. **Development Only**: Use for debugging; switch to `stream()` for production
2. **Memory Awareness**: Large responses store all chunks in memory
3. **Error Checking**: Handle potential parse errors in chunk array
4. **Timeout Configuration**: Set appropriate timeouts for long responses

## Related Documentation

- [STREAMING.md](./STREAMING.md) - General streaming documentation
- [SSE.md](./SSE.md) - Server-Sent Events protocol
- [API_REFERENCE.md](./API_REFERENCE.md) - Complete API reference
