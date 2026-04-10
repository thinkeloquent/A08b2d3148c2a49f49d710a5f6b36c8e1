# Server Integration Guide for Gemini OpenAI SDK

This guide covers integration patterns for Fastify (Node.js) and FastAPI (Python) frameworks.

## Fastify Integration (Node.js)

The integration uses Fastify's plugin system to register the SDK client as a decorator, making it available throughout the application.

### Pattern: Fastify Plugin

```typescript
import Fastify from 'fastify';
import fp from 'fastify-plugin';
import { GeminiClient } from 'gemini-openai-sdk';

/**
 * Gemini SDK Plugin for Fastify
 */
const geminiPlugin = fp(async (fastify, opts) => {
  // Initialize client
  const client = new GeminiClient({
    model: opts.model || 'flash',
    systemPrompt: opts.systemPrompt,
  });

  // Health check on startup
  const health = client.healthCheck();
  fastify.log.info({ status: health.status }, 'Gemini SDK initialized');

  // Decorate fastify instance
  fastify.decorate('gemini', client);

  // Cleanup hook
  fastify.addHook('onClose', async () => {
    fastify.log.info('Gemini SDK cleanup');
  });
});

export default geminiPlugin;
```

### Usage

```typescript
import Fastify from 'fastify';
import geminiPlugin from './plugins/gemini.mjs';

const server = Fastify({ logger: true });

// Register plugin
await server.register(geminiPlugin, {
  model: 'flash',
  systemPrompt: 'You are a helpful assistant.',
});

// Use in routes
server.post('/api/chat', async function (request, reply) {
  const { prompt } = request.body;

  const result = await this.gemini.chat(prompt);

  return {
    success: result.success,
    content: result.content,
    error: result.error,
  };
});

await server.listen({ port: 3000 });
```

### Type Augmentation (TypeScript)

If using TypeScript, augment the FastifyInstance type:

```typescript
declare module 'fastify' {
  interface FastifyInstance {
    gemini: GeminiClient;
  }
}
```

### Route Examples

```typescript
// Health endpoint
server.get('/api/llm/gemini-openai-v1/health', async function () {
  return this.gemini.healthCheck();
});

// Chat endpoint
server.post('/api/llm/gemini-openai-v1/chat', {
  schema: {
    body: {
      type: 'object',
      required: ['prompt'],
      properties: {
        prompt: { type: 'string' },
        model: { type: 'string' },
        temperature: { type: 'number' },
      },
    },
  },
}, async function (request) {
  const { prompt, model, temperature } = request.body;
  return this.gemini.chat(prompt, { model, temperature });
});

// Structure endpoint
server.post('/api/llm/gemini-openai-v1/structure', async function (request) {
  const { prompt, schema } = request.body;
  return this.gemini.structure(prompt, schema);
});

// Tool call endpoint
server.post('/api/llm/gemini-openai-v1/tool-call', async function (request) {
  const { prompt } = request.body;
  return this.gemini.toolCall(prompt);
});
```

## FastAPI Integration (Python)

The integration uses FastAPI's lifespan context manager and dependency injection to manage the SDK client.

### Pattern: Lifespan Context Manager

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from typing import Annotated

from gemini_openai_sdk import GeminiClient

# Global client instance
_client: GeminiClient | None = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    global _client

    # Startup
    _client = GeminiClient()
    health = _client.health_check()
    print(f"Gemini SDK initialized: {health['status']}")

    yield

    # Shutdown
    _client = None
    print("Gemini SDK cleanup")

app = FastAPI(lifespan=lifespan)
```

### Pattern: Dependency Injection

```python
from fastapi import FastAPI, Depends, HTTPException
from typing import Annotated

def get_gemini_client() -> GeminiClient:
    """Dependency to get the Gemini client."""
    if _client is None:
        raise HTTPException(status_code=503, detail="SDK not initialized")
    return _client

