# Shared Context for Computed Functions

This document describes how computed functions can share state during resolution passes, enabling coordination between separate functions that need consistent values (e.g., timestamps).

## Overview

When multiple computed functions need to share state (such as a common timestamp), there are two supported approaches:

| Approach | Scope | Use Case |
|----------|-------|----------|
| **Option 4: Composite Functions** | STARTUP | Single function returns object with multiple properties |
| **Option 5: Shared Context** | REQUEST | Separate functions coordinate via `ctx['shared']` |

## Option 4: Composite Functions (STARTUP Scope)

A single computed function returns an object with multiple properties. Properties are accessed via dot notation in YAML templates.

### YAML Usage

```yaml
headers:
  X-Startup-Token: "{{fn:startup_tokens.case_001}}"
  X-Startup-Token2: "{{fn:startup_tokens.case_005}}"
  X-Server-Start: "{{fn:startup_tokens.timestamp_iso}}"
```

### Python Implementation

```python
# computed_functions/startup_tokens.compute.py
from app_yaml_overwrites.options import ComputeScope

NAME = "startup_tokens"
SCOPE = ComputeScope.STARTUP

class StartupTokensFactory:
    def __init__(self):
        self._timestamp = None

    def _get_timestamp(self):
        if self._timestamp is None:
            self._timestamp = int(time.time())
        return self._timestamp

    def create(self, ctx):
        timestamp = self._get_timestamp()
        app_name = ctx.get("app", {}).get("name", "mta-server")
        app_version = ctx.get("app", {}).get("version", "0.0.0")
        base = f"{app_name}:{app_version}:{timestamp}"

        return {
            "case_001": self._generate_token(base, "001"),
            "case_005": self._generate_token(base, "005"),
            "timestamp": timestamp,
            "timestamp_iso": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(timestamp))
        }

_factory = StartupTokensFactory()

def register(ctx):
    return _factory.create(ctx)
```

### TypeScript Implementation

```typescript
// computed_functions/startup_tokens.compute.mjs
export const NAME = 'startup_tokens';
export const SCOPE = 'STARTUP';

class StartupTokensFactory {
    private timestamp: number | null = null;

    private getTimestamp(): number {
        if (this.timestamp === null) {
            this.timestamp = Math.floor(Date.now() / 1000);
        }
        return this.timestamp;
    }

    create(ctx: any): Record<string, any> {
        const timestamp = this.getTimestamp();
        const appName = ctx?.app?.name || 'mta-server';
        const appVersion = ctx?.app?.version || '0.0.0';
        const base = `${appName}:${appVersion}:${timestamp}`;

        return {
            case_001: this.generateToken(base, '001'),
            case_005: this.generateToken(base, '005'),
            timestamp,
            timestamp_iso: new Date(timestamp * 1000).toISOString()
        };
    }
}

const factory = new StartupTokensFactory();

export function register(ctx: any): Record<string, any> {
    return factory.create(ctx);
}
```

---

## Option 5: Shared Context (REQUEST Scope)

Separate computed functions coordinate via `ctx['shared']`, a thread-safe state container injected into the context. The first function to access a key creates the value; subsequent functions reuse it.

### YAML Usage

```yaml
headers:
  X-Request-Token: "{{fn:request_token_001}}"
  X-Request-Token2: "{{fn:request_token_005}}"
```

### Python Implementation

```python
# computed_functions/request_token_001.compute.py
from app_yaml_overwrites.options import ComputeScope

NAME = "request_token_001"
SCOPE = ComputeScope.REQUEST

class RequestTokenGenerator:
    TIMESTAMP_KEY = "request_tokens_timestamp"

    def __init__(self, case_id: str):
        self.case_id = case_id

    def _get_shared_timestamp(self, ctx):
        shared = ctx.get('shared')
        if shared is None:
            return int(time.time())

        # Unified API: .get(key, factory) - callable default is invoked and cached
        return shared.get(self.TIMESTAMP_KEY, lambda: int(time.time()))

    def generate(self, ctx):
        timestamp = self._get_shared_timestamp(ctx)
        app_name = ctx.get("app", {}).get("name", "mta-server")
        request_id = ctx.get("request", {}).get("headers", {}).get("x-request-id", "no-req-id")
        base = f"{app_name}:{timestamp}:{request_id}"
        return self._generate_token(base)

_generator = RequestTokenGenerator(case_id="001")

def register(ctx):
    return _generator.generate(ctx)
```

### TypeScript Implementation

