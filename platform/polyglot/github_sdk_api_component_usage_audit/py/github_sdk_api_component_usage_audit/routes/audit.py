"""
FastAPI Router Factory — Component Usage Audit

Closure-based DI: the GitHubClient is injected via the factory function,
not imported at module level.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from github_sdk_api_component_usage_audit.config import Config
from github_sdk_api_component_usage_audit.services.component_audit import ComponentUsageAudit


class AuditRequest(BaseModel):
    """Request body for the audit endpoint."""

    component_name: str = Field(..., min_length=1, description="React component name")
    min_stars: int = Field(default=500, ge=0, description="Minimum stargazers")
    max_pages: int = Field(default=10, ge=1, le=10, description="Max search pages")
    min_file_size: int = Field(default=1000, ge=0, description="Min file size bytes")


def create_router(github_client: Any) -> APIRouter:
    """Build and return an APIRouter with the audit endpoint.

    Args:
        github_client: Authenticated GitHubClient instance from app.state.

    Returns:
        Configured APIRouter.
    """
    router = APIRouter()

    @router.post("/audit")
    async def run_audit(req: AuditRequest) -> dict[str, Any]:
        """Run a component usage audit.

        Searches GitHub for real-world usage of the specified React component,
        validates repositories, fetches file contents, and extracts JSX patterns.
        """
        config = Config(
            component_name=req.component_name,
            token=github_client._token,
            min_stars=req.min_stars,
            max_pages=req.max_pages,
            min_file_size=req.min_file_size,
        )

        audit = ComponentUsageAudit(config)

        try:
            report = await audit.run(github_client)
        except Exception as err:
            raise HTTPException(status_code=502, detail=f"Audit failed: {err}") from err

        return report

    return router
