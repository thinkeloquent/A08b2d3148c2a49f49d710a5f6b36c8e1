# Behavioral Differences

This document outlines intentional differences between the Node.js and Python implementations of the Statsig Console API Client package.

## 1. HTTP Transport

| Language | Library | Configuration |
|----------|---------|---------------|
| **Node.js** | Native `fetch` (Node 20+) | `AbortSignal.timeout()` for timeouts |
| **Python** | `httpx.AsyncClient` | `httpx.Timeout()` for timeouts |

**Reasoning**: Node.js 20+ includes a global `fetch` implementation that is performant and requires no dependencies. Python lacks a built-in async HTTP client, so `httpx` is used as the standard async-first HTTP library in the ecosystem.

## 2. Timeout Units

| Language | Unit | Default Value | Configuration Key |
|----------|------|---------------|-------------------|
| **Node.js** | Milliseconds | `30000` | `timeout` |
| **Python** | Seconds | `30.0` | `timeout` |

**Reasoning**: JavaScript APIs conventionally use milliseconds (e.g., `setTimeout`, `AbortSignal.timeout`). Python's `httpx` and `asyncio` APIs conventionally use seconds (e.g., `asyncio.sleep`). Each implementation follows its ecosystem's convention.

## 3. Client Lifecycle

| Language | Pattern | Cleanup |
|----------|---------|---------|
| **Node.js** | Explicit `client.close()` | No-op (native fetch has no connection pool) |
| **Python** | `async with StatsigClient() as client:` | Calls `httpx.AsyncClient.aclose()` |

**Reasoning**: Python's `httpx.AsyncClient` maintains a connection pool that must be explicitly closed. The async context manager pattern (`async with`) is idiomatic Python for resource cleanup. Node.js native fetch does not maintain persistent connections, so `close()` is a no-op that exists for API parity.

## 4. API Key Validation

| Language | Behavior | Error Type |
|----------|----------|------------|
| **Node.js** | Silently uses empty string if no key provided | No error at construction |
| **Python** | Raises `ValueError` if no key provided | Immediate error at construction |

**Reasoning**: The Python implementation follows "fail fast" principles, raising immediately if the API key is missing. The Node.js implementation defers validation to the first API call, where the server will return a 401 error. Both ultimately fail, but at different points.

## 5. Naming Conventions

| Language | Style | Examples |
|----------|-------|---------|
| **Node.js** | camelCase | `rateLimitAutoWait`, `onRateLimit`, `lastRateLimit`, `retryAfter` |
| **Python** | snake_case | `rate_limit_auto_wait`, `on_rate_limit`, `last_rate_limit`, `retry_after` |

**Reasoning**: Each implementation follows its language's standard naming convention. JavaScript uses camelCase per the ECMAScript specification and community standards. Python uses snake_case per PEP 8.

## 6. Domain Module Method Signatures

| Language | Body Parameter | List Parameters |
|----------|---------------|-----------------|
| **Node.js** | `create(body)`, `update(id, body)` | `list(params)` with positional object |
| **Python** | `create(data)`, `update(id, data)` | `list(**options)` with keyword arguments |

**Reasoning**: Node.js modules pass the request body as a positional `body` argument which is directly forwarded to `client.post(path, body)`. Python modules use `data` as the parameter name (avoiding conflict with the `json` keyword argument on `client.post`) and forward via `json=data`. List methods in Python use `**options` for keyword forwarding, while Node.js uses a params object.

## 7. Factory Function Behavior

| Language | Function | Module Attachment |
|----------|----------|-------------------|
| **Node.js** | `createStatsigClient(options)` | Returns client with all 9 modules attached as properties |
| **Python** | `create_statsig_client(options, **kwargs)` | Returns a plain `StatsigClient` (modules not attached) |

**Reasoning**: The Node.js factory attaches all domain modules (experiments, gates, layers, etc.) as properties on the returned client for a unified API surface. The Python factory is a thin wrapper that converts a `StatsigClientOptions` dataclass to constructor kwargs, leaving module instantiation to the caller or the lifecycle hooks. This reflects Python's preference for explicit composition.

## 8. Rate Limiter Retry-After Default