```typescript
// computed_functions/request_token_001.compute.mjs
export const NAME = 'request_token_001';
export const SCOPE = 'REQUEST';

class RequestTokenGenerator {
    static TIMESTAMP_KEY = 'request_tokens_timestamp';

    constructor(private caseId: string) {}

    private getSharedTimestamp(ctx: any): number {
        const shared = ctx?.shared;
        if (!shared) {
            return Math.floor(Date.now() / 1000);
        }

        // Unified API: .get(key, factory) - callable default is invoked and cached
        return shared.get(
            RequestTokenGenerator.TIMESTAMP_KEY,
            () => Math.floor(Date.now() / 1000)
        );
    }

    generate(ctx: any): string {
        const timestamp = this.getSharedTimestamp(ctx);
        const appName = ctx?.app?.name || 'mta-server';
        const requestId = ctx?.request?.headers?.['x-request-id'] || 'no-req-id';
        const base = `${appName}:${timestamp}:${requestId}`;
        return this.generateToken(base);
    }
}

const generator = new RequestTokenGenerator('001');

export function register(ctx: any): string {
    return generator.generate(ctx);
}
```

---

## SharedContext API Reference

The `SharedContext` class provides a thread-safe state container with a unified API.

### Core Methods

| Method | Description |
|--------|-------------|
| `get(key, default?)` | Get value; if default is callable, invoke and cache result |
| `get_async(key, default?)` | Async version for async factory functions |
| `set(key, value)` | Set a value directly |
| `has(key)` | Check if key exists |
| `delete(key)` | Remove a key |

### Utility Registration

| Method | Description |
|--------|-------------|
| `register(key, value, lazy?)` | Register utility (accessible by child contexts) |
| `get_utils()` | Get all registered utilities |
| `get_util(key, default?)` | Get specific utility |

### Context Inheritance

| Method | Description |
|--------|-------------|
| `create_child()` | Create child context inheriting from this one |
| `with_parent(parent)` | Set parent context |

### Unified `.get()` API

The `get()` method provides a unified interface for all use cases:

```python
# Get existing value or None
value = ctx['shared'].get('key')

# Get with static default
value = ctx['shared'].get('key', 'default_value')

# Get with factory function (invoked and cached if key missing)
timestamp = ctx['shared'].get('timestamp', lambda: int(time.time()))

# Get with object instance
config = ctx['shared'].get('config', MyConfigClass())
```

**Key Behavior**: When a callable (function/lambda) is passed as default:
1. If key exists, return cached value
2. If key missing, invoke callable, cache result, return it
3. Subsequent calls return cached value (factory only called once)

### Async Support

For async factory functions, use `get_async()`:

```python
# Python
async def fetch_config():
    async with aiohttp.ClientSession() as session:
        resp = await session.get('https://config.example.com')
        return await resp.json()

config = await ctx['shared'].get_async('remote_config', fetch_config)
```

```typescript
// TypeScript
const config = await ctx.shared.getAsync('remote_config', async () => {
    const resp = await fetch('https://config.example.com');
    return resp.json();
});
```

### Destructuring from Async Get

Return objects from factories and destructure the result:

```python
# Python - Register factory that returns multiple values
async def load_auth_state():
    token = await fetch_token()
    user = await fetch_user()
    permissions = await fetch_permissions()
    return {
        'token': token,
        'user': user,
        'permissions': permissions,
        'expires_at': time.time() + 3600
    }

# Destructure the result
auth_state = await ctx['shared'].get_async('auth', load_auth_state)
token = auth_state['token']
user = auth_state['user']
permissions = auth_state['permissions']

# Or in one line (Python 3.10+)
# token, user, permissions = (s := await ctx['shared'].get_async('auth', load_auth_state))['token'], s['user'], s['permissions']
```

```typescript
// TypeScript - Destructure async result
const authState = await ctx.shared.getAsync('auth', async () => {
    const [token, user, permissions] = await Promise.all([
        fetchToken(),
        fetchUser(),
        fetchPermissions()
    ]);
    return { token, user, permissions, expiresAt: Date.now() + 3600000 };
});

// Destructure
const { token, user, permissions } = authState;
```

---

## Registering Utilities at STARTUP

Register functions, classes, or services at STARTUP that are accessible at REQUEST time.

### Register a Utility Class

```python
# lifecycle/startup.py
from app_yaml_overwrites.shared_context import SharedContext

class TokenGenerator:
    """Utility class for generating tokens."""

    def __init__(self, secret: str):
        self.secret = secret

    def generate(self, data: str) -> str:
        import hashlib
        return hashlib.sha256(f"{self.secret}:{data}".encode()).hexdigest()[:16]

# At STARTUP
startup_shared = SharedContext()
startup_shared.register('token_generator', TokenGenerator(secret='my-secret-key'))
```

