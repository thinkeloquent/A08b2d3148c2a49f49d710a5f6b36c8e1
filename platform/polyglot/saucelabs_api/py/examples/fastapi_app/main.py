"""
FastAPI Integration Example — Sauce Labs API SDK (Python)

Minimal FastAPI server demonstrating how to integrate the saucelabs_api SDK
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


# =============================================================================
# Configuration
# =============================================================================

def get_config() -> dict:
    """
    Build configuration from environment variables.
    Falls back to sensible defaults for local development.
    """
    return {
        "username": os.environ.get("SAUCE_USERNAME", ""),
        "api_key": os.environ.get("SAUCE_ACCESS_KEY", ""),
        "region": os.environ.get("SAUCE_REGION", "us-west-1"),
        "port": int(os.environ.get("PORT", "3000")),
        "host": os.environ.get("HOST", "0.0.0.0"),
        "timeout": float(os.environ.get("SAUCE_TIMEOUT", "30")),
    }


# =============================================================================
# Lifespan — Initialize and teardown SDK clients
# =============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    Creates a SaucelabsClient with all domain modules on startup,
    stores them on app.state, and closes the client on shutdown.
    """
    config = get_config()

    client = create_saucelabs_client(
        username=config["username"],
        api_key=config["api_key"],
        region=config["region"],
        timeout=config["timeout"],
        rate_limit_auto_wait=True,
    )

    # Store on app.state (matches the lifecycle plugin pattern)
    app.state.saucelabs = client
    app.state.saucelabs_clients = {
        "jobs": client.jobs,
        "platform": client.platform,
        "users": client.users,
        "upload": client.upload,
    }

    yield

    # Shutdown: close the HTTP clients
    await client.close()


# =============================================================================
# App Creation
# =============================================================================

app = FastAPI(
    title="Sauce Labs API Example",
    description="Minimal FastAPI server demonstrating saucelabs_api SDK integration",
    version="1.0.0",
    lifespan=lifespan,
)


# =============================================================================
# Dependencies — Extract clients from app.state via Depends()
# =============================================================================

def get_saucelabs_client(request: Request) -> SaucelabsClient:
    """Dependency: retrieve the core SaucelabsClient from app.state."""
    return request.app.state.saucelabs


def get_jobs_client(request: Request) -> JobsModule:
    """Dependency: retrieve the JobsModule from app.state."""
    return request.app.state.saucelabs_clients["jobs"]


def get_platform_client(request: Request) -> PlatformModule:
    """Dependency: retrieve the PlatformModule from app.state."""
    return request.app.state.saucelabs_clients["platform"]


def get_users_client(request: Request) -> UsersModule:
    """Dependency: retrieve the UsersModule from app.state."""
    return request.app.state.saucelabs_clients["users"]


# Type aliases for cleaner route signatures
SaucelabsClientDep = Annotated[SaucelabsClient, Depends(get_saucelabs_client)]
JobsDep = Annotated[JobsModule, Depends(get_jobs_client)]
PlatformDep = Annotated[PlatformModule, Depends(get_platform_client)]
UsersDep = Annotated[UsersModule, Depends(get_users_client)]


# =============================================================================
# Error handler
# =============================================================================

@app.exception_handler(SaucelabsError)
async def saucelabs_error_handler(_request: Request, exc: SaucelabsError):
    """Map SDK errors to structured JSON responses."""
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


# =============================================================================
# Routes
# =============================================================================

@app.get("/health")
async def health_check() -> dict:
    """Health check endpoint. Returns service status and current timestamp."""
    return {
        "status": "ok",
        "service": "saucelabs-api-example",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/demo/jobs")
async def list_jobs(jobs: JobsDep, limit: int = 10, skip: int = 0) -> dict:
    """List recent test jobs."""
    try:
        result = await jobs.list(params={"limit": limit, "skip": skip})
        return {"success": True, "data": result}
    except SaucelabsError as err:
        return JSONResponse(
            status_code=err.status_code or 500,
            content={"success": False, "error": str(err)},
        )


@app.get("/demo/jobs/{job_id}")
async def get_job(job_id: str, jobs: JobsDep) -> dict:
    """Get a specific job by ID."""
    try:
        result = await jobs.get(job_id)
        return {"success": True, "data": result}
    except SaucelabsNotFoundError:
        return JSONResponse(
            status_code=404,
            content={"success": False, "error": f"Job {job_id} not found"},
        )
    except SaucelabsError as err:
        return JSONResponse(
            status_code=err.status_code or 500,
            content={"success": False, "error": str(err)},
        )


@app.get("/demo/platform/status")
async def get_platform_status(platform: PlatformDep) -> dict:
    """Get Sauce Labs service status (public, no auth required)."""
    try:
        result = await platform.get_status()
        return {"success": True, "data": result}
    except SaucelabsError as err:
        return JSONResponse(
            status_code=err.status_code or 500,
            content={"success": False, "error": str(err)},
        )


@app.get("/demo/platform/{automation_api}")
async def get_platforms(automation_api: str, platform: PlatformDep) -> dict:
    """Get supported platforms filtered by automation API."""
    try:
        result = await platform.get_platforms(automation_api)
        return {"success": True, "data": result}
    except SaucelabsValidationError as err:
        return JSONResponse(
            status_code=400,
            content={"success": False, "error": str(err)},
        )
    except SaucelabsError as err:
        return JSONResponse(
            status_code=err.status_code or 500,
            content={"success": False, "error": str(err)},
        )


@app.get("/demo/users/{username}")
async def get_user(username: str, users: UsersDep) -> dict:
    """Get user account information."""
    try:
        result = await users.get_user(username)
        return {"success": True, "data": result}
    except SaucelabsError as err:
        return JSONResponse(
            status_code=err.status_code or 500,
            content={"success": False, "error": str(err)},
        )


@app.get("/demo/users/{username}/concurrency")
async def get_concurrency(username: str, users: UsersDep) -> dict:
    """Get concurrency and usage statistics."""
    try:
        result = await users.get_concurrency(username)
        return {"success": True, "data": result}
    except SaucelabsError as err:
        return JSONResponse(
            status_code=err.status_code or 500,
            content={"success": False, "error": str(err)},
        )


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
