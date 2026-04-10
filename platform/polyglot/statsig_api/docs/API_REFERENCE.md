# Statsig Console API Client — API Reference

## Core Components

### StatsigClient

The core HTTP client for the Statsig Console API (v1). Provides typed HTTP methods with automatic rate limit handling, error mapping, pagination, and structured logging.

**TypeScript**
```typescript
interface StatsigClientOptions {
  apiKey?: string;                              // Falls back to STATSIG_API_KEY env var
  baseUrl?: string;                             // Default: 'https://statsigapi.net/console/v1'
  rateLimitAutoWait?: boolean;                  // Default: true
  rateLimitThreshold?: number;                  // Default: 0 (reserved)
  onRateLimit?: (info: RateLimitInfo) => boolean | void;
  logger?: object;                              // Custom logger with debug/info/warn/error
  timeout?: number;                             // Default: 30000 (ms)
  proxy?: string;                               // HTTP proxy URL
  verifySsl?: boolean;                          // Default: true
}

class StatsigClient {
  constructor(options?: StatsigClientOptions);

  get lastRateLimit(): RateLimitInfo | null;

  get(path: string, options?: RequestOptions): Promise<any>;
  post(path: string, body?: object, options?: RequestOptions): Promise<any>;
  put(path: string, body?: object, options?: RequestOptions): Promise<any>;
  patch(path: string, body?: object, options?: RequestOptions): Promise<any>;
  delete(path: string, options?: RequestOptions): Promise<any>;
  getRaw(path: string, options?: RequestOptions): Promise<Response>;
  list(path: string, options?: RequestOptions): Promise<any[]>;
  close(): void;
}
```

**Python**
```python
@dataclass
class StatsigClientOptions:
    api_key: str | None = None                  # Falls back to STATSIG_API_KEY env var
    base_url: str = "https://statsigapi.net/console/v1"
    rate_limit_auto_wait: bool = True
    rate_limit_threshold: int = 0               # Reserved
    on_rate_limit: Callable[[RateLimitInfo], bool] | None = None
    logger: Any = None                          # Custom logger with debug/info/warning/error
    timeout: float = 30.0                       # Seconds
    proxy: str | None = None                    # HTTP proxy URL
    verify_ssl: bool = True

class StatsigClient:
    def __init__(self, *, api_key: str | None = None, base_url: str = ..., ...): ...

    @property
    def last_rate_limit(self) -> RateLimitInfo | None: ...

    async def get(self, path: str, *, params: dict | None = None, headers: dict | None = None) -> Any: ...
    async def post(self, path: str, *, json: Any = None, headers: dict | None = None) -> Any: ...
    async def put(self, path: str, *, json: Any = None, headers: dict | None = None) -> Any: ...
    async def patch(self, path: str, *, json: Any = None, headers: dict | None = None) -> Any: ...
    async def delete(self, path: str, *, headers: dict | None = None) -> Any: ...
    async def get_raw(self, path: str, *, params: dict | None = None, headers: dict | None = None) -> httpx.Response: ...
    async def list(self, path: str, **options: Any) -> list[Any]: ...
    async def close(self) -> None: ...

    async def __aenter__(self) -> StatsigClient: ...
    async def __aexit__(self, *args) -> None: ...
```

### StatsigClientOptions

Configuration for the StatsigClient. In Node.js, passed as a plain object. In Python, available as a `@dataclass`.

_(Signatures shown above in StatsigClient section.)_

### RateLimitInfo

Snapshot of rate-limit state extracted from a 429 response.

**TypeScript**
```typescript
interface RateLimitInfo {
  retryAfter: number;            // Seconds to wait before retrying
  remaining: number | null;      // Remaining requests in window
  limit: number | null;          // Max requests per window
  resetAt: Date | null;          // When the window resets
  timestamp: Date;               // When this info was captured
}
```

**Python**
```python
@dataclass(frozen=True)
class RateLimitInfo:
    retry_after: float              # Seconds to wait before retrying
    remaining: int | None = None    # Remaining requests in window
    limit: int | None = None        # Max requests per window
    reset_at: str | None = None     # ISO-8601 reset timestamp
    timestamp: str = ""             # ISO-8601 capture timestamp
```

### RequestOptions

Per-request configuration passed to HTTP methods.

**TypeScript**
```typescript
interface RequestOptions {
  headers?: Record<string, string>;              // Additional request headers
  params?: Record<string, string | number | boolean>;  // URL query parameters
  timeout?: number;                              // Per-request timeout (ms)
}
```

**Python**
```python
# Passed as keyword arguments to client methods:
#   params: dict[str, Any] | None   — URL query parameters
#   headers: dict[str, str] | None  — Additional request headers
```