```typescript
// lifecycle/startup.mjs
import { SharedContext } from 'app_yaml_overwrites';

class TokenGenerator {
    constructor(private secret: string) {}

    generate(data: string): string {
        const crypto = require('crypto');
        return crypto.createHash('sha256')
            .update(`${this.secret}:${data}`)
            .digest('hex')
            .slice(0, 16);
    }
}

// At STARTUP
const startupShared = new SharedContext();
startupShared.register('tokenGenerator', new TokenGenerator('my-secret-key'));
```

### Register a Factory Function

```python
# Register a lazy factory - only called on first access
startup_shared.register('db_pool', lambda: create_db_pool(), lazy=True)

# Register an async initializer
startup_shared.register('cache_client', redis.from_url('redis://localhost'))
```

### Access at REQUEST Time

```python
# In REQUEST-scoped computed function
def register(ctx):
    # Get utility registered at STARTUP (via parent context)
    generator = ctx['shared'].get('token_generator')

    # Use the utility
    request_id = ctx.get('request', {}).get('headers', {}).get('x-request-id', 'default')
    token = generator.generate(request_id)

    return f"req_{token}"
```

```typescript
// In REQUEST-scoped computed function
export function register(ctx: any): string {
    // Get utility registered at STARTUP (via parent context)
    const generator = ctx.shared.get('tokenGenerator');

    // Use the utility
    const requestId = ctx?.request?.headers?.['x-request-id'] || 'default';
    const token = generator.generate(requestId);

    return `req_${token}`;
}
```

### Register Multiple Utilities with Chaining

```python
startup_shared \
    .register('token_generator', TokenGenerator('secret')) \
    .register('rate_limiter', RateLimiter(max_requests=100)) \
    .register('logger', create_logger('app')) \
    .register('metrics', MetricsClient())
```

```typescript
startupShared
    .register('tokenGenerator', new TokenGenerator('secret'))
    .register('rateLimiter', new RateLimiter({ maxRequests: 100 }))
    .register('logger', createLogger('app'))
    .register('metrics', new MetricsClient());
```

### Get All Registered Utilities

```python
# List all available utilities
utils = ctx['shared'].get_utils()
print(utils.keys())  # ['token_generator', 'rate_limiter', 'logger', 'metrics']

# Check if utility exists
if 'token_generator' in ctx['shared']:
    generator = ctx['shared'].get('token_generator')
```

---

## Server Integration

SharedContext integrates with FastAPI and Fastify following the same state management patterns as `runtime_template_resolver` and `AppYamlConfig`.

### State Management Overview

| Scope | Python (FastAPI) | Node.js (Fastify) |
|-------|------------------|-------------------|
| **App State (STARTUP)** | `app.state.sharedContext` | `server.sharedContext` (via `decorate`) |
| **Request State** | `Depends(get_shared_context)` (Lazy) | `request.sharedContext` (Eager via hook) |

### Python (FastAPI)

FastAPI uses `app.state` for application-level state and explicit dependency injection for request-scoped access.

#### App State Properties

| Property | Type | Description |
|----------|------|-------------|
| `app.state.sharedContext` | `SharedContext` | STARTUP shared context (server lifetime) |

#### lifecycle/02_context_resolver.py

```python
import os
from fastapi import FastAPI, Request, Depends
from runtime_template_resolver import create_registry, ComputeScope
from runtime_template_resolver.integrations.fastapi import resolve_startup
from app_yaml_overwrites.shared_context import SharedContext, create_shared_context


async def onStartup(app: FastAPI, config: dict):
    """Initialize Runtime Template Resolver with SharedContext on startup."""

    # Create STARTUP shared context (persists for server lifetime)
    shared_context = create_shared_context()

    # Register utilities at STARTUP
    shared_context.register('token_generator', TokenGenerator(secret='my-secret'))
    shared_context.register('rate_limiter', RateLimiter(max_requests=100))

    # Get raw config from app.state.config (AppYamlConfig instance)
    app_config = getattr(app.state, "config", None)
    raw_config = app_config.get_all() if hasattr(app_config, "get_all") else {}

    # Create registry and register compute functions
    registry = create_registry()
    register_compute_functions(registry)
    auto_load_compute_functions(registry)

    # Store on app.state (follows same pattern as config, sdk, resolved_config)
    app.state.context_registry = registry
    app.state.context_raw_config = raw_config
    app.state.sharedContext = shared_context  # STARTUP shared context

    # Resolve STARTUP config with shared context
    startup_context = {
        "env": dict(os.environ),
        "config": raw_config,
        "app": raw_config.get("app", {}),
        "shared": shared_context,
    }

    await resolve_startup(
        app=app,
        config=raw_config,
        registry=registry,
        context=startup_context,
        state_property="resolved_config"
    )
```

