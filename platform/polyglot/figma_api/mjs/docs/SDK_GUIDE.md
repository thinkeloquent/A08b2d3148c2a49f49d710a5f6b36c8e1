# Figma API SDK -- Node.js Usage Guide

> Package: `@internal/figma-api` | Module format: ESM (`.mjs`) | Runtime: Node.js

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Client Configuration](#client-configuration)
- [Domain Client Patterns](#domain-client-patterns)
- [Error Handling](#error-handling)
- [Caching Strategy](#caching-strategy)
- [Rate Limiting](#rate-limiting)
- [Retry Behavior](#retry-behavior)
- [Logging Configuration](#logging-configuration)
- [Environment Variables](#environment-variables)

---

## Installation

Install the package using pnpm:

```bash
pnpm install
```

The SDK is published as `@internal/figma-api` and uses ESM (`.mjs`) exclusively. Ensure your `package.json` has `"type": "module"` or use the `.mjs` file extension for all imports.

---

## Quick Start

```javascript
import { FigmaClient, FilesClient } from '@internal/figma-api';

// The client automatically reads FIGMA_TOKEN or FIGMA_ACCESS_TOKEN from env
const client = new FigmaClient();
const files = new FilesClient(client);

// Fetch a Figma file
const file = await files.getFile('your-file-key');
console.log(file.document.name);
```

If you prefer to pass the token explicitly:

```javascript
const client = new FigmaClient({
  token: 'fig_your_personal_access_token',
});
```

---

## Client Configuration

### Minimal Setup

For most use cases, the defaults are sufficient. Just set the `FIGMA_TOKEN` environment variable:

```bash
export FIGMA_TOKEN="fig_your_personal_access_token"
```

```javascript
import { FigmaClient } from '@internal/figma-api';

const client = new FigmaClient();
```

### Full Configuration

```javascript
import { FigmaClient } from '@internal/figma-api';

const client = new FigmaClient({
  // Authentication
  token: process.env.FIGMA_TOKEN,

  // Base URL (useful for proxies or enterprise deployments)
  baseUrl: 'https://api.figma.com',

  // Request timeout in milliseconds
  timeout: 30000,

  // Retry configuration
  maxRetries: 3,

  // Rate limiting
  rateLimitAutoWait: true,
  rateLimitThreshold: 0,
  onRateLimit: (rateLimitInfo) => {
    console.warn(`Rate limited: retry after ${rateLimitInfo.retryAfter}s`);
    // Return false to prevent auto-wait, or true/undefined to allow it
    return true;
  },

  // Caching
  cache: {
    maxSize: 200,  // maximum number of cached responses
    ttl: 600,      // cache TTL in seconds (10 minutes)
  },

  // Logging
  logger: customLogger,
});
```

### Inspecting Client State

```javascript
// Check cumulative statistics
console.log(client.stats);
// => {
//   requestsMade: 15,
//   requestsFailed: 0,
//   cacheHits: 3,
//   cacheMisses: 12,
//   rateLimitWaits: 0,
//   rateLimitTotalWaitSeconds: 0,
//   cache: { hits: 3, misses: 12, size: 12 }
// }

// Check the most recent rate limit event
if (client.lastRateLimit) {
  console.log(`Last rate limit: retry after ${client.lastRateLimit.retryAfter}s`);
}
```

---

## Domain Client Patterns

The SDK organizes API operations into domain-specific clients. Each domain client takes a `FigmaClient` instance and an optional configuration object.

### Creating Domain Clients

```javascript
import {
  FigmaClient,
  FilesClient,
  ProjectsClient,
  CommentsClient,
  ComponentsClient,
  VariablesClient,
  WebhooksClient,
} from '@internal/figma-api';

const client = new FigmaClient();

const files      = new FilesClient(client);
const projects   = new ProjectsClient(client);
const comments   = new CommentsClient(client);
const components = new ComponentsClient(client);
const variables  = new VariablesClient(client);
const webhooks   = new WebhooksClient(client);
```

### Passing a Custom Logger to Domain Clients

```javascript
import { Logger } from '@internal/figma-api';

const log = Logger.create('@internal/figma-api', 'my-script.mjs');

const files = new FilesClient(client, { logger: log });
```

### Files -- Common Workflows

**Fetch a file and enumerate top-level frames:**

```javascript
const file = await files.getFile('FILE_KEY', { depth: 2 });

const pages = file.document.children;
for (const page of pages) {
  console.log(`Page: ${page.name}`);
  for (const frame of page.children) {
    console.log(`  Frame: ${frame.name} (${frame.type})`);
  }
}
```

**Export nodes as PNG at 2x:**

```javascript
const images = await files.getImages('FILE_KEY', ['1:2', '3:4'], {
  scale: 2,
  format: 'png',
});

for (const [nodeId, url] of Object.entries(images.images)) {
  console.log(`Node ${nodeId}: ${url}`);
  // Download images using fetch or your preferred HTTP client
}
```

**Export as SVG with options:**

```javascript
const svgs = await files.getImages('FILE_KEY', ['1:2'], {
  format: 'svg',
  svgOptions: {
    includeId: true,
    simplifyStroke: true,
  },
});
```

**Get a specific file version:**

```javascript
const versions = await files.getFileVersions('FILE_KEY');
const latestVersion = versions.versions[0];

const historicFile = await files.getFile('FILE_KEY', {
  version: latestVersion.id,
});
```

### Projects -- Team and Project Listing

```javascript
const teamProjects = await projects.getTeamProjects('TEAM_ID');

for (const project of teamProjects.projects) {
  console.log(`Project: ${project.name} (${project.id})`);

  const projectFiles = await projects.getProjectFiles(project.id);
  for (const file of projectFiles.files) {
    console.log(`  File: ${file.name} (${file.key})`);
  }
}
```

### Comments -- Threaded Conversations

```javascript
// List all comments
const result = await comments.listComments('FILE_KEY', { as_md: true });

for (const comment of result.comments) {
  console.log(`[${comment.user.handle}]: ${comment.message}`);
}

// Add a new comment pinned to a location
await comments.addComment('FILE_KEY', {
  message: 'This button needs more padding.',
  clientMeta: { x: 320, y: 480 },
});

// Reply to a comment
await comments.addComment('FILE_KEY', {
  message: 'Fixed in the latest revision.',
  commentId: 'PARENT_COMMENT_ID',
});
```

### Components and Styles

```javascript
// Get all components in a file
const fileComponents = await components.getFileComponents('FILE_KEY');

// Paginate through team components
let cursor = undefined;
do {
  const page = await components.getTeamComponents('TEAM_ID', {
    pageSize: 50,
    cursor,
  });

  for (const comp of page.meta.components) {
    console.log(`${comp.name}: ${comp.key}`);
  }

  cursor = page.meta.cursor?.after;
} while (cursor);
```

### Variables

```javascript
// Read all local variables
const local = await variables.getLocalVariables('FILE_KEY');

const vars = Object.values(local.meta.variables);
for (const v of vars) {
  console.log(`${v.name} (${v.resolvedType})`);
}

// Create new variables
await variables.createVariables('FILE_KEY', {
  variableCollections: [
    { action: 'CREATE', name: 'Spacing', id: 'temp_coll_1' },
  ],
  variables: [
    {
      action: 'CREATE',
      name: 'spacing/sm',
      variableCollectionId: 'temp_coll_1',
      resolvedType: 'FLOAT',
      valuesByMode: {
        'default_mode_id': 8,
      },
    },
    {
      action: 'CREATE',
      name: 'spacing/md',
      variableCollectionId: 'temp_coll_1',
      resolvedType: 'FLOAT',
      valuesByMode: {
        'default_mode_id': 16,
      },
    },
  ],
});
```

### Webhooks

```javascript
// Create a webhook
const webhook = await webhooks.createWebhook('TEAM_ID', {
  eventType: 'FILE_UPDATE',
  endpoint: 'https://my-server.com/figma-webhook',
  passcode: 'my-secret',
  description: 'Notify on file updates',
});

console.log(`Webhook created: ${webhook.id}`);

// List all webhooks for a team
const list = await webhooks.listTeamWebhooks('TEAM_ID');
for (const wh of list.webhooks) {
  console.log(`${wh.id}: ${wh.event_type} -> ${wh.endpoint}`);
}

// Check webhook delivery history
const requests = await webhooks.getWebhookRequests(webhook.id);
for (const req of requests.requests) {
  console.log(`${req.timestamp}: ${req.payload?.event_type}`);
}

// Pause a webhook
await webhooks.updateWebhook(webhook.id, { status: 'PAUSED' });

// Delete a webhook
await webhooks.deleteWebhook(webhook.id);
```

---

## Error Handling

The SDK throws typed errors that map directly to HTTP status codes. Use `try/catch` with `instanceof` checks for granular error handling.

### Basic Error Handling

```javascript
import { FigmaClient, FilesClient, NotFoundError } from '@internal/figma-api';

const client = new FigmaClient();
const files = new FilesClient(client);

try {
  const file = await files.getFile('INVALID_FILE_KEY');
} catch (error) {
  if (error instanceof NotFoundError) {
    console.error('File not found:', error.message);
  } else {
    throw error;
  }
}
```

### Comprehensive Error Handling

```javascript
import {
  FigmaError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ServerError,
  NetworkError,
  TimeoutError,
} from '@internal/figma-api';

async function safeFetchFile(files, fileKey) {
  try {
    return await files.getFile(fileKey);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      // 401 -- token is invalid or expired
      console.error('Authentication failed. Check your FIGMA_TOKEN.');
      process.exit(1);
    }

    if (error instanceof AuthorizationError) {
      // 403 -- token lacks permissions
      console.error('Access denied. Verify file sharing permissions.');
      return null;
    }

    if (error instanceof NotFoundError) {
      // 404 -- file does not exist
      console.error(`File "${fileKey}" not found.`);
      return null;
    }

    if (error instanceof ValidationError) {
      // 422 -- bad request parameters
      console.error('Invalid parameters:', error.meta);
      return null;
    }

    if (error instanceof RateLimitError) {
      // 429 -- exceeded rate limit (auto-wait was disabled or failed)
      console.error(`Rate limited. Retry after ${error.meta?.retryAfter}s`);
      return null;
    }

    if (error instanceof TimeoutError) {
      // 408 -- request took too long
      console.error('Request timed out. Try increasing the timeout.');
      return null;
    }

    if (error instanceof NetworkError) {
      // DNS or connection failure
      console.error('Network error. Check your internet connection.');
      return null;
    }

    if (error instanceof ServerError) {
      // 5xx -- Figma server error (already retried maxRetries times)
      console.error('Figma server error. Try again later.');
      return null;
    }

    if (error instanceof FigmaError) {
      // Catch-all for any other Figma SDK error
      console.error(`Figma API error [${error.code}]: ${error.message}`);
      return null;
    }

    // Non-Figma error -- re-throw
    throw error;
  }
}
```

### Serializing Errors

All `FigmaError` instances have a `toJSON()` method for structured logging:

```javascript
try {
  await files.getFile('BAD_KEY');
} catch (error) {
  if (error instanceof FigmaError) {
    const serialized = error.toJSON();
    // => {
    //   name: 'NotFoundError',
    //   message: 'Not found',
    //   status: 404,
    //   code: 'NOT_FOUND',
    //   meta: { ... },
    //   requestId: 'req_abc123',
    //   timestamp: '2026-01-31T...'
    // }
    await sendToMonitoring(serialized);
  }
}
```

---

## Caching Strategy

The SDK includes a built-in LRU (Least Recently Used) cache with TTL (Time To Live) expiration. Only GET requests are cached.

### Enabling the Cache

```javascript
const client = new FigmaClient({
  cache: {
    maxSize: 200,  // store up to 200 responses
    ttl: 600,      // entries expire after 10 minutes
  },
});
```

### How It Works

1. On a GET request, the cache key is derived from the full URL including query parameters.
2. If a non-expired entry exists, it is returned immediately without making an HTTP request.
3. If the cache is full, the least-recently-used entry is evicted to make room.
4. POST, PUT, PATCH, and DELETE requests are never cached.

### Monitoring Cache Performance

```javascript
const stats = client.stats;
console.log(`Cache hit rate: ${stats.cacheHits / (stats.cacheHits + stats.cacheMisses) * 100}%`);
console.log(`Cache size: ${stats.cache.size} entries`);
```

### Using RequestCache Directly

For advanced use cases, you can use the `RequestCache` class independently:

```javascript
import { RequestCache } from '@internal/figma-api';

const cache = new RequestCache({ maxSize: 50, ttl: 120 });

cache.set('my-key', { data: 'some value' });
const value = cache.get('my-key'); // => { data: 'some value' }
cache.clear();
```

### When to Adjust Cache Settings

| Scenario | Recommendation |
|---|---|
| Frequently reading the same files | Increase `ttl` (e.g., 900 for 15 min) |
| Many different files, limited memory | Decrease `maxSize` |
| Real-time collaboration workflows | Lower `ttl` or disable cache (`maxSize: 0`) |
| CI/CD pipelines (one-shot scripts) | Disable cache entirely |

---

## Rate Limiting

The Figma API enforces rate limits per token. The SDK provides built-in handling that automatically waits and retries when rate limited.

### Default Behavior

By default, `rateLimitAutoWait` is `true`. When the API returns a 429 response, the client:

1. Parses the `Retry-After` header.
2. Waits for the specified duration.
3. Retries the request automatically.

```javascript
// This is the default -- auto-wait is enabled
const client = new FigmaClient({
  rateLimitAutoWait: true,
});
```

### Disabling Auto-Wait

If you prefer to handle rate limits yourself:

```javascript
import { RateLimitError } from '@internal/figma-api';

const client = new FigmaClient({
  rateLimitAutoWait: false,
});

try {
  const file = await files.getFile('FILE_KEY');
} catch (error) {
  if (error instanceof RateLimitError) {
    // Handle manually
    console.log('Rate limited. Implement your own backoff.');
  }
}
```

### Rate Limit Callback

The `onRateLimit` callback fires whenever a rate limit is encountered, regardless of `rateLimitAutoWait`:

```javascript
const client = new FigmaClient({
  rateLimitAutoWait: true,
  onRateLimit: (info) => {
    console.warn(`Rate limited!`);
    console.warn(`  Retry after: ${info.retryAfter}s`);
    console.warn(`  Plan tier:   ${info.planTier}`);
    console.warn(`  Limit type:  ${info.rateLimitType}`);

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

### Proactive Threshold

Set `rateLimitThreshold` to proactively pause before hitting the limit:

```javascript
const client = new FigmaClient({
  rateLimitAutoWait: true,
  rateLimitThreshold: 10, // pause if fewer than 10 seconds of quota remain
});
```

### Checking Rate Limit State

```javascript
if (client.lastRateLimit) {
  console.log(`Last rate limit at: ${client.lastRateLimit.timestamp}`);
  console.log(`Wait time was: ${client.lastRateLimit.retryAfter}s`);
}

console.log(`Total rate limit waits: ${client.stats.rateLimitWaits}`);
console.log(`Total wait time: ${client.stats.rateLimitTotalWaitSeconds}s`);
```

---

## Retry Behavior

The SDK automatically retries failed requests that are likely to succeed on a subsequent attempt.

### What Gets Retried

- **5xx server errors** (500, 502, 503, 504, etc.) -- retried with exponential backoff.
- **429 rate limit errors** -- retried after the `Retry-After` duration (handled separately from the backoff logic).
- **4xx client errors** (400, 401, 403, 404, 422) -- **never retried**. These indicate a problem with the request itself.
- **Network errors** (DNS failure, connection refused) -- **never retried** by default.

### Backoff Calculation

The backoff follows an exponential curve with jitter:

| Attempt | Approximate Delay |
|---|---|
| 0 (first retry) | ~1,000 ms |
| 1 | ~2,000 ms |
| 2 | ~4,000 ms |
| 3 | ~8,000 ms |
| ... | Capped at 30,000 ms |

### Configuring Retries

```javascript
const client = new FigmaClient({
  maxRetries: 5, // up to 5 retry attempts (6 total requests)
});
```

### Using `withRetry` Directly

For custom retry logic outside the client:

```javascript
import { withRetry } from '@internal/figma-api';

const result = await withRetry(
  async () => {
    const response = await fetch('https://api.figma.com/v1/files/KEY', {
      headers: { 'X-Figma-Token': token },
    });
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return response.json();
  },
  {
    maxRetries: 3,
    initialWait: 1000,
    maxWait: 30000,
  }
);
```

### Using `sleep` for Manual Delays

```javascript
import { sleep } from '@internal/figma-api';

for (const fileKey of fileKeys) {
  const file = await files.getFile(fileKey);
  processFile(file);

  // Add a deliberate pause between requests
  await sleep(500);
}
```

---

## Logging Configuration

The SDK uses a structured logger with automatic sensitive data redaction.

### Setting the Log Level

Use the `LOG_LEVEL` environment variable:

```bash
# Available levels: TRACE, DEBUG, INFO, WARN, ERROR, SILENT
export LOG_LEVEL=DEBUG
```

### Log Level Hierarchy

| Level | Value | Description |
|---|---|---|
| `TRACE` | `5` | Most verbose. Every internal operation. |
| `DEBUG` | `10` | Detailed diagnostic information. |
| `INFO` | `20` | Normal operations (default). |
| `WARN` | `30` | Potential problems. |
| `ERROR` | `40` | Failures requiring attention. |
| `SILENT` | `100` | Suppresses all output. |

### Creating a Logger for Your Code

```javascript
import { Logger } from '@internal/figma-api';

const log = Logger.create('@internal/figma-api', 'my-script.mjs');

log.info('Starting file export', { fileKey: 'abc123' });
log.debug('Request details', { url: '/v1/files/abc123', params: { depth: 2 } });
log.error('Export failed', { fileKey: 'abc123', error: 'timeout' });
```

### Passing a Custom Logger

You can inject a custom logger into both `FigmaClient` and domain clients:

```javascript
const customLogger = {
  trace(msg, ctx) { /* your implementation */ },
  debug(msg, ctx) { /* your implementation */ },
  info(msg, ctx)  { /* your implementation */ },
  warn(msg, ctx)  { /* your implementation */ },
  error(msg, ctx) { /* your implementation */ },
};

const client = new FigmaClient({ logger: customLogger });
const files = new FilesClient(client, { logger: customLogger });
```

### Sensitive Data Redaction

The SDK automatically redacts sensitive keys in log context objects. The following keys are replaced with `[REDACTED]`:

`token`, `secret`, `password`, `auth`, `credential`, `authorization`, `apikey`, `api_key`, `accesstoken`, `access_token`

```javascript
log.info('Client initialized', {
  token: 'fig_abc123xyz',         // logged as '[REDACTED]'
  baseUrl: 'https://api.figma.com', // logged as-is
});
```

---

## Environment Variables

All SDK behavior can be configured via environment variables. These are read by `loadConfig()` and used as defaults when constructor options are not provided.

```bash
# Authentication (one of these is required)
export FIGMA_TOKEN="fig_your_token"
export FIGMA_ACCESS_TOKEN="fig_your_oauth_token"

# API configuration
export FIGMA_API_BASE_URL="https://api.figma.com"
export FIGMA_TIMEOUT=30000
export MAX_RETRIES=3

# Rate limiting
export RATE_LIMIT_AUTO_WAIT=true
export RATE_LIMIT_THRESHOLD=0

# Cache
export CACHE_MAX_SIZE=100
export CACHE_TTL=300

# Server
export PORT=3108
export HOST="0.0.0.0"

# Logging
export LOG_LEVEL=INFO
```

Constructor options always take precedence over environment variables. Environment variables take precedence over built-in defaults.
