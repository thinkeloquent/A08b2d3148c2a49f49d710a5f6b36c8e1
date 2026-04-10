# Sauce Labs API Python SDK -- Usage Guide

> Python 3.11+ | Async-first | Built on httpx + FastAPI

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Async Client Usage](#async-client-usage)
- [Domain Modules](#domain-modules)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Logging](#logging)
- [Configuration](#configuration)
- [Environment Variables](#environment-variables)
- [Complete Working Example](#complete-working-example)

---

## Installation

Install the package in editable mode with development dependencies:

```python
# From the py/ directory
pip install -e ".[dev]"
```

This installs:
- **Runtime:** httpx, fastapi, uvicorn
- **Dev:** pytest, pytest-asyncio, respx, coverage, pytest-cov, ruff

Requires **Python 3.11+**.

---

## Quick Start

```python
import asyncio
from saucelabs_api import SaucelabsClient

async def main():
    async with SaucelabsClient() as client:
        status = await client.get("/rest/v1/info/status")
        print(status)

asyncio.run(main())
```

Set your credentials via environment variables before running:

```python
import os
os.environ["SAUCE_USERNAME"] = "your_username"
os.environ["SAUCE_ACCESS_KEY"] = "your_access_key"
```

Or pass them explicitly:

```python
client = SaucelabsClient(username="your_username", api_key="your_access_key")
```

---

## Async Client Usage

### Creating a Client

`SaucelabsClient` is fully async, built on `httpx.AsyncClient`. It manages two HTTP transports: one for the Core Automation API and one for the Mobile Distribution API.

```python
from saucelabs_api import SaucelabsClient

# Minimal -- credentials from env
client = SaucelabsClient()

# Fully configured
client = SaucelabsClient(
    username="your_username",
    api_key="your_access_key",
    region="us-west-1",
    timeout=60.0,
    rate_limit_auto_wait=True,
    verify_ssl=True,
    proxy="https://proxy.example.com:8080",
)
```

### Context Manager (Recommended)

Always use the async context manager to ensure proper cleanup of HTTP connections:

```python
async with SaucelabsClient(username="demo", api_key="xxx") as client:
    data = await client.get("/rest/v1/demo/jobs")
    # client.close() is called automatically on exit
```

### Manual Lifecycle

If you cannot use a context manager, close the client explicitly:

```python
client = SaucelabsClient()
try:
    data = await client.get("/rest/v1/info/status")
finally:
    await client.close()
```

### Direct HTTP Methods

Use the low-level HTTP methods for any Sauce Labs API endpoint:

```python
async with SaucelabsClient() as client:
    # GET with query parameters
    jobs = await client.get("/rest/v1/demo/jobs", params={"limit": 10})

    # POST with JSON body
    result = await client.post(
        "/rest/v1/demo/jobs/abc123/stop",
        json={"reason": "manual stop"},
    )

    # PUT
    await client.put("/rest/v1/demo/jobs/abc123", json={"name": "Updated Job"})

    # PATCH
    await client.patch("/rest/v1/demo/jobs/abc123", json={"tags": ["regression"]})

    # DELETE
    await client.delete("/rest/v1/demo/jobs/abc123")

    # Raw response (returns httpx.Response)
    response = await client.get_raw("/rest/v1/info/status")
    print(response.status_code)
    print(response.headers)

    # Mobile Distribution API
    mobile_data = await client.get("/api/some-endpoint", mobile=True)
```

---

## Domain Modules

Domain modules provide typed, high-level methods for specific Sauce Labs API areas. Use `create_saucelabs_client()` to get a client with all modules pre-attached.

### Jobs

```python
from saucelabs_api import create_saucelabs_client

async with create_saucelabs_client(username="demo", api_key="xxx") as client:
    # List recent jobs
    jobs = await client.jobs.list(params={"limit": 10, "skip": 0})

    # List jobs with time range (Unix timestamps)
    jobs = await client.jobs.list(params={
        "limit": 50,
        "from": 1700000000,
        "to": 1700086400,
    })

    # Get a specific job
    job = await client.jobs.get("abc123def456")
```

### Platform

```python
async with create_saucelabs_client(username="demo", api_key="xxx") as client:
    # Service status (public, no auth required)
    status = await client.platform.get_status()

    # All supported platforms
    all_platforms = await client.platform.get_platforms("all")

    # Appium platforms only
    appium_platforms = await client.platform.get_platforms("appium")

    # WebDriver platforms only
    webdriver_platforms = await client.platform.get_platforms("webdriver")
```

### Users

```python
async with create_saucelabs_client(username="demo", api_key="xxx") as client:
    # Get current user info (uses configured username)
    user = await client.users.get_user()

    # Get a specific user's info
    other_user = await client.users.get_user("other_username")

    # Get concurrency stats for current user
    concurrency = await client.users.get_concurrency()

    # Get concurrency for a specific user
    concurrency = await client.users.get_concurrency("other_username")
```

### Upload

```python
async with create_saucelabs_client(username="demo", api_key="xxx") as client:
    # Upload an APK file
    result = await client.upload.upload_app(
        file="/path/to/app.apk",
        api_key="distribution_api_key",
        app_name="My App",
        upload_to_saucelabs=True,
        notify=True,
    )

    # Upload from bytes
    with open("/path/to/app.ipa", "rb") as f:
        result = await client.upload.upload_app(
            file=f.read(),
            api_key="distribution_api_key",
            app_name="My iOS App",
        )
```

---

## Error Handling

All Sauce Labs API errors are mapped to typed exceptions. Use `try`/`except` to handle specific failure modes.

### Basic Error Handling

```python
from saucelabs_api import (
    SaucelabsError,
    SaucelabsAuthError,
    SaucelabsNotFoundError,
    SaucelabsRateLimitError,
    SaucelabsValidationError,
    SaucelabsServerError,
)

async with SaucelabsClient(username="demo", api_key="xxx") as client:
    try:
        data = await client.get("/rest/v1/demo/jobs")
    except SaucelabsAuthError as e:
        print(f"Bad credentials: {e}")
        print(f"Status: {e.status_code}")
    except SaucelabsNotFoundError:
        print("Resource not found")
    except SaucelabsRateLimitError as e:
        print(f"Rate limited. Retry after: {e.retry_after}s")
    except SaucelabsValidationError as e:
        print(f"Invalid request: {e}")
    except SaucelabsServerError as e:
        print(f"Server error ({e.status_code}): {e}")
    except SaucelabsError as e:
        # Catch-all for any Sauce Labs API error
        print(f"[{type(e).__name__}] {e} (HTTP {e.status_code})")
```

### Granular Error Inspection

```python
from saucelabs_api import SaucelabsError

try:
    await client.get("/rest/v1/demo/jobs/nonexistent")
except SaucelabsError as e:
    print(f"Message: {e}")
    print(f"Status code: {e.status_code}")
    print(f"Response body: {e.response_body}")
    print(f"Headers: {e.headers}")
    print(f"Endpoint: {e.endpoint}")
    print(f"Method: {e.method}")
```

### Using the Error Factory

```python
from saucelabs_api import create_error_from_response

err = create_error_from_response(401, {"message": "Unauthorized"}, {})
# -> SaucelabsAuthError

err = create_error_from_response(429, "Too many requests", {"retry-after": "60"})
# -> SaucelabsRateLimitError with retry_after=60.0

err = create_error_from_response(500, {"error": "Internal error"}, {})
# -> SaucelabsServerError
```

---

## Rate Limiting

The SDK handles Sauce Labs 429 (Too Many Requests) responses automatically.

### Automatic Waiting (Default)

By default, the client reads the `Retry-After` header and waits before retrying:

```python
# Auto-wait is on by default
client = SaucelabsClient(rate_limit_auto_wait=True)
```

### Custom Rate Limit Callback

Provide a callback to control behavior on rate limits. Return `False` to prevent the retry:

```python
from saucelabs_api.types import RateLimitInfo

def on_rate_limit(info: RateLimitInfo) -> bool:
    print(f"Rate limited! Retry after {info.retry_after}s")
    print(f"Remaining: {info.remaining}")
    if info.retry_after > 60:
        return False  # do not retry, raise SaucelabsRateLimitError instead
    return True  # proceed with auto-wait

client = SaucelabsClient(
    rate_limit_auto_wait=True,
    on_rate_limit=on_rate_limit,
)
```

### Inspecting Rate Limit State

```python
async with SaucelabsClient() as client:
    await client.get("/rest/v1/demo/jobs")

    if client.last_rate_limit:
        info = client.last_rate_limit
        print(f"Last rate limit: retry_after={info.retry_after}s")
        print(f"Remaining: {info.remaining}")
        print(f"Limit: {info.limit}")
        print(f"Reset at: {info.reset_at}")
```

### Exponential Backoff

When `Retry-After` is not available, the rate limiter uses exponential backoff with jitter:

```python
from saucelabs_api import RateLimiter

RateLimiter._calculate_backoff(0)   # ~1.0-2.0s
RateLimiter._calculate_backoff(1)   # ~2.0-3.0s
RateLimiter._calculate_backoff(2)   # ~4.0-5.0s
RateLimiter._calculate_backoff(5)   # ~32.0-33.0s
RateLimiter._calculate_backoff(10)  # 60.0s (clamped to max_delay)
```

---

## Logging

The SDK includes a structured logger with automatic redaction of sensitive values.

### Creating a Logger

```python
from saucelabs_api import create_logger

logger = create_logger("saucelabs_api", "my-module")

logger.info("Fetching jobs", {"username": "demo"})
logger.debug("Request details", {"url": "/rest/v1/demo/jobs", "params": {"limit": 10}})
logger.error("Request failed", {"status": 500, "message": "Internal Server Error"})
```

### Log Levels via LOG_LEVEL Env Var

Control the output level using the `LOG_LEVEL` environment variable:

```python
# Show all messages
os.environ["LOG_LEVEL"] = "DEBUG"

# Default -- info and above
os.environ["LOG_LEVEL"] = "INFO"

# Warnings and above
os.environ["LOG_LEVEL"] = "WARNING"

# Errors only
os.environ["LOG_LEVEL"] = "ERROR"

# Suppress all output
os.environ["LOG_LEVEL"] = "SILENT"
```

Available levels: `DEBUG` (10), `INFO` (20), `WARNING` (30), `ERROR` (40), `SILENT` (100).

### Passing a Logger to the Client

```python
from saucelabs_api import SaucelabsClient, create_logger

logger = create_logger("my_app", "saucelabs")

client = SaucelabsClient(
    username="demo",
    api_key="xxx",
    logger=logger,
)
```

### Automatic Redaction

Sensitive context values are automatically redacted in log output:

```python
logger.info("Auth configured", {"api_key": "sk_live_abcdef123456"})
# Output: ... INFO Auth configured {'api_key': '[REDACTED]'}

logger.info("Connection", {"access_key": "secret", "region": "us-west-1"})
# Output: ... INFO Connection {'access_key': '[REDACTED]', 'region': 'us-west-1'}
```

The following key patterns are redacted: `token`, `secret`, `password`, `key`, `auth`, `credential`, `access_key`, `api_key`.

---

## Configuration

### Using resolve_config()

The `resolve_config()` function reads all settings from keyword arguments, environment variables, and defaults:

```python
from saucelabs_api import resolve_config

# Reads from environment variables, falls back to defaults
config = resolve_config()

print(config["base_url"])               # "https://api.us-west-1.saucelabs.com"
print(config["mobile_base_url"])        # "https://mobile.saucelabs.com"
print(config["timeout"])                # 30.0
print(config["rate_limit_auto_wait"])   # True
```

### Region-Based Configuration

Different regions map to different API base URLs:

```python
from saucelabs_api import resolve_config, CORE_REGIONS, MOBILE_REGIONS

# US West (default)
config = resolve_config(region="us-west-1")
# -> base_url: https://api.us-west-1.saucelabs.com

# EU Central
config = resolve_config(region="eu-central-1")
# -> base_url: https://api.eu-central-1.saucelabs.com

# Available core regions
for name, url in CORE_REGIONS.items():
    print(f"{name}: {url}")
# us-west-1:    https://api.us-west-1.saucelabs.com
# us-east-4:    https://api.us-east-4.saucelabs.com
# eu-central-1: https://api.eu-central-1.saucelabs.com

# Available mobile regions
for name, url in MOBILE_REGIONS.items():
    print(f"{name}: {url}")
# us-east:      https://mobile.saucelabs.com
# eu-central-1: https://mobile.eu-central-1.saucelabs.com
```

### Custom Base URL Override

```python
from saucelabs_api import resolve_core_base_url, resolve_mobile_base_url

# Override with a custom proxy URL
url = resolve_core_base_url("us-west-1", "https://custom-proxy.example.com/")
# -> "https://custom-proxy.example.com"
```

### Using SaucelabsClientOptions

```python
from saucelabs_api import SaucelabsClientOptions, create_saucelabs_client

options = SaucelabsClientOptions(
    username="demo",
    api_key="xxx",
    region="eu-central-1",
    timeout=60.0,
    rate_limit_auto_wait=True,
    verify_ssl=True,
)

client = create_saucelabs_client(options=options)
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `SAUCE_USERNAME` | Primary Sauce Labs username | -- |
| `SAUCELABS_USERNAME` | Fallback Sauce Labs username | -- |
| `SAUCE_ACCESS_KEY` | Primary Sauce Labs access key | -- |
| `SAUCELABS_ACCESS_KEY` | Fallback Sauce Labs access key | -- |
| `LOG_LEVEL` | Logging level (`DEBUG`, `INFO`, `WARNING`, `ERROR`, `SILENT`) | `INFO` |
| `HTTPS_PROXY` | HTTPS proxy URL | -- |
| `HTTP_PROXY` | HTTP proxy URL (fallback) | -- |

---

## Complete Working Example

A self-contained async program that demonstrates all core SDK features:

```python
import asyncio
import os

from saucelabs_api import (
    SaucelabsClient,
    create_saucelabs_client,
    SaucelabsError,
    SaucelabsAuthError,
    SaucelabsNotFoundError,
    SaucelabsRateLimitError,
    SaucelabsServerError,
    create_logger,
    CORE_REGIONS,
)


async def main():
    # Configure credentials
    os.environ["SAUCE_USERNAME"] = "your_username"
    os.environ["SAUCE_ACCESS_KEY"] = "your_access_key"

    # Create a client with all domain modules
    client = create_saucelabs_client(region="us-west-1", timeout=15.0)

    async with client:
        # 1. Check platform status (public endpoint)
        try:
            status = await client.platform.get_status()
            print(f"Sauce Labs status: {status}")
        except SaucelabsError as e:
            print(f"Status check failed: {e}")

        # 2. List supported platforms
        try:
            platforms = await client.platform.get_platforms("webdriver")
            print(f"Found {len(platforms)} WebDriver platforms")
        except SaucelabsError as e:
            print(f"Platform fetch failed: {e}")

        # 3. Get user info
        try:
            user = await client.users.get_user()
            print(f"User: {user}")
        except SaucelabsAuthError:
            print("Authentication failed -- check credentials")
        except SaucelabsError as e:
            print(f"User fetch failed: {e}")

        # 4. List recent jobs
        try:
            jobs = await client.jobs.list(params={"limit": 5})
            print(f"Recent jobs: {len(jobs)}")
            for job in jobs:
                print(f"  {job.get('id')} -- {job.get('name', 'unnamed')}")
        except SaucelabsAuthError:
            print("Authentication failed -- check credentials")
        except SaucelabsError as e:
            print(f"Jobs fetch failed: {e}")

        # 5. Get concurrency stats
        try:
            concurrency = await client.users.get_concurrency()
            print(f"Concurrency: {concurrency}")
        except SaucelabsError as e:
            print(f"Concurrency fetch failed: {e}")

        # 6. Check rate limit state
        if client.last_rate_limit:
            info = client.last_rate_limit
            print(f"Rate limited during session: retry_after={info.retry_after}s")

    print("Client closed. Done.")


if __name__ == "__main__":
    asyncio.run(main())
```
