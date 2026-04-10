"""
Actions domain client for the GitHub API.

Provides methods for managing GitHub Actions workflow runs, jobs,
artifacts, and workflows.
"""

from __future__ import annotations

import logging
from typing import Any, TYPE_CHECKING

from github_api.sdk.validation import validate_repository_name, validate_username

if TYPE_CHECKING:
    from github_api.sdk.client import GitHubClient

__all__ = ["ActionsClient"]


class ActionsClient:
    """Client for GitHub Actions API operations."""

    def __init__(self, client: GitHubClient) -> None:
        """Initialize with a GitHubClient instance.

        Args:
            client: The base HTTP client.
        """
        self._client = client
        self._logger = logging.getLogger("github_api.sdk.actions")

    def _repo_path(self, owner: str, repo: str) -> str:
        """Build the base repo path with validation."""
        validate_username(owner)
        validate_repository_name(repo)
        return f"/repos/{owner}/{repo}"

    # ── Workflow Runs ─────────────────────────────────────────────────

    async def list_workflow_runs(
        self,
        owner: str,
        repo: str,
        *,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """List workflow runs for a repository.

        Args:
            owner: Repository owner.
            repo: Repository name.
            params: Optional query parameters (actor, branch, event, status, per_page, page).

        Returns:
            Paginated list of workflow runs.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Listing workflow runs for %s/%s", owner, repo)
        return await self._client.get(f"{base}/actions/runs", params=params)

    async def get_workflow_run(
        self, owner: str, repo: str, run_id: int
    ) -> dict[str, Any]:
        """Get a specific workflow run.

        Args:
            owner: Repository owner.
            repo: Repository name.
            run_id: The workflow run ID.

        Returns:
            Workflow run data.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Getting workflow run %d in %s/%s", run_id, owner, repo)
        return await self._client.get(f"{base}/actions/runs/{run_id}")

    async def cancel_workflow_run(
        self, owner: str, repo: str, run_id: int
    ) -> dict[str, Any]:
        """Cancel a workflow run.

        Args:
            owner: Repository owner.
            repo: Repository name.
            run_id: The workflow run ID.

        Returns:
            Empty dict on success (202).
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Cancelling workflow run %d in %s/%s", run_id, owner, repo)
        return await self._client.post(f"{base}/actions/runs/{run_id}/cancel")

    async def rerun_workflow(
        self, owner: str, repo: str, run_id: int
    ) -> dict[str, Any]:
        """Re-run a workflow.

        Args:
            owner: Repository owner.
            repo: Repository name.
            run_id: The workflow run ID.

        Returns:
            Empty dict on success (201).
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Re-running workflow run %d in %s/%s", run_id, owner, repo)
        return await self._client.post(f"{base}/actions/runs/{run_id}/rerun")

    async def rerun_failed_jobs(
        self, owner: str, repo: str, run_id: int
    ) -> dict[str, Any]:
        """Re-run only the failed jobs in a workflow run.

        Args:
            owner: Repository owner.
            repo: Repository name.
            run_id: The workflow run ID.

        Returns:
            Empty dict on success (201).
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Re-running failed jobs for run %d in %s/%s", run_id, owner, repo)
        return await self._client.post(f"{base}/actions/runs/{run_id}/rerun-failed-jobs")

    # ── Jobs ──────────────────────────────────────────────────────────

    async def list_jobs_for_workflow_run(
        self,
        owner: str,
        repo: str,
        run_id: int,
        *,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """List jobs for a workflow run.

        Args:
            owner: Repository owner.
            repo: Repository name.
            run_id: The workflow run ID.
            params: Optional query parameters (filter, per_page, page).

        Returns:
            Paginated list of jobs.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Listing jobs for run %d in %s/%s", run_id, owner, repo)
        return await self._client.get(f"{base}/actions/runs/{run_id}/jobs", params=params)

    async def get_job(
        self, owner: str, repo: str, job_id: int
    ) -> dict[str, Any]:
        """Get a specific job.

        Args:
            owner: Repository owner.
            repo: Repository name.
            job_id: The job ID.

        Returns:
            Job data.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Getting job %d in %s/%s", job_id, owner, repo)
        return await self._client.get(f"{base}/actions/jobs/{job_id}")

    # ── Artifacts ─────────────────────────────────────────────────────

    async def list_artifacts(
        self,
        owner: str,
        repo: str,
        *,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """List artifacts for a repository.

        Args:
            owner: Repository owner.
            repo: Repository name.
            params: Optional query parameters (per_page, page, name).

        Returns:
            Paginated list of artifacts.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Listing artifacts for %s/%s", owner, repo)
        return await self._client.get(f"{base}/actions/artifacts", params=params)

    async def list_workflow_run_artifacts(
        self,
        owner: str,
        repo: str,
        run_id: int,
        *,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """List artifacts for a specific workflow run.

        Args:
            owner: Repository owner.
            repo: Repository name.
            run_id: The workflow run ID.
            params: Optional query parameters (per_page, page, name).

        Returns:
            Paginated list of artifacts.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Listing artifacts for run %d in %s/%s", run_id, owner, repo)
        return await self._client.get(f"{base}/actions/runs/{run_id}/artifacts", params=params)

    async def get_artifact(
        self, owner: str, repo: str, artifact_id: int
    ) -> dict[str, Any]:
        """Get a specific artifact.

        Args:
            owner: Repository owner.
            repo: Repository name.
            artifact_id: The artifact ID.

        Returns:
            Artifact data.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Getting artifact %d in %s/%s", artifact_id, owner, repo)
        return await self._client.get(f"{base}/actions/artifacts/{artifact_id}")

    async def delete_artifact(
        self, owner: str, repo: str, artifact_id: int
    ) -> dict[str, Any]:
        """Delete an artifact.

        Args:
            owner: Repository owner.
            repo: Repository name.
            artifact_id: The artifact ID.

        Returns:
            Empty dict on success (204).
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Deleting artifact %d in %s/%s", artifact_id, owner, repo)
        return await self._client.delete(f"{base}/actions/artifacts/{artifact_id}")

    # ── Downloads ─────────────────────────────────────────────────────

    async def download_artifact(
        self, owner: str, repo: str, artifact_id: int
    ):
        """Download an artifact archive (ZIP).

        Returns a raw response that can be streamed.

        Args:
            owner: Repository owner.
            repo: Repository name.
            artifact_id: The artifact ID.

        Returns:
            Raw response with artifact content.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Downloading artifact %d in %s/%s", artifact_id, owner, repo)
        return await self._client.get_raw(f"{base}/actions/artifacts/{artifact_id}/zip")

    async def download_run_logs(
        self, owner: str, repo: str, run_id: int
    ):
        """Download workflow run logs (ZIP).

        Args:
            owner: Repository owner.
            repo: Repository name.
            run_id: The workflow run ID.

        Returns:
            Raw response with log content.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Downloading run logs for %d in %s/%s", run_id, owner, repo)
        return await self._client.get_raw(f"{base}/actions/runs/{run_id}/logs")

    async def download_job_logs(
        self, owner: str, repo: str, job_id: int
    ):
        """Download job logs (plain text).

        Args:
            owner: Repository owner.
            repo: Repository name.
            job_id: The job ID.

        Returns:
            Raw response with log content.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Downloading job logs for %d in %s/%s", job_id, owner, repo)
        return await self._client.get_raw(f"{base}/actions/jobs/{job_id}/logs")

    # ── Workflow Dispatch ──────────────────────────────────────────────

    async def dispatch_workflow(
        self,
        owner: str,
        repo: str,
        workflow_id: int | str,
        ref: str,
        inputs: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Dispatch a workflow run.

        Args:
            owner: Repository owner.
            repo: Repository name.
            workflow_id: Workflow ID or filename.
            ref: Branch or tag name.
            inputs: Optional input key/value pairs.

        Returns:
            Empty dict on success (204).
        """
        base = self._repo_path(owner, repo)
        self._logger.info(
            "Dispatching workflow %s in %s/%s (ref=%s)", workflow_id, owner, repo, ref
        )
        body: dict[str, Any] = {"ref": ref}
        if inputs:
            body["inputs"] = inputs
        return await self._client.post(
            f"{base}/actions/workflows/{workflow_id}/dispatches", json=body
        )

    # ── Workflows ─────────────────────────────────────────────────────

    async def list_workflows(
        self,
        owner: str,
        repo: str,
        *,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """List workflows for a repository.

        Args:
            owner: Repository owner.
            repo: Repository name.
            params: Optional query parameters (per_page, page).

        Returns:
            Paginated list of workflows.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Listing workflows for %s/%s", owner, repo)
        return await self._client.get(f"{base}/actions/workflows", params=params)

    async def get_workflow(
        self, owner: str, repo: str, workflow_id: int | str
    ) -> dict[str, Any]:
        """Get a specific workflow.

        Args:
            owner: Repository owner.
            repo: Repository name.
            workflow_id: Workflow ID or filename (e.g. 'ci.yml').

        Returns:
            Workflow data.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Getting workflow %s in %s/%s", workflow_id, owner, repo)
        return await self._client.get(f"{base}/actions/workflows/{workflow_id}")

    async def list_workflow_runs_for_workflow(
        self,
        owner: str,
        repo: str,
        workflow_id: int | str,
        *,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """List workflow runs for a specific workflow.

        Args:
            owner: Repository owner.
            repo: Repository name.
            workflow_id: Workflow ID or filename.
            params: Optional query parameters (actor, branch, event, status, per_page, page).

        Returns:
            Paginated list of workflow runs.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Listing runs for workflow %s in %s/%s", workflow_id, owner, repo)
        return await self._client.get(
            f"{base}/actions/workflows/{workflow_id}/runs", params=params
        )
