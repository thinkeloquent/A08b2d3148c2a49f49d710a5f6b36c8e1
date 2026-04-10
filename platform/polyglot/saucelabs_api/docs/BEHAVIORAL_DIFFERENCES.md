# Sauce Labs API SDK -- Behavioral Differences Between JavaScript and Python

This document catalogs every intentional behavioral difference between the JavaScript/TypeScript and Python implementations of the Sauce Labs API SDK. Each difference includes context and reasoning.

---

## Table of Contents

1. [Timeout Units](#1-timeout-units)
2. [Async Patterns](#2-async-patterns)
3. [Client Lifecycle (Context Manager)](#3-client-lifecycle-context-manager)
4. [Naming Conventions](#4-naming-conventions)
5. [HTTP Client Library](#5-http-client-library)
6. [Rate Limit Defaults](#6-rate-limit-defaults)
7. [Error Serialization](#7-error-serialization)
8. [Convenience Factory](#8-convenience-factory)
9. [Server Framework](#9-server-framework)
10. [Logger Output](#10-logger-output)
11. [Module System](#11-module-system)
12. [Domain Module Method Signatures](#12-domain-module-method-signatures)

---

## 1. Timeout Units

| Aspect | JavaScript | Python |
|--------|-----------|--------|
| Unit | Milliseconds | Seconds |
| Default value | `30000` | `30.0` |
| Constructor param | `timeout: 30000` | `timeout=30.0` |
| Env var value | `"30000"` (parsed as ms) | `"30"` (parsed as seconds) |
| Timeout mechanism | `AbortSignal.timeout(ms)` | `httpx.AsyncClient(timeout=s)` |

**Reasoning**: Each language follows its ecosystem's convention. Node.js APIs (e.g., `setTimeout`, `http.request`) universally operate in milliseconds. Python APIs (e.g., `httpx.AsyncClient`, `asyncio.wait_for`) universally operate in seconds. Using native units eliminates mental conversion for developers working within their ecosystem.

---

## 2. Async Patterns

| Aspect | JavaScript | Python |
|--------|-----------|--------|
| Return type | `Promise<T>` | Coroutine (awaitable) |
| Async keyword | `async function` / `async () =>` | `async def` |
| Event loop | Implicit (Node.js event loop) | Explicit (`asyncio.run()` or framework-managed) |
| Concurrency | `Promise.all([...])` | `asyncio.gather(...)` |
| Constructor | Synchronous (`new SaucelabsClient(opts)`) | Synchronous (`SaucelabsClient(opts)`) |
| Context manager | Not available | `async with SaucelabsClient() as client:` |

**JavaScript example:**

```javascript
import { SaucelabsClient } from './saucelabs_client.mjs';

const client = new SaucelabsClient({ apiKey: 'sauce_...' });

const status = await client.getStatus();
```

**Python example:**

```python
import asyncio
from saucelabs_api import SaucelabsClient

async def main():
    async with SaucelabsClient(api_key='sauce_...') as client:
        status = await client.get_status()

asyncio.run(main())
```

**Reasoning**: Both languages use their native async primitives. Node.js has a built-in event loop that requires no boilerplate and uses native `fetch()` for HTTP requests. Python requires explicit event loop management (`asyncio.run`) when not running inside a framework like FastAPI that manages the loop, and uses `httpx.AsyncClient` for async HTTP.

---

## 3. Client Lifecycle (Context Manager)

| Aspect | JavaScript | Python |
|--------|-----------|--------|
| Context manager | Not available | `async with SaucelabsClient() as client:` |
| Manual close | `client.close()` -- synchronous no-op | `await client.close()` -- closes httpx.AsyncClient connections |
| Persistent connection pool | No (native fetch manages internally) | Yes (httpx.AsyncClient maintains pool) |
| Cleanup required | No | Yes |

**JavaScript example:**

```javascript
const client = new SaucelabsClient({ apiKey: 'sauce_...' });
// Use client...
client.close();  // Synchronous no-op; no persistent pool to close
// No explicit cleanup needed; native fetch() manages connections internally
```

**Python example:**

```python
# Preferred: context manager
async with SaucelabsClient(api_key='sauce_...') as client:
    result = await client.get_status()
# client.close() called automatically on exit

# Manual alternative
client = SaucelabsClient(api_key='sauce_...')
try:
    result = await client.get_status()
finally:
    await client.close()
```

**Reasoning**: Python's `httpx.AsyncClient` maintains a connection pool that must be explicitly closed to avoid resource leaks. The `async with` pattern is the Pythonic solution for resource management (PEP 343). Node.js's native `fetch()` handles connection lifecycle internally without requiring explicit cleanup from user code, so `close()` exists only for API symmetry and is a no-op.

---

## 4. Naming Conventions

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
| API key param | `apiKey` | `api_key` |
| Base URL param | `baseUrl` | `base_url` |
| Get status | `getStatus()` | `get_status()` |
| Get platforms | `getPlatforms()` | `get_platforms()` |
| Rate limit auto-wait | `rateLimitAutoWait` | `rate_limit_auto_wait` |
| Error field | `error.statusCode` | `error.status_code` |

**Reasoning**: Each language follows its community style guide (Airbnb/StandardJS conventions for JavaScript, PEP 8 for Python). Forcing one convention onto both languages would create friction for developers and violate linting rules in the non-native language.

---

## 5. HTTP Client Library

| Aspect | JavaScript | Python |
|--------|-----------|--------|
| Library | Native `fetch()` (Node.js 20+) | `httpx.AsyncClient` |
| Timeout mechanism | `AbortSignal.timeout(ms)` | `httpx.Timeout(seconds)` |
| Connection pooling | Automatic, internal to fetch | Explicit via `AsyncClient` |
| Client instances | Single (native fetch, no persistent client) | Dual (core base URL + mobile base URL) |
| Cleanup required | No | Yes (`await client.close()` or context manager) |

**Reasoning**: Node.js 20+ provides a stable, performant native `fetch()` implementation that requires no external dependencies and manages connections internally via `AbortSignal.timeout()` for request cancellation. Python's `httpx` is the de facto async HTTP library, offering an API similar to `requests` but with full async support. The Python implementation uses two `httpx.AsyncClient` instances to handle the core and mobile API base URLs, while JavaScript constructs full URLs per-request using native fetch.

---

## 6. Rate Limit Defaults

| Aspect | JavaScript | Python |
|--------|-----------|--------|
| Error class | `SaucelabsRateLimitError` | `SaucelabsRateLimitError` |
| `retryAfter` / `retry_after` default | `60` seconds | `1.0` seconds |
| `parseRetryAfter("")` result | `60` | `1.0` |
| `parseRetryAfter(null)` result | `60` | `1.0` |

**JavaScript example:**

```javascript
import { SaucelabsRateLimitError } from './errors.mjs';

try {
  await client.getStatus();
} catch (err) {
  if (err instanceof SaucelabsRateLimitError) {
    console.log(err.retryAfter);  // 60 (default when header missing)
  }
}
```

**Python example:**

```python
from saucelabs_api import SaucelabsRateLimitError

try:
    await client.get_status()
except SaucelabsRateLimitError as err:
    print(err.retry_after)  # 1.0 (default when header missing)
```

**Reasoning**: The JavaScript implementation defaults to a conservative 60-second retry window, favoring safety in production environments where aggressive retries could exacerbate rate limiting. The Python implementation defaults to 1.0 second, favoring responsiveness in interactive and scripting contexts where Python is commonly used. Both values are overridden when the server sends an explicit `Retry-After` header.

---

## 7. Error Serialization

| Aspect | JavaScript | Python |
|--------|-----------|--------|
| Serialization method | `err.toJSON()` | `str(err)` |
| Return type | Plain object | Formatted message string |
| Status code access | `err.statusCode` | `err.status_code` |
| Timestamp included | Yes (`timestamp` field) | No (included in string output) |
| JSON fields | `{ error, name, message, statusCode, endpoint, method, timestamp }` | N/A (string representation) |

**JavaScript:**

```javascript
catch (err) {
  const serialized = err.toJSON();
  // { error: true, name: "SaucelabsApiError", message: "...",
  //   statusCode: 404, endpoint: "/rest/v1/...", method: "GET",
  //   timestamp: "2025-..." }
}
```

**Python:**

```python
except SaucelabsApiError as err:
    print(str(err))
    # "SaucelabsApiError: 404 GET /rest/v1/... - Not Found"
    print(err.status_code)  # 404
```

**Reasoning**: `toJSON()` is the JavaScript convention recognized by `JSON.stringify()` for custom serialization, returning structured data suitable for logging pipelines and error tracking services. Python's `__str__` method follows the convention of providing a human-readable representation, which integrates naturally with `print()`, logging, and exception tracebacks. Both expose status code as a typed attribute for programmatic access.

---

## 8. Convenience Factory

| Aspect | JavaScript | Python |
|--------|-----------|--------|
| Function name | `createSaucelabsClient(options)` | `create_saucelabs_client(**kwargs)` |
| Parameter style | Options object | Keyword arguments |
| Config type | Plain object | Optional `SaucelabsClientOptions` dataclass |
| Return type | `SaucelabsClient` instance | `SaucelabsClient` instance |

**JavaScript:**

```javascript
import { createSaucelabsClient } from './saucelabs_client.mjs';

const client = createSaucelabsClient({
  apiKey: 'sauce_...',
  baseUrl: 'https://api.us-west-1.saucelabs.com',
  timeout: 30000,
});
```

**Python:**

```python
from saucelabs_api import create_saucelabs_client, SaucelabsClientOptions

# Keyword arguments
client = create_saucelabs_client(
    api_key='sauce_...',
    base_url='https://api.us-west-1.saucelabs.com',
    timeout=30.0,
)

# Or via dataclass
options = SaucelabsClientOptions(api_key='sauce_...', timeout=30.0)
client = create_saucelabs_client(options=options)
```

**Reasoning**: JavaScript commonly passes configuration as a single options object (destructured in the function body), which is idiomatic for APIs like Express, Fastify, and most npm packages. Python favors explicit keyword arguments for IDE autocompletion and type-checker support, with an optional dataclass for structured configuration when composing options programmatically.

---

## 9. Server Framework

| Aspect | JavaScript | Python |
|--------|-----------|--------|
| Framework | Fastify | FastAPI |
| Client access | `fastify.decorate()` plugin pattern | `app.state` + `Depends()` dependency injection |
| CORS | `@fastify/cors` plugin | `CORSMiddleware` |
| Error handling | Fastify error handler hooks | FastAPI exception handlers |
| Entry point | `createServer(opts)` returns `{ server, client }` | `create_app(config)` returns `FastAPI` |
| Start | `startServer(server, { port, host })` | External: `uvicorn saucelabs_api.server:app` |

**JavaScript:**

```javascript
import { createServer, startServer } from './server.mjs';

const { server, client } = createServer({ apiKey: 'sauce_...' });
await startServer(server, { port: 3000, host: '0.0.0.0' });
```

**Python:**

```python
from saucelabs_api import create_app, Config

config = Config.from_env()
app = create_app(config)
# Run externally: uvicorn saucelabs_api.server:app --port 3000 --host 0.0.0.0
```

**Reasoning**: Fastify and FastAPI are the performance-oriented framework choices in their respective ecosystems. Fastify uses a plugin/decoration model (`fastify.decorate()`) for dependency injection, attaching the Sauce Labs client to the server instance. FastAPI uses Python's native dependency injection (`Depends()`) and `app.state` for shared resources. The Python implementation delegates server startup to uvicorn (standard ASGI practice), while Node.js manages the listen call directly.

---

## 10. Logger Output

| Aspect | JavaScript | Python |
|--------|-----------|--------|
| Format | `LEVEL  YYYY-MM-DD HH:MM:SS [pkg:file] message` | `YYYY-MM-DDTHH:MM:SS.sssZ [pkg:file] LEVEL message` |
| Level position | Prefix (before timestamp) | After tag (after `[pkg:file]`) |
| Timestamp format | `YYYY-MM-DD HH:MM:SS` (space-separated) | `YYYY-MM-DDTHH:MM:SS.sssZ` (ISO 8601) |
| Secret redaction | First 8 chars + `***` | `[REDACTED]` |

**JavaScript:**

```javascript
// Output format:
// INFO  2025-06-15 14:30:00 [saucelabs:client] Initializing client
// DEBUG 2025-06-15 14:30:00 [saucelabs:client] API key: sauce_ab***
```

**Python:**

```python
# Output format:
# 2025-06-15T14:30:00.000Z [saucelabs:client] INFO Initializing client
# 2025-06-15T14:30:00.000Z [saucelabs:client] DEBUG API key: [REDACTED]
```

**Reasoning**: The JavaScript format places the log level first for quick visual scanning in terminal output, following conventions common in Node.js logging libraries. The Python format uses ISO 8601 timestamps with millisecond precision, following Python logging best practices for structured log aggregation. JavaScript's partial redaction (first 8 chars visible) aids debugging by confirming the correct key is in use, while Python's full `[REDACTED]` replacement follows a stricter security posture common in Python server deployments.

---

## 11. Module System

| Aspect | JavaScript | Python |
|--------|-----------|--------|
| Module system | ESM (`import`/`export`) | Standard Python packages (`import`) |
| File extension | `.mjs` | `.py` |
| Import style | `import { X } from './module.mjs'` | `from saucelabs_api import X` |
| Package name | `@internal/saucelabs-api` | `saucelabs_api` |
| Installation | npm (workspace/local) | pip |

**JavaScript:**

```javascript
import { SaucelabsClient, SaucelabsApiError } from './saucelabs_client.mjs';
import { JobsClient } from './domains/jobs.mjs';
```

**Python:**

```python
from saucelabs_api import SaucelabsClient, SaucelabsApiError
from saucelabs_api.domains import JobsClient
```

**Reasoning**: Each uses its language's standard module and packaging system. The JavaScript package uses ESM exclusively (`.mjs` files) for forward compatibility and tree-shaking support. The Python package follows standard `pip`-installable conventions with regular package imports.

---

## 12. Domain Module Method Signatures

| Aspect | JavaScript | Python |
|--------|-----------|--------|
| List method | `jobs.list(params)` | `jobs.list(params=None)` |
| Get method | `jobs.get(jobId)` | `jobs.get(job_id)` |
| Params passing | Direct positional object | Keyword argument |
| Param naming | camelCase (`jobId`) | snake_case (`job_id`) |

**JavaScript:**

```javascript
import { JobsClient } from './domains/jobs.mjs';

const jobs = new JobsClient(client);

// List with params object passed directly
const results = await jobs.list({ limit: 10, offset: 0 });

// Get by positional job ID
const job = await jobs.get('abc123');
```

**Python:**

```python
from saucelabs_api.domains import JobsClient

jobs = JobsClient(client)

# List with keyword argument
results = await jobs.list(params={"limit": 10, "offset": 0})

# Get by positional job_id
job = await jobs.get("abc123")
```

**Reasoning**: JavaScript passes the params object directly as a positional argument, which is natural for functions that accept a single configuration object. Python uses an explicit `params=` keyword argument, which is more readable and self-documenting at the call site, following the Python convention of preferring keyword arguments for optional parameters. The `get` method uses a positional argument in both languages since it is a single required identifier.

---

## Summary Table

| # | Difference | JavaScript | Python | Reason |
|---|-----------|-----------|--------|--------|
| 1 | Timeout units | Milliseconds (`30000`) | Seconds (`30.0`) | Ecosystem convention (Node.js ms vs Python s) |
| 2 | Async model | Promise-based, sync constructor | async/await + asyncio, async context manager | Native async primitives |
| 3 | Client lifecycle | `close()` is synchronous no-op | `await close()` closes httpx connections | fetch() vs httpx connection pool management |
| 4 | Naming | camelCase (`apiKey`, `getStatus`) | snake_case (`api_key`, `get_status`) | Language style guides (Airbnb vs PEP 8) |
| 5 | HTTP client | Native `fetch()` + `AbortSignal.timeout()` | `httpx.AsyncClient` (dual clients) | Standard async HTTP in each ecosystem |
| 6 | Rate limit defaults | `retryAfter` defaults to `60` | `retry_after` defaults to `1.0` | Conservative (JS) vs responsive (Python) |
| 7 | Error serialization | `toJSON()` returns structured object | `str(err)` returns formatted string | `JSON.stringify` protocol vs `__str__` convention |
| 8 | Convenience factory | `createSaucelabsClient(options)` object | `create_saucelabs_client(**kwargs)` keyword args | Options object vs keyword arguments |
| 9 | Server framework | Fastify + `fastify.decorate()` | FastAPI + `app.state` + `Depends()` | Plugin model vs dependency injection |
| 10 | Logger output | `LEVEL TIMESTAMP [tag] msg`, partial redact | `TIMESTAMP [tag] LEVEL msg`, `[REDACTED]` | Format and security conventions |
| 11 | Module system | ESM (`.mjs`, relative imports) | Standard packages (`.py`, package imports) | Language module systems |
| 12 | Domain method signatures | `jobs.list(params)` positional object | `jobs.list(params=None)` keyword arg | Idiomatic parameter passing |