---

## Error Hierarchy

All API errors extend a base `StatsigError` class and carry the HTTP status code, response body, and headers.

### StatsigError

**TypeScript**
```typescript
class StatsigError extends Error {
  name: string;
  statusCode: number;
  responseBody: any;
  headers: Record<string, string>;
  timestamp: string;

  toJSON(): object;
}
```

**Python**
```python
class StatsigError(Exception):
    status_code: int
    response_body: Any
    headers: dict[str, str]
```

### Error Subclasses

| Error Class | HTTP Status | Description |
|---|---|---|
| `AuthenticationError` | 401 | Invalid or missing API key |
| `NotFoundError` | 404 | Resource does not exist |
| `RateLimitError` | 429 | Rate limit exceeded (carries `retryAfter`/`retry_after`) |
| `ValidationError` | 400, 422 | Invalid request parameters |
| `ServerError` | 5xx | Server-side failure |

### createErrorFromResponse / create_error_from_response

Factory function that maps an HTTP status code to the appropriate error subclass.

**TypeScript**
```typescript
function createErrorFromResponse(
  statusCode: number,
  body: any,
  headers?: Record<string, string>,
): StatsigError;
```

**Python**
```python
def create_error_from_response(
    status_code: int,
    body: Any,
    headers: dict[str, str],
) -> StatsigError: ...
```

---

## Rate Limiting

### RateLimiter

Reactive rate limiter that handles HTTP 429 responses. Supports auto-wait with retry, configurable max retries, and an optional callback for custom logic.

**TypeScript**
```typescript
class RateLimiter {
  constructor(options?: {
    autoWait?: boolean;           // Default: true
    maxRetries?: number;          // Default: 3
    onRateLimit?: (info: RateLimitInfo) => boolean | void;
    logger?: object;
  });

  lastRateLimit: RateLimitInfo | null;

  handleResponse(
    response: Response,
    retryFn: () => Promise<any>,
    retryCount?: number,
  ): Promise<any>;
}

function parseRetryAfter(headerValue: string | null | undefined): number;
function buildRateLimitInfo(headers: Record<string, string>): RateLimitInfo;
```

**Python**
```python
class RateLimiter:
    def __init__(
        self,
        *,
        auto_wait: bool = True,
        max_retries: int = 3,
        on_rate_limit: Callable[[RateLimitInfo], bool] | None = None,
        logger: Any = None,
    ): ...

    @property
    def last_rate_limit(self) -> RateLimitInfo | None: ...

    async def handle_response(
        self,
        response: Any,
        retry_fn: Callable[[], Awaitable[Any]],
        retry_count: int = 0,
    ) -> Any: ...
```

---

## Pagination

### paginate / listAll

Auto-pagination utilities that follow `pagination.nextPage` cursor URLs.

**TypeScript**
```typescript
async function* paginate(
  client: StatsigClient,
  path: string,
  options?: RequestOptions,
): AsyncGenerator<any[]>;

async function listAll(
  client: StatsigClient,
  path: string,
  options?: RequestOptions,
): Promise<any[]>;
```

**Python**
```python
async def paginate(
    client: StatsigClient,
    path: str,
    **options: Any,
) -> AsyncGenerator[list[Any], None]: ...

async def list_all(
    client: StatsigClient,
    path: str,
    **options: Any,
) -> list[Any]: ...
```

---

## Logger

### SDKLogger / _Logger

Structured logger with sensitive key redaction. Created via a factory function. Respects `LOG_LEVEL` environment variable (`DEBUG`, `INFO`, `WARNING`, `ERROR`).

**TypeScript**
```typescript
class SDKLogger {
  debug(message: string, context?: object): void;
  info(message: string, context?: object): void;
  warn(message: string, context?: object): void;
  error(message: string, context?: object): void;
}

function createLogger(packageName: string, filename: string): SDKLogger;
```

**Python**
```python
class _Logger:
    def debug(self, message: str, context: dict | None = None) -> None: ...
    def info(self, message: str, context: dict | None = None) -> None: ...
    def warning(self, message: str, context: dict | None = None) -> None: ...
    def error(self, message: str, context: dict | None = None) -> None: ...

def create_logger(package_name: str, filename: str) -> _Logger: ...
```

---

## Domain Modules

All domain modules follow the same pattern: they accept a `StatsigClient` in their constructor and delegate HTTP calls to it. The `createStatsigClient` / `create_statsig_client` factory attaches all modules automatically.

### Factory Functions

