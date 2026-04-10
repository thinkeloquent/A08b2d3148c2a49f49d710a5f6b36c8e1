# AWS S3 Client API Reference

This document provides complete API reference for the AWS S3 Client SDK, showing type signatures and interfaces for both TypeScript and Python implementations.

## Core Components

### SDKConfig

Configuration for the S3 Storage SDK.

**TypeScript**
```typescript
interface SDKConfig {
  bucketName: string;      // S3 bucket name (required)
  region: string;          // AWS region (required)
  keyPrefix?: string;      // Prefix for all keys (optional)
  ttl?: number;            // Default TTL in seconds (optional)
  endpointUrl?: string;    // Custom endpoint URL for LocalStack (optional)
  debug?: boolean;         // Enable debug logging (optional)
}
```

**Python**
```python
class SDKConfig(BaseModel):
    bucket_name: str           # S3 bucket name (required)
    region: str = "us-east-1"  # AWS region (default: us-east-1)
    key_prefix: str = ""       # Prefix for all keys
    ttl: int | None = None     # Default TTL in seconds
    endpoint_url: str | None = None  # Custom endpoint for LocalStack
    debug: bool = False        # Enable debug logging
```

### SDKResponse

Response envelope for all SDK operations.

**TypeScript**
```typescript
interface SDKResponse<T> {
  success: boolean;        // Whether operation succeeded
  data?: T;                // Response data (type varies by operation)
  key?: string;            // Storage key (for save operations)
  error?: string;          // Error message if failed
  elapsedMs: number;       // Operation duration in milliseconds
}
```

**Python**
```python
class SDKResponse(Generic[T]):
    success: bool              # Whether operation succeeded
    data: T | None = None      # Response data
    key: str | None = None     # Storage key (for save operations)
    error: str | None = None   # Error message if failed
    elapsed_ms: float          # Operation duration in milliseconds
```

### StorageRecord

Internal record structure for stored data.

**TypeScript**
```typescript
interface StorageRecord {
  data: Record<string, unknown>;  // The stored JSON data
  expiresAt?: number;             // Unix timestamp for expiration
  createdAt: number;              // Unix timestamp when created
}
```

**Python**
```python
class StorageRecord(TypedDict):
    data: dict[str, Any]       # The stored JSON data
    expires_at: int | None     # Unix timestamp for expiration
    created_at: int            # Unix timestamp when created
```

## SDK

### S3StorageSDK

Main SDK class for S3 storage operations.

**TypeScript**
```typescript
class S3StorageSDK {
  constructor(config: SDKConfig, options?: SDKOptions);

  // Core operations
  save(data: Record<string, unknown>, options?: SaveOptions): Promise<SDKResponse<void>>;
  load(key: string): Promise<SDKResponse<Record<string, unknown>>>;
  exists(key: string): Promise<SDKResponse<boolean>>;
  delete(key: string): Promise<SDKResponse<void>>;
  listKeys(): Promise<SDKResponse<string[]>>;

  // Utility methods
  stats(): Promise<SDKResponse<StorageStats>>;
  debugInfo(): Promise<SDKResponse<DebugInfo>>;
  close(): Promise<void>;
}

interface SaveOptions {
  ttl?: number;       // Override default TTL
  customKey?: string; // Use specific key instead of generated
}
```

**Python**
```python
class S3StorageSDK:
    def __init__(self, config: SDKConfig, **options):
        ...

    # Core operations
    async def save(
        self,
        data: dict[str, Any],
        ttl: int | None = None,
        custom_key: str | None = None
    ) -> SDKResponse[None]: ...

    async def load(self, key: str) -> SDKResponse[dict[str, Any]]: ...
    async def exists(self, key: str) -> SDKResponse[bool]: ...
    async def delete(self, key: str) -> SDKResponse[None]: ...
    async def list_keys(self) -> SDKResponse[list[str]]: ...

    # Utility methods
    async def stats(self) -> SDKResponse[StorageStats]: ...
    async def debug_info(self) -> SDKResponse[DebugInfo]: ...
    async def close(self) -> None: ...
```

### SDK Factory Functions

**TypeScript**
```typescript
function createSDK(config: SDKConfig, options?: SDKOptions): S3StorageSDK;
function configFromEnv(): SDKConfig;
```

**Python**
```python
def create_sdk(config: SDKConfig, **options) -> S3StorageSDK: ...
def config_from_env() -> SDKConfig | None: ...
```

## Agent Interface

Simplified interface for LLM agent tool use.

