# Figma API SDK -- Usage Guide

A practical guide to using the polyglot Figma API SDK in JavaScript/TypeScript and Python.

---

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Authentication](#authentication)
4. [Creating a Client](#creating-a-client)
5. [Using Domain Clients](#using-domain-clients)
6. [Error Handling](#error-handling)
7. [Caching](#caching)
8. [Rate Limiting](#rate-limiting)
9. [Retry Logic](#retry-logic)
10. [Logging](#logging)
11. [Configuration](#configuration)
12. [Complete Examples](#complete-examples)

---

## Installation

### JavaScript / TypeScript

```bash
npm install @internal/figma-api
```

The package ships as ESM-only (`.mjs` files). Ensure your project supports ESM imports.

### Python

```bash
pip install figma_api
```

Requires Python 3.10+ with `asyncio` support. Dependencies include `httpx` for HTTP and `fastapi` + `uvicorn` for the server module.

---

## Quick Start

### JavaScript

```javascript
import { FigmaClient, FilesClient } from '@internal/figma-api';

const client = new FigmaClient({ token: 'figd_your_token_here' });
const files = new FilesClient(client);

const file = await files.getFile('YOUR_FILE_KEY');
console.log(file.name);
```

### Python

```python
import asyncio
from figma_api import FigmaClient, FilesClient

async def main():
    async with FigmaClient(token='figd_your_token_here') as client:
        files = FilesClient(client)
        file = await files.get_file('YOUR_FILE_KEY')
        print(file['name'])

asyncio.run(main())
```

---

## Authentication

The SDK resolves authentication tokens in the following priority order (identical in both languages):

1. Token explicitly passed to the constructor
2. `FIGMA_TOKEN` environment variable
3. `FIGMA_ACCESS_TOKEN` environment variable

If no token is found, an `AuthError` is raised.

### Using Environment Variables (Recommended)

```bash
export FIGMA_TOKEN="figd_your_token_here"
```

**JavaScript:**

```javascript
import { FigmaClient } from '@internal/figma-api';

// Token resolved automatically from environment
const client = new FigmaClient();
```

**Python:**

```python
from figma_api import FigmaClient

# Token resolved automatically from environment
async with FigmaClient() as client:
    pass
```

### Explicit Token

**JavaScript:**

```javascript
import { FigmaClient } from '@internal/figma-api';

const client = new FigmaClient({ token: 'figd_your_token_here' });
```

**Python:**

```python
from figma_api import FigmaClient

client = FigmaClient(token='figd_your_token_here')
```

### Token Utilities

**JavaScript:**

```javascript
import { resolveToken, maskToken } from '@internal/figma-api';

const { token, source } = resolveToken();
console.log(`Using token from ${source}`);
console.log(`Token: ${maskToken(token)}`);
// Token: figd_abc...xyz
```

**Python:**

```python
from figma_api import resolve_token, mask_token

info = resolve_token()
print(f"Using token from {info.source}")
print(f"Token: {mask_token(info.token)}")
# Token: figd_abc...xyz
```

---

## Creating a Client

### Basic Configuration

**JavaScript:**

```javascript
import { FigmaClient } from '@internal/figma-api';

const client = new FigmaClient({
  token: 'figd_...',
  timeout: 60000,          // 60 seconds (in milliseconds)
  maxRetries: 5,
  rateLimitAutoWait: true,
  cache: { maxSize: 200, ttl: 600 },
});
```

**Python:**

```python
from figma_api import FigmaClient

client = FigmaClient(
    token='figd_...',
    timeout=60,              # 60 seconds
    max_retries=5,
    rate_limit_auto_wait=True,
    cache_max_size=200,
    cache_ttl=600,
)
```

### Checking Client Stats

**JavaScript:**

```javascript
const stats = client.stats;
console.log(`Requests made: ${stats.requestsMade}`);
console.log(`Cache hits: ${stats.cacheHits}`);
console.log(`Rate limit waits: ${stats.rateLimitWaits}`);
```

**Python:**

```python
stats = client.stats
print(f"Requests made: {stats['requests_made']}")
print(f"Cache hits: {stats['cache_hits']}")
print(f"Rate limit waits: {stats['rate_limit_waits']}")
```

### Direct HTTP Methods

The `FigmaClient` exposes low-level HTTP methods for endpoints not covered by domain clients.

**JavaScript:**

```javascript
import { FigmaClient } from '@internal/figma-api';

const client = new FigmaClient();

// GET with query parameters
const result = await client.get('/v1/files/abc123', {
  params: { version: '123456', depth: 2 },
});

// POST with a JSON body
const comment = await client.post('/v1/files/abc123/comments', {
  message: 'Looks good!',
});

// Raw response (no JSON parsing)
const raw = await client.getRaw('/v1/images/abc123', {
  params: { ids: '1:2', format: 'svg' },
});
```

**Python:**

```python
from figma_api import FigmaClient

async with FigmaClient() as client:
    # GET with query parameters
    result = await client.get('/v1/files/abc123', params={
        'version': '123456',
        'depth': 2,
    })

    # POST with a JSON body
    comment = await client.post('/v1/files/abc123/comments', body={
        'message': 'Looks good!',
    })

    # Raw response (no JSON parsing)
    raw = await client.get_raw('/v1/images/abc123', params={
        'ids': '1:2',
        'format': 'svg',
    })
```

---

## Using Domain Clients

Domain clients provide typed, ergonomic access to specific areas of the Figma API. They all require a `FigmaClient` instance.

### FilesClient

**JavaScript:**

```javascript
import { FigmaClient, FilesClient } from '@internal/figma-api';

const client = new FigmaClient();
const files = new FilesClient(client);

// Get a complete file
const file = await files.getFile('FILE_KEY', {
  depth: 2,
  geometry: 'paths',
});

// Get specific nodes
const nodes = await files.getFileNodes('FILE_KEY', ['1:2', '3:4'], {
  version: '123456',
});

// Export images
const images = await files.getImages('FILE_KEY', ['1:2'], {
  scale: 2,
  format: 'png',
});

// Get image fills
const fills = await files.getImageFills('FILE_KEY');

// Get version history
const versions = await files.getFileVersions('FILE_KEY');
```

**Python:**

```python
import asyncio
from figma_api import FigmaClient, FilesClient

async def main():
    async with FigmaClient() as client:
        files = FilesClient(client)

        # Get a complete file
        file = await files.get_file('FILE_KEY', depth=2, geometry='paths')

        # Get specific nodes
        nodes = await files.get_file_nodes('FILE_KEY', ['1:2', '3:4'],
                                           version='123456')

        # Export images
        images = await files.get_images('FILE_KEY', ['1:2'],
                                        scale=2, format='png')

        # Get image fills
        fills = await files.get_image_fills('FILE_KEY')

        # Get version history
        versions = await files.get_file_versions('FILE_KEY')

asyncio.run(main())
```

### ProjectsClient

**JavaScript:**

```javascript
import { FigmaClient, ProjectsClient } from '@internal/figma-api';

const client = new FigmaClient();
const projects = new ProjectsClient(client);

const teamProjects = await projects.getTeamProjects('TEAM_ID');
const projectFiles = await projects.getProjectFiles('PROJECT_ID', {
  branchData: true,
});
```

**Python:**

```python
from figma_api import FigmaClient, ProjectsClient

async with FigmaClient() as client:
    projects = ProjectsClient(client)

    team_projects = await projects.get_team_projects('TEAM_ID')
    project_files = await projects.get_project_files('PROJECT_ID',
                                                     branch_data=True)
```

### CommentsClient

**JavaScript:**

```javascript
import { FigmaClient, CommentsClient } from '@internal/figma-api';

const client = new FigmaClient();
const comments = new CommentsClient(client);

// List all comments
const all = await comments.listComments('FILE_KEY', { as_md: true });

// Add a comment
const added = await comments.addComment('FILE_KEY', {
  message: 'Please review this section.',
  clientMeta: { x: 100, y: 200 },
});

// Reply to a comment
const reply = await comments.addComment('FILE_KEY', {
  message: 'Done!',
  commentId: 'PARENT_COMMENT_ID',
});

// Delete a comment
await comments.deleteComment('FILE_KEY', 'COMMENT_ID');
```

**Python:**

```python
from figma_api import FigmaClient, CommentsClient

async with FigmaClient() as client:
    comments = CommentsClient(client)

    # List all comments
    all_comments = await comments.list_comments('FILE_KEY', as_md=True)

    # Add a comment
    added = await comments.add_comment('FILE_KEY',
                                       message='Please review this section.',
                                       client_meta={'x': 100, 'y': 200})

    # Reply to a comment
    reply = await comments.add_comment('FILE_KEY',
                                       message='Done!',
                                       comment_id='PARENT_COMMENT_ID')

    # Delete a comment
    await comments.delete_comment('FILE_KEY', 'COMMENT_ID')
```

### ComponentsClient

**JavaScript:**

```javascript
import { FigmaClient, ComponentsClient } from '@internal/figma-api';

const client = new FigmaClient();
const components = new ComponentsClient(client);

const component = await components.getComponent('COMPONENT_KEY');
const fileComponents = await components.getFileComponents('FILE_KEY');
const teamComponents = await components.getTeamComponents('TEAM_ID', {
  pageSize: 50,
  cursor: 'next_page_cursor',
});
const componentSet = await components.getComponentSet('SET_KEY');
const teamStyles = await components.getTeamStyles('TEAM_ID', { pageSize: 25 });
const style = await components.getStyle('STYLE_KEY');
```

**Python:**

```python
from figma_api import FigmaClient, ComponentsClient

async with FigmaClient() as client:
    components = ComponentsClient(client)

    component = await components.get_component('COMPONENT_KEY')
    file_components = await components.get_file_components('FILE_KEY')
    team_components = await components.get_team_components('TEAM_ID',
                                                          page_size=50,
                                                          cursor='next_page_cursor')
    component_set = await components.get_component_set('SET_KEY')
    team_styles = await components.get_team_styles('TEAM_ID', page_size=25)
    style = await components.get_style('STYLE_KEY')
```

### VariablesClient

**JavaScript:**

```javascript
import { FigmaClient, VariablesClient } from '@internal/figma-api';

const client = new FigmaClient();
const variables = new VariablesClient(client);

const local = await variables.getLocalVariables('FILE_KEY');
const published = await variables.getPublishedVariables('FILE_KEY');

const created = await variables.createVariables('FILE_KEY', {
  variables: [
    {
      name: 'primary-color',
      resolvedType: 'COLOR',
      valuesByMode: { 'mode-id': { r: 0.2, g: 0.4, b: 0.8, a: 1 } },
    },
  ],
});
```

**Python:**

```python
from figma_api import FigmaClient, VariablesClient

async with FigmaClient() as client:
    variables = VariablesClient(client)

    local = await variables.get_local_variables('FILE_KEY')
    published = await variables.get_published_variables('FILE_KEY')

    created = await variables.create_variables('FILE_KEY', {
        'variables': [
            {
                'name': 'primary-color',
                'resolvedType': 'COLOR',
                'valuesByMode': {
                    'mode-id': {'r': 0.2, 'g': 0.4, 'b': 0.8, 'a': 1},
                },
            },
        ],
    })
```

### WebhooksClient

**JavaScript:**

```javascript
import { FigmaClient, WebhooksClient } from '@internal/figma-api';

const client = new FigmaClient();
const webhooks = new WebhooksClient(client);

// List team webhooks
const list = await webhooks.listTeamWebhooks('TEAM_ID');

// Create a webhook
const hook = await webhooks.createWebhook('TEAM_ID', {
  eventType: 'FILE_UPDATE',
  endpoint: 'https://example.com/webhook',
  passcode: 'my_secret',
  description: 'Notify on file updates',
});

// Get a webhook
const existing = await webhooks.getWebhook(hook.id);

// Update a webhook
const updated = await webhooks.updateWebhook(hook.id, {
  endpoint: 'https://example.com/webhook-v2',
});

// Get webhook request log
const requests = await webhooks.getWebhookRequests(hook.id);

// Delete a webhook
await webhooks.deleteWebhook(hook.id);
```

**Python:**

```python
from figma_api import FigmaClient, WebhooksClient

async with FigmaClient() as client:
    webhooks = WebhooksClient(client)

    # List team webhooks
    hook_list = await webhooks.list_team_webhooks('TEAM_ID')

    # Create a webhook
    hook = await webhooks.create_webhook(
        'TEAM_ID',
        event_type='FILE_UPDATE',
        endpoint='https://example.com/webhook',
        passcode='my_secret',
        description='Notify on file updates',
    )

    # Get a webhook
    existing = await webhooks.get_webhook(hook['id'])

    # Update a webhook
    updated = await webhooks.update_webhook(hook['id'], {
        'endpoint': 'https://example.com/webhook-v2',
    })

    # Get webhook request log
    requests = await webhooks.get_webhook_requests(hook['id'])

    # Delete a webhook
    await webhooks.delete_webhook(hook['id'])
```

---

## Error Handling

The SDK provides a structured error hierarchy for all Figma API failures. See the [API Reference](./API_REFERENCE.md#error-hierarchy) for the full class tree.

### Catching Specific Errors

**JavaScript:**

```javascript
import {
  FigmaClient,
  FilesClient,
  NotFoundError,
  RateLimitError,
  AuthenticationError,
  FigmaError,
} from '@internal/figma-api';

const client = new FigmaClient();
const files = new FilesClient(client);

try {
  const file = await files.getFile('INVALID_KEY');
} catch (err) {
  if (err instanceof NotFoundError) {
    console.error(`File not found: ${err.message}`);
    console.error(`Request ID: ${err.requestId}`);
  } else if (err instanceof RateLimitError) {
    const retryAfter = err.meta.rateLimitInfo?.retryAfter;
    console.error(`Rate limited. Retry after ${retryAfter}s`);
  } else if (err instanceof AuthenticationError) {
    console.error('Invalid or expired token');
  } else if (err instanceof FigmaError) {
    console.error(`API error [${err.code}]: ${err.message}`);
    console.error(err.toJSON());
  }
}
```

**Python:**

```python
from figma_api import (
    FigmaClient,
    FilesClient,
    NotFoundError,
    RateLimitError,
    AuthenticationError,
    FigmaError,
)

async with FigmaClient() as client:
    files = FilesClient(client)

    try:
        file = await files.get_file('INVALID_KEY')
    except NotFoundError as err:
        print(f"File not found: {err.message}")
        print(f"Request ID: {err.request_id}")
    except RateLimitError as err:
        retry_after = err.rate_limit_info.retry_after if err.rate_limit_info else None
        print(f"Rate limited. Retry after {retry_after}s")
    except AuthenticationError as err:
        print("Invalid or expired token")
    except FigmaError as err:
        print(f"API error [{err.code}]: {err.message}")
        print(err.to_dict())
```

### Error Properties

Every `FigmaError` exposes the following:

| Property | JavaScript | Python | Description |
|----------|-----------|--------|-------------|
| Message | `err.message` | `err.message` | Human-readable description |
| Status | `err.status` | `err.status` | HTTP status code |
| Code | `err.code` | `err.code` | Machine-readable error code |
| Name | `err.name` | `err.name` | Error class name |
| Meta | `err.meta` | `err.meta` | Additional metadata |
| Request ID | `err.requestId` | `err.request_id` | Figma request ID |
| Timestamp | `err.timestamp` | `err.timestamp` | ISO timestamp |

---

## Caching

The SDK includes built-in request caching for GET requests. Caching is configured at the `FigmaClient` level.

### Enabling Caching

**JavaScript:**

```javascript
import { FigmaClient } from '@internal/figma-api';

const client = new FigmaClient({
  cache: {
    maxSize: 200,   // Maximum number of cached entries
    ttl: 600,       // Time-to-live in seconds
  },
});
```

**Python:**

```python
from figma_api import FigmaClient

client = FigmaClient(
    cache_max_size=200,   # Maximum number of cached entries
    cache_ttl=600,        # Time-to-live in seconds
)
```

### Checking Cache Stats

**JavaScript:**

```javascript
const stats = client.stats;
console.log(`Cache hits: ${stats.cacheHits}`);
console.log(`Cache misses: ${stats.cacheMisses}`);
console.log(`Cache size: ${stats.cache.size}`);
```

**Python:**

```python
stats = client.stats
print(f"Cache hits: {stats['cache_hits']}")
print(f"Cache misses: {stats['cache_misses']}")
print(f"Cache size: {stats['cache']['size']}")
```

### Using RequestCache Standalone

**JavaScript:**

```javascript
import { RequestCache } from '@internal/figma-api';

const cache = new RequestCache({ maxSize: 50, ttl: 120 });

cache.set('my-key', { data: 'value' });
console.log(cache.has('my-key'));    // true
console.log(cache.get('my-key'));    // { data: 'value' }
console.log(cache.stats);           // { hits: 1, misses: 0, size: 1 }

cache.clear();
```

**Python:**

```python
from figma_api import RequestCache

cache = RequestCache(max_size=50, ttl=120)

cache.set('my-key', {'data': 'value'})
print(cache.has('my-key'))    # True
print(cache.get('my-key'))    # {'data': 'value'}
print(cache.stats)            # CacheStats(hits=1, misses=0, size=1)

cache.clear()
```

---

## Rate Limiting

The SDK handles Figma's rate limits (HTTP 429) automatically by default.

### Automatic Waiting (Default Behavior)

When `rateLimitAutoWait` / `rate_limit_auto_wait` is `True` (the default), the SDK will:

1. Detect a 429 response.
2. Parse the `Retry-After` header.
3. Wait the specified duration.
4. Retry the request.

No user code is required.

### Custom Rate Limit Handling

**JavaScript:**

```javascript
import { FigmaClient } from '@internal/figma-api';

const client = new FigmaClient({
  rateLimitAutoWait: true,
  rateLimitThreshold: 60,  // Only auto-wait if retry-after <= 60 seconds
  onRateLimit: (info) => {
    console.log(`Rate limited! Retry after ${info.retryAfter}s`);
    console.log(`Plan tier: ${info.planTier}`);
    console.log(`Upgrade: ${info.upgradeLink}`);

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
from figma_api import FigmaClient

def on_rate_limit(info):
    print(f"Rate limited! Retry after {info.retry_after}s")
    print(f"Plan tier: {info.plan_tier}")
    print(f"Upgrade: {info.upgrade_link}")

    # Return False to skip waiting and let the error propagate
    if info.retry_after > 120:
        return False
    # Return True or None to proceed with auto-wait
    return True

client = FigmaClient(
    rate_limit_auto_wait=True,
    rate_limit_threshold=60,  # Only auto-wait if retry-after <= 60 seconds
    on_rate_limit=on_rate_limit,
)
```

### Inspecting Last Rate Limit

**JavaScript:**

```javascript
const lastLimit = client.lastRateLimit;
if (lastLimit) {
  console.log(`Last rate limit at: ${lastLimit.timestamp}`);
  console.log(`Retry after: ${lastLimit.retryAfter}s`);
}
```

**Python:**

```python
last_limit = client.last_rate_limit
if last_limit:
    print(f"Last rate limit at: {last_limit.timestamp}")
    print(f"Retry after: {last_limit.retry_after}s")
```

---

## Retry Logic

The SDK automatically retries requests that fail with 5xx server errors using exponential backoff. Rate limit (429) retries are handled separately by the rate-limit module.

### Default Behavior

- Maximum retries: 3
- Retryable status codes: 5xx only
- Backoff: Exponential with jitter
- 429 responses are never retried by the retry module (they go through rate-limit handling instead)

### Custom Retry Configuration

**JavaScript:**

```javascript
import { FigmaClient } from '@internal/figma-api';

const client = new FigmaClient({
  maxRetries: 5,   // Allow up to 5 retry attempts
});
```

**Python:**

```python
from figma_api import FigmaClient

client = FigmaClient(
    max_retries=5,   # Allow up to 5 retry attempts
)
```

### Using Retry Utilities Directly

**JavaScript:**

```javascript
import { withRetry, calculateBackoff, isRetryable } from '@internal/figma-api';

// Check if a status code is retryable
console.log(isRetryable(503));  // true
console.log(isRetryable(404));  // false

// Calculate backoff delay for a given attempt
const delay = calculateBackoff(2);  // Attempt #2, returns ms

// Wrap any async function with retry logic
const result = await withRetry(
  () => fetch('https://api.figma.com/v1/files/abc123'),
  { maxRetries: 3, initialWait: 1000, maxWait: 30000 },
);
```

**Python:**

```python
from figma_api import with_retry, calculate_backoff, is_retryable

# Check if a status code is retryable
print(is_retryable(503))  # True
print(is_retryable(404))  # False

# Calculate backoff delay for a given attempt
delay = calculate_backoff(2)  # Attempt #2, returns seconds

# Wrap any async function with retry logic
result = await with_retry(
    some_async_function,
    max_retries=3,
    initial_wait=1.0,
    max_wait=30.0,
)
```

---

## Logging

The SDK includes an internal structured logger with configurable verbosity.

### Setting Log Level

Set the `LOG_LEVEL` environment variable:

```bash
export LOG_LEVEL=debug    # trace | debug | info | warn | error
```

### Creating a Logger

**JavaScript:**

```javascript
import { create as createLogger } from '@internal/figma-api';

const logger = createLogger('figma-api', 'my-module.mjs');

logger.trace('Detailed trace info');
logger.debug('Debug-level info');
logger.info('Operational info');
logger.warn('Warning');
logger.error('Error occurred', new Error('details'));
```

**Python:**

```python
from figma_api import create_logger

logger = create_logger('figma_api', 'my_module.py')

logger.trace('Detailed trace info')
logger.debug('Debug-level info')
logger.info('Operational info')
logger.warn('Warning')
logger.error('Error occurred', error_object)
```

---

## Configuration

### Environment-Driven Configuration

Both implementations support the same set of environment variables:

```bash
export FIGMA_TOKEN="figd_your_token"
export FIGMA_API_BASE_URL="https://api.figma.com"
export FIGMA_TIMEOUT="30000"          # JS: milliseconds
export MAX_RETRIES="3"
export RATE_LIMIT_AUTO_WAIT="true"
export RATE_LIMIT_THRESHOLD="0"
export CACHE_MAX_SIZE="100"
export CACHE_TTL="300"
export LOG_LEVEL="info"
export PORT="3000"
export HOST="0.0.0.0"
```

### Loading Configuration Programmatically

**JavaScript:**

```javascript
import { loadConfig, DEFAULTS } from '@internal/figma-api';

const config = loadConfig();
console.log(config.timeout);    // 30000 (ms)
console.log(config.maxRetries); // 3

console.log(DEFAULTS);
// { baseUrl: "https://api.figma.com", timeout: 30000, maxRetries: 3, ... }
```

**Python:**

```python
from figma_api import Config, DEFAULTS

config = Config.from_env()
print(config.timeout)      # 30 (seconds)
print(config.max_retries)  # 3

print(DEFAULTS)
# {"base_url": "https://api.figma.com", "timeout": 30, "max_retries": 3, ...}
```

---

## Complete Examples

### Fetch a File and Export Component Images

**JavaScript:**

```javascript
import { FigmaClient, FilesClient } from '@internal/figma-api';

async function exportComponents() {
  const client = new FigmaClient({
    timeout: 60000,
    cache: { maxSize: 50, ttl: 300 },
  });

  const files = new FilesClient(client);

  // Get the file tree (depth 1 for performance)
  const file = await files.getFile('YOUR_FILE_KEY', { depth: 1 });
  console.log(`File: ${file.name}`);

  // Collect all component node IDs
  const componentIds = [];
  function walk(node) {
    if (node.type === 'COMPONENT') componentIds.push(node.id);
    if (node.children) node.children.forEach(walk);
  }
  walk(file.document);

  if (componentIds.length === 0) {
    console.log('No components found.');
    return;
  }

  // Export as 2x PNGs
  const images = await files.getImages('YOUR_FILE_KEY', componentIds, {
    scale: 2,
    format: 'png',
  });

  for (const [nodeId, url] of Object.entries(images.images)) {
    console.log(`${nodeId}: ${url}`);
  }

  console.log(`Stats:`, client.stats);
}

exportComponents();
```

**Python:**

```python
import asyncio
from figma_api import FigmaClient, FilesClient

async def export_components():
    async with FigmaClient(
        timeout=60,
        cache_max_size=50,
        cache_ttl=300,
    ) as client:
        files = FilesClient(client)

        # Get the file tree (depth 1 for performance)
        file = await files.get_file('YOUR_FILE_KEY', depth=1)
        print(f"File: {file['name']}")

        # Collect all component node IDs
        component_ids = []

        def walk(node):
            if node.get('type') == 'COMPONENT':
                component_ids.append(node['id'])
            for child in node.get('children', []):
                walk(child)

        walk(file['document'])

        if not component_ids:
            print('No components found.')
            return

        # Export as 2x PNGs
        images = await files.get_images('YOUR_FILE_KEY', component_ids,
                                        scale=2, format='png')

        for node_id, url in images['images'].items():
            print(f"{node_id}: {url}")

        print(f"Stats: {client.stats}")

asyncio.run(export_components())
```

### Monitor a File with Webhooks

**JavaScript:**

```javascript
import { FigmaClient, WebhooksClient } from '@internal/figma-api';

async function setupWebhook() {
  const client = new FigmaClient();
  const webhooks = new WebhooksClient(client);

  // Create a webhook for file updates
  const hook = await webhooks.createWebhook('YOUR_TEAM_ID', {
    eventType: 'FILE_UPDATE',
    endpoint: 'https://your-server.com/figma-webhook',
    passcode: 'webhook_secret_123',
    description: 'Monitor design file changes',
  });

  console.log(`Webhook created: ${hook.id}`);

  // List all team webhooks
  const allHooks = await webhooks.listTeamWebhooks('YOUR_TEAM_ID');
  console.log(`Total webhooks: ${allHooks.webhooks.length}`);
}

setupWebhook();
```

**Python:**

```python
import asyncio
from figma_api import FigmaClient, WebhooksClient

async def setup_webhook():
    async with FigmaClient() as client:
        webhooks = WebhooksClient(client)

        # Create a webhook for file updates
        hook = await webhooks.create_webhook(
            'YOUR_TEAM_ID',
            event_type='FILE_UPDATE',
            endpoint='https://your-server.com/figma-webhook',
            passcode='webhook_secret_123',
            description='Monitor design file changes',
        )

        print(f"Webhook created: {hook['id']}")

        # List all team webhooks
        all_hooks = await webhooks.list_team_webhooks('YOUR_TEAM_ID')
        print(f"Total webhooks: {len(all_hooks['webhooks'])}")

asyncio.run(setup_webhook())
```
