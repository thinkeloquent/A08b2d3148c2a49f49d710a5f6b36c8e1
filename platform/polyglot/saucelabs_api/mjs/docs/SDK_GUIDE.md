# Sauce Labs API SDK -- Node.js Usage Guide

> Package: `saucelabs-api-client` | Module format: ESM (`.mjs`) | Runtime: Node.js 20+

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Client Creation](#client-creation)
- [Domain Module Usage](#domain-module-usage)
  - [JobsModule](#jobsmodule)
  - [PlatformModule](#platformmodule)
  - [UsersModule](#usersmodule)
  - [UploadModule](#uploadmodule)
- [Error Handling](#error-handling)
- [Rate Limiting Configuration](#rate-limiting-configuration)
- [Logging Configuration](#logging-configuration)
- [Configuration and Regions](#configuration-and-regions)
- [Environment Variables](#environment-variables)
- [Complete Working Example](#complete-working-example)

---

## Installation

Install the package using pnpm:

```bash
pnpm install
```

The SDK is published as `saucelabs-api-client` and uses ESM (`.mjs`) exclusively. Ensure your `package.json` has `"type": "module"` or use the `.mjs` file extension for all imports.

---

## Quick Start

```javascript
import { createSaucelabsClient } from 'saucelabs-api-client';

// The client reads SAUCE_USERNAME and SAUCE_ACCESS_KEY from env
const client = createSaucelabsClient();

// Check Sauce Labs service status (public, no auth needed)
const status = await client.platform.getStatus();
console.log('Service status:', status.status_message);

// List recent test jobs
const jobs = await client.jobs.list({ limit: 5 });
console.log('Recent jobs:', jobs.length);

// Clean up
client.close();
```

If you prefer to pass credentials explicitly:

```javascript
const client = createSaucelabsClient({
  username: 'your_sauce_username',
  apiKey: 'your_sauce_access_key',
});
```

---

## Client Creation

### Using `createSaucelabsClient()` (Recommended)

The convenience factory creates a `SaucelabsClient` with all four domain modules pre-attached:

```javascript
import { createSaucelabsClient } from 'saucelabs-api-client';

const client = createSaucelabsClient({
  username: process.env.SAUCE_USERNAME,
  apiKey: process.env.SAUCE_ACCESS_KEY,
  region: 'us-west-1',
  timeout: 30000,
  rateLimitAutoWait: true,
});

// Access modules directly:
client.jobs       // => JobsModule
client.platform   // => PlatformModule
client.users      // => UsersModule
client.upload     // => UploadModule
```

### Using `SaucelabsClient` Directly

For lower-level control, create the client and attach modules manually:

```javascript
import { SaucelabsClient, JobsModule, PlatformModule } from 'saucelabs-api-client';

const client = new SaucelabsClient({
  username: process.env.SAUCE_USERNAME,
  apiKey: process.env.SAUCE_ACCESS_KEY,
});

const jobs = new JobsModule(client);
const platform = new PlatformModule(client);

const jobList = await jobs.list({ limit: 10 });
const status = await platform.getStatus();
```

### Full Configuration Options

```javascript
import { createSaucelabsClient } from 'saucelabs-api-client';

const client = createSaucelabsClient({
  // Authentication
  username: process.env.SAUCE_USERNAME,
  apiKey: process.env.SAUCE_ACCESS_KEY,

  // Region (determines base URL if baseUrl is not set)
  region: 'eu-central-1',

  // Explicit URL overrides (take precedence over region)
  baseUrl: 'https://api.eu-central-1.saucelabs.com',
  mobileBaseUrl: 'https://mobile.eu-central-1.saucelabs.com',

  // Request timeout in milliseconds
  timeout: 30000,

  // Rate limiting
  rateLimitAutoWait: true,
  onRateLimit: (rateLimitInfo) => {
    console.warn(`Rate limited: retry after ${rateLimitInfo.retryAfter}s`);
    // Return false to prevent auto-wait, or true/undefined to allow it
    return true;
  },

  // Logging
  logger: customLogger,

  // Network
  proxy: 'https://proxy.example.com:8080',
  verifySsl: true,
});
```

### Inspecting Client State

```javascript
// Check the configured username
console.log(client.username);
// => 'demo_user'

// Check the most recent rate limit event
if (client.lastRateLimit) {
  console.log(`Last rate limit: retry after ${client.lastRateLimit.retryAfter}s`);
  console.log(`Remaining requests: ${client.lastRateLimit.remaining}`);
}
```

---

## Domain Module Usage

The SDK organizes API operations into four domain modules. Each module is available as a property on the client when using `createSaucelabsClient()`.

---

### JobsModule

Manage test execution history (VDC & RDC).

**List recent test jobs:**

```javascript
const jobs = await client.jobs.list({ limit: 10 });

for (const job of jobs) {
  console.log(`Job: ${job.id} - ${job.name} - ${job.status}`);
}
```

**List jobs with pagination and time filters:**

```javascript
const jobs = await client.jobs.list({
  limit: 25,
  skip: 50,                      // skip the first 50 jobs
  from: 1706745600,              // Unix timestamp start
  to: 1706832000,                // Unix timestamp end
});
```

**Get details for a specific job:**

```javascript
const job = await client.jobs.get('abc123def456');

console.log(`Job: ${job.name}`);
console.log(`Status: ${job.status}`);
console.log(`Browser: ${job.browser}`);
console.log(`OS: ${job.os}`);
console.log(`Duration: ${job.end_time - job.creation_time}s`);
```

---

### PlatformModule

Check service status and supported configurations.

**Check Sauce Labs service status (public, no auth needed):**

```javascript
const status = await client.platform.getStatus();

console.log(`Operational: ${status.service_operational}`);
console.log(`Status: ${status.status_message}`);
console.log(`Wait time: ${status.wait_time}s`);
```

**Get supported platforms:**

```javascript
// All platforms
const all = await client.platform.getPlatforms('all');

// Appium platforms only
const appium = await client.platform.getPlatforms('appium');

// WebDriver platforms only
const webdriver = await client.platform.getPlatforms('webdriver');

for (const p of appium) {
  console.log(`${p.long_name} ${p.short_version} on ${p.os}`);
}
```

---

### UsersModule

Retrieve user account details and concurrency/usage statistics.

**Get your own user info:**

```javascript
const user = await client.users.getUser();

console.log(`Username: ${user.username}`);
console.log(`Email: ${user.email}`);
console.log(`Name: ${user.first_name} ${user.last_name}`);
```

**Get another user's info:**

```javascript
const user = await client.users.getUser('other_user');
```

**Get concurrency and usage statistics:**

```javascript
const concurrency = await client.users.getConcurrency();

console.log('Concurrency:', concurrency);
```

---

### UploadModule

Upload mobile binaries (APK, IPA, AAB) to Sauce Labs Mobile Distribution.

**Upload from a file path:**

```javascript
const result = await client.upload.uploadApp({
  file: '/path/to/my-app.apk',
  apiKey: 'distribution_api_key',
  appName: 'My Android App',
  uploadToSaucelabs: true,  // also make available in RDC
  notify: true,             // email testers
});

console.log('Upload result:', result);
```

**Upload from a Buffer:**

```javascript
import { readFile } from 'node:fs/promises';

const buffer = await readFile('/path/to/my-app.ipa');

const result = await client.upload.uploadApp({
  file: buffer,
  apiKey: 'distribution_api_key',
  appName: 'My iOS App',
});
```

**Supported file extensions:** `.apk`, `.ipa`, `.aab`

---

## Error Handling

The SDK throws typed errors that map directly to HTTP status codes. Use `try/catch` with `instanceof` checks for granular error handling.

### Basic Error Handling

```javascript
import { createSaucelabsClient, SaucelabsNotFoundError } from 'saucelabs-api-client';

const client = createSaucelabsClient();

try {
  const job = await client.jobs.get('invalid_job_id');
} catch (error) {
  if (error instanceof SaucelabsNotFoundError) {
    console.error('Job not found:', error.message);
  } else {
    throw error;
  }
}
```

### Comprehensive Error Handling

```javascript
import {
  SaucelabsError,
  SaucelabsAuthError,
  SaucelabsNotFoundError,
  SaucelabsRateLimitError,
  SaucelabsValidationError,
  SaucelabsServerError,
} from 'saucelabs-api-client';

async function safeFetchJob(client, jobId) {
  try {
    return await client.jobs.get(jobId);
  } catch (error) {
    if (error instanceof SaucelabsAuthError) {
      // 401 -- credentials are invalid
      console.error('Authentication failed. Check SAUCE_USERNAME and SAUCE_ACCESS_KEY.');
      process.exit(1);
    }

    if (error instanceof SaucelabsNotFoundError) {
      // 404 -- job does not exist
      console.error(`Job "${jobId}" not found.`);
      return null;
    }

    if (error instanceof SaucelabsValidationError) {
      // 400/422 -- bad request parameters
      console.error('Invalid parameters:', error.message);
      return null;
    }

    if (error instanceof SaucelabsRateLimitError) {
      // 429 -- exceeded rate limit (auto-wait was disabled or exhausted)
      console.error(`Rate limited. Retry after ${error.retryAfter}s`);
      return null;
    }

    if (error instanceof SaucelabsServerError) {
      // 5xx -- Sauce Labs server error
      console.error('Sauce Labs server error. Check https://status.saucelabs.com');
      return null;
    }

    if (error instanceof SaucelabsError) {
      // Catch-all for any other Sauce Labs SDK error
      console.error(`API error [${error.statusCode}]: ${error.message}`);
      return null;
    }

    // Non-SDK error -- re-throw
    throw error;
  }
}
```

### Serializing Errors

All `SaucelabsError` instances have a `toJSON()` method for structured logging:

```javascript
try {
  await client.jobs.get('bad_id');
} catch (error) {
  if (error instanceof SaucelabsError) {
    const serialized = error.toJSON();
    // => {
    //   error: true,
    //   name: 'SaucelabsNotFoundError',
    //   message: 'Resource not found',
    //   statusCode: 404,
    //   endpoint: '/rest/v1.1/demo_user/jobs/bad_id',
    //   method: 'GET',
    //   timestamp: '2026-02-01T...'
    // }
    await sendToMonitoring(serialized);
  }
}
```

---

## Rate Limiting Configuration

The Sauce Labs API enforces rate limits (~10 req/sec, ~3,500/hour). The SDK provides built-in handling that automatically waits and retries when rate limited.

### Default Behavior

By default, `rateLimitAutoWait` is `true`. When the API returns a 429 response, the client:

1. Parses the `Retry-After` header.
2. Waits for the specified duration (or uses exponential backoff).
3. Retries the request automatically (up to 5 times).

```javascript
// This is the default -- auto-wait is enabled
const client = createSaucelabsClient({
  rateLimitAutoWait: true,
});
```

### Disabling Auto-Wait

If you prefer to handle rate limits yourself:

```javascript
import { SaucelabsRateLimitError } from 'saucelabs-api-client';

const client = createSaucelabsClient({
  rateLimitAutoWait: false,
});

try {
  const jobs = await client.jobs.list();
} catch (error) {
  if (error instanceof SaucelabsRateLimitError) {
    console.log(`Rate limited. Retry after ${error.retryAfter}s`);
    // Implement your own backoff
  }
}
```

### Rate Limit Callback

The `onRateLimit` callback fires whenever a rate limit is encountered, regardless of `rateLimitAutoWait`:

```javascript
const client = createSaucelabsClient({
  rateLimitAutoWait: true,
  onRateLimit: (info) => {
    console.warn('Rate limited!');
    console.warn(`  Retry after: ${info.retryAfter}s`);
    console.warn(`  Remaining:   ${info.remaining}`);
    console.warn(`  Limit:       ${info.limit}`);

    // Return false to PREVENT auto-wait for this specific event
    if (info.retryAfter > 120) {
      console.error('Wait time too long, aborting.');
      return false;
    }

    // Return true (or undefined) to allow auto-wait
    return true;
  },
});
```

### Checking Rate Limit State

```javascript
if (client.lastRateLimit) {
  console.log(`Last rate limit at: ${client.lastRateLimit.timestamp}`);
  console.log(`Wait time was: ${client.lastRateLimit.retryAfter}s`);
  console.log(`Reset at: ${client.lastRateLimit.resetAt}`);
}
```

### Rate Limit Utilities

For advanced use cases, the SDK exports rate limit utilities directly:

```javascript
import { parseRetryAfter, buildRateLimitInfo, calculateBackoff } from 'saucelabs-api-client';

// Parse a Retry-After header
const seconds = parseRetryAfter('30'); // => 30

// Build rate limit info from headers
const info = buildRateLimitInfo({
  'retry-after': '30',
  'x-ratelimit-remaining': '0',
  'x-ratelimit-limit': '100',
});

// Calculate exponential backoff
const delay = calculateBackoff(2); // ~4s (attempt 2, base 1s, max 60s)
```

---

## Logging Configuration

The SDK uses a structured logger with automatic sensitive data redaction.

### Setting the Log Level

Use the `LOG_LEVEL` environment variable:

```bash
# Available levels: debug, info, warn, error, silent
export LOG_LEVEL=debug
```

### Log Level Hierarchy

| Level | Value | Description |
|---|---|---|
| `debug` | `0` | Detailed diagnostic information. |
| `info` | `1` | Normal operations (default). |
| `warn` | `2` | Potential problems. |
| `error` | `3` | Failures requiring attention. |
| `silent` | `4` | Suppresses all output. |

### Creating a Logger for Your Code

```javascript
import { createLogger } from 'saucelabs-api-client';

const log = createLogger('my-app', 'my-script.mjs');

log.info('Starting job export', { username: 'demo' });
log.debug('Request details', { url: '/rest/v1/demo/jobs', params: { limit: 10 } });
log.error('Export failed', { jobId: 'abc123', error: 'timeout' });
```

### Passing a Custom Logger

You can inject a custom logger into the client:

```javascript
const customLogger = {
  debug(msg) { /* your implementation */ },
  info(msg)  { /* your implementation */ },
  warn(msg)  { /* your implementation */ },
  error(msg) { /* your implementation */ },
};

const client = createSaucelabsClient({ logger: customLogger });
```

### Sensitive Data Redaction

The SDK automatically redacts sensitive keys in log context objects. Keys matching these patterns are replaced:

`token`, `secret`, `password`, `key`, `auth`, `credential`, `access_key`, `api_key`

```javascript
log.info('Client initialized', {
  apiKey: 'abcdef123456789',        // logged as 'abcdef12***'
  baseUrl: 'https://api.saucelabs.com', // logged as-is
});
```

---

## Configuration and Regions

### Regions

Sauce Labs operates in multiple geographic regions. The SDK maps region identifiers to base URLs automatically.

**Core Automation Regions:**

| Region | Base URL |
|---|---|
| `us-west-1` (default) | `https://api.us-west-1.saucelabs.com` |
| `us-east-4` | `https://api.us-east-4.saucelabs.com` |
| `eu-central-1` | `https://api.eu-central-1.saucelabs.com` |

**Mobile Distribution Regions:**

| Region | Base URL |
|---|---|
| `us-east` (default) | `https://mobile.saucelabs.com` |
| `eu-central-1` | `https://mobile.eu-central-1.saucelabs.com` |

### Selecting a Region

```javascript
// US West (default)
const client = createSaucelabsClient({ region: 'us-west-1' });

// EU
const clientEU = createSaucelabsClient({ region: 'eu-central-1' });

// Custom base URL (overrides region)
const clientCustom = createSaucelabsClient({
  baseUrl: 'https://custom-proxy.example.com',
});
```

### Using `resolveConfig()` Directly

```javascript
import { resolveConfig, resolveCoreBaseUrl, resolveMobileBaseUrl } from 'saucelabs-api-client';

// Full config resolution from env + options
const config = resolveConfig({ region: 'eu-central-1' });
console.log(config.baseUrl);
// => 'https://api.eu-central-1.saucelabs.com'

// Resolve a single URL
const url = resolveCoreBaseUrl('us-east-4');
// => 'https://api.us-east-4.saucelabs.com'

const mobileUrl = resolveMobileBaseUrl('eu-central-1');
// => 'https://mobile.eu-central-1.saucelabs.com'
```

---

## Environment Variables

All SDK behavior can be configured via environment variables. These are read by `resolveConfig()` and used as defaults when constructor options are not provided.

```bash
# Authentication (required for most operations)
export SAUCE_USERNAME="your_sauce_username"
export SAUCE_ACCESS_KEY="your_sauce_access_key"

# Fallback authentication variables
export SAUCELABS_USERNAME="your_sauce_username"
export SAUCELABS_ACCESS_KEY="your_sauce_access_key"

# Network proxy
export HTTPS_PROXY="https://proxy.example.com:8080"
export HTTP_PROXY="http://proxy.example.com:8080"

# Logging
export LOG_LEVEL=info
```

Constructor options always take precedence over environment variables. Environment variables take precedence over built-in defaults.

---

## Complete Working Example

A self-contained script demonstrating all major SDK features:

```javascript
// complete-example.mjs
import {
  createSaucelabsClient,
  SaucelabsError,
  SaucelabsAuthError,
  SaucelabsNotFoundError,
  SaucelabsRateLimitError,
  SaucelabsValidationError,
  SaucelabsServerError,
  createLogger,
  CORE_REGIONS,
  AUTOMATION_API_VALUES,
} from 'saucelabs-api-client';

// -- Setup ------------------------------------------------------------------

const log = createLogger('my-app', 'complete-example.mjs');

const client = createSaucelabsClient({
  username: process.env.SAUCE_USERNAME,
  apiKey: process.env.SAUCE_ACCESS_KEY,
  region: 'us-west-1',
  timeout: 15000,
  rateLimitAutoWait: true,
  onRateLimit: (info) => {
    log.warn('Rate limited', { retryAfter: info.retryAfter });
    return true;
  },
});

// -- Platform status (public, no auth needed) --------------------------------

try {
  const status = await client.platform.getStatus();
  log.info('Sauce Labs status', {
    operational: status.service_operational,
    message: status.status_message,
  });
} catch (error) {
  log.error('Failed to get status', { error: error.message });
}

// -- Supported platforms -----------------------------------------------------

try {
  const platforms = await client.platform.getPlatforms('webdriver');
  log.info('WebDriver platforms available', { count: platforms.length });
} catch (error) {
  log.error('Failed to get platforms', { error: error.message });
}

// -- User info ---------------------------------------------------------------

try {
  const user = await client.users.getUser();
  log.info('User info', {
    username: user.username,
    email: user.email,
  });
} catch (error) {
  if (error instanceof SaucelabsAuthError) {
    log.error('Authentication failed -- check credentials');
  } else {
    log.error('Failed to get user', { error: error.message });
  }
}

// -- Concurrency stats -------------------------------------------------------

try {
  const concurrency = await client.users.getConcurrency();
  log.info('Concurrency stats', concurrency);
} catch (error) {
  log.error('Failed to get concurrency', { error: error.message });
}

// -- List jobs ---------------------------------------------------------------

try {
  const jobs = await client.jobs.list({ limit: 5 });
  log.info('Recent jobs', { count: jobs.length });

  for (const job of jobs) {
    log.info('Job', { id: job.id, name: job.name, status: job.status });
  }
} catch (error) {
  if (error instanceof SaucelabsNotFoundError) {
    log.warn('No jobs found');
  } else if (error instanceof SaucelabsValidationError) {
    log.error('Validation error', { message: error.message });
  } else {
    log.error('Failed to list jobs', { error: error.message });
  }
}

// -- Get a specific job (with full error handling) ---------------------------

const targetJobId = 'example_job_id_12345';

try {
  const job = await client.jobs.get(targetJobId);
  log.info('Job details', {
    id: job.id,
    name: job.name,
    status: job.status,
    browser: job.browser,
    os: job.os,
  });
} catch (error) {
  if (error instanceof SaucelabsAuthError) {
    log.error('Authentication failed');
  } else if (error instanceof SaucelabsNotFoundError) {
    log.warn('Job not found', { jobId: targetJobId });
  } else if (error instanceof SaucelabsRateLimitError) {
    log.error('Rate limited', { retryAfter: error.retryAfter });
  } else if (error instanceof SaucelabsServerError) {
    log.error('Server error -- check https://status.saucelabs.com');
  } else if (error instanceof SaucelabsError) {
    log.error('API error', { statusCode: error.statusCode, message: error.message });
  } else {
    throw error;
  }
}

// -- Check rate limit state --------------------------------------------------

if (client.lastRateLimit) {
  log.info('Rate limit encountered during session', {
    retryAfter: client.lastRateLimit.retryAfter,
    remaining: client.lastRateLimit.remaining,
  });
} else {
  log.info('No rate limits encountered during session');
}

// -- Available regions -------------------------------------------------------

log.info('Available Core Automation regions:');
for (const [region, url] of Object.entries(CORE_REGIONS)) {
  log.info(`  ${region}: ${url}`);
}

log.info('Valid automation API values:', { values: AUTOMATION_API_VALUES });

// -- Cleanup -----------------------------------------------------------------

client.close();
log.info('Complete example finished');
```

Run the example:

```bash
export SAUCE_USERNAME="your_username"
export SAUCE_ACCESS_KEY="your_access_key"
export LOG_LEVEL=debug

node complete-example.mjs
```
