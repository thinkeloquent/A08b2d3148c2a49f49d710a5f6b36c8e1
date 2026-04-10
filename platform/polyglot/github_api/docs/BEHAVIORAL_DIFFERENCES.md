# Behavioral Differences

This document outlines intentional differences between the Node.js and Python implementations of the GitHub API SDK package (`@internal/github-api` / `github_api`).

## 1. Token Resolution Return Type

The token resolution function returns different shapes in each language.

| Language | Return Type | Mutability |
|----------|-------------|------------|
| **Node.js** | Plain object `{ token, source, type }` | Mutable |
| **Python** | Frozen dataclass `TokenInfo(token, source, type)` | Immutable |

**Reasoning**: Python's `@dataclass(frozen=True)` ensures that resolved tokens are immutable after creation, preventing accidental mutation and making them safe to use as dictionary keys or set members. JavaScript lacks a native frozen dataclass equivalent, so a plain object is idiomatic.

## 2. Async Context Manager

Python's `GitHubClient` supports the `async with` protocol for automatic resource cleanup.

| Language | Pattern | Syntax |
|----------|---------|--------|
| **Node.js** | Manual cleanup | `const client = new GitHubClient({...}); /* no close needed */` |
| **Python** | Async context manager | `async with GitHubClient(...) as client:` |

**Reasoning**: Python's `async with` protocol (`__aenter__` / `__aexit__`) provides deterministic cleanup of the underlying `httpx.AsyncClient`. JavaScript's `fetch()` is stateless and does not require explicit cleanup, so the concept does not apply.

## 3. Error Hierarchy Base Class

Both implementations provide the same error hierarchy but inherit from different base types.

| Language | Base Class | Extra Fields | Extra Methods |
|----------|------------|--------------|---------------|
| **Node.js** | `Error` | `status`, `requestId`, `documentationUrl` | None |
| **Python** | `Exception` | `status`, `request_id`, `documentation_url`, `response_body` | `to_dict()`, `__repr__()` |

**Reasoning**: Python adds `response_body` to preserve the raw API response for debugging, and `to_dict()` for structured JSON serialization in FastAPI error handlers. JavaScript error handlers in Fastify typically construct the response shape directly.

## 4. ServerError Default Status

The default HTTP status code for `ServerError` differs between implementations.

| Language | Default Status | Reasoning |
|----------|---------------|-----------|
| **Node.js** | `500` | Represents a generic internal server error |
| **Python** | `502` | Represents a bad gateway, indicating the upstream GitHub API failed |

**Reasoning**: The Python implementation treats `ServerError` as an upstream proxy error (the SDK server is a gateway to GitHub), so 502 Bad Gateway is more semantically accurate. The JavaScript implementation uses the more generic 500 Internal Server Error as a catch-all default.

## 5. Validation Return Values

Validation functions have different return type semantics.

| Language | Return Type | Usage Pattern |
|----------|-------------|---------------|
| **Node.js** | `void` | Throws on invalid, no return value |
| **Python** | `str` (the validated input) | Throws on invalid, returns validated string |

**Reasoning**: Python's convention of returning the validated value enables a fluent chaining pattern: `name = validate_repository_name(user_input)`. This is a common Python idiom for validation functions. JavaScript validators follow the "throw-on-failure, succeed-silently" convention.

## 6. Validation Error Details

Python's `ValidationError` carries structured error detail that JavaScript's does not.

| Language | Extra Field | Content |
|----------|-------------|---------|
| **Node.js** | None | Message string only |
| **Python** | `errors: list[dict]` | Structured list with `field` and `code` keys |

**Reasoning**: Python's `ValidationError` includes an `errors` list (e.g., `[{"field": "name", "code": "reserved"}]`) to match GitHub API's own validation error format. This enables more granular error handling and structured error responses. The JavaScript implementation relies on descriptive error messages.

## 7. RateLimitInfo Structure

Rate limit information uses different data containers and capabilities.

| Language | Container | Computed Properties |
|----------|-----------|---------------------|
| **Node.js** | Plain object `{ limit, remaining, reset, used, resource }` | None |
| **Python** | Pydantic `BaseModel` | `reset_at`, `seconds_until_reset`, `is_exhausted` |

**Reasoning**: Python's Pydantic `BaseModel` provides automatic validation, serialization, and computed properties. The `reset_at` (datetime), `seconds_until_reset` (float), and `is_exhausted` (bool) properties offer convenient derived values. JavaScript keeps the structure simple and flat, with consumers computing derived values as needed.

## 8. Naming Conventions

Method and property names follow each language's standard conventions.

