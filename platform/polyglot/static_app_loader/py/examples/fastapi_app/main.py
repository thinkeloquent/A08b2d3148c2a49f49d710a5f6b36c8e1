#!/usr/bin/env python3
"""
=============================================================================
Static App Loader - FastAPI Server Example
=============================================================================

A minimal FastAPI server demonstrating static-app-loader integration.

Run: uvicorn main:app --reload
Visit: http://localhost:8000/dashboard
"""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI

from static_app_loader import (
    MultiAppOptions,
    StaticLoaderOptions,
    logger,
    register_multiple_apps,
    reset_registered_prefixes,
)

# Path to public directory
PUBLIC_PATH = Path(__file__).parent / "public"

# Create logger
log = logger.create("fastapi-example", "main.py")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan handler for startup/shutdown."""
    log.info("Starting FastAPI server")

    # Reset any previous registrations (for reload support)
    reset_registered_prefixes()

    # Register static apps
    options = MultiAppOptions(
        apps=[
            StaticLoaderOptions(
                app_name="dashboard",
                root_path=str(PUBLIC_PATH),
                spa_mode=True,
                url_prefix="/assets",
                default_context={
                    "app_name": "Dashboard",
                    "version": "1.0.0",
                    "api_base": "/api",
                },
            ),
            StaticLoaderOptions(
                app_name="admin",
                root_path=str(PUBLIC_PATH),
                spa_mode=True,
                url_prefix="/assets",
                default_context={
                    "app_name": "Admin Panel",
                    "version": "1.0.0",
                    "api_base": "/api",
                },
            ),
        ],
        collision_strategy="warn",
        logger=log,
    )

    results = register_multiple_apps(app, options)

    # Log registration results
    for r in results:
        if r.success:
            log.info(f"Registered app: {r.app_name} at {r.route_prefix}")
        else:
            log.error(f"Failed to register app: {r.app_name}", {"error": r.error})

    log.info("Server ready")
    log.info("Available routes:")
    log.info("  GET /health - Health check")
    log.info("  GET /api/user - API endpoint")
    log.info("  GET /dashboard/* - Dashboard SPA")
    log.info("  GET /admin/* - Admin SPA")

    yield

    log.info("Shutting down FastAPI server")


# Create FastAPI app
app = FastAPI(
    title="Static App Loader Demo",
    description="Demonstration of static-app-loader package with FastAPI",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/health")
async def health_check() -> dict:
    """Health check endpoint."""
    from datetime import datetime

    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
    }


@app.get("/api/user")
async def get_user() -> dict:
    """Demo API endpoint."""
    return {
        "id": 1,
        "name": "Demo User",
        "email": "demo@example.com",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
