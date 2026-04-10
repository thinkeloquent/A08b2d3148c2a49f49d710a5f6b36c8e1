# Figma API SDK -- Node.js API Reference

> Package: `@internal/figma-api` | Module format: ESM (`.mjs`) | Runtime: Node.js

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
- [Cache (RequestCache)](#cache-requestcache)
- [Rate Limiting](#rate-limiting)
- [Retry](#retry)
- [Config](#config)
- [Logger](#logger)

---

## FigmaClient

The core HTTP client for all Figma API communication. Handles authentication, retries, rate limiting, and caching.

### Constructor

```javascript
import { FigmaClient } from '@internal/figma-api';

const client = new FigmaClient({
  token,              // string, optional -- reads FIGMA_TOKEN or FIGMA_ACCESS_TOKEN from env
  baseUrl,            // string, default: "https://api.figma.com"
  timeout,            // number (ms), default: 30000
  maxRetries,         // number, default: 3
  rateLimitAutoWait,  // boolean, default: true
  rateLimitThreshold, // number, default: 0
  onRateLimit,        // function(rateLimitInfo) => boolean | void
  logger,             // custom logger object
  cache,              // { maxSize: number, ttl: number }
});
```

### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `token` | `string` | `undefined` | Personal access token or OAuth token. Falls back to `FIGMA_TOKEN` then `FIGMA_ACCESS_TOKEN` env vars. |
| `baseUrl` | `string` | `"https://api.figma.com"` | Base URL for all API requests. |
| `timeout` | `number` | `30000` | Request timeout in milliseconds. |
| `maxRetries` | `number` | `3` | Maximum number of retry attempts for retryable failures. |
| `rateLimitAutoWait` | `boolean` | `true` | When `true`, automatically waits and retries on 429 responses. |
| `rateLimitThreshold` | `number` | `0` | Minimum seconds remaining before proactively pausing requests. |
| `onRateLimit` | `function` | `undefined` | Callback invoked on rate limit. Return `false` to suppress auto-wait. |
| `logger` | `object` | `undefined` | Custom logger conforming to the SDKLogger interface. |
| `cache` | `object` | `undefined` | Cache configuration with `maxSize` and `ttl` (seconds). |

### HTTP Methods

All methods return a `Promise` that resolves with the parsed JSON response body.

```javascript
// GET request with optional query parameters
const file = await client.get('/v1/files/FILE_KEY', {
  params: { version: '123456', depth: 2 },
});

// POST request with JSON body
const result = await client.post('/v1/files/FILE_KEY/comments', {
  message: 'Looks good!',
  client_meta: { x: 100, y: 200 },
});

// PUT request with JSON body
const updated = await client.put('/v2/webhooks/WEBHOOK_ID', {
  event_type: 'FILE_UPDATE',
  endpoint: 'https://example.com/hook',
});

// PATCH request with JSON body
const patched = await client.patch('/some/path', { key: 'value' });

// DELETE request
await client.delete('/v1/files/FILE_KEY/comments/COMMENT_ID');

// Raw GET -- returns the full response object instead of parsed body
const raw = await client.getRaw('/v1/images/FILE_KEY', {
  params: { ids: '1:2', format: 'svg' },
});
```

#### Method Signatures

| Method | Signature | Description |
|---|---|---|
| `get` | `get(path: string, options?: { params?: object }) => Promise<any>` | HTTP GET. Query params are URL-encoded. |
| `post` | `post(path: string, body?: object, options?: object) => Promise<any>` | HTTP POST with JSON body. |
| `put` | `put(path: string, body?: object, options?: object) => Promise<any>` | HTTP PUT with JSON body. |
| `patch` | `patch(path: string, body?: object, options?: object) => Promise<any>` | HTTP PATCH with JSON body. |
| `delete` | `delete(path: string, options?: object) => Promise<any>` | HTTP DELETE. |
| `getRaw` | `getRaw(path: string, options?: { params?: object }) => Promise<Response>` | GET returning the raw response. |

### Properties

```javascript
// Cumulative request statistics
client.stats
// => {
//   requestsMade: 42,
//   requestsFailed: 1,
//   cacheHits: 10,
//   cacheMisses: 32,
//   rateLimitWaits: 0,
//   rateLimitTotalWaitSeconds: 0,
//   cache: { hits: 10, misses: 32, size: 25 }
// }

// Most recent rate limit info, or null
client.lastRateLimit
// => { retryAfter, planTier, rateLimitType, upgradeLink, timestamp } | null
```

---

## Domain Clients

All domain clients accept a `FigmaClient` instance as the first constructor argument and an optional options object with a `logger` property.

```javascript
import { FigmaClient, FilesClient } from '@internal/figma-api';

const client = new FigmaClient({ token: 'fig_...' });
const files = new FilesClient(client, { logger: customLogger });
```

---

### FilesClient

Operations on Figma files: fetching documents, exporting images, querying versions.

```javascript
import { FigmaClient, FilesClient } from '@internal/figma-api';

const client = new FigmaClient();
const files = new FilesClient(client, { logger });
```

#### `getFile(fileKey, options?)`

Retrieves the full document tree for a file.

```javascript
const file = await files.getFile('FILE_KEY', {
  version: '123456789',   // string, optional -- specific version ID
  ids: ['1:2', '3:4'],    // string[], optional -- return only these nodes
  depth: 2,               // number, optional -- traversal depth
  geometry: 'paths',      // string, optional -- include geometry data
  pluginData: 'shared',   // string, optional -- include plugin data
});
// => { document: { ... }, components: { ... }, schemaVersion: 0, ... }
```

| Parameter | Type | Description |
|---|---|---|
| `fileKey` | `string` | The file's unique key from its Figma URL. |
| `options.version` | `string` | A specific version ID to retrieve. |
| `options.ids` | `string[]` | Filter to only these node IDs. |
| `options.depth` | `number` | Maximum depth of the node tree to return. |
| `options.geometry` | `string` | Set to `"paths"` to include vector path data. |
| `options.pluginData` | `string` | Include data from plugins. Use `"shared"` for shared plugin data. |

#### `getFileNodes(fileKey, ids, options?)`

Retrieves specific nodes from a file.

```javascript
const nodes = await files.getFileNodes('FILE_KEY', ['1:2', '3:4'], {
  version: '123456789',
  depth: 1,
  geometry: 'paths',
  pluginData: 'shared',
});
// => { nodes: { '1:2': { document: {...}, components: {...} }, ... } }
```

| Parameter | Type | Description |
|---|---|---|
| `fileKey` | `string` | The file key. |
| `ids` | `string[]` | Array of node IDs to retrieve. |
| `options.version` | `string` | Specific version ID. |
| `options.depth` | `number` | Maximum traversal depth. |
| `options.geometry` | `string` | Include vector geometry. |
| `options.pluginData` | `string` | Include plugin data. |

#### `getImages(fileKey, ids, options?)`

Renders nodes as images and returns download URLs.

```javascript
const images = await files.getImages('FILE_KEY', ['1:2', '3:4'], {
  scale: 2,             // number, optional -- 0.01 to 4, default: 1
  format: 'svg',        // string, optional -- "jpg" | "png" | "svg" | "pdf"
  svgOptions: {         // object, optional -- SVG-specific options
    includeId: true,
    simplifyStroke: true,
    useAbsoluteBounds: false,
  },
});
// => { images: { '1:2': 'https://...', '3:4': 'https://...' } }
```

| Parameter | Type | Description |
|---|---|---|
| `fileKey` | `string` | The file key. |
| `ids` | `string[]` | Node IDs to render. |
| `options.scale` | `number` | Image scale factor (0.01--4). |
| `options.format` | `string` | Output format: `"jpg"`, `"png"`, `"svg"`, or `"pdf"`. |
| `options.svgOptions` | `object` | SVG-specific rendering options. |

#### `getImageFills(fileKey)`

Returns download URLs for all images used as fills in the file.

```javascript
const fills = await files.getImageFills('FILE_KEY');
// => { images: { 'imageHash1': 'https://...', ... } }
```

#### `getFileVersions(fileKey)`

Lists all saved versions of a file.

```javascript
const versions = await files.getFileVersions('FILE_KEY');
// => { versions: [{ id, created_at, label, description, user }, ...] }
```

---

### ProjectsClient

Team and project operations.

```javascript
import { FigmaClient, ProjectsClient } from '@internal/figma-api';

const client = new FigmaClient();
const projects = new ProjectsClient(client, { logger });
```

#### `getTeamProjects(teamId)`

Lists all projects within a team.

```javascript
const teamProjects = await projects.getTeamProjects('TEAM_ID');
// => { projects: [{ id, name }, ...] }
```

#### `getProjectFiles(projectId, options?)`

Lists all files within a project.

```javascript
const projectFiles = await projects.getProjectFiles('PROJECT_ID', {
  branchData: true,  // boolean, optional -- include branch metadata
});
// => { files: [{ key, name, thumbnail_url, last_modified }, ...] }
```

---

### CommentsClient

File comment operations.

```javascript
import { FigmaClient, CommentsClient } from '@internal/figma-api';

const client = new FigmaClient();
const comments = new CommentsClient(client, { logger });
```

#### `listComments(fileKey, options?)`

Lists all comments on a file.

```javascript
const result = await comments.listComments('FILE_KEY', {
  as_md: true,  // boolean, optional -- return message as markdown
});
// => { comments: [{ id, message, created_at, user, order_id, ... }, ...] }
```

#### `addComment(fileKey, payload)`

Adds a comment to a file.

```javascript
const newComment = await comments.addComment('FILE_KEY', {
  message: 'This needs revision.',
  clientMeta: { x: 100, y: 200 },  // optional -- pin location
  commentId: 'PARENT_COMMENT_ID',   // optional -- reply to a comment
});
// => { id, message, created_at, user, ... }
```

#### `deleteComment(fileKey, commentId)`

Deletes a comment from a file.

```javascript
await comments.deleteComment('FILE_KEY', 'COMMENT_ID');
```

---

### ComponentsClient

Components, component sets, and styles.

```javascript
import { FigmaClient, ComponentsClient } from '@internal/figma-api';

const client = new FigmaClient();
const components = new ComponentsClient(client, { logger });
```

#### `getComponent(key)`

Gets metadata for a single published component by its key.

```javascript
const component = await components.getComponent('COMPONENT_KEY');
// => { meta: { key, name, description, file_key, node_id, ... } }
```

#### `getFileComponents(fileKey)`

Lists all components in a file.

```javascript
const fileComponents = await components.getFileComponents('FILE_KEY');
// => { meta: { components: [{ key, name, description, ... }, ...] } }
```

#### `getTeamComponents(teamId, options?)`

Lists published components for a team with pagination.

```javascript
const teamComponents = await components.getTeamComponents('TEAM_ID', {
  pageSize: 50,   // number, optional
  cursor: 'abc',  // string, optional -- pagination cursor
});
// => { meta: { components: [...], cursor: { after, before } } }
```

#### `getComponentSet(key)`

Gets metadata for a component set (variant group).

```javascript
const set = await components.getComponentSet('COMPONENT_SET_KEY');
// => { meta: { key, name, description, file_key, ... } }
```

#### `getTeamComponentSets(teamId, options?)`

Lists published component sets for a team.

```javascript
const sets = await components.getTeamComponentSets('TEAM_ID', {
  pageSize: 30,
  cursor: 'xyz',
});
```

#### `getTeamStyles(teamId, options?)`

Lists published styles for a team.

```javascript
const styles = await components.getTeamStyles('TEAM_ID', {
  pageSize: 30,
  cursor: 'xyz',
});
// => { meta: { styles: [{ key, name, style_type, ... }, ...] } }
```

#### `getStyle(key)`

Gets metadata for a single published style.

```javascript
const style = await components.getStyle('STYLE_KEY');
// => { meta: { key, name, style_type, description, ... } }
```

---

### VariablesClient

Figma variables and variable collections.

```javascript
import { FigmaClient, VariablesClient } from '@internal/figma-api';

const client = new FigmaClient();
const variables = new VariablesClient(client, { logger });
```

#### `getLocalVariables(fileKey)`

Gets all local variables in a file.

```javascript
const local = await variables.getLocalVariables('FILE_KEY');
// => { meta: { variables: { ... }, variableCollections: { ... } } }
```

#### `getPublishedVariables(fileKey)`

Gets all published variables from a library file.

```javascript
const published = await variables.getPublishedVariables('FILE_KEY');
// => { meta: { variables: { ... }, variableCollections: { ... } } }
```

#### `createVariables(fileKey, payload)`

Creates, updates, or deletes variables and variable collections.

```javascript
const result = await variables.createVariables('FILE_KEY', {
  variableCollections: [
    { action: 'CREATE', name: 'Colors', id: 'temp_id_1' },
  ],
  variables: [
    {
      action: 'CREATE',
      name: 'primary',
      variableCollectionId: 'temp_id_1',
      resolvedType: 'COLOR',
      valuesByMode: {
        'mode_id': { r: 0.2, g: 0.4, b: 0.9, a: 1 },
      },
    },
  ],
});
```

---

### WebhooksClient

Webhook management (v2 API).

```javascript
import { FigmaClient, WebhooksClient } from '@internal/figma-api';

const client = new FigmaClient();
const webhooks = new WebhooksClient(client, { logger });
```

#### `getWebhook(webhookId)`

Gets a webhook by its ID.

```javascript
const webhook = await webhooks.getWebhook('WEBHOOK_ID');
// => { id, team_id, event_type, endpoint, status, ... }
```

#### `listTeamWebhooks(teamId)`

Lists all webhooks for a team.

```javascript
const list = await webhooks.listTeamWebhooks('TEAM_ID');
// => { webhooks: [{ id, event_type, endpoint, ... }, ...] }
```

#### `createWebhook(teamId, payload)`

Creates a new webhook for a team.

```javascript
const created = await webhooks.createWebhook('TEAM_ID', {
  eventType: 'FILE_UPDATE',                // string, required
  endpoint: 'https://example.com/webhook', // string, required
  passcode: 'my-secret-passcode',          // string, required
  status: 'ACTIVE',                        // string, optional
  description: 'Notifies on file updates', // string, optional
});
```

#### `updateWebhook(webhookId, payload)`

Updates an existing webhook.

```javascript
const updated = await webhooks.updateWebhook('WEBHOOK_ID', {
  endpoint: 'https://example.com/new-webhook',
  status: 'PAUSED',
});
```

#### `deleteWebhook(webhookId)`

Deletes a webhook.

```javascript
await webhooks.deleteWebhook('WEBHOOK_ID');
```

#### `getWebhookRequests(webhookId)`

Gets recent delivery attempts for a webhook.

```javascript
const requests = await webhooks.getWebhookRequests('WEBHOOK_ID');
// => { requests: [{ id, endpoint, payload, timestamp, ... }, ...] }
```

---

### DevResourcesClient

Development resource link management.

```javascript
import { FigmaClient, DevResourcesClient } from '@internal/figma-api';

const client = new FigmaClient();
const devResources = new DevResourcesClient(client, { logger });
```

Methods follow the same constructor and invocation pattern as other domain clients. Consult the source for the full method list.

---

### LibraryAnalyticsClient

Library usage analytics and reporting.

```javascript
import { FigmaClient, LibraryAnalyticsClient } from '@internal/figma-api';

const client = new FigmaClient();
const analytics = new LibraryAnalyticsClient(client, { logger });
```

Methods follow the same constructor and invocation pattern as other domain clients. Consult the source for the full method list.

---

## Error Hierarchy

All SDK errors extend the base `FigmaError` class. Errors are automatically thrown by the client based on HTTP status codes.

### Base Class: `FigmaError`

```javascript
import { FigmaError } from '@internal/figma-api';
```

**Properties:**

| Property | Type | Description |
|---|---|---|
| `message` | `string` | Human-readable error description. |
| `status` | `number` | HTTP status code (0 for non-HTTP errors). |
| `code` | `string` | Machine-readable error code. |
| `name` | `string` | Error class name. |
| `meta` | `object` | Additional metadata from the API response. |
| `requestId` | `string` | Figma request ID from response headers. |
| `timestamp` | `string` | ISO 8601 timestamp when the error occurred. |

**Methods:**

```javascript
const error = new FigmaError('Something failed', {
  status: 500,
  code: 'SERVER_ERROR',
  meta: { detail: 'Internal failure' },
  requestId: 'req_abc123',
});

const json = error.toJSON();
// => { name, message, status, code, meta, requestId, timestamp }
```

### Error Subclasses

| Class | HTTP Status | Code | When Thrown |
|---|---|---|---|
| `AuthenticationError` | `401` | `AUTHENTICATION_ERROR` | Invalid or missing token. |
| `AuthorizationError` | `403` | `AUTHORIZATION_ERROR` | Token lacks required permissions. |
| `NotFoundError` | `404` | `NOT_FOUND` | File, node, or resource does not exist. |
| `ValidationError` | `422` | `VALIDATION_ERROR` | Invalid request parameters. |
| `RateLimitError` | `429` | `RATE_LIMIT_ERROR` | API rate limit exceeded. |
| `ApiError` | `4xx` | `API_ERROR` | Other client errors. |
| `ServerError` | `5xx` | `SERVER_ERROR` | Figma server errors (retryable). |
| `NetworkError` | `0` | `NETWORK_ERROR` | DNS, connection, or network failure. |
| `TimeoutError` | `408` | `TIMEOUT_ERROR` | Request exceeded timeout. |
| `ConfigurationError` | `0` | `CONFIGURATION_ERROR` | Invalid SDK configuration. |

```javascript
import {
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
} from '@internal/figma-api';
```

### `mapResponseToError(status, body, headers)`

Maps an HTTP response to the appropriate typed error instance.

```javascript
import { mapResponseToError } from '@internal/figma-api';

const error = mapResponseToError(
  404,
  { status: 404, message: 'Not found' },
  { 'x-request-id': 'req_abc' }
);
// => NotFoundError instance
```

| Parameter | Type | Description |
|---|---|---|
| `status` | `number` | HTTP status code. |
| `body` | `object` | Parsed response body. |
| `headers` | `object` | Response headers. |
| **Returns** | `FigmaError` | A typed error subclass instance. |

---

## Auth

Token resolution and masking utilities.

```javascript
import { resolveToken, maskToken, AuthError } from '@internal/figma-api';
```

### `resolveToken(explicit?)`

Resolves a Figma API token from an explicit value or environment variables.

```javascript
// With explicit token
const { token, source } = resolveToken('fig_abc123...');
// => { token: 'fig_abc123...', source: 'explicit' }

// From FIGMA_TOKEN env var
const { token, source } = resolveToken();
// => { token: 'fig_env...', source: 'env:FIGMA_TOKEN' }

// From FIGMA_ACCESS_TOKEN env var (fallback)
const { token, source } = resolveToken();
// => { token: 'fig_access...', source: 'env:FIGMA_ACCESS_TOKEN' }

// No token available -- throws AuthError
resolveToken();
// => throws AuthError
```

| Parameter | Type | Description |
|---|---|---|
| `explicit` | `string` | Optional explicit token value. |
| **Returns** | `{ token: string, source: string }` | Resolved token and its source. |

### `maskToken(token)`

Masks a token for safe logging.

```javascript
maskToken('fig_abc123xyz');
// => 'fig_abc1***'

maskToken('short');
// => '***'
```

| Parameter | Type | Description |
|---|---|---|
| `token` | `string` | The token to mask. |
| **Returns** | `string` | First 8 characters + `"***"`, or `"***"` if token is 8 characters or fewer. |

### `AuthError`

Thrown when no token can be resolved. Has HTTP status `401`.

```javascript
try {
  resolveToken();
} catch (err) {
  if (err instanceof AuthError) {
    console.error(err.message); // "No Figma API token found..."
    console.error(err.status);  // 401
  }
}
```

---

## Cache (RequestCache)

LRU cache with TTL for GET request memoization.

```javascript
import { RequestCache } from '@internal/figma-api';
```

### Constructor

```javascript
const cache = new RequestCache({
  maxSize: 100,  // number, default: 100 -- maximum entries
  ttl: 300,      // number, default: 300 -- TTL in seconds
});
```

### Methods

#### `get(key)`

Returns the cached value or `undefined` if expired or absent.

```javascript
const data = cache.get('/v1/files/FILE_KEY');
if (data !== undefined) {
  // cache hit
}
```

#### `set(key, data)`

Stores a value in the cache. Evicts the least-recently-used entry when `maxSize` is exceeded.

```javascript
cache.set('/v1/files/FILE_KEY', { document: { ... } });
```

#### `has(key)`

Returns `true` if the key exists and has not expired.

```javascript
if (cache.has('/v1/files/FILE_KEY')) {
  // ...
}
```

#### `clear()`

Removes all entries from the cache.

```javascript
cache.clear();
```

### Properties

```javascript
cache.stats
// => { hits: 10, misses: 32, size: 25 }
```

| Property | Type | Description |
|---|---|---|
| `stats.hits` | `number` | Total cache hits. |
| `stats.misses` | `number` | Total cache misses. |
| `stats.size` | `number` | Current number of entries. |

---

## Rate Limiting

Utilities for parsing and handling Figma API rate limit responses.

```javascript
import {
  parseRateLimitHeaders,
  handleRateLimit,
  shouldAutoWait,
  waitForRetryAfter,
} from '@internal/figma-api';
```

### `parseRateLimitHeaders(headers)`

Parses rate limit information from HTTP response headers.

```javascript
const info = parseRateLimitHeaders(headers);
// => {
//   retryAfter: 30,            // number -- seconds to wait
//   planTier: 'starter',       // string | undefined
//   rateLimitType: 'file',     // string | undefined
//   upgradeLink: 'https://...',// string | undefined
//   timestamp: '2026-01-31...' // ISO 8601 string
// }
```

| Parameter | Type | Description |
|---|---|---|
| `headers` | `object` | HTTP response headers. |
| **Returns** | `object` | Parsed rate limit information. |

### `handleRateLimit(headers, options)`

Evaluates rate limit headers and determines whether to retry.

```javascript
const { retry, rateLimitInfo } = handleRateLimit(headers, {
  rateLimitAutoWait: true,
  rateLimitThreshold: 5,
  onRateLimit: (info) => {
    console.warn(`Rate limited. Retry after ${info.retryAfter}s`);
    return true; // allow auto-wait
  },
});

if (retry) {
  await waitForRetryAfter(rateLimitInfo.retryAfter);
}
```

| Parameter | Type | Description |
|---|---|---|
| `headers` | `object` | HTTP response headers. |
| `options` | `object` | Rate limit configuration options. |
| **Returns** | `{ retry: boolean, rateLimitInfo: object }` | Whether to retry and the parsed info. |

### `shouldAutoWait(rateLimitInfo, options)`

Determines whether the client should automatically wait based on configuration.

```javascript
const wait = shouldAutoWait(rateLimitInfo, {
  rateLimitAutoWait: true,
  rateLimitThreshold: 10,
});
// => true | false
```

### `waitForRetryAfter(seconds)`

Returns a Promise that resolves after the specified number of seconds.

```javascript
await waitForRetryAfter(30);
// Resumes after 30 seconds
```

| Parameter | Type | Description |
|---|---|---|
| `seconds` | `number` | Number of seconds to wait. |
| **Returns** | `Promise<void>` | Resolves after the delay. |

---

## Retry

Exponential backoff and retry utilities.

```javascript
import {
  calculateBackoff,
  isRetryable,
  withRetry,
  sleep,
} from '@internal/figma-api';
```

### `calculateBackoff(attempt, initialWait?, maxWait?)`

Calculates the backoff delay for a given retry attempt using exponential backoff with jitter.

```javascript
const delay = calculateBackoff(0);          // ~1000ms
const delay = calculateBackoff(1);          // ~2000ms
const delay = calculateBackoff(2);          // ~4000ms
const delay = calculateBackoff(3, 500);     // ~4000ms (custom initial)
const delay = calculateBackoff(5, 1000, 10000); // capped at 10000ms
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `attempt` | `number` | -- | Zero-based attempt index. |
| `initialWait` | `number` | `1000` | Initial wait in milliseconds. |
| `maxWait` | `number` | `30000` | Maximum wait cap in milliseconds. |
| **Returns** | `number` | -- | Backoff delay in milliseconds. |

### `isRetryable(status)`

Returns `true` if the HTTP status code is retryable (5xx server errors only).

```javascript
isRetryable(500); // => true
isRetryable(502); // => true
isRetryable(429); // => false (rate limits handled separately)
isRetryable(404); // => false
```

### `withRetry(fn, options?)`

Wraps an async function with automatic retry on retryable failures.

```javascript
const data = await withRetry(
  () => client.get('/v1/files/FILE_KEY'),
  {
    maxRetries: 3,        // number, default: 3
    initialWait: 1000,    // number (ms), default: 1000
    maxWait: 30000,       // number (ms), default: 30000
  }
);
```

| Parameter | Type | Description |
|---|---|---|
| `fn` | `() => Promise<T>` | The async function to execute. |
| `options.maxRetries` | `number` | Maximum retry attempts. |
| `options.initialWait` | `number` | Initial backoff in ms. |
| `options.maxWait` | `number` | Maximum backoff cap in ms. |
| **Returns** | `Promise<T>` | The resolved value from `fn`. |

### `sleep(ms)`

Returns a Promise that resolves after the given milliseconds.

```javascript
await sleep(2000); // pause for 2 seconds
```

---

## Config

Environment-based configuration loading and defaults.

```javascript
import { loadConfig, DEFAULTS } from '@internal/figma-api';
```

### `loadConfig()`

Loads configuration from environment variables, applying defaults where values are not set.

```javascript
const config = loadConfig();
// => {
//   token: 'fig_...',
//   baseUrl: 'https://api.figma.com',
//   timeout: 30000,
//   maxRetries: 3,
//   logLevel: 'INFO',
//   port: 3108,
//   host: '0.0.0.0',
//   rateLimitAutoWait: true,
//   rateLimitThreshold: 0,
//   cacheMaxSize: 100,
//   cacheTtl: 300,
// }
```

### `DEFAULTS`

Default configuration values used by `loadConfig()`.

```javascript
import { DEFAULTS } from '@internal/figma-api';

console.log(DEFAULTS);
// => {
//   baseUrl: 'https://api.figma.com',
//   timeout: 30000,
//   maxRetries: 3,
//   logLevel: 'INFO',
//   port: 3108,
//   host: '0.0.0.0',
//   rateLimitAutoWait: true,
//   rateLimitThreshold: 0,
//   cacheMaxSize: 100,
//   cacheTtl: 300,
// }
```

### Environment Variables

| Variable | Type | Default | Description |
|---|---|---|---|
| `FIGMA_TOKEN` | `string` | -- | Primary Figma API token. |
| `FIGMA_ACCESS_TOKEN` | `string` | -- | Fallback Figma API token. |
| `FIGMA_API_BASE_URL` | `string` | `https://api.figma.com` | API base URL override. |
| `LOG_LEVEL` | `string` | `INFO` | Logging verbosity. |
| `PORT` | `number` | `3108` | Server listen port. |
| `HOST` | `string` | `0.0.0.0` | Server listen host. |
| `FIGMA_TIMEOUT` | `number` | `30000` | Request timeout in ms. |
| `MAX_RETRIES` | `number` | `3` | Maximum retry attempts. |
| `RATE_LIMIT_AUTO_WAIT` | `boolean` | `true` | Auto-wait on rate limit. |
| `RATE_LIMIT_THRESHOLD` | `number` | `0` | Proactive rate limit threshold. |
| `CACHE_MAX_SIZE` | `number` | `100` | Maximum cache entries. |
| `CACHE_TTL` | `number` | `300` | Cache TTL in seconds. |

---

## Logger

Structured logging with automatic sensitive data redaction.

```javascript
import { Logger } from '@internal/figma-api';
```

### `Logger.create(packageName, filename)`

Creates a new `SDKLogger` instance scoped to a package and file.

```javascript
const log = Logger.create('@internal/figma-api', 'files-client.mjs');
```

| Parameter | Type | Description |
|---|---|---|
| `packageName` | `string` | The package name for log context. |
| `filename` | `string` | The source filename for log context. |
| **Returns** | `SDKLogger` | A configured logger instance. |

### SDKLogger Methods

All methods accept a message string and an optional context object. Sensitive keys in the context are automatically redacted.

```javascript
log.trace('Entering getFile', { fileKey: 'abc123' });
log.debug('Cache lookup', { key: '/v1/files/abc', hit: false });
log.info('File retrieved', { fileKey: 'abc123', nodeCount: 42 });
log.warn('Approaching rate limit', { remaining: 5 });
log.error('Request failed', { status: 500, message: 'Internal error' });
```

| Method | Level | When to Use |
|---|---|---|
| `trace(msg, ctx?)` | `5` | Extremely verbose debugging. |
| `debug(msg, ctx?)` | `10` | Development-time debugging. |
| `info(msg, ctx?)` | `20` | Normal operational messages. |
| `warn(msg, ctx?)` | `30` | Potentially problematic situations. |
| `error(msg, ctx?)` | `40` | Errors that need attention. |

### Log Levels

```javascript
import { Logger } from '@internal/figma-api';

console.log(Logger.LEVELS);
// => {
//   TRACE: 5,
//   DEBUG: 10,
//   INFO: 20,
//   WARN: 30,
//   ERROR: 40,
//   SILENT: 100,
// }
```

### Sensitive Key Redaction

The following keys are automatically redacted in log context objects:

- `token`
- `secret`
- `password`
- `auth`
- `credential`
- `authorization`
- `apikey`
- `api_key`
- `accesstoken`
- `access_token`

```javascript
log.info('Client created', { token: 'fig_abc123xyz', baseUrl: 'https://...' });
// Output: { token: '[REDACTED]', baseUrl: 'https://...' }
```
