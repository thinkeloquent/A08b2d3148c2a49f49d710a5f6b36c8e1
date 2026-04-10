# Server-Sent Events (SSE)

This document describes the Server-Sent Events protocol implementation used by the Gemini OpenAI SDK for streaming responses.

## Overview

SSE (Server-Sent Events) is a W3C standard for server-to-client streaming over HTTP. The Gemini API uses SSE for real-time streaming of chat completion responses.

## Protocol Specification

### HTTP Headers

**Request:**
```http
POST /v1beta/openai/chat/completions HTTP/1.1
Host: generativelanguage.googleapis.com
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

### Event Format

Each SSE event follows this format:

```
data: {"json":"payload"}\n\n
```

- Lines start with `data: ` prefix
- JSON payload follows the prefix
- Events are terminated by two newlines (`\n\n`)

### Stream Termination

The stream ends with a special marker:

```
data: [DONE]\n\n
```

## Message Structure

### First Chunk

Contains metadata and optionally the role:

```json
{
  "id": "chatcmpl-abc123def456",
  "object": "chat.completion.chunk",
  "created": 1700000000,
  "model": "gemini-2.0-flash",
  "choices": [{
    "index": 0,
    "delta": {
      "role": "assistant",
      "content": ""
    },
    "finish_reason": null
  }]
}
```

### Content Chunks

Contain incremental content:

```json
{
  "id": "chatcmpl-abc123def456",
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

### Final Chunk

Contains finish reason and optionally usage stats:

```json
{
  "id": "chatcmpl-abc123def456",
  "object": "chat.completion.chunk",
  "created": 1700000000,
  "model": "gemini-2.0-flash",
  "choices": [{
    "index": 0,
    "delta": {},
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 25,
    "total_tokens": 35
  }
}
```

## SDK Implementation

### Node.js (undici)

```javascript
// From client.mjs
export async function* streamChatCompletion(messages, options = {}) {
  const { statusCode, body } = await request(CHAT_ENDPOINT, {
    method: 'POST',
    headers: getHeaders(apiKey),
    body: JSON.stringify({ ...payload, stream: true }),
  });

  let buffer = '';

  for await (const chunk of body) {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('data: ')) {
        const data = trimmed.slice(6);
        if (data === '[DONE]') {
          return;
        }
        if (data) {
          yield data;
        }
      }
    }
  }
}
```

### Python (httpx)

```python
# From client.py
async def stream_chat_completion(messages, **options):
    async with httpx.AsyncClient() as client:
        async with client.stream(
            "POST",
            CHAT_ENDPOINT,
            headers=get_headers(api_key),
            json={**payload, "stream": True},
        ) as response:
            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    data = line[6:]
                    if data == "[DONE]":
                        return
                    if data:
                        yield data
```

## Client-Side Consumption

### Browser (EventSource)

```javascript
// Note: EventSource only supports GET, use fetch for POST
const response = await fetch('/api/chat/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello' })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();
let buffer = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split('\n');
  buffer = lines.pop() || '';

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') {
        console.log('Stream complete');
        return;
      }
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices[0]?.delta?.content;
        if (content) {
          console.log('Content:', content);
        }
      } catch (e) {
        console.error('Parse error:', e);
      }
    }
  }
}
```

### React Integration

```jsx
function StreamingChat() {
  const [content, setContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  async function handleSubmit(message) {
    setContent('');
    setIsStreaming(true);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          const parsed = JSON.parse(line.slice(6));
          const delta = parsed.choices[0]?.delta?.content || '';
          setContent(prev => prev + delta);
        }
      }
    }

    setIsStreaming(false);
  }

  return (
    <div>
      <div>{content}</div>
      {isStreaming && <span>Streaming...</span>}
    </div>
  );
}
```

## Server-Side Forwarding

### Fastify

```javascript
fastify.post('/api/chat/stream', async (request, reply) => {
  const { prompt } = request.body;

  reply.raw.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const client = new GeminiClient();

  for await (const chunk of client.streamGenerator(prompt)) {
    reply.raw.write(`data: ${chunk}\n\n`);
  }

  reply.raw.write('data: [DONE]\n\n');
  reply.raw.end();
});
```

### FastAPI

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()

@app.post("/api/chat/stream")
async def stream_chat(request: ChatRequest):
    client = GeminiClient()

    async def generate():
        async for chunk in client.stream_generator(request.prompt):
            yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    )
```

## Error Handling

### Connection Errors

```javascript
try {
  for await (const chunk of client.streamGenerator(prompt)) {
    // Process chunk
  }
} catch (error) {
  if (error.code === 'ECONNRESET') {
    console.log('Connection reset - retry');
  } else if (error.code === 'ETIMEDOUT') {
    console.log('Connection timeout');
  } else {
    console.log('Stream error:', error.message);
  }
}
```

### Parse Errors

```javascript
for await (const chunk of streamChatCompletion(messages)) {
  try {
    const parsed = JSON.parse(chunk);
    processChunk(parsed);
  } catch (e) {
    // Log but continue - some chunks may be partial
    console.warn('Parse error on chunk:', chunk.slice(0, 50));
  }
}
```

## Performance Considerations

### Buffer Management

```javascript
// Limit buffer size to prevent memory issues
const MAX_BUFFER_SIZE = 1024 * 1024; // 1MB

let buffer = '';
for await (const chunk of body) {
  buffer += chunk.toString();

  if (buffer.length > MAX_BUFFER_SIZE) {
    throw new Error('Buffer overflow - response too large');
  }

  // Process lines...
}
```

### Backpressure Handling

```javascript
async function* streamWithBackpressure(messages) {
  for await (const chunk of streamChatCompletion(messages)) {
    yield chunk;
    // Allow event loop to process other tasks
    await new Promise(resolve => setImmediate(resolve));
  }
}
```

## Comparison: SSE vs WebSockets

| Feature | SSE | WebSocket |
|---------|-----|-----------|
| Direction | Server → Client | Bidirectional |
| Protocol | HTTP | WS/WSS |
| Reconnection | Built-in | Manual |
| Binary data | No | Yes |
| Overhead | Lower | Higher |
| Use case | Streaming responses | Real-time chat |

## Related Documentation

- [STREAMING.md](./STREAMING.md) - Streaming API usage
- [STREAM_FORMAT.md](./STREAM_FORMAT.md) - Stream format analysis
- [SERVER_INTEGRATION.md](./SERVER_INTEGRATION.md) - Server framework integration
