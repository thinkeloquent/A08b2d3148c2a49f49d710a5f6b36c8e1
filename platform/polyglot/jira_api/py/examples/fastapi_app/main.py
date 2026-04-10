"""
FastAPI Integration Example — Jira API

Demonstrates how to integrate the jira_api package into a FastAPI application
with dependency injection, typed responses, and middleware patterns.

Usage:
    uvicorn fastapi_app.main:app --reload --port 9000

Prerequisites:
    pip install -e ".[dev]"    (from the py/ directory)

Environment Variables:
    JIRA_BASE_URL   — e.g. https://yourteam.atlassian.net
    JIRA_EMAIL      — Jira account email
    JIRA_API_TOKEN  — Jira API token
    SERVER_API_KEY  — Optional API key for this server
    LOG_LEVEL       — Optional (default: INFO)
"""

from __future__ import annotations

import copy
import uuid
from contextlib import asynccontextmanager
from typing import Annotated, Any, Optional

import uvicorn
from fastapi import Depends, FastAPI, HTTPException, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from pydantic import BaseModel

from jira_api.config import JiraConfig, Settings, get_config
from jira_api.core.client import JiraClient
from jira_api.exceptions import JiraAPIError
from jira_api.logger import create_logger
from jira_api.models.issue import Issue, IssueCreate, IssueTransition, IssueUpdate
from jira_api.models.project import Project, ProjectVersion
from jira_api.models.user import User
from jira_api.services.issue_service import IssueService
from jira_api.services.project_service import ProjectService
from jira_api.services.user_service import UserService

log = create_logger("jira-api-example", __file__)
settings = Settings()
security = HTTPBasic(auto_error=False)

# ─── Configuration ─────────────────────────────────────────────────────────────

MOCK_CONFIG: dict[str, Any] = {
    "title": "Jira API Example Server",
    "version": "0.1.0",
    "log_level": settings.log_level,
}


# ─── Pydantic Response Models ─────────────────────────────────────────────────


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    jira_configured: bool


class MessageResponse(BaseModel):
    message: str


# ─── Lifespan ──────────────────────────────────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — startup and shutdown logic."""
    log.info("Starting Jira API example server")
    config = get_config()
    app.state.jira_config = config
    app.state.initial_state = {"request_count": 0}
    if config:
        log.info("Jira configured", {"base_url": config.base_url})
    else:
        log.warning("No JIRA configuration found — set JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN")
    yield
    log.info("Shutting down Jira API example server")


app = FastAPI(
    title=MOCK_CONFIG["title"],
    version=MOCK_CONFIG["version"],
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Middleware ─────────────────────────────────────────────────────────────────


@app.middleware("http")
async def init_request_state(request: Request, call_next):
    """Middleware to initialize per-request state with unique ID."""
    request.state.request_id = str(uuid.uuid4())
    request.state.data = copy.deepcopy(getattr(app.state, "initial_state", {}))
    request.state.data["request_count"] = request.state.data.get("request_count", 0) + 1
    response = await call_next(request)
    response.headers["X-Request-ID"] = request.state.request_id
    return response


# ─── Dependencies ──────────────────────────────────────────────────────────────


def get_app_config(request: Request) -> dict[str, Any]:
    """Return the application config dict."""
    return MOCK_CONFIG


def verify_api_key(
    credentials: HTTPBasicCredentials | None = Depends(security),
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


def get_jira_client(request: Request) -> JiraClient:
    """Get a JiraClient from the app-level Jira configuration."""
    config: JiraConfig | None = getattr(request.app.state, "jira_config", None)
    if not config:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="JIRA is not configured. Set JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN.",
        )
    return JiraClient(
        base_url=config.base_url,
        email=config.email,
        api_token=config.api_token,
    )


# Type aliases for dependency injection
AppConfig = Annotated[dict[str, Any], Depends(get_app_config)]
Auth = Annotated[bool, Depends(verify_api_key)]
Client = Annotated[JiraClient, Depends(get_jira_client)]


# ─── Routes: Health ────────────────────────────────────────────────────────────


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check(config: AppConfig, request: Request) -> HealthResponse:
    """Health check endpoint with Jira configuration status."""
    jira_configured = getattr(request.app.state, "jira_config", None) is not None
    return HealthResponse(
        status="healthy",
        service=config["title"],
        version=config["version"],
        jira_configured=jira_configured,
    )


# ─── Routes: Users ─────────────────────────────────────────────────────────────


@app.get("/users/search", response_model=list[User], tags=["Users"])
async def search_users(
    query: str = Query(..., description="Search query"),
    max_results: int = Query(50, ge=1, le=100),
    _auth: Auth = True,
    client: Client = None,
) -> list[User]:
    """Search for Jira users by query string."""
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
    """Get a user by account ID or email."""
    try:
        with client:
            user = UserService(client).get_user_by_identifier(identifier)
            if not user:
                raise HTTPException(status_code=404, detail=f"User '{identifier}' not found")
            return user
    except JiraAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


# ─── Routes: Issues ────────────────────────────────────────────────────────────


@app.get("/issues/{issue_key}", response_model=Issue, tags=["Issues"])
async def get_issue(
    issue_key: str,
    _auth: Auth = True,
    client: Client = None,
) -> Issue:
    """Get a Jira issue by key."""
    try:
        with client:
            return IssueService(client).get_issue(issue_key)
    except JiraAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


@app.post("/issues", response_model=Issue, tags=["Issues"])
async def create_issue(
    issue_data: IssueCreate,
    _auth: Auth = True,
    client: Client = None,
) -> Issue:
    """Create a new Jira issue."""
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


@app.get("/issues/{issue_key}/transitions", response_model=list[IssueTransition], tags=["Issues"])
async def get_issue_transitions(
    issue_key: str,
    _auth: Auth = True,
    client: Client = None,
) -> list[IssueTransition]:
    """Get available transitions for an issue."""
    try:
        with client:
            return IssueService(client).get_available_transitions(issue_key)
    except JiraAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


# ─── Routes: Projects ──────────────────────────────────────────────────────────


@app.get("/projects/{project_key}", response_model=Project, tags=["Projects"])
async def get_project(
    project_key: str,
    _auth: Auth = True,
    client: Client = None,
) -> Project:
    """Get a Jira project by key."""
    try:
        with client:
            return ProjectService(client).get_project(project_key)
    except JiraAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


@app.get("/projects/{project_key}/versions", response_model=list[ProjectVersion], tags=["Projects"])
async def get_project_versions(
    project_key: str,
    released: bool | None = Query(None),
    _auth: Auth = True,
    client: Client = None,
) -> list[ProjectVersion]:
    """Get versions for a project, optionally filtered by release status."""
    try:
        with client:
            return ProjectService(client).get_project_versions(project_key, released_only=released)
    except JiraAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


# ─── Routes: Config / Debug ────────────────────────────────────────────────────


@app.get("/config", tags=["Debug"])
async def get_config_endpoint(config: AppConfig) -> dict[str, Any]:
    """Return the application configuration (non-sensitive)."""
    return config


@app.get("/state", tags=["Debug"])
async def get_request_state(request: Request) -> dict[str, Any]:
    """Return the per-request state (demonstrates middleware)."""
    return {
        "request_id": request.state.request_id,
        "data": request.state.data,
    }


# ─── Entry Point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run(
        "fastapi_app.main:app",
        host=settings.server_host,
        port=9000,
        reload=True,
    )
