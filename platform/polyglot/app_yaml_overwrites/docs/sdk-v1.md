# SDK v1: Request Context API

This document describes the Request Context API for accessing `sharedContext`, `contextRegistry`, and `configSdk` in route handlers across Python (FastAPI) and Node.js (Fastify).

## Overview

The Request Context API provides three core objects available in every request:

| Object | Purpose | Scope |
|--------|---------|-------|
| `sharedContext` | Per-request state with parent inheritance | REQUEST |
| `contextRegistry` | Compute function registry | STARTUP (shared) |
| `configSdk` | Configuration SDK with resolution methods | STARTUP (shared) |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Application Startup                       │
├─────────────────────────────────────────────────────────────────┤
│  app.state.sharedContext  ─── STARTUP SharedContext (parent)    │
│  app.state.context_registry ─ Compute function registry         │
│  app.state.sdk            ─── ConfigSDK instance                │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Per-Request Middleware                      │
├─────────────────────────────────────────────────────────────────┤
│  request.state.sharedContext  ─ Child context (inherits parent) │
│  request.state.context_registry ─ Reference to registry         │
│  request.state.config_sdk     ─── Reference to SDK              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Reference

### Python (FastAPI)

```python
from fastapi import Request

@router.get("/example")
async def example(request: Request):
    # SharedContext - per-request state
    shared = request.state.sharedContext
    value = shared.get("key", lambda: compute_default())

    # Context Registry - compute functions
    registry = request.state.context_registry
    functions = registry.list()

    # Config SDK - resolved configuration
    sdk = request.state.config_sdk
    config = await sdk.get_resolved("REQUEST", request)

    return {"status": "ok"}
```

### Node.js (Fastify)

```javascript
server.get("/example", async (request, reply) => {
    // SharedContext - per-request state
    const shared = request.sharedContext;
    const value = shared.get("key", () => computeDefault());

    // Context Registry - compute functions
    const registry = request.contextRegistry;
    const functions = registry.list();

    // Config SDK - resolved configuration
    const sdk = request.configSdk;
    const config = await sdk.getResolved("REQUEST", request);

    return { status: "ok" };
});
```

---

## 1. SharedContext

### Purpose

SharedContext provides scoped key-value storage with lazy initialization and parent-child inheritance. Each request gets a child context that inherits from the application-level parent.

### API

| Method | Description |
|--------|-------------|
| `get(key, default?)` | Get value; if `default` is callable, invoke and cache result |
| `set(key, value)` | Set a value in current scope |
| `has(key)` | Check if key exists |
| `create_child()` | Create child context inheriting from parent |

### Python Usage

```python
from fastapi import Request

@router.get("/user/{user_id}")
async def get_user(request: Request, user_id: str):
    shared = request.state.sharedContext

    # Lazy initialization - factory called once, result cached
    timestamp = shared.get("request_timestamp", lambda: time.time())

    # Multiple calls return cached value
    same_timestamp = shared.get("request_timestamp", lambda: time.time())
    assert timestamp == same_timestamp

    # Set request-scoped data
    shared.set("current_user_id", user_id)

    # Check existence
    if shared.has("current_user_id"):
        uid = shared.get("current_user_id")

    return {"user_id": user_id, "timestamp": timestamp}
```

### Node.js Usage

```javascript
server.get("/user/:userId", async (request, reply) => {
    const shared = request.sharedContext;

    // Lazy initialization - factory called once, result cached
    const timestamp = shared.get("request_timestamp", () => Date.now());

    // Multiple calls return cached value
    const sameTimestamp = shared.get("request_timestamp", () => Date.now());
    console.assert(timestamp === sameTimestamp);

    // Set request-scoped data
    shared.set("current_user_id", request.params.userId);

    // Check existence
    if (shared.has("current_user_id")) {
        const uid = shared.get("current_user_id");
    }

    return { userId: request.params.userId, timestamp };
});
```

### Cross-Function Coordination

SharedContext enables multiple computed functions to share state within a single request:

```python
# computed_functions/request_token_001.compute.py
TIMESTAMP_KEY = "shared_request_timestamp"

def register(ctx):
    shared = ctx.get("shared")
    # First function creates timestamp, subsequent functions reuse it
    timestamp = shared.get(TIMESTAMP_KEY, lambda: int(time.time()))
    return f"token_001_{timestamp}"
```