| Language | Default `retryAfter` | Parsing Fallback |
|----------|---------------------|------------------|
| **Node.js** | `60` seconds | Falls back to `Date.parse()` for HTTP-date format |
| **Python** | `1.0` second | Falls back to `1.0` on parse failure |

**Reasoning**: The Node.js implementation uses a conservative 60-second default when the `Retry-After` header is absent or unparseable, and attempts to parse HTTP-date formatted values. The Python implementation uses a minimal 1-second default, relying on the server to provide accurate retry timing on subsequent 429 responses.

## 9. Rate Limiter Response Handling

| Language | Non-429 Handling | Recursive Retry |
|----------|-----------------|-----------------|
| **Node.js** | Only called on 429 (client checks `response.status === 429` before calling) | Client rebuilds the request internally |
| **Python** | Receives all responses, returns non-429 as-is | Recursively calls `handle_response` on retry result |

**Reasoning**: The Node.js client delegates to the rate limiter only when a 429 is detected, keeping the limiter focused. The Python rate limiter receives every response and filters internally, which allows it to track overall response patterns. The Python implementation also recursively calls `handle_response` on retry responses, catching consecutive 429s automatically.

## 10. Error Serialization

| Language | Method | Output |
|----------|--------|--------|
| **Node.js** | `toJSON()` on all error classes | `{ error: true, name, message, statusCode, responseBody, timestamp }` |
| **Python** | Standard `Exception.__str__()` | Human-readable message string only |

**Reasoning**: Node.js errors include a `toJSON()` method for structured logging and JSON API error responses. Fastify automatically calls `toJSON()` when serializing error responses. Python errors follow the standard exception pattern where `str(error)` returns the message, and structured serialization is handled by the framework layer (FastAPI's exception handlers).

## 11. Pagination URL Handling

| Language | Next Page URL | Path Extraction |
|----------|--------------|-----------------|
| **Node.js** | Passed directly to `client.get()` (supports absolute URLs) | Client's `_buildUrl()` detects and preserves absolute URLs |
| **Python** | Converted to relative path via `_extract_relative_path()` | Strips base URL prefix before passing to `client.get()` |

**Reasoning**: The Node.js client's `_buildUrl()` method checks if a path starts with `http://` or `https://` and uses it as-is, so pagination URLs can be passed directly. The Python client uses `httpx.AsyncClient` with a `base_url`, which prepends the base to all paths. Therefore, absolute pagination URLs must be converted to relative paths to avoid double-prefixing.

## 12. Python-Only: Additional Gate Methods

| Language | Extra Methods |
|----------|--------------|
| **Node.js** | `list`, `get`, `create`, `update`, `patch`, `delete`, `getOverrides`, `updateOverrides` |
| **Python** | All Node.js methods + `enable`, `disable`, `get_rules`, `update_rules`, `archive` |

**Reasoning**: The Python `GatesModule` includes additional convenience methods (`enable`, `disable`, `get_rules`, `update_rules`, `archive`) that wrap dedicated Statsig Console API endpoints. The Node.js implementation covers the core CRUD and overrides operations, with additional endpoints accessible via the raw `client.put()` / `client.get()` methods.

## 13. Python-Only: Additional Experiment Methods

| Language | Extra Methods |
|----------|--------------|
| **Node.js** | `list`, `get`, `create`, `update`, `patch`, `delete`, `start`, `getOverrides`, `updateOverrides` |
| **Python** | All Node.js methods + `make_decision`, `reset`, `archive`, `pulse_results`, `get_assignment_source` |

**Reasoning**: The Python `ExperimentsModule` provides additional lifecycle and analytics methods that map to dedicated Statsig Console API endpoints. The Node.js implementation provides the core operations, with extended endpoints accessible via raw client methods.

## 14. Logger Method Names

| Language | Warning Method | Other Methods |
|----------|---------------|---------------|
| **Node.js** | `warn()` | `debug()`, `info()`, `error()` |
| **Python** | `warning()` | `debug()`, `info()`, `error()` |

**Reasoning**: Node.js follows the `console.warn()` convention. Python follows the `logging.warning()` convention from the standard library. Both serve the same purpose.
