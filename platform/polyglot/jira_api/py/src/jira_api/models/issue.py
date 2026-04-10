"""Pydantic models for JIRA issue entities."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field

from jira_api.models.project import IssueType, Project
from jira_api.models.user import User


class IssueStatus(BaseModel):
    """JIRA Issue Status."""

    id: str
    name: str
    description: str = ""
    category: dict[str, Any] | None = None


class IssuePriority(BaseModel):
    """JIRA Issue Priority."""

    id: str
    name: str
    description: str | None = None
    icon_url: str | None = None


class IssueTransition(BaseModel):
    """JIRA Issue Transition."""

    id: str
    name: str
    to: IssueStatus
    has_screen: bool = Field(False, alias="hasScreen")

    model_config = {"populate_by_name": True}


class IssueFields(BaseModel):
    """JIRA Issue Fields."""

    summary: str
    description: str | None = None
    issue_type: IssueType = Field(..., alias="issuetype")
    project: Project
    status: IssueStatus
    priority: IssuePriority | None = None
    assignee: User | None = None
    reporter: User | None = None
    labels: list[str] = Field(default_factory=list)
    created: datetime | None = None
    updated: datetime | None = None
    resolution: dict[str, Any] | None = None
    resolution_date: datetime | None = Field(None, alias="resolutiondate")

    model_config = {"populate_by_name": True}


class Issue(BaseModel):
    """JIRA Issue."""

    id: str
    key: str
    self_url: str = Field(..., alias="self")
    fields: IssueFields
    changelog: dict[str, Any] | None = None

    model_config = {"populate_by_name": True}


class IssueCreate(BaseModel):
    """Model for creating a new issue."""

    project_id: str
    summary: str
    description: str | None = None
    issue_type_id: str
    priority_id: str | None = None
    assignee_account_id: str | None = None
    reporter_account_id: str | None = None
    labels: list[str] = Field(default_factory=list)

    def to_jira_format(self) -> dict[str, Any]:
        """Convert to JIRA API format."""
        fields: dict[str, Any] = {
            "project": {"id": self.project_id},
            "summary": self.summary,
            "issuetype": {"id": self.issue_type_id},
        }
        if self.description:
            fields["description"] = {
                "type": "doc",
                "version": 1,
                "content": [
                    {
                        "type": "paragraph",
                        "content": [{"type": "text", "text": self.description}],
                    }
                ],
            }
        if self.priority_id:
            fields["priority"] = {"id": self.priority_id}
        if self.assignee_account_id:
            fields["assignee"] = {"accountId": self.assignee_account_id}
        if self.reporter_account_id:
            fields["reporter"] = {"accountId": self.reporter_account_id}
        if self.labels:
            fields["labels"] = self.labels
        return {"fields": fields}


class IssueUpdate(BaseModel):
    """Model for updating an existing issue."""

    summary: str | None = None
    description: str | None = None
    labels_add: list[str] = Field(default_factory=list)
    labels_remove: list[str] = Field(default_factory=list)
    priority_id: str | None = None

    def to_jira_format(self) -> dict[str, Any]:
        """Convert to JIRA API update format."""
        update: dict[str, Any] = {}
        if self.summary:
            update["summary"] = [{"set": self.summary}]
        if self.description:
            update["description"] = [
                {
                    "set": {
                        "type": "doc",
                        "version": 1,
                        "content": [
                            {
                                "type": "paragraph",
                                "content": [{"type": "text", "text": self.description}],
                            }
                        ],
                    }
                }
            ]
        label_ops = []
        for label in self.labels_add:
            label_ops.append({"add": label})
        for label in self.labels_remove:
            label_ops.append({"remove": label})
        if label_ops:
            update["labels"] = label_ops
        if self.priority_id:
            update["priority"] = [{"set": {"id": self.priority_id}}]
        return {"update": update}


class IssueTransitionRequest(BaseModel):
    """Model for transitioning an issue."""

    transition_id: str
    comment: str | None = None
    resolution_name: str | None = None

    def to_jira_format(self) -> dict[str, Any]:
        """Convert to JIRA API transition format."""
        data: dict[str, Any] = {"transition": {"id": self.transition_id}}
        fields: dict[str, Any] = {}
        if self.resolution_name:
            fields["resolution"] = {"name": self.resolution_name}
        if fields:
            data["fields"] = fields
        if self.comment:
            data["update"] = {
                "comment": [
                    {
                        "add": {
                            "body": {
                                "type": "doc",
                                "version": 1,
                                "content": [
                                    {
                                        "type": "paragraph",
                                        "content": [
                                            {"type": "text", "text": self.comment}
                                        ],
                                    }
                                ],
                            }
                        }
                    }
                ]
            }
        return data


class IssueAssignment(BaseModel):
    """Model for assigning an issue."""

    account_id: str | None = None

    def to_jira_format(self) -> dict[str, Any]:
        """Convert to JIRA API assignment format."""
        return {"accountId": self.account_id}


class IssueSearchResult(BaseModel):
    """Issue search results."""

    issues: list[Issue] = Field(default_factory=list)
    total: int = 0
    start_at: int = 0
    max_results: int = 50
