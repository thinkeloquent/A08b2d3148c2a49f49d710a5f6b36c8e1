"""
Repository routes for the FastAPI server.

Maps HTTP endpoints to ReposClient methods with request/response handling.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Request

__all__ = ["router"]

router = APIRouter(tags=["repos"])


def _get_repos_client(request: Request):
    """Get the ReposClient from app state."""
    from github_api.sdk.repos import ReposClient
    return ReposClient(request.app.state.github_client)


# ── Static/specific routes MUST be registered before parametric /{owner}/{repo}
# ── FastAPI matches routes in registration order (unlike Fastify's radix tree
# ── which automatically prioritises static segments over parametric ones).


@router.get("/repos/me")
async def list_my_repos(request: Request) -> dict[str, Any]:
    """List repositories for the authenticated user."""
    client = _get_repos_client(request)
    params = dict(request.query_params)
    return await client.list_for_authenticated_user(params=params or None)


@router.get("/repos/user/{username}")
async def list_user_repos(request: Request, username: str) -> dict[str, Any]:
    """List repositories for a user."""
    client = _get_repos_client(request)
    params = dict(request.query_params)
    return await client.list_for_user(username, params=params or None)


@router.get("/repos/org/{org}")
async def list_org_repos(request: Request, org: str) -> dict[str, Any]:
    """List repositories for an organization."""
    client = _get_repos_client(request)
    params = dict(request.query_params)
    return await client.list_for_org(org, params=params or None)


@router.post("/repos")
async def create_repo(request: Request) -> dict[str, Any]:
    """Create a repository for the authenticated user."""
    client = _get_repos_client(request)
    body = await request.json()
    return await client.create(body)


@router.post("/repos/org/{org}")
async def create_org_repo(request: Request, org: str) -> dict[str, Any]:
    """Create a repository in an organization."""
    client = _get_repos_client(request)
    body = await request.json()
    return await client.create_in_org(org, body)


@router.get("/repos/{owner}/{repo}")
async def get_repository(request: Request, owner: str, repo: str) -> dict[str, Any]:
    """Get a repository by owner and name."""
    client = _get_repos_client(request)
    return await client.get(owner, repo)


@router.patch("/repos/{owner}/{repo}")
async def update_repo(request: Request, owner: str, repo: str) -> dict[str, Any]:
    """Update a repository."""
    client = _get_repos_client(request)
    body = await request.json()
    return await client.update(owner, repo, body)


@router.delete("/repos/{owner}/{repo}")
async def delete_repo(request: Request, owner: str, repo: str) -> dict[str, Any]:
    """Delete a repository."""
    client = _get_repos_client(request)
    return await client.delete(owner, repo)


@router.get("/repos/{owner}/{repo}/topics")
async def get_topics(request: Request, owner: str, repo: str) -> dict[str, Any]:
    """Get repository topics."""
    client = _get_repos_client(request)
    return await client.get_topics(owner, repo)


@router.put("/repos/{owner}/{repo}/topics")
async def replace_topics(request: Request, owner: str, repo: str) -> dict[str, Any]:
    """Replace all repository topics."""
    client = _get_repos_client(request)
    body = await request.json()
    return await client.replace_topics(owner, repo, body.get("names", []))


@router.get("/repos/{owner}/{repo}/languages")
async def get_languages(request: Request, owner: str, repo: str) -> dict[str, Any]:
    """Get repository language breakdown."""
    client = _get_repos_client(request)
    return await client.get_languages(owner, repo)


@router.get("/repos/{owner}/{repo}/contributors")
async def list_contributors(request: Request, owner: str, repo: str) -> dict[str, Any]:
    """List repository contributors."""
    client = _get_repos_client(request)
    params = dict(request.query_params)
    return await client.list_contributors(owner, repo, params=params or None)


@router.post("/repos/{owner}/{repo}/forks")
async def create_fork(request: Request, owner: str, repo: str) -> dict[str, Any]:
    """Create a fork of a repository."""
    client = _get_repos_client(request)
    try:
        body = await request.json()
    except Exception:
        body = None
    return await client.fork(owner, repo, options=body)


@router.get("/repos/{owner}/{repo}/forks")
async def list_forks(request: Request, owner: str, repo: str) -> dict[str, Any]:
    """List forks of a repository."""
    client = _get_repos_client(request)
    params = dict(request.query_params)
    return await client.list_forks(owner, repo, params=params or None)


@router.put("/repos/{owner}/{repo}/subscription")
async def watch_repo(request: Request, owner: str, repo: str) -> dict[str, Any]:
    """Watch (subscribe to) a repository."""
    client = _get_repos_client(request)
    return await client.watch(owner, repo)


@router.delete("/repos/{owner}/{repo}/subscription")
async def unwatch_repo(request: Request, owner: str, repo: str) -> dict[str, Any]:
    """Unwatch (unsubscribe from) a repository."""
    client = _get_repos_client(request)
    return await client.unwatch(owner, repo)


@router.get("/repos/{owner}/{repo}/commits")
async def list_commits(request: Request, owner: str, repo: str):
    """List commits for a repository."""
    client = _get_repos_client(request)
    params = dict(request.query_params)
    return await client.get_commits(owner, repo, params=params or None)


@router.get("/repos/{owner}/{repo}/commits/{ref}")
async def get_commit(request: Request, owner: str, repo: str, ref: str):
    """Get a single commit by ref."""
    client = _get_repos_client(request)
    return await client.get_commit(owner, repo, ref)


@router.get("/repos/{owner}/{repo}/commits/{ref}/pulls")
async def list_commit_pulls(request: Request, owner: str, repo: str, ref: str):
    """List pull requests associated with a commit."""
    client = _get_repos_client(request)
    return await client.list_commit_pulls(owner, repo, ref)


@router.get("/repos/{owner}/{repo}/contents")
async def get_root_contents(request: Request, owner: str, repo: str):
    """Get repository root contents."""
    client = _get_repos_client(request)
    params = dict(request.query_params)
    return await client.get_contents(owner, repo, "", params=params or None)


@router.get("/repos/{owner}/{repo}/contents/{path:path}")
async def get_contents_at_path(request: Request, owner: str, repo: str, path: str):
    """Get repository contents at a specific path."""
    client = _get_repos_client(request)
    params = dict(request.query_params)
    return await client.get_contents(owner, repo, path, params=params or None)


@router.get("/repos/{owner}/{repo}/git/trees/{tree_sha}")
async def get_git_tree(request: Request, owner: str, repo: str, tree_sha: str):
    """Get a git tree by SHA or branch name."""
    client = _get_repos_client(request)
    params = dict(request.query_params)
    return await client.get_git_tree(owner, repo, tree_sha, params=params or None)
