# Behavioral Differences

This document outlines intentional differences between the Node.js and Python implementations of the common-exceptions package.

## 1. Naming Conventions

Property and method names follow language-specific conventions.

| Language | Properties | Methods | Parameters |
|----------|------------|---------|------------|
| **Node.js** | camelCase (`requestId`, `timeoutMs`) | camelCase (`toResponse`, `toLogEntry`) | camelCase |
| **Python** | snake_case (`request_id`, `timeout_ms`) | snake_case (`to_response`, `to_log_entry`) | snake_case |

**Reasoning**: Each language community has established naming conventions. TypeScript uses camelCase per JavaScript standards, while Python uses snake_case per PEP 8.

## 2. Serialization Format

JSON serialization uses camelCase keys for cross-platform compatibility.

| Language | Internal Properties | Serialized JSON |
|----------|---------------------|-----------------|
| **Node.js** | `requestId`, `timeoutMs` | `requestId`, `timeoutMs` |
| **Python** | `request_id`, `timeout_ms` | `requestId`, `timeoutMs` |

**Reasoning**: API responses must be consistent regardless of the backend language. We chose camelCase for JSON as it's the dominant convention in JavaScript-heavy ecosystems and most API consumers expect it.

## 3. Exception Base Class

| Language | Base Class | Standard Base |
|----------|------------|---------------|
| **Node.js** | `class BaseHttpException extends Error` | Built-in `Error` |
| **Python** | `class BaseHttpException(Exception)` | Built-in `Exception` |

**Reasoning**: Both languages have standard exception hierarchies. Extending the native base ensures compatibility with language-specific exception handling patterns.

## 4. Validation Framework Integration

| Language | Framework | Normalizer Function |
|----------|-----------|---------------------|
| **Node.js** | Zod, AJV | `normalizeZodErrors()`, `normalizeAjvErrors()` |
| **Python** | Pydantic | `normalize_pydantic_errors()` |

**Reasoning**: Each language has its dominant validation library. We provide normalizers for the most common frameworks to convert their native error format into our standardized `ValidationErrorDetail` structure.

## 5. HTTP Client Wrappers

| Language | HTTP Client | Wrapper |
|----------|-------------|---------|
| **Node.js** | Undici | `wrapUndiciErrors()` |
| **Python** | HTTPX | `@wrap_httpx_errors` decorator |

**Reasoning**: Each language has a preferred async HTTP client. We provide wrappers that catch client-specific exceptions and convert them to our standardized outbound exceptions.

## 6. Framework Integration Pattern

| Language | Framework | Pattern | Registration |
|----------|-----------|---------|--------------|
| **Node.js** | Fastify | Plugin | `registerExceptionHandlers(fastify)` |
| **Python** | FastAPI | Exception Handler | `register_exception_handlers(app)` |

**Reasoning**: Each framework has its own extension mechanism. Fastify uses plugins with `setErrorHandler`, while FastAPI uses `@app.exception_handler` decorators.

## 7. Async/Await Patterns

| Language | Default | Alternative |
|----------|---------|-------------|
| **Node.js** | Async-first (`async/await`) | Sync methods where appropriate |
| **Python** | Sync-first | Async variants for async frameworks |

**Reasoning**: Node.js is inherently async, while Python has both sync and async patterns. The Python implementation provides sync methods by default with async alternatives.

## 8. Type System

| Language | Type System | Runtime Validation |
|----------|-------------|-------------------|
| **Node.js** | TypeScript (compile-time) | Zod (optional) |
| **Python** | Type hints + Pydantic | Pydantic (runtime) |

**Reasoning**: TypeScript types are erased at runtime, so Zod is used for runtime validation. Python's Pydantic provides both type hints and runtime validation.

## 9. Logger Integration

| Language | Default Logger | Custom Logger Interface |
|----------|----------------|------------------------|
| **Node.js** | Console-based | Any object with `debug/info/warn/error` |
| **Python** | `logging` module | Standard `logging.Logger` |

**Reasoning**: Each language has its standard logging approach. Both support custom loggers for integration with existing logging infrastructure.

## 10. Error Code Enum

| Language | Implementation | String Coercion |
|----------|----------------|-----------------|
| **Node.js** | `const enum` | Direct string value |
| **Python** | `Enum(str, Enum)` | Automatic via `str` base |

**Reasoning**: TypeScript's const enum compiles to inline strings. Python's string enum inherits from `str` for automatic serialization compatibility.

## 11. Stack Trace Handling

| Language | Stack Property | Capture Method |
|----------|----------------|----------------|
| **Node.js** | `Error.stack` | Automatic |
| **Python** | `__traceback__` | Automatic via `Exception` |

**Reasoning**: Both languages capture stack traces automatically when exceptions are raised. The property access differs but functionality is equivalent.

## 12. Request ID Middleware

| Language | Framework | Middleware Type |
|----------|-----------|-----------------|
| **Node.js** | Fastify | Plugin (`requestIdPlugin`) |
| **Python** | FastAPI | ASGI Middleware (`RequestIdMiddleware`) |

**Reasoning**: Each framework has its preferred middleware pattern. Both generate UUIDs and attach them to request context for correlation.
