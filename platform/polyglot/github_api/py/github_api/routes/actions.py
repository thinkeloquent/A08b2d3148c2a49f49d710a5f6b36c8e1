"""
Actions routes for the FastAPI server.

Maps HTTP endpoints to ActionsClient methods.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Request

__all__ = ["router"]

router = APIRouter(tags=["actions"])


def _get_actions_client(request: Request):
    """Get the ActionsClient from app state."""
    from github_api.sdk.actions import ActionsClient
    return ActionsClient(request.app.state.github_client)


# ── Workflows ─────────────────────────────────────────────────────────

@router.get("/repos/{owner}/{repo}/actions/workflows")
async def list_workflows(
    request: Request, owner: str, repo: str
) -> dict[str, Any]:
    """List workflows for a repository."""
    client = _get_actions_client(request)
    params = dict(request.query_params)
    return await client.list_workflows(owner, repo, params=params or None)


@router.get("/repos/{owner}/{repo}/actions/workflows/{workflow_id}")
async def get_workflow(
    request: Request, owner: str, repo: str, workflow_id: str
) -> dict[str, Any]:
    """Get a specific workflow."""
    client = _get_actions_client(request)
    return await client.get_workflow(owner, repo, workflow_id)


@router.get("/repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs")
async def list_workflow_runs_for_workflow(
    request: Request, owner: str, repo: str, workflow_id: str
) -> dict[str, Any]:
    """List runs for a specific workflow."""
    client = _get_actions_client(request)
    params = dict(request.query_params)
    return await client.list_workflow_runs_for_workflow(
        owner, repo, workflow_id, params=params or None
    )


# ── Workflow Runs ─────────────────────────────────────────────────────

@router.get("/repos/{owner}/{repo}/actions/runs")
async def list_workflow_runs(
    request: Request, owner: str, repo: str
) -> dict[str, Any]:
    """List workflow runs for a repository."""
    client = _get_actions_client(request)
    params = dict(request.query_params)
    return await client.list_workflow_runs(owner, repo, params=params or None)


@router.get("/repos/{owner}/{repo}/actions/runs/{run_id}")
async def get_workflow_run(
    request: Request, owner: str, repo: str, run_id: int
) -> dict[str, Any]:
    """Get a specific workflow run."""
    client = _get_actions_client(request)
    return await client.get_workflow_run(owner, repo, run_id)


@router.post("/repos/{owner}/{repo}/actions/runs/{run_id}/cancel")
async def cancel_workflow_run(
    request: Request, owner: str, repo: str, run_id: int
) -> dict[str, Any]:
    """Cancel a workflow run."""
    client = _get_actions_client(request)
    return await client.cancel_workflow_run(owner, repo, run_id)


@router.post("/repos/{owner}/{repo}/actions/runs/{run_id}/rerun")
async def rerun_workflow(
    request: Request, owner: str, repo: str, run_id: int
) -> dict[str, Any]:
    """Re-run a workflow."""
    client = _get_actions_client(request)
    return await client.rerun_workflow(owner, repo, run_id)


@router.post("/repos/{owner}/{repo}/actions/runs/{run_id}/rerun-failed-jobs")
async def rerun_failed_jobs(
    request: Request, owner: str, repo: str, run_id: int
) -> dict[str, Any]:
    """Re-run only the failed jobs in a workflow run."""
    client = _get_actions_client(request)
    return await client.rerun_failed_jobs(owner, repo, run_id)


# ── Jobs ──────────────────────────────────────────────────────────────

@router.get("/repos/{owner}/{repo}/actions/runs/{run_id}/jobs")
async def list_jobs_for_workflow_run(
    request: Request, owner: str, repo: str, run_id: int
) -> dict[str, Any]:
    """List jobs for a workflow run."""
    client = _get_actions_client(request)
    params = dict(request.query_params)
    return await client.list_jobs_for_workflow_run(
        owner, repo, run_id, params=params or None
    )


@router.get("/repos/{owner}/{repo}/actions/jobs/{job_id}")
async def get_job(
    request: Request, owner: str, repo: str, job_id: int
) -> dict[str, Any]:
    """Get a specific job."""
    client = _get_actions_client(request)
    return await client.get_job(owner, repo, job_id)


# ── Artifacts ─────────────────────────────────────────────────────────

@router.get("/repos/{owner}/{repo}/actions/artifacts")
async def list_artifacts(
    request: Request, owner: str, repo: str
) -> dict[str, Any]:
    """List artifacts for a repository."""
    client = _get_actions_client(request)
    params = dict(request.query_params)
    return await client.list_artifacts(owner, repo, params=params or None)


@router.get("/repos/{owner}/{repo}/actions/runs/{run_id}/artifacts")
async def list_workflow_run_artifacts(
    request: Request, owner: str, repo: str, run_id: int
) -> dict[str, Any]:
    """List artifacts for a specific workflow run."""
    client = _get_actions_client(request)
    params = dict(request.query_params)
    return await client.list_workflow_run_artifacts(
        owner, repo, run_id, params=params or None
    )


@router.get("/repos/{owner}/{repo}/actions/artifacts/{artifact_id}")
async def get_artifact(
    request: Request, owner: str, repo: str, artifact_id: int
) -> dict[str, Any]:
    """Get a specific artifact."""
    client = _get_actions_client(request)
    return await client.get_artifact(owner, repo, artifact_id)


@router.delete("/repos/{owner}/{repo}/actions/artifacts/{artifact_id}")
async def delete_artifact(
    request: Request, owner: str, repo: str, artifact_id: int
) -> dict[str, Any]:
    """Delete an artifact."""
    client = _get_actions_client(request)
    return await client.delete_artifact(owner, repo, artifact_id)


# ── Downloads ────────────────────────────────────────────────────────

@router.get("/repos/{owner}/{repo}/actions/artifacts/{artifact_id}/zip")
async def download_artifact(
    request: Request, owner: str, repo: str, artifact_id: int
):
    """Download artifact ZIP through proxy."""
    from starlette.responses import StreamingResponse

    client = _get_actions_client(request)
    response = await client.download_artifact(owner, repo, artifact_id)
    return StreamingResponse(
        response.aiter_bytes() if hasattr(response, "aiter_bytes") else response,
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="artifact-{artifact_id}.zip"'
        },
    )


@router.get("/repos/{owner}/{repo}/actions/runs/{run_id}/logs")
async def download_run_logs(
    request: Request, owner: str, repo: str, run_id: int
):
    """Download workflow run logs ZIP through proxy."""
    from starlette.responses import StreamingResponse

    client = _get_actions_client(request)
    response = await client.download_run_logs(owner, repo, run_id)
    return StreamingResponse(
        response.aiter_bytes() if hasattr(response, "aiter_bytes") else response,
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="run-{run_id}-logs.zip"'
        },
    )


@router.get("/repos/{owner}/{repo}/actions/jobs/{job_id}/logs")
async def download_job_logs(
    request: Request, owner: str, repo: str, job_id: int
):
    """Download job logs (plain text) through proxy."""
    from starlette.responses import StreamingResponse

    client = _get_actions_client(request)
    response = await client.download_job_logs(owner, repo, job_id)
    return StreamingResponse(
        response.aiter_bytes() if hasattr(response, "aiter_bytes") else response,
        media_type="text/plain; charset=utf-8",
    )


# ── Workflow Dispatch ────────────────────────────────────────────────

@router.post("/repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches")
async def dispatch_workflow(
    request: Request, owner: str, repo: str, workflow_id: str
) -> dict[str, Any]:
    """Dispatch a workflow run."""
    client = _get_actions_client(request)
    body = await request.json()
    ref = body.get("ref", "")
    inputs = body.get("inputs", {})
    return await client.dispatch_workflow(owner, repo, workflow_id, ref, inputs)
