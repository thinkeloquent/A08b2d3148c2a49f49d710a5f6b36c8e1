"""
Pydantic models for GitHub Repository API resources.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

__all__ = [
    "Repository",
    "RepositoryCreate",
    "RepositoryUpdate",
    "RepositoryListOptions",
    "Fork",
    "Topic",
]


class Repository(BaseModel):
    """GitHub repository resource."""

    id: int = Field(description="Unique repository ID")
    node_id: str = Field(default="", description="GraphQL node ID")
    name: str = Field(description="Repository name")
    full_name: str = Field(default="", description="Full name (owner/repo)")
    description: str | None = Field(default=None, description="Repository description")
    private: bool = Field(default=False, description="Whether the repo is private")
    fork: bool = Field(default=False, description="Whether the repo is a fork")
    html_url: str = Field(default="", description="URL to the repo on GitHub")
    clone_url: str = Field(default="", description="HTTPS clone URL")
    ssh_url: str = Field(default="", description="SSH clone URL")
    default_branch: str = Field(default="main", description="Default branch name")
    language: str | None = Field(default=None, description="Primary language")
    stargazers_count: int = Field(default=0, description="Number of stars")
    forks_count: int = Field(default=0, description="Number of forks")
    open_issues_count: int = Field(default=0, description="Number of open issues")
    archived: bool = Field(default=False, description="Whether the repo is archived")
    disabled: bool = Field(default=False, description="Whether the repo is disabled")
    visibility: str = Field(default="public", description="Repository visibility")
    created_at: datetime | None = Field(default=None, description="Creation timestamp")
    updated_at: datetime | None = Field(default=None, description="Last update timestamp")
    pushed_at: datetime | None = Field(default=None, description="Last push timestamp")
    owner: dict[str, Any] = Field(default_factory=dict, description="Repository owner")
    topics: list[str] = Field(default_factory=list, description="Repository topics")

    model_config = {"extra": "allow"}


class RepositoryCreate(BaseModel):
    """Parameters for creating a new repository."""

    name: str = Field(description="Repository name")
    description: str | None = Field(default=None, description="Repository description")
    homepage: str | None = Field(default=None, description="Homepage URL")
    private: bool = Field(default=False, description="Whether the repo should be private")
    auto_init: bool = Field(default=False, description="Create initial commit with README")
    gitignore_template: str | None = Field(default=None, description=".gitignore template name")
    license_template: str | None = Field(default=None, description="License template keyword")
    has_issues: bool = Field(default=True, description="Enable issues")
    has_projects: bool = Field(default=True, description="Enable projects")
    has_wiki: bool = Field(default=True, description="Enable wiki")
    has_discussions: bool = Field(default=False, description="Enable discussions")


class RepositoryUpdate(BaseModel):
    """Parameters for updating a repository."""

    name: str | None = Field(default=None, description="New repository name")
    description: str | None = Field(default=None, description="New description")
    homepage: str | None = Field(default=None, description="New homepage URL")
    private: bool | None = Field(default=None, description="Change visibility")
    archived: bool | None = Field(default=None, description="Archive/unarchive")
    default_branch: str | None = Field(default=None, description="Change default branch")
    has_issues: bool | None = Field(default=None, description="Enable/disable issues")
    has_projects: bool | None = Field(default=None, description="Enable/disable projects")
    has_wiki: bool | None = Field(default=None, description="Enable/disable wiki")
    has_discussions: bool | None = Field(default=None, description="Enable/disable discussions")
    allow_squash_merge: bool | None = Field(default=None, description="Allow squash merging")
    allow_merge_commit: bool | None = Field(default=None, description="Allow merge commits")
    allow_rebase_merge: bool | None = Field(default=None, description="Allow rebase merging")
    delete_branch_on_merge: bool | None = Field(default=None, description="Auto-delete head branches")


class RepositoryListOptions(BaseModel):
    """Options for listing repositories."""

    type: str | None = Field(default=None, description="Filter by type: all, owner, public, private, member")
    sort: str | None = Field(default=None, description="Sort by: created, updated, pushed, full_name")
    direction: str | None = Field(default=None, description="Sort direction: asc, desc")
    per_page: int = Field(default=30, description="Results per page (max 100)")
    page: int = Field(default=1, description="Page number")


class Fork(BaseModel):
    """GitHub fork resource."""

    id: int = Field(description="Fork repository ID")
    full_name: str = Field(default="", description="Full name (owner/repo)")
    owner: dict[str, Any] = Field(default_factory=dict, description="Fork owner")
    html_url: str = Field(default="", description="URL to the fork on GitHub")
    created_at: datetime | None = Field(default=None, description="Fork creation time")

    model_config = {"extra": "allow"}


class Topic(BaseModel):
    """Repository topics wrapper."""

    names: list[str] = Field(default_factory=list, description="List of topic names")
