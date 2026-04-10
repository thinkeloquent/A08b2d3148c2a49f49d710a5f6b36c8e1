# Figma API Python SDK -- FastAPI Server Integration

> Built on FastAPI + Uvicorn | Async-first | Python 3.11+

---

## Table of Contents

- [Quick Start](#quick-start)
- [Using create_app](#using-create_app)
- [Lifespan and Client Lifecycle](#lifespan-and-client-lifecycle)
- [App State Pattern](#app-state-pattern)
- [Dependency Injection](#dependency-injection)
- [Error Handlers](#error-handlers)
- [CORS Middleware](#cors-middleware)
- [Available Routes](#available-routes)
- [Custom FastAPI Setup](#custom-fastapi-setup)
- [Running with Uvicorn](#running-with-uvicorn)

---

## Quick Start

Start the Figma API proxy server with minimal configuration:

```python
import uvicorn
from figma_api.config import Config
from figma_api.server import create_app

config = Config.from_env()
app = create_app(config)

if __name__ == "__main__":
    uvicorn.run(app, host=config.host, port=config.port)
```

Set the `FIGMA_TOKEN` environment variable and run:

```python
# In your shell before running:
# export FIGMA_TOKEN="figd_your_token_here"
```

---

## Using create_app

The `create_app` factory function builds a fully configured FastAPI application:

```python
from figma_api.config import Config
from figma_api.server import create_app

config = Config(
    figma_token="figd_...",
    base_url="https://api.figma.com",
    log_level="DEBUG",
    port=8000,
    host="0.0.0.0",
    rate_limit_auto_wait=True,
    rate_limit_threshold=0,
    timeout=30,
    cache_max_size=100,
    cache_ttl=300,
    max_retries=3,
)

app = create_app(config)
```

`create_app` performs the following setup:

1. Creates a `FigmaClient` with settings from `config`
2. Initializes all 8 domain clients (Files, Projects, Comments, Components, Variables, Webhooks, DevResources, LibraryAnalytics)
3. Attaches all clients to `app.state`
4. Registers CORS middleware (allows all origins)
5. Registers error handlers for `FigmaError` subclasses
6. Includes all API routes via `create_router()`
7. Uses a lifespan context manager for proper startup/shutdown

---

## Lifespan and Client Lifecycle

The server uses FastAPI's lifespan context manager to manage the `FigmaClient` lifecycle. The client is created on startup and closed on shutdown, ensuring no resource leaks.

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from figma_api import FigmaClient
from figma_api.config import Config
from figma_api.clients.files import FilesClient
from figma_api.clients.projects import ProjectsClient
from figma_api.clients.comments import CommentsClient
from figma_api.clients.components import ComponentsClient
from figma_api.clients.variables import VariablesClient
from figma_api.clients.webhooks import WebhooksClient


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create clients
    config = Config.from_env()
    client = FigmaClient(
        token=config.figma_token,
        base_url=config.base_url,
        timeout=config.timeout,
        max_retries=config.max_retries,
        rate_limit_auto_wait=config.rate_limit_auto_wait,
        rate_limit_threshold=config.rate_limit_threshold,
        cache_max_size=config.cache_max_size,
        cache_ttl=config.cache_ttl,
    )

    # Attach to app state
    app.state.figma_client = client
    app.state.files_client = FilesClient(client)
    app.state.projects_client = ProjectsClient(client)
    app.state.comments_client = CommentsClient(client)
    app.state.components_client = ComponentsClient(client)
    app.state.variables_client = VariablesClient(client)
    app.state.webhooks_client = WebhooksClient(client)

    yield

    # Shutdown: close client
    await client.close()


app = FastAPI(lifespan=lifespan)
```

---

## App State Pattern

After initialization, all domain clients are available on `app.state`. Access them from route handlers via `request.app.state`:

```python
from fastapi import FastAPI, Request

app = FastAPI(lifespan=lifespan)


@app.get("/v1/files/{file_key}")
async def get_file(file_key: str, request: Request):
    files_client = request.app.state.files_client
    return await files_client.get_file(file_key)


@app.get("/v1/teams/{team_id}/projects")
async def get_team_projects(team_id: str, request: Request):
    projects_client = request.app.state.projects_client
    return await projects_client.get_team_projects(team_id)
```

The state attributes set by `create_app`:

```python
app.state.figma_client        # FigmaClient
app.state.files_client         # FilesClient
app.state.projects_client      # ProjectsClient
app.state.comments_client      # CommentsClient
app.state.components_client    # ComponentsClient
app.state.variables_client     # VariablesClient
app.state.webhooks_client      # WebhooksClient
app.state.dev_resources_client # DevResourcesClient
app.state.analytics_client     # LibraryAnalyticsClient
```

---

## Dependency Injection

Use FastAPI's `Depends` with `Annotated` for clean, testable route handlers. Extract domain clients from `app.state` via dependency functions:

```python
from typing import Annotated
from fastapi import Depends, FastAPI, Request
from figma_api.clients.files import FilesClient
from figma_api.clients.comments import CommentsClient


def get_files_client(request: Request) -> FilesClient:
    return request.app.state.files_client


def get_comments_client(request: Request) -> CommentsClient:
    return request.app.state.comments_client


app = FastAPI(lifespan=lifespan)


@app.get("/v1/files/{file_key}")
async def get_file(
    file_key: str,
    files: Annotated[FilesClient, Depends(get_files_client)],
):
    return await files.get_file(file_key)


@app.get("/v1/files/{file_key}/comments")
async def list_comments(
    file_key: str,
    comments: Annotated[CommentsClient, Depends(get_comments_client)],
    as_md: bool = False,
):
    return await comments.list_comments(file_key, as_md=as_md)


@app.post("/v1/files/{file_key}/comments")
async def add_comment(
    file_key: str,
    body: dict,
    comments: Annotated[CommentsClient, Depends(get_comments_client)],
):
    return await comments.add_comment(
        file_key,
        message=body["message"],
        client_meta=body.get("client_meta"),
        comment_id=body.get("comment_id"),
    )
```

### Dependency Injection for Testing

Override dependencies in tests using `app.dependency_overrides`:

```python
import pytest
from unittest.mock import AsyncMock
from fastapi.testclient import TestClient


@pytest.fixture
def mock_files_client():
    mock = AsyncMock(spec=FilesClient)
    mock.get_file.return_value = {"name": "Test File", "document": {}}
    return mock


@pytest.fixture
def test_client(mock_files_client):
    app.dependency_overrides[get_files_client] = lambda: mock_files_client
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_get_file(test_client, mock_files_client):
    response = test_client.get("/v1/files/abc123")
    assert response.status_code == 200
    assert response.json()["name"] == "Test File"
    mock_files_client.get_file.assert_called_once_with("abc123")
```

---

## Error Handlers

`create_app` registers error handlers that convert `FigmaError` exceptions into structured JSON responses. You can register them manually on a custom app:

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from figma_api.errors import (
    FigmaError,
    AuthenticationError,
    RateLimitError,
    NotFoundError,
    ServerError,
)

app = FastAPI(lifespan=lifespan)


@app.exception_handler(FigmaError)
async def figma_error_handler(request: Request, exc: FigmaError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status or 500,
        content=exc.to_dict(),
    )
```

This handler catches all `FigmaError` subclasses and returns the error as a JSON response with the appropriate HTTP status code.

The `to_dict()` method produces:

```python
{
    "message": "Not found",
    "status": 404,
    "code": "NOT_FOUND",
    "name": "NotFoundError",
    "meta": None,
    "request_id": "req_abc123",
    "timestamp": "2026-01-31T12:00:00Z",
}
```

### Handling Specific Errors in Routes

You can also catch specific errors within individual route handlers for custom behavior:

```python
from figma_api.errors import NotFoundError, RateLimitError


@app.get("/v1/files/{file_key}")
async def get_file(
    file_key: str,
    files: Annotated[FilesClient, Depends(get_files_client)],
):
    try:
        return await files.get_file(file_key)
    except NotFoundError:
        return JSONResponse(
            status_code=404,
            content={"error": f"File '{file_key}' not found in Figma"},
        )
    except RateLimitError as e:
        return JSONResponse(
            status_code=429,
            content={
                "error": "Rate limited by Figma API",
                "retry_after": e.rate_limit_info.retry_after,
            },
        )
```

---

## CORS Middleware

`create_app` registers CORS middleware that allows all origins. To customize CORS for your own app:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(lifespan=lifespan)

# Permissive (same as create_app default)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Restrictive: only allow specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://app.example.com",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

---

## Available Routes

The `create_router()` function provides all built-in routes. These are automatically included by `create_app`:

### Health

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check endpoint |

### Files

| Method | Path | Description |
|---|---|---|
| GET | `/v1/files/{file_key}` | Get a file |
| GET | `/v1/files/{file_key}/nodes` | Get specific file nodes |
| GET | `/v1/images/{file_key}` | Render file images |
| GET | `/v1/files/{file_key}/images` | Get image fills |
| GET | `/v1/files/{file_key}/versions` | List file versions |

### Projects

| Method | Path | Description |
|---|---|---|
| GET | `/v1/teams/{team_id}/projects` | List team projects |
| GET | `/v1/projects/{project_id}/files` | List project files |

### Comments

| Method | Path | Description |
|---|---|---|
| GET | `/v1/files/{file_key}/comments` | List comments |
| POST | `/v1/files/{file_key}/comments` | Add a comment |
| DELETE | `/v1/files/{file_key}/comments/{comment_id}` | Delete a comment |

### Components and Styles

| Method | Path | Description |
|---|---|---|
| GET | `/v1/components/{key}` | Get component metadata |
| GET | `/v1/files/{file_key}/components` | List file components |
| GET | `/v1/teams/{team_id}/components` | List team components |
| GET | `/v1/component_sets/{key}` | Get component set |
| GET | `/v1/teams/{team_id}/component_sets` | List team component sets |
| GET | `/v1/teams/{team_id}/styles` | List team styles |
| GET | `/v1/styles/{key}` | Get style metadata |

### Variables

| Method | Path | Description |
|---|---|---|
| GET | `/v1/files/{file_key}/variables/local` | Get local variables |
| GET | `/v1/files/{file_key}/variables/published` | Get published variables |
| POST | `/v1/files/{file_key}/variables` | Create/update variables |

### Webhooks (v2)

| Method | Path | Description |
|---|---|---|
| GET | `/v2/webhooks/{webhook_id}` | Get webhook |
| GET | `/v2/teams/{team_id}/webhooks` | List team webhooks |
| POST | `/v2/webhooks` | Create webhook |
| PUT | `/v2/webhooks/{webhook_id}` | Update webhook |
| DELETE | `/v2/webhooks/{webhook_id}` | Delete webhook |
| GET | `/v2/webhooks/{webhook_id}/requests` | Get webhook requests |

---

## Custom FastAPI Setup

Build a fully custom server while reusing SDK components:

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Annotated

from figma_api import FigmaClient
from figma_api.config import Config
from figma_api.errors import FigmaError
from figma_api.clients.files import FilesClient
from figma_api.clients.comments import CommentsClient
from figma_api.clients.components import ComponentsClient
from figma_api.clients.variables import VariablesClient
from figma_api.logger import create_logger

logger = create_logger("my_server", "server.log")


@asynccontextmanager
async def lifespan(app: FastAPI):
    config = Config.from_env()
    client = FigmaClient(
        token=config.figma_token,
        base_url=config.base_url,
        timeout=config.timeout,
        max_retries=config.max_retries,
        rate_limit_auto_wait=config.rate_limit_auto_wait,
        cache_max_size=config.cache_max_size,
        cache_ttl=config.cache_ttl,
        logger=logger,
    )
    app.state.figma_client = client
    app.state.files = FilesClient(client, logger=logger)
    app.state.comments = CommentsClient(client, logger=logger)
    app.state.components = ComponentsClient(client, logger=logger)
    app.state.variables = VariablesClient(client, logger=logger)

    logger.info("Figma API clients initialized")
    yield

    await client.close()
    logger.info("Figma API clients shut down")


app = FastAPI(
    title="My Figma Integration",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Error handler
@app.exception_handler(FigmaError)
async def handle_figma_error(request: Request, exc: FigmaError) -> JSONResponse:
    logger.error(
        "Figma API error",
        status=exc.status,
        code=exc.code,
        message=exc.message,
    )
    return JSONResponse(status_code=exc.status or 500, content=exc.to_dict())


# Dependencies
def get_files(request: Request) -> FilesClient:
    return request.app.state.files


def get_components(request: Request) -> ComponentsClient:
    return request.app.state.components


def get_variables(request: Request) -> VariablesClient:
    return request.app.state.variables


# Routes
@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/api/files/{file_key}")
async def get_file(
    file_key: str,
    files: Annotated[FilesClient, Depends(get_files)],
    depth: int = None,
):
    return await files.get_file(file_key, depth=depth)


@app.get("/api/files/{file_key}/components")
async def get_file_components(
    file_key: str,
    components: Annotated[ComponentsClient, Depends(get_components)],
):
    return await components.get_file_components(file_key)


@app.get("/api/files/{file_key}/variables")
async def get_variables_endpoint(
    file_key: str,
    variables: Annotated[VariablesClient, Depends(get_variables)],
):
    return await variables.get_local_variables(file_key)


@app.get("/api/stats")
async def get_stats(request: Request):
    client = request.app.state.figma_client
    return client.stats
```

---

## Running with Uvicorn

### Programmatic Start

```python
import uvicorn
from figma_api.config import Config
from figma_api.server import create_app

config = Config.from_env()
app = create_app(config)

if __name__ == "__main__":
    uvicorn.run(
        app,
        host=config.host,
        port=config.port,
        log_level=config.log_level.lower(),
    )
```

### Command-Line Start

```python
# Using the module path (assumes create_app is exposed via a module-level app)
uvicorn figma_api.server:app --host 0.0.0.0 --port 8000 --reload
```

### Production Configuration

```python
import uvicorn
from figma_api.config import Config
from figma_api.server import create_app

config = Config.from_env()
app = create_app(config)

if __name__ == "__main__":
    uvicorn.run(
        app,
        host=config.host,
        port=config.port,
        workers=4,
        log_level="info",
        access_log=True,
        timeout_keep_alive=30,
    )
```

### Using Uvicorn with Auto-Reload for Development

```python
import uvicorn
from figma_api.config import Config
from figma_api.server import create_app

config = Config.from_env()
app = create_app(config)

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        reload_dirs=["src"],
        log_level="debug",
    )
```

Note: When using `reload=True`, pass the app as an import string (`"module:attribute"`) rather than the app object directly. This allows Uvicorn to re-import the module on file changes.
