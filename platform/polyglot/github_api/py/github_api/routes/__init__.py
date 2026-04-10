"""
Route registration for the GitHub API FastAPI server.

Exports `create_router()` which assembles all sub-routers
under the /api/github prefix.
"""

from __future__ import annotations

from fastapi import APIRouter

from github_api.routes.actions import router as actions_router
from github_api.routes.branches import router as branches_router
from github_api.routes.collaborators import router as collaborators_router
from github_api.routes.health import router as health_router
from github_api.routes.repos import router as repos_router
from github_api.routes.security import router as security_router
from github_api.routes.tags import router as tags_router
from github_api.routes.webhooks import router as webhooks_router

__all__ = ["create_router"]


def create_router() -> APIRouter:
    """Create and assemble the top-level API router.

    All domain routers are included under a shared /api/github prefix.

    Returns:
        The assembled APIRouter.
    """
    api_router = APIRouter(prefix="/api/github")

    api_router.include_router(health_router)
    api_router.include_router(repos_router)
    api_router.include_router(branches_router)
    api_router.include_router(collaborators_router)
    api_router.include_router(tags_router)
    api_router.include_router(webhooks_router)
    api_router.include_router(security_router)
    api_router.include_router(actions_router)

    return api_router
