# Figma API SDK -- Complete API Reference

> Polyglot SDK providing identical Figma API coverage in **JavaScript/TypeScript** and **Python**.
> JavaScript signatures are shown first, followed by Python equivalents.

---

## Table of Contents

1. [FigmaClient (Core HTTP Client)](#figmaclient-core-http-client)
2. [Domain Clients](#domain-clients)
   - [FilesClient](#filesclient)
   - [ProjectsClient](#projectsclient)
   - [CommentsClient](#commentsclient)
   - [ComponentsClient](#componentsclient)
   - [VariablesClient](#variablesclient)
   - [WebhooksClient](#webhooksclient)
   - [DevResourcesClient](#devresourcesclient)
   - [LibraryAnalyticsClient](#libraryanalyticsclient)
3. [Error Hierarchy](#error-hierarchy)
4. [Auth](#auth)
5. [Cache (RequestCache)](#cache-requestcache)
6. [Rate Limiting](#rate-limiting)
7. [Retry](#retry)
8. [Config](#config)
9. [Logger](#logger)
10. [Server](#server)
11. [Routes](#routes)
12. [Environment Variables](#environment-variables)

---

## FigmaClient (Core HTTP Client)

The central HTTP client that handles authentication, retries, rate limiting, caching, and request dispatch.

### Constructor

**JavaScript / TypeScript**

```typescript
import { FigmaClient } from '@internal/figma-api';

const client = new FigmaClient(options?: {
  token?: string;              // Falls back to FIGMA_TOKEN / FIGMA_ACCESS_TOKEN env
  baseUrl?: string;            // Default: "https://api.figma.com"
  timeout?: number;            // Milliseconds. Default: 30000
  maxRetries?: number;         // Default: 3
  rateLimitAutoWait?: boolean; // Default: true
  rateLimitThreshold?: number; // Default: 0
  onRateLimit?: (info: RateLimitInfo) => boolean | void;
  logger?: LoggerInstance;
  cache?: { maxSize: number; ttl: number };
});
```

**Python**

```python
from figma_api import FigmaClient

client = FigmaClient(
    token: Optional[str] = None,              # Falls back to FIGMA_TOKEN / FIGMA_ACCESS_TOKEN env
    base_url: str = "https://api.figma.com",
    timeout: int = 30,                        # Seconds (not milliseconds)
    max_retries: int = 3,
    rate_limit_auto_wait: bool = True,
    rate_limit_threshold: int = 0,
    on_rate_limit: Optional[Callable[[RateLimitInfo], Optional[bool]]] = None,
    logger: Optional[LoggerInstance] = None,
    cache_max_size: int = 100,
    cache_ttl: int = 300,                     # Seconds
)
```

### Methods

All methods are asynchronous. JavaScript returns `Promise<T>`, Python uses `async def`.

| Method | JavaScript | Python |
|--------|-----------|--------|
| GET | `await client.get(path: string, options?: { params?: Record<string, any> }): Promise<any>` | `await client.get(path: str, *, params: Optional[dict] = None) -> Any` |
| POST | `await client.post(path: string, body?: any, options?: RequestOptions): Promise<any>` | `await client.post(path: str, body: Any = None, **kwargs) -> Any` |
| PUT | `await client.put(path: string, body?: any, options?: RequestOptions): Promise<any>` | `await client.put(path: str, body: Any = None, **kwargs) -> Any` |
| PATCH | `await client.patch(path: string, body?: any, options?: RequestOptions): Promise<any>` | `await client.patch(path: str, body: Any = None, **kwargs) -> Any` |
| DELETE | `await client.delete(path: string, options?: RequestOptions): Promise<any>` | `await client.delete(path: str, **kwargs) -> Any` |
| GET (raw) | `await client.getRaw(path: string, options?: { params?: Record<string, any> }): Promise<Response>` | `await client.get_raw(path: str, *, params: Optional[dict] = None) -> httpx.Response` |
| Close | N/A (manual lifecycle) | `await client.close() -> None` |

### Properties

| Property | JavaScript | Python |
|----------|-----------|--------|
| Stats | `client.stats: { requestsMade, requestsFailed, cacheHits, cacheMisses, rateLimitWaits, rateLimitTotalWaitSeconds, cache }` | `client.stats: dict` (keys: `requests_made`, `requests_failed`, `cache_hits`, `cache_misses`, `rate_limit_waits`, `rate_limit_total_wait_seconds`, `cache`) |
| Last Rate Limit | `client.lastRateLimit: RateLimitInfo \| null` | `client.last_rate_limit: Optional[RateLimitInfo]` |

### Context Manager (Python only)

```python
async with FigmaClient(token="fig_...") as client:
    result = await client.get("/v1/files/abc123")
# client.close() called automatically
```

JavaScript has no context manager equivalent; the client lifecycle is managed manually.

---

## Domain Clients

All domain clients accept a `FigmaClient` instance as their sole constructor argument.

```typescript
// JavaScript
import { FigmaClient, FilesClient } from '@internal/figma-api';
const client = new FigmaClient({ token: "fig_..." });
const files = new FilesClient(client);
```

```python
# Python
from figma_api import FigmaClient, FilesClient
client = FigmaClient(token="fig_...")
files = FilesClient(client)
```

---

### FilesClient

Interact with Figma files, nodes, images, and versions.

| Operation | JavaScript | Python |
|-----------|-----------|--------|
| Get file | `getFile(fileKey: string, options?: { version?: string; ids?: string[]; depth?: number; geometry?: string; pluginData?: string }): Promise<FileResponse>` | `get_file(file_key: str, *, version: Optional[str] = None, ids: Optional[list[str]] = None, depth: Optional[int] = None, geometry: Optional[str] = None, plugin_data: Optional[str] = None) -> dict` |
| Get file nodes | `getFileNodes(fileKey: string, ids: string[], options?: { version?: string; depth?: number; geometry?: string; pluginData?: string }): Promise<FileNodesResponse>` | `get_file_nodes(file_key: str, ids: list[str], *, version: Optional[str] = None, depth: Optional[int] = None, geometry: Optional[str] = None, plugin_data: Optional[str] = None) -> dict` |
| Get images | `getImages(fileKey: string, ids: string[], options?: { scale?: number; format?: string; svgOptions?: SvgOptions }): Promise<ImagesResponse>` | `get_images(file_key: str, ids: list[str], *, scale: Optional[float] = None, format: Optional[str] = None, svg_options: Optional[dict] = None) -> dict` |
| Get image fills | `getImageFills(fileKey: string): Promise<ImageFillsResponse>` | `get_image_fills(file_key: str) -> dict` |
| Get file versions | `getFileVersions(fileKey: string): Promise<FileVersionsResponse>` | `get_file_versions(file_key: str) -> dict` |

---

### ProjectsClient

Interact with teams and project file listings.

| Operation | JavaScript | Python |
|-----------|-----------|--------|
| Get team projects | `getTeamProjects(teamId: string): Promise<TeamProjectsResponse>` | `get_team_projects(team_id: str) -> dict` |
| Get project files | `getProjectFiles(projectId: string, options?: { branchData?: boolean }): Promise<ProjectFilesResponse>` | `get_project_files(project_id: str, *, branch_data: bool = False) -> dict` |

---

### CommentsClient

Create, list, and delete comments on Figma files.

| Operation | JavaScript | Python |
|-----------|-----------|--------|
| List comments | `listComments(fileKey: string, options?: { as_md?: boolean }): Promise<CommentsResponse>` | `list_comments(file_key: str, *, as_md: Optional[bool] = None) -> dict` |
| Add comment | `addComment(fileKey: string, payload: { message: string; clientMeta?: ClientMeta; commentId?: string }): Promise<CommentResponse>` | `add_comment(file_key: str, *, message: str, client_meta: Optional[dict] = None, comment_id: Optional[str] = None) -> dict` |
| Delete comment | `deleteComment(fileKey: string, commentId: string): Promise<void>` | `delete_comment(file_key: str, comment_id: str) -> None` |

---

### ComponentsClient

Access components, component sets, and styles across files and teams.

| Operation | JavaScript | Python |
|-----------|-----------|--------|
| Get component | `getComponent(key: string): Promise<ComponentResponse>` | `get_component(key: str) -> dict` |
| Get file components | `getFileComponents(fileKey: string): Promise<FileComponentsResponse>` | `get_file_components(file_key: str) -> dict` |
| Get team components | `getTeamComponents(teamId: string, options?: { pageSize?: number; cursor?: string }): Promise<TeamComponentsResponse>` | `get_team_components(team_id: str, *, page_size: Optional[int] = None, cursor: Optional[str] = None) -> dict` |
| Get component set | `getComponentSet(key: string): Promise<ComponentSetResponse>` | `get_component_set(key: str) -> dict` |
| Get team component sets | `getTeamComponentSets(teamId: string, options?: { pageSize?: number; cursor?: string }): Promise<TeamComponentSetsResponse>` | `get_team_component_sets(team_id: str, *, page_size: Optional[int] = None, cursor: Optional[str] = None) -> dict` |
| Get team styles | `getTeamStyles(teamId: string, options?: { pageSize?: number; cursor?: string }): Promise<TeamStylesResponse>` | `get_team_styles(team_id: str, *, page_size: Optional[int] = None, cursor: Optional[str] = None) -> dict` |
| Get style | `getStyle(key: string): Promise<StyleResponse>` | `get_style(key: str) -> dict` |

---

### VariablesClient

Manage local and published variables in Figma files.

| Operation | JavaScript | Python |
|-----------|-----------|--------|
| Get local variables | `getLocalVariables(fileKey: string): Promise<VariablesResponse>` | `get_local_variables(file_key: str) -> dict` |
| Get published variables | `getPublishedVariables(fileKey: string): Promise<VariablesResponse>` | `get_published_variables(file_key: str) -> dict` |
| Create variables | `createVariables(fileKey: string, payload: CreateVariablesPayload): Promise<VariablesResponse>` | `create_variables(file_key: str, payload: dict) -> dict` |

---

### WebhooksClient

Manage webhooks for Figma team event notifications.

| Operation | JavaScript | Python |
|-----------|-----------|--------|
| Get webhook | `getWebhook(webhookId: string): Promise<WebhookResponse>` | `get_webhook(webhook_id: str) -> dict` |
| List team webhooks | `listTeamWebhooks(teamId: string): Promise<WebhooksResponse>` | `list_team_webhooks(team_id: str) -> dict` |
| Create webhook | `createWebhook(teamId: string, payload: { eventType: string; endpoint: string; passcode?: string; status?: string; description?: string }): Promise<WebhookResponse>` | `create_webhook(team_id: str, *, event_type: str, endpoint: str, passcode: Optional[str] = None, status: Optional[str] = None, description: Optional[str] = None) -> dict` |
| Update webhook | `updateWebhook(webhookId: string, payload: UpdateWebhookPayload): Promise<WebhookResponse>` | `update_webhook(webhook_id: str, payload: dict) -> dict` |
| Delete webhook | `deleteWebhook(webhookId: string): Promise<void>` | `delete_webhook(webhook_id: str) -> None` |
| Get webhook requests | `getWebhookRequests(webhookId: string): Promise<WebhookRequestsResponse>` | `get_webhook_requests(webhook_id: str) -> dict` |

---

### DevResourcesClient

Manage developer resources attached to Figma files.

| Operation | JavaScript | Python |
|-----------|-----------|--------|
| Get dev resources | `getDevResources(fileKey: string): Promise<DevResourcesResponse>` | `get_dev_resources(file_key: str) -> dict` |
| Create dev resource | `createDevResource(fileKey: string, payload: CreateDevResourcePayload): Promise<DevResourceResponse>` | `create_dev_resource(file_key: str, payload: dict) -> dict` |
| Update dev resource | `updateDevResource(fileKey: string, payload: UpdateDevResourcePayload): Promise<DevResourceResponse>` | `update_dev_resource(file_key: str, payload: dict) -> dict` |
| Delete dev resource | `deleteDevResource(fileKey: string, devResourceId: string): Promise<void>` | `delete_dev_resource(file_key: str, dev_resource_id: str) -> None` |

---

### LibraryAnalyticsClient

Access library analytics for component and style usage.

| Operation | JavaScript | Python |
|-----------|-----------|--------|
| Get component actions | `getComponentActions(fileKey: string, options?: PaginationOptions): Promise<AnalyticsResponse>` | `get_component_actions(file_key: str, **kwargs) -> dict` |
| Get component usages | `getComponentUsages(fileKey: string, options?: PaginationOptions): Promise<AnalyticsResponse>` | `get_component_usages(file_key: str, **kwargs) -> dict` |
| Get style actions | `getStyleActions(fileKey: string, options?: PaginationOptions): Promise<AnalyticsResponse>` | `get_style_actions(file_key: str, **kwargs) -> dict` |
| Get style usages | `getStyleUsages(fileKey: string, options?: PaginationOptions): Promise<AnalyticsResponse>` | `get_style_usages(file_key: str, **kwargs) -> dict` |

---

## Error Hierarchy

Both languages implement an identical error class hierarchy rooted at `FigmaError`.

```
FigmaError (base)
  +-- AuthenticationError    (HTTP 401, code: AUTHENTICATION_ERROR)
  +-- AuthorizationError     (HTTP 403, code: AUTHORIZATION_ERROR)
  +-- NotFoundError          (HTTP 404, code: NOT_FOUND)
  +-- ValidationError        (HTTP 422, code: VALIDATION_ERROR)
  +-- RateLimitError         (HTTP 429, code: RATE_LIMIT_ERROR)
  +-- ApiError               (HTTP 4xx, code: API_ERROR)
  +-- ServerError            (HTTP 5xx, code: SERVER_ERROR)
  +-- NetworkError           (HTTP 0,   code: NETWORK_ERROR)
  +-- TimeoutError           (HTTP 408, code: TIMEOUT_ERROR)
  +-- ConfigurationError     (HTTP 0,   code: CONFIGURATION_ERROR)
```

### Common Error Properties

| Property | JavaScript | Python |
|----------|-----------|--------|
| Message | `error.message: string` | `error.message: str` |
| HTTP Status | `error.status: number` | `error.status: int` |
| Error Code | `error.code: string` | `error.code: str` |
| Error Name | `error.name: string` | `error.name: str` |
| Metadata | `error.meta: Record<string, any>` | `error.meta: dict` |
| Request ID | `error.requestId: string \| undefined` | `error.request_id: Optional[str]` |
| Timestamp | `error.timestamp: string` | `error.timestamp: str` |

### Serialization

**JavaScript**

```typescript
try {
  await client.get('/v1/files/invalid');
} catch (err) {
  if (err instanceof NotFoundError) {
    console.log(err.toJSON());
    // { name, message, status, code, requestId, meta, timestamp }
  }
}
```

**Python**

```python
from figma_api import NotFoundError

try:
    await client.get('/v1/files/invalid')
except NotFoundError as err:
    print(err.to_dict())
    # { "name", "message", "status", "code", "request_id", "meta", "timestamp" }
```

### Error Mapping

| Function | JavaScript | Python |
|----------|-----------|--------|
| Map response to error | `mapResponseToError(status: number, body: any, headers: Headers): FigmaError` | `map_response_to_error(status: int, body: Any, headers: dict) -> FigmaError` |

### RateLimitError Special Handling

- **JavaScript**: Rate limit metadata is stored in `error.meta.rateLimitInfo` as a plain object with camelCase keys.
- **Python**: Rate limit metadata is passed via the `rate_limit_info` keyword argument and stored as a `RateLimitInfo` dataclass with snake_case attributes.

---

## Auth

Token resolution and masking utilities.

### Token Resolution

Both implementations resolve tokens in the same priority order:
1. Explicitly provided token argument
2. `FIGMA_TOKEN` environment variable
3. `FIGMA_ACCESS_TOKEN` environment variable

**JavaScript**

```typescript
import { resolveToken, maskToken, AuthError } from '@internal/figma-api';

const { token, source } = resolveToken(explicitToken?: string);
// source is "explicit", "FIGMA_TOKEN", or "FIGMA_ACCESS_TOKEN"

const masked = maskToken("figd_abc123xyz");
// "figd_abc...xyz"
```

**Python**

```python
from figma_api import resolve_token, mask_token, AuthError

info: TokenInfo = resolve_token(explicit=None)
# info.token: str, info.source: str ("explicit", "FIGMA_TOKEN", or "FIGMA_ACCESS_TOKEN")

masked: str = mask_token("figd_abc123xyz")
# "figd_abc...xyz"
```

### AuthError

Raised/thrown when no token can be resolved.

| Language | Class | Parent |
|----------|-------|--------|
| JavaScript | `AuthError extends Error` | `Error` |
| Python | `AuthError(Exception)` | `Exception` |

---

## Cache (RequestCache)

In-memory LRU-style cache with TTL expiration for GET request responses.

### Constructor

**JavaScript**

```typescript
import { RequestCache } from '@internal/figma-api';

const cache = new RequestCache({
  maxSize: 100,  // Maximum cached entries
  ttl: 300,      // Time-to-live in seconds
});
```

**Python**

```python
from figma_api import RequestCache

cache = RequestCache(
    max_size=100,  # Maximum cached entries
    ttl=300,       # Time-to-live in seconds
)
```

### Methods

| Method | JavaScript | Python |
|--------|-----------|--------|
| Get | `cache.get(key: string): T \| undefined` | `cache.get(key: str) -> Optional[Any]` |
| Set | `cache.set(key: string, data: T): void` | `cache.set(key: str, data: Any) -> None` |
| Has | `cache.has(key: string): boolean` | `cache.has(key: str) -> bool` |
| Clear | `cache.clear(): void` | `cache.clear() -> None` |

### Stats Property

**JavaScript**

```typescript
cache.stats;
// { hits: number, misses: number, size: number }
```

**Python**

```python
cache.stats
# CacheStats(hits=0, misses=0, size=0)
```

---

## Rate Limiting

Utilities for detecting, parsing, and responding to Figma API rate limits (HTTP 429).

### Functions

| Function | JavaScript | Python |
|----------|-----------|--------|
| Parse headers | `parseRateLimitHeaders(headers: Headers): RateLimitInfo` | `parse_rate_limit_headers(headers: dict) -> RateLimitInfo` |
| Handle rate limit | `handleRateLimit(headers: Headers, opts: RateLimitOptions): Promise<void>` | `handle_rate_limit(headers: dict, opts: dict) -> Awaitable[None]` |
| Should auto-wait | `shouldAutoWait(info: RateLimitInfo, opts: RateLimitOptions): boolean` | `should_auto_wait(info: RateLimitInfo, opts: dict) -> bool` |
| Wait for retry | `waitForRetryAfter(seconds: number): Promise<void>` | `wait_for_retry_after(seconds: float) -> Awaitable[None]` |

### RateLimitInfo

| Field | JavaScript | Python |
|-------|-----------|--------|
| Retry after (seconds) | `retryAfter: number` | `retry_after: float` |
| Plan tier | `planTier: string` | `plan_tier: str` |
| Rate limit type | `rateLimitType: string` | `rate_limit_type: str` |
| Upgrade link | `upgradeLink: string` | `upgrade_link: str` |
| Timestamp | `timestamp: string` | `timestamp: str` |

- JavaScript returns `RateLimitInfo` as a plain object with camelCase keys.
- Python returns `RateLimitInfo` as a dataclass with snake_case attributes.

---

## Retry

Exponential backoff retry logic for transient server errors. Only 5xx errors are retried; 429 rate limits are handled separately by the rate-limit module.

### Functions

| Function | JavaScript | Python |
|----------|-----------|--------|
| Calculate backoff | `calculateBackoff(attempt: number, initialWait?: number, maxWait?: number): number` | `calculate_backoff(attempt: int, initial_wait: float = ..., max_wait: float = ...) -> float` |
| Is retryable | `isRetryable(status: number): boolean` | `is_retryable(status: int) -> bool` |
| With retry | `withRetry(fn: () => Promise<T>, opts?: { maxRetries?: number; initialWait?: number; maxWait?: number }): Promise<T>` | `with_retry(fn: Callable, max_retries: int = ..., initial_wait: float = ..., max_wait: float = ...) -> Awaitable[T]` |
| Sleep | `sleep(ms: number): Promise<void>` | N/A (uses `asyncio.sleep` directly) |

---

## Config

Configuration loading from environment variables with sensible defaults.

### JavaScript

```typescript
import { loadConfig, DEFAULTS } from '@internal/figma-api';

const config = loadConfig();
// Returns plain object: { baseUrl, timeout, maxRetries, rateLimitAutoWait, ... }

DEFAULTS;
// { baseUrl: "https://api.figma.com", timeout: 30000, maxRetries: 3, ... }
```

### Python

```python
from figma_api import Config, DEFAULTS

config = Config.from_env()
# Returns frozen dataclass: Config(base_url=..., timeout=..., max_retries=..., ...)

DEFAULTS
# { "base_url": "https://api.figma.com", "timeout": 30, "max_retries": 3, ... }
```

| Aspect | JavaScript | Python |
|--------|-----------|--------|
| Return type | Plain object | Frozen dataclass |
| Function | `loadConfig()` | `Config.from_env()` classmethod |
| Defaults constant | `DEFAULTS` (object) | `DEFAULTS` (dict) |
| Timeout unit | Milliseconds (30000) | Seconds (30) |

---

## Logger

SDK-internal structured logger with configurable levels.

### Factory Function

**JavaScript**

```typescript
import { create as createLogger, LEVELS } from '@internal/figma-api';

const logger = createLogger('figma-api', 'my-module.mjs');
// SDKLogger instance

logger.trace('low-level detail');
logger.debug('debugging info');
logger.info('operational info');
logger.warn('warning');
logger.error('error occurred', errorObject);
```

**Python**

```python
from figma_api import create_logger, LEVELS, REDACT_KEYS

logger = create_logger('figma_api', 'my_module.py')
# SDKLogger instance

logger.trace('low-level detail')
logger.debug('debugging info')
logger.info('operational info')
logger.warn('warning')
logger.error('error occurred', error_object)
```

| Aspect | JavaScript | Python |
|--------|-----------|--------|
| Factory | `create(packageName, filename)` | `create_logger(package_name, filename)` |
| Levels | `LEVELS` dict | `LEVELS` dict |
| Redaction | Implicit | `REDACT_KEYS` set (explicit) |

---

## Server

Pre-built HTTP server wrapping all domain clients behind a REST API.

### JavaScript (Fastify)

```typescript
import { createServer, startServer } from '@internal/figma-api';

const { server, client } = createServer({
  token: 'fig_...',
  // ...FigmaClient options
});

await startServer(server, { port: 3000, host: '0.0.0.0' });
```

- Uses **Fastify** with `@fastify/cors` and `@fastify/sensible` plugins.
- Domain clients are decorated onto the Fastify instance.
- Returns both the `server` (Fastify instance) and `client` (FigmaClient).

### Python (FastAPI)

```python
from figma_api import create_app, Config

config = Config.from_env()
app = create_app(config)

# Run with uvicorn
# uvicorn figma_api.server:app --host 0.0.0.0 --port 3000
```

- Uses **FastAPI** with a lifespan context manager for startup/shutdown.
- CORS enabled via `CORSMiddleware`.
- All domain clients are stored on `app.state` and accessed via dependency injection.

---

## Routes

Both server implementations expose the same REST API surface.

### Health

| Method | Path | Response |
|--------|------|----------|
| GET | `/health` | `{ status: string, service: string, timestamp: string }` |

### Files

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/files/:fileKey` | Get a file |
| GET | `/v1/files/:fileKey/nodes` | Get file nodes |
| GET | `/v1/images/:fileKey` | Get rendered images |
| GET | `/v1/files/:fileKey/images` | Get image fills |
| GET | `/v1/files/:fileKey/versions` | Get file version history |

### Projects

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/teams/:teamId/projects` | List team projects |
| GET | `/v1/projects/:projectId/files` | List project files |

### Comments

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/files/:fileKey/comments` | List comments |
| POST | `/v1/files/:fileKey/comments` | Add a comment |
| DELETE | `/v1/files/:fileKey/comments/:commentId` | Delete a comment |

### Components

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/components/:key` | Get a component by key |
| GET | `/v1/files/:fileKey/components` | List file components |
| GET | `/v1/teams/:teamId/components` | List team components |
| GET | `/v1/component_sets/:key` | Get a component set |
| GET | `/v1/teams/:teamId/component_sets` | List team component sets |
| GET | `/v1/teams/:teamId/styles` | List team styles |
| GET | `/v1/styles/:key` | Get a style by key |

### Variables

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/files/:fileKey/variables/local` | Get local variables |
| GET | `/v1/files/:fileKey/variables/published` | Get published variables |
| POST | `/v1/files/:fileKey/variables` | Create / update variables |

### Webhooks (v2)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v2/webhooks/:webhookId` | Get a webhook |
| GET | `/v2/teams/:teamId/webhooks` | List team webhooks |
| POST | `/v2/webhooks` | Create a webhook |
| PUT | `/v2/webhooks/:webhookId` | Update a webhook |
| DELETE | `/v2/webhooks/:webhookId` | Delete a webhook |
| GET | `/v2/webhooks/:webhookId/requests` | Get webhook request log |

---

## Environment Variables

All configuration can be driven through environment variables.

| Variable | Purpose | Default |
|----------|---------|---------|
| `FIGMA_TOKEN` | Primary authentication token | -- |
| `FIGMA_ACCESS_TOKEN` | Fallback authentication token | -- |
| `FIGMA_API_BASE_URL` | API base URL | `https://api.figma.com` |
| `FIGMA_TIMEOUT` | Request timeout (JS: ms, PY: seconds) | JS: `30000`, PY: `30` |
| `MAX_RETRIES` | Maximum retry attempts for 5xx errors | `3` |
| `RATE_LIMIT_AUTO_WAIT` | Automatically wait on 429 responses | `true` |
| `RATE_LIMIT_THRESHOLD` | Minimum retry-after seconds to auto-wait | `0` |
| `CACHE_MAX_SIZE` | Maximum number of cached responses | `100` |
| `CACHE_TTL` | Cache time-to-live (seconds) | `300` |
| `LOG_LEVEL` | Logging verbosity (trace/debug/info/warn/error) | `info` |
| `PORT` | Server listen port | `3000` |
| `HOST` | Server listen host | `0.0.0.0` |
