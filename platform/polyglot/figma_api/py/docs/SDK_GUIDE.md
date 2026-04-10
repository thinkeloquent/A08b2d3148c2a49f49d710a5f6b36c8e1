# Figma API Python SDK -- Usage Guide

> Python 3.11+ | Async-first | Built on httpx + FastAPI

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Async Client Usage](#async-client-usage)
- [Domain Clients](#domain-clients)
- [Error Handling](#error-handling)
- [Caching](#caching)
- [Rate Limiting](#rate-limiting)
- [Retry Behavior](#retry-behavior)
- [Logging](#logging)
- [Configuration](#configuration)
- [Environment Variables](#environment-variables)

---

## Installation

Install the package in editable mode with development dependencies:

```python
# From the py/ directory
pip install -e ".[dev]"
```

This installs:
- **Runtime:** fastapi, uvicorn, pydantic, httpx
- **Dev:** pytest, pytest-asyncio, respx, coverage, pytest-cov, ruff

Requires **Python 3.11+**.

---

## Quick Start

```python
import asyncio
from figma_api import FigmaClient
from figma_api.clients.files import FilesClient

async def main():
    async with FigmaClient() as client:
        files = FilesClient(client)
        result = await files.get_file("YOUR_FILE_KEY")
        print(result["name"])

asyncio.run(main())
```

Set your token via environment variable before running:

```python
import os
os.environ["FIGMA_TOKEN"] = "figd_your_token_here"
```

Or pass it explicitly:

```python
client = FigmaClient(token="figd_your_token_here")
```

---

## Async Client Usage

### Creating a Client

`FigmaClient` is fully async, built on `httpx.AsyncClient`.

```python
from figma_api import FigmaClient

# Minimal -- token from env
client = FigmaClient()

# Fully configured
client = FigmaClient(
    token="figd_...",
    base_url="https://api.figma.com",
    timeout=60,
    max_retries=5,
    rate_limit_auto_wait=True,
    rate_limit_threshold=10,
    cache_max_size=200,
    cache_ttl=600,
)
```

### Context Manager (Recommended)

Always use the async context manager to ensure proper cleanup of HTTP connections:

```python
async with FigmaClient(token="figd_...") as client:
    data = await client.get("/v1/files/abc123")
    # client.close() is called automatically on exit
```

### Manual Lifecycle

If you cannot use a context manager, close the client explicitly:

```python
client = FigmaClient()
try:
    data = await client.get("/v1/files/abc123")
finally:
    await client.close()
```

### Direct HTTP Methods

Use the low-level HTTP methods for any Figma API endpoint:

```python
async with FigmaClient() as client:
    # GET with query parameters
    file_data = await client.get("/v1/files/abc123", params={"depth": 2})

    # POST with JSON body
    comment = await client.post(
        "/v1/files/abc123/comments",
        body={"message": "Looks good!"},
    )

    # PUT
    await client.put("/v2/webhooks/wh_123", body={"status": "ACTIVE"})

    # DELETE
    await client.delete("/v1/files/abc123/comments/456")

    # Raw response (returns httpx.Response)
    response = await client.get_raw("/v1/files/abc123/images")
    print(response.status_code)
    print(response.headers)
```

### Inspecting Client Stats

```python
async with FigmaClient() as client:
    await client.get("/v1/files/abc123")
    await client.get("/v1/files/abc123")  # cache hit

    stats = client.stats
    print(f"Requests made: {stats['requests_made']}")
    print(f"Cache hits: {stats['cache_hits']}")
    print(f"Cache misses: {stats['cache_misses']}")
    print(f"Rate limit waits: {stats['rate_limit_waits']}")
```

---

## Domain Clients

Domain clients provide typed, high-level methods for specific Figma API areas. Each takes a `FigmaClient` instance and an optional logger.

### Files

```python
from figma_api.clients.files import FilesClient

async with FigmaClient() as client:
    files = FilesClient(client)

    # Full file
    file_data = await files.get_file("abc123")

    # Specific nodes only
    nodes = await files.get_file_nodes("abc123", ids=["1:2", "3:4"])

    # Render images
    images = await files.get_images(
        "abc123",
        ids=["1:2"],
        scale=2.0,
        format="png",
    )

    # Image fills (background images, etc.)
    fills = await files.get_image_fills("abc123")

    # Version history
    versions = await files.get_file_versions("abc123")
```

### Projects

```python
from figma_api.clients.projects import ProjectsClient

async with FigmaClient() as client:
    projects = ProjectsClient(client)

    team_projects = await projects.get_team_projects("team_123")

    project_files = await projects.get_project_files(
        "project_456",
        branch_data=True,
    )
```

### Comments

```python
from figma_api.clients.comments import CommentsClient

async with FigmaClient() as client:
    comments = CommentsClient(client)

    # List all comments
    all_comments = await comments.list_comments("abc123", as_md=True)

    # Add a comment
    new_comment = await comments.add_comment(
        "abc123",
        message="This needs revision.",
        client_meta={"node_id": "1:2", "node_offset": {"x": 100, "y": 200}},
    )

    # Reply to a comment
    reply = await comments.add_comment(
        "abc123",
        message="Done!",
        comment_id="existing_comment_id",
    )

    # Delete a comment
    await comments.delete_comment("abc123", "comment_id_789")
```

### Components and Styles

```python
from figma_api.clients.components import ComponentsClient

async with FigmaClient() as client:
    components = ComponentsClient(client)

    # Single component
    comp = await components.get_component("comp_key")

    # All components in a file
    file_comps = await components.get_file_components("abc123")

    # Team components with pagination
    page1 = await components.get_team_components("team_123", page_size=30)
    page2 = await components.get_team_components(
        "team_123",
        page_size=30,
        cursor=page1.get("cursor"),
    )

    # Component sets (variant groups)
    comp_set = await components.get_component_set("set_key")

    # Team styles
    styles = await components.get_team_styles("team_123")
    style = await components.get_style("style_key")
```

### Variables

```python
from figma_api.clients.variables import VariablesClient

async with FigmaClient() as client:
    variables = VariablesClient(client)

    # Read local variables
    local_vars = await variables.get_local_variables("abc123")

    # Read published variables
    published = await variables.get_published_variables("abc123")

    # Create/update variables
    result = await variables.create_variables("abc123", {
        "variableCollections": [...],
        "variables": [...],
        "variableModes": [...],
    })
```

### Webhooks

```python
from figma_api.clients.webhooks import WebhooksClient

async with FigmaClient() as client:
    webhooks = WebhooksClient(client)

    # List team webhooks
    hooks = await webhooks.list_team_webhooks("team_123")

    # Create a webhook
    new_hook = await webhooks.create_webhook(
        "team_123",
        event_type="FILE_UPDATE",
        endpoint="https://example.com/webhook",
        passcode="my_secret",
        description="Notify on file updates",
    )

    # Get webhook details
    hook = await webhooks.get_webhook(new_hook["id"])

    # Update
    await webhooks.update_webhook(hook["id"], {"status": "PAUSED"})

    # Check delivery history
    requests = await webhooks.get_webhook_requests(hook["id"])

    # Delete
    await webhooks.delete_webhook(hook["id"])
```

---

## Error Handling

All Figma API errors are mapped to typed exceptions. Use `try`/`except` to handle specific failure modes.

### Basic Error Handling

```python
from figma_api.errors import (
    FigmaError,
    AuthenticationError,
    NotFoundError,
    RateLimitError,
    ServerError,
)

async with FigmaClient() as client:
    try:
        data = await client.get("/v1/files/abc123")
    except AuthenticationError as e:
        print(f"Bad token: {e.message}")
        print(f"Request ID: {e.request_id}")
    except NotFoundError:
        print("File not found")
    except RateLimitError as e:
        print(f"Rate limited. Retry after: {e.rate_limit_info.retry_after}s")
    except ServerError as e:
        print(f"Figma server error ({e.status}): {e.message}")
    except FigmaError as e:
        # Catch-all for any Figma API error
        print(f"[{e.code}] {e.message} (HTTP {e.status})")
        print(e.to_dict())
```

### Granular Error Inspection

```python
from figma_api.errors import FigmaError

try:
    await client.get("/v1/files/nonexistent")
except FigmaError as e:
    error_dict = e.to_dict()
    # {
    #     "message": "Not found",
    #     "status": 404,
    #     "code": "NOT_FOUND",
    #     "name": "NotFoundError",
    #     "meta": None,
    #     "request_id": "req_abc123",
    #     "timestamp": "2026-01-31T12:00:00Z",
    # }
```

### Handling Network and Timeout Errors

```python
from figma_api.errors import NetworkError, TimeoutError

try:
    await client.get("/v1/files/abc123")
except TimeoutError:
    print("Request timed out -- consider increasing timeout")
except NetworkError as e:
    print(f"Network failure: {e.message}")
```

---

## Caching

GET requests are cached automatically using an in-memory LRU cache with TTL expiration.

### Default Behavior

```python
# Cache is enabled by default: 100 entries, 300s TTL
async with FigmaClient() as client:
    # First call: cache miss -- makes HTTP request
    await client.get("/v1/files/abc123")

    # Second call: cache hit -- returns cached response instantly
    await client.get("/v1/files/abc123")

    print(client.stats["cache_hits"])    # 1
    print(client.stats["cache_misses"])  # 1
```

### Custom Cache Settings

```python
client = FigmaClient(
    cache_max_size=500,  # store up to 500 responses
    cache_ttl=60,        # expire after 60 seconds
)
```

### Disabling the Cache

Set `cache_max_size=0` to effectively disable caching:

```python
client = FigmaClient(cache_max_size=0)
```

### Direct Cache Access

The cache is available on the underlying `RequestCache` instance:

```python
from figma_api.cache import RequestCache

cache = RequestCache(max_size=100, ttl=300)
cache.set("/v1/files/abc", {"name": "My File"})

if cache.has("/v1/files/abc"):
    data = cache.get("/v1/files/abc")

stats = cache.stats  # CacheStats(hits=1, misses=0, size=1)

cache.clear()
```

---

## Rate Limiting

The SDK handles Figma's 429 (Too Many Requests) responses automatically.

### Automatic Waiting (Default)

By default, the client reads the `Retry-After` header and waits before retrying:

```python
# Auto-wait is on by default
client = FigmaClient(rate_limit_auto_wait=True)
```

### Setting a Threshold

Only auto-wait if the `Retry-After` is below a threshold (in seconds). If the wait exceeds the threshold, a `RateLimitError` is raised instead:

```python
client = FigmaClient(
    rate_limit_auto_wait=True,
    rate_limit_threshold=30,  # only wait if retry_after <= 30s
)
```

### Custom Rate Limit Callback

Provide a callback to control behavior on rate limits. Return `False` to prevent the retry:

```python
from figma_api.rate_limit import RateLimitInfo

def on_rate_limit(info: RateLimitInfo) -> bool:
    print(f"Rate limited! Retry after {info.retry_after}s")
    print(f"Plan tier: {info.plan_tier}")
    if info.retry_after > 60:
        return False  # do not retry, raise RateLimitError instead
    return True  # proceed with auto-wait

client = FigmaClient(
    rate_limit_auto_wait=True,
    on_rate_limit=on_rate_limit,
)
```

### Inspecting Rate Limit State

```python
async with FigmaClient() as client:
    await client.get("/v1/files/abc123")

    if client.last_rate_limit:
        info = client.last_rate_limit
        print(f"Last rate limit: retry_after={info.retry_after}s")
        print(f"Type: {info.rate_limit_type}")

    print(f"Total rate limit waits: {client.stats['rate_limit_waits']}")
    print(f"Total wait time: {client.stats['rate_limit_total_wait_seconds']}s")
```

---

## Retry Behavior

The SDK retries requests that fail with **5xx server errors** using exponential backoff.

### Default Behavior

```python
# 3 retries with exponential backoff (1s, 2s, 4s, capped at 30s)
client = FigmaClient(max_retries=3)
```

### Custom Retry Configuration

```python
client = FigmaClient(max_retries=5)  # up to 5 retries
```

### What Is Retried

Only **5xx** status codes trigger automatic retries. Client errors (4xx) are not retried. Rate limits (429) are handled separately by the rate limiting logic.

### Using Retry Utilities Directly

```python
from figma_api.retry import calculate_backoff, is_retryable, with_retry

# Check if a status is retryable
is_retryable(502)  # True
is_retryable(404)  # False

# Calculate backoff delay
calculate_backoff(0)  # 1.0 seconds
calculate_backoff(1)  # 2.0 seconds
calculate_backoff(2)  # 4.0 seconds

# Wrap any async function with retry logic
async def fetch_data():
    return await client.get("/v1/files/abc123")

result = await with_retry(fetch_data, max_retries=3, initial_wait=1.0, max_wait=30.0)
```

---

## Logging

The SDK includes a structured logger with automatic redaction of sensitive values.

### Creating a Logger

```python
from figma_api.logger import create_logger

logger = create_logger("figma_api", "sdk.log")

logger.info("Fetching file", file_key="abc123")
logger.debug("Request details", url="/v1/files/abc123", params={"depth": 2})
logger.error("Request failed", status=500, message="Internal Server Error")
```

### Passing a Logger to Clients

```python
from figma_api import FigmaClient
from figma_api.logger import create_logger

logger = create_logger("my_app", "app.log")

client = FigmaClient(token="figd_...", logger=logger)
files = FilesClient(client, logger=logger)
```

### Log Levels

```python
logger.set_level("DEBUG")   # Show all messages
logger.set_level("INFO")    # Default
logger.set_level("WARN")    # Warnings and above
logger.set_level("ERROR")   # Errors and critical only
```

Available levels: `TRACE` (5), `DEBUG` (10), `INFO` (20), `WARN`/`WARNING` (30), `ERROR` (40), `CRITICAL` (50).

### Automatic Redaction

Sensitive keyword arguments are automatically redacted in log output:

```python
logger.info("Auth configured", token="figd_abcdefghijklmnop")
# Output: Auth configured token=figd_abc***

logger.info("Auth configured", password="short")
# Output: Auth configured password=***
```

The following keys are redacted: `token`, `secret`, `password`, `auth`, `credential`, `authorization`, `apikey`, `api_key`, `accesstoken`, `access_token`.

---

## Configuration

### Using Config.from_env()

The `Config` class reads all settings from environment variables with sensible defaults:

```python
from figma_api.config import Config

# Reads from environment variables, falls back to defaults
config = Config.from_env()

print(config.base_url)               # "https://api.figma.com"
print(config.timeout)                # 30
print(config.max_retries)            # 3
print(config.rate_limit_auto_wait)   # True
print(config.cache_max_size)         # 100
print(config.cache_ttl)              # 300
```

### Creating Config Programmatically

`Config` is a frozen dataclass, so you construct it directly:

```python
from figma_api.config import Config

config = Config(
    figma_token="figd_...",
    base_url="https://api.figma.com",
    log_level="DEBUG",
    port=9000,
    host="127.0.0.1",
    rate_limit_auto_wait=True,
    rate_limit_threshold=10,
    timeout=60,
    cache_max_size=200,
    cache_ttl=600,
    max_retries=5,
)
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `FIGMA_TOKEN` | Primary Figma API token | -- |
| `FIGMA_ACCESS_TOKEN` | Fallback Figma API token | -- |
| `FIGMA_API_BASE_URL` | Base URL for API requests | `https://api.figma.com` |
| `LOG_LEVEL` | Logging level | `INFO` |
| `PORT` | Server port | `8000` |
| `HOST` | Server host | `0.0.0.0` |
| `FIGMA_TIMEOUT` | Request timeout in seconds | `30` |
| `MAX_RETRIES` | Maximum retry attempts | `3` |
| `RATE_LIMIT_AUTO_WAIT` | Auto-wait on 429 responses | `True` |
| `RATE_LIMIT_THRESHOLD` | Max seconds to auto-wait | `0` |
| `CACHE_MAX_SIZE` | Maximum cache entries | `100` |
| `CACHE_TTL` | Cache TTL in seconds | `300` |
