# Cache JSON AWS S3 Storage API Reference

## Core Components

### JsonS3Storage

The main storage class providing CRUD operations for JSON data in AWS S3.

**TypeScript**
```typescript
interface JsonS3StorageOptions {
  s3Client: S3ClientInterface;
  bucketName: string;
  keyPrefix?: string;       // Default: "jss3:"
  hashKeys?: string[];      // Fields for key generation
  ttl?: number;             // Default TTL in seconds
  region?: string;
  storageClass?: StorageClass;
  encryption?: EncryptionConfig;
  contentType?: string;     // Default: "application/json"
  retryConfig?: RetryConfig;
  debug?: boolean;
  maxErrorHistory?: number;
  logger?: Logger;
}

class JsonS3Storage {
  constructor(options: JsonS3StorageOptions);

  // CRUD Operations
  save<T>(data: T, options?: SaveOptions): Promise<string>;
  load<T>(dataOrKey: T | string, options?: LoadOptions): Promise<T | null>;
  delete<T>(dataOrKey: T | string): Promise<boolean>;
  exists<T>(dataOrKey: T | string): Promise<boolean>;

  // Bulk Operations
  listKeys(): Promise<string[]>;
  clear(): Promise<number>;
  cleanupExpired(): Promise<number>;

  // Lifecycle
  close(): Promise<void>;

  // Diagnostics
  getStats(): StorageStats;
  getErrors(): ErrorRecord[];
  getLastError(): ErrorRecord | null;
  clearErrors(): void;
  debugInfo(): Promise<DebugInfo>;
}
```

**Python**
```python
class JsonS3Storage:
    def __init__(
        self,
        s3_client: S3ClientProtocol,
        bucket_name: str,
        *,
        key_prefix: str = "jss3:",
        hash_keys: list[str] | None = None,
        ttl: float | None = None,
        region: str | None = None,
        storage_class: StorageClass = StorageClass.STANDARD,
        encryption: EncryptionConfig | None = None,
        content_type: str = "application/json",
        retry_config: RetryConfig | None = None,
        debug: bool = False,
        max_error_history: int = 100,
        logger: LoggerProtocol | None = None,
    ) -> None: ...

    # CRUD Operations
    async def save(self, data: dict[str, Any], *, ttl: float | None = None) -> str: ...
    async def load(self, data_or_key: dict[str, Any] | str, *, ignore_expiry: bool = False) -> dict[str, Any] | None: ...
    async def delete(self, data_or_key: dict[str, Any] | str) -> bool: ...
    async def exists(self, data_or_key: dict[str, Any] | str) -> bool: ...

    # Bulk Operations
    async def list_keys(self) -> list[str]: ...
    async def clear(self) -> int: ...
    async def cleanup_expired(self) -> int: ...

    # Lifecycle
    async def close(self) -> None: ...

    # Diagnostics
    def get_stats(self) -> StorageStats: ...
    def get_errors(self) -> list[ErrorRecord]: ...
    def get_last_error(self) -> ErrorRecord | None: ...
    def clear_errors(self) -> None: ...
    async def debug_info(self) -> DebugInfo: ...

    # Context Manager
    async def __aenter__(self) -> JsonS3Storage: ...
    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None: ...
```

### StorageEntry

The internal data structure stored in S3.

**TypeScript**
```typescript
interface StorageEntry<T = Record<string, unknown>> {
  key: string;
  data: T;
  created_at: number;  // Unix timestamp (seconds)
  expires_at: number | null;
}
```

**Python**
```python
@dataclass
class StorageEntry:
    key: str
    data: dict[str, Any]
    created_at: float  # Unix timestamp (seconds)
    expires_at: float | None

    @property
    def is_expired(self) -> bool: ...
```

### StorageStats

Operation statistics tracking.

**TypeScript**
```typescript
interface StorageStats {
  saves: number;
  loads: number;
  hits: number;
  misses: number;
  deletes: number;
  errors: number;
}
```

