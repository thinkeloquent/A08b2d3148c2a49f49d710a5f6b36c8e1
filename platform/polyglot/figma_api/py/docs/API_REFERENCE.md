# Figma API Python SDK -- API Reference

> Python 3.11+ | Package: `figma_api` | Async-first with `httpx`

---

## Table of Contents

- [FigmaClient](#figmaclient)
- [Domain Clients](#domain-clients)
  - [FilesClient](#filesclient)
  - [ProjectsClient](#projectsclient)
  - [CommentsClient](#commentsclient)
  - [ComponentsClient](#componentsclient)
  - [VariablesClient](#variablesclient)
  - [WebhooksClient](#webhooksclient)
  - [DevResourcesClient](#devresourcesclient)
  - [LibraryAnalyticsClient](#libraryanalyticsclient)
- [Error Hierarchy](#error-hierarchy)
- [Auth](#auth)
- [Cache](#cache)
- [Rate Limiting](#rate-limiting)
- [Retry](#retry)
- [Config](#config)
- [Logger](#logger)

---

## FigmaClient

The core async HTTP client for all Figma API interactions.

### Constructor

```python
from figma_api import FigmaClient

client = FigmaClient(
    token: Optional[str] = None,
    base_url: str = "https://api.figma.com",
    timeout: int = 30,
    max_retries: int = 3,
    rate_limit_auto_wait: bool = True,
    rate_limit_threshold: int = 0,
    on_rate_limit: Optional[Callable[[RateLimitInfo], Optional[bool]]] = None,
    logger: Optional[SDKLogger] = None,
    cache_max_size: int = 100,
    cache_ttl: int = 300,
)
```

**Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `token` | `Optional[str]` | `None` | Figma API token. Falls back to `FIGMA_TOKEN` then `FIGMA_ACCESS_TOKEN` env vars. |
| `base_url` | `str` | `"https://api.figma.com"` | Base URL for the Figma API. |
| `timeout` | `int` | `30` | Request timeout in seconds. |
| `max_retries` | `int` | `3` | Maximum retry attempts for retryable failures. |
| `rate_limit_auto_wait` | `bool` | `True` | Automatically wait and retry on 429 responses. |
| `rate_limit_threshold` | `int` | `0` | Minimum seconds threshold before auto-waiting on rate limits. |
| `on_rate_limit` | `Optional[Callable[[RateLimitInfo], Optional[bool]]]` | `None` | Callback invoked on rate limit. Return `False` to suppress retry. |
| `logger` | `Optional[SDKLogger]` | `None` | Custom logger instance. |
| `cache_max_size` | `int` | `100` | Maximum number of cached GET responses. |
| `cache_ttl` | `int` | `300` | Cache time-to-live in seconds. |

### Async Methods

```python
await client.get(path: str, *, params: Optional[dict] = None) -> dict
```

Sends an authenticated GET request. Results for GET requests are cached according to `cache_max_size` and `cache_ttl`.

```python
await client.post(path: str, body: Optional[dict] = None, **kwargs) -> dict
```

Sends an authenticated POST request with a JSON body.

```python
await client.put(path: str, body: Optional[dict] = None, **kwargs) -> dict
```

Sends an authenticated PUT request with a JSON body.

```python
await client.patch(path: str, body: Optional[dict] = None, **kwargs) -> dict
```

Sends an authenticated PATCH request with a JSON body.

```python
await client.delete(path: str, **kwargs) -> dict
```

Sends an authenticated DELETE request.

```python
await client.get_raw(path: str, *, params: Optional[dict] = None) -> httpx.Response
```

Sends a GET request and returns the raw `httpx.Response` object without JSON parsing or caching.

```python
await client.close() -> None
```

Closes the underlying `httpx.AsyncClient` and releases resources.

### Context Manager

```python
async with FigmaClient(token="fig_...") as client:
    result = await client.get("/v1/files/abc123")
```

Using `FigmaClient` as an async context manager ensures the underlying HTTP client is properly closed on exit.

### Properties

```python
client.stats -> dict
```

Returns runtime statistics:

```python
{
    "requests_made": int,
    "requests_failed": int,
    "cache_hits": int,
    "cache_misses": int,
    "rate_limit_waits": int,
    "rate_limit_total_wait_seconds": float,
    "cache": CacheStats,  # CacheStats(hits=int, misses=int, size=int)
}
```

```python
client.last_rate_limit -> Optional[RateLimitInfo]
```

Returns the most recent `RateLimitInfo` if a 429 response was encountered, otherwise `None`.

---

## Domain Clients

All domain clients share the same constructor signature:

```python
DomainClient(client: FigmaClient, *, logger: Optional[SDKLogger] = None)
```

They wrap `FigmaClient` methods with Figma-API-specific paths and parameter handling.

---

### FilesClient

```python
from figma_api import FigmaClient
from figma_api.clients.files import FilesClient

client = FigmaClient(token="fig_...")
files = FilesClient(client)
```

#### Methods

```python
await files.get_file(
    file_key: str,
    *,
    version: Optional[str] = None,
    ids: Optional[List[str]] = None,
    depth: Optional[int] = None,
    geometry: Optional[str] = None,
    plugin_data: Optional[str] = None,
) -> dict
```

Retrieves a Figma file by key. Optional parameters filter the response.

```python
await files.get_file_nodes(
    file_key: str,
    ids: List[str],
    *,
    version: Optional[str] = None,
    depth: Optional[int] = None,
    geometry: Optional[str] = None,
    plugin_data: Optional[str] = None,
) -> dict
```

Retrieves specific nodes from a Figma file. `ids` is required.

```python
await files.get_images(
    file_key: str,
    ids: List[str],
    *,
    scale: Optional[float] = None,
    format: Optional[str] = None,
    svg_options: Optional[dict] = None,
) -> dict
```

Renders images from a file. `ids` specifies which nodes to render. `format` accepts `"png"`, `"jpg"`, `"svg"`, or `"pdf"`.

```python
await files.get_image_fills(file_key: str) -> dict
```

Returns download URLs for all images in a file.

```python
await files.get_file_versions(file_key: str) -> dict
```

Lists version history for a file.

---

### ProjectsClient

```python
from figma_api.clients.projects import ProjectsClient

projects = ProjectsClient(client)
```

#### Methods

```python
await projects.get_team_projects(team_id: str) -> dict
```

Lists all projects for a team.

```python
await projects.get_project_files(
    project_id: str,
    *,
    branch_data: bool = False,
) -> dict
```

Lists all files in a project. Set `branch_data=True` to include branch metadata.

---

### CommentsClient

```python
from figma_api.clients.comments import CommentsClient

comments = CommentsClient(client)
```

#### Methods

```python
await comments.list_comments(
    file_key: str,
    *,
    as_md: Optional[bool] = None,
) -> dict
```

Lists all comments on a file. Set `as_md=True` to return comment bodies as Markdown.

```python
await comments.add_comment(
    file_key: str,
    *,
    message: str,
    client_meta: Optional[dict] = None,
    comment_id: Optional[str] = None,
) -> dict
```

Adds a comment to a file. Provide `comment_id` to reply to an existing comment. `client_meta` specifies the position on the canvas.

```python
await comments.delete_comment(file_key: str, comment_id: str) -> dict
```

Deletes a comment by ID.

---

### ComponentsClient

```python
from figma_api.clients.components import ComponentsClient

components = ComponentsClient(client)
```

#### Methods

```python
await components.get_component(key: str) -> dict
```

Retrieves metadata for a single published component.

```python
await components.get_file_components(file_key: str) -> dict
```

Lists all components in a file.

```python
await components.get_team_components(
    team_id: str,
    *,
    page_size: Optional[int] = None,
    cursor: Optional[str] = None,
) -> dict
```

Lists published components for a team. Supports cursor-based pagination.

```python
await components.get_component_set(key: str) -> dict
```

Retrieves metadata for a component set (variant group).

```python
await components.get_team_component_sets(
    team_id: str,
    *,
    page_size: Optional[int] = None,
    cursor: Optional[str] = None,
) -> dict
```

Lists published component sets for a team.

```python
await components.get_team_styles(
    team_id: str,
    *,
    page_size: Optional[int] = None,
    cursor: Optional[str] = None,
) -> dict
```

Lists published styles for a team.

```python
await components.get_style(key: str) -> dict
```

Retrieves metadata for a single published style.

---

### VariablesClient

```python
from figma_api.clients.variables import VariablesClient

variables = VariablesClient(client)
```

#### Methods

```python
await variables.get_local_variables(file_key: str) -> dict
```

Returns all local variables defined in a file.

```python
await variables.get_published_variables(file_key: str) -> dict
```

Returns published variables for a file (available to consumers of the library).

```python
await variables.create_variables(file_key: str, payload: dict) -> dict
```

Creates or updates variables in a file. The `payload` follows the Figma Variables API schema.

---

### WebhooksClient

```python
from figma_api.clients.webhooks import WebhooksClient

webhooks = WebhooksClient(client)
```

#### Methods

```python
await webhooks.get_webhook(webhook_id: str) -> dict
```

Retrieves a webhook by ID.

```python
await webhooks.list_team_webhooks(team_id: str) -> dict
```

Lists all webhooks for a team.

```python
await webhooks.create_webhook(
    team_id: str,
    *,
    event_type: str,
    endpoint: str,
    passcode: Optional[str] = None,
    status: Optional[str] = None,
    description: Optional[str] = None,
) -> dict
```

Creates a new webhook for a team. `event_type` values include `"FILE_UPDATE"`, `"FILE_DELETE"`, `"FILE_VERSION_UPDATE"`, `"LIBRARY_PUBLISH"`, etc.

```python
await webhooks.update_webhook(webhook_id: str, payload: dict) -> dict
```

Updates an existing webhook.

```python
await webhooks.delete_webhook(webhook_id: str) -> dict
```

Deletes a webhook.

```python
await webhooks.get_webhook_requests(webhook_id: str) -> dict
```

Returns recent delivery attempts for a webhook.

---

### DevResourcesClient

```python
from figma_api.clients.dev_resources import DevResourcesClient

dev_resources = DevResourcesClient(client)
```

Follows the same async pattern as other domain clients for managing dev resources attached to Figma nodes.

---

### LibraryAnalyticsClient

```python
from figma_api.clients.library_analytics import LibraryAnalyticsClient

analytics = LibraryAnalyticsClient(client)
```

Follows the same async pattern as other domain clients for retrieving library usage analytics.

---

## Error Hierarchy

All errors inherit from `FigmaError`. Import from `figma_api.errors`.

```python
from figma_api.errors import (
    FigmaError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ValidationError,
    RateLimitError,
    ApiError,
    ServerError,
    NetworkError,
    TimeoutError,
    ConfigurationError,
    map_response_to_error,
)
```

### FigmaError (base class)

```python
class FigmaError(Exception):
    message: str
    status: int
    code: str
    name: str
    meta: Optional[dict]
    request_id: Optional[str]
    timestamp: str

    def to_dict(self) -> dict: ...
```

### Subclasses

| Class | HTTP Status | Code Constant |
|---|---|---|
| `AuthenticationError` | 401 | `AUTHENTICATION_ERROR` |
| `AuthorizationError` | 403 | `AUTHORIZATION_ERROR` |
| `NotFoundError` | 404 | `NOT_FOUND` |
| `ValidationError` | 422 | `VALIDATION_ERROR` |
| `RateLimitError` | 429 | `RATE_LIMIT_ERROR` |
| `ApiError` | 4xx (other) | `API_ERROR` |
| `ServerError` | 5xx | `SERVER_ERROR` |
| `NetworkError` | 0 | `NETWORK_ERROR` |
| `TimeoutError` | 408 | `TIMEOUT_ERROR` |
| `ConfigurationError` | 0 | `CONFIGURATION_ERROR` |

### RateLimitError

`RateLimitError` extends `FigmaError` with an additional property:

```python
class RateLimitError(FigmaError):
    rate_limit_info: Optional[RateLimitInfo]
```

### map_response_to_error

```python
def map_response_to_error(
    status: int,
    body: dict,
    headers: dict,
) -> FigmaError:
    ...
```

Maps an HTTP response to the appropriate typed error subclass based on the status code.

---

## Auth

```python
from figma_api.auth import resolve_token, mask_token, AuthError, TokenInfo
```

### TokenInfo

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class TokenInfo:
    token: str
    source: str  # "explicit" | "env:FIGMA_TOKEN" | "env:FIGMA_ACCESS_TOKEN"
```

### resolve_token

```python
def resolve_token(explicit: Optional[str] = None) -> TokenInfo
```

Resolves a Figma API token using the following precedence:

1. `explicit` parameter (if provided) -- source: `"explicit"`
2. `FIGMA_TOKEN` environment variable -- source: `"env:FIGMA_TOKEN"`
3. `FIGMA_ACCESS_TOKEN` environment variable -- source: `"env:FIGMA_ACCESS_TOKEN"`

Raises `AuthError` if no token is found.

### mask_token

```python
def mask_token(token: str) -> str
```

Masks a token for safe logging. Returns the first 8 characters followed by `"***"` if the token is longer than 8 characters, otherwise returns `"***"`.

```python
>>> mask_token("figd_abcdefghijklmnop")
'figd_abc***'
>>> mask_token("short")
'***'
```

### AuthError

```python
class AuthError(Exception):
    status: int  # 401
```

Raised when no token can be resolved from any source.

---

## Cache

```python
from figma_api.cache import RequestCache, CacheStats
```

### CacheStats

```python
from typing import NamedTuple

class CacheStats(NamedTuple):
    hits: int
    misses: int
    size: int
```

### RequestCache

```python
class RequestCache:
    def __init__(
        self,
        max_size: int = 100,
        ttl: int = 300,
    ) -> None: ...
```

LRU cache with time-to-live expiration for GET request responses.

**Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `max_size` | `int` | `100` | Maximum number of entries. Oldest entries evicted when full. |
| `ttl` | `int` | `300` | Time-to-live in seconds. Expired entries are evicted on access. |

#### Methods

```python
def get(self, key: str) -> Optional[dict]
```

Returns the cached value for `key`, or `None` if not found or expired.

```python
def set(self, key: str, data: dict) -> None
```

Stores `data` under `key`. Evicts the oldest entry if the cache is at capacity.

```python
def has(self, key: str) -> bool
```

Returns `True` if `key` exists in the cache and has not expired.

```python
def clear(self) -> None
```

Removes all entries from the cache and resets statistics.

#### Properties

```python
@property
def stats(self) -> CacheStats
```

Returns current cache statistics as a `CacheStats` named tuple.

---

## Rate Limiting

```python
from figma_api.rate_limit import (
    parse_rate_limit_headers,
    handle_rate_limit,
    should_auto_wait,
    wait_for_retry_after,
    RateLimitInfo,
    RateLimitOptions,
)
```

### RateLimitInfo

```python
from dataclasses import dataclass

@dataclass
class RateLimitInfo:
    retry_after: float           # Seconds to wait before retrying
    plan_tier: Optional[str]     # Figma plan tier from headers
    rate_limit_type: Optional[str]
    upgrade_link: Optional[str]
    timestamp: str               # ISO 8601 timestamp
```

### RateLimitOptions

```python
@dataclass
class RateLimitOptions:
    auto_wait: bool = True
    threshold: int = 0
    on_rate_limit: Optional[Callable[[RateLimitInfo], Optional[bool]]] = None
```

### Functions

```python
def parse_rate_limit_headers(headers: dict) -> RateLimitInfo
```

Parses `Retry-After` and related headers from a 429 response into a `RateLimitInfo`.

```python
async def handle_rate_limit(
    headers: dict,
    options: RateLimitOptions,
) -> dict
```

Processes a rate limit response. Returns `{"retry": bool, "rate_limit_info": RateLimitInfo}`. If `options.auto_wait` is `True` and the wait is above `options.threshold`, it will sleep for the `retry_after` duration. If `options.on_rate_limit` is set, the callback is invoked and may return `False` to suppress the retry.

```python
def should_auto_wait(info: RateLimitInfo, options: RateLimitOptions) -> bool
```

Determines whether the client should auto-wait based on the `retry_after` value and configured threshold.

```python
async def wait_for_retry_after(seconds: float) -> None
```

Awaits `asyncio.sleep(seconds)`.

---

## Retry

```python
from figma_api.retry import calculate_backoff, is_retryable, with_retry
```

### calculate_backoff

```python
def calculate_backoff(
    attempt: int,
    initial_wait: float = 1.0,
    max_wait: float = 30.0,
) -> float
```

Computes exponential backoff delay in seconds for the given attempt number. The result is clamped to `max_wait`.

```python
>>> calculate_backoff(0)
1.0
>>> calculate_backoff(1)
2.0
>>> calculate_backoff(5)
30.0  # clamped to max_wait
```

### is_retryable

```python
def is_retryable(status: int) -> bool
```

Returns `True` if the HTTP status code is retryable. Only 5xx status codes are retryable.

```python
>>> is_retryable(500)
True
>>> is_retryable(429)
False  # rate limits handled separately
>>> is_retryable(404)
False
```

### with_retry

```python
async def with_retry(
    fn: Callable[..., Awaitable[T]],
    max_retries: int = 3,
    initial_wait: float = 1.0,
    max_wait: float = 30.0,
) -> T
```

Executes `fn` with automatic retry on retryable failures. Uses exponential backoff between attempts.

---

## Config

```python
from figma_api.config import Config, DEFAULTS
```

### DEFAULTS

```python
DEFAULTS: dict = {
    "base_url": "https://api.figma.com",
    "timeout": 30,
    "max_retries": 3,
    "rate_limit_auto_wait": True,
    "rate_limit_threshold": 0,
    "cache_max_size": 100,
    "cache_ttl": 300,
    "log_level": "INFO",
    "port": 8000,
    "host": "0.0.0.0",
}
```

### Config

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Config:
    figma_token: Optional[str]
    base_url: str
    log_level: str
    port: int
    host: str
    rate_limit_auto_wait: bool
    rate_limit_threshold: int
    timeout: int
    cache_max_size: int
    cache_ttl: int
    max_retries: int

    @classmethod
    def from_env(cls) -> "Config": ...
```

### Config.from_env

```python
config = Config.from_env()
```

Populates a `Config` instance from environment variables, falling back to `DEFAULTS`:

| Field | Env Var | Default |
|---|---|---|
| `figma_token` | `FIGMA_TOKEN` / `FIGMA_ACCESS_TOKEN` | `None` |
| `base_url` | `FIGMA_API_BASE_URL` | `"https://api.figma.com"` |
| `log_level` | `LOG_LEVEL` | `"INFO"` |
| `port` | `PORT` | `8000` |
| `host` | `HOST` | `"0.0.0.0"` |
| `timeout` | `FIGMA_TIMEOUT` | `30` |
| `max_retries` | `MAX_RETRIES` | `3` |
| `rate_limit_auto_wait` | `RATE_LIMIT_AUTO_WAIT` | `True` |
| `rate_limit_threshold` | `RATE_LIMIT_THRESHOLD` | `0` |
| `cache_max_size` | `CACHE_MAX_SIZE` | `100` |
| `cache_ttl` | `CACHE_TTL` | `300` |

---

## Logger

```python
from figma_api.logger import create_logger, SDKLogger, LEVELS, REDACT_KEYS
```

### create_logger

```python
def create_logger(package_name: str, filename: str) -> SDKLogger
```

Creates an `SDKLogger` instance bound to a named package and output file.

### SDKLogger

```python
class SDKLogger:
    def trace(self, msg: str, **kwargs) -> None: ...
    def debug(self, msg: str, **kwargs) -> None: ...
    def info(self, msg: str, **kwargs) -> None: ...
    def warn(self, msg: str, **kwargs) -> None: ...
    def warning(self, msg: str, **kwargs) -> None: ...
    def error(self, msg: str, **kwargs) -> None: ...
    def critical(self, msg: str, **kwargs) -> None: ...
    def set_level(self, level_name: str) -> None: ...
```

All logging methods accept `**kwargs` which are serialized as structured context. Sensitive keys are automatically redacted.

### LEVELS

```python
LEVELS: dict = {
    "TRACE": 5,
    "DEBUG": 10,
    "INFO": 20,
    "WARN": 30,
    "WARNING": 30,
    "ERROR": 40,
    "CRITICAL": 50,
}
```

### REDACT_KEYS

```python
REDACT_KEYS: set = {
    "token",
    "secret",
    "password",
    "auth",
    "credential",
    "authorization",
    "apikey",
    "api_key",
    "accesstoken",
    "access_token",
}
```

Any keyword argument whose key (lowercased) matches a member of `REDACT_KEYS` will have its value replaced by a masked form.

### _redact_value

```python
def _redact_value(key: str, value: str) -> str
```

Internal helper. If `value` is longer than 8 characters, returns the first 8 characters followed by `"***"`. Otherwise returns `"***"`.