| Language | Convention | Example |
|----------|------------|---------|
| **Node.js** | camelCase | `rateLimitAutoWait`, `getRateLimit()`, `listForUser()` |
| **Python** | snake_case | `rate_limit_auto_wait`, `get_rate_limit()`, `list_for_user()` |

**Reasoning**: Each implementation follows the standard naming convention of its language ecosystem. JavaScript uses camelCase per ECMAScript conventions. Python uses snake_case per PEP 8.

## 9. HTTP Client

The underlying HTTP transport differs between implementations.

| Language | HTTP Library | Connection Model |
|----------|-------------|------------------|
| **Node.js** | Native `fetch()` | Stateless, per-request |
| **Python** | `httpx.AsyncClient` | Persistent connection pool |

**Reasoning**: Node.js uses the built-in `fetch()` API (available since Node 18) for zero-dependency HTTP requests. Python uses `httpx.AsyncClient` for persistent connections, connection pooling, and automatic cookie handling, which is the standard async HTTP client in the Python ecosystem.

## 10. Configuration Pattern

Configuration loading uses different patterns suited to each language's idioms.

| Language | Pattern | Extra Fields |
|----------|---------|--------------|
| **Node.js** | `loadConfig()` function returning plain object | `githubToken`, `githubApiBaseUrl`, `logLevel`, `port`, `host` |
| **Python** | `Config` frozen dataclass with `from_env()` classmethod | All of the above plus `rate_limit_auto_wait`, `rate_limit_threshold` |

**Reasoning**: Python's dataclass provides type safety, immutability, and IDE autocomplete. The `from_env()` classmethod follows the factory pattern common in Python configuration. JavaScript uses a simple function that returns a plain object, which is idiomatic for configuration in the Node.js ecosystem. Python includes rate limit configuration fields at the config level for convenient server-level defaults.

## 11. Server Framework

Each implementation uses the leading async web framework for its ecosystem.

| Language | Framework | Version |
|----------|-----------|---------|
| **Node.js** | Fastify 4.x | Plugin system, schema validation |
| **Python** | FastAPI 0.115.0 | Dependency injection, Pydantic models |

**Reasoning**: Fastify is the performance-oriented choice for Node.js with its plugin architecture and JSON schema support. FastAPI is the standard async Python web framework with native Pydantic integration, automatic OpenAPI docs, and dependency injection.

## 12. Startup/Shutdown Lifecycle

Server lifecycle management follows each framework's conventions.

| Language | Startup | Shutdown |
|----------|---------|----------|
| **Node.js** | Plugin registration phase (`server.register()`) | Fastify handles cleanup |
| **Python** | `@app.on_event("startup")` (or lifespan context manager) | `@app.on_event("shutdown")` (or lifespan) |

**Reasoning**: Fastify's plugin system handles initialization during registration, with the server ready after `server.ready()`. FastAPI uses event handlers or the modern lifespan context manager pattern for explicit startup/shutdown hooks. The lifespan approach is preferred for new code as `on_event` is deprecated.

## 13. Reserved Repo Names

The collection type for reserved repository names differs.

| Language | Container | Type |
|----------|-----------|------|
| **Node.js** | `Set<string>` | Mutable set |
| **Python** | `frozenset[str]` | Immutable frozen set |

**Reasoning**: Python uses `frozenset` to ensure the reserved names list cannot be accidentally modified at runtime, enforcing immutability at the type level. JavaScript's `Set` is used as the idiomatic equivalent, though it remains mutable.

## 14. BranchesClient Protection Template

The `createProtectionTemplate` / `create_protection_template` method uses different parameterization strategies.

| Language | Approach | Signature |
|----------|----------|-----------|
| **Node.js** | Builder-style options object | `createProtectionTemplate(owner, repo, branch, options?)` |
| **Python** | Named preset templates | `create_protection_template(owner, repo, branch, *, template="standard")` |

**Reasoning**: Python uses named template presets (`'standard'`, `'strict'`, `'minimal'`) as a keyword argument, providing a clean and discoverable API. Each preset maps to a predefined protection configuration. JavaScript uses a flexible options object, allowing more granular control over the protection template configuration.

## 15. Domain Client Field Access

Domain clients store their `GitHubClient` reference with different visibility conventions.

| Language | Field Name | Visibility |
|----------|------------|------------|
| **Node.js** | `this.client` | Public |
| **Python** | `self._client` | Private (by convention) |

**Reasoning**: Python uses the leading underscore convention (`_client`) to signal that the field is an implementation detail and should not be accessed directly by consumers. JavaScript does not enforce access control at the language level (without `#private` fields), so the field is left public for simplicity.
