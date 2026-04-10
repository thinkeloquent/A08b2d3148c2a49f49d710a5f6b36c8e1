"""
GitHub API SDK -- FastAPI Server Example

Demonstrates how to build a FastAPI server that proxies GitHub API
operations through the SDK with proper error handling, validation,
and rate limit awareness.

Prerequisites:
    export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

Usage:
    uvicorn main:app --reload --port 3100

Endpoints:
    GET  /health                              - Health check with rate limit
    GET  /api/repos/{owner}/{repo}            - Get repository details
    GET  /api/repos/user/{username}           - List user repositories
    GET  /api/repos/{owner}/{repo}/branches   - List branches
    GET  /api/repos/{owner}/{repo}/tags       - List tags
    POST /api/repos                           - Create repository
"""

from __future__ import annotations

import logging
import os
import sys
from contextlib import asynccontextmanager
from typing import Annotated, Any

from fastapi import Depends, FastAPI, Query, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Add the SDK package to sys.path so it can be imported without pip install.
# In production you would ``pip install github-api`` instead.
# ---------------------------------------------------------------------------
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from github_api.sdk.auth import mask_token
from github_api.sdk.client import GitHubClient
from github_api.sdk.errors import (
    AuthError,
    ConflictError,
    ForbiddenError,
    GitHubError,
    NotFoundError,
    RateLimitError,
    ServerError,
    ValidationError,
)
from github_api.sdk.repos.client import ReposClient
from github_api.sdk.branches.client import BranchesClient
from github_api.sdk.tags.client import TagsClient
from github_api.sdk.pagination import paginate_all

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("examples.fastapi_app")


# ===========================================================================
# Pydantic request / response models
# ===========================================================================

class HealthResponse(BaseModel):
    """Response for the /health endpoint."""
    status: str = "ok"
    version: str = "1.0.0"
    token_source: str | None = None
    token_type: str | None = None
    rate_limit_remaining: int | None = None
    rate_limit_limit: int | None = None


class CreateRepoRequest(BaseModel):
    """Request body for POST /api/repos."""
    name: str = Field(..., description="Repository name", min_length=1, max_length=100)
    description: str = Field(default="", description="Repository description")
    private: bool = Field(default=False, description="Whether the repo is private")
    auto_init: bool = Field(default=False, description="Initialize with a README")


class RepoResponse(BaseModel):
    """Simplified repository response."""
    full_name: str
    description: str | None = None
    html_url: str
    language: str | None = None
    stargazers_count: int = 0
    forks_count: int = 0
    default_branch: str = "main"
    private: bool = False
    topics: list[str] = []

    model_config = {"extra": "allow"}


class BranchResponse(BaseModel):
    """Simplified branch response."""
    name: str
    protected: bool = False

    model_config = {"extra": "allow"}


class TagResponse(BaseModel):
    """Simplified tag response."""
    name: str
    zipball_url: str = ""
    tarball_url: str = ""

    model_config = {"extra": "allow"}


class ErrorResponse(BaseModel):
    """Structured error response returned by exception handlers."""
    error: str
    message: str
    status: int | None = None
    request_id: str | None = None
    documentation_url: str | None = None