**Python**
```python
@dataclass
class StorageStats:
    saves: int = 0
    loads: int = 0
    hits: int = 0
    misses: int = 0
    deletes: int = 0
    errors: int = 0
```

### ErrorRecord

Error tracking information.

**TypeScript**
```typescript
interface ErrorRecord {
  timestamp: string;  // ISO 8601
  operation: string;
  error_type: string;
  error_message: string;
  traceback: string;
  key: string | null;
  s3_key: string | null;
}
```

**Python**
```python
@dataclass
class ErrorRecord:
    timestamp: str  # ISO 8601
    operation: str
    error_type: str
    error_message: str
    traceback: str
    key: str | None
    s3_key: str | None
```

## Key Generation

### generateKey

Generate a deterministic key from data using SHA256.

**TypeScript**
```typescript
function generateKey(
  data: Record<string, unknown>,
  hashKeys?: string[]
): string;
```

**Python**
```python
def generate_key(
    data: dict[str, Any],
    hash_keys: list[str] | None = None
) -> str: ...
```

**Behavior:**
- Returns 16-character hexadecimal string
- Same data always produces same key (deterministic)
- When `hashKeys`/`hash_keys` not specified, uses all keys sorted alphabetically
- When specified, uses only those keys in the given order
- Cross-language parity: Python and TypeScript produce identical keys

## Logger Interface

### Logger / LoggerProtocol

Interface for dependency injection of loggers.

**TypeScript**
```typescript
interface Logger {
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

function createLogger(
  packageName: string,
  filename: string,
  options?: { level?: LogLevel; stream?: NodeJS.WriteStream }
): DefaultLogger;
```

**Python**
```python
class LoggerProtocol(Protocol):
    def debug(self, message: str) -> None: ...
    def info(self, message: str) -> None: ...
    def warn(self, message: str) -> None: ...
    def error(self, message: str) -> None: ...

def create(
    package_name: str,
    filename: str,
    *,
    level: int = logging.DEBUG,
    stream: object | None = None
) -> DefaultLogger: ...
```

## Exceptions / Errors

### Error Hierarchy

**TypeScript**
```typescript
class JsonS3StorageError extends Error { }
class JsonS3StorageReadError extends JsonS3StorageError { }
class JsonS3StorageWriteError extends JsonS3StorageError { }
class JsonS3StorageSerializationError extends JsonS3StorageError { }
class JsonS3StorageAuthError extends JsonS3StorageError { }
class JsonS3StorageConfigError extends JsonS3StorageError { }
class JsonS3StorageClosedError extends JsonS3StorageError { }
```

**Python**
```python
class JsonS3StorageError(Exception): ...
class JsonS3StorageReadError(JsonS3StorageError): ...
class JsonS3StorageWriteError(JsonS3StorageError): ...
class JsonS3StorageSerializationError(JsonS3StorageError): ...
class JsonS3StorageAuthError(JsonS3StorageError): ...
class JsonS3StorageConfigError(JsonS3StorageError): ...
class JsonS3StorageClosedError(JsonS3StorageError): ...
```

## Factory Functions

### createStorage / create_storage

Recommended way to create storage instances.

**TypeScript**
```typescript
function createStorage(options: JsonS3StorageOptions): JsonS3Storage;
```

**Python**
```python
def create_storage(
    s3_client: S3ClientProtocol,
    bucket_name: str,
    **kwargs: Any
) -> JsonS3Storage: ...
```

## Client Factory

The client factory provides a unified way to create S3 clients from connection parameters. It separates configuration from client creation, enabling easy reuse of connection settings.

### ClientConfig

Configuration object for S3 client creation.

