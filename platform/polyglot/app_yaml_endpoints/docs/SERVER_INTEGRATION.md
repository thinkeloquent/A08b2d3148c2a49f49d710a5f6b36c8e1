# Server Integration Guide

This guide covers integrating App YAML Endpoints with FastAPI and Fastify servers.

## FastAPI Integration

### Lifespan Pattern

Use FastAPI's lifespan context manager to load configuration at startup:

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app_yaml_endpoints import load_config_from_file

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load config on startup
    load_config_from_file('./config/endpoint.yaml')
    yield
    # Cleanup on shutdown (if needed)

app = FastAPI(lifespan=lifespan)
```

### Dependency Injection

Create dependencies for common operations:

```python
from fastapi import Depends
from app_yaml_endpoints import resolve_intent, get_fetch_config

def get_service_id(
    service_id: str | None = None,
    intent: str | None = None
) -> str:
    if service_id:
        return service_id
    return resolve_intent(intent or "default")

@app.post("/chat")
async def chat(
    payload: dict,
    service_id: str = Depends(get_service_id)
):
    config = get_fetch_config(service_id, payload)
    # Use config for HTTP request
    return {"url": config.url}
```

### Error Handling

Handle `ConfigError` with HTTPException:

```python
from fastapi import HTTPException
from app_yaml_endpoints import ConfigError

@app.post("/api/{service_id}")
async def proxy(service_id: str, payload: dict):
    try:
        config = get_fetch_config(service_id, payload)
        # ...
    except ConfigError as e:
        raise HTTPException(
            status_code=404,
            detail={
                "error": str(e),
                "service_id": e.service_id,
                "available": e.available,
            }
        )
```

### Complete FastAPI Example

See `py/examples/fastapi_app/main.py` for a complete example.

---

## Fastify Integration

### Plugin Pattern

Create a Fastify plugin to load configuration:

```javascript
import { loadConfigFromFile, getFetchConfig, listEndpoints } from 'app-yaml-endpoints';

async function smartFetchPlugin(fastify, options) {
    // Load configuration
    loadConfigFromFile(options.configPath || './config/endpoint.yaml');

    // Decorate fastify instance
    fastify.decorate('getFetchConfig', getFetchConfig);
    fastify.decorate('listEndpoints', listEndpoints);

    // Decorate request
    fastify.decorateRequest('getServiceConfig', function(serviceId, payload) {
        return getFetchConfig(serviceId, payload);
    });
}

// Register the plugin
fastify.register(smartFetchPlugin, { configPath: './config/endpoint.yaml' });
```

### Route Handlers

Use the decorated methods in routes:

```javascript
fastify.post('/chat', async (request, reply) => {
    const { messages, service_id } = request.body;

    try {
        const config = request.getServiceConfig(service_id, { messages });
        return { url: config.url, headers: config.headers };
    } catch (err) {
        if (err instanceof ConfigError) {
            reply.code(404);
            return { error: err.message, available: err.available };
        }
        throw err;
    }
});
```

### Schema Validation

Add JSON Schema for request validation:

```javascript
fastify.post('/chat', {
    schema: {
        body: {
            type: 'object',
            required: ['messages'],
            properties: {
                messages: { type: 'array' },
                service_id: { type: 'string' },
                intent: { type: 'string' },
            },
        },
    },
}, async (request, reply) => {
    // Handler
});
```

### Complete Fastify Example

See `mjs/examples/fastify-app/server.mjs` for a complete example.

---

## Proxy Pattern

Both frameworks can proxy requests to configured endpoints:

### Python (httpx)

```python
import httpx

async def proxy_request(service_id: str, payload: dict):
    config = get_fetch_config(service_id, payload)

    async with httpx.AsyncClient() as client:
        response = await client.request(
            method=config.method,
            url=config.url,
            headers=config.headers,
            content=config.body,
            timeout=config.timeout / 1000,  # Convert to seconds
        )
        return response.json()
```

### Node.js (undici/fetch)

```javascript
async function proxyRequest(serviceId, payload) {
    const config = getFetchConfig(serviceId, payload);

    const response = await fetch(config.url, {
        method: config.method,
        headers: config.headers,
        body: config.body,
    });

    return response.json();
}
```

---

## Custom Headers Per Request

Pass request-specific headers:

```python
# Python
config = get_fetch_config(
    "llm001",
    payload,
    custom_headers={
        "X-Request-ID": request.headers.get("x-request-id"),
        "X-Correlation-ID": correlation_id,
    }
)
```

```javascript
// Node.js
const config = getFetchConfig('llm001', payload, {
    'X-Request-ID': request.headers['x-request-id'],
    'X-Correlation-ID': correlationId,
});
```

---

## Best Practices

1. **Load config once at startup** - Use lifespan/plugin patterns
2. **Use intent mapping** - Abstract service selection from business logic
3. **Handle ConfigError** - Return meaningful error responses
4. **Pass request headers** - Forward correlation IDs and request IDs
5. **Use defensive logging** - Create loggers with package/file context
