# Polyglot Server Standards

This document provides standards and instructions for implementing State Management, SharedContext, and Computed Functions in FastAPI (Python) and Fastify (Node.js) servers.

---

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Core Concepts](#core-concepts)
3. [Application State (STARTUP)](#application-state-startup)
4. [Request State (REQUEST)](#request-state-request)
5. [SharedContext](#sharedcontext)
6. [Computed Functions](#computed-functions)
7. [Context Object (`ctx`)](#context-object-ctx)
8. [File Structure](#file-structure)
9. [Complete Examples](#complete-examples)

---

## Quick Reference

### Property Access Cheatsheet

| Component | Python (FastAPI) | Node.js (Fastify) |
|-----------|------------------|-------------------|
| **Static Config** | `app.state.config` | `server.config` |
| **SDK** | `app.state.sdk` | `server.sdk` |
| **Registry** | `app.state.context_registry` | `server.contextRegistry` |
| **Raw Config** | `app.state.context_raw_config` | `server.contextRawConfig` |
| **Resolved Config (STARTUP)** | `app.state.resolved_config` | `server.resolvedConfig` |
| **Resolved Config (REQUEST)** | `Depends(get_request_config)` | `request.resolvedConfig` |
| **SharedContext (STARTUP)** | `app.state.sharedContext` | `server.sharedContext` |
| **SharedContext (REQUEST)** | `Depends(get_shared_context)` | `request.sharedContext` |

### Resolution Strategy

| Framework | STARTUP | REQUEST |
|-----------|---------|---------|
| **FastAPI** | Automatic (lifecycle) | **Lazy** - `Depends()` |
| **Fastify** | Automatic (lifecycle) | **Eager** - `onRequest` hook |

---

## Core Concepts

### Scopes

| Scope | Lifetime | Use Case |
|-------|----------|----------|
| **STARTUP** | Server lifetime | Config, SDKs, utilities, singletons |
| **REQUEST** | Single HTTP request | Request-specific data, dynamic values |

### Key Patterns

1. **State**: Immutable references to configuration and services
2. **SharedContext**: Mutable state container for computed function coordination
3. **Computed Functions**: Dynamic value generators invoked via `{{fn:name}}` templates

---

## Application State (STARTUP)

Application state is initialized once during server bootstrapping and available globally.

### Standard: Use Lifecycle Hooks

All STARTUP state MUST be initialized in lifecycle hooks (`config/lifecycle/*.py` or `config/lifecycle/*.mjs`).

### Python (FastAPI)

**Storage**: `app.state.<property>`

```python
# config/lifecycle/02_context_resolver.py
async def onStartup(app: FastAPI, config: dict):
    # Standard properties
    app.state.config = config                    # AppYamlConfig instance
    app.state.sdk = create_sdk(config)           # SDK instance
    app.state.context_registry = registry        # ComputeRegistry
    app.state.context_raw_config = raw_config    # Raw dict
    app.state.resolved_config = resolved         # STARTUP-resolved config
    app.state.sharedContext = shared_context     # SharedContext instance
```

**Access in Routes**:
```python
@app.get("/")
async def root(request: Request):
    # Via request.app.state
    config = request.app.state.config
    service_name = config.get("app.name")

    # Direct resolved config access
    db_host = request.app.state.resolved_config.get("database", {}).get("host")
```

### Node.js (Fastify)

**Storage**: `server.decorate('<property>', value)`

```javascript
// config/lifecycle/02-context-resolver.mjs
export async function onStartup(server, config) {
    // Standard decorations
    server.decorate('config', config);              // AppYamlConfig instance
    server.decorate('sdk', createSdk(config));      // SDK instance
    server.decorate('contextRegistry', registry);   // ComputeRegistry
    server.decorate('contextRawConfig', rawConfig); // Raw object
    server.decorate('resolvedConfig', resolved);    // STARTUP-resolved config
    server.decorate('sharedContext', sharedContext);// SharedContext instance
}
```

**Access in Routes**:
```javascript
server.get('/', async (request, reply) => {
    // Via server instance
    const config = server.config;
    const serviceName = config.get('app.name');

    // Direct resolved config access
    const dbHost = server.resolvedConfig.database?.host;
});
```

---

## Request State (REQUEST)

Request state is derived or created for each HTTP request.

### Standard: Resolution Strategy Differs by Framework

- **FastAPI**: Lazy/Opt-in via `Depends()`
- **Fastify**: Eager/Automatic via `onRequest` hook

### Python (FastAPI) - Lazy Resolution

Endpoints MUST explicitly request resolved config or shared context.

```python
from fastapi import Depends, Request
from runtime_template_resolver.integrations.fastapi import get_request_config

# Dependency for request-resolved config
@app.get("/dynamic")
async def dynamic_route(resolved: dict = Depends(get_request_config)):
    # Config has REQUEST-scoped variables resolved
    tenant_id = resolved.get("tenant_id")
    return {"tenant": tenant_id}

# Dependency for shared context
async def get_shared_context(request: Request) -> SharedContext:
    startup_shared = request.app.state.sharedContext
    return startup_shared.create_child() if startup_shared else create_shared_context()

@app.get("/with-shared")
async def with_shared(shared: SharedContext = Depends(get_shared_context)):
    token = shared.get('request_token', lambda: generate_token())
    return {"token": token}
```

### Node.js (Fastify) - Eager Resolution

Request state is automatically populated by hooks.

```javascript
// Setup in lifecycle (onStartup)
server.decorateRequest('resolvedConfig', null);
server.decorateRequest('sharedContext', null);

server.addHook('onRequest', async (request) => {
    // Automatically populated for every request
    request.sharedContext = server.sharedContext.createChild();
});

// Usage in routes - already available
server.get('/dynamic', async (request, reply) => {
    // Automatically populated by runtime-template-resolver plugin
    const tenantId = request.resolvedConfig.tenant_id;

    // SharedContext available via hook
    const token = request.sharedContext.get('requestToken', () => generateToken());

    return { tenant: tenantId, token };
});
```

---

## SharedContext

SharedContext enables computed functions to share state during a resolution pass.

### Standard: Parent-Child Inheritance

- **STARTUP**: Create parent SharedContext, register utilities
- **REQUEST**: Create child context via `create_child()`, inherits parent utilities

### API Reference

| Method | Description |
|--------|-------------|
| `get(key, default?)` | Get value; callable default is invoked and cached |
| `set(key, value)` | Set value directly |
| `register(key, value)` | Register utility (for STARTUP) |
| `create_child()` | Create child context inheriting from parent |
| `get_utils()` | Get all registered utilities |

### Python Implementation

```python
from app_yaml_overwrites.shared_context import SharedContext, create_shared_context

# STARTUP: Create and register utilities
async def onStartup(app: FastAPI, config: dict):
    shared_context = create_shared_context()

    # Register utilities available to REQUEST scope
    shared_context.register('token_generator', TokenGenerator())
    shared_context.register('rate_limiter', RateLimiter(max_requests=100))

    app.state.sharedContext = shared_context

# REQUEST: Create child and use
async def get_shared_context(request: Request) -> SharedContext:
    parent = request.app.state.sharedContext
    return parent.create_child() if parent else create_shared_context()

# In computed function or route
def use_shared(ctx):
    # Get with factory (first caller creates, others reuse)
    timestamp = ctx['shared'].get('timestamp', lambda: int(time.time()))

    # Access STARTUP-registered utility
    generator = ctx['shared'].get('token_generator')
```

### Node.js Implementation

```javascript
import { createSharedContext } from 'app_yaml_overwrites';

// STARTUP: Create and register utilities
export async function onStartup(server, config) {
    const sharedContext = createSharedContext();

    // Register utilities available to REQUEST scope
    sharedContext.register('tokenGenerator', new TokenGenerator());
    sharedContext.register('rateLimiter', new RateLimiter({ maxRequests: 100 }));

    server.decorate('sharedContext', sharedContext);
    server.decorateRequest('sharedContext', null);

    // Create child for each request
    server.addHook('onRequest', async (request) => {
        request.sharedContext = sharedContext.createChild();
    });
}

// In computed function or route
function useShared(ctx) {
    // Get with factory (first caller creates, others reuse)
    const timestamp = ctx.shared.get('timestamp', () => Math.floor(Date.now() / 1000));

    // Access STARTUP-registered utility
    const generator = ctx.shared.get('tokenGenerator');
}
```

---

## Computed Functions

Computed functions generate dynamic values invoked via `{{fn:name}}` templates.

### Standard: File Naming and Structure

| Requirement | Standard |
|-------------|----------|
| File naming | `<name>.compute.py` or `<name>.compute.mjs` |
| Location | `computed_functions/` directory |
| Exports | `register(ctx)`, `NAME`, `SCOPE` |

### Scopes

| Scope | When Resolved | Caching |
|-------|---------------|---------|
| `STARTUP` | Server boot | Cached for server lifetime |
| `REQUEST` | Each HTTP request | Fresh per request |

### Python Template

```python
# computed_functions/my_function.compute.py
import time
from app_yaml_overwrites.options import ComputeScope

# Required exports
NAME = "my_function"           # Function name for {{fn:my_function}}
SCOPE = ComputeScope.REQUEST   # or ComputeScope.STARTUP

def register(ctx):
    """
    Compute function entry point.

    Args:
        ctx: Context dict with env, config, app, request, shared

    Returns:
        Computed value (string, number, dict, etc.)
    """
    app_name = ctx.get("app", {}).get("name", "default")
    request_id = ctx.get("request", {}).get("headers", {}).get("x-request-id", "none")

    return f"{app_name}:{request_id}"
```

### Node.js Template

```javascript
// computed_functions/my_function.compute.mjs

// Required exports
export const NAME = 'myFunction';      // Function name for {{fn:myFunction}}
export const SCOPE = 'REQUEST';        // or 'STARTUP'

export function register(ctx) {
    /**
     * Compute function entry point.
     *
     * @param {Object} ctx - Context with env, config, app, request, shared
     * @returns {*} Computed value
     */
    const appName = ctx?.app?.name || 'default';
    const requestId = ctx?.request?.headers?.['x-request-id'] || 'none';

    return `${appName}:${requestId}`;
}
```

### YAML Usage

```yaml
headers:
  X-Custom-Header: "{{fn:my_function}}"

  # Property access for composite functions
  X-Token: "{{fn:startup_tokens.case_001}}"

  # With default fallback
  X-Optional: "{{fn:maybe_missing | 'default_value'}}"
```

### Sharing State Between Functions

Use SharedContext with a common key:

```python
# Function A
TIMESTAMP_KEY = "shared_timestamp"

def register(ctx):
    timestamp = ctx['shared'].get(TIMESTAMP_KEY, lambda: int(time.time()))
    return f"a_{timestamp}"

# Function B (uses same key)
def register(ctx):
    timestamp = ctx['shared'].get(TIMESTAMP_KEY, lambda: int(time.time()))
    return f"b_{timestamp}"  # Same timestamp as Function A
```

---

## Context Object (`ctx`)

All computed functions receive a context object with standardized properties.

### Standard Context Properties

| Path | Python | Node.js | Source |
|------|--------|---------|--------|
| `ctx.env` | `os.environ` | `process.env` | System environment |
| `ctx.config` | `dict` | `Object` | Raw configuration |
| `ctx.app` | `config['app']` | `config.app` | App metadata |
| `ctx.request` | `Request` / `dict` | `FastifyRequest` / `Object` | Request object |
| `ctx.state` | `request.state` | `request.state` | Request state |
| `ctx.shared` | `SharedContext` | `SharedContext` | Shared context |

### Accessing Context

```python
# Python
def register(ctx):
    # Environment
    api_key = ctx.get("env", {}).get("API_KEY", "")

    # App metadata
    app_name = ctx.get("app", {}).get("name", "mta-server")
    app_version = ctx.get("app", {}).get("version", "0.0.0")

    # Request (REQUEST scope only)
    request = ctx.get("request", {})
    headers = request.get("headers", {}) if isinstance(request, dict) else dict(request.headers)

    # Shared context
    shared = ctx.get("shared")
    if shared:
        cached_value = shared.get("key", lambda: compute_expensive())
```

```javascript
// Node.js
export function register(ctx) {
    // Environment
    const apiKey = ctx?.env?.API_KEY || '';

    // App metadata
    const appName = ctx?.app?.name || 'mta-server';
    const appVersion = ctx?.app?.version || '0.0.0';

    // Request (REQUEST scope only)
    const headers = ctx?.request?.headers || {};

    // Shared context
    const shared = ctx?.shared;
    if (shared) {
        const cachedValue = shared.get('key', () => computeExpensive());
    }
}
```

---

## File Structure

### Standard Directory Layout

```
server/
├── config/
│   └── lifecycle/
│       ├── 01_app_yaml.py          # Load YAML config
│       └── 02_context_resolver.py  # Setup resolver, registry, shared context
├── computed_functions/
│   ├── my_startup_func.compute.py  # STARTUP scope
│   └── my_request_func.compute.py  # REQUEST scope
└── routes/
    └── api.py
```

### Lifecycle Execution Order

1. `01_app_yaml` - Load and parse YAML configuration
2. `02_context_resolver` - Initialize registry, computed functions, shared context

---

## Complete Examples

### Example 1: STARTUP Utility with REQUEST Access

**Goal**: Register a token generator at STARTUP, use in REQUEST scope.

**Python**:
```python
# config/lifecycle/02_context_resolver.py
async def onStartup(app: FastAPI, config: dict):
    shared = create_shared_context()
    shared.register('token_gen', TokenGenerator(secret=os.getenv('SECRET')))
    app.state.sharedContext = shared

# computed_functions/request_token.compute.py
NAME = "request_token"
SCOPE = ComputeScope.REQUEST

def register(ctx):
    generator = ctx['shared'].get('token_gen')
    request_id = ctx.get('request', {}).get('headers', {}).get('x-request-id', 'none')
    return generator.generate(request_id)
```

**Node.js**:
```javascript
// config/lifecycle/02-context-resolver.mjs
export async function onStartup(server, config) {
    const shared = createSharedContext();
    shared.register('tokenGen', new TokenGenerator(process.env.SECRET));
    server.decorate('sharedContext', shared);
    server.decorateRequest('sharedContext', null);
    server.addHook('onRequest', async (req) => {
        req.sharedContext = shared.createChild();
    });
}

// computed_functions/request_token.compute.mjs
export const NAME = 'requestToken';
export const SCOPE = 'REQUEST';

export function register(ctx) {
    const generator = ctx.shared.get('tokenGen');
    const requestId = ctx?.request?.headers?.['x-request-id'] || 'none';
    return generator.generate(requestId);
}
```

### Example 2: Coordinated Timestamps

**Goal**: Multiple computed functions share the same timestamp per request.

```python
# computed_functions/token_a.compute.py
NAME = "token_a"
SCOPE = ComputeScope.REQUEST
TIMESTAMP_KEY = "coordinated_ts"

def register(ctx):
    ts = ctx['shared'].get(TIMESTAMP_KEY, lambda: int(time.time()))
    return f"a_{ts}"

# computed_functions/token_b.compute.py
NAME = "token_b"
SCOPE = ComputeScope.REQUEST
TIMESTAMP_KEY = "coordinated_ts"  # Same key!

def register(ctx):
    ts = ctx['shared'].get(TIMESTAMP_KEY, lambda: int(time.time()))
    return f"b_{ts}"  # Same timestamp as token_a
```

**YAML**:
```yaml
headers:
  X-Token-A: "{{fn:token_a}}"
  X-Token-B: "{{fn:token_b}}"  # Both have same timestamp
```

### Example 3: Route with Shared Context

**Python (Lazy)**:
```python
async def get_shared(request: Request) -> SharedContext:
    return request.app.state.sharedContext.create_child()

@app.get("/api/process")
async def process(
    request: Request,
    shared: SharedContext = Depends(get_shared),
    config: dict = Depends(get_request_config)
):
    # Use shared context
    rate_limiter = shared.get('rate_limiter')
    if not rate_limiter.allow(request.client.host):
        raise HTTPException(429, "Rate limited")

    # Use resolved config
    api_url = config.get('providers', {}).get('api', {}).get('base_url')

    return {"url": api_url}
```

**Node.js (Eager)**:
```javascript
server.get('/api/process', async (request, reply) => {
    // Shared context already available
    const rateLimiter = request.sharedContext.get('rateLimiter');
    if (!rateLimiter.allow(request.ip)) {
        reply.code(429);
        return { error: 'Rate limited' };
    }

    // Resolved config already available
    const apiUrl = request.resolvedConfig.providers?.api?.base_url;

    return { url: apiUrl };
});
```

---

## Summary

| Aspect | FastAPI | Fastify |
|--------|---------|---------|
| **App State Storage** | `app.state.*` | `server.decorate()` |
| **Request Resolution** | Lazy (`Depends()`) | Eager (hooks) |
| **SharedContext STARTUP** | `app.state.sharedContext` | `server.sharedContext` |
| **SharedContext REQUEST** | `Depends(get_shared_context)` | `request.sharedContext` |
| **Computed Functions** | `*.compute.py` | `*.compute.mjs` |
| **Context Access** | `ctx.get('key', {})` | `ctx?.key` |