```python
# computed_functions/request_token_002.compute.py
TIMESTAMP_KEY = "shared_request_timestamp"

def register(ctx):
    shared = ctx.get("shared")
    # Uses same timestamp as request_token_001
    timestamp = shared.get(TIMESTAMP_KEY, lambda: int(time.time()))
    return f"token_002_{timestamp}"
```

### Accessing Shared Values from Route Handlers

Route handlers can access values set by computed functions via the same SharedContext:

#### Python (FastAPI)

```python
from fastapi import Request
import time

# The same key used in computed functions
TIMESTAMP_KEY = "shared_request_timestamp"

@router.get("/debug/shared-timestamp")
async def get_shared_timestamp(request: Request):
    shared = request.state.sharedContext

    # Access the shared timestamp (set by computed functions)
    # If not yet set, the factory creates it
    timestamp = shared.get(TIMESTAMP_KEY, lambda: int(time.time()))

    # Check if it was already set by a computed function
    was_preset = shared.has(TIMESTAMP_KEY)

    return {
        "timestamp": timestamp,
        "timestamp_iso": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(timestamp)),
        "was_preset_by_compute_fn": was_preset
    }


@router.get("/tokens/validate")
async def validate_tokens(request: Request):
    shared = request.state.sharedContext

    # Get the shared timestamp that request_token_001 and request_token_002 used
    timestamp = shared.get(TIMESTAMP_KEY, lambda: int(time.time()))

    # Now you can validate tokens were generated with this timestamp
    return {
        "shared_timestamp": timestamp,
        "message": "All REQUEST-scoped tokens in this request share this timestamp"
    }
```

#### Node.js (Fastify)

```javascript
// The same key used in computed functions
const TIMESTAMP_KEY = "shared_request_timestamp";

server.get("/debug/shared-timestamp", async (request, reply) => {
    const shared = request.sharedContext;

    // Access the shared timestamp (set by computed functions)
    // If not yet set, the factory creates it
    const timestamp = shared.get(TIMESTAMP_KEY, () => Math.floor(Date.now() / 1000));

    // Check if it was already set by a computed function
    const wasPreset = shared.has(TIMESTAMP_KEY);

    return {
        timestamp,
        timestampIso: new Date(timestamp * 1000).toISOString(),
        wasPresetByComputeFn: wasPreset
    };
});


server.get("/tokens/validate", async (request, reply) => {
    const shared = request.sharedContext;

    // Get the shared timestamp that request_token_001 and request_token_002 used
    const timestamp = shared.get(TIMESTAMP_KEY, () => Math.floor(Date.now() / 1000));

    // Now you can validate tokens were generated with this timestamp
    return {
        sharedTimestamp: timestamp,
        message: "All REQUEST-scoped tokens in this request share this timestamp"
    };
});
```

#### Key Points

1. **Same Key**: Use the exact same key string (`"shared_request_timestamp"`) as the computed functions
2. **Order Independence**: Whether the route handler or computed function accesses first doesn't matter - the factory runs once
3. **Request Isolation**: Each request gets its own child SharedContext, so timestamps are isolated per-request
4. **Lazy Initialization**: The value is created on first access via the factory function

---

## 2. ContextRegistry

### Purpose

The Context Registry stores compute functions for template resolution (`{{fn:function_name}}`). Routes can access it to list available functions or invoke them directly.

### API

| Method | Description |
|--------|-------------|
| `list()` | Get list of registered function names |
| `get(name)` | Get function by name |
| `has(name)` | Check if function exists |
| `register(name, fn, scope)` | Register new function |

### Python Usage

```python
from fastapi import Request

@router.get("/healthz/compute-functions")
async def list_compute_functions(request: Request):
    registry = request.state.context_registry

    # List all registered functions
    functions = registry.list()

    # Check if specific function exists
    has_echo = registry.has("echo")

    # Get function details
    if registry.has("get_build_id"):
        fn = registry.get("get_build_id")
        # fn is the registered callable

    return {
        "count": len(functions),
        "functions": functions,
        "has_echo": has_echo
    }
```

### Node.js Usage

```javascript
server.get("/healthz/compute-functions", async (request, reply) => {
    const registry = request.contextRegistry;

    // List all registered functions
    const functions = registry.list();

    // Check if specific function exists
    const hasEcho = registry.has("echo");

    // Get function details
    if (registry.has("get_build_id")) {
        const fn = registry.get("get_build_id");
        // fn is the registered callable
    }

    return {
        count: functions.length,
        functions,
        hasEcho
    };
});
```