# ===========================================================================
# Application lifespan (startup / shutdown)
# ===========================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage the GitHubClient lifecycle.

    Creates the client on startup and closes it on shutdown.
    This replaces the deprecated ``@app.on_event`` pattern.
    """
    logger.info("Starting FastAPI example server")

    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        logger.warning(
            "GITHUB_TOKEN not set -- the server will start but API calls will fail. "
            "Set it with: export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx"
        )

    client = GitHubClient(
        token=token,
        rate_limit_auto_wait=True,
        rate_limit_threshold=5,
    )
    app.state.github_client = client

    logger.info(
        "GitHubClient initialized (token=%s, source=%s, type=%s)",
        mask_token(client.token_info.token),
        client.token_info.source,
        client.token_info.type,
    )

    yield  # -- application runs here --

    await client.close()
    logger.info("GitHubClient closed")


# ===========================================================================
# FastAPI application
# ===========================================================================

app = FastAPI(
    title="GitHub API SDK -- Example Server",
    version="1.0.0",
    description=(
        "A minimal FastAPI server demonstrating how to integrate the "
        "github-api Python SDK for repository, branch, and tag operations."
    ),
    lifespan=lifespan,
)


# ===========================================================================
# Exception handlers
# ===========================================================================

@app.exception_handler(ValidationError)
async def handle_validation_error(request: Request, exc: ValidationError) -> JSONResponse:
    """Map SDK ValidationError to 400 Bad Request."""
    logger.warning("Validation error: %s", exc.message)
    return JSONResponse(status_code=400, content=exc.to_dict())


@app.exception_handler(AuthError)
async def handle_auth_error(request: Request, exc: AuthError) -> JSONResponse:
    """Map SDK AuthError to 401 Unauthorized."""
    logger.error("Auth error: %s", exc.message)
    return JSONResponse(status_code=401, content=exc.to_dict())


@app.exception_handler(ForbiddenError)
async def handle_forbidden_error(request: Request, exc: ForbiddenError) -> JSONResponse:
    """Map SDK ForbiddenError to 403 Forbidden."""
    logger.warning("Forbidden: %s", exc.message)
    return JSONResponse(status_code=403, content=exc.to_dict())


@app.exception_handler(NotFoundError)
async def handle_not_found_error(request: Request, exc: NotFoundError) -> JSONResponse:
    """Map SDK NotFoundError to 404 Not Found."""
    logger.info("Not found: %s", exc.message)
    return JSONResponse(status_code=404, content=exc.to_dict())


@app.exception_handler(ConflictError)
async def handle_conflict_error(request: Request, exc: ConflictError) -> JSONResponse:
    """Map SDK ConflictError to 409 Conflict."""
    logger.warning("Conflict: %s", exc.message)
    return JSONResponse(status_code=409, content=exc.to_dict())


@app.exception_handler(RateLimitError)
async def handle_rate_limit_error(request: Request, exc: RateLimitError) -> JSONResponse:
    """Map SDK RateLimitError to 429 Too Many Requests."""
    logger.warning("Rate limit: %s (retry_after=%s)", exc.message, exc.retry_after)
    headers: dict[str, str] = {}
    if exc.retry_after is not None:
        headers["Retry-After"] = str(exc.retry_after)
    return JSONResponse(status_code=429, content=exc.to_dict(), headers=headers)


@app.exception_handler(ServerError)
async def handle_server_error(request: Request, exc: ServerError) -> JSONResponse:
    """Map SDK ServerError to 502 Bad Gateway."""
    logger.error("Upstream server error: %s", exc.message)
    return JSONResponse(status_code=502, content=exc.to_dict())


@app.exception_handler(GitHubError)
async def handle_github_error(request: Request, exc: GitHubError) -> JSONResponse:
    """Catch-all for any other GitHubError subclass."""
    status_code = exc.status or 500
    logger.error("GitHub API error (%d): %s", status_code, exc.message)
    return JSONResponse(status_code=status_code, content=exc.to_dict())


# ===========================================================================
# Dependency injection
# ===========================================================================

def get_github_client(request: Request) -> GitHubClient:
    """Retrieve the shared GitHubClient from app state."""
    return request.app.state.github_client


def get_repos_client(
    client: Annotated[GitHubClient, Depends(get_github_client)],
) -> ReposClient:
    """Create a ReposClient from the shared GitHubClient."""
    return ReposClient(client)


def get_branches_client(
    client: Annotated[GitHubClient, Depends(get_github_client)],
) -> BranchesClient:
    """Create a BranchesClient from the shared GitHubClient."""
    return BranchesClient(client)


def get_tags_client(
    client: Annotated[GitHubClient, Depends(get_github_client)],
) -> TagsClient:
    """Create a TagsClient from the shared GitHubClient."""
    return TagsClient(client)


# Annotated dependency types for cleaner route signatures
ReposClientDep = Annotated[ReposClient, Depends(get_repos_client)]
BranchesClientDep = Annotated[BranchesClient, Depends(get_branches_client)]
TagsClientDep = Annotated[TagsClient, Depends(get_tags_client)]
GitHubClientDep = Annotated[GitHubClient, Depends(get_github_client)]


# ===========================================================================
# Routes
# ===========================================================================

# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/health", response_model=HealthResponse, tags=["system"])
async def health_check(client: GitHubClientDep) -> HealthResponse:
    """Health check endpoint with rate limit status.

    Returns server version, token metadata, and the latest known
    rate limit values so monitoring tools can track API quota.
    """
    rate = client.last_rate_limit
    return HealthResponse(
        status="ok",
        version="1.0.0",
        token_source=client.token_info.source,
        token_type=client.token_info.type,
        rate_limit_remaining=rate.remaining if rate else None,
        rate_limit_limit=rate.limit if rate else None,
    )


# ---------------------------------------------------------------------------
# Repository routes
# ---------------------------------------------------------------------------

@app.get(
    "/api/repos/{owner}/{repo}",
    tags=["repos"],
    summary="Get repository details",
)
async def get_repository(
    owner: str,
    repo: str,
    repos_client: ReposClientDep,
) -> dict[str, Any]:
    """Fetch detailed information about a single repository.

    Path parameters are validated by the SDK before the request is sent.
    """
    logger.info("GET /api/repos/%s/%s", owner, repo)
    return await repos_client.get(owner, repo)


@app.get(
    "/api/repos/user/{username}",
    tags=["repos"],
    summary="List user repositories",
)
async def list_user_repos(
    username: str,
    repos_client: ReposClientDep,
    per_page: Annotated[int, Query(ge=1, le=100)] = 30,
    page: Annotated[int, Query(ge=1)] = 1,
    sort: Annotated[str, Query()] = "updated",
) -> dict[str, Any]:
    """List public repositories for a GitHub user.

    Supports pagination via ``per_page`` and ``page`` query parameters.
    """
    logger.info("GET /api/repos/user/%s (page=%d, per_page=%d)", username, page, per_page)
    return await repos_client.list_for_user(
        username,
        params={"per_page": per_page, "page": page, "sort": sort},
    )


@app.post(
    "/api/repos",
    tags=["repos"],
    summary="Create a repository",
    status_code=201,
)
async def create_repository(
    body: CreateRepoRequest,
    repos_client: ReposClientDep,
) -> dict[str, Any]:
    """Create a new repository for the authenticated user.

    The repository name is validated by both the Pydantic model and
    the SDK's ``validate_repository_name`` before the API call.
    """
    logger.info("POST /api/repos (name=%s)", body.name)
    return await repos_client.create(body.model_dump(exclude_unset=False))


@app.get(
    "/api/repos/{owner}/{repo}/topics",
    tags=["repos"],
    summary="Get repository topics",
)
async def get_repo_topics(
    owner: str,
    repo: str,
    repos_client: ReposClientDep,
) -> dict[str, Any]:
    """Get the list of topics for a repository."""
    logger.info("GET /api/repos/%s/%s/topics", owner, repo)
    return await repos_client.get_topics(owner, repo)


@app.get(
    "/api/repos/{owner}/{repo}/languages",
    tags=["repos"],
    summary="Get repository languages",
)
async def get_repo_languages(
    owner: str,
    repo: str,
    repos_client: ReposClientDep,
) -> dict[str, Any]:
    """Get the language breakdown for a repository."""
    logger.info("GET /api/repos/%s/%s/languages", owner, repo)
    return await repos_client.get_languages(owner, repo)


# ---------------------------------------------------------------------------
# Branch routes
# ---------------------------------------------------------------------------

@app.get(
    "/api/repos/{owner}/{repo}/branches",
    tags=["branches"],
    summary="List branches",
)
async def list_branches(
    owner: str,
    repo: str,
    branches_client: BranchesClientDep,
    per_page: Annotated[int, Query(ge=1, le=100)] = 30,
    page: Annotated[int, Query(ge=1)] = 1,
) -> dict[str, Any]:
    """List branches for a repository with pagination."""
    logger.info("GET /api/repos/%s/%s/branches (page=%d)", owner, repo, page)
    return await branches_client.list(
        owner,
        repo,
        params={"per_page": per_page, "page": page},
    )


@app.get(
    "/api/repos/{owner}/{repo}/branches/{branch}",
    tags=["branches"],
    summary="Get branch details",
)
async def get_branch(
    owner: str,
    repo: str,
    branch: str,
    branches_client: BranchesClientDep,
) -> dict[str, Any]:
    """Get details for a specific branch, including protection status."""
    logger.info("GET /api/repos/%s/%s/branches/%s", owner, repo, branch)
    return await branches_client.get(owner, repo, branch)


# ---------------------------------------------------------------------------
# Tag routes
# ---------------------------------------------------------------------------

@app.get(
    "/api/repos/{owner}/{repo}/tags",
    tags=["tags"],
    summary="List tags",
)
async def list_tags(
    owner: str,
    repo: str,
    tags_client: TagsClientDep,
    per_page: Annotated[int, Query(ge=1, le=100)] = 30,
    page: Annotated[int, Query(ge=1)] = 1,
) -> dict[str, Any]:
    """List tags for a repository with pagination."""
    logger.info("GET /api/repos/%s/%s/tags (page=%d)", owner, repo, page)
    return await tags_client.list_tags(
        owner,
        repo,
        params={"per_page": per_page, "page": page},
    )


@app.get(
    "/api/repos/{owner}/{repo}/releases/latest",
    tags=["tags"],
    summary="Get latest release",
)
async def get_latest_release(
    owner: str,
    repo: str,
    tags_client: TagsClientDep,
) -> dict[str, Any]:
    """Get the latest published release for a repository."""
    logger.info("GET /api/repos/%s/%s/releases/latest", owner, repo)
    return await tags_client.get_latest_release(owner, repo)


# ===========================================================================
# Entrypoint
# ===========================================================================

if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", "3100"))
    logger.info("Starting server on port %d", port)
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
    )