#### Request State (Lazy via Depends)

Request-scoped SharedContext is **Lazy/Opt-in** - endpoints must explicitly request it.

```python
from fastapi import Depends, Request

async def get_shared_context(request: Request) -> SharedContext:
    """Dependency to get request-scoped SharedContext."""
    startup_shared = getattr(request.app.state, "sharedContext", None)

    # Create child context for this request (inherits from STARTUP)
    return startup_shared.create_child() if startup_shared else create_shared_context()


@app.get("/api/data")
async def get_data(shared: SharedContext = Depends(get_shared_context)):
    # Access STARTUP-registered utility via shared context
    generator = shared.get('token_generator')
    token = generator.generate("some-data")

    # Set request-specific value (doesn't affect STARTUP context)
    shared.set('request_processed_at', time.time())

    return {"token": token}
```

#### Direct Access to STARTUP Context

```python
@app.get("/api/info")
async def get_info(request: Request):
    # Access STARTUP shared context directly (no child creation)
    startup_shared = request.app.state.sharedContext

    # Get registered utilities
    utils = startup_shared.get_utils()
    return {"registered_utilities": list(utils.keys())}
```

---

### Node.js (Fastify)

Fastify uses the Decoration API (`server.decorate`) for app state and hooks for request state.

#### App State Properties

| Property | Type | Description |
|----------|------|-------------|
| `server.sharedContext` | `SharedContext` | STARTUP shared context (server lifetime) |

#### Request State Properties

| Property | Type | Description |
|----------|------|-------------|
| `request.sharedContext` | `SharedContext` | REQUEST child context (per-request) |

#### lifecycle/02-context-resolver.mjs

```javascript
import { createRegistry, ComputeScope } from 'runtime-template-resolver';
import { contextResolverPlugin } from 'runtime-template-resolver/integrations/fastify';
import { SharedContext, createSharedContext } from 'app_yaml_overwrites';

export async function onStartup(server, config) {
    // Create STARTUP shared context (persists for server lifetime)
    const sharedContext = createSharedContext();

    // Register utilities at STARTUP
    sharedContext.register('tokenGenerator', new TokenGenerator('my-secret'));
    sharedContext.register('rateLimiter', new RateLimiter({ maxRequests: 100 }));

    // Get raw config from server.config (AppYamlConfig instance)
    const appConfig = server.config;
    const rawConfig = appConfig?.toObject?.() || appConfig?.getAll?.() || {};

    // Create registry and register compute functions
    const registry = createRegistry(server.log);
    registerComputeFunctions(registry);
    await autoLoadComputeFunctions(registry, null, server.log);

    // Decorate server with STARTUP shared context (follows same pattern as config, sdk)
    server.decorate('sharedContext', sharedContext);

    // Decorate request with null (will be populated in onRequest hook)
    server.decorateRequest('sharedContext', null);

    // Eager: Create child context for every request
    server.addHook('onRequest', async (request) => {
        request.sharedContext = sharedContext.createChild();
    });

    // Register context resolver plugin
    await server.register(contextResolverPlugin, {
        config: rawConfig,
        registry: registry,
        instanceProperty: 'resolvedConfig',
        requestProperty: 'resolvedConfig',
        logger: server.log,
        buildStartupContext: () => ({
            env: process.env,
            config: rawConfig,
            app: rawConfig?.app || {},
            shared: sharedContext,
        }),
        buildRequestContext: (request) => ({
            env: process.env,
            config: rawConfig,
            app: rawConfig?.app || {},
            state: request.state || {},
            request: {
                headers: request.headers,
                query: request.query,
                params: request.params,
            },
            shared: request.sharedContext,
        }),
    });

    server.log.info('Runtime Template Resolver initialized with SharedContext');
}
```

#### Request State (Eager via Hook)

Request-scoped SharedContext is **Automatic/Eager** - available on every request.

```javascript
server.get('/api/data', async (request, reply) => {
    // Automatically populated by onRequest hook
    const shared = request.sharedContext;

    // Access STARTUP-registered utility
    const generator = shared.get('tokenGenerator');
    const token = generator.generate('some-data');

    // Set request-specific value
    shared.set('requestProcessedAt', Date.now());

    return { token };
});
```

