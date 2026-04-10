"""
FastAPI Integration Example — Figma API SDK (Python)

Minimal FastAPI server demonstrating how to integrate the figma_api SDK
into a custom application with dependency injection, lifespan management,
and structured error handling.

Usage:
    uvicorn fastapi_app.main:app --reload --port 3000

Prerequisites:
    pip install -e ".[dev]"    (from the py/ directory)
"""

import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Annotated

import uvicorn
from fastapi import Depends, FastAPI, Request
from fastapi.responses import JSONResponse

from figma_api import (
    CommentsClient,
    FigmaClient,
    FigmaError,
    FilesClient,
    ProjectsClient,
)
from figma_api.config import Config

# =============================================================================
# Configuration
# =============================================================================

def get_config() -> Config:
    """
    Build configuration from environment variables.
    Falls back to sensible defaults for local development.
    """
    return Config(
        figma_token=os.environ.get("FIGMA_TOKEN", ""),
        base_url=os.environ.get("FIGMA_API_BASE_URL", "https://api.figma.com"),
        log_level=os.environ.get("LOG_LEVEL", "INFO"),
        port=int(os.environ.get("PORT", "3000")),
        host=os.environ.get("HOST", "0.0.0.0"),
        timeout=int(os.environ.get("FIGMA_TIMEOUT", "30")),
        max_retries=int(os.environ.get("MAX_RETRIES", "3")),
        cache_max_size=int(os.environ.get("CACHE_MAX_SIZE", "100")),
        cache_ttl=int(os.environ.get("CACHE_TTL", "300")),
    )


# =============================================================================
# Lifespan — Initialize and teardown SDK clients
# =============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    Creates a FigmaClient and all domain clients on startup,
    stores them on app.state, and closes the client on shutdown.
    """
    config = get_config()

    # Create the core HTTP client
    client = FigmaClient(
        token=config.figma_token or None,
        base_url=config.base_url,
        rate_limit_auto_wait=config.rate_limit_auto_wait,
        rate_limit_threshold=config.rate_limit_threshold,
        timeout=config.timeout,
        max_retries=config.max_retries,
        cache_max_size=config.cache_max_size,
        cache_ttl=config.cache_ttl,
    )

    # Store clients on app.state (matches the SDK's server.py pattern)
    app.state.figma_client = client
    app.state.files_client = FilesClient(client)
    app.state.projects_client = ProjectsClient(client)
    app.state.comments_client = CommentsClient(client)

    yield

    # Shutdown: close the HTTP client
    await client.close()


# =============================================================================
# App Creation
# =============================================================================

app = FastAPI(
    title="Figma API Example",
    description="Minimal FastAPI server demonstrating figma_api SDK integration",
    version="1.0.0",
    lifespan=lifespan,
)


# =============================================================================
# Dependencies — Extract clients from app.state via Depends()
# =============================================================================

def get_figma_client(request: Request) -> FigmaClient:
    """Dependency: retrieve the core FigmaClient from app.state."""
    return request.app.state.figma_client


def get_files_client(request: Request) -> FilesClient:
    """Dependency: retrieve the FilesClient from app.state."""
    return request.app.state.files_client


def get_projects_client(request: Request) -> ProjectsClient:
    """Dependency: retrieve the ProjectsClient from app.state."""
    return request.app.state.projects_client


def get_comments_client(request: Request) -> CommentsClient:
    """Dependency: retrieve the CommentsClient from app.state."""
    return request.app.state.comments_client


# Type aliases for cleaner route signatures
FigmaClientDep = Annotated[FigmaClient, Depends(get_figma_client)]
FilesClientDep = Annotated[FilesClient, Depends(get_files_client)]
ProjectsClientDep = Annotated[ProjectsClient, Depends(get_projects_client)]
CommentsClientDep = Annotated[CommentsClient, Depends(get_comments_client)]


# =============================================================================
# Routes
# =============================================================================

@app.get("/health")
async def health_check() -> dict:
    """
    Health check endpoint.
    Returns service status and current timestamp.
    """
    return {
        "status": "ok",
        "service": "figma-api-example",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/demo/file/{file_key}")
async def get_file(file_key: str, files: FilesClientDep) -> dict:
    """
    Fetch a Figma file by its key.
    Demonstrates FilesClient integration via dependency injection.
    """
    try:
        result = await files.get_file(file_key)
        return {
            "success": True,
            "data": {
                "name": result.get("name"),
                "version": result.get("version"),
                "lastModified": result.get("lastModified"),
                "thumbnailUrl": result.get("thumbnailUrl"),
            },
        }
    except FigmaError as err:
        return JSONResponse(
            status_code=err.status or 500,
            content={
                "success": False,
                "error": err.to_dict(),
            },
        )


@app.get("/demo/team/{team_id}/projects")
async def get_team_projects(team_id: str, projects: ProjectsClientDep) -> dict:
    """
    List all projects for a team.
    Demonstrates ProjectsClient integration via dependency injection.
    """
    try:
        result = await projects.get_team_projects(team_id)
        return {
            "success": True,
            "data": {
                "projects": result.get("projects", []),
            },
        }
    except FigmaError as err:
        return JSONResponse(
            status_code=err.status or 500,
            content={
                "success": False,
                "error": err.to_dict(),
            },
        )


@app.get("/demo/file/{file_key}/comments")
async def get_file_comments(file_key: str, comments: CommentsClientDep) -> dict:
    """
    List all comments on a Figma file.
    Demonstrates CommentsClient integration via dependency injection.
    """
    try:
        result = await comments.list_comments(file_key, as_md=True)
        return {
            "success": True,
            "data": {
                "comments": result.get("comments", []),
            },
        }
    except FigmaError as err:
        return JSONResponse(
            status_code=err.status or 500,
            content={
                "success": False,
                "error": err.to_dict(),
            },
        )


@app.get("/demo/stats")
async def get_stats(client: FigmaClientDep) -> dict:
    """
    Return SDK client stats and cache statistics.
    Useful for monitoring and debugging.
    """
    stats = client.stats
    return {
        "success": True,
        "data": {
            "requests_made": stats.get("requests_made", 0),
            "requests_failed": stats.get("requests_failed", 0),
            "cache_hits": stats.get("cache_hits", 0),
            "cache_misses": stats.get("cache_misses", 0),
            "rate_limit_waits": stats.get("rate_limit_waits", 0),
            "rate_limit_total_wait_seconds": stats.get("rate_limit_total_wait_seconds", 0.0),
            "cache": {
                "hits": stats.get("cache", {}).hits if hasattr(stats.get("cache", {}), "hits") else 0,
                "misses": stats.get("cache", {}).misses if hasattr(stats.get("cache", {}), "misses") else 0,
                "size": stats.get("cache", {}).size if hasattr(stats.get("cache", {}), "size") else 0,
            },
        },
    }


# =============================================================================
# Entrypoint
# =============================================================================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "3000"))
    uvicorn.run(
        "fastapi_app.main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
    )
