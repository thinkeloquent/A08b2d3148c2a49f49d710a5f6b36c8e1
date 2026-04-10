"""
Tags and Releases routes for the FastAPI server.

Maps HTTP endpoints to TagsClient methods.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Request

__all__ = ["router"]

router = APIRouter(tags=["tags"])


def _get_tags_client(request: Request):
    """Get the TagsClient from app state."""
    from github_api.sdk.tags import TagsClient
    return TagsClient(request.app.state.github_client)


@router.get("/repos/{owner}/{repo}/tags")
async def list_tags(request: Request, owner: str, repo: str) -> dict[str, Any]:
    """List repository tags."""
    client = _get_tags_client(request)
    params = dict(request.query_params)
    return await client.list_tags(owner, repo, params=params or None)


@router.get("/repos/{owner}/{repo}/releases")
async def list_releases(request: Request, owner: str, repo: str) -> dict[str, Any]:
    """List repository releases."""
    client = _get_tags_client(request)
    params = dict(request.query_params)
    return await client.list_releases(owner, repo, params=params or None)


@router.post("/repos/{owner}/{repo}/releases")
async def create_release(request: Request, owner: str, repo: str) -> dict[str, Any]:
    """Create a new release."""
    client = _get_tags_client(request)
    body = await request.json()
    return await client.create_release(owner, repo, body)


@router.get("/repos/{owner}/{repo}/releases/latest")
async def get_latest_release(request: Request, owner: str, repo: str) -> dict[str, Any]:
    """Get the latest published release."""
    client = _get_tags_client(request)
    return await client.get_latest_release(owner, repo)


@router.get("/repos/{owner}/{repo}/releases/tags/{tag}")
async def get_release_by_tag(
    request: Request, owner: str, repo: str, tag: str
) -> dict[str, Any]:
    """Get a release by its tag name."""
    client = _get_tags_client(request)
    return await client.get_release_by_tag(owner, repo, tag)


@router.get("/repos/{owner}/{repo}/releases/{release_id}")
async def get_release(
    request: Request, owner: str, repo: str, release_id: int
) -> dict[str, Any]:
    """Get a release by ID."""
    client = _get_tags_client(request)
    return await client.get_release(owner, repo, release_id)


@router.patch("/repos/{owner}/{repo}/releases/{release_id}")
async def update_release(
    request: Request, owner: str, repo: str, release_id: int
) -> dict[str, Any]:
    """Update an existing release."""
    client = _get_tags_client(request)
    body = await request.json()
    return await client.update_release(owner, repo, release_id, body)


@router.delete("/repos/{owner}/{repo}/releases/{release_id}")
async def delete_release(
    request: Request, owner: str, repo: str, release_id: int
) -> dict[str, Any]:
    """Delete a release."""
    client = _get_tags_client(request)
    return await client.delete_release(owner, repo, release_id)
