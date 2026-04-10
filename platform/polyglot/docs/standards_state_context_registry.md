# State Context Registry Standards

This document defines the standard patterns for registering computed functions with the context registry across polyglot implementations (Python/FastAPI and Node.js/Fastify).

## Overview

The State Context Registry provides a mechanism for:
1. **Auto-loading** compute functions from designated directories
2. **Template resolution** using `{{fn:function_name}}` syntax in YAML configurations
3. **Scoped execution** (STARTUP vs REQUEST) for different lifecycle needs
4. **Shared context** for coordinating state across multiple functions

---

## File Structure

### Directory Layout
```
{server}/
├── computed_functions/
│   ├── example.compute.py          # Python (FastAPI)
│   ├── example.compute.mjs         # Node.js (Fastify)
│   ├── async_example.compute.py
│   ├── async_example.compute.mjs
│   └── ...
└── config/
    └── lifecycle/
        └── 03_context_resolver.py  # Auto-loader (FastAPI)
```

### File Naming Convention
- **Pattern**: `{name}.compute.{ext}`
- **Python**: `*.compute.py`
- **Node.js**: `*.compute.mjs`
- **Default Name**: Filename without `.compute.{ext}` suffix

---

## Minimal Implementation

### Python (FastAPI)
```python
# async_example.compute.py
NAME = "async_example"

async def register(ctx):
    """Asynchronous function - can use await for I/O operations."""
    app_name = ctx.get("config", {}).get("app", {}).get("name", "unknown")
    return f"async_result_from_{app_name}"
```

### Node.js (Fastify)
```javascript
// async_example.compute.mjs
export const NAME = "async_example";

export async function register(ctx) {
    // Asynchronous function - can use await for I/O operations
    const appName = ctx?.config?.app?.name || "unknown";
    return `async_result_from_${appName}`;
}
```

---

## Module Exports

### Required Exports

| Export | Type | Description |
|--------|------|-------------|
| `register` | `function(ctx) -> any` | Compute function that receives context and returns a value |

### Optional Exports

| Export | Type | Default | Description |
|--------|------|---------|-------------|
| `NAME` | `string` | filename stem | Custom registration name |
| `SCOPE` | `ComputeScope` | `STARTUP` | Execution scope (STARTUP or REQUEST) |

---

## Context Object (`ctx`)

The `ctx` parameter provides access to application state and request data:

### Available Properties

| Property | Type | Scope | Description |
|----------|------|-------|-------------|
| `ctx.env` | `dict/object` | Both | Environment variables (`process.env`) |
| `ctx.config` | `dict/object` | Both | Application configuration from YAML |
| `ctx.app` | `dict/object` | Both | App metadata (name, version) |
| `ctx.state` | `dict/object` | Both | Application state |
| `ctx.shared` | `SharedContext` | Both | Shared context for cross-function coordination |
| `ctx.request` | `dict/object` | REQUEST only | HTTP request data (headers, query, body) |

### Context Access Patterns

#### Python
```python
def register(ctx):
    # Environment variable
    api_key = ctx.get("env", {}).get("API_KEY", "")

    # Configuration value
    app_name = ctx.get("config", {}).get("app", {}).get("name", "default")

    # Request header (REQUEST scope only)
    request = ctx.get("request", {}) or {}
    headers = request.get("headers", {}) or {}
    token = headers.get("authorization", "")

    return token or api_key
```

#### Node.js
```javascript
export function register(ctx) {
    // Environment variable
    const apiKey = ctx?.env?.API_KEY || "";

    // Configuration value
    const appName = ctx?.config?.app?.name || "default";

    // Request header (REQUEST scope only)
    const token = ctx?.request?.headers?.authorization || "";

    return token || apiKey;
}
```

---

## Compute Scopes

### `ComputeScope.STARTUP`

- **Execution**: Once at application startup
- **Caching**: Results are cached for the application lifetime
- **Use Cases**: Build info, service metadata, static configuration
- **Context**: No `request` property available

```python
from app_yaml_overwrites.options import ComputeScope

NAME = "get_build_id"
SCOPE = ComputeScope.STARTUP

def register(ctx):
    return ctx.get("env", {}).get("BUILD_ID", "dev-local")
```

### `ComputeScope.REQUEST`

- **Execution**: On every HTTP request
- **Caching**: Results cached per request (via SharedContext)
- **Use Cases**: Request ID, auth tokens, tenant resolution
- **Context**: Full `request` property available

```python
from app_yaml_overwrites.options import ComputeScope

NAME = "compute_request_id"
SCOPE = ComputeScope.REQUEST

def register(ctx):
    request = ctx.get("request", {}) or {}
    headers = request.get("headers", {}) or {}
    request_id = headers.get("x-request-id")
    if request_id:
        return request_id
    import uuid
    return str(uuid.uuid4())
```

---

## Shared Context Pattern

The `SharedContext` enables coordination between multiple computed functions during a single resolution pass.

### Use Case
Multiple REQUEST-scoped functions need the same timestamp:
- `request_token_001` generates token with timestamp
- `request_token_005` generates different token with **same** timestamp

### Python Implementation
```python
from app_yaml_overwrites.options import ComputeScope
import time

NAME = "request_token_001"
SCOPE = ComputeScope.REQUEST
TIMESTAMP_KEY = "request_tokens_timestamp"

def register(ctx):
    shared = ctx.get('shared')
    if shared is None:
        timestamp = int(time.time())
    else:
        # get(key, factory) - factory called if key doesn't exist
        timestamp = shared.get(TIMESTAMP_KEY, lambda: int(time.time()))

    return f"token_001_{timestamp}"
```

