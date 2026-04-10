"""
Collaborator routes for the FastAPI server.

Maps HTTP endpoints to CollaboratorsClient methods.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Request

__all__ = ["router"]

router = APIRouter(tags=["collaborators"])


def _get_collaborators_client(request: Request):
    """Get the CollaboratorsClient from app state."""
    from github_api.sdk.collaborators import CollaboratorsClient
    return CollaboratorsClient(request.app.state.github_client)


@router.get("/repos/{owner}/{repo}/collaborators")
async def list_collaborators(
    request: Request, owner: str, repo: str
) -> dict[str, Any]:
    """List repository collaborators."""
    client = _get_collaborators_client(request)
    params = dict(request.query_params)
    return await client.list(owner, repo, params=params or None)


@router.put("/repos/{owner}/{repo}/collaborators/{username}")
async def add_collaborator(
    request: Request, owner: str, repo: str, username: str
) -> dict[str, Any]:
    """Add a collaborator to a repository."""
    client = _get_collaborators_client(request)
    try:
        body = await request.json()
    except Exception:
        body = {}
    permission = body.get("permission", "push")
    return await client.add(owner, repo, username, permission=permission)


@router.delete("/repos/{owner}/{repo}/collaborators/{username}")
async def remove_collaborator(
    request: Request, owner: str, repo: str, username: str
) -> dict[str, Any]:
    """Remove a collaborator from a repository."""
    client = _get_collaborators_client(request)
    return await client.remove(owner, repo, username)


@router.get("/repos/{owner}/{repo}/collaborators/{username}/permission")
async def check_permission(
    request: Request, owner: str, repo: str, username: str
) -> dict[str, Any]:
    """Check a user's permission level on a repository."""
    client = _get_collaborators_client(request)
    return await client.check_permission(owner, repo, username)


@router.get("/repos/{owner}/{repo}/invitations")
async def list_invitations(
    request: Request, owner: str, repo: str
) -> dict[str, Any]:
    """List pending collaboration invitations."""
    client = _get_collaborators_client(request)
    params = dict(request.query_params)
    return await client.list_invitations(owner, repo, params=params or None)
