# Sauce Labs API SDK -- Usage Guide

A practical guide to using the polyglot Sauce Labs API SDK in JavaScript and Python.

---

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Authentication](#authentication)
4. [Creating a Client](#creating-a-client)
5. [Convenience Factory](#convenience-factory)
6. [Using Domain Modules](#using-domain-modules)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)
9. [Configuration](#configuration)
10. [Logging](#logging)
11. [Environment Variables](#environment-variables)
12. [Complete Examples](#complete-examples)

---

## Installation

### JavaScript

```bash
npm install saucelabs-api-client
```

The package ships as ESM-only (`.mjs` files). Requires Node.js 20+.

### Python

```bash
pip install saucelabs-api-client
```

Requires Python 3.11+ with `asyncio` support. Uses `httpx` for HTTP transport and supports `async`/`await` throughout.

---

## Quick Start

### JavaScript

```javascript
import { createSaucelabsClient } from '../src/index.mjs';

const client = createSaucelabsClient({
  username: 'my_user',
  apiKey: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
});

// List recent jobs
const jobs = await client.jobs.list({ limit: 10 });
console.log(`Found ${jobs.length} jobs`);

// Get a specific job
const job = await client.jobs.get('abc123def456');
console.log(`Job status: ${job.status}`);

client.close();
```

### Python

```python
import asyncio
from saucelabs_api import create_saucelabs_client

async def main():
    client = create_saucelabs_client(
        username="my_user",
        api_key="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    )

    async with client:
        # List recent jobs
        jobs = await client.jobs.list(params={"limit": 10})
        print(f"Found {len(jobs)} jobs")

        # Get a specific job
        job = await client.jobs.get("abc123def456")
        print(f"Job status: {job['status']}")

asyncio.run(main())
```

---

## Authentication

The SDK uses HTTP Basic Auth (`username:access_key`) for all authenticated endpoints. Credentials are resolved in the following priority order (identical in both languages):

1. Explicitly passed to the constructor (`username` / `apiKey` in JS, `username` / `api_key` in Python)
2. `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY` environment variables
3. `SAUCELABS_USERNAME` and `SAUCELABS_ACCESS_KEY` environment variables
4. Empty string defaults (the client will still initialize, but authenticated endpoints will fail with a 401)

If no username or access key is found, the SDK logs a warning but does not throw.

### Using Environment Variables (Recommended)

```bash
export SAUCE_USERNAME="my_user"
export SAUCE_ACCESS_KEY="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**JavaScript:**

```javascript
import { SaucelabsClient } from '../src/index.mjs';

// Credentials resolved automatically from environment
const client = new SaucelabsClient();
```

**Python:**

```python
from saucelabs_api import SaucelabsClient

# Credentials resolved automatically from environment
async with SaucelabsClient() as client:
    pass
```

### Explicit Credentials

**JavaScript:**

```javascript
import { SaucelabsClient } from '../src/index.mjs';

const client = new SaucelabsClient({
  username: 'my_user',
  apiKey: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
});
```

**Python:**

```python
from saucelabs_api import SaucelabsClient

client = SaucelabsClient(
    username="my_user",
    api_key="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
)
```

---

## Creating a Client

### SaucelabsClient Constructor

The `SaucelabsClient` is the core HTTP client. It handles Basic Auth header injection, rate limiting, error mapping, request timeouts, and structured logging.

**JavaScript:**

```javascript
import { SaucelabsClient } from '../src/index.mjs';

const client = new SaucelabsClient({
  username: 'my_user',
  apiKey: 'my_access_key',
  region: 'us-west-1',              // 'us-west-1' | 'us-east-4' | 'eu-central-1'
  mobileRegion: 'us-east',          // 'us-east' | 'eu-central-1'
  timeout: 30000,                    // Request timeout in milliseconds
  rateLimitAutoWait: true,           // Auto-wait and retry on 429
  rateLimitThreshold: 0,             // Buffer for rate limits
  onRateLimit: (info) => {           // Optional callback on 429
    console.log(`Rate limited: retry after ${info.retryAfter}s`);
    return true;                     // return false to abort retry
  },
  proxy: 'http://proxy.example.com', // Optional HTTP proxy
  verifySsl: true,                   // SSL certificate verification
  logger: customLoggerObject,        // Optional custom logger override
});

// Use the client...
client.close();
```

**Python:**

```python
from saucelabs_api import SaucelabsClient

async with SaucelabsClient(
    username="my_user",
    api_key="my_access_key",
    region="us-west-1",              # "us-west-1" | "us-east-4" | "eu-central-1"
    mobile_region="us-east",         # "us-east" | "eu-central-1"
    timeout=30.0,                    # Request timeout in seconds
    rate_limit_auto_wait=True,       # Auto-wait and retry on 429
    rate_limit_threshold=0,          # Buffer for rate limits
    on_rate_limit=my_callback,       # Optional callback on 429
    proxy="http://proxy.example.com",# Optional HTTP proxy
    verify_ssl=True,                 # SSL certificate verification
    logger=custom_logger,            # Optional custom logger override
) as client:
    # Use the client...
    pass
```

### resolveConfig / resolve_config

You can inspect the resolved configuration independently without creating a client.

**JavaScript:**

```javascript
import { resolveConfig } from '../src/index.mjs';

const config = resolveConfig({ region: 'eu-central-1' });
console.log(config.baseUrl);      // "https://api.eu-central-1.saucelabs.com"
console.log(config.mobileBaseUrl); // "https://mobile.saucelabs.com"
console.log(config.username);      // resolved from env or ""
console.log(config.timeout);       // 30000 (ms)
```

**Python:**

```python
from saucelabs_api import resolve_config

config = resolve_config(region="eu-central-1")
print(config["base_url"])        # "https://api.eu-central-1.saucelabs.com"
print(config["mobile_base_url"]) # "https://mobile.saucelabs.com"
print(config["username"])         # resolved from env or ""
print(config["timeout"])          # 30.0 (seconds)
```

### Direct HTTP Methods

The `SaucelabsClient` exposes low-level HTTP methods for endpoints not covered by domain modules.

**JavaScript:**

```javascript
const client = new SaucelabsClient();

// GET with query parameters
const jobs = await client.get('/rest/v1/my_user/jobs', {
  params: { limit: 10, format: 'json' },
});

// POST with a JSON body
const result = await client.post('/rest/v1/my_user/jobs/abc123/stop', {});

// Raw response (no JSON parsing)
const raw = await client.getRaw('/rest/v1/my_user/jobs/abc123/assets/video.mp4');
```

**Python:**

```python
async with SaucelabsClient() as client:
    # GET with query parameters
    jobs = await client.get("/rest/v1/my_user/jobs", params={
        "limit": 10, "format": "json",
    })

    # POST with a JSON body
    result = await client.post("/rest/v1/my_user/jobs/abc123/stop", json={})

    # Raw response (no JSON parsing)
    raw = await client.get_raw("/rest/v1/my_user/jobs/abc123/assets/video.mp4")
```

---

## Convenience Factory

The `createSaucelabsClient` / `create_saucelabs_client` factory creates a `SaucelabsClient` with all domain modules pre-attached as properties: `.jobs`, `.platform`, `.users`, and `.upload`.

### JavaScript

```javascript
import { createSaucelabsClient } from '../src/index.mjs';

const client = createSaucelabsClient({
  username: 'my_user',
  apiKey: 'my_access_key',
  region: 'us-west-1',
});

// Domain modules are ready to use
const jobs = await client.jobs.list({ limit: 5 });
const status = await client.platform.getStatus();
const user = await client.users.getUser();

client.close();
```

### Python

```python
from saucelabs_api import create_saucelabs_client

client = create_saucelabs_client(
    username="my_user",
    api_key="my_access_key",
    region="us-west-1",
)

async with client:
    # Domain modules are ready to use
    jobs = await client.jobs.list(params={"limit": 5})
    status = await client.platform.get_status()
    user = await client.users.get_user()
```

You can also pass a `SaucelabsClientOptions` dataclass (Python only):

```python
from saucelabs_api import create_saucelabs_client, SaucelabsClientOptions

options = SaucelabsClientOptions(
    username="my_user",
    api_key="my_access_key",
    region="eu-central-1",
)

client = create_saucelabs_client(options)
```

---

## Using Domain Modules

Domain modules provide typed, ergonomic access to specific areas of the Sauce Labs API. They are attached automatically when using the convenience factory, or can be instantiated manually with a `SaucelabsClient` instance.

### Jobs

Manage test execution history (VDC and RDC).

| Method | HTTP Endpoint | Description |
|--------|--------------|-------------|
| `list` | `GET /rest/v1/{username}/jobs` | List test jobs |
| `get` | `GET /rest/v1.1/{username}/jobs/{id}` | Get job details |

**JavaScript:**

```javascript
import { createSaucelabsClient } from '../src/index.mjs';

const client = createSaucelabsClient();

// List jobs with optional filters
const jobs = await client.jobs.list({
  limit: 25,          // Number of jobs to return (default: 25)
  skip: 0,            // Number of jobs to skip
  from: 1700000000,   // Unix timestamp start filter
  to: 1700100000,     // Unix timestamp end filter
});

// Get a specific job by ID
const job = await client.jobs.get('abc123def456');
console.log(job.status, job.browser, job.os);

client.close();
```

**Python:**

```python
from saucelabs_api import create_saucelabs_client

async with create_saucelabs_client() as client:
    # List jobs with optional filters
    jobs = await client.jobs.list(params={
        "limit": 25,          # Number of jobs to return (default: 25)
        "skip": 0,            # Number of jobs to skip
        "from": 1700000000,   # Unix timestamp start filter
        "to": 1700100000,     # Unix timestamp end filter
    })

    # Get a specific job by ID
    job = await client.jobs.get("abc123def456")
    print(job["status"], job["browser"], job["os"])
```

### Platform

Check service status and query supported configurations. Both endpoints are public and do not require authentication.

| Method | HTTP Endpoint | Description |
|--------|--------------|-------------|
| `getStatus` / `get_status` | `GET /rest/v1/info/status` | Service status (public) |
| `getPlatforms` / `get_platforms` | `GET /rest/v1/info/platforms/{api}` | Supported platforms (public) |

**JavaScript:**

```javascript
import { createSaucelabsClient } from '../src/index.mjs';

const client = createSaucelabsClient();

// Check Sauce Labs service status (no auth required)
const status = await client.platform.getStatus();
console.log(status);

// Get supported platforms filtered by automation backend
// Valid values: 'all', 'appium', 'webdriver'
const platforms = await client.platform.getPlatforms('appium');
console.log(`${platforms.length} Appium platforms available`);

client.close();
```

**Python:**

```python
from saucelabs_api import create_saucelabs_client

async with create_saucelabs_client() as client:
    # Check Sauce Labs service status (no auth required)
    status = await client.platform.get_status()
    print(status)

    # Get supported platforms filtered by automation backend
    # Valid values: "all", "appium", "webdriver"
    platforms = await client.platform.get_platforms("appium")
    print(f"{len(platforms)} Appium platforms available")
```

### Users

Retrieve user account details and concurrency/usage statistics.

| Method | HTTP Endpoint | Description |
|--------|--------------|-------------|
| `getUser` / `get_user` | `GET /rest/v1.2/users/{username}` | User info |
| `getConcurrency` / `get_concurrency` | `GET /rest/v1.2/users/{username}/concurrency` | Concurrency stats |

**JavaScript:**

```javascript
import { createSaucelabsClient } from '../src/index.mjs';

const client = createSaucelabsClient();

// Get info for the configured user (defaults to client.username)
const user = await client.users.getUser();
console.log(user.username, user.email);

// Get info for a different user
const otherUser = await client.users.getUser('other_user');

// Get concurrency and usage statistics
const concurrency = await client.users.getConcurrency();
console.log(concurrency);

client.close();
```

**Python:**

```python
from saucelabs_api import create_saucelabs_client

async with create_saucelabs_client() as client:
    # Get info for the configured user (defaults to client.username)
    user = await client.users.get_user()
    print(user["username"], user["email"])

    # Get info for a different user
    other_user = await client.users.get_user("other_user")

    # Get concurrency and usage statistics
    concurrency = await client.users.get_concurrency()
    print(concurrency)
```

### Upload

Upload mobile app binaries (APK, IPA, AAB) to the Sauce Labs Mobile Distribution platform.

| Method | HTTP Endpoint | Description |
|--------|--------------|-------------|
| `uploadApp` / `upload_app` | `POST /api/upload/` (mobile base URL) | Upload a mobile binary |

**JavaScript:**

```javascript
import { createSaucelabsClient } from '../src/index.mjs';

const client = createSaucelabsClient();

const result = await client.upload.uploadApp({
  file: '/path/to/MyApp.apk',        // File path or Buffer
  apiKey: 'distribution_api_key',     // Distribution API key
  appName: 'My Application',         // Optional display name
  uploadToSaucelabs: true,           // Also upload to Real Device Cloud
  notify: false,                     // Email testers about the upload
});

console.log(result);

client.close();
```

**Python:**

```python
from saucelabs_api import create_saucelabs_client

async with create_saucelabs_client() as client:
    result = await client.upload.upload_app(
        file="/path/to/MyApp.apk",        # File path or bytes
        api_key="distribution_api_key",    # Distribution API key
        app_name="My Application",         # Optional display name
        upload_to_saucelabs=True,          # Also upload to Real Device Cloud
        notify=False,                      # Email testers about the upload
    )

    print(result)
```

Valid file extensions: `.apk`, `.ipa`, `.aab`.

### Manual Module Instantiation

If you prefer not to use the convenience factory, you can attach domain modules manually:

**JavaScript:**

```javascript
import { SaucelabsClient, JobsModule, PlatformModule } from '../src/index.mjs';

const client = new SaucelabsClient({ username: 'my_user', apiKey: 'my_key' });
const jobs = new JobsModule(client);
const platform = new PlatformModule(client);

const jobList = await jobs.list({ limit: 5 });
const status = await platform.getStatus();

client.close();
```

**Python:**

```python
from saucelabs_api import SaucelabsClient, JobsModule, PlatformModule

async with SaucelabsClient(username="my_user", api_key="my_key") as client:
    jobs = JobsModule(client)
    platform = PlatformModule(client)

    job_list = await jobs.list(params={"limit": 5})
    status = await platform.get_status()
```

---

## Error Handling

The SDK provides a structured error hierarchy for all Sauce Labs API failures. Every non-2xx HTTP response is mapped to a specific error subclass.

### Error Hierarchy

```
SaucelabsError (base)
  |-- SaucelabsAuthError         (HTTP 401)
  |-- SaucelabsNotFoundError     (HTTP 404)
  |-- SaucelabsRateLimitError    (HTTP 429)
  |-- SaucelabsValidationError   (HTTP 400, 422)
  |-- SaucelabsServerError       (HTTP 5xx)
  |-- SaucelabsConfigError       (missing configuration)
```

### Error Properties

Every `SaucelabsError` exposes the following:

| Property | JavaScript | Python | Description |
|----------|-----------|--------|-------------|
| Message | `err.message` | `str(err)` | Human-readable description |
| Status Code | `err.statusCode` | `err.status_code` | HTTP status code (0 for config errors) |
| Response Body | `err.responseBody` | `err.response_body` | Parsed response body |
| Headers | `err.headers` | `err.headers` | Response headers |
| Endpoint | `err.endpoint` | `err.endpoint` | Request path |
| Method | `err.method` | `err.method` | HTTP method |
| Timestamp | `err.timestamp` | N/A | ISO timestamp (JS only) |
| Retry After | `err.retryAfter` | `err.retry_after` | Seconds to wait (RateLimitError only) |

### Catching Specific Errors

**JavaScript:**

```javascript
import {
  createSaucelabsClient,
  SaucelabsError,
  SaucelabsAuthError,
  SaucelabsNotFoundError,
  SaucelabsRateLimitError,
  SaucelabsValidationError,
  SaucelabsServerError,
} from '../src/index.mjs';

const client = createSaucelabsClient();

try {
  const job = await client.jobs.get('INVALID_ID');
} catch (err) {
  if (err instanceof SaucelabsAuthError) {
    console.error('Invalid credentials:', err.message);
  } else if (err instanceof SaucelabsNotFoundError) {
    console.error('Job not found:', err.message);
  } else if (err instanceof SaucelabsRateLimitError) {
    console.error(`Rate limited. Retry after ${err.retryAfter}s`);
  } else if (err instanceof SaucelabsValidationError) {
    console.error('Bad request:', err.message);
  } else if (err instanceof SaucelabsServerError) {
    console.error('Server error. Check https://status.saucelabs.com');
  } else if (err instanceof SaucelabsError) {
    console.error(`API error [${err.statusCode}]:`, err.message);
    console.error(err.toJSON());
  }
}

client.close();
```

**Python:**

```python
from saucelabs_api import (
    create_saucelabs_client,
    SaucelabsError,
    SaucelabsAuthError,
    SaucelabsNotFoundError,
    SaucelabsRateLimitError,
    SaucelabsValidationError,
    SaucelabsServerError,
)

async with create_saucelabs_client() as client:
    try:
        job = await client.jobs.get("INVALID_ID")
    except SaucelabsAuthError as err:
        print(f"Invalid credentials: {err}")
    except SaucelabsNotFoundError as err:
        print(f"Job not found: {err}")
    except SaucelabsRateLimitError as err:
        print(f"Rate limited. Retry after {err.retry_after}s")
    except SaucelabsValidationError as err:
        print(f"Bad request: {err}")
    except SaucelabsServerError as err:
        print("Server error. Check https://status.saucelabs.com")
    except SaucelabsError as err:
        print(f"API error [{err.status_code}]: {err}")
```

### Error Factory

Both languages expose a `createErrorFromResponse` / `create_error_from_response` factory that maps an HTTP status code, response body, and headers to the appropriate error subclass.

**JavaScript:**

```javascript
import { createErrorFromResponse } from '../src/index.mjs';

const err = createErrorFromResponse(404, { message: 'Not found' }, {});
console.log(err instanceof SaucelabsNotFoundError); // true
console.log(err.statusCode);                         // 404
```

**Python:**

```python
from saucelabs_api import create_error_from_response

err = create_error_from_response(404, {"message": "Not found"}, {})
print(isinstance(err, SaucelabsNotFoundError))  # True
print(err.status_code)                            # 404
```

---

## Rate Limiting

Sauce Labs enforces rate limits of approximately 10 requests per second (3,500 per hour) for authenticated requests. When exceeded, the API responds with HTTP 429 and a `Retry-After` header.

### Automatic Waiting (Default Behavior)

When `rateLimitAutoWait` / `rate_limit_auto_wait` is `true` (the default), the SDK will:

1. Detect an HTTP 429 response.
2. Parse the `Retry-After` header.
3. Wait the specified duration (or fall back to exponential backoff).
4. Retry the request (up to 5 retries by default).

No user code is required. This happens transparently inside the client.

### Callback for Visibility

You can register an `onRateLimit` / `on_rate_limit` callback to be notified when rate limiting occurs. The callback receives a `RateLimitInfo` object and can return `false` to abort the retry.

**JavaScript:**

```javascript
import { createSaucelabsClient } from '../src/index.mjs';

const client = createSaucelabsClient({
  rateLimitAutoWait: true,
  onRateLimit: (info) => {
    console.log(`Rate limited! Retry after ${info.retryAfter}s`);
    console.log(`Remaining: ${info.remaining}, Limit: ${info.limit}`);

    // Return false to skip waiting and let the error propagate
    if (info.retryAfter > 120) {
      return false;
    }
    // Return true or undefined to proceed with auto-wait
    return true;
  },
});
```

**Python:**

```python
from saucelabs_api import create_saucelabs_client

def on_rate_limit(info):
    print(f"Rate limited! Retry after {info.retry_after}s")
    print(f"Remaining: {info.remaining}, Limit: {info.limit}")

    # Return False to skip waiting and raise the error
    if info.retry_after > 120:
        return False
    return True

client = create_saucelabs_client(
    rate_limit_auto_wait=True,
    on_rate_limit=on_rate_limit,
)
```

The Python callback can be either synchronous or `async`.

### Manual Handling (Auto-Wait Disabled)

If you disable auto-wait, the SDK raises a `SaucelabsRateLimitError` immediately on 429. You can then implement your own retry logic.

**JavaScript:**

```javascript
import { createSaucelabsClient, SaucelabsRateLimitError } from '../src/index.mjs';

const client = createSaucelabsClient({ rateLimitAutoWait: false });

try {
  const jobs = await client.jobs.list();
} catch (err) {
  if (err instanceof SaucelabsRateLimitError) {
    console.log(`Rate limited. Retry after ${err.retryAfter}s`);
    // Implement your own retry logic here
  }
}

client.close();
```

**Python:**

```python
from saucelabs_api import create_saucelabs_client, SaucelabsRateLimitError

async with create_saucelabs_client(rate_limit_auto_wait=False) as client:
    try:
        jobs = await client.jobs.list()
    except SaucelabsRateLimitError as err:
        print(f"Rate limited. Retry after {err.retry_after}s")
        # Implement your own retry logic here
```

### Backoff Calculation

The SDK uses exponential backoff with jitter when the `Retry-After` header is absent. The formula is:

```
delay = min(base_delay * 2^retry_count + random(0, base_delay), max_delay)
```

Default values: `base_delay=1s`, `max_delay=60s`.

**JavaScript:**

```javascript
import { calculateBackoff } from '../src/index.mjs';

for (let attempt = 0; attempt < 6; attempt++) {
  const delay = calculateBackoff(attempt, 1, 60);
  console.log(`Attempt ${attempt}: ~${delay.toFixed(1)}s`);
}
// Attempt 0: ~1.3s
// Attempt 1: ~2.7s
// Attempt 2: ~4.4s
// Attempt 3: ~8.9s
// Attempt 4: ~16.2s
// Attempt 5: ~32.6s
```

**Python:**

```python
from saucelabs_api import RateLimiter

for attempt in range(6):
    delay = RateLimiter._calculate_backoff(attempt, base_delay=1.0, max_delay=60.0)
    print(f"Attempt {attempt}: ~{delay:.1f}s")
```

### Inspecting Last Rate Limit

**JavaScript:**

```javascript
const lastLimit = client.lastRateLimit;
if (lastLimit) {
  console.log(`Retry after: ${lastLimit.retryAfter}s`);
  console.log(`Remaining: ${lastLimit.remaining}`);
  console.log(`Limit: ${lastLimit.limit}`);
  console.log(`Reset at: ${lastLimit.resetAt}`);
}
```

**Python:**

```python
last_limit = client.last_rate_limit
if last_limit:
    print(f"Retry after: {last_limit.retry_after}s")
    print(f"Remaining: {last_limit.remaining}")
    print(f"Limit: {last_limit.limit}")
    print(f"Reset at: {last_limit.reset_at}")
```

---

## Configuration

### Regions

The SDK supports multiple Sauce Labs data center regions for both Core Automation and Mobile Distribution.

**Core Automation Regions:**

| Region ID | Base URL |
|-----------|---------|
| `us-west-1` (default) | `https://api.us-west-1.saucelabs.com` |
| `us-east-4` | `https://api.us-east-4.saucelabs.com` |
| `eu-central-1` | `https://api.eu-central-1.saucelabs.com` |

**Mobile Distribution Regions:**

| Region ID | Base URL |
|-----------|---------|
| `us-east` (default) | `https://mobile.saucelabs.com` |
| `eu-central-1` | `https://mobile.eu-central-1.saucelabs.com` |

### Region-Based URL Resolution

**JavaScript:**

```javascript
import { resolveCoreBaseUrl, resolveMobileBaseUrl } from '../src/index.mjs';

console.log(resolveCoreBaseUrl('us-west-1'));
// "https://api.us-west-1.saucelabs.com"

console.log(resolveCoreBaseUrl('eu-central-1'));
// "https://api.eu-central-1.saucelabs.com"

// Custom base URL override (takes priority over region)
console.log(resolveCoreBaseUrl('us-west-1', 'https://custom-proxy.example.com/'));
// "https://custom-proxy.example.com"

console.log(resolveMobileBaseUrl('eu-central-1'));
// "https://mobile.eu-central-1.saucelabs.com"
```

**Python:**

```python
from saucelabs_api import resolve_core_base_url, resolve_mobile_base_url

print(resolve_core_base_url("us-west-1"))
# "https://api.us-west-1.saucelabs.com"

print(resolve_core_base_url("eu-central-1"))
# "https://api.eu-central-1.saucelabs.com"

# Custom base URL override (takes priority over region)
print(resolve_core_base_url("us-west-1", "https://custom-proxy.example.com/"))
# "https://custom-proxy.example.com"

print(resolve_mobile_base_url("eu-central-1"))
# "https://mobile.eu-central-1.saucelabs.com"
```

### resolveConfig / resolve_config

The `resolveConfig` / `resolve_config` function returns a complete configuration object after applying the full priority chain: constructor args > environment variables > defaults.

**JavaScript:**

```javascript
import { resolveConfig } from '../src/index.mjs';

const config = resolveConfig({
  region: 'eu-central-1',
  timeout: 60000,
});

console.log(config);
// {
//   username: "...",
//   apiKey: "...",
//   baseUrl: "https://api.eu-central-1.saucelabs.com",
//   mobileBaseUrl: "https://mobile.saucelabs.com",
//   region: "eu-central-1",
//   mobileRegion: "us-east",
//   rateLimitAutoWait: true,
//   rateLimitThreshold: 0,
//   onRateLimit: null,
//   logger: null,
//   timeout: 60000,
//   proxy: null,
//   verifySsl: true,
// }
```

**Python:**

```python
from saucelabs_api import resolve_config

config = resolve_config(
    region="eu-central-1",
    timeout=60.0,
)

print(config)
# {
#   "username": "...",
#   "api_key": "...",
#   "base_url": "https://api.eu-central-1.saucelabs.com",
#   "mobile_base_url": "https://mobile.saucelabs.com",
#   "region": "eu-central-1",
#   "mobile_region": "us-east",
#   "rate_limit_auto_wait": True,
#   "rate_limit_threshold": 0,
#   "on_rate_limit": None,
#   "logger": None,
#   "timeout": 60.0,
#   "proxy": None,
#   "verify_ssl": True,
# }
```

### SDK Defaults

| Setting | JavaScript | Python |
|---------|-----------|--------|
| Base URL | `https://api.us-west-1.saucelabs.com` | `https://api.us-west-1.saucelabs.com` |
| Mobile Base URL | `https://mobile.saucelabs.com` | `https://mobile.saucelabs.com` |
| Timeout | `30000` (ms) | `30.0` (seconds) |
| Max Retries | `5` | `5` |
| Rate Limit Auto Wait | `true` | `True` |

---

## Logging

The SDK includes a structured logger with configurable verbosity and automatic sensitive data redaction.

### Setting Log Level

Set the `LOG_LEVEL` environment variable to control output verbosity:

```bash
export LOG_LEVEL=debug    # debug | info | warn | error | silent
```

JavaScript levels: `debug`, `info`, `warn`, `error`, `silent` (default: `info`).
Python levels: `DEBUG`, `INFO`, `WARNING`, `ERROR`, `SILENT` (default: `INFO`).

### Log Output Format

**JavaScript:**

```
2025-01-15 10:30:00 [saucelabs-api:client] INFO client initialized {"baseUrl":"https://api.us-west-1.saucelabs.com"}
```

**Python:**

```
2025-01-15T10:30:00.123Z [saucelabs_api:client] INFO client initialized {'base_url': 'https://api.us-west-1.saucelabs.com'}
```

### Creating a Logger

**JavaScript:**

```javascript
import { createLogger } from '../src/index.mjs';

const logger = createLogger('my-app', 'my-module');

logger.debug('detailed trace info');
logger.info('operational info');
logger.warn('something looks wrong');
logger.error('an error occurred');
```

**Python:**

```python
from saucelabs_api import create_logger

logger = create_logger("my_app", "my_module")

logger.debug("detailed trace info")
logger.info("operational info")
logger.warning("something looks wrong")
logger.error("an error occurred")
```

### Custom Logger

You can inject a custom logger object with `debug`, `info`, `warn`/`warning`, and `error` methods.

**JavaScript:**

```javascript
import { SaucelabsClient } from '../src/index.mjs';

const logs = [];
const customLogger = {
  debug: (msg) => logs.push({ level: 'debug', msg }),
  info: (msg) => logs.push({ level: 'info', msg }),
  warn: (msg) => logs.push({ level: 'warn', msg }),
  error: (msg) => logs.push({ level: 'error', msg }),
};

const client = new SaucelabsClient({
  username: 'my_user',
  apiKey: 'my_key',
  logger: customLogger,
});
```

**Python:**

```python
from saucelabs_api import SaucelabsClient

class MyLogger:
    def debug(self, message, context=None):
        print(f"[D] {message}")
    def info(self, message, context=None):
        print(f"[I] {message}")
    def warning(self, message, context=None):
        print(f"[W] {message}")
    def error(self, message, context=None):
        print(f"[E] {message}")

client = SaucelabsClient(
    username="my_user",
    api_key="my_key",
    logger=MyLogger(),
)
```

### Sensitive Data Redaction

The logger automatically redacts values for keys matching the following patterns: `token`, `secret`, `password`, `key`, `auth`, `credential`, `access_key`, `api_key`.

**JavaScript:**

```javascript
// Logged context: {"username":"demo","apiKey":"***","access_key":"demo_sec***"}
logger.info('config loaded', {
  username: 'demo',
  apiKey: 'my_secret_key',
  access_key: 'demo_secret_key_12345',
});
```

**Python:**

```python
# Logged context: {'username': 'demo', 'api_key': '[REDACTED]', 'access_key': '[REDACTED]'}
logger.info("config loaded", {
    "username": "demo",
    "api_key": "my_secret_key",
    "access_key": "demo_secret_key_12345",
})
```

---

## Environment Variables

Both implementations support the same set of environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `SAUCE_USERNAME` | Sauce Labs username | `""` |
| `SAUCE_ACCESS_KEY` | Sauce Labs access key | `""` |
| `SAUCELABS_USERNAME` | Sauce Labs username (fallback) | `""` |
| `SAUCELABS_ACCESS_KEY` | Sauce Labs access key (fallback) | `""` |
| `LOG_LEVEL` | Log verbosity: `debug`, `info`, `warn`, `error`, `silent` | `info` |
| `HTTPS_PROXY` | HTTPS proxy URL | (none) |
| `HTTP_PROXY` | HTTP proxy URL (fallback) | (none) |

Credential resolution priority: constructor args > `SAUCE_USERNAME`/`SAUCE_ACCESS_KEY` > `SAUCELABS_USERNAME`/`SAUCELABS_ACCESS_KEY` > empty string.

---

## Complete Examples

### List Recent Jobs and Print Summary

**JavaScript:**

```javascript
import { createSaucelabsClient, SaucelabsError } from '../src/index.mjs';

async function listRecentJobs() {
  const client = createSaucelabsClient({
    timeout: 60000,
    rateLimitAutoWait: true,
  });

  try {
    // List the 10 most recent jobs
    const jobs = await client.jobs.list({ limit: 10 });

    console.log(`Found ${jobs.length} recent jobs:\n`);
    for (const job of jobs) {
      console.log(`  [${job.id}] ${job.name || '(unnamed)'}`);
      console.log(`    Status: ${job.status} | Browser: ${job.browser} | OS: ${job.os}`);
      console.log();
    }

    // Get details for the first job
    if (jobs.length > 0) {
      const detail = await client.jobs.get(jobs[0].id);
      console.log('First job details:', JSON.stringify(detail, null, 2));
    }

    // Check the user's concurrency
    const concurrency = await client.users.getConcurrency();
    console.log('Concurrency:', concurrency);

  } catch (err) {
    if (err instanceof SaucelabsError) {
      console.error(`API Error [${err.statusCode}]: ${err.message}`);
      console.error('Endpoint:', err.endpoint);
      console.error('Details:', JSON.stringify(err.toJSON(), null, 2));
    } else {
      throw err;
    }
  } finally {
    client.close();
  }
}

listRecentJobs();
```

**Python:**

```python
import asyncio
from saucelabs_api import create_saucelabs_client, SaucelabsError

async def list_recent_jobs():
    client = create_saucelabs_client(
        timeout=60.0,
        rate_limit_auto_wait=True,
    )

    async with client:
        try:
            # List the 10 most recent jobs
            jobs = await client.jobs.list(params={"limit": 10})

            print(f"Found {len(jobs)} recent jobs:\n")
            for job in jobs:
                print(f"  [{job['id']}] {job.get('name', '(unnamed)')}")
                print(f"    Status: {job['status']} | Browser: {job['browser']} | OS: {job['os']}")
                print()

            # Get details for the first job
            if jobs:
                detail = await client.jobs.get(jobs[0]["id"])
                print("First job details:", detail)

            # Check the user's concurrency
            concurrency = await client.users.get_concurrency()
            print("Concurrency:", concurrency)

        except SaucelabsError as err:
            print(f"API Error [{err.status_code}]: {err}")
            print(f"Endpoint: {err.endpoint}")

asyncio.run(list_recent_jobs())
```

### Check Platform Status and Supported Browsers

**JavaScript:**

```javascript
import { createSaucelabsClient } from '../src/index.mjs';

async function checkPlatform() {
  // Platform endpoints are public -- no credentials needed
  const client = createSaucelabsClient();

  try {
    // Service health check
    const status = await client.platform.getStatus();
    console.log('Sauce Labs Status:', status);

    // List all supported WebDriver platforms
    const platforms = await client.platform.getPlatforms('webdriver');
    console.log(`\n${platforms.length} WebDriver platforms available.`);

    // Group by OS
    const byOs = {};
    for (const p of platforms) {
      const os = p.os || 'Unknown';
      byOs[os] = (byOs[os] || 0) + 1;
    }
    console.log('\nPlatforms by OS:');
    for (const [os, count] of Object.entries(byOs)) {
      console.log(`  ${os}: ${count}`);
    }

    // List Appium platforms
    const appiumPlatforms = await client.platform.getPlatforms('appium');
    console.log(`\n${appiumPlatforms.length} Appium platforms available.`);

  } finally {
    client.close();
  }
}

checkPlatform();
```

**Python:**

```python
import asyncio
from collections import Counter
from saucelabs_api import create_saucelabs_client

async def check_platform():
    # Platform endpoints are public -- no credentials needed
    async with create_saucelabs_client() as client:
        # Service health check
        status = await client.platform.get_status()
        print("Sauce Labs Status:", status)

        # List all supported WebDriver platforms
        platforms = await client.platform.get_platforms("webdriver")
        print(f"\n{len(platforms)} WebDriver platforms available.")

        # Group by OS
        by_os = Counter(p.get("os", "Unknown") for p in platforms)
        print("\nPlatforms by OS:")
        for os_name, count in by_os.most_common():
            print(f"  {os_name}: {count}")

        # List Appium platforms
        appium_platforms = await client.platform.get_platforms("appium")
        print(f"\n{len(appium_platforms)} Appium platforms available.")

asyncio.run(check_platform())
```

### Upload a Mobile App with Error Handling

**JavaScript:**

```javascript
import {
  createSaucelabsClient,
  SaucelabsValidationError,
  SaucelabsAuthError,
  SaucelabsError,
} from '../src/index.mjs';

async function uploadMobileApp() {
  const client = createSaucelabsClient({
    region: 'us-west-1',
    rateLimitAutoWait: true,
    onRateLimit: (info) => {
      console.log(`Rate limited during upload. Waiting ${info.retryAfter}s...`);
      return true;
    },
  });

  try {
    const result = await client.upload.uploadApp({
      file: './builds/MyApp.apk',
      apiKey: process.env.SAUCE_DISTRIBUTION_KEY,
      appName: 'MyApp v2.0',
      uploadToSaucelabs: true,
      notify: true,
    });

    console.log('Upload successful:', result);
  } catch (err) {
    if (err instanceof SaucelabsValidationError) {
      console.error('Invalid upload parameters:', err.message);
    } else if (err instanceof SaucelabsAuthError) {
      console.error('Authentication failed:', err.message);
    } else if (err instanceof SaucelabsError) {
      console.error(`Upload failed [${err.statusCode}]:`, err.message);
    } else {
      throw err;
    }
  } finally {
    client.close();
  }
}

uploadMobileApp();
```

**Python:**

```python
import asyncio
import os
from saucelabs_api import (
    create_saucelabs_client,
    SaucelabsValidationError,
    SaucelabsAuthError,
    SaucelabsError,
)

async def upload_mobile_app():
    client = create_saucelabs_client(
        region="us-west-1",
        rate_limit_auto_wait=True,
        on_rate_limit=lambda info: print(
            f"Rate limited during upload. Waiting {info.retry_after}s..."
        ) or True,
    )

    async with client:
        try:
            result = await client.upload.upload_app(
                file="./builds/MyApp.apk",
                api_key=os.environ["SAUCE_DISTRIBUTION_KEY"],
                app_name="MyApp v2.0",
                upload_to_saucelabs=True,
                notify=True,
            )

            print("Upload successful:", result)
        except SaucelabsValidationError as err:
            print(f"Invalid upload parameters: {err}")
        except SaucelabsAuthError as err:
            print(f"Authentication failed: {err}")
        except SaucelabsError as err:
            print(f"Upload failed [{err.status_code}]: {err}")

asyncio.run(upload_mobile_app())
```
