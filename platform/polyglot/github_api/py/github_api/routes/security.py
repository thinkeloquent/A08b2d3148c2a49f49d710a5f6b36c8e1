"""
Security routes for the FastAPI server.

Maps HTTP endpoints to SecurityClient methods for vulnerability alerts
and repository rulesets.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Request

__all__ = ["router"]

router = APIRouter(tags=["security"])


def _get_security_client(request: Request):
    """Get the SecurityClient from app state."""
    from github_api.sdk.security import SecurityClient
    return SecurityClient(request.app.state.github_client)


@router.get("/repos/{owner}/{repo}/vulnerability-alerts")
async def get_vulnerability_alerts(
    request: Request, owner: str, repo: str
) -> dict[str, Any]:
    """Check if vulnerability alerts are enabled."""
    client = _get_security_client(request)
    return await client.get_vulnerability_alerts(owner, repo)


@router.put("/repos/{owner}/{repo}/vulnerability-alerts")
async def enable_vulnerability_alerts(
    request: Request, owner: str, repo: str
) -> dict[str, Any]:
    """Enable vulnerability alerts for a repository."""
    client = _get_security_client(request)
    return await client.enable_vulnerability_alerts(owner, repo)


@router.delete("/repos/{owner}/{repo}/vulnerability-alerts")
async def disable_vulnerability_alerts(
    request: Request, owner: str, repo: str
) -> dict[str, Any]:
    """Disable vulnerability alerts for a repository."""
    client = _get_security_client(request)
    return await client.disable_vulnerability_alerts(owner, repo)


@router.get("/repos/{owner}/{repo}/rulesets")
async def list_rulesets(request: Request, owner: str, repo: str) -> dict[str, Any]:
    """List repository rulesets."""
    client = _get_security_client(request)
    params = dict(request.query_params)
    return await client.list_rulesets(owner, repo, params=params or None)


@router.get("/repos/{owner}/{repo}/rulesets/{ruleset_id}")
async def get_ruleset(
    request: Request, owner: str, repo: str, ruleset_id: int
) -> dict[str, Any]:
    """Get a specific repository ruleset."""
    client = _get_security_client(request)
    return await client.get_ruleset(owner, repo, ruleset_id)


@router.post("/repos/{owner}/{repo}/rulesets")
async def create_ruleset(request: Request, owner: str, repo: str) -> dict[str, Any]:
    """Create a repository ruleset."""
    client = _get_security_client(request)
    body = await request.json()
    return await client.create_ruleset(owner, repo, body)


@router.put("/repos/{owner}/{repo}/rulesets/{ruleset_id}")
async def update_ruleset(
    request: Request, owner: str, repo: str, ruleset_id: int
) -> dict[str, Any]:
    """Update a repository ruleset."""
    client = _get_security_client(request)
    body = await request.json()
    return await client.update_ruleset(owner, repo, ruleset_id, body)


@router.delete("/repos/{owner}/{repo}/rulesets/{ruleset_id}")
async def delete_ruleset(
    request: Request, owner: str, repo: str, ruleset_id: int
) -> dict[str, Any]:
    """Delete a repository ruleset."""
    client = _get_security_client(request)
    return await client.delete_ruleset(owner, repo, ruleset_id)