### Node.js Implementation
```javascript
import { ComputeScope } from 'runtime-template-resolver';

export const NAME = "request_token_001";
export const SCOPE = ComputeScope.REQUEST;
const TIMESTAMP_KEY = "request_tokens_timestamp";

export function register(ctx) {
    const shared = ctx?.shared;
    if (!shared) {
        return `token_001_${Date.now()}`;
    }

    // get(key, factory) - factory called if key doesn't exist
    const timestamp = shared.get(TIMESTAMP_KEY, () => Date.now());
    return `token_001_${timestamp}`;
}
```

---

## Composite Return Values

Computed functions can return objects for dot-notation access in templates.

### Template Usage
```yaml
headers:
  X-Startup-Token: "{{fn:startup_tokens.case_001}}"
  X-Timestamp: "{{fn:startup_tokens.timestamp_iso}}"
```

### Python Implementation
```python
from app_yaml_overwrites.options import ComputeScope
import time

NAME = "startup_tokens"
SCOPE = ComputeScope.STARTUP

def register(ctx):
    timestamp = int(time.time())
    app_name = ctx.get("app", {}).get("name", "mta-server")

    return {
        "case_001": f"tok_001_{timestamp}",
        "case_005": f"tok_005_{timestamp}",
        "timestamp": timestamp,
        "timestamp_iso": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(timestamp)),
        "app_info": {
            "name": app_name
        }
    }
```

---

## Auto-Loading Mechanism

### How It Works

1. **Discovery**: Glob pattern `computed_functions/*.compute.{py,mjs}`
2. **Dynamic Import**: Module loaded via `importlib` (Python) or `import()` (Node.js)
3. **Validation**: Must export `register` function
4. **Registration**: `registry.register(NAME, register, SCOPE)`
5. **Logging**: Loaded functions printed at startup

### FastAPI Loader (`03_context_resolver.py`)
```python
def auto_load_compute_functions(registry, base_dir=None):
    pattern = str(base_dir / "*.compute.py")

    for filepath in glob.glob(pattern):
        spec = importlib.util.spec_from_file_location(module_name, filepath)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        register_func = module.register
        name = getattr(module, "NAME", func_name)
        scope = getattr(module, "SCOPE", ComputeScope.STARTUP)

        registry.register(name, register_func, scope)
```

### Startup Output
```
Auto-loaded compute functions: ['async_example', 'sync_example', 'startup_tokens', ...]
Registered compute functions (15):
  - echo
  - get_build_id
  - async_example
  - startup_tokens
  ...
```

---

## Template Resolution

### Syntax
```yaml
providers:
  example:
    headers:
      Authorization: "Bearer {{fn:compute_api_token}}"
      X-Request-ID: "{{fn:compute_request_id}}"
      X-Build: "{{fn:get_build_id}}"
```

### Resolution Flow
1. YAML config loaded at startup
2. `{{fn:...}}` placeholders identified
3. STARTUP functions resolved immediately, results cached
4. REQUEST functions resolved per-request with `ctx.request` populated

---

## Best Practices

### 1. Use Appropriate Scope
- STARTUP for static values (build info, config-derived values)
- REQUEST for dynamic values (tokens, request IDs, tenant resolution)

### 2. Handle Missing Context Gracefully
```python
def register(ctx):
    # Always provide defaults
    return ctx.get("env", {}).get("API_KEY", "")
```

### 3. Use SharedContext for Coordination
```python
# Multiple functions needing same timestamp
timestamp = shared.get("timestamp_key", lambda: int(time.time()))
```

### 4. Return Serializable Values
- Primitives: `str`, `int`, `float`, `bool`
- Collections: `dict`, `list`
- Avoid: Classes, functions, complex objects

### 5. Keep Functions Pure
- No side effects in STARTUP functions
- Minimal I/O in REQUEST functions for performance

---

## Polyglot Equivalence Table

| Concept | Python (FastAPI) | Node.js (Fastify) |
|---------|------------------|-------------------|
| File extension | `.compute.py` | `.compute.mjs` |
| Export NAME | `NAME = "..."` | `export const NAME = "..."` |
| Export SCOPE | `SCOPE = ComputeScope.X` | `export const SCOPE = ComputeScope.X` |
| Export register | `def register(ctx):` | `export function register(ctx) {}` |
| Async register | `async def register(ctx):` | `export async function register(ctx) {}` |
| Context access | `ctx.get("key", {})` | `ctx?.key \|\| {}` |
| Scope import | `from app_yaml_overwrites.options import ComputeScope` | `import { ComputeScope } from 'runtime-template-resolver'` |

---

## Reference Files

| Description | Path |
|-------------|------|
| Python async example | `fastapi_server/computed_functions/async_example.compute.py` |
| Node.js async example | `fastify_server/computed_functions/async_example.compute.mjs` |
| Python full example | `fastapi_server/computed_functions/example.compute.py` |
| Python composite | `fastapi_server/computed_functions/startup_tokens.compute.py` |
| Python shared context | `fastapi_server/computed_functions/request_token_001.compute.py` |
| Auto-loader | `fastapi_server/config/lifecycle/03_context_resolver.py` |