**TypeScript**
```typescript
interface ClientConfig {
  bucketName: string;
  proxyUrl?: string;
  endpointUrl?: string;
  awsSecretAccessKey?: string;
  awsAccessKeyId?: string;
  regionName?: string;
  addressingStyle?: "path" | "virtual";  // Default: "path"
  connectionTimeout?: number;            // Default: 20 (seconds)
  readTimeout?: number;                  // Default: 60 (seconds)
  retriesMaxAttempts?: number;           // Default: 3
  type?: string;                         // Default: "s3"
  verify?: boolean;                      // Default: true
  ttl?: number;                          // Default: 600 (seconds)
}
```

**Python**
```python
@dataclass
class ClientConfig:
    bucket_name: str
    proxy_url: str | None = None
    endpoint_url: str | None = None
    aws_secret_access_key: str | None = None
    aws_access_key_id: str | None = None
    region_name: str | None = None
    addressing_style: str = "path"
    connection_timeout: int = 20          # seconds
    read_timeout: int = 60               # seconds
    retries_max_attempts: int = 3
    type: str = "s3"
    verify: bool = True
    ttl: float = 600.0                   # seconds
```

### getClientFactory / get_client_factory

Create a `ClientConfig` from connection parameters.

**TypeScript**
```typescript
function getClientFactory(options: ClientFactoryOptions): ClientConfig;
```

**Python**
```python
def get_client_factory(
    *,
    bucket_name: str,
    proxy_url: str | None = None,
    endpoint_url: str | None = None,
    aws_secret_access_key: str | None = None,
    aws_access_key_id: str | None = None,
    region_name: str | None = None,
    addressing_style: str = "path",
    connection_timeout: int = 20,
    read_timeout: int = 60,
    retries_max_attempts: int = 3,
    type: str = "s3",
    verify: bool = True,
    ttl: float = 600.0,
) -> ClientConfig: ...
```

### createAsyncClient (TypeScript)

Create an S3Client from a `ClientConfig`. Returns the client, a `destroy` function, and the config.

```typescript
interface AsyncClientHandle {
  client: S3Client & S3ClientInterface;
  destroy: () => void;
  config: ClientConfig;
}

function createAsyncClient(config: ClientConfig): AsyncClientHandle;
```

### ClientAsync (Python)

Async context manager that yields an aiobotocore S3 client from a `ClientConfig`.

```python
class ClientAsync:
    def __init__(self, config: ClientConfig) -> None: ...
    async def __aenter__(self) -> S3ClientProtocol: ...
    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None: ...
```

### ClientSync (Python)

Sync context manager that yields a boto3 S3 client from a `ClientConfig`.

```python
class ClientSync:
    def __init__(self, config: ClientConfig) -> None: ...
    def __enter__(self) -> Any: ...
    def __exit__(self, exc_type, exc_val, exc_tb) -> None: ...
```

### getClientFactoryFromAppConfig / get_client_factory_from_app_config

Create a `ClientConfig` by resolving from AppYamlConfig (YAML) and environment variables using the three-tier resolution from `aws-s3-client`.

Resolution order (highest priority first):
1. Explicit overrides
2. YAML config (`storage.s3` section from AppYamlConfig)
3. Environment variables
4. Defaults

**TypeScript**
```typescript
function getClientFactoryFromAppConfig(
  yamlConfig?: Record<string, unknown> | null,
  overrides?: AppConfigOverrides,
): ClientConfig;
```

**Python**
```python
def get_client_factory_from_app_config(
    yaml_config: dict[str, Any] | None = None,
    **overrides: Any,
) -> ClientConfig: ...
```

**Server context** (YAML available):

```typescript
// TypeScript — Fastify
const yaml = server.config.getNested(['storage', 's3']);
const config = getClientFactoryFromAppConfig(yaml);
const { client, destroy } = createAsyncClient(config);
```

```python
# Python — FastAPI
yaml = app.state.config.get_nested('storage', 's3')
config = get_client_factory_from_app_config(yaml)
async with ClientAsync(config) as client:
    ...
```

**CLI / direct call** (env only):

```typescript
// TypeScript
const config = getClientFactoryFromAppConfig();
const { client, destroy } = createAsyncClient(config);
```

