"""
Health check routes.

Provides endpoints for service health and rate limit status.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Request

__all__ = ["router"]

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check() -> dict[str, Any]:
    """Basic health check endpoint.

    Returns:
        Health status with service name and version.
    """
    return {
        "status": "ok",
        "service": "github-api",
        "version": "1.0.0",
    }


@router.get("/health/rate-limit")
async def rate_limit_health(request: Request) -> dict[str, Any]:
    """Health check with current rate limit status.

    Returns:
        Health status including rate limit information from the GitHub API.
    """
    client = request.app.state.github_client
    try:
        rate_limit_data = await client.get_rate_limit()
        return {
            "status": "ok",
            "service": "github-api",
            "version": "1.0.0",
            "rate_limit": rate_limit_data,
        }
    except Exception as exc:
        return {
            "status": "degraded",
            "service": "github-api",
            "version": "1.0.0",
            "error": str(exc),
        }
