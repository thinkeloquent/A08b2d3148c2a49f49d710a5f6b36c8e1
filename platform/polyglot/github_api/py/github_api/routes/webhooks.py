"""
Webhook routes for the FastAPI server.

Maps HTTP endpoints to WebhooksClient methods.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Request

__all__ = ["router"]

router = APIRouter(tags=["webhooks"])


def _get_webhooks_client(request: Request):
    """Get the WebhooksClient from app state."""
    from github_api.sdk.webhooks import WebhooksClient
    return WebhooksClient(request.app.state.github_client)


@router.get("/repos/{owner}/{repo}/hooks")
async def list_webhooks(request: Request, owner: str, repo: str) -> dict[str, Any]:
    """List repository webhooks."""
    client = _get_webhooks_client(request)
    params = dict(request.query_params)
    return await client.list(owner, repo, params=params or None)


@router.get("/repos/{owner}/{repo}/hooks/{hook_id}")
async def get_webhook(
    request: Request, owner: str, repo: str, hook_id: int
) -> dict[str, Any]:
    """Get a specific webhook."""
    client = _get_webhooks_client(request)
    return await client.get(owner, repo, hook_id)


@router.post("/repos/{owner}/{repo}/hooks")
async def create_webhook(request: Request, owner: str, repo: str) -> dict[str, Any]:
    """Create a repository webhook."""
    client = _get_webhooks_client(request)
    body = await request.json()
    return await client.create(owner, repo, body)


@router.patch("/repos/{owner}/{repo}/hooks/{hook_id}")
async def update_webhook(
    request: Request, owner: str, repo: str, hook_id: int
) -> dict[str, Any]:
    """Update a repository webhook."""
    client = _get_webhooks_client(request)
    body = await request.json()
    return await client.update(owner, repo, hook_id, body)


@router.delete("/repos/{owner}/{repo}/hooks/{hook_id}")
async def delete_webhook(
    request: Request, owner: str, repo: str, hook_id: int
) -> dict[str, Any]:
    """Delete a repository webhook."""
    client = _get_webhooks_client(request)
    return await client.delete(owner, repo, hook_id)


@router.post("/repos/{owner}/{repo}/hooks/{hook_id}/tests")
async def test_webhook(
    request: Request, owner: str, repo: str, hook_id: int
) -> dict[str, Any]:
    """Trigger a test delivery for a webhook."""
    client = _get_webhooks_client(request)
    return await client.test(owner, repo, hook_id)


@router.post("/repos/{owner}/{repo}/hooks/{hook_id}/pings")
async def ping_webhook(
    request: Request, owner: str, repo: str, hook_id: int
) -> dict[str, Any]:
    """Ping a repository webhook."""
    client = _get_webhooks_client(request)
    return await client.ping(owner, repo, hook_id)
