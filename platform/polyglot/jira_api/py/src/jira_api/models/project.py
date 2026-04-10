"""Pydantic models for JIRA project entities."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ProjectVersion(BaseModel):
    """JIRA Project Version."""

    id: str
    name: str
    description: str | None = None
    archived: bool = False
    released: bool = False
    start_date: datetime | None = None
    release_date: datetime | None = None
    overdue: bool | None = None
    user_start_date: str | None = None
    user_release_date: str | None = None
    project_id: int = Field(..., alias="projectId")

    model_config = {"populate_by_name": True}


class ProjectVersionCreate(BaseModel):
    """Model for creating a new project version."""

    name: str
    description: str | None = None
    project_id: int
    archived: bool = False
    released: bool = False
    start_date: str | None = None
    release_date: str | None = None


class IssueType(BaseModel):
    """JIRA Issue Type."""

    id: str
    name: str
    description: str = ""
    icon_url: str | None = None
    subtask: bool = False


class ProjectLead(BaseModel):
    """JIRA Project Lead."""

    account_id: str | None = Field(None, alias="accountId")
    display_name: str | None = Field(None, alias="displayName")
    active: bool | None = None
    avatar_urls: dict[str, str] | None = Field(None, alias="avatarUrls")

    model_config = {"populate_by_name": True}


class Project(BaseModel):
    """JIRA Project."""

    id: str
    key: str
    name: str
    description: str | None = None
    lead: ProjectLead | None = None
    project_type_key: str | None = Field(None, alias="projectTypeKey")
    avatar_urls: dict[str, str] | None = Field(None, alias="avatarUrls")
    url: str | None = None
    issue_types: list[IssueType] | None = Field(None, alias="issueTypes")
    versions: list[ProjectVersion] | None = None

    model_config = {"populate_by_name": True}


class ProjectDetails(BaseModel):
    """Extended project details."""

    project: Project
    versions: list[ProjectVersion] = Field(default_factory=list)
    issue_types: list[IssueType] = Field(default_factory=list)
