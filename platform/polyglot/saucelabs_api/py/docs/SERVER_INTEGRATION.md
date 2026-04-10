# Sauce Labs API Python SDK -- FastAPI Server Integration

> Built on FastAPI + Uvicorn | Async-first | Python 3.11+

---

## Table of Contents

- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Lifespan and Client Lifecycle](#lifespan-and-client-lifecycle)
- [App State Pattern](#app-state-pattern)
- [Dependency Injection](#dependency-injection)
- [Route Registration](#route-registration)
- [Error Handlers](#error-handlers)
- [Lifecycle Plugin Pattern](#lifecycle-plugin-pattern)
- [Complete FastAPI Server Example](#complete-fastapi-server-example)
- [Running with Uvicorn](#running-with-uvicorn)
- [Environment Configuration](#environment-configuration)

---

## Quick Start

Start a Sauce Labs API proxy server with minimal configuration:

```python
import uvicorn
from fastapi import FastAPI
from saucelabs_api import create_saucelabs_client

app = FastAPI()

# See Lifespan section for proper setup
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3000)
```

Set credentials via environment variables and run:

```python
# In your shell before running:
# export SAUCE_USERNAME="your_username"
# export SAUCE_ACCESS_KEY="your_access_key"
```

---

## Architecture

The integration follows three patterns:

1. **Lifespan context manager** -- Creates and tears down the `SaucelabsClient` with the FastAPI app lifecycle
2. **`app.state` pattern** -- Stores the client and all domain modules on `app.state` for shared access
3. **Dependency injection** -- Uses `Annotated[Type, Depends(getter)]` to extract clients from `app.state` into route handlers

This ensures a single HTTP connection pool is shared across all requests and properly closed on shutdown.

---

## Lifespan and Client Lifecycle

The server uses FastAPI's lifespan context manager to manage the `SaucelabsClient` lifecycle. The client is created on startup and closed on shutdown, ensuring no resource leaks.

```python
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from saucelabs_api import (
    SaucelabsClient,
    create_saucelabs_client,
    JobsModule,
    PlatformModule,
    UsersModule,
    UploadModule,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create client with all domain modules
    client = create_saucelabs_client(
        username=os.environ.get("SAUCE_USERNAME", ""),
        api_key=os.environ.get("SAUCE_ACCESS_KEY", ""),
        region=os.environ.get("SAUCE_REGION", "us-west-1"),
        timeout=float(os.environ.get("SAUCE_TIMEOUT", "30")),
        rate_limit_auto_wait=True,
    )

    # Attach to app state
    app.state.saucelabs = client
    app.state.saucelabs_clients = {
        "jobs": client.jobs,
        "platform": client.platform,
        "users": client.users,
        "upload": client.upload,
    }

    yield

    # Shutdown: close client
    await client.close()


app = FastAPI(lifespan=lifespan)
```

---

## App State Pattern

After initialization, the client and all domain modules are available on `app.state`. Access them from route handlers via `request.app.state`:

```python
from fastapi import FastAPI, Request

app = FastAPI(lifespan=lifespan)


@app.get("/demo/platform/status")
async def get_platform_status(request: Request):
    platform = request.app.state.saucelabs_clients["platform"]
    return await platform.get_status()


@app.get("/demo/jobs")
async def list_jobs(request: Request, limit: int = 10):
    jobs = request.app.state.saucelabs_clients["jobs"]
    return await jobs.list(params={"limit": limit})
```

The state attributes set by the lifespan handler:

```python
app.state.saucelabs                      # SaucelabsClient (core client)
app.state.saucelabs_clients["jobs"]      # JobsModule
app.state.saucelabs_clients["platform"]  # PlatformModule
app.state.saucelabs_clients["users"]     # UsersModule
app.state.saucelabs_clients["upload"]    # UploadModule
```

---

## Dependency Injection

Use FastAPI's `Depends` with `Annotated` for clean, testable route handlers. Extract domain modules from `app.state` via dependency functions:

```python
from typing import Annotated
from fastapi import Depends, FastAPI, Request
from saucelabs_api import (
    SaucelabsClient,
    JobsModule,
    PlatformModule,
    UsersModule,
)


def get_saucelabs_client(request: Request) -> SaucelabsClient:
    return request.app.state.saucelabs


def get_jobs_client(request: Request) -> JobsModule:
    return request.app.state.saucelabs_clients["jobs"]


def get_platform_client(request: Request) -> PlatformModule:
    return request.app.state.saucelabs_clients["platform"]


def get_users_client(request: Request) -> UsersModule:
    return request.app.state.saucelabs_clients["users"]


# Type aliases for cleaner route signatures
SaucelabsClientDep = Annotated[SaucelabsClient, Depends(get_saucelabs_client)]
JobsDep = Annotated[JobsModule, Depends(get_jobs_client)]
PlatformDep = Annotated[PlatformModule, Depends(get_platform_client)]
UsersDep = Annotated[UsersModule, Depends(get_users_client)]


app = FastAPI(lifespan=lifespan)


@app.get("/demo/jobs")
async def list_jobs(jobs: JobsDep, limit: int = 10, skip: int = 0):
    result = await jobs.list(params={"limit": limit, "skip": skip})
    return {"success": True, "data": result}


@app.get("/demo/jobs/{job_id}")
async def get_job(job_id: str, jobs: JobsDep):
    result = await jobs.get(job_id)
    return {"success": True, "data": result}


@app.get("/demo/platform/status")
async def get_platform_status(platform: PlatformDep):
    result = await platform.get_status()
    return {"success": True, "data": result}


@app.get("/demo/users/{username}")
async def get_user(username: str, users: UsersDep):
    result = await users.get_user(username)
    return {"success": True, "data": result}
```

### Dependency Injection for Testing

Override dependencies in tests using `app.dependency_overrides`:

```python
import pytest
from unittest.mock import AsyncMock
from fastapi.testclient import TestClient


@pytest.fixture
def mock_jobs_client():
    mock = AsyncMock(spec=JobsModule)
    mock.list.return_value = [{"id": "job_123", "name": "Test Job"}]
    mock.get.return_value = {"id": "job_123", "name": "Test Job", "status": "passed"}
    return mock


@pytest.fixture
def test_client(mock_jobs_client):
    app.dependency_overrides[get_jobs_client] = lambda: mock_jobs_client
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_list_jobs(test_client, mock_jobs_client):
    response = test_client.get("/demo/jobs?limit=5")
    assert response.status_code == 200
    assert response.json()["success"] is True
    mock_jobs_client.list.assert_called_once_with(params={"limit": 5, "skip": 0})
```

---

## Route Registration

Register routes that use the dependency-injected domain modules:

```python
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from saucelabs_api import SaucelabsNotFoundError, SaucelabsValidationError

app = FastAPI(lifespan=lifespan)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "saucelabs-api-proxy"}


@app.get("/demo/jobs")
async def list_jobs(jobs: JobsDep, limit: int = 10, skip: int = 0):
    result = await jobs.list(params={"limit": limit, "skip": skip})
    return {"success": True, "data": result}


@app.get("/demo/jobs/{job_id}")
async def get_job(job_id: str, jobs: JobsDep):
    result = await jobs.get(job_id)
    return {"success": True, "data": result}


@app.get("/demo/platform/status")
async def get_platform_status(platform: PlatformDep):
    result = await platform.get_status()
    return {"success": True, "data": result}


@app.get("/demo/platform/{automation_api}")
async def get_platforms(automation_api: str, platform: PlatformDep):
    result = await platform.get_platforms(automation_api)
    return {"success": True, "data": result}


@app.get("/demo/users/{username}")
async def get_user(username: str, users: UsersDep):
    result = await users.get_user(username)
    return {"success": True, "data": result}


@app.get("/demo/users/{username}/concurrency")
async def get_concurrency(username: str, users: UsersDep):
    result = await users.get_concurrency(username)
    return {"success": True, "data": result}
```

---

## Error Handlers

Register an exception handler that converts `SaucelabsError` exceptions into structured JSON responses:

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from saucelabs_api import SaucelabsError

app = FastAPI(lifespan=lifespan)


@app.exception_handler(SaucelabsError)
async def saucelabs_error_handler(_request: Request, exc: SaucelabsError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code or 500,
        content={
            "success": False,
            "error": {
                "name": type(exc).__name__,
                "message": str(exc),
                "status_code": exc.status_code,
            },
        },
    )
```

This handler catches all `SaucelabsError` subclasses and returns the error as a JSON response with the appropriate HTTP status code.

The response body shape:

```python
{
    "success": False,
    "error": {
        "name": "SaucelabsNotFoundError",
        "message": "Resource not found (404): Job abc123 not found",
        "status_code": 404,
    },
}
```

### Handling Specific Errors in Routes

You can also catch specific errors within individual route handlers for custom behavior:

```python
from saucelabs_api import SaucelabsNotFoundError, SaucelabsValidationError


@app.get("/demo/jobs/{job_id}")
async def get_job(job_id: str, jobs: JobsDep):
    try:
        result = await jobs.get(job_id)
        return {"success": True, "data": result}
    except SaucelabsNotFoundError:
        return JSONResponse(
            status_code=404,
            content={"success": False, "error": f"Job {job_id} not found"},
        )
    except SaucelabsValidationError as e:
        return JSONResponse(
            status_code=400,
            content={"success": False, "error": str(e)},
        )
```

---

## Lifecycle Plugin Pattern

For projects using a lifecycle plugin convention, create a file named `520_saucelabs_api.lifecycle.py` that exports the lifespan logic as a reusable plugin:

```python
# 520_saucelabs_api.lifecycle.py

"""
Lifecycle plugin for the Sauce Labs API SDK.

Initializes and tears down the SaucelabsClient within the FastAPI
application lifespan. Attaches the client and all domain modules
to app.state for dependency injection.
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI

from saucelabs_api import create_saucelabs_client


@asynccontextmanager
async def saucelabs_lifespan(app: FastAPI):
    """
    Sauce Labs API lifecycle handler.

    Creates a SaucelabsClient with all domain modules on startup,
    stores them on app.state, and closes the client on shutdown.
    """
    client = create_saucelabs_client(
        username=os.environ.get("SAUCE_USERNAME", ""),
        api_key=os.environ.get("SAUCE_ACCESS_KEY", ""),
        region=os.environ.get("SAUCE_REGION", "us-west-1"),
        timeout=float(os.environ.get("SAUCE_TIMEOUT", "30")),
        rate_limit_auto_wait=True,
    )

    app.state.saucelabs = client
    app.state.saucelabs_clients = {
        "jobs": client.jobs,
        "platform": client.platform,
        "users": client.users,
        "upload": client.upload,
    }

    yield

    await client.close()
```

Use the plugin in your main application:

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Compose multiple lifecycle plugins
    async with saucelabs_lifespan(app):
        yield


app = FastAPI(lifespan=lifespan)
```

---

## Complete FastAPI Server Example

A fully working server that demonstrates all integration patterns:

```python
"""
Complete FastAPI server integrating the Sauce Labs API SDK.

Usage:
    uvicorn server:app --reload --port 3000

Prerequisites:
    export SAUCE_USERNAME="your_username"
    export SAUCE_ACCESS_KEY="your_access_key"
    pip install -e ".[dev]"
"""

import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Annotated

import uvicorn
from fastapi import Depends, FastAPI, Request
from fastapi.responses import JSONResponse

from saucelabs_api import (
    SaucelabsClient,
    SaucelabsError,
    SaucelabsNotFoundError,
    SaucelabsValidationError,
    create_saucelabs_client,
    JobsModule,
    PlatformModule,
    UsersModule,
    UploadModule,
)


# ---------------------------------------------------------------------------
# Lifespan
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    client = create_saucelabs_client(
        username=os.environ.get("SAUCE_USERNAME", ""),
        api_key=os.environ.get("SAUCE_ACCESS_KEY", ""),
        region=os.environ.get("SAUCE_REGION", "us-west-1"),
        timeout=float(os.environ.get("SAUCE_TIMEOUT", "30")),
        rate_limit_auto_wait=True,
    )

    app.state.saucelabs = client
    app.state.saucelabs_clients = {
        "jobs": client.jobs,
        "platform": client.platform,
        "users": client.users,
        "upload": client.upload,
    }

    yield

    await client.close()


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Sauce Labs API Proxy",
    description="FastAPI server integrating the saucelabs_api SDK",
    version="1.0.0",
    lifespan=lifespan,
)


# ---------------------------------------------------------------------------
# Dependencies
# ---------------------------------------------------------------------------

def get_saucelabs_client(request: Request) -> SaucelabsClient:
    return request.app.state.saucelabs


def get_jobs_client(request: Request) -> JobsModule:
    return request.app.state.saucelabs_clients["jobs"]


def get_platform_client(request: Request) -> PlatformModule:
    return request.app.state.saucelabs_clients["platform"]


def get_users_client(request: Request) -> UsersModule:
    return request.app.state.saucelabs_clients["users"]


SaucelabsClientDep = Annotated[SaucelabsClient, Depends(get_saucelabs_client)]
JobsDep = Annotated[JobsModule, Depends(get_jobs_client)]
PlatformDep = Annotated[PlatformModule, Depends(get_platform_client)]
UsersDep = Annotated[UsersModule, Depends(get_users_client)]


# ---------------------------------------------------------------------------
# Error handler
# ---------------------------------------------------------------------------

@app.exception_handler(SaucelabsError)
async def saucelabs_error_handler(_request: Request, exc: SaucelabsError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code or 500,
        content={
            "success": False,
            "error": {
                "name": type(exc).__name__,
                "message": str(exc),
                "status_code": exc.status_code,
            },
        },
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "saucelabs-api-proxy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/demo/jobs")
async def list_jobs(jobs: JobsDep, limit: int = 10, skip: int = 0):
    result = await jobs.list(params={"limit": limit, "skip": skip})
    return {"success": True, "data": result}


@app.get("/demo/jobs/{job_id}")
async def get_job(job_id: str, jobs: JobsDep):
    try:
        result = await jobs.get(job_id)
        return {"success": True, "data": result}
    except SaucelabsNotFoundError:
        return JSONResponse(
            status_code=404,
            content={"success": False, "error": f"Job {job_id} not found"},
        )


@app.get("/demo/platform/status")
async def get_platform_status(platform: PlatformDep):
    result = await platform.get_status()
    return {"success": True, "data": result}


@app.get("/demo/platform/{automation_api}")
async def get_platforms(automation_api: str, platform: PlatformDep):
    try:
        result = await platform.get_platforms(automation_api)
        return {"success": True, "data": result}
    except SaucelabsValidationError as e:
        return JSONResponse(
            status_code=400,
            content={"success": False, "error": str(e)},
        )


@app.get("/demo/users/{username}")
async def get_user(username: str, users: UsersDep):
    result = await users.get_user(username)
    return {"success": True, "data": result}


@app.get("/demo/users/{username}/concurrency")
async def get_concurrency(username: str, users: UsersDep):
    result = await users.get_concurrency(username)
    return {"success": True, "data": result}


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=int(os.environ.get("PORT", "3000")),
        reload=True,
    )
```

---

## Running with Uvicorn

### Development (Auto-Reload)

```python
uvicorn server:app --host 127.0.0.1 --port 3000 --reload --log-level debug
```

Note: When using `--reload`, pass the app as an import string (`"module:attribute"`) rather than the app object directly. This allows Uvicorn to re-import the module on file changes.

### Production

```python
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=3000,
        workers=4,
        log_level="info",
        access_log=True,
        timeout_keep_alive=30,
    )
```

### Programmatic Start

```python
import os
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "3000"))
    uvicorn.run(
        "server:app",
        host=os.environ.get("HOST", "0.0.0.0"),
        port=port,
        reload=os.environ.get("ENV", "development") == "development",
    )
```

---

## Environment Configuration

| Variable | Description | Default |
|---|---|---|
| `SAUCE_USERNAME` | Sauce Labs username | -- |
| `SAUCE_ACCESS_KEY` | Sauce Labs access key | -- |
| `SAUCE_REGION` | Data center region (`us-west-1`, `us-east-4`, `eu-central-1`) | `us-west-1` |
| `SAUCE_TIMEOUT` | Request timeout in seconds | `30` |
| `PORT` | Server port | `3000` |
| `HOST` | Server host | `0.0.0.0` |
| `LOG_LEVEL` | SDK logging level (`DEBUG`, `INFO`, `WARNING`, `ERROR`, `SILENT`) | `INFO` |
| `HTTPS_PROXY` | HTTPS proxy URL | -- |
| `HTTP_PROXY` | HTTP proxy URL (fallback) | -- |
| `ENV` | Environment mode (for reload behavior) | `development` |
