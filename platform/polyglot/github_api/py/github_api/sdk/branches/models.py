"""
Pydantic models for GitHub Branches API resources.
"""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field

__all__ = [
    "Branch",
    "BranchProtection",
    "RequiredStatusChecks",
    "RequiredPullRequestReviews",
    "PushRestrictions",
    "BranchComparison",
    "MergeResult",
]


class Branch(BaseModel):
    """GitHub branch resource."""

    name: str = Field(description="Branch name")
    commit: dict[str, Any] = Field(default_factory=dict, description="Head commit data")
    protected: bool = Field(default=False, description="Whether branch is protected")
    protection_url: str | None = Field(default=None, description="Branch protection API URL")

    model_config = {"extra": "allow"}


class RequiredStatusChecks(BaseModel):
    """Required status checks configuration for branch protection."""

    strict: bool = Field(default=False, description="Require branches to be up to date before merging")
    contexts: list[str] = Field(default_factory=list, description="Required status check contexts")
    checks: list[dict[str, Any]] = Field(default_factory=list, description="Required status checks with app_id")

    model_config = {"extra": "allow"}


class RequiredPullRequestReviews(BaseModel):
    """Required pull request reviews configuration."""

    dismiss_stale_reviews: bool = Field(default=False, description="Dismiss stale reviews on push")
    require_code_owner_reviews: bool = Field(default=False, description="Require code owner review")
    required_approving_review_count: int = Field(default=1, description="Number of approvals required")
    require_last_push_approval: bool = Field(default=False, description="Require approval of most recent push")
    dismissal_restrictions: dict[str, Any] = Field(default_factory=dict, description="Who can dismiss reviews")
    bypass_pull_request_allowances: dict[str, Any] = Field(default_factory=dict, description="Who can bypass PR requirements")

    model_config = {"extra": "allow"}


class PushRestrictions(BaseModel):
    """Push restrictions for a protected branch."""

    users: list[dict[str, Any]] = Field(default_factory=list, description="Users allowed to push")
    teams: list[dict[str, Any]] = Field(default_factory=list, description="Teams allowed to push")
    apps: list[dict[str, Any]] = Field(default_factory=list, description="Apps allowed to push")

    model_config = {"extra": "allow"}


class BranchProtection(BaseModel):
    """Branch protection configuration."""

    url: str | None = Field(default=None, description="Protection URL")
    required_status_checks: RequiredStatusChecks | None = Field(default=None, description="Required status checks")
    enforce_admins: dict[str, Any] | None = Field(default=None, description="Admin enforcement settings")
    required_pull_request_reviews: RequiredPullRequestReviews | None = Field(default=None, description="PR review requirements")
    restrictions: PushRestrictions | None = Field(default=None, description="Push restrictions")
    required_linear_history: dict[str, Any] | None = Field(default=None, description="Linear history requirement")
    allow_force_pushes: dict[str, Any] | None = Field(default=None, description="Force push settings")
    allow_deletions: dict[str, Any] | None = Field(default=None, description="Branch deletion settings")
    required_conversation_resolution: dict[str, Any] | None = Field(default=None, description="Conversation resolution requirement")

    model_config = {"extra": "allow"}


class BranchComparison(BaseModel):
    """Branch comparison result."""

    url: str = Field(default="", description="Comparison URL")
    status: str = Field(default="", description="Comparison status (ahead, behind, diverged, identical)")
    ahead_by: int = Field(default=0, description="Commits ahead")
    behind_by: int = Field(default=0, description="Commits behind")
    total_commits: int = Field(default=0, description="Total commits in comparison")
    commits: list[dict[str, Any]] = Field(default_factory=list, description="Commit objects")
    files: list[dict[str, Any]] = Field(default_factory=list, description="Changed files")

    model_config = {"extra": "allow"}


class MergeResult(BaseModel):
    """Result of a branch merge operation."""

    sha: str = Field(default="", description="Merge commit SHA")
    merged: bool = Field(default=False, description="Whether the merge was successful")
    message: str = Field(default="", description="Merge status message")

    model_config = {"extra": "allow"}