#### Direct Access to STARTUP Context

```javascript
server.get('/api/info', async (request, reply) => {
    // Access STARTUP shared context directly
    const startupShared = server.sharedContext;

    // Get registered utilities
    const utils = startupShared.getUtils();
    return { registeredUtilities: Object.keys(utils) };
});
```

---

### Summary of Differences

| Feature | Python (FastAPI) | Node.js (Fastify) |
|---------|------------------|-------------------|
| **Startup Setup** | `app.state.sharedContext` | `server.decorate('sharedContext', ...)` |
| **Request Resolution** | **Lazy** via `Depends(get_shared_context)` | **Eager** via `onRequest` hook |
| **Request Access** | `shared = await get_shared_context(request)` | `request.sharedContext` |
| **STARTUP Access** | `request.app.state.sharedContext` | `server.sharedContext` |

---

## Parent-Child Context Inheritance

SharedContext supports parent-child relationships, allowing REQUEST-scoped functions to access values registered at STARTUP.

### Registering at STARTUP

```python
# In STARTUP lifecycle
startup_context = SharedContext()
startup_context.register('token_generator', TokenGenerator())
startup_context.register('app_config', load_config())
```

### Accessing at REQUEST

```python
# In REQUEST lifecycle - create child context
request_context = startup_context.create_child()

# Child can access parent's registered values
generator = request_context.get('token_generator')
config = request_context.get('app_config')

# Child can set its own values without affecting parent
request_context.set('request_id', 'abc-123')
```

### Inheritance Rules

1. **Read**: Child checks local data first, then parent chain
2. **Write**: Child writes only affect child (parent unchanged)
3. **Utilities**: Parent utilities accessible via `get()` and `get_utils()`

---

## Complete Example: Coordinated Tokens

Two computed functions generating tokens with the same timestamp:

### request_token_001.compute.py
```python
NAME = "request_token_001"
SCOPE = ComputeScope.REQUEST

class RequestTokenGenerator:
    TIMESTAMP_KEY = "request_tokens_timestamp"

    def __init__(self, case_id: str):
        self.case_id = case_id

    def generate(self, ctx):
        # First caller creates timestamp, others reuse it
        timestamp = ctx['shared'].get(
            self.TIMESTAMP_KEY,
            lambda: int(time.time())
        )
        return f"req_tok_{self.case_id}_{timestamp}"

_generator = RequestTokenGenerator("001")

def register(ctx):
    return _generator.generate(ctx)
```

### request_token_005.compute.py
```python
NAME = "request_token_005"
SCOPE = ComputeScope.REQUEST

class RequestTokenGenerator:
    TIMESTAMP_KEY = "request_tokens_timestamp"  # Same key!

    def __init__(self, case_id: str):
        self.case_id = case_id

    def generate(self, ctx):
        # Reuses timestamp from request_token_001 (or creates if called first)
        timestamp = ctx['shared'].get(
            self.TIMESTAMP_KEY,
            lambda: int(time.time())
        )
        return f"req_tok_{self.case_id}_{timestamp}"

_generator = RequestTokenGenerator("005")

def register(ctx):
    return _generator.generate(ctx)
```

### Result

Both `request_token_001` and `request_token_005` will use the **same timestamp** regardless of execution order, because:

1. First function called invokes the factory and caches result
2. Second function finds cached value and returns it
3. Factory is only called once per resolution pass

---

## Migration Guide

### From `get_or_set()` to `get()`

The `get_or_set()` method is deprecated. Use the unified `get()` API:

```python
# Old (deprecated)
timestamp = ctx['shared'].get_or_set('ts', lambda: time.time())

# New (recommended)
timestamp = ctx['shared'].get('ts', lambda: time.time())
```

Both behave identically - callable defaults are invoked and cached.

---

## File Locations

| Component | Python | TypeScript |
|-----------|--------|------------|
| SharedContext | `app_yaml_overwrites/shared_context.py` | `app_yaml_overwrites/src/shared-context.ts` |
| Example: Startup Tokens | `fastapi_server/computed_functions/startup_tokens.compute.py` | `fastify_server/computed_functions/startup_tokens.compute.mjs` |
| Example: Request Token 001 | `fastapi_server/computed_functions/request_token_001.compute.py` | `fastify_server/computed_functions/request_token_001.compute.mjs` |
| Example: Request Token 005 | `fastapi_server/computed_functions/request_token_005.compute.py` | `fastify_server/computed_functions/request_token_005.compute.mjs` |