### Invoking Functions Manually

```python
# Python
@router.get("/debug/compute/{fn_name}")
async def invoke_compute(request: Request, fn_name: str):
    registry = request.state.context_registry
    shared = request.state.sharedContext

    if not registry.has(fn_name):
        raise HTTPException(404, f"Function {fn_name} not found")

    fn = registry.get(fn_name)

    # Build context for function
    ctx = {
        "env": dict(os.environ),
        "config": request.app.state.config.get_all(),
        "request": request,
        "shared": shared
    }

    # Invoke (handle async)
    if asyncio.iscoroutinefunction(fn):
        result = await fn(ctx)
    else:
        result = fn(ctx)

    return {"function": fn_name, "result": result}
```

```javascript
// Node.js
server.get("/debug/compute/:fnName", async (request, reply) => {
    const registry = request.contextRegistry;
    const shared = request.sharedContext;
    const { fnName } = request.params;

    if (!registry.has(fnName)) {
        reply.code(404);
        return { error: `Function ${fnName} not found` };
    }

    const fn = registry.get(fnName);

    // Build context for function
    const ctx = {
        env: process.env,
        config: reply.server.config.toObject(),
        request,
        shared
    };

    // Invoke (handle async)
    const result = await Promise.resolve(fn(ctx));

    return { function: fnName, result };
});
```

---

## 3. ConfigSdk

### Purpose

ConfigSdk provides access to application configuration with template resolution. It can return raw or resolved configuration based on scope.

### API

| Method | Description |
|--------|-------------|
| `get_raw()` / `getRaw()` | Get raw configuration (no resolution) |
| `get_resolved(scope, request?)` / `getResolved(scope, request?)` | Get resolved configuration |
| `to_json()` / `toJSON()` | Export configuration as JSON |

### Resolution Scopes

| Scope | Description |
|-------|-------------|
| `STARTUP` | Resolve with app-level context only |
| `REQUEST` | Resolve with request context (headers, query params) |

### Python Usage

```python
from fastapi import Request

@router.get("/config/providers/{provider}")
async def get_provider_config(request: Request, provider: str):
    sdk = request.state.config_sdk

    # Get raw configuration (templates not resolved)
    raw = sdk.get_raw()
    provider_raw = raw.get("providers", {}).get(provider, {})

    # Get resolved configuration (templates resolved with request context)
    resolved = await sdk.get_resolved("REQUEST", request)
    provider_resolved = resolved.get("providers", {}).get(provider, {})

    return {
        "provider": provider,
        "raw": sanitize_secrets(provider_raw),
        "resolved_endpoint": provider_resolved.get("base_url")
    }
```

```python
# Example: Using resolved config for API calls
@router.post("/proxy/{provider}")
async def proxy_request(request: Request, provider: str):
    sdk = request.state.config_sdk

    resolved = await sdk.get_resolved("REQUEST", request)
    provider_config = resolved.get("providers", {}).get(provider, {})

    async with httpx.AsyncClient() as client:
        response = await client.request(
            method="GET",
            url=provider_config["base_url"] + provider_config["health_endpoint"],
            headers=provider_config.get("headers", {})
        )

    return {"status": response.status_code}
```

### Node.js Usage

```javascript
server.get("/config/providers/:provider", async (request, reply) => {
    const sdk = request.configSdk;
    const { provider } = request.params;

    // Get raw configuration (templates not resolved)
    const raw = sdk.getRaw();
    const providerRaw = raw?.providers?.[provider] || {};

    // Get resolved configuration (templates resolved with request context)
    const resolved = await sdk.getResolved("REQUEST", request);
    const providerResolved = resolved?.providers?.[provider] || {};

    return {
        provider,
        raw: sanitizeSecrets(providerRaw),
        resolvedEndpoint: providerResolved.base_url
    };
});
```

```javascript
// Example: Using resolved config for API calls
server.post("/proxy/:provider", async (request, reply) => {
    const sdk = request.configSdk;
    const { provider } = request.params;

    const resolved = await sdk.getResolved("REQUEST", request);
    const providerConfig = resolved?.providers?.[provider] || {};

    const response = await fetch(
        providerConfig.base_url + providerConfig.health_endpoint,
        { headers: providerConfig.headers || {} }
    );

    return { status: response.status };
});
```

