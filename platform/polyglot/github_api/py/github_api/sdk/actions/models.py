"""
Pydantic models for GitHub Actions API resources.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

__all__ = [
    "WorkflowRun",
    "WorkflowJob",
    "WorkflowJobStep",
    "Artifact",
    "Workflow",
    "WorkflowDispatchRequest",
]


class WorkflowRun(BaseModel):
    """GitHub Actions workflow run."""

    id: int = Field(description="Workflow run ID")
    name: str | None = Field(default=None, description="Workflow run name")
    node_id: str = Field(default="", description="GraphQL node ID")
    head_branch: str | None = Field(default=None, description="Head branch")
    head_sha: str = Field(default="", description="Head commit SHA")
    status: str = Field(default="", description="Run status (queued, in_progress, completed, etc.)")
    conclusion: str | None = Field(default=None, description="Run conclusion (success, failure, cancelled, etc.)")
    workflow_id: int = Field(default=0, description="Associated workflow ID")
    run_number: int = Field(default=0, description="Run number")
    run_attempt: int = Field(default=1, description="Run attempt number")
    event: str = Field(default="", description="Triggering event")
    display_title: str = Field(default="", description="Display title")
    html_url: str = Field(default="", description="Web URL for this run")
    created_at: datetime | None = Field(default=None, description="Creation timestamp")
    updated_at: datetime | None = Field(default=None, description="Last update timestamp")
    run_started_at: datetime | None = Field(default=None, description="Run start timestamp")
    jobs_url: str = Field(default="", description="Jobs API URL")
    logs_url: str = Field(default="", description="Logs download URL")
    artifacts_url: str = Field(default="", description="Artifacts API URL")
    actor: dict[str, Any] = Field(default_factory=dict, description="Actor who triggered the run")
    repository: dict[str, Any] = Field(default_factory=dict, description="Repository data")
    head_commit: dict[str, Any] | None = Field(default=None, description="Head commit data")

    model_config = {"extra": "allow"}


class WorkflowJobStep(BaseModel):
    """A step within a workflow job."""

    name: str = Field(description="Step name")
    status: str = Field(default="", description="Step status")
    conclusion: str | None = Field(default=None, description="Step conclusion")
    number: int = Field(default=0, description="Step number")
    started_at: datetime | None = Field(default=None, description="Start timestamp")
    completed_at: datetime | None = Field(default=None, description="Completion timestamp")

    model_config = {"extra": "allow"}


class WorkflowJob(BaseModel):
    """GitHub Actions workflow job."""

    id: int = Field(description="Job ID")
    run_id: int = Field(default=0, description="Parent workflow run ID")
    name: str = Field(default="", description="Job name")
    node_id: str = Field(default="", description="GraphQL node ID")
    head_sha: str = Field(default="", description="Head commit SHA")
    status: str = Field(default="", description="Job status")
    conclusion: str | None = Field(default=None, description="Job conclusion")
    started_at: datetime | None = Field(default=None, description="Start timestamp")
    completed_at: datetime | None = Field(default=None, description="Completion timestamp")
    html_url: str = Field(default="", description="Web URL for this job")
    steps: list[WorkflowJobStep] = Field(default_factory=list, description="Job steps")
    labels: list[str] = Field(default_factory=list, description="Runner labels")
    runner_id: int | None = Field(default=None, description="Runner ID")
    runner_name: str = Field(default="", description="Runner name")
    runner_group_id: int | None = Field(default=None, description="Runner group ID")
    runner_group_name: str = Field(default="", description="Runner group name")
    workflow_name: str = Field(default="", description="Parent workflow name")

    model_config = {"extra": "allow"}


class Artifact(BaseModel):
    """GitHub Actions artifact."""

    id: int = Field(description="Artifact ID")
    node_id: str = Field(default="", description="GraphQL node ID")
    name: str = Field(default="", description="Artifact name")
    size_in_bytes: int = Field(default=0, description="Artifact size in bytes")
    archive_download_url: str = Field(default="", description="Download URL (zip)")
    expired: bool = Field(default=False, description="Whether the artifact has expired")
    created_at: datetime | None = Field(default=None, description="Creation timestamp")
    expires_at: datetime | None = Field(default=None, description="Expiration timestamp")
    updated_at: datetime | None = Field(default=None, description="Last update timestamp")

    model_config = {"extra": "allow"}


class WorkflowDispatchRequest(BaseModel):
    """Request body for dispatching a workflow run."""

    ref: str = Field(description="Branch or tag name to dispatch against")
    inputs: dict[str, Any] = Field(
        default_factory=dict, description="Input key/value pairs for the workflow"
    )

    model_config = {"extra": "allow"}


class Workflow(BaseModel):
    """GitHub Actions workflow definition."""

    id: int = Field(description="Workflow ID")
    node_id: str = Field(default="", description="GraphQL node ID")
    name: str = Field(default="", description="Workflow name")
    path: str = Field(default="", description="Workflow file path")
    state: str = Field(default="", description="Workflow state (active, deleted, disabled_fork, etc.)")
    created_at: datetime | None = Field(default=None, description="Creation timestamp")
    updated_at: datetime | None = Field(default=None, description="Last update timestamp")
    html_url: str = Field(default="", description="Web URL")
    badge_url: str = Field(default="", description="Status badge URL")

    model_config = {"extra": "allow"}
