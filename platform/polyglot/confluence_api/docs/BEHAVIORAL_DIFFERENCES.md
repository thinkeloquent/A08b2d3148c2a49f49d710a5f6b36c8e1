# Behavioral Differences

This document outlines intentional differences between the Node.js and Python implementations of the `confluence_api` package. Both implementations target Confluence Data Center REST API v9.2.3 and expose an identical logical API surface, but differ in idiomatic patterns to match each language's conventions.

## 1. HTTP Client Library

| Language | Library | Protocol |
|----------|---------|----------|
| **Node.js** | undici (via `FetchClient` adapter) | async/await |
| **Python** | httpx | synchronous |

**Reasoning**: undici is the standard high-performance HTTP client in the Node.js ecosystem and provides the Web Fetch API. httpx is the de facto standard Python HTTP library, offering a clean synchronous API that matches Confluence Data Center's request/response pattern.

## 2. Timeout Units

| Language | Unit | Default | Constructor Parameter |
|----------|------|---------|---------------------|
| **Node.js** | milliseconds | `30000` | `timeoutMs` |
| **Python** | seconds | `30.0` | `timeout` |

**Reasoning**: Node.js ecosystem convention uses milliseconds for timeouts (e.g., `setTimeout`, `AbortSignal.timeout()`). Python ecosystem convention uses seconds (e.g., `httpx.Client(timeout=)`, `time.sleep()`). Each implementation follows its language's standard practice.

## 3. Client Lifecycle

| Language | Pattern | Cleanup Required |
|----------|---------|-----------------|
| **Node.js** | `new ConfluenceFetchClient(opts)` | No explicit cleanup |
| **Python** | `with ConfluenceClient(...) as client:` | Context manager recommended |

**Reasoning**: The Node.js client uses undici's fetch adapter which handles connection pooling internally and does not require explicit teardown. The Python client uses httpx.Client which maintains a connection pool and should be closed via the context manager protocol (`with` statement) to release resources.

## 4. Async vs Sync Patterns

| Language | Client Pattern | Pagination | Service Methods |
|----------|---------------|------------|-----------------|
| **Node.js** | `await client.get(...)` | `for await (const item of paginateOffset(...))` | `await service.method()` |
| **Python** | `client.get(...)` | `async for item in paginate_offset(...)` | `service.method()` |

**Reasoning**: The Node.js implementation is fully async throughout, leveraging JavaScript's single-threaded event loop. The Python client is synchronous (using httpx.Client), which is simpler for scripting and CLI usage. The pagination utilities are async generators in both languages, but the Python version calls the synchronous client internally. SDK client methods are synchronous in Python and async in Node.js.

## 5. Naming Conventions

| Aspect | Node.js | Python |
|--------|---------|--------|
| Methods | `camelCase` (`getContents`) | `snake_case` (`get_contents`) |
| Properties | `camelCase` (`responseData`) | `snake_case` (`response_data`) |
| Error base class | `ConfluenceApiError` | `ConfluenceAPIError` |
| Config keys | `camelCase` (`baseUrl`, `apiToken`) | `snake_case` (`base_url`, `api_token`) |
| CQL logical operators | `.and()`, `.or()`, `.not()` | `.and_()`, `.or_()`, `.not_()` |
| Log levels | `warn` | `warning` |

**Reasoning**: Each language follows its standard naming conventions. Python appends underscores to `and_()`, `or_()`, `not_()` because `and`, `or`, `not` are reserved keywords in Python.

## 6. Model/Schema Validation

| Language | Framework | Schema Naming | Validation Style |
|----------|-----------|---------------|-----------------|
| **Node.js** | Zod | `ContentSchema`, `SpaceCreateSchema` | `schema.parse(data)` |
| **Python** | Pydantic v2 | `Content`, `SpaceCreate` | `Model(**data)` or `Model.model_validate(data)` |

**Reasoning**: Zod is the dominant runtime schema validation library in the TypeScript/JavaScript ecosystem. Pydantic v2 is the standard for Python data validation and serialization. Both provide equivalent functionality (runtime validation, type coercion, error messages) using idiomatic patterns.

## 7. Error Serialization

| Language | Method | Status Field | Rate Limit Field |
|----------|--------|-------------|-----------------|
| **Node.js** | `error.toJSON()` | `error.status` | `error.retryAfter` |
| **Python** | `error.to_dict()` | `error.status_code` | `error.retry_after` |

