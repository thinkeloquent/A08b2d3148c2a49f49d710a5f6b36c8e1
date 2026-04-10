"""
Router Registration — Figma API SDK

Creates and configures the APIRouter with all route modules.
"""

from fastapi import APIRouter

from . import (
    comments,
    components,
    dev_resources,
    files,
    health,
    library_analytics,
    projects,
    variables,
    webhooks,
)


def create_router() -> APIRouter:
    """Create the main router with all sub-routes registered."""
    root = APIRouter()

    # Health (no prefix)
    root.include_router(health.router, tags=["health"])

    # v1 API routes
    v1 = APIRouter(prefix="/v1")
    v1.include_router(projects.router, tags=["projects"])
    v1.include_router(files.router, tags=["files"])
    v1.include_router(comments.router, tags=["comments"])
    v1.include_router(components.router, tags=["components"])
    v1.include_router(variables.router, tags=["variables"])
    v1.include_router(dev_resources.router, tags=["dev-resources"])
    v1.include_router(library_analytics.router, tags=["library-analytics"])
    root.include_router(v1)

    # v2 API routes (webhooks)
    v2 = APIRouter(prefix="/v2")
    v2.include_router(webhooks.router, tags=["webhooks"])
    root.include_router(v2)

    return root
