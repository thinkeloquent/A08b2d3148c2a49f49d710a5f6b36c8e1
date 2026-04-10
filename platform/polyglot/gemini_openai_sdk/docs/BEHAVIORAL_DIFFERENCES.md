# Behavioral Differences

This document outlines intentional differences between the Node.js and Python implementations of the Gemini OpenAI SDK package.

## 1. Naming Conventions

Property and method names follow language-specific conventions.

| Language | Properties | Methods |
|----------|------------|---------|
| **Node.js** | `camelCase` | `camelCase()` |
| **Python** | `snake_case` | `snake_case()` |

**Reasoning**: Following language idioms makes the SDK feel native to developers in each ecosystem. Python's PEP8 style guide recommends snake_case, while JavaScript/TypeScript conventions use camelCase.

### Examples

| Concept | Node.js | Python |
|---------|---------|--------|
| Maximum tokens | `maxTokens` | `max_tokens` |
| System prompt | `systemPrompt` | `system_prompt` |
| API key | `apiKey` | `api_key` |
| Health check | `healthCheck()` | `health_check()` |
| Tool call | `toolCall()` | `tool_call()` |
| JSON mode | `jsonMode()` | `json_mode()` |

## 2. Response Field Names

Response objects use different casing for field names.

| Language | Field Style | Example |
|----------|-------------|---------|
| **Node.js** | `snake_case` | `finish_reason`, `execution_time_ms` |
| **Python** | `snake_case` | `finish_reason`, `execution_time_ms` |

**Reasoning**: Both implementations use `snake_case` for response fields to match the OpenAI API response format. This ensures consistency when processing API responses.

## 3. Async/Await Patterns

Both languages use async/await, but with different syntax.

| Language | Pattern | Signature |
|----------|---------|-----------|
| **Node.js** | Native async/await | `async method(): Promise<T>` |
| **Python** | asyncio | `async def method() -> T` |

**Reasoning**: Both languages have built-in async support. The implementations use native async primitives for optimal performance and familiar patterns.

### Examples

**Node.js**
```typescript
const client = new GeminiClient();
const result = await client.chat('Hello');
```

**Python**
```python
client = GeminiClient()
result = await client.chat("Hello")
```

## 4. HTTP Client

Each implementation uses the recommended HTTP client for its ecosystem.

| Language | HTTP Client | Features |
|----------|-------------|----------|
| **Node.js** | `undici` | Native fetch, connection pooling |
| **Python** | `httpx` | Async support, HTTP/2 |

**Reasoning**: Using ecosystem-standard HTTP clients ensures better performance, maintenance, and compatibility with other tools.

## 5. Logger Factory

Logger creation follows the standard pattern `create(packageName, filename)` but with language-specific conventions.

| Language | Import | Usage |
|----------|--------|-------|
| **Node.js** | `import { create } from './logger.mjs'` | `create('pkg', import.meta.url)` |
| **Python** | `from .logger import create` | `create('pkg', __file__)` |

**Reasoning**: Both use a factory pattern for consistency, but leverage language-specific mechanisms for filename resolution (`import.meta.url` vs `__file__`).

## 6. Module System

Each language uses its native module system.

| Language | Module System | Extensions |
|----------|---------------|------------|
| **Node.js** | ESM | `.mjs` |
| **Python** | Python packages | `.py` |

**Reasoning**: Using native module systems ensures seamless integration with each ecosystem's tooling and package managers.

## 7. Type Definitions

Type definitions use language-native approaches.

| Language | Type System | Location |
|----------|-------------|----------|
| **Node.js** | JSDoc comments | Inline in `.mjs` files |
| **Python** | Type hints | Inline with `dataclass` |

**Reasoning**: TypeScript/JSDoc provides static typing for Node.js, while Python's type hints enable IDE support and runtime validation with tools like Pydantic.

## 8. Default Values

Default parameter values are specified in language-idiomatic ways.

| Language | Default in Signature | Default in Body |
|----------|---------------------|-----------------|
| **Node.js** | `param = 'default'` | `param ?? DEFAULT` |
| **Python** | `param: str = 'default'` | `param or DEFAULT` |

**Reasoning**: Each language has conventions for handling optional parameters and default values.

## 9. Error Handling

Error responses follow consistent structure but may differ in exception types.

| Language | Exception Type | Response Format |
|----------|---------------|-----------------|
| **Node.js** | `Error` | `{ success: false, error: string }` |
| **Python** | `Exception` | `{ "success": False, "error": str }` |

**Reasoning**: Both return structured error responses to enable consistent error handling. The response format is identical; only the native exception types differ.

## 10. Package Distribution

Packages are distributed through language-specific registries.

| Language | Registry | Package Manager | Config File |
|----------|----------|-----------------|-------------|
| **Node.js** | npm | npm/pnpm | `package.json` |
| **Python** | PyPI | pip | `pyproject.toml` |

**Reasoning**: Using standard package registries ensures easy installation and dependency management.

## Summary Table

| Feature | Node.js | Python | Same Behavior? |
|---------|---------|--------|----------------|
| Method names | camelCase | snake_case | Different naming |
| Response fields | snake_case | snake_case | Same |
| Async pattern | async/await | async/await | Same |
| HTTP client | undici | httpx | Same capability |
| Logger factory | create() | create() | Same API |
| Module system | ESM | Python | Different |
| Types | JSDoc | Type hints | Different |
| Error format | JSON object | dict | Same structure |