**Reasoning**: JavaScript's `toJSON()` method integrates with `JSON.stringify()` for automatic serialization. Python uses `to_dict()` as the conventional conversion method. Property names follow each language's naming conventions (`status`/`status_code`, `retryAfter`/`retry_after`).

## 8. Error Code System

| Language | Code Type | Example |
|----------|-----------|---------|
| **Node.js** | `ErrorCode` frozen object | `ErrorCode.NETWORK`, `ErrorCode.RATE_LIMIT`, `ErrorCode.TIMEOUT` |
| **Python** | No error code enum | Error type determined by exception class (`isinstance()`) |

**Reasoning**: The Node.js implementation includes a machine-readable `code` property on all errors for programmatic error classification alongside `instanceof` checks. Python relies exclusively on the exception class hierarchy, which is the idiomatic pattern for error type discrimination in Python.

## 9. Configuration Resolution

| Language | Config Return Type | Server Config Source |
|----------|-------------------|---------------------|
| **Node.js** | Plain object `{ baseUrl, username, apiToken }` | `serverConfig.getNested([...])` |
| **Python** | Dict `{ "base_url", "username", "api_token" }` | `app_state.config.get_nested(...)` |

**Reasoning**: Node.js uses plain objects with camelCase keys, following JavaScript conventions. Python returns standard dicts with snake_case keys. The server config integration differs because Node.js targets Fastify's plugin system while Python targets FastAPI's `app.state` pattern.

## 10. Server Framework

| Language | Framework | Startup Pattern | Error Handler |
|----------|-----------|-----------------|---------------|
| **Node.js** | Fastify | Plugin registration with `server.register()` | `createErrorHandler()` returns handler function |
| **Python** | FastAPI | Lifespan context manager / dependency injection | `create_error_handler()` returns async exception handler |

**Reasoning**: Fastify is the standard high-performance Node.js web framework with a plugin-based architecture. FastAPI is the modern Python async web framework with dependency injection. Each server integration follows the respective framework's idiomatic patterns.

## 11. Module System

| Language | Module Format | File Extension | Import Style |
|----------|--------------|----------------|-------------|
| **Node.js** | ESM | `.mjs` | `import { X } from 'confluence_api'` |
| **Python** | Standard packages | `.py` | `from confluence_api import X` |

**Reasoning**: The package uses ESM (ECMAScript Modules) with `.mjs` extension for explicit module type declaration in Node.js. Python uses its standard package system with `__init__.py` barrel exports.

## 12. Base URL Handling

| Language | Client URL Construction | Service Endpoint Style |
|----------|------------------------|----------------------|
| **Node.js** | Services pass full relative paths (e.g., `content/12345`) | Client prepends `baseUrl` directly |
| **Python** | Client auto-appends `rest/api/` to base URL | Services pass relative endpoints (e.g., `content/12345`) |

**Reasoning**: The Python client normalizes the base URL during initialization by appending `rest/api/` automatically, so services use short relative paths. The Node.js client preserves the base URL as-is, and services construct paths relative to it. Both approaches produce identical API URLs.

## 13. Logger Levels

| Language | Levels | Default |
|----------|--------|---------|
| **Node.js** | `trace`, `debug`, `info`, `warn`, `error`, `silent` | `info` |
| **Python** | `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`, `SILENT` | `INFO` |

**Reasoning**: Node.js uses lowercase level names following the console API convention. Python uses uppercase level names following the `logging` module convention. The Node.js logger includes a `trace` level (below debug) while Python includes `CRITICAL` (above error), reflecting each language's standard logging hierarchy.

## 14. Attachment Upload

| Language | Input Type | Upload Mechanism |
|----------|-----------|-----------------|
| **Node.js** | `Buffer` + filename string | `FormData` with blob construction |
| **Python** | File path string | httpx multipart `files` parameter |

**Reasoning**: Node.js operates in-memory with `Buffer` objects, which aligns with its event-driven I/O model. Python uses file paths and lets httpx handle the multipart encoding, which is more idiomatic for Python's file I/O patterns and avoids loading entire files into memory unnecessarily.

## 15. SDK Client Lifecycle

| Language | Initialization | Cleanup |
|----------|---------------|---------|
| **Node.js** | `new ConfluenceSdkClient({ baseUrl })` | No explicit cleanup |
| **Python** | `with ConfluenceSDKClient(base_url=url) as sdk:` | Context manager |

**Reasoning**: Mirrors the core client lifecycle difference. The Python SDK client wraps httpx.Client and requires cleanup via context manager. The Node.js SDK client uses the global `fetch` function and does not maintain persistent connections requiring cleanup.