```python
# Python
config = get_client_factory_from_app_config()
async with ClientAsync(config) as client:
    ...
```

### Client Factory Usage

**TypeScript**
```typescript
import { getClientFactory, createAsyncClient, createStorage } from "cache_json_awss3_storage";

const config = getClientFactory({
  bucketName: "my-bucket",
  regionName: "us-east-1",
  endpointUrl: "http://localhost:4566",
  ttl: 3600,
});

const { client, destroy } = createAsyncClient(config);
try {
  const storage = createStorage({ s3Client: client, bucketName: config.bucketName });
  await storage.save({ name: "Alice" });
} finally {
  destroy();
}
```

**Python**
```python
from cache_json_awss3_storage import get_client_factory, ClientAsync, create_storage

config = get_client_factory(
    bucket_name="my-bucket",
    region_name="us-east-1",
    endpoint_url="http://localhost:4566",
    ttl=3600.0,
)

async with ClientAsync(config) as client:
    storage = create_storage(client, config.bucket_name, ttl=config.ttl)
    await storage.save({"name": "Alice"})
    await storage.close()
```

## Configuration Options

### Storage Options

| Option | TypeScript | Python | Default | Description |
|--------|------------|--------|---------|-------------|
| S3 Client | `s3Client` | `s3_client` | Required | AWS S3 client instance |
| Bucket Name | `bucketName` | `bucket_name` | Required | Target S3 bucket |
| Key Prefix | `keyPrefix` | `key_prefix` | `"jss3:"` | Prefix for all keys |
| Hash Keys | `hashKeys` | `hash_keys` | `undefined`/`None` | Fields for key generation |
| TTL | `ttl` | `ttl` | `undefined`/`None` | Default TTL in seconds |
| Region | `region` | `region` | Client default | AWS region |
| Storage Class | `storageClass` | `storage_class` | `STANDARD` | S3 storage class |
| Encryption | `encryption` | `encryption` | `undefined`/`None` | Encryption config |
| Debug | `debug` | `debug` | `false` | Enable debug logging |
| Logger | `logger` | `logger` | Auto-created | Custom logger instance |

### ClientConfig Options

| Option | TypeScript | Python | Default | Description |
|--------|------------|--------|---------|-------------|
| Bucket Name | `bucketName` | `bucket_name` | Required | Target S3 bucket |
| Region | `regionName` | `region_name` | `undefined`/`None` | AWS region |
| Endpoint URL | `endpointUrl` | `endpoint_url` | `undefined`/`None` | Custom S3 endpoint |
| Access Key | `awsAccessKeyId` | `aws_access_key_id` | `undefined`/`None` | AWS access key |
| Secret Key | `awsSecretAccessKey` | `aws_secret_access_key` | `undefined`/`None` | AWS secret key |
| Proxy URL | `proxyUrl` | `proxy_url` | `undefined`/`None` | HTTPS proxy URL |
| Addressing | `addressingStyle` | `addressing_style` | `"path"` | `"path"` or `"virtual"` |
| Connect Timeout | `connectionTimeout` | `connection_timeout` | `20` | Seconds |
| Read Timeout | `readTimeout` | `read_timeout` | `60` | Seconds |
| Max Retries | `retriesMaxAttempts` | `retries_max_attempts` | `3` | Retry attempts |
| Verify SSL | `verify` | `verify` | `true` | SSL verification |
| TTL | `ttl` | `ttl` | `600` | Default TTL (seconds) |

### Config Resolution (getClientFactoryFromAppConfig)

When using the AppYamlConfig bridge, configuration is resolved in three tiers:

| Priority | Source | Description |
|----------|--------|-------------|
| 1 (highest) | Explicit overrides | Arguments passed to the function |
| 2 | YAML config | `storage.s3` section from AppYamlConfig |
| 3 (lowest) | Environment variables | `AWS_S3_BUCKET`, `AWS_REGION`, etc. |

Requires `aws-s3-client` package (optional peer dependency in TypeScript, `appconfig` extra in Python).