# Type alias for dependency
GeminiClientDep = Annotated[GeminiClient, Depends(get_gemini_client)]
```

### Usage

```python
from fastapi import FastAPI
from pydantic import BaseModel

# Request models
class ChatRequest(BaseModel):
    prompt: str
    model: str = "flash"
    temperature: float = 0.7

class StructureRequest(BaseModel):
    prompt: str
    schema: dict

# Routes
@app.get("/api/llm/gemini-openai-v1/health")
async def sdk_health(client: GeminiClientDep):
    """SDK health check."""
    return client.health_check()

@app.post("/api/llm/gemini-openai-v1/chat")
async def chat(request: ChatRequest, client: GeminiClientDep):
    """Chat completion endpoint."""
    result = await client.chat(
        request.prompt,
        model=request.model,
        temperature=request.temperature,
    )
    return {
        "success": result["success"],
        "content": result.get("content"),
        "error": result.get("error"),
    }

@app.post("/api/llm/gemini-openai-v1/structure")
async def structure(request: StructureRequest, client: GeminiClientDep):
    """Structured output endpoint."""
    result = await client.structure(request.prompt, request.schema)
    return {
        "success": result["success"],
        "content": result.get("content"),
        "parsed": result.get("parsed"),
        "error": result.get("error"),
    }

@app.post("/api/llm/gemini-openai-v1/tool-call")
async def tool_call(request: ChatRequest, client: GeminiClientDep):
    """Tool calling endpoint."""
    result = await client.tool_call(request.prompt)
    return {
        "success": result["success"],
        "content": result.get("content"),
        "tool_calls": result.get("tool_calls"),
        "error": result.get("error"),
    }
```

### Complete Example

```python
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel

from gemini_openai_sdk import GeminiClient

# Global state
_client: GeminiClient | None = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global _client
    _client = GeminiClient()
    yield
    _client = None

app = FastAPI(
    title="Gemini OpenAI SDK API",
    lifespan=lifespan,
)

def get_client() -> GeminiClient:
    if _client is None:
        raise HTTPException(503, "SDK not ready")
    return _client

ClientDep = Annotated[GeminiClient, Depends(get_client)]

class ChatRequest(BaseModel):
    prompt: str
    model: str = "flash"

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/chat")
async def chat(req: ChatRequest, client: ClientDep):
    return await client.chat(req.prompt, model=req.model)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## API Endpoints Summary

Both integrations should expose the following endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/llm/gemini-openai-v1/health` | GET | SDK health check |
| `/api/llm/gemini-openai-v1/chat` | POST | Chat completion |
| `/api/llm/gemini-openai-v1/stream` | POST | Streaming response |
| `/api/llm/gemini-openai-v1/structure` | POST | Structured output |
| `/api/llm/gemini-openai-v1/tool-call` | POST | Tool calling |
| `/api/llm/gemini-openai-v1/json` | POST | JSON mode |
| `/api/llm/gemini-openai-v1/conversation` | POST | Multi-turn chat |

## Error Handling

Both frameworks should return consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Use appropriate HTTP status codes:
- `200` - Success
- `400` - Bad request (invalid input)
- `401` - Unauthorized (missing/invalid API key)
- `500` - Internal error (API failure)
- `503` - Service unavailable (SDK not initialized)

## Testing

### Fastify Testing

```typescript
import { test } from 'vitest';
import Fastify from 'fastify';
import geminiPlugin from './plugins/gemini.mjs';

test('health endpoint returns ok', async () => {
  const server = Fastify();
  await server.register(geminiPlugin);

  const response = await server.inject({
    method: 'GET',
    url: '/api/llm/gemini-openai-v1/health',
  });

  expect(response.statusCode).toBe(200);
  expect(response.json().status).toBeDefined();

  await server.close();
});
```

### FastAPI Testing

```python
import pytest
from fastapi.testclient import TestClient
from main import app

def test_health_endpoint():
    client = TestClient(app)
    response = client.get("/api/llm/gemini-openai-v1/health")

    assert response.status_code == 200
    assert "status" in response.json()
```
