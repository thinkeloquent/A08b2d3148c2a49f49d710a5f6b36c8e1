# Figma API SDK -- Behavioral Differences Between JavaScript and Python

This document catalogs every intentional behavioral difference between the JavaScript/TypeScript and Python implementations of the Figma API SDK. Each difference includes context and reasoning.

---

## Table of Contents

1. [Timeout Units](#1-timeout-units)
2. [Cache Constructor Shape](#2-cache-constructor-shape)
3. [Async Patterns](#3-async-patterns)
4. [Client Lifecycle (Context Manager)](#4-client-lifecycle-context-manager)
5. [Naming Conventions](#5-naming-conventions)
6. [Error Serialization](#6-error-serialization)
7. [Token Resolution](#7-token-resolution)
8. [Server Framework](#8-server-framework)
9. [HTTP Client Library](#9-http-client-library)
10. [Config Loading](#10-config-loading)
11. [Module System](#11-module-system)
12. [Rate Limit Info Representation](#12-rate-limit-info-representation)
13. [Error Hierarchy Details](#13-error-hierarchy-details)

---

## 1. Timeout Units

| Aspect | JavaScript | Python |
|--------|-----------|--------|
| Unit | Milliseconds | Seconds |
| Default value | `30000` | `30` |
| Constructor param | `timeout: 30000` | `timeout=30` |
| Env var value | `"30000"` (parsed as ms) | `"30"` (parsed as seconds) |

**Reasoning**: Each language follows its ecosystem's convention. Node.js APIs (e.g., `http.request`, `setTimeout`) universally operate in milliseconds. Python APIs (e.g., `httpx.AsyncClient`, `asyncio.wait_for`, `requests`) universally operate in seconds. Using native units eliminates mental conversion for developers working within their ecosystem.

---

## 2. Cache Constructor Shape

| Aspect | JavaScript | Python |
|--------|-----------|--------|
| Standalone cache | `new RequestCache({ maxSize: 100, ttl: 300 })` | `RequestCache(max_size=100, ttl=300)` |
| Via FigmaClient | `cache: { maxSize: 100, ttl: 300 }` | `cache_max_size=100, cache_ttl=300` |

**Reasoning**: JavaScript commonly passes configuration as a single options object (destructured in the constructor), which is idiomatic for APIs like Express, Fastify, and most npm packages. Python favors explicit keyword arguments, which integrate naturally with IDE autocompletion and type checkers. Flattening cache parameters into `FigmaClient`'s constructor in Python avoids nesting dicts for configuration, which is considered non-Pythonic.

---

## 3. Async Patterns

| Aspect | JavaScript | Python |
|--------|-----------|--------|
| Return type | `Promise<T>` | Coroutine (awaitable) |
| Async keyword | `async function` / `async () =>` | `async def` |
| Event loop | Implicit (Node.js event loop) | Explicit (`asyncio.run()` or framework-managed) |
| Concurrency | `Promise.all([...])` | `asyncio.gather(...)` |

**JavaScript example:**

```javascript
import { FigmaClient, FilesClient } from '@internal/figma-api';

const client = new FigmaClient({ token: 'fig_...' });
const files = new FilesClient(client);

const file = await files.getFile('abc123');
```

**Python example:**

```python
import asyncio
from figma_api import FigmaClient, FilesClient

async def main():
    async with FigmaClient(token='fig_...') as client:
        files = FilesClient(client)
        file = await files.get_file('abc123')

asyncio.run(main())
```

**Reasoning**: Both languages use their native async primitives. Node.js has a built-in event loop that requires no boilerplate. Python requires explicit event loop management (`asyncio.run`) when not running inside a framework like FastAPI that manages the loop.

---

## 4. Client Lifecycle (Context Manager)

| Aspect | JavaScript | Python |
|--------|-----------|--------|
| Context manager | Not available | `async with FigmaClient() as client:` |
| Manual close | Not required (no persistent connection pool) | `await client.close()` |

**JavaScript example:**

```javascript
const client = new FigmaClient({ token: 'fig_...' });
// Use client...
// No explicit cleanup needed; undici manages connections internally
```

**Python example:**

```python
# Preferred: context manager
async with FigmaClient(token='fig_...') as client:
    result = await client.get('/v1/files/abc123')
# client.close() called automatically on exit

# Manual alternative
client = FigmaClient(token='fig_...')
try:
    result = await client.get('/v1/files/abc123')
finally:
    await client.close()
```

**Reasoning**: Python's `httpx.AsyncClient` maintains a connection pool that must be explicitly closed to avoid resource leaks. The `async with` pattern is the Pythonic solution for resource management (PEP 343). Node.js's `undici` handles connection lifecycle internally without requiring explicit cleanup from user code.

---

## 5. Naming Conventions

| Aspect | JavaScript | Python |
|--------|-----------|--------|
| Methods | `camelCase` | `snake_case` |
| Properties | `camelCase` | `snake_case` |
| Classes | `PascalCase` | `PascalCase` |
| Constants | `UPPER_SNAKE_CASE` | `UPPER_SNAKE_CASE` |
| Dict/object keys (API responses) | `camelCase` | `snake_case` |
| Dict/object keys (error serialization) | `camelCase` | `snake_case` |

**Examples:**

| Concept | JavaScript | Python |
|---------|-----------|--------|
| Get file | `getFile(fileKey)` | `get_file(file_key)` |
| File key param | `fileKey` | `file_key` |
| Rate limit info | `rateLimitInfo.retryAfter` | `rate_limit_info.retry_after` |
| Client stats | `client.stats.requestsMade` | `client.stats["requests_made"]` |
| Error field | `error.requestId` | `error.request_id` |

**Reasoning**: Each language follows its community style guide (Airbnb/StandardJS conventions for JavaScript, PEP 8 for Python). Forcing one convention onto both languages would create friction for developers and violate linting rules in the non-native language.

---

## 6. Error Serialization

| Aspect | JavaScript | Python |
|--------|-----------|--------|
| Method name | `toJSON()` | `to_dict()` |
| Return type | Plain object | `dict` |
| Key casing | camelCase | snake_case |

**JavaScript:**

```javascript
catch (err) {
  const serialized = err.toJSON();
  // { name: "NotFoundError", message: "...", status: 404, code: "NOT_FOUND",
  //   requestId: "...", meta: {}, timestamp: "..." }
}
```

**Python:**

```python
except NotFoundError as err:
    serialized = err.to_dict()
    # { "name": "NotFoundError", "message": "...", "status": 404, "code": "NOT_FOUND",
    #   "request_id": "...", "meta": {}, "timestamp": "..." }
```

**Reasoning**: `toJSON()` is the JavaScript convention recognized by `JSON.stringify()` for custom serialization. Python has no equivalent protocol, so `to_dict()` follows the common Python pattern (seen in dataclasses, Django models, SQLAlchemy). Key casing matches each language's convention for consistency with the rest of the SDK surface.

---

## 7. Token Resolution

| Aspect | JavaScript | Python |
|--------|-----------|--------|
| Function | `resolveToken(explicit?)` | `resolve_token(explicit=None)` |
| Return type | `{ token: string, source: string }` | `TokenInfo(token: str, source: str)` (named tuple or dataclass) |
| Priority order | explicit > `FIGMA_TOKEN` > `FIGMA_ACCESS_TOKEN` | Identical |
| Failure behavior | Throws `AuthError` | Raises `AuthError` |

**Reasoning**: The resolution priority is identical -- this is a behavioral invariant. The only difference is the return type representation: JavaScript returns a plain object (idiomatic), Python returns a typed `TokenInfo` (leveraging Python's type system for better IDE support).

---

## 8. Server Framework

| Aspect | JavaScript | Python |
|--------|-----------|--------|
| Framework | Fastify | FastAPI |
| CORS | `@fastify/cors` plugin | `CORSMiddleware` |
| Error handling | `@fastify/sensible` plugin | FastAPI exception handlers |
| Client access | Fastify decoration (`server.figmaClient`) | `app.state` + dependency injection |
| Entry point | `createServer(opts)` returns `{ server, client }` | `create_app(config)` returns `FastAPI` |
| Start | `startServer(server, { port, host })` | External: `uvicorn figma_api.server:app` |

**JavaScript:**

```javascript
import { createServer, startServer } from '@internal/figma-api';

const { server, client } = createServer({ token: 'fig_...' });
await startServer(server, { port: 3000, host: '0.0.0.0' });
```

**Python:**

```python
from figma_api import create_app, Config

config = Config.from_env()
app = create_app(config)
# Run externally: uvicorn figma_api.server:app --port 3000 --host 0.0.0.0
```

**Reasoning**: Fastify and FastAPI are the performance-oriented framework choices in their respective ecosystems. Fastify uses a plugin/decoration model for dependency injection. FastAPI uses Python's native dependency injection and ASGI lifespan events. The Python implementation delegates server startup to uvicorn (standard ASGI practice), while Node.js manages the listen call directly.

---

## 9. HTTP Client Library

| Aspect | JavaScript | Python |
|--------|-----------|--------|
| Library | `undici` | `httpx` |
| Connection pooling | Automatic, internal | Explicit via `AsyncClient` |
| Cleanup required | No | Yes (`await client.close()` or context manager) |

**Reasoning**: `undici` is the official high-performance HTTP client for Node.js (bundled since Node 18). `httpx` is the de facto async HTTP library for Python, offering an API similar to `requests` but with full async support. Both are the standard choices in their ecosystems.

---

## 10. Config Loading

| Aspect | JavaScript | Python |
|--------|-----------|--------|
| Function | `loadConfig()` | `Config.from_env()` |
| Return type | Plain object | Frozen dataclass |
| Mutability | Mutable | Immutable (frozen) |
| Defaults | `DEFAULTS` object | `DEFAULTS` dict |

**JavaScript:**

```javascript
import { loadConfig, DEFAULTS } from '@internal/figma-api';

const config = loadConfig();
config.timeout = 60000;  // Mutable -- allowed but not recommended
```

**Python:**

```python
from figma_api import Config, DEFAULTS

config = Config.from_env()
# config.timeout = 60  # FrozenInstanceError -- immutable by design
```

**Reasoning**: Python uses a frozen dataclass to enforce immutability, preventing accidental mutation of shared configuration state. This is a defensive pattern common in Python applications. JavaScript returns a plain object because freezing objects (`Object.freeze`) is rarely done in the Node.js ecosystem and can interfere with proxy-based testing tools.

---

## 11. Module System

| Aspect | JavaScript | Python |
|--------|-----------|--------|
| Module system | ESM (`import`/`export`) | Standard Python packages (`import`) |
| File extension | `.mjs` | `.py` |
| Package name | `@internal/figma-api` | `figma_api` |
| Installation | npm (workspace/local) | pip |

**JavaScript:**

```javascript
import { FigmaClient, FilesClient, NotFoundError } from '@internal/figma-api';
```

**Python:**

```python
from figma_api import FigmaClient, FilesClient, NotFoundError
```

**Reasoning**: Each uses its language's standard module and packaging system. The JavaScript package uses ESM exclusively (`.mjs` files) for forward compatibility and tree-shaking support. The Python package follows standard `pip`-installable conventions.

---

## 12. Rate Limit Info Representation

| Aspect | JavaScript | Python |
|--------|-----------|--------|
| Type | Plain object | `RateLimitInfo` dataclass |
| Key format | camelCase | snake_case |
| Access pattern | `info.retryAfter` | `info.retry_after` |

**JavaScript:**

```javascript
client.lastRateLimit;
// { retryAfter: 30, planTier: "starter", rateLimitType: "file",
//   upgradeLink: "https://...", timestamp: "2025-..." }
```

**Python:**

```python
client.last_rate_limit
# RateLimitInfo(retry_after=30, plan_tier="starter", rate_limit_type="file",
#               upgrade_link="https://...", timestamp="2025-...")
```

**Reasoning**: Python leverages dataclasses for structured data with type hints, IDE autocompletion, and attribute validation. JavaScript uses plain objects because they are the natural lightweight data structure and integrate seamlessly with JSON serialization.

---

## 13. Error Hierarchy Details

The class hierarchy is structurally identical in both languages. The differences lie in how `RateLimitError` carries rate-limit metadata.

| Aspect | JavaScript | Python |
|--------|-----------|--------|
| Rate limit metadata location | `error.meta.rateLimitInfo` | `error.rate_limit_info` (dedicated kwarg) |
| Rate limit metadata type | Plain object (camelCase keys) | `RateLimitInfo` dataclass (snake_case attrs) |

**JavaScript:**

```javascript
import { RateLimitError } from '@internal/figma-api';

try {
  await client.get('/v1/files/abc');
} catch (err) {
  if (err instanceof RateLimitError) {
    console.log(err.meta.rateLimitInfo.retryAfter);  // 30
  }
}
```

**Python:**

```python
from figma_api import RateLimitError

try:
    await client.get('/v1/files/abc')
except RateLimitError as err:
    print(err.rate_limit_info.retry_after)  # 30
```

**Reasoning**: Python's explicit `rate_limit_info` keyword argument on `RateLimitError` provides stronger typing and clearer access semantics. JavaScript packs it into the generic `meta` object following the convention of extensible error metadata, which is common in npm error libraries.

---

## Summary Table

| # | Difference | JavaScript | Python | Reason |
|---|-----------|-----------|--------|--------|
| 1 | Timeout units | Milliseconds | Seconds | Ecosystem convention |
| 2 | Cache config | Options object | Flat keyword args | Idiomatic constructor patterns |
| 3 | Async model | Promise-based | asyncio coroutines | Native async primitives |
| 4 | Context manager | Not available | `async with` | httpx requires explicit cleanup |
| 5 | Naming | camelCase | snake_case | Language style guides |
| 6 | Error serialization | `toJSON()` camelCase | `to_dict()` snake_case | Serialization conventions |
| 7 | Token resolution return | Plain object | `TokenInfo` dataclass | Type system capabilities |
| 8 | Server framework | Fastify + plugins | FastAPI + lifespan | Ecosystem best practice |
| 9 | HTTP client | undici | httpx | Standard async HTTP libraries |
| 10 | Config return type | Mutable object | Frozen dataclass | Mutability philosophy |
| 11 | Module system | ESM (.mjs) | Standard packages (.py) | Language module systems |
| 12 | Rate limit info | Plain object | Dataclass | Data structure conventions |
| 13 | RateLimitError metadata | `meta.rateLimitInfo` | `rate_limit_info` kwarg | Error extensibility patterns |
