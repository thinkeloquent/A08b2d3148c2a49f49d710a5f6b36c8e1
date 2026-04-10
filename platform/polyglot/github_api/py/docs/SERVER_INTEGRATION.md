# Server Integration Guide -- github_api (Python 3.11+ / FastAPI 0.115.0)

Guide for running, configuring, and testing the FastAPI server that proxies GitHub API requests through the SDK.

---

## Table of Contents

- [Overview](#overview)
- [Creating the Application](#creating-the-application)
- [Lifespan Context Manager (Modern Approach)](#lifespan-context-manager-modern-approach)
- [Dependency Injection](#dependency-injection)
- [Error Handler Registration](#error-handler-registration)
- [CORS Configuration](#cors-configuration)
- [Running with Uvicorn](#running-with-uvicorn)
- [Environment Configuration](#environment-configuration)
- [Testing with httpx TestClient](#testing-with-httpx-testclient)
- [Custom Route Integration](#custom-route-integration)
- [Full Application Example](#full-application-example)

---

## Overview

The server layer wraps the `github_api` SDK in a FastAPI application that:

- Exposes all SDK functionality as REST endpoints under `/api/github`
- Maps SDK errors to appropriate HTTP status codes and JSON error bodies
- Manages the `GitHubClient` lifecycle (creation on startup, cleanup on shutdown)
- Provides CORS support and structured health checks

---

## Creating the Application

The simplest way to create the server is with `create_app()`:

```python
from github_api.config import Config
from github_api.server import create_app

# Load config from environment and create app
app = create_app()

# Or provide explicit configuration
config = Config(
    github_token="ghp_your_token",
    base_url="https://api.github.com",
    log_level="INFO",
    port=3100,
    host="0.0.0.0",
    rate_limit_auto_wait=True,
    rate_limit_threshold=0,
)
app = create_app(config)
```

`create_app()` sets up:
1. Logging configuration
2. CORS middleware
3. Error handlers for all `GitHubError` subclasses
4. All route registrations under `/api/github`
5. `GitHubClient` startup/shutdown lifecycle

---

## Lifespan Context Manager (Modern Approach)

FastAPI's modern lifespan pattern replaces the deprecated `@app.on_event("startup")` and `@app.on_event("shutdown")` decorators. Use this approach for new applications or when customizing the server.

```python
from contextlib import asynccontextmanager

from fastapi import FastAPI

from github_api.config import Config
from github_api.sdk.client import GitHubClient
from github_api.middleware.error_handler import register_error_handlers
from github_api.routes import create_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage GitHubClient lifecycle using the modern lifespan pattern."""
    config = Config.from_env()

    # --- Startup ---
    client = GitHubClient(
        token=config.github_token or None,
        base_url=config.base_url,
        rate_limit_auto_wait=config.rate_limit_auto_wait,
        rate_limit_threshold=config.rate_limit_threshold,
    )
    app.state.github_client = client

    yield  # Application runs here

    # --- Shutdown ---
    await client.close()


app = FastAPI(
    title="GitHub API SDK Server",
    version="1.0.0",
    lifespan=lifespan,
)

register_error_handlers(app)
app.include_router(create_router())
```

The `yield` statement separates startup logic (before) from shutdown logic (after). Any resources created before `yield` are available throughout the application's lifetime and cleaned up after the `yield`.

### Why Lifespan over on_event

| Feature | `@app.on_event` (deprecated) | `lifespan` (modern) |
|---|---|---|
| Status | Deprecated in FastAPI 0.100+ | Recommended |
| Shared state | Via `app.state` | Via `app.state` or closure |
| Error handling | Separate handlers | Single try/finally block |
| Testability | Harder to mock | Easy to replace in tests |
| Resource management | Manual cleanup tracking | Automatic with context manager |

---

## Dependency Injection

The server stores the `GitHubClient` instance on `app.state`. Routes access it through the `Request` object:

### Pattern Used in Routes

```python
from fastapi import APIRouter, Request
from github_api.sdk.repos import ReposClient

router = APIRouter(tags=["repos"])


def _get_repos_client(request: Request) -> ReposClient:
    """Create a domain client from the shared GitHubClient on app state."""
    return ReposClient(request.app.state.github_client)


@router.get("/repos/{owner}/{repo}")
async def get_repository(request: Request, owner: str, repo: str) -> dict:
    client = _get_repos_client(request)
    return await client.get(owner, repo)
```

### Using FastAPI Depends

For a more idiomatic FastAPI approach, you can use `Depends`:

```python
from fastapi import APIRouter, Depends, Request
from github_api.sdk.client import GitHubClient
from github_api.sdk.repos import ReposClient

router = APIRouter(tags=["repos"])


def get_github_client(request: Request) -> GitHubClient:
    """Dependency that provides the shared GitHubClient."""
    return request.app.state.github_client


def get_repos_client(
    client: GitHubClient = Depends(get_github_client),
) -> ReposClient:
    """Dependency that provides a ReposClient."""
    return ReposClient(client)


@router.get("/repos/{owner}/{repo}")
async def get_repository(
    owner: str,
    repo: str,
    repos: ReposClient = Depends(get_repos_client),
) -> dict:
    return await repos.get(owner, repo)
```

This pattern is useful when:
- Multiple routes need the same client
- You want to override dependencies in tests
- You want FastAPI to handle dependency lifecycle

---

## Error Handler Registration

The `register_error_handlers()` function installs exception handlers that convert SDK errors into HTTP responses:

```python
from fastapi import FastAPI
from github_api.middleware.error_handler import register_error_handlers

app = FastAPI()
register_error_handlers(app)
```

### Error-to-HTTP Mapping

| SDK Exception | HTTP Status | Response Body |
|---|---|---|
| `ValidationError` | 400 | `{"error": "ValidationError", "message": "...", "errors": [...]}` |
| `AuthError` | 401 | `{"error": "AuthError", "message": "..."}` |
| `ForbiddenError` | 403 | `{"error": "ForbiddenError", "message": "..."}` |
| `NotFoundError` | 404 | `{"error": "NotFoundError", "message": "..."}` |
| `ConflictError` | 409 | `{"error": "ConflictError", "message": "..."}` |
| `RateLimitError` | 429 | `{"error": "RateLimitError", "message": "...", "retry_after": N}` + `Retry-After` header |
| `ServerError` | 502 | `{"error": "ServerError", "message": "..."}` |
| `GitHubError` (fallback) | `exc.status` or 500 | `{"error": "GitHubError", "message": "..."}` |

All responses include `request_id` and `documentation_url` fields when available from the original GitHub API response.

### Adding Custom Error Handlers

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()
register_error_handlers(app)


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError) -> JSONResponse:
    return JSONResponse(
        status_code=400,
        content={"error": "ValueError", "message": str(exc)},
    )
```

---

## CORS Configuration

The built-in server configures CORS to allow all origins. This is suitable for development:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Restricting Origins for Production

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend.example.com",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

---

## Running with Uvicorn

### Using the Built-in Entry Point

```python
from github_api.config import Config
from github_api.server import create_app

config = Config.from_env()
app = create_app(config)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=config.host,     # Default: "0.0.0.0"
        port=config.port,     # Default: 3100
        log_level=config.log_level.lower(),
    )
```

### Using the Provided Main Module

```bash
python -m github_api.main
```

### Using Uvicorn CLI Directly

```bash
uvicorn github_api.server:create_app --factory --host 0.0.0.0 --port 3100 --log-level info
```

Note: The `--factory` flag is required because `create_app` is a factory function.

### With Auto-Reload for Development

```bash
uvicorn github_api.server:create_app --factory --host 0.0.0.0 --port 3100 --reload
```

---

## Environment Configuration

The server reads all configuration from environment variables:

```bash
# Required: GitHub token (checked in order)
export GITHUB_TOKEN=ghp_your_token_here
# export GH_TOKEN=...
# export GITHUB_ACCESS_TOKEN=...
# export GITHUB_PAT=...

# Optional: Server configuration
export HOST=0.0.0.0           # Default: 0.0.0.0
export PORT=3100               # Default: 3100
export LOG_LEVEL=INFO          # Default: INFO (DEBUG, WARNING, ERROR)
export GITHUB_BASE_URL=https://api.github.com  # Default; override for GHES
export RATE_LIMIT_AUTO_WAIT=true   # Default: true
export RATE_LIMIT_THRESHOLD=0      # Default: 0
```

---

## Testing with httpx TestClient

FastAPI applications are tested using `httpx.AsyncClient` with the `ASGITransport`, or using `TestClient` from `starlette.testclient` for synchronous tests.

### Synchronous Tests with TestClient

```python
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from starlette.testclient import TestClient

from github_api.config import Config
from github_api.server import create_app


@pytest.fixture
def test_config() -> Config:
    return Config(
        github_token="ghp_test_token_for_testing",
        base_url="https://api.github.com",
        log_level="WARNING",
        port=3100,
        host="127.0.0.1",
    )


@pytest.fixture
def app(test_config: Config) -> "FastAPI":
    return create_app(test_config)


@pytest.fixture
def client(app) -> TestClient:
    return TestClient(app)


def test_health_check(client: TestClient):
    response = client.get("/api/github/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "github-api"
    assert data["version"] == "1.0.0"
```

### Async Tests with httpx

```python
import pytest
import httpx
from unittest.mock import AsyncMock, patch

from github_api.config import Config
from github_api.server import create_app


@pytest.fixture
def app():
    config = Config(github_token="ghp_test_token_for_testing")
    return create_app(config)


@pytest.mark.asyncio
async def test_get_repository(app):
    mock_repo_data = {
        "full_name": "octocat/Hello-World",
        "description": "My first repository",
        "stargazers_count": 100,
    }

    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        with patch.object(
            app.state.github_client, "get", new_callable=AsyncMock
        ) as mock_get:
            mock_get.return_value = mock_repo_data

            response = await client.get("/api/github/repos/octocat/Hello-World")
            assert response.status_code == 200
            assert response.json()["full_name"] == "octocat/Hello-World"
```

### Mocking the GitHubClient for Tests

```python
import pytest
from unittest.mock import AsyncMock, MagicMock

from fastapi import FastAPI
from starlette.testclient import TestClient

from github_api.middleware.error_handler import register_error_handlers
from github_api.routes import create_router


@pytest.fixture
def mock_client() -> MagicMock:
    """Create a mock GitHubClient."""
    client = MagicMock()
    client.get = AsyncMock(return_value={"full_name": "test/repo"})
    client.post = AsyncMock(return_value={"id": 1})
    client.put = AsyncMock(return_value={})
    client.patch = AsyncMock(return_value={})
    client.delete = AsyncMock(return_value={})
    return client


@pytest.fixture
def app(mock_client) -> FastAPI:
    """Create a test app with mocked client."""
    app = FastAPI()
    register_error_handlers(app)
    app.include_router(create_router())
    app.state.github_client = mock_client
    return app


@pytest.fixture
def client(app) -> TestClient:
    return TestClient(app)


def test_get_repo(client, mock_client):
    response = client.get("/api/github/repos/owner/repo")
    assert response.status_code == 200
    mock_client.get.assert_called_once_with("/repos/owner/repo")
```

### Testing Error Responses

```python
from github_api.sdk.errors import NotFoundError, ValidationError


def test_not_found_error(client, mock_client):
    mock_client.get = AsyncMock(
        side_effect=NotFoundError("Not Found", request_id="REQ-123")
    )
    response = client.get("/api/github/repos/owner/missing")
    assert response.status_code == 404
    data = response.json()
    assert data["error"] == "NotFoundError"
    assert data["message"] == "Not Found"


def test_validation_error(client):
    # Input validation happens before the mock is called
    response = client.get("/api/github/repos/-invalid/repo")
    assert response.status_code == 400
    data = response.json()
    assert data["error"] == "ValidationError"
```

### Using respx for HTTP Mocking

For integration tests that mock the actual GitHub API at the HTTP level:

```python
import pytest
import respx
import httpx

from github_api.sdk.client import GitHubClient
from github_api.sdk.repos import ReposClient


@pytest.mark.asyncio
async def test_get_repo_with_respx():
    with respx.mock:
        respx.get("https://api.github.com/repos/octocat/Hello-World").mock(
            return_value=httpx.Response(
                200,
                json={
                    "full_name": "octocat/Hello-World",
                    "stargazers_count": 2500,
                },
                headers={
                    "x-ratelimit-limit": "5000",
                    "x-ratelimit-remaining": "4999",
                    "x-ratelimit-reset": "1700000000",
                },
            )
        )

        async with GitHubClient(token="ghp_test_token") as client:
            repos = ReposClient(client)
            repo = await repos.get("octocat", "Hello-World")
            assert repo["full_name"] == "octocat/Hello-World"
            assert repo["stargazers_count"] == 2500

            # Verify rate limit was parsed
            assert client.last_rate_limit is not None
            assert client.last_rate_limit.remaining == 4999
```

---

## Custom Route Integration

### Adding Custom Routes to the Server

```python
from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI, Request

from github_api.config import Config
from github_api.middleware.error_handler import register_error_handlers
from github_api.routes import create_router
from github_api.sdk.client import GitHubClient
from github_api.sdk.repos import ReposClient


@asynccontextmanager
async def lifespan(app: FastAPI):
    config = Config.from_env()
    client = GitHubClient(
        token=config.github_token or None,
        base_url=config.base_url,
        rate_limit_auto_wait=config.rate_limit_auto_wait,
        rate_limit_threshold=config.rate_limit_threshold,
    )
    app.state.github_client = client
    yield
    await client.close()


app = FastAPI(
    title="Custom GitHub API Server",
    version="1.0.0",
    lifespan=lifespan,
)

register_error_handlers(app)

# Include the standard SDK routes
app.include_router(create_router())

# Add custom routes
custom_router = APIRouter(prefix="/custom", tags=["custom"])


@custom_router.get("/repo-summary/{owner}/{repo}")
async def repo_summary(request: Request, owner: str, repo: str) -> dict:
    """Custom endpoint that combines multiple SDK calls."""
    client = request.app.state.github_client
    repos = ReposClient(client)

    repo_data = await repos.get(owner, repo)
    topics = await repos.get_topics(owner, repo)
    languages = await repos.get_languages(owner, repo)

    return {
        "name": repo_data["full_name"],
        "description": repo_data.get("description"),
        "stars": repo_data.get("stargazers_count", 0),
        "forks": repo_data.get("forks_count", 0),
        "topics": topics.get("names", []),
        "languages": languages,
    }


app.include_router(custom_router)
```

---

## Full Application Example

A complete server application with the modern lifespan pattern:

```python
"""Full GitHub API server example with modern FastAPI patterns."""

import logging
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from github_api.config import Config
from github_api.middleware.error_handler import register_error_handlers
from github_api.routes import create_router
from github_api.sdk.client import GitHubClient

logger = logging.getLogger("github_api.server")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle: create and close the GitHub client."""
    config: Config = app.state.config

    logger.info(
        "Starting GitHub API server (host=%s, port=%d)",
        config.host,
        config.port,
    )

    client = GitHubClient(
        token=config.github_token or None,
        base_url=config.base_url,
        rate_limit_auto_wait=config.rate_limit_auto_wait,
        rate_limit_threshold=config.rate_limit_threshold,
    )
    app.state.github_client = client
    logger.info("GitHub SDK client initialized")

    yield

    await client.close()
    logger.info("GitHub SDK client closed")


def create_custom_app(config: Config | None = None) -> FastAPI:
    """Create the FastAPI application with the modern lifespan pattern."""
    if config is None:
        config = Config.from_env()

    logging.basicConfig(
        level=getattr(logging, config.log_level.upper(), logging.INFO),
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    app = FastAPI(
        title="GitHub API SDK Server",
        version="1.0.0",
        description="GitHub API SDK -- Polyglot Common Interface (Python)",
        lifespan=lifespan,
    )

    # Store config on app state for lifespan access
    app.state.config = config

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Error handlers
    register_error_handlers(app)

    # Routes
    app.include_router(create_router())

    return app


if __name__ == "__main__":
    config = Config.from_env()
    app = create_custom_app(config)
    uvicorn.run(
        app,
        host=config.host,
        port=config.port,
        log_level=config.log_level.lower(),
    )
```

### Running the Full Example

```bash
# Set environment
export GITHUB_TOKEN=ghp_your_token_here
export PORT=3100
export LOG_LEVEL=INFO

# Run the server
python -m github_api.main

# Or with uvicorn directly
uvicorn github_api.server:create_app --factory --host 0.0.0.0 --port 3100
```

### Verify the Server

```bash
# Health check
curl http://localhost:3100/api/github/health

# Health with rate limit status
curl http://localhost:3100/api/github/health/rate-limit

# Get a repository
curl http://localhost:3100/api/github/repos/octocat/Hello-World

# List branches
curl http://localhost:3100/api/github/repos/octocat/Hello-World/branches

# Interactive API docs (Swagger UI)
open http://localhost:3100/docs
```
