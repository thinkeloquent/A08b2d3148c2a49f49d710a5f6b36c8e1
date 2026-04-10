# Sauce Labs API SDK -- Node.js API Reference

> Package: `saucelabs-api-client` | Module: ESM (`.mjs`) | Runtime: Node.js 20+

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
- [Types & Constants](#types--constants)
- [Convenience Factory](#convenience-factory)

---

## SaucelabsClient

The core HTTP client for all Sauce Labs API communication. Handles authentication (HTTP Basic Auth), rate limiting, error mapping, and structured logging using native Node.js 20+ `fetch`.

### Constructor

```javascript
import { SaucelabsClient } from 'saucelabs-api-client';

const client = new SaucelabsClient({
  username,           // string, optional -- reads SAUCE_USERNAME or SAUCELABS_USERNAME from env
  apiKey,             // string, optional -- reads SAUCE_ACCESS_KEY or SAUCELABS_ACCESS_KEY from env
  region,             // string, default: "us-west-1"
  baseUrl,            // string, optional -- overrides region-based Core Automation URL
  mobileBaseUrl,      // string, optional -- overrides region-based Mobile Distribution URL
  timeout,            // number (ms), default: 30000
  rateLimitAutoWait,  // boolean, default: true
  onRateLimit,        // function(rateLimitInfo) => boolean | void
  logger,             // custom logger object with debug/info/warn/error methods
  proxy,              // string, optional -- HTTP proxy URL (falls back to HTTPS_PROXY / HTTP_PROXY)
  verifySsl,          // boolean, default: true
});
```

### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `username` | `string` | `undefined` | Sauce Labs username. Falls back to `SAUCE_USERNAME` then `SAUCELABS_USERNAME` env vars. |
| `apiKey` | `string` | `undefined` | Sauce Labs access key. Falls back to `SAUCE_ACCESS_KEY` then `SAUCELABS_ACCESS_KEY` env vars. |
| `region` | `string` | `"us-west-1"` | Core Automation region (`us-west-1`, `us-east-4`, `eu-central-1`). |
| `baseUrl` | `string` | `undefined` | Explicit override for the Core Automation base URL. Takes precedence over `region`. |
| `mobileBaseUrl` | `string` | `undefined` | Explicit override for the Mobile Distribution base URL. |
| `timeout` | `number` | `30000` | Request timeout in milliseconds. |
| `rateLimitAutoWait` | `boolean` | `true` | When `true`, automatically waits and retries on 429 responses. |
| `onRateLimit` | `function` | `undefined` | Callback invoked on rate limit. Return `false` to suppress auto-wait. |
| `logger` | `object` | `undefined` | Custom logger conforming to the SDKLogger interface (debug/info/warn/error). |
| `proxy` | `string` | `undefined` | HTTP proxy URL. Falls back to `HTTPS_PROXY` then `HTTP_PROXY` env vars. |
| `verifySsl` | `boolean` | `true` | Whether to verify SSL certificates. |

### HTTP Methods

All methods return a `Promise` that resolves with the parsed JSON response body.

```javascript
// GET request with optional query parameters
const jobs = await client.get('/rest/v1/demo_user/jobs', {
  params: { limit: 10, format: 'json' },
});

// POST request with JSON body
const result = await client.post('/rest/v1/some/path', {
  key: 'value',
});

// PUT request with JSON body
const updated = await client.put('/rest/v1/some/path', {
  key: 'new_value',
});

// PATCH request with JSON body
const patched = await client.patch('/rest/v1/some/path', { key: 'value' });

// DELETE request
await client.delete('/rest/v1/some/path');

// Raw GET -- returns the full fetch Response object instead of parsed body
const raw = await client.getRaw('/rest/v1/some/path', {
  params: { format: 'json' },
});

// Close the client
client.close();
```

#### Method Signatures

| Method | Signature | Description |
|---|---|---|
| `get` | `get(path: string, options?: RequestOptions) => Promise<any>` | HTTP GET. Query params are URL-encoded. |
| `post` | `post(path: string, body?: object, options?: RequestOptions) => Promise<any>` | HTTP POST with JSON body. |
| `put` | `put(path: string, body?: object, options?: RequestOptions) => Promise<any>` | HTTP PUT with JSON body. |
| `patch` | `patch(path: string, body?: object, options?: RequestOptions) => Promise<any>` | HTTP PATCH with JSON body. |
| `delete` | `delete(path: string, options?: RequestOptions) => Promise<any>` | HTTP DELETE. |
| `getRaw` | `getRaw(path: string, options?: RequestOptions) => Promise<Response>` | GET returning the raw fetch Response. |
| `close` | `close() => void` | Logs client closure. |

#### RequestOptions

| Property | Type | Description |
|---|---|---|
| `headers` | `object` | Additional request headers to merge. |
| `params` | `object` | URL query parameters (auto-encoded). |
| `timeout` | `number` | Per-request timeout override in milliseconds. |
| `mobile` | `boolean` | When `true`, uses the Mobile Distribution base URL. |

### Properties

```javascript
// The configured username
client.username
// => 'demo_user'

// Most recent rate limit info, or null
client.lastRateLimit
// => { retryAfter, remaining, limit, resetAt, timestamp } | null
```

---

## Domain Modules

All domain modules accept a `SaucelabsClient` instance as the constructor argument. They are automatically attached when using `createSaucelabsClient()`.

```javascript
import { SaucelabsClient, JobsModule } from 'saucelabs-api-client';

const client = new SaucelabsClient({ username: 'demo', apiKey: 'xxx' });
const jobs = new JobsModule(client);
```

---

### JobsModule

Manage test execution history (VDC & RDC).

```javascript
import { SaucelabsClient, JobsModule } from 'saucelabs-api-client';

const client = new SaucelabsClient();
const jobs = new JobsModule(client);
```

#### `list(params?)`

Lists test jobs for the configured user.

```javascript
const jobList = await jobs.list({
  limit: 25,    // number, optional -- default: 25
  skip: 0,      // number, optional -- offset for pagination
  from: 1706745600, // number, optional -- Unix timestamp start filter
  to: 1706832000,   // number, optional -- Unix timestamp end filter
});
// => [{ id, name, status, creation_time, ... }, ...]
```

| Parameter | Type | Description |
|---|---|---|
| `params.limit` | `number` | Number of jobs to return (default: 25). |
| `params.skip` | `number` | Number of jobs to skip for pagination. |
| `params.from` | `number` | Unix timestamp start filter (positive integer). |
| `params.to` | `number` | Unix timestamp end filter (positive integer). |

**API endpoint:** `GET /rest/v1/{username}/jobs`

#### `get(jobId)`

Gets details for a specific job.

```javascript
const job = await jobs.get('abc123def456');
// => { id, name, status, browser, os, creation_time, end_time, ... }
```

| Parameter | Type | Description |
|---|---|---|
| `jobId` | `string` | The job identifier. |

**API endpoint:** `GET /rest/v1.1/{username}/jobs/{id}`

---

### PlatformModule

Check service status and supported configurations.

```javascript
import { SaucelabsClient, PlatformModule } from 'saucelabs-api-client';

const client = new SaucelabsClient();
const platform = new PlatformModule(client);
```

#### `getStatus()`

Gets the current Sauce Labs service status. This is a public endpoint -- no authentication required.

```javascript
const status = await platform.getStatus();
// => { wait_time, service_operational, status_message }
```

**API endpoint:** `GET /rest/v1/info/status`

#### `getPlatforms(automationApi?)`

Gets supported platforms filtered by automation backend.

```javascript
const platforms = await platform.getPlatforms('appium');
// => [{ short_version, long_name, api_name, os, ... }, ...]
```

| Parameter | Type | Description |
|---|---|---|
| `automationApi` | `string` | Filter: `'all'`, `'appium'`, or `'webdriver'` (default: `'all'`). |

**API endpoint:** `GET /rest/v1/info/platforms/{automation_api}`

---

### UsersModule

Retrieve user account details and concurrency/usage statistics.

```javascript
import { SaucelabsClient, UsersModule } from 'saucelabs-api-client';

const client = new SaucelabsClient();
const users = new UsersModule(client);
```

#### `getUser(username?)`

Gets user account information.

```javascript
const user = await users.getUser();
// => { id, username, email, first_name, last_name, ... }

// Or for a different user:
const otherUser = await users.getUser('other_user');
```

| Parameter | Type | Description |
|---|---|---|
| `username` | `string` | Username (defaults to the configured client username). |

**API endpoint:** `GET /rest/v1.2/users/{username}`

#### `getConcurrency(username?)`

Gets concurrency and usage statistics.

```javascript
const concurrency = await users.getConcurrency();
// => { concurrency: { ... }, usage: { ... } }
```

| Parameter | Type | Description |
|---|---|---|
| `username` | `string` | Username (defaults to the configured client username). |

**API endpoint:** `GET /rest/v1.2/users/{username}/concurrency`

---

### UploadModule

Upload mobile binaries (APK, IPA, AAB) for distribution and testing.

```javascript
import { SaucelabsClient, UploadModule } from 'saucelabs-api-client';

const client = new SaucelabsClient();
const upload = new UploadModule(client);
```

#### `uploadApp(params)`

Uploads a mobile app binary to Sauce Labs Mobile Distribution.

```javascript
// Upload from a file path
const result = await upload.uploadApp({
  file: '/path/to/app.apk',      // string or Buffer, required
  apiKey: 'distribution_api_key', // string, required
  appName: 'My App',             // string, optional
  uploadToSaucelabs: true,       // boolean, optional, default: false
  notify: true,                  // boolean, optional, default: false
});
// => { status, message, ... }

// Upload from a Buffer
const buffer = await readFile('/path/to/app.ipa');
const result = await upload.uploadApp({
  file: buffer,
  apiKey: 'distribution_api_key',
  appName: 'My App',
});
```

| Parameter | Type | Description |
|---|---|---|
| `params.file` | `string \| Buffer` | File path or Buffer. Path must have extension `.apk`, `.ipa`, or `.aab`. |
| `params.apiKey` | `string` | Distribution API key (required). |
| `params.appName` | `string` | Display name for the app. |
| `params.uploadToSaucelabs` | `boolean` | Also upload to RDC (default: `false`). |
| `params.notify` | `boolean` | Email testers (default: `false`). |

**API endpoint:** `POST /api/upload/` (Mobile Distribution base URL)

---

## Error Hierarchy

All SDK errors extend the base `SaucelabsError` class. Errors are automatically thrown by the client based on HTTP status codes.

### Base Class: `SaucelabsError`

```javascript
import { SaucelabsError } from 'saucelabs-api-client';
```

**Properties:**

| Property | Type | Description |
|---|---|---|
| `message` | `string` | Human-readable error description. |
| `statusCode` | `number` | HTTP status code (0 for non-HTTP errors). |
| `name` | `string` | Error class name. |
| `responseBody` | `object \| null` | Parsed response body from the API. |
| `headers` | `object` | Response headers. |
| `endpoint` | `string` | The API path that produced the error. |
| `method` | `string` | HTTP method used. |
| `timestamp` | `string` | ISO 8601 timestamp when the error occurred. |

**Methods:**

```javascript
const error = new SaucelabsError('Something failed', {
  statusCode: 500,
  responseBody: { detail: 'Internal failure' },
  headers: {},
  endpoint: '/rest/v1/jobs',
  method: 'GET',
});

const json = error.toJSON();
// => { error: true, name, message, statusCode, endpoint, method, timestamp }
```

### Error Subclasses

| Class | HTTP Status | When Thrown |
|---|---|---|
| `SaucelabsAuthError` | `401` | Missing or invalid credentials. |
| `SaucelabsNotFoundError` | `404` | Resource does not exist. |
| `SaucelabsRateLimitError` | `429` | API rate limit exceeded. Includes `retryAfter` (seconds). |
| `SaucelabsValidationError` | `400` / `422` | Invalid request parameters. |
| `SaucelabsServerError` | `500+` | Sauce Labs server-side failure. |
| `SaucelabsConfigError` | `0` | Missing required configuration (non-HTTP). |

```javascript
import {
  SaucelabsError,
  SaucelabsAuthError,
  SaucelabsNotFoundError,
  SaucelabsRateLimitError,
  SaucelabsValidationError,
  SaucelabsServerError,
  SaucelabsConfigError,
} from 'saucelabs-api-client';
```

### `SaucelabsRateLimitError` Extra Properties

| Property | Type | Description |
|---|---|---|
| `retryAfter` | `number` | Seconds to wait before retrying (default: 60). |

```javascript
const err = new SaucelabsRateLimitError('Rate limit exceeded', { retryAfter: 30 });
console.log(err.retryAfter); // => 30
console.log(err.toJSON());   // => { error: true, name, message, statusCode: 429, ..., retryAfter: 30 }
```

### `createErrorFromResponse(status, body, headers)`

Maps an HTTP response to the appropriate typed error instance.

```javascript
import { createErrorFromResponse } from 'saucelabs-api-client';

const error = createErrorFromResponse(
  404,
  { message: 'Not found' },
  {}
);
// => SaucelabsNotFoundError instance

const rateLimitError = createErrorFromResponse(
  429,
  { message: 'Too many requests' },
  { 'retry-after': '60' }
);
// => SaucelabsRateLimitError instance with retryAfter = 60
```

| Parameter | Type | Description |
|---|---|---|
| `status` | `number` | HTTP status code. |
| `body` | `object` | Parsed response body. |
| `headers` | `object` | Response headers (lowercase keys). |
| **Returns** | `SaucelabsError` | A typed error subclass instance. |

**Status code mapping:**

| Status | Error Class |
|---|---|
| `401` | `SaucelabsAuthError` |
| `404` | `SaucelabsNotFoundError` |
| `429` | `SaucelabsRateLimitError` |
| `400`, `422` | `SaucelabsValidationError` |
| `500+` | `SaucelabsServerError` |
| Other | `SaucelabsError` (base class) |

---

## Rate Limiting

Utilities for parsing and handling Sauce Labs API rate limit responses. The Sauce Labs API allows approximately 10 req/sec and 3,500/hour for authenticated requests.

```javascript
import {
  parseRetryAfter,
  buildRateLimitInfo,
  calculateBackoff,
  RateLimiter,
} from 'saucelabs-api-client';
```

### `parseRetryAfter(headerValue)`

Parses the `Retry-After` header value into seconds. Handles both numeric seconds and HTTP-date formats.

```javascript
parseRetryAfter('30');        // => 30
parseRetryAfter('1.5');       // => 2  (ceiled)
parseRetryAfter(null);        // => 60 (default)
parseRetryAfter('');          // => 60 (default)
parseRetryAfter('Thu, 01 Jan 2026 00:00:00 GMT'); // => seconds until that date
```

| Parameter | Type | Description |
|---|---|---|
| `headerValue` | `string \| null \| undefined` | Raw `Retry-After` header value. |
| **Returns** | `number` | Seconds to wait (defaults to 60 if unparseable). |

### `buildRateLimitInfo(headers)`

Builds a `RateLimitInfo` object from response headers.

```javascript
const info = buildRateLimitInfo({
  'retry-after': '30',
  'x-ratelimit-remaining': '0',
  'x-ratelimit-limit': '100',
  'x-ratelimit-reset': '1706832000',
});
// => {
//   retryAfter: 30,
//   remaining: 0,
//   limit: 100,
//   resetAt: Date,
//   timestamp: Date,
// }
```

| Parameter | Type | Description |
|---|---|---|
| `headers` | `object` | Response headers (plain object, lowercase keys). |
| **Returns** | `RateLimitInfo` | Parsed rate limit information. |

### `calculateBackoff(retryCount, baseDelay?, maxDelay?)`

Calculates exponential backoff with jitter.

```javascript
calculateBackoff(0);          // ~1s
calculateBackoff(1);          // ~2s
calculateBackoff(2);          // ~4s
calculateBackoff(3);          // ~8s
calculateBackoff(5, 1, 60);   // capped at 60s
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `retryCount` | `number` | -- | Zero-based retry attempt index. |
| `baseDelay` | `number` | `1` | Base delay in seconds. |
| `maxDelay` | `number` | `60` | Maximum delay cap in seconds. |
| **Returns** | `number` | -- | Backoff delay in seconds. |

### `RateLimiter`

Reactive rate limiter class used internally by `SaucelabsClient`. Handles HTTP 429 responses with exponential backoff, auto-wait, and an optional callback.

```javascript
import { RateLimiter } from 'saucelabs-api-client';

const limiter = new RateLimiter({
  autoWait: true,        // boolean, default: true -- auto-wait on 429
  maxRetries: 5,         // number, default: 5 -- max retry attempts
  onRateLimit: (info) => {
    console.warn(`Rate limited. Retry after ${info.retryAfter}s`);
    return true; // allow auto-wait; return false to abort
  },
  logger: customLogger,  // optional logger override
});
```

#### Constructor Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `autoWait` | `boolean` | `true` | Automatically wait and retry on 429 responses. |
| `maxRetries` | `number` | `5` | Maximum number of retry attempts. |
| `onRateLimit` | `function` | `null` | Callback invoked on rate limit. Return `false` to abort. |
| `logger` | `object` | `null` | Custom logger instance. |

#### Properties

```javascript
limiter.lastRateLimit
// => { retryAfter, remaining, limit, resetAt, timestamp } | null
```

#### `handleResponse(response, retryFn, retryCount?)`

Handles an HTTP 429 response. Parses rate limit headers, invokes the callback, and either waits + retries or throws `SaucelabsRateLimitError`.

| Parameter | Type | Description |
|---|---|---|
| `response` | `Response` | The fetch Response object. |
| `retryFn` | `function` | Callback to retry the request. |
| `retryCount` | `number` | Current retry attempt (default: 0). |
| **Returns** | `Promise<any>` | Result of the retried request, or throws. |

---

## Config

Environment-based configuration resolution with priority chain: constructor args > environment variables > defaults.

```javascript
import { resolveConfig, resolveCoreBaseUrl, resolveMobileBaseUrl } from 'saucelabs-api-client';
```

### `resolveConfig(options?)`

Resolves a complete configuration object from options, environment variables, and defaults.

```javascript
const config = resolveConfig({
  username: 'my_user',
  region: 'eu-central-1',
});
// => {
//   username: 'my_user',
//   apiKey: '...',              // from SAUCE_ACCESS_KEY env var
//   baseUrl: 'https://api.eu-central-1.saucelabs.com',
//   mobileBaseUrl: 'https://mobile.saucelabs.com',
//   region: 'eu-central-1',
//   mobileRegion: 'us-east',
//   rateLimitAutoWait: true,
//   rateLimitThreshold: 0,
//   onRateLimit: null,
//   logger: null,
//   timeout: 30000,
//   proxy: null,
//   verifySsl: true,
// }
```

### `resolveCoreBaseUrl(region?, baseUrlOverride?)`

Resolves the Core Automation base URL from a region identifier or explicit override.

```javascript
resolveCoreBaseUrl('us-west-1');
// => 'https://api.us-west-1.saucelabs.com'

resolveCoreBaseUrl('eu-central-1');
// => 'https://api.eu-central-1.saucelabs.com'

resolveCoreBaseUrl('us-west-1', 'https://custom-proxy.example.com/');
// => 'https://custom-proxy.example.com'
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `region` | `string` | `"us-west-1"` | Region identifier. |
| `baseUrlOverride` | `string` | `undefined` | Explicit URL override (takes precedence). |
| **Returns** | `string` | -- | Resolved base URL (trailing slashes stripped). |

### `resolveMobileBaseUrl(mobileRegion?, mobileBaseUrlOverride?)`

Resolves the Mobile Distribution base URL from a region identifier or explicit override.

```javascript
resolveMobileBaseUrl('us-east');
// => 'https://mobile.saucelabs.com'

resolveMobileBaseUrl('eu-central-1');
// => 'https://mobile.eu-central-1.saucelabs.com'
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `mobileRegion` | `string` | `"us-east"` | Mobile region identifier. |
| `mobileBaseUrlOverride` | `string` | `undefined` | Explicit URL override (takes precedence). |
| **Returns** | `string` | -- | Resolved mobile base URL (trailing slashes stripped). |

### Environment Variables

| Variable | Type | Default | Description |
|---|---|---|---|
| `SAUCE_USERNAME` | `string` | -- | Primary Sauce Labs username. |
| `SAUCELABS_USERNAME` | `string` | -- | Fallback Sauce Labs username. |
| `SAUCE_ACCESS_KEY` | `string` | -- | Primary Sauce Labs access key. |
| `SAUCELABS_ACCESS_KEY` | `string` | -- | Fallback Sauce Labs access key. |
| `HTTPS_PROXY` | `string` | -- | HTTPS proxy URL (fallback for `proxy` option). |
| `HTTP_PROXY` | `string` | -- | HTTP proxy URL (second fallback for `proxy` option). |
| `LOG_LEVEL` | `string` | `info` | Logging verbosity: `debug`, `info`, `warn`, `error`, `silent`. |

---

## Logger

Structured logging factory with automatic sensitive data redaction.

```javascript
import { createLogger, SDKLogger, LEVELS } from 'saucelabs-api-client';
```

### `createLogger(packageName, filename)`

Creates a new `SDKLogger` instance scoped to a package and file.

```javascript
const log = createLogger('saucelabs-api', 'my-script.mjs');
```

| Parameter | Type | Description |
|---|---|---|
| `packageName` | `string` | The package name for log context. |
| `filename` | `string` | The source filename or `import.meta.url`. |
| **Returns** | `SDKLogger` | A configured logger instance. |

### SDKLogger Methods

All methods accept a message string and an optional context object. Sensitive keys in the context are automatically redacted.

```javascript
log.debug('Cache lookup', { key: '/rest/v1/jobs', hit: false });
log.info('Jobs retrieved', { username: 'demo', count: 42 });
log.warn('Approaching rate limit', { remaining: 5 });
log.error('Request failed', { statusCode: 500, message: 'Internal error' });
```

| Method | Level | When to Use |
|---|---|---|
| `debug(msg, ctx?)` | `0` | Development-time debugging. |
| `info(msg, ctx?)` | `1` | Normal operational messages. |
| `warn(msg, ctx?)` | `2` | Potentially problematic situations. |
| `error(msg, ctx?)` | `3` | Errors that need attention. |

### `LEVELS`

Numeric log level mapping.

```javascript
import { LEVELS } from 'saucelabs-api-client';

console.log(LEVELS);
// => {
//   debug: 0,
//   info: 1,
//   warn: 2,
//   error: 3,
//   silent: 4,
// }
```

### Log Output Format

```
LEVEL  YYYY-MM-DD HH:MM:SS [packageName:filename] message {"context": "data"}
```

Example:

```
INFO  2026-02-01 12:00:00 [saucelabs-api:client] client initialized {"baseUrl":"https://api.us-west-1.saucelabs.com","timeout":30000}
```

### Sensitive Key Redaction

The following key patterns are automatically redacted in log context objects:

- `token`
- `secret`
- `password`
- `key`
- `auth`
- `credential`
- `access_key`
- `api_key`

```javascript
log.info('Client created', { apiKey: 'abcdef123456789', baseUrl: 'https://...' });
// Output: { apiKey: 'abcdef12***', baseUrl: 'https://...' }
// Values > 8 characters show first 8 chars + '***'; shorter values show '***'
```

---

## Types & Constants

Shared constants and type definitions exported by the SDK.

```javascript
import {
  CORE_REGIONS,
  MOBILE_REGIONS,
  DEFAULT_BASE_URL,
  DEFAULT_MOBILE_BASE_URL,
  DEFAULT_TIMEOUT,
  AUTOMATION_API_VALUES,
  VALID_UPLOAD_EXTENSIONS,
  VENDOR,
  VENDOR_VERSION,
} from 'saucelabs-api-client';
```

### `CORE_REGIONS`

Core Automation region base URLs.

```javascript
{
  'us-west-1':    'https://api.us-west-1.saucelabs.com',
  'us-east-4':    'https://api.us-east-4.saucelabs.com',
  'eu-central-1': 'https://api.eu-central-1.saucelabs.com',
}
```

### `MOBILE_REGIONS`

Mobile Distribution region base URLs.

```javascript
{
  'us-east':      'https://mobile.saucelabs.com',
  'eu-central-1': 'https://mobile.eu-central-1.saucelabs.com',
}
```

### Constants

| Constant | Value | Description |
|---|---|---|
| `DEFAULT_BASE_URL` | `"https://api.us-west-1.saucelabs.com"` | Default Core Automation base URL (US West). |
| `DEFAULT_MOBILE_BASE_URL` | `"https://mobile.saucelabs.com"` | Default Mobile Distribution base URL (US East). |
| `DEFAULT_TIMEOUT` | `30000` | Default request timeout in milliseconds. |
| `DEFAULT_MAX_RETRIES` | `5` | Default maximum retries on HTTP 429. |
| `VENDOR` | `"saucelabs_api"` | Vendor identifier for internal routes. |
| `VENDOR_VERSION` | `"v1"` | Vendor API version for internal routes. |
| `AUTOMATION_API_VALUES` | `['all', 'appium', 'webdriver']` | Valid automation API filter values for the platforms endpoint. |
| `VALID_UPLOAD_EXTENSIONS` | `['.apk', '.ipa', '.aab']` | Valid mobile file extensions for upload. |

### Type Definitions (JSDoc)

#### `RateLimitInfo`

```javascript
/**
 * @typedef {Object} RateLimitInfo
 * @property {number} retryAfter     - Seconds to wait before next request
 * @property {number|null} remaining - Remaining requests in current window
 * @property {number|null} limit     - Total request limit for current window
 * @property {Date|null} resetAt     - Timestamp when the rate limit resets
 * @property {Date} timestamp        - When this info was captured
 */
```

#### `SaucelabsClientOptions`

```javascript
/**
 * @typedef {Object} SaucelabsClientOptions
 * @property {string} [apiKey]                - Sauce Labs Access Key
 * @property {string} [username]              - Sauce Labs Username
 * @property {string} [baseUrl]               - Override Core Automation base URL
 * @property {string} [mobileBaseUrl]         - Override Mobile Distribution base URL
 * @property {string} [region='us-west-1']    - Core Automation region
 * @property {string} [mobileRegion='us-east']- Mobile Distribution region
 * @property {boolean} [rateLimitAutoWait=true]- Auto wait and retry on 429
 * @property {number} [rateLimitThreshold=0]  - Buffer for rate limits
 * @property {function} [onRateLimit]         - Rate limit callback
 * @property {object} [logger]               - Custom logger
 * @property {number} [timeout=30000]         - Request timeout in milliseconds
 * @property {string} [proxy]                - HTTP proxy URL
 * @property {boolean} [verifySsl=true]       - Verify SSL certificates
 */
```

#### `RequestOptions`

```javascript
/**
 * @typedef {Object} RequestOptions
 * @property {Object<string, string>} [headers]               - Additional request headers
 * @property {Object<string, string|number|boolean>} [params]  - URL query parameters
 * @property {number} [timeout]                                - Per-request timeout override
 */
```

---

## Convenience Factory

### `createSaucelabsClient(options?)`

Convenience factory that creates a `SaucelabsClient` with all domain modules (jobs, platform, users, upload) pre-attached.

```javascript
import { createSaucelabsClient } from 'saucelabs-api-client';

const client = createSaucelabsClient({
  username: process.env.SAUCE_USERNAME,
  apiKey: process.env.SAUCE_ACCESS_KEY,
  region: 'us-west-1',
});

// All domain modules are available as properties:
const jobs = await client.jobs.list({ limit: 5 });
const status = await client.platform.getStatus();
const user = await client.users.getUser();

client.close();
```

| Parameter | Type | Description |
|---|---|---|
| `options` | `SaucelabsClientOptions` | All options accepted by `SaucelabsClient` constructor. |
| **Returns** | `SaucelabsClient` | Client instance with `.jobs`, `.platform`, `.users`, and `.upload` properties. |

**Attached modules:**

| Property | Type | Description |
|---|---|---|
| `client.jobs` | `JobsModule` | Test job management. |
| `client.platform` | `PlatformModule` | Service status and platform queries. |
| `client.users` | `UsersModule` | User account and concurrency info. |
| `client.upload` | `UploadModule` | Mobile app binary uploads. |
