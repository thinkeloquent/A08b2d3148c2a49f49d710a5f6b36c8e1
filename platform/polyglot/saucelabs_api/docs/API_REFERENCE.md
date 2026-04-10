# Sauce Labs API SDK -- Complete API Reference

> Polyglot SDK providing identical Sauce Labs API coverage in **JavaScript/TypeScript** and **Python**.
> JavaScript signatures are shown first, followed by Python equivalents.

---

## Table of Contents

1. [SaucelabsClient (Core HTTP Client)](#saucelabsclient-core-http-client)
2. [Domain Modules](#domain-modules)
   - [JobsModule](#jobsmodule)
   - [PlatformModule](#platformmodule)
   - [UsersModule](#usersmodule)
   - [UploadModule](#uploadmodule)
3. [Error Hierarchy](#error-hierarchy)
4. [Rate Limiting](#rate-limiting)
5. [Config](#config)
6. [Logger](#logger)
7. [Types & Constants](#types--constants)
8. [Environment Variables](#environment-variables)

---

## SaucelabsClient (Core HTTP Client)

The central HTTP client that handles authentication, rate limiting, region resolution, and request dispatch.

### Constructor

**JavaScript / TypeScript**

```typescript
import { SaucelabsClient } from '@internal/saucelabs-api';

const client = new SaucelabsClient(options?: {
  username?: string;              // Falls back to SAUCE_USERNAME / SAUCELABS_USERNAME env
  apiKey?: string;                // Falls back to SAUCE_ACCESS_KEY / SAUCELABS_ACCESS_KEY env
  region?: string;                // "us-west-1" (default), "us-east-4", "eu-central-1"
  baseUrl?: string;               // Default: "https://api.us-west-1.saucelabs.com"
  mobileBaseUrl?: string;         // Default: "https://mobile.saucelabs.com"
  timeout?: number;               // Milliseconds. Default: 30000
  rateLimitAutoWait?: boolean;    // Default: true
  onRateLimit?: (info: RateLimitInfo) => boolean | void;
  logger?: LoggerInstance;
  proxy?: string;
  verifySsl?: boolean;
});
```

**Python**

```python
from saucelabs_api import SaucelabsClient

client = SaucelabsClient(
    username: Optional[str] = None,              # Falls back to SAUCE_USERNAME / SAUCELABS_USERNAME env
    api_key: Optional[str] = None,               # Falls back to SAUCE_ACCESS_KEY / SAUCELABS_ACCESS_KEY env
    region: str = "us-west-1",                   # "us-west-1", "us-east-4", "eu-central-1"
    base_url: str = "https://api.us-west-1.saucelabs.com",
    mobile_base_url: str = "https://mobile.saucelabs.com",
    timeout: float = 30.0,                       # Seconds (not milliseconds)
    rate_limit_auto_wait: bool = True,
    on_rate_limit: Optional[Callable[[RateLimitInfo], Optional[bool]]] = None,
    logger: Optional[LoggerInstance] = None,
    proxy: Optional[str] = None,
    verify_ssl: bool = True,
)
```

### Methods

All methods are asynchronous. JavaScript returns `Promise<T>`, Python uses `async def`.

| Method | JavaScript | Python |
|--------|-----------|--------|
| GET | `await client.get(path: string, options?: { params?: Record<string, any> }): Promise<any>` | `await client.get(path: str, *, params: Optional[dict] = None) -> Any` |
| POST | `await client.post(path: string, body?: any, options?: RequestOptions): Promise<any>` | `await client.post(path: str, *, json: Optional[dict] = None, data: Optional[Any] = None, files: Optional[dict] = None) -> Any` |
| PUT | `await client.put(path: string, body?: any, options?: RequestOptions): Promise<any>` | `await client.put(path: str, *, json: Optional[dict] = None) -> Any` |
| PATCH | `await client.patch(path: string, body?: any, options?: RequestOptions): Promise<any>` | `await client.patch(path: str, *, json: Optional[dict] = None) -> Any` |
| DELETE | `await client.delete(path: string, options?: RequestOptions): Promise<any>` | `await client.delete(path: str) -> Any` |
| GET (raw) | `await client.getRaw(path: string, options?: { params?: Record<string, any> }): Promise<Response>` | `await client.get_raw(path: str, *, params: Optional[dict] = None) -> httpx.Response` |
| Close | `client.close(): void` | `await client.close() -> None` |

### Properties

| Property | JavaScript | Python |
|----------|-----------|--------|
| Username | `client.username: string` | `client.username: str` |
| Last Rate Limit | `client.lastRateLimit: RateLimitInfo \| null` | `client.last_rate_limit: Optional[RateLimitInfo]` |

### Context Manager (Python only)

```python
async with SaucelabsClient(username="user", api_key="key") as client:
    result = await client.get("/rest/v1/user/jobs")
# client.close() called automatically
```

JavaScript has no context manager equivalent; the client lifecycle is managed manually.

### Convenience Factory

**JavaScript / TypeScript**

```typescript
import { createSaucelabsClient } from '@internal/saucelabs-api';

const client = createSaucelabsClient({
  username: 'my-user',
  apiKey: 'my-key',
  region: 'eu-central-1',
});
```

**Python**

```python
from saucelabs_api import create_saucelabs_client

client = create_saucelabs_client(
    username="my-user",
    api_key="my-key",
    region="eu-central-1",
)
```

---

## Domain Modules

All domain modules accept a `SaucelabsClient` instance as their sole constructor argument.

```typescript
// JavaScript
import { SaucelabsClient, JobsModule } from '@internal/saucelabs-api';
const client = new SaucelabsClient({ username: "user", apiKey: "key" });
const jobs = new JobsModule(client);
```

```python
# Python
from saucelabs_api import SaucelabsClient, JobsModule
client = SaucelabsClient(username="user", api_key="key")
jobs = JobsModule(client)
```

---

### JobsModule

List and retrieve Sauce Labs test jobs.

| Operation | JavaScript | Python |
|-----------|-----------|--------|
| List jobs | `list(params?: { limit?: number; skip?: number; from?: number; to?: number }): Promise<Job[]>` | `list(*, params: Optional[dict] = None) -> list[dict]` |
| Get job | `get(jobId: string): Promise<Job>` | `get(job_id: str) -> dict` |

**Endpoints**

| Operation | HTTP Method | Path |
|-----------|-------------|------|
| List jobs | GET | `/rest/v1/{username}/jobs` |
| Get job | GET | `/rest/v1.1/{username}/jobs/{id}` |

---

### PlatformModule

Query Sauce Labs platform status and available platforms. Public endpoints -- no authentication required.

| Operation | JavaScript | Python |
|-----------|-----------|--------|
| Get status | `getStatus(): Promise<StatusResponse>` | `get_status() -> dict` |
| Get platforms | `getPlatforms(automationApi: string): Promise<Platform[]>` | `get_platforms(automation_api: str) -> list[dict]` |

**automationApi / automation_api values:** `"all"`, `"appium"`, `"webdriver"`

---

### UsersModule

Access Sauce Labs user information and concurrency limits.

| Operation | JavaScript | Python |
|-----------|-----------|--------|
| Get user | `getUser(username?: string): Promise<User>` | `get_user(username: Optional[str] = None) -> dict` |
| Get concurrency | `getConcurrency(username?: string): Promise<Concurrency>` | `get_concurrency(username: Optional[str] = None) -> dict` |

When `username` is omitted, the authenticated client username is used.

---

### UploadModule

Upload mobile application binaries (APK, IPA, AAB) to Sauce Labs storage.

| Operation | JavaScript | Python |
|-----------|-----------|--------|
| Upload app | `uploadApp(params: { filePath: string; fileName?: string }): Promise<UploadResponse>` | `upload_app(params: dict) -> dict` |

**Endpoint**

| Operation | HTTP Method | Path | Base URL |
|-----------|-------------|------|----------|
| Upload app | POST | `/api/upload/` | Mobile base URL (`https://mobile.saucelabs.com`) |

**Supported file extensions:** `.apk`, `.ipa`, `.aab`

---

## Error Hierarchy

Both languages implement an identical error class hierarchy rooted at `SaucelabsError`.

```
SaucelabsError (base)
  +-- SaucelabsAuthError          (HTTP 401)
  +-- SaucelabsNotFoundError      (HTTP 404)
  +-- SaucelabsRateLimitError     (HTTP 429)
  +-- SaucelabsValidationError    (HTTP 400, 422)
  +-- SaucelabsServerError        (HTTP 500+)
  +-- SaucelabsConfigError        (HTTP 0, configuration issues)
```

### Common Error Properties

| Property | JavaScript | Python |
|----------|-----------|--------|
| Message | `error.message: string` | `error.message: str` |
| HTTP Status | `error.statusCode: number` | `error.status_code: int` |
| Endpoint | `error.endpoint: string` | `error.endpoint: str` |
| Method | `error.method: string` | `error.method: str` |
| Timestamp | `error.timestamp: string` | `error.timestamp: str` |
| Response Body | `error.responseBody: any` | `error.response_body: Any` |
| Response Headers | `error.headers: Record<string, string>` | `error.headers: dict` |

### Serialization

**JavaScript**

```typescript
try {
  await client.get('/rest/v1/user/jobs/invalid');
} catch (err) {
  if (err instanceof SaucelabsNotFoundError) {
    console.log(err.toJSON());
    // { message, statusCode, endpoint, method, timestamp, responseBody, headers }
  }
}
```

**Python**

```python
from saucelabs_api import SaucelabsNotFoundError

try:
    await client.get('/rest/v1/user/jobs/invalid')
except SaucelabsNotFoundError as err:
    print(str(err))
    # Human-readable string representation with status_code, message, endpoint
```

### SaucelabsRateLimitError Special Handling

| Property | JavaScript | Python |
|----------|-----------|--------|
| Retry After (seconds) | `error.retryAfter: number` | `error.retry_after: float` |

### Error Factory

| Function | JavaScript | Python |
|----------|-----------|--------|
| Map response to error | `createErrorFromResponse(status: number, body: any, headers: Record<string, string>): SaucelabsError` | `create_error_from_response(status: int, body: Any, headers: dict) -> SaucelabsError` |

---

## Rate Limiting

Utilities for detecting, parsing, and responding to Sauce Labs API rate limits (HTTP 429).

### Functions

**JavaScript**

```typescript
import { parseRetryAfter, buildRateLimitInfo, calculateBackoff, RateLimiter } from '@internal/saucelabs-api';

const retrySeconds = parseRetryAfter(headerValue: string | number): number;

const info = buildRateLimitInfo(headers: Record<string, string>): RateLimitInfo;

const backoff = calculateBackoff(
  retry: number,
  base?: number,
  max?: number,
): number;
```

**Python**

```python
from saucelabs_api import RateLimiter

limiter = RateLimiter(
    auto_wait=True,
    max_retries=3,
    on_rate_limit=None,
    logger=None,
)

await limiter.handle_response(response)

backoff = RateLimiter._calculate_backoff(retry: int) -> float
```

### RateLimiter Constructor

| Option | JavaScript | Python |
|--------|-----------|--------|
| Auto-wait on 429 | `autoWait: boolean` | `auto_wait: bool` |
| Maximum retries | `maxRetries: number` | `max_retries: int` |
| Rate limit callback | `onRateLimit: (info) => boolean \| void` | `on_rate_limit: Optional[Callable]` |
| Logger instance | `logger: LoggerInstance` | `logger: Optional[Logger]` |

### RateLimiter Methods

| Method | JavaScript | Python |
|--------|-----------|--------|
| Handle response | `handleResponse(response, retryCount): Promise<RateLimitAction>` | `handle_response(response) -> Awaitable[None]` |
| Calculate backoff | `calculateBackoff(retry, base?, max?): number` (standalone) | `_calculate_backoff(retry: int) -> float` (static method) |

---

## Config

Configuration loading from constructor arguments, environment variables, and defaults.

### Resolution Priority

1. Constructor arguments (explicit values)
2. Environment variables (`SAUCE_USERNAME`, `SAUCE_ACCESS_KEY`, `SAUCELABS_USERNAME`, `SAUCELABS_ACCESS_KEY`)
3. Built-in defaults

### Functions

**JavaScript**

```typescript
import { resolveConfig, resolveCoreBaseUrl, resolveMobileBaseUrl } from '@internal/saucelabs-api';

const config = resolveConfig(options?: {
  username?: string;
  apiKey?: string;
  region?: string;
  baseUrl?: string;
  mobileBaseUrl?: string;
  timeout?: number;
});
// Returns: { username, apiKey, region, baseUrl, mobileBaseUrl, timeout, ... }

const coreUrl = resolveCoreBaseUrl(region?: string, override?: string): string;
const mobileUrl = resolveMobileBaseUrl(region?: string, override?: string): string;
```

**Python**

```python
from saucelabs_api import resolve_config, resolve_core_base_url, resolve_mobile_base_url

config = resolve_config(
    username=None,
    api_key=None,
    region=None,
    base_url=None,
    mobile_base_url=None,
    timeout=None,
)
# Returns: dict with username, api_key, region, base_url, mobile_base_url, timeout, ...

core_url: str = resolve_core_base_url(region=None, override=None)
mobile_url: str = resolve_mobile_base_url(region=None, override=None)
```

### Config Functions

| Function | JavaScript | Python |
|----------|-----------|--------|
| Resolve full config | `resolveConfig(options?)` | `resolve_config(**kwargs)` |
| Resolve core base URL | `resolveCoreBaseUrl(region?, override?)` | `resolve_core_base_url(region=None, override=None)` |
| Resolve mobile base URL | `resolveMobileBaseUrl(region?, override?)` | `resolve_mobile_base_url(region=None, override=None)` |

### Regions

| Region | Core Base URL |
|--------|---------------|
| `us-west-1` (default) | `https://api.us-west-1.saucelabs.com` |
| `us-east-4` | `https://api.us-east-4.saucelabs.com` |
| `eu-central-1` | `https://api.eu-central-1.saucelabs.com` |

---

## Logger

SDK-internal structured logger with configurable levels and automatic credential redaction.

### Factory Function

**JavaScript**

```typescript
import { createLogger } from '@internal/saucelabs-api';

const logger = createLogger('saucelabs_api', 'my-module.mjs', customLogger?);
// SDKLogger instance

logger.debug('debugging info');
logger.info('operational info');
logger.warn('warning');
logger.error('error occurred', errorObject);
```

**Python**

```python
from saucelabs_api import create_logger

logger = create_logger('saucelabs_api', 'my_module.py')
# _Logger instance

logger.debug('debugging info')
logger.info('operational info')
logger.warning('warning')
logger.error('error occurred')
```

| Aspect | JavaScript | Python |
|--------|-----------|--------|
| Factory | `createLogger(packageName, filename, customLogger?)` | `create_logger(package_name, filename)` |
| Log methods | `debug`, `info`, `warn`, `error` | `debug`, `info`, `warning`, `error` |
| Warning method name | `warn` | `warning` |
| Custom logger | Accepts optional third argument | Not supported |

### Log Levels

Controlled by the `LOG_LEVEL` environment variable.

| Level | JavaScript | Python |
|-------|-----------|--------|
| Debug | `debug` | `DEBUG` |
| Info | `info` | `INFO` |
| Warning | `warn` | `WARNING` |
| Error | `error` | `ERROR` |
| Silent | `silent` | `SILENT` |

### Auto-Redaction

Both implementations automatically redact sensitive values in log output. The following key patterns are redacted:

`token`, `secret`, `password`, `key`, `auth`, `credential`, `access_key`, `api_key`

---

## Types & Constants

### Default Values

| Constant | JavaScript | Python |
|----------|-----------|--------|
| Default base URL | `DEFAULT_BASE_URL = "https://api.us-west-1.saucelabs.com"` | `DEFAULT_BASE_URL = "https://api.us-west-1.saucelabs.com"` |
| Default mobile base URL | `DEFAULT_MOBILE_BASE_URL = "https://mobile.saucelabs.com"` | `DEFAULT_MOBILE_BASE_URL = "https://mobile.saucelabs.com"` |
| Default timeout | `DEFAULT_TIMEOUT = 30000` (milliseconds) | `DEFAULT_TIMEOUT = 30.0` (seconds) |
| Vendor name | `VENDOR = "saucelabs_api"` | `VENDOR = "saucelabs_api"` |
| Vendor version | `VENDOR_VERSION = "v1"` | `VENDOR_VERSION = "v1"` |

### Collection Constants

| Constant | Description | Values |
|----------|-------------|--------|
| `CORE_REGIONS` | Supported region identifiers for the core API | `"us-west-1"`, `"us-east-4"`, `"eu-central-1"` |
| `MOBILE_REGIONS` | Supported region identifiers for the mobile API | Region-specific mobile URLs |
| `AUTOMATION_API_VALUES` | Valid automation API filter values | `"all"`, `"appium"`, `"webdriver"` |
| `VALID_UPLOAD_EXTENSIONS` | Accepted file extensions for app uploads | `".apk"`, `".ipa"`, `".aab"` |

---

## Environment Variables

All configuration can be driven through environment variables.

| Variable | Purpose | Default |
|----------|---------|---------|
| `SAUCE_USERNAME` | Primary authentication username | -- |
| `SAUCELABS_USERNAME` | Fallback authentication username | -- |
| `SAUCE_ACCESS_KEY` | Primary authentication API key | -- |
| `SAUCELABS_ACCESS_KEY` | Fallback authentication API key | -- |
| `HTTPS_PROXY` | HTTPS proxy URL | -- |
| `HTTP_PROXY` | HTTP proxy URL (fallback) | -- |
| `LOG_LEVEL` | Logging verbosity (JS: debug/info/warn/error/silent, PY: DEBUG/INFO/WARNING/ERROR/SILENT) | `info` / `INFO` |

### Environment Variable Resolution Order

**Username:** `SAUCE_USERNAME` > `SAUCELABS_USERNAME`

**API Key:** `SAUCE_ACCESS_KEY` > `SAUCELABS_ACCESS_KEY`

**Proxy:** `HTTPS_PROXY` > `HTTP_PROXY`
