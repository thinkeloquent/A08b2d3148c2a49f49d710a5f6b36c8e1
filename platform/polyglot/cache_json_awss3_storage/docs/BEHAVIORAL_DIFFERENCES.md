# Behavioral Differences

This document outlines intentional differences between the Node.js and Python implementations of the cache_json_awss3_storage package.

## 1. Naming Conventions

| Language | Properties | Methods |
|----------|------------|---------|
| **Node.js** | camelCase | camelCase |
| **Python** | snake_case | snake_case |

**Reasoning**: Each implementation follows the idiomatic conventions of its language ecosystem. Python follows PEP 8 style guide, while TypeScript follows common JavaScript/Node.js conventions.

Examples:
- `bucketName` (TS) vs `bucket_name` (Python)
- `keyPrefix` (TS) vs `key_prefix` (Python)
- `getStats()` (TS) vs `get_stats()` (Python)

## 2. Factory Function Signature

| Language | Pattern | Signature |
|----------|---------|-----------|
| **Node.js** | Options object | `createStorage(options: JsonS3StorageOptions)` |
| **Python** | Positional + kwargs | `create_storage(s3_client, bucket_name, **kwargs)` |

**Reasoning**: TypeScript uses a single options object for cleaner type inference and optional parameters. Python uses positional arguments for required parameters and keyword arguments for optional ones, following common Python patterns.

## 3. S3 Client Interface

| Language | Client Type | Async Pattern |
|----------|-------------|---------------|
| **Node.js** | `@aws-sdk/client-s3` | `await client.send(command)` |
| **Python** | `aiobotocore` | `await client.method(**params)` |

**Reasoning**: Each implementation uses the idiomatic AWS SDK for its ecosystem. The TypeScript version uses AWS SDK v3 with command pattern, while Python uses aiobotocore for async support.

## 4. Context Manager Support

| Language | Pattern | Usage |
|----------|---------|-------|
| **Node.js** | `Symbol.asyncDispose` | `await using storage = ...` (ES2023+) |
| **Python** | `async with` | `async with storage as s: ...` |

**Reasoning**: Python has built-in async context manager support. TypeScript supports the newer ES2023 `using` declaration with `Symbol.asyncDispose`, though manual `close()` is more commonly used.

## 5. Error Context Information

| Language | Context Storage | Access |
|----------|-----------------|--------|
| **Node.js** | Error properties | `error.context.operation` |
| **Python** | Error attributes | `error.operation` |

**Reasoning**: TypeScript errors extend `Error` with a `context` object property. Python exceptions use direct attributes for simpler access patterns.

## 6. Logger Creation

| Language | Factory | Filename Parameter |
|----------|---------|-------------------|
| **Node.js** | `createLogger(pkg, import.meta.url)` | `import.meta.url` |
| **Python** | `create_logger(pkg, __file__)` | `__file__` |

**Reasoning**: Each language uses its native way to get the current file path. TypeScript ES modules use `import.meta.url`, while Python uses the built-in `__file__` variable.

## 7. Type Annotations

| Language | Type System | Nullability |
|----------|-------------|-------------|
| **Node.js** | TypeScript interfaces | `T | null` |
| **Python** | Type hints + dataclasses | `T | None` |

**Reasoning**: TypeScript uses `null` for absent values, while Python uses `None`. Both are semantically equivalent but follow language conventions.

## 8. Serialization Format

| Language | JSON Serialization | Field Names |
|----------|-------------------|-------------|
| **Node.js** | `JSON.stringify` | snake_case |
| **Python** | `json.dumps` | snake_case |

**Reasoning**: Both implementations serialize to the same JSON format with snake_case field names for cross-language parity. The stored format is:
```json
{
  "key": "abc123",
  "data": {...},
  "created_at": 1704067200.123,
  "expires_at": 1704070800.123
}
```

## 9. Async/Await Patterns

| Language | Import | Example |
|----------|--------|---------|
| **Node.js** | Native `async/await` | `const data = await storage.load(key)` |
| **Python** | `asyncio` | `data = await storage.load(key)` |

**Reasoning**: Both languages now have native async/await support. The APIs are functionally identical, differing only in syntax.

## 10. Configuration Validation

| Language | Timing | Error Type |
|----------|--------|------------|
| **Node.js** | Constructor | `JsonS3StorageConfigError` |
| **Python** | Constructor | `JsonS3StorageConfigError` |

**Reasoning**: Both implementations validate configuration at construction time and throw/raise `JsonS3StorageConfigError` for invalid configuration. This is consistent across both implementations.

## 11. Client Factory Pattern

| Language | Config Creation | Client Lifecycle | Cleanup |
|----------|----------------|-----------------|---------|
| **Node.js** | `getClientFactory(opts) → ClientConfig` | `createAsyncClient(config) → { client, destroy }` | `destroy()` |
| **Python** | `get_client_factory(**kwargs) → ClientConfig` | `ClientAsync(config)` / `ClientSync(config)` | Context manager exit |

**Reasoning**: TypeScript returns a `{ client, destroy }` handle since there is no native context manager. Python uses `async with` / `with` context managers, which is idiomatic for resource management. Both approaches ensure proper cleanup of S3 connections.

| Detail | Node.js | Python |
|--------|---------|--------|
| Config field style | `camelCase` (`bucketName`) | `snake_case` (`bucket_name`) |
| Async client | `createAsyncClient()` → `{ client, destroy }` | `ClientAsync` → `async with` |
| Sync client | N/A | `ClientSync` → `with` |
| Underlying SDK | `@aws-sdk/client-s3` | aiobotocore / boto3 |

## 12. AppYamlConfig Bridge

| Language | Function | Dependency |
|----------|----------|------------|
| **Node.js** | `getClientFactoryFromAppConfig(yaml?, overrides?)` | `aws-s3-client` (optional peer) |
| **Python** | `get_client_factory_from_app_config(yaml_config?, **overrides)` | `aws-s3-client` (optional `appconfig` extra) |

**Reasoning**: Both use the same three-tier resolution from `aws-s3-client` (`configFromEnv` / `config_from_env`) and map the result to `ClientConfig`. The `aws-s3-client` import is deferred (lazy) in Python to avoid hard dependency — only required when the bridge function is called.

## Cross-Language Parity Guarantees

The following behaviors are **guaranteed identical** across implementations:

1. **Key Generation**: `generateKey(data)` produces identical 16-character hex keys
2. **TTL Behavior**: Expiration uses Unix timestamps in seconds
3. **Storage Format**: JSON structure in S3 is identical
4. **Operation Semantics**: All CRUD operations behave identically
5. **Statistics Tracking**: Same counters (saves, loads, hits, misses, deletes, errors)
6. **Error Recording**: Same error record structure

To verify key generation parity:
```bash
make verify-parity
```