---

## Lifecycle Integration

### FastAPI Setup

The middleware is registered in `config/lifecycle/100_on_request_decorators.py`:

```python
from starlette.middleware.base import BaseHTTPMiddleware

class RequestDecoratorsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        app = request.app

        # Create child SharedContext for this request
        shared_context = getattr(app.state, 'sharedContext', None)
        if shared_context and hasattr(shared_context, 'create_child'):
            request.state.sharedContext = shared_context.create_child()

        # Copy registry and SDK to request
        request.state.context_registry = getattr(app.state, 'context_registry', None)
        request.state.config_sdk = getattr(app.state, 'sdk', None)

        return await call_next(request)

async def onStartup(app, config):
    app.add_middleware(RequestDecoratorsMiddleware)
```

### Fastify Setup

The hook is registered in `config/lifecycle/100-on-request-decorators.mjs`:

```javascript
export async function onStartup(server, config) {
    server.decorateRequest("sharedContext", null);

    server.addHook("onRequest", async (request) => {
        // Create child SharedContext for this request
        if (server.hasDecorator("sharedContext")) {
            request.sharedContext = server.sharedContext.createChild();
        }

        // Copy registry and SDK to request
        if (server.hasDecorator("contextRegistry")) {
            request.contextRegistry = server.contextRegistry;
        }
        if (server.hasDecorator("configSdk")) {
            request.configSdk = server.configSdk;
        }
    });
}
```

---

## Polyglot Equivalence Table

| Concept | Python (FastAPI) | Node.js (Fastify) |
|---------|------------------|-------------------|
| **Access SharedContext** | `request.state.sharedContext` | `request.sharedContext` |
| **Access Registry** | `request.state.context_registry` | `request.contextRegistry` |
| **Access SDK** | `request.state.config_sdk` | `request.configSdk` |
| **Get from shared** | `shared.get("key", lambda: default)` | `shared.get("key", () => default)` |
| **Set in shared** | `shared.set("key", value)` | `shared.set("key", value)` |
| **List functions** | `registry.list()` | `registry.list()` |
| **Get raw config** | `sdk.get_raw()` | `sdk.getRaw()` |
| **Get resolved** | `await sdk.get_resolved("REQUEST", request)` | `await sdk.getResolved("REQUEST", request)` |

---

## Complete Example

### Python Route

```python
from fastapi import APIRouter, Request
import time

router = APIRouter()

@router.get("/demo")
async def demo_endpoint(request: Request):
    # 1. SharedContext - per-request state
    shared = request.state.sharedContext
    request_start = shared.get("request_start", lambda: time.time())

    # 2. Context Registry - list available functions
    registry = request.state.context_registry
    available_functions = registry.list()

    # 3. Config SDK - get resolved configuration
    sdk = request.state.config_sdk
    resolved = await sdk.get_resolved("REQUEST", request)
    app_name = resolved.get("app", {}).get("name", "unknown")

    # Calculate request duration
    duration_ms = (time.time() - request_start) * 1000

    return {
        "app": app_name,
        "functions_count": len(available_functions),
        "duration_ms": round(duration_ms, 2)
    }
```

### Node.js Route

```javascript
export async function mount(server) {
    server.get("/demo", async (request, reply) => {
        // 1. SharedContext - per-request state
        const shared = request.sharedContext;
        const requestStart = shared.get("request_start", () => Date.now());

        // 2. Context Registry - list available functions
        const registry = request.contextRegistry;
        const availableFunctions = registry.list();

        // 3. Config SDK - get resolved configuration
        const sdk = request.configSdk;
        const resolved = await sdk.getResolved("REQUEST", request);
        const appName = resolved?.app?.name || "unknown";

        // Calculate request duration
        const durationMs = Date.now() - requestStart;

        return {
            app: appName,
            functionsCount: availableFunctions.length,
            durationMs: Math.round(durationMs * 100) / 100
        };
    });
}
```

---

## See Also

- [SDK Guide](./SDK_GUIDE.md) - Core SDK concepts
- [Shared Computed Context](./SHARED_COMPUTED_CONTEXT.md) - Cross-function state sharing
- [Server Integration](./SERVER_INTEGRATION.md) - Middleware and hook patterns
- [API Reference](./API_REFERENCE.md) - Complete type signatures
