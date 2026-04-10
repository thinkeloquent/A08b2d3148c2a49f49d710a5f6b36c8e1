# Jira API — FastAPI Server Integration

Guide for integrating the `jira_api` Python package into FastAPI applications.

---

## Built-in Server

The package includes a ready-to-use FastAPI server with all routes pre-configured.

### Quick Start

```bash
# Set environment variables
export JIRA_BASE_URL="https://yourteam.atlassian.net"
export JIRA_EMAIL="you@example.com"
export JIRA_API_TOKEN="your-api-token"

# Start the server
cd polyglot/jira_api/py
uvicorn jira_api.server:app --reload --host 0.0.0.0 --port 8000
```

### Programmatic Start

```python
from jira_api.server import app, start_server

# Option 1: Start with defaults from Settings
start_server()

# Option 2: Import app for ASGI servers
# uvicorn jira_api.server:app --reload
```

---

## Custom Integration

### Lifespan Context Manager

```python
from contextlib import asynccontextmanager
from typing import Annotated, Any, Optional

import uvicorn
from fastapi import Depends, FastAPI, HTTPException, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials

from jira_api.config import JiraConfig, Settings, get_config
from jira_api.core.client import JiraClient
from jira_api.exceptions import JiraAPIError
from jira_api.logger import create_logger
from jira_api.models.user import User
from jira_api.models.issue import Issue, IssueCreate, IssueTransition
from jira_api.models.project import Project, ProjectVersion
from jira_api.services.user_service import UserService
from jira_api.services.issue_service import IssueService
from jira_api.services.project_service import ProjectService

log = create_logger("my-app", __file__)
settings = Settings()
security = HTTPBasic(auto_error=False)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown logic."""
    log.info("Starting server")
    config = get_config()
    app.state.jira_config = config
    if config:
        log.info("Jira configured", {"base_url": config.base_url})
    else:
        log.warning("No JIRA configuration found")
    yield
    log.info("Shutting down")


app = FastAPI(
    title="My Jira App",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Dependency Injection

### API Key Authentication

```python
def verify_api_key(
    credentials: Optional[HTTPBasicCredentials] = Depends(security),
) -> bool:
    """Verify API key if SERVER_API_KEY is configured."""
    if not settings.server_api_key:
        return True
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Basic"},
        )
    if credentials.username != settings.server_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
            headers={"WWW-Authenticate": "Basic"},
        )
    return True
```

### Jira Client Provider

```python
def get_jira_client(request: Request) -> JiraClient:
    """Get a JiraClient from the app-level Jira configuration."""
    config: Optional[JiraConfig] = getattr(request.app.state, "jira_config", None)
    if not config:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="JIRA is not configured.",
        )
    return JiraClient(
        base_url=config.base_url,
        email=config.email,
        api_token=config.api_token,
    )
```

### Type Aliases

```python
# Clean dependency injection aliases
Auth = Annotated[bool, Depends(verify_api_key)]
Client = Annotated[JiraClient, Depends(get_jira_client)]
```

---

## Route Definitions

### Health Check

```python
@app.get("/health", tags=["Health"])
async def health_check(request: Request) -> dict:
    jira_configured = getattr(request.app.state, "jira_config", None) is not None
    return {
        "status": "healthy",
        "service": "my-jira-app",
        "jira_configured": jira_configured,
    }
```

### User Routes

```python
@app.get("/users/search", response_model=list[User], tags=["Users"])
async def search_users(
    query: str = Query(..., description="Search query"),
    max_results: int = Query(50, ge=1, le=100),
    _auth: Auth = True,
    client: Client = None,
) -> list[User]:
    try:
        with client:
            return UserService(client).search_users(query, max_results)
    except JiraAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


@app.get("/users/{identifier}", response_model=User, tags=["Users"])
async def get_user(
    identifier: str,
    _auth: Auth = True,
    client: Client = None,
) -> User:
    try:
        with client:
            user = UserService(client).get_user_by_identifier(identifier)
            if not user:
                raise HTTPException(status_code=404, detail=f"User '{identifier}' not found")
            return user
    except JiraAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))
```

### Issue Routes

```python
@app.post("/issues", response_model=Issue, tags=["Issues"])
async def create_issue(
    issue_data: IssueCreate,
    _auth: Auth = True,
    client: Client = None,
) -> Issue:
    try:
        with client:
            return IssueService(client).create_issue(
                project_id=issue_data.project_id,
                summary=issue_data.summary,
                issue_type_id=issue_data.issue_type_id,
                description=issue_data.description,
                priority_id=issue_data.priority_id,
                labels=issue_data.labels,
            )
    except JiraAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


