# Sauce Labs API Python SDK -- API Reference

> Python 3.11+ | Package: `saucelabs_api` | Async-first with `httpx`

---

## Table of Contents

- [SaucelabsClient](#saucelabsclient)
- [Domain Modules](#domain-modules)
  - [JobsModule](#jobsmodule)
  - [PlatformModule](#platformmodule)
  - [UsersModule](#usersmodule)
  - [UploadModule](#uploadmodule)
- [Error Hierarchy](#error-hierarchy)
- [Rate Limiting](#rate-limiting)
- [Config](#config)
- [Logger](#logger)
- [Types](#types)
- [Convenience Factory](#convenience-factory)

---

## SaucelabsClient

The core async HTTP client for all Sauce Labs REST API interactions.

### Constructor

```python
from saucelabs_api import SaucelabsClient

client = SaucelabsClient(
    username: Optional[str] = None,
    api_key: Optional[str] = None,
    region: str = "us-west-1",
    base_url: Optional[str] = None,
    mobile_base_url: Optional[str] = None,
    timeout: float = 30.0,
    rate_limit_auto_wait: bool = True,
    on_rate_limit: Optional[Callable[[RateLimitInfo], bool]] = None,
    logger: Optional[LoggerProtocol] = None,
    proxy: Optional[str] = None,
    verify_ssl: bool = True,
)
```

**Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `username` | `Optional[str]` | `None` | Sauce Labs username. Falls back to `SAUCE_USERNAME` then `SAUCELABS_USERNAME` env vars. |
| `api_key` | `Optional[str]` | `None` | Sauce Labs access key. Falls back to `SAUCE_ACCESS_KEY` then `SAUCELABS_ACCESS_KEY` env vars. |
| `region` | `str` | `"us-west-1"` | Data center region. One of `"us-west-1"`, `"us-east-4"`, `"eu-central-1"`. |
| `base_url` | `Optional[str]` | `None` | Override for the Core Automation base URL. |
| `mobile_base_url` | `Optional[str]` | `None` | Override for the Mobile Distribution base URL. |
| `timeout` | `float` | `30.0` | Request timeout in seconds. |
| `rate_limit_auto_wait` | `bool` | `True` | Automatically wait and retry on 429 responses. |
| `on_rate_limit` | `Optional[Callable[[RateLimitInfo], bool]]` | `None` | Callback invoked on rate limit. Return `False` to suppress retry. |
| `logger` | `Optional[LoggerProtocol]` | `None` | Custom logger instance satisfying `LoggerProtocol`. |
| `proxy` | `Optional[str]` | `None` | HTTPS proxy URL. Falls back to `HTTPS_PROXY` / `HTTP_PROXY` env vars. |
| `verify_ssl` | `bool` | `True` | Verify SSL certificates. |

### Context Manager

```python
async with SaucelabsClient(username="demo", api_key="xxx") as client:
    result = await client.get("/rest/v1/demo/jobs", params={"limit": 5})
```

Using `SaucelabsClient` as an async context manager ensures the underlying HTTP clients (core and mobile) are properly closed on exit.

### Async Methods

```python
await client.get(path: str, *, params: Optional[dict] = None, headers: Optional[dict] = None, mobile: bool = False) -> Any
```

Sends an authenticated GET request. Set `mobile=True` to route through the Mobile Distribution base URL.

```python
await client.post(path: str, *, json: Any = None, data: Any = None, files: Any = None, headers: Optional[dict] = None, mobile: bool = False) -> Any
```

Sends an authenticated POST request. Supports JSON body, form data, and file uploads.

```python
await client.put(path: str, *, json: Any = None, headers: Optional[dict] = None, mobile: bool = False) -> Any
```

Sends an authenticated PUT request with a JSON body.

```python
await client.patch(path: str, *, json: Any = None, headers: Optional[dict] = None, mobile: bool = False) -> Any
```

Sends an authenticated PATCH request with a JSON body.

```python
await client.delete(path: str, *, headers: Optional[dict] = None, mobile: bool = False) -> Any
```

Sends an authenticated DELETE request.

```python
await client.get_raw(path: str, *, params: Optional[dict] = None, headers: Optional[dict] = None, mobile: bool = False) -> httpx.Response
```

Sends a GET request and returns the raw `httpx.Response` object without JSON parsing or error mapping.

```python
await client.close() -> None
```

Closes both the core and mobile `httpx.AsyncClient` transports and releases resources.

### Properties

```python
client.username -> str
```

Returns the configured Sauce Labs username.

```python
client.last_rate_limit -> Optional[RateLimitInfo]
```

Returns the most recent `RateLimitInfo` if a 429 response was encountered, otherwise `None`.

---

## Domain Modules

All domain modules share the same constructor signature:

```python
DomainModule(client: SaucelabsClient)
```

They wrap `SaucelabsClient` methods with Sauce-Labs-API-specific paths and parameter handling.

---

### JobsModule

```python
from saucelabs_api import SaucelabsClient
from saucelabs_api.modules.jobs import JobsModule

client = SaucelabsClient(username="demo", api_key="xxx")
jobs = JobsModule(client)
```

#### Methods

```python
await jobs.list(params: Optional[dict] = None) -> list[Any]
```

Lists test jobs for the configured user. The optional `params` dict supports: `limit` (default 25), `skip`, `from` (Unix timestamp), `to` (Unix timestamp).

```python
await jobs.get(job_id: str) -> dict[str, Any]
```

Retrieves details for a specific test job by ID.

---

### PlatformModule

```python
from saucelabs_api.modules.platform import PlatformModule

platform = PlatformModule(client)
```

#### Methods

```python
await platform.get_status() -> dict[str, Any]
```

Returns the current Sauce Labs service status. This is a public endpoint and does not require authentication.

```python
await platform.get_platforms(automation_api: str = "all") -> list[dict[str, Any]]
```

Returns supported platforms filtered by automation backend. `automation_api` accepts `"all"`, `"appium"`, or `"webdriver"`. Raises `SaucelabsValidationError` for invalid values.

---

### UsersModule

```python
from saucelabs_api.modules.users import UsersModule

users = UsersModule(client)
```

#### Methods

```python
await users.get_user(username: Optional[str] = None) -> dict[str, Any]
```

Retrieves user account information. Defaults to the configured username if none is provided.

```python
await users.get_concurrency(username: Optional[str] = None) -> dict[str, Any]
```

Retrieves concurrency and usage statistics for a user. Defaults to the configured username if none is provided.

---

### UploadModule

```python
from saucelabs_api.modules.upload import UploadModule

upload = UploadModule(client)
```

#### Methods

```python
await upload.upload_app(
    *,
    file: str | bytes,
    api_key: str,
    app_name: Optional[str] = None,
    upload_to_saucelabs: bool = False,
    notify: bool = False,
) -> dict[str, Any]
```

Uploads a mobile app binary (.apk, .ipa, .aab) to Sauce Labs Mobile Distribution. The `file` parameter accepts a file path string or raw bytes. The `api_key` is the Distribution API key. Set `upload_to_saucelabs=True` to also push to Real Device Cloud storage. Set `notify=True` to email testers about the upload.

Valid file extensions: `.apk`, `.ipa`, `.aab`.

---

## Error Hierarchy

All errors inherit from `SaucelabsError`. Import from `saucelabs_api.errors`.

```python
from saucelabs_api.errors import (
    SaucelabsError,
    SaucelabsAuthError,
    SaucelabsNotFoundError,
    SaucelabsRateLimitError,
    SaucelabsValidationError,
    SaucelabsServerError,
    SaucelabsConfigError,
    create_error_from_response,
)
```

### SaucelabsError (base class)

```python
class SaucelabsError(Exception):
    message: str
    status_code: int       # HTTP status code (0 for non-HTTP errors)
    response_body: Any
    headers: dict[str, str]
    endpoint: str
    method: str
```

**Constructor:**

```python
SaucelabsError(
    message: str,
    *,
    status_code: int = 0,
    response_body: Any = None,
    headers: Optional[dict[str, str]] = None,
    endpoint: str = "",
    method: str = "",
)
```

### Subclasses

| Class | HTTP Status | Description |
|---|---|---|
| `SaucelabsAuthError` | 401 | Missing or invalid credentials |
| `SaucelabsNotFoundError` | 404 | Resource not found |
| `SaucelabsRateLimitError` | 429 | Rate limit exceeded |
| `SaucelabsValidationError` | 400, 422 | Invalid request parameters |
| `SaucelabsServerError` | 5xx | Server-side failure |
| `SaucelabsConfigError` | 0 | Missing required configuration |

### SaucelabsRateLimitError

`SaucelabsRateLimitError` extends `SaucelabsError` with an additional property:

```python
class SaucelabsRateLimitError(SaucelabsError):
    retry_after: float  # Seconds to wait before retrying (default 1.0)
```

### create_error_from_response

```python
def create_error_from_response(
    status_code: int,
    body: Any,
    headers: dict[str, str],
) -> SaucelabsError:
    ...
```

Maps an HTTP response to the appropriate typed error subclass based on the status code. Parses `Retry-After` headers for 429 responses.

```python
>>> err = create_error_from_response(401, {"message": "Unauthorized"}, {})
>>> type(err).__name__
'SaucelabsAuthError'

>>> err = create_error_from_response(429, "Too many requests", {"retry-after": "60"})
>>> type(err).__name__
'SaucelabsRateLimitError'
>>> err.retry_after
60.0
```

---

## Rate Limiting

```python
from saucelabs_api.rate_limiter import RateLimiter
from saucelabs_api.types import RateLimitInfo
```

### RateLimiter

```python
class RateLimiter:
    def __init__(
        self,
        *,
        auto_wait: bool = True,
        max_retries: int = 5,
        on_rate_limit: Optional[Callable[[RateLimitInfo], bool]] = None,
        logger: Optional[Any] = None,
    ) -> None: ...
```

Reactive rate limiter that handles HTTP 429 responses by parsing `Retry-After`, optionally sleeping with exponential backoff, and retrying the original request.

**Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `auto_wait` | `bool` | `True` | Automatically sleep and retry on 429 responses. |
| `max_retries` | `int` | `5` | Maximum consecutive retries before raising. |
| `on_rate_limit` | `Optional[Callable]` | `None` | Callback invoked with `RateLimitInfo` on 429. Return `False` to suppress retry. |
| `logger` | `Optional[Any]` | `None` | Custom logger instance. |

#### Properties

```python
rate_limiter.last_rate_limit -> Optional[RateLimitInfo]
```

Returns the most recent `RateLimitInfo`, or `None`.

#### Methods

```python
async def handle_response(
    self,
    response: Any,
    retry_fn: Callable[[], Awaitable[Any]],
    retry_count: int = 0,
) -> Any
```

Processes an HTTP response. If the status is 429, parses rate-limit headers, optionally invokes `on_rate_limit`, sleeps for the `retry_after` duration (or calculates exponential backoff), and retries via `retry_fn`. Raises `SaucelabsRateLimitError` if `auto_wait` is `False`, the callback returns `False`, or `max_retries` is exceeded.

#### Static Methods

```python
@staticmethod
def _calculate_backoff(
    retry_count: int,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
) -> float
```

Computes exponential backoff with jitter. The result is clamped to `max_delay`.

```python
>>> RateLimiter._calculate_backoff(0)   # ~1.0-2.0s
>>> RateLimiter._calculate_backoff(1)   # ~2.0-3.0s
>>> RateLimiter._calculate_backoff(5)   # ~32.0-33.0s
>>> RateLimiter._calculate_backoff(10)  # 60.0s (clamped)
```

---

## Config

```python
from saucelabs_api.config import resolve_config, resolve_core_base_url, resolve_mobile_base_url
```

### resolve_config

```python
def resolve_config(**kwargs: Any) -> dict[str, Any]
```

Resolves a complete configuration dict from keyword arguments, environment variables, and defaults. Priority: kwargs > env vars > defaults.

Returns a dict with keys: `username`, `api_key`, `base_url`, `mobile_base_url`, `region`, `mobile_region`, `rate_limit_auto_wait`, `rate_limit_threshold`, `on_rate_limit`, `logger`, `timeout`, `proxy`, `verify_ssl`.

### resolve_core_base_url

```python
def resolve_core_base_url(
    region: str = "us-west-1",
    base_url_override: Optional[str] = None,
) -> str
```

Resolves the Core Automation base URL from a region string or an explicit override. Returns the override (trailing slash stripped) if provided, otherwise looks up the region in `CORE_REGIONS`.

```python
>>> resolve_core_base_url("eu-central-1")
'https://api.eu-central-1.saucelabs.com'

>>> resolve_core_base_url("us-west-1", "https://custom-proxy.example.com/")
'https://custom-proxy.example.com'
```

### resolve_mobile_base_url

```python
def resolve_mobile_base_url(
    mobile_region: str = "us-east",
    mobile_base_url_override: Optional[str] = None,
) -> str
```

Resolves the Mobile Distribution base URL from a region string or an explicit override. Returns the override (trailing slash stripped) if provided, otherwise looks up the region in `MOBILE_REGIONS`.

```python
>>> resolve_mobile_base_url("eu-central-1")
'https://mobile.eu-central-1.saucelabs.com'
```

---

## Logger

```python
from saucelabs_api.logger import create_logger, _redact_context
```

### create_logger

```python
def create_logger(package_name: str, filename: str) -> _Logger
```

Creates a structured logger namespaced to `package_name` and `filename`. Reads the `LOG_LEVEL` env var to determine output level.

```python
logger = create_logger("saucelabs_api", "client")
logger.info("Fetching jobs", {"username": "demo"})
logger.debug("Request details", {"url": "/rest/v1/demo/jobs"})
logger.error("Request failed", {"status": 500})
```

### _Logger

```python
class _Logger:
    def debug(self, message: str, context: Optional[dict] = None) -> None: ...
    def info(self, message: str, context: Optional[dict] = None) -> None: ...
    def warning(self, message: str, context: Optional[dict] = None) -> None: ...
    def error(self, message: str, context: Optional[dict] = None) -> None: ...
```

All logging methods accept an optional `context` dict which is serialized as structured context. Sensitive keys are automatically redacted.

Output format: `[package_name:filename] LEVEL message {context}`

### LoggerProtocol

```python
class LoggerProtocol(Protocol):
    def debug(self, message: str, context: Optional[dict] = None) -> None: ...
    def info(self, message: str, context: Optional[dict] = None) -> None: ...
    def warning(self, message: str, context: Optional[dict] = None) -> None: ...
    def error(self, message: str, context: Optional[dict] = None) -> None: ...
```

Structural type that any custom logger must satisfy to be passed to `SaucelabsClient`.

### Log Levels

```python
_LEVELS: dict = {
    "DEBUG": 10,
    "INFO": 20,
    "WARNING": 30,
    "ERROR": 40,
    "SILENT": 100,
}
```

Set via the `LOG_LEVEL` environment variable. Default: `"INFO"`.

### _redact_context

```python
def _redact_context(ctx: Optional[dict]) -> Optional[dict]
```

Returns a shallow copy of `ctx` with sensitive values replaced by `"[REDACTED]"`. Matches keys containing: `token`, `secret`, `password`, `key`, `auth`, `credential`, `access_key`, `api_key`.

```python
>>> _redact_context({"username": "demo", "api_key": "secret123"})
{'username': 'demo', 'api_key': '[REDACTED]'}
```

---

## Types

```python
from saucelabs_api.types import (
    RateLimitInfo,
    SaucelabsClientOptions,
    DEFAULT_BASE_URL,
    DEFAULT_MOBILE_BASE_URL,
    DEFAULT_TIMEOUT,
    CORE_REGIONS,
    MOBILE_REGIONS,
    AUTOMATION_API_VALUES,
    VALID_UPLOAD_EXTENSIONS,
    VENDOR,
    VENDOR_VERSION,
)
```

### RateLimitInfo

```python
from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class RateLimitInfo:
    retry_after: float
    remaining: Optional[int] = None
    limit: Optional[int] = None
    reset_at: Optional[str] = None
    timestamp: str = ""
```

Immutable snapshot of rate-limit state extracted from a 429 response.

### SaucelabsClientOptions

```python
@dataclass(slots=True)
class SaucelabsClientOptions:
    api_key: Optional[str] = None
    username: Optional[str] = None
    base_url: str = "https://api.us-west-1.saucelabs.com"
    mobile_base_url: str = "https://mobile.saucelabs.com"
    region: str = "us-west-1"
    mobile_region: str = "us-east"
    rate_limit_auto_wait: bool = True
    rate_limit_threshold: int = 0
    on_rate_limit: Optional[Callable] = None
    logger: Any = None
    timeout: float = 30.0
    proxy: Optional[str] = None
    verify_ssl: bool = True
```

Configuration dataclass accepted by `create_saucelabs_client(options=...)`.

### Constants

| Constant | Value | Description |
|---|---|---|
| `DEFAULT_BASE_URL` | `"https://api.us-west-1.saucelabs.com"` | Default Core Automation base URL |
| `DEFAULT_MOBILE_BASE_URL` | `"https://mobile.saucelabs.com"` | Default Mobile Distribution base URL |
| `DEFAULT_TIMEOUT` | `30.0` | Default request timeout in seconds |
| `VENDOR` | `"saucelabs_api"` | Package vendor identifier |
| `VENDOR_VERSION` | `"v1"` | Package vendor version |
| `AUTOMATION_API_VALUES` | `["all", "appium", "webdriver"]` | Valid values for `get_platforms()` |
| `VALID_UPLOAD_EXTENSIONS` | `[".apk", ".ipa", ".aab"]` | Valid mobile app file extensions |

### CORE_REGIONS

```python
CORE_REGIONS: dict[str, str] = {
    "us-west-1": "https://api.us-west-1.saucelabs.com",
    "us-east-4": "https://api.us-east-4.saucelabs.com",
    "eu-central-1": "https://api.eu-central-1.saucelabs.com",
}
```

### MOBILE_REGIONS

```python
MOBILE_REGIONS: dict[str, str] = {
    "us-east": "https://mobile.saucelabs.com",
    "eu-central-1": "https://mobile.eu-central-1.saucelabs.com",
}
```

---

## Convenience Factory

```python
from saucelabs_api import create_saucelabs_client, SaucelabsClientOptions
```

### create_saucelabs_client

```python
def create_saucelabs_client(
    options: Optional[SaucelabsClientOptions] = None,
    **kwargs: Any,
) -> SaucelabsClient
```

Creates a `SaucelabsClient` with all domain modules pre-attached (`.jobs`, `.platform`, `.users`, `.upload`).

**Usage with keyword arguments:**

```python
client = create_saucelabs_client(
    username="demo",
    api_key="xxx",
    region="us-west-1",
)
```

**Usage with options dataclass:**

```python
options = SaucelabsClientOptions(
    username="demo",
    api_key="xxx",
    region="eu-central-1",
    timeout=60.0,
)
client = create_saucelabs_client(options=options)
```

The returned client has the following modules attached:

```python
client.jobs      # JobsModule
client.platform  # PlatformModule
client.users     # UsersModule
client.upload    # UploadModule
```

When both `options` and keyword arguments are provided, keyword arguments take precedence over `options` fields.
