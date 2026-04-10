# Behavioral Differences

This document outlines intentional differences between the Node.js (TypeScript) and Python implementations of the AWS S3 Client SDK. These differences reflect language idioms and best practices rather than functional divergence.

## 1. Naming Conventions

Property and method names follow language-specific conventions.

| Language | Properties | Methods | Config Keys |
|----------|-----------|---------|-------------|
| **Node.js** | `camelCase` | `camelCase` | `camelCase` |
| **Python** | `snake_case` | `snake_case` | `snake_case` |

**Reasoning**: Each language has established conventions (PEP 8 for Python, standard JS style for TypeScript). Following these conventions makes the SDK feel native to developers in each ecosystem.

**Examples**:
| Node.js | Python |
|---------|--------|
| `bucketName` | `bucket_name` |
| `keyPrefix` | `key_prefix` |
| `endpointUrl` | `endpoint_url` |
| `elapsedMs` | `elapsed_ms` |
| `listKeys()` | `list_keys()` |
| `debugInfo()` | `debug_info()` |

## 2. Configuration Validation

Both implementations validate configuration, but with different default behaviors.

| Language | Region Default | Validation Timing |
|----------|---------------|-------------------|
| **Node.js** | Required (no default) | Constructor throws |
| **Python** | `"us-east-1"` | Pydantic validation |

**Reasoning**: Python's Pydantic provides built-in defaults and validation. TypeScript requires explicit validation. The Python default mirrors AWS CLI behavior where `us-east-1` is a common default.

## 3. Environment Variable Loading

The `configFromEnv()` function has different behavior when environment variables are not set.

| Language | Env Var Names | Missing Bucket Behavior |
|----------|--------------|-------------------------|
| **Node.js** | `AWS_S3_BUCKET`, `AWS_REGION` | Returns config with empty bucket |
| **Python** | `AWS_S3_BUCKET_NAME`, `AWS_REGION` | Returns `None` |

**Reasoning**: Node.js uses shorter env var names matching AWS SDK conventions. Python uses longer names to avoid collision with other AWS tools and returns `None` to make the "not configured" state explicit.

## 4. Async Pattern

Both implementations are async, but with different import patterns.

| Language | Pattern | Import |
|----------|---------|--------|
| **Node.js** | `async/await` | Native `Promise` |
| **Python** | `async/await` | `asyncio` |

**Reasoning**: Both languages support async/await syntax. The underlying mechanisms differ (event loop vs asyncio), but the developer experience is consistent.

**Node.js**
```typescript
const sdk = createSDK(config);
const response = await sdk.save({ data: "value" });
await sdk.close();
```

**Python**
```python
sdk = create_sdk(config)
response = await sdk.save({"data": "value"})
await sdk.close()
```

## 5. Error Handling

Errors are captured in the response envelope rather than thrown.

| Language | Exception Base | Config Errors | Auth Errors |
|----------|---------------|---------------|-------------|
| **Node.js** | `JsonS3StorageError` | `JsonS3StorageConfigError` | `JsonS3StorageAuthError` |
| **Python** | `JsonS3StorageError` | `JsonS3StorageConfigError` | `JsonS3StorageAuthError` |

**Reasoning**: Both implementations use the same error hierarchy. Config errors are thrown immediately (fail fast), while runtime errors are captured in the response envelope to simplify error handling in async contexts.

## 6. Framework Adapter Patterns

The framework adapters follow each framework's idiomatic patterns.

| Language | Framework | Pattern | Lifecycle |
|----------|-----------|---------|-----------|
| **Node.js** | Fastify | Plugin + Decorator | `onClose` hook |
| **Python** | FastAPI | Lifespan + Dependency | Context manager |

**Reasoning**: Each framework has established patterns for plugin/middleware integration. Following these patterns ensures the SDK integrates naturally with existing applications.

**Fastify (Node.js)**
```typescript
await app.register(fastifyS3Storage, { config });
// Access via decorator
const response = await app.s3Storage.save(data);
```

**FastAPI (Python)**
```python
adapter = create_fastapi_adapter(config)
app = FastAPI(lifespan=adapter.lifespan)

@app.post("/save")
async def save(sdk: SDK):  # Dependency injection
    return await sdk.save(data)
```

## 7. Type Definitions

Type definitions use language-specific constructs.

| Language | Generic Types | Optional Types | Interface |
|----------|--------------|----------------|-----------|
| **Node.js** | `SDKResponse<T>` | `T \| undefined` | `interface` |
| **Python** | `SDKResponse[T]` | `T \| None` | `class` with `Generic[T]` |

**Reasoning**: TypeScript uses angle brackets for generics and `interface` keyword. Python uses square brackets and class inheritance from `Generic[T]`.

## 8. Logger Implementation

Both use structured logging but with different APIs.

| Language | Logger | Log Levels | Format |
|----------|--------|------------|--------|
| **Node.js** | Custom `Logger` | `debug`, `info`, `warn`, `error` | JSON-like |
| **Python** | `logging` + Custom | `debug`, `info`, `warning`, `error` | Standard |

**Reasoning**: Node.js uses a lightweight custom logger for minimal dependencies. Python uses the standard `logging` module extended with additional context.

## 9. Key Generation

Both generate deterministic keys from data, but internal serialization may differ.

| Language | Serialization | Hash Algorithm | Output |
|----------|--------------|----------------|--------|
| **Node.js** | Sorted JSON | SHA-256 | 12 chars |
| **Python** | Sorted JSON | SHA-256 | 12 chars |

**Reasoning**: Both use the same algorithm (sort keys, serialize to JSON, SHA-256 hash, truncate) to ensure keys are identical for the same data across both implementations.

## 10. Save Options Pattern

Options are passed differently based on language conventions.

| Language | Options Pattern | Signature |
|----------|----------------|-----------|
| **Node.js** | Options object | `save(data, { ttl, key })` |
| **Python** | Keyword arguments | `save(data, ttl=300, key="custom")` |

**Reasoning**: TypeScript commonly uses options objects for multiple optional parameters. Python uses keyword arguments which provide the same flexibility with more concise syntax.

**Node.js**
```typescript
await sdk.save(data, { ttl: 300, key: "custom-key" });
```

**Python**
```python
await sdk.save(data, ttl=300, key="custom-key")
```

## Summary

All behavioral differences are intentional adaptations to language conventions. The core functionality—storing and retrieving JSON data from S3 with TTL support—is identical across both implementations. Code written for one language can be easily translated to the other by following the naming convention mappings above.