@app.get("/issues/{issue_key}", response_model=Issue, tags=["Issues"])
async def get_issue(
    issue_key: str,
    _auth: Auth = True,
    client: Client = None,
) -> Issue:
    try:
        with client:
            return IssueService(client).get_issue(issue_key)
    except JiraAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


@app.get("/issues/{issue_key}/transitions", response_model=list[IssueTransition], tags=["Issues"])
async def get_issue_transitions(
    issue_key: str,
    _auth: Auth = True,
    client: Client = None,
) -> list[IssueTransition]:
    try:
        with client:
            return IssueService(client).get_available_transitions(issue_key)
    except JiraAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))
```

### Project Routes

```python
@app.get("/projects/{project_key}", response_model=Project, tags=["Projects"])
async def get_project(
    project_key: str,
    _auth: Auth = True,
    client: Client = None,
) -> Project:
    try:
        with client:
            return ProjectService(client).get_project(project_key)
    except JiraAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


@app.get("/projects/{project_key}/versions", response_model=list[ProjectVersion], tags=["Projects"])
async def get_project_versions(
    project_key: str,
    released: Optional[bool] = Query(None),
    _auth: Auth = True,
    client: Client = None,
) -> list[ProjectVersion]:
    try:
        with client:
            return ProjectService(client).get_project_versions(project_key, released_only=released)
    except JiraAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))
```

---

## Middleware

### Request State

```python
import copy
import uuid


@app.middleware("http")
async def init_request_state(request: Request, call_next):
    """Initialize per-request state with unique ID."""
    request.state.request_id = str(uuid.uuid4())
    request.state.data = copy.deepcopy(getattr(app.state, "initial_state", {}))
    response = await call_next(request)
    response.headers["X-Request-ID"] = request.state.request_id
    return response
```

---

## Error Handling

Jira API errors are caught in route handlers and re-raised as FastAPI `HTTPException`:

```python
try:
    with client:
        return IssueService(client).get_issue(issue_key)
except JiraAPIError as e:
    raise HTTPException(status_code=e.status_code or 400, detail=str(e))
```

Exception to HTTP mapping:

| Exception | HTTP Status |
|-----------|------------|
| `JiraAuthenticationError` | 401 |
| `JiraPermissionError` | 403 |
| `JiraNotFoundError` | 404 |
| `JiraValidationError` | 400 |
| `JiraRateLimitError` | 429 |
| `JiraServerError` | 500+ |

---

## Route Reference

| Method | Path | Body | Description |
|--------|------|------|-------------|
| `GET` | `/health` | — | Health check |
| `GET` | `/users/search?query=...&max_results=50` | — | Search users |
| `GET` | `/users/{identifier}` | — | Get user |
| `POST` | `/issues` | `IssueCreate` | Create issue |
| `GET` | `/issues/{issue_key}` | — | Get issue |
| `PATCH` | `/issues/{issue_key}` | `IssueUpdate` | Update issue |
| `PUT` | `/issues/{issue_key}/assign/{email}` | — | Assign issue |
| `GET` | `/issues/{issue_key}/transitions` | — | Get transitions |
| `POST` | `/issues/{issue_key}/transitions` | `TransitionRequest` | Transition issue |
| `GET` | `/projects/{project_key}` | — | Get project |
| `GET` | `/projects/{project_key}/versions?released=true` | — | Get versions |
| `POST` | `/projects/{project_key}/versions` | `VersionCreateRequest` | Create version |

---

## Environment Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `JIRA_BASE_URL` | Jira Cloud instance URL | (required) |
| `JIRA_EMAIL` | Jira account email | (required) |
| `JIRA_API_TOKEN` | Jira API token | (required) |
| `SERVER_HOST` | Server bind address | `0.0.0.0` |
| `SERVER_PORT` | Server port | `8000` |
| `SERVER_API_KEY` | Optional API key | — |
| `SERVER_RELOAD` | Enable auto-reload | `False` |
| `LOG_LEVEL` | Log level | `INFO` |

---

## Running

```bash
# Development with auto-reload
uvicorn jira_api.server:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn jira_api.server:app --host 0.0.0.0 --port 8000 --workers 4

# From examples directory
cd examples
make dev
```
