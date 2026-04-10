"""
Branch routes for the FastAPI server.

Maps HTTP endpoints to BranchesClient methods.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Request

__all__ = ["router"]

router = APIRouter(tags=["branches"])


def _get_branches_client(request: Request):
    """Get the BranchesClient from app state."""
    from github_api.sdk.branches import BranchesClient
    return BranchesClient(request.app.state.github_client)


@router.get("/repos/{owner}/{repo}/branches")
async def list_branches(request: Request, owner: str, repo: str) -> dict[str, Any]:
    """List branches for a repository."""
    client = _get_branches_client(request)
    params = dict(request.query_params)
    return await client.list(owner, repo, params=params or None)


@router.get("/repos/{owner}/{repo}/branches/{branch}")
async def get_branch(
    request: Request, owner: str, repo: str, branch: str
) -> dict[str, Any]:
    """Get a specific branch."""
    client = _get_branches_client(request)
    return await client.get(owner, repo, branch)


@router.get("/repos/{owner}/{repo}/branches/{branch}/protection")
async def get_branch_protection(
    request: Request, owner: str, repo: str, branch: str
) -> dict[str, Any]:
    """Get branch protection rules."""
    client = _get_branches_client(request)
    return await client.get_protection(owner, repo, branch)


@router.put("/repos/{owner}/{repo}/branches/{branch}/protection")
async def update_branch_protection(
    request: Request, owner: str, repo: str, branch: str
) -> dict[str, Any]:
    """Update branch protection rules."""
    client = _get_branches_client(request)
    body = await request.json()
    return await client.update_protection(owner, repo, branch, body)


@router.delete("/repos/{owner}/{repo}/branches/{branch}/protection")
async def remove_branch_protection(
    request: Request, owner: str, repo: str, branch: str
) -> dict[str, Any]:
    """Remove branch protection."""
    client = _get_branches_client(request)
    return await client.remove_protection(owner, repo, branch)


@router.post("/repos/{owner}/{repo}/branches/{branch}/rename")
async def rename_branch(
    request: Request, owner: str, repo: str, branch: str
) -> dict[str, Any]:
    """Rename a branch."""
    client = _get_branches_client(request)
    body = await request.json()
    return await client.rename(owner, repo, branch, body["new_name"])


@router.post("/repos/{owner}/{repo}/merges")
async def merge_branches(request: Request, owner: str, repo: str) -> dict[str, Any]:
    """Perform a branch merge."""
    client = _get_branches_client(request)
    body = await request.json()
    return await client.merge(owner, repo, body)


@router.get("/repos/{owner}/{repo}/compare/{base_head}")
async def compare_branches(
    request: Request, owner: str, repo: str, base_head: str
) -> dict[str, Any]:
    """Compare two branches/commits/tags.

    The base_head parameter should be in the format 'base...head'.
    """
    client = _get_branches_client(request)
    parts = base_head.split("...", 1)
    if len(parts) != 2:
        from github_api.sdk.errors import ValidationError
        raise ValidationError(
            f"Invalid comparison format: {base_head!r}. Expected 'base...head'."
        )
    return await client.compare(owner, repo, parts[0], parts[1])