**TypeScript**
```typescript
interface AgentInterface {
  store(data: Record<string, unknown>, ttl?: number): Promise<AgentResponse>;
  retrieve(key: string): Promise<AgentResponse>;
  check(key: string): Promise<AgentResponse>;
  remove(key: string): Promise<AgentResponse>;
  listAll(): Promise<AgentResponse>;
  close(): Promise<void>;
}

interface AgentResponse {
  success: boolean;
  message: string;
  key?: string;
  data?: unknown;
}

function createAgentInterface(config: SDKConfig): AgentInterface;
```

**Python**
```python
class AgentInterface:
    async def store(
        self,
        data: dict[str, Any],
        ttl: int | None = None
    ) -> AgentResponse: ...

    async def retrieve(self, key: str) -> AgentResponse: ...
    async def check(self, key: str) -> AgentResponse: ...
    async def remove(self, key: str) -> AgentResponse: ...
    async def list_all(self) -> AgentResponse: ...
    async def close(self) -> None: ...

@dataclass
class AgentResponse:
    success: bool
    message: str
    key: str | None = None
    data: Any = None

def create_agent_interface(config: SDKConfig) -> AgentInterface: ...
```

## Key Generation

Deterministic key generation from data.

**TypeScript**
```typescript
function generateKey(data: Record<string, unknown>): string;
```

**Python**
```python
def generate_key(data: dict[str, Any]) -> str: ...
```

## Framework Adapters

### Fastify Plugin (TypeScript)

**TypeScript**
```typescript
interface FastifyS3StorageOptions {
  config: SDKConfig;
  logger?: Logger;
  decoratorName?: string;  // Default: "s3Storage"
}

const fastifyS3Storage: FastifyPluginAsync<FastifyS3StorageOptions>;

// Helper functions
function createHealthRoute(sdk: S3StorageSDK, config: SDKConfig): () => Promise<HealthInfo>;
function createDebugRoute(sdk: S3StorageSDK): () => Promise<SDKResponse<DebugInfo>>;
function registerDiagnosticRoutes(
  fastify: FastifyInstance,
  sdk: S3StorageSDK,
  config: SDKConfig,
  options?: { prefix?: string }
): void;
```

### FastAPI Adapter (Python)

**Python**
```python
class FastAPIAdapter:
    def __init__(self, config: SDKConfig): ...

    @asynccontextmanager
    async def lifespan(self, app: FastAPI) -> AsyncGenerator[None, None]: ...

    def get_sdk(self) -> S3StorageSDK: ...
    def create_health_route(self) -> Callable[[], Awaitable[dict]]: ...
    def create_debug_route(self) -> Callable[[], Awaitable[SDKResponse]]: ...

def create_fastapi_adapter(config: SDKConfig) -> FastAPIAdapter: ...
```

## Exceptions

### Error Hierarchy

**TypeScript**
```typescript
class JsonS3StorageError extends Error {
  constructor(message: string);
}

class JsonS3StorageConfigError extends JsonS3StorageError {
  constructor(message: string, issues: string[]);
  issues: string[];
}

class JsonS3StorageAuthError extends JsonS3StorageError {
  constructor(message: string);
}
```

**Python**
```python
class JsonS3StorageError(Exception):
    """Base exception for all SDK errors."""
    pass

class JsonS3StorageConfigError(JsonS3StorageError):
    """Configuration validation error."""
    def __init__(self, message: str, issues: list[str] = None):
        self.issues = issues or []

class JsonS3StorageAuthError(JsonS3StorageError):
    """AWS authentication/authorization error."""
    pass
```

## Tool Schema

JSON Schema for LLM tool/function calling.

**TypeScript / Python**
```json
{
  "name": "s3_storage",
  "description": "Store and retrieve JSON data from S3",
  "parameters": {
    "type": "object",
    "properties": {
      "action": {
        "type": "string",
        "enum": ["store", "retrieve", "check", "remove", "list"]
      },
      "data": {
        "type": "object",
        "description": "Data to store (required for 'store' action)"
      },
      "key": {
        "type": "string",
        "description": "Storage key (required for retrieve/check/remove)"
      },
      "ttl": {
        "type": "integer",
        "description": "TTL in seconds (optional for 'store' action)"
      }
    },
    "required": ["action"]
  }
}
```

## SDK Operations Summary

| Operation | Description | Returns |
|-----------|-------------|---------|
| `save(data, options?)` | Store JSON data | Key string |
| `load(key)` | Retrieve data by key | Data object or null |
| `exists(key)` | Check if key exists | Boolean |
| `delete(key)` | Remove data by key | Void |
| `listKeys()` | List all keys | Array of strings |
| `listExpired()` | List expired keys | Array of strings |
| `cleanupExpired()` | Delete expired entries | Count of deleted |
| `stats()` | Get operation statistics | Stats object |
| `debugInfo()` | Get debug information | Debug object |
| `close()` | Cleanup resources | Void |