**TypeScript**
```typescript
function createStatsigClient(options?: StatsigClientOptions): StatsigClient & {
  experiments: ExperimentsModule;
  gates: GatesModule;
  layers: LayersModule;
  segments: SegmentsModule;
  metrics: MetricsModule;
  events: EventsModule;
  tags: TagsModule;
  auditLogs: AuditLogsModule;
  reports: ReportsModule;
};
```

**Python**
```python
def create_statsig_client(
    options: StatsigClientOptions | None = None,
    **kwargs: Any,
) -> StatsigClient: ...
```

> **Note:** The Python factory returns a plain `StatsigClient`. Domain modules must be instantiated separately (see SDK Guide).

### GatesModule

Feature gate CRUD operations, overrides, rules, enable/disable, and archival.

**TypeScript**
```typescript
class GatesModule {
  constructor(client: StatsigClient);

  list(params?: object): Promise<object[]>;
  get(gateId: string): Promise<object>;
  create(body: object): Promise<object>;
  update(gateId: string, body: object): Promise<object>;
  patch(gateId: string, body: object): Promise<object>;
  delete(gateId: string): Promise<object>;
  getOverrides(gateId: string): Promise<object>;
  updateOverrides(gateId: string, body: object): Promise<object>;
}
```

**Python**
```python
class GatesModule:
    def __init__(self, client: StatsigClient) -> None: ...

    async def list(self, **options: Any) -> list: ...
    async def get(self, id: str) -> dict: ...
    async def create(self, data: dict) -> dict: ...
    async def update(self, id: str, data: dict) -> dict: ...
    async def patch(self, id: str, data: dict) -> dict: ...
    async def delete(self, id: str) -> dict: ...
    async def enable(self, id: str) -> dict: ...
    async def disable(self, id: str) -> dict: ...
    async def get_overrides(self, id: str) -> dict: ...
    async def update_overrides(self, id: str, data: dict) -> dict: ...
    async def get_rules(self, id: str) -> list: ...
    async def update_rules(self, id: str, data: dict) -> dict: ...
    async def archive(self, id: str) -> dict: ...
```

### ExperimentsModule

Experiment CRUD operations, lifecycle transitions, overrides, and pulse results.

**TypeScript**
```typescript
class ExperimentsModule {
  constructor(client: StatsigClient);

  list(params?: object): Promise<object[]>;
  get(experimentId: string): Promise<object>;
  create(body: object): Promise<object>;
  update(experimentId: string, body: object): Promise<object>;
  patch(experimentId: string, body: object): Promise<object>;
  delete(experimentId: string): Promise<object>;
  start(experimentId: string): Promise<object>;
  getOverrides(experimentId: string): Promise<object>;
  updateOverrides(experimentId: string, body: object): Promise<object>;
}
```

**Python**
```python
class ExperimentsModule:
    def __init__(self, client: StatsigClient) -> None: ...

    async def list(self, **options: Any) -> list: ...
    async def get(self, id: str) -> dict: ...
    async def create(self, data: dict) -> dict: ...
    async def update(self, id: str, data: dict) -> dict: ...
    async def patch(self, id: str, data: dict) -> dict: ...
    async def delete(self, id: str) -> dict: ...
    async def start(self, id: str) -> dict: ...
    async def make_decision(self, id: str, data: dict) -> dict: ...
    async def reset(self, id: str) -> dict: ...
    async def archive(self, id: str) -> dict: ...
    async def get_overrides(self, id: str) -> dict: ...
    async def update_overrides(self, id: str, data: dict) -> dict: ...
    async def pulse_results(self, id: str, **options: Any) -> dict: ...
    async def get_assignment_source(self, id: str) -> dict: ...
```

### Additional Domain Modules

All additional modules follow the same constructor pattern and provide at minimum `list()` and resource-specific operations.

| Module | Resource | Key Methods |
|---|---|---|
| `LayersModule` | `/layers` | `list`, `get`, `create`, `update`, `delete` |
| `SegmentsModule` | `/segments` | `list`, `get`, `create`, `update`, `delete` |
| `MetricsModule` | `/metrics` | `list`, `create` |
| `TagsModule` | `/tags` | `list`, `create`, `update`, `delete` |
| `EventsModule` | `/events` | `list` |
| `AuditLogsModule` | `/audit_logs` | `list` |
| `ReportsModule` | `/reports` | `list` |

---

## Constants

| Constant | TypeScript | Python | Value |
|---|---|---|---|
| Default Base URL | `DEFAULT_BASE_URL` | `DEFAULT_BASE_URL` | `"https://statsigapi.net/console/v1"` |
| Default Timeout | `DEFAULT_TIMEOUT` | `DEFAULT_TIMEOUT` | `30000` (ms) / `30.0` (s) |
| Default Max Retries | `DEFAULT_MAX_RETRIES` | — | `3` |
