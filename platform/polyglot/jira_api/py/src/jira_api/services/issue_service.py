"""Issue service for JIRA operations."""

from __future__ import annotations

from typing import Optional

from jira_api.core.client import AsyncJiraClient, JiraClient
from jira_api.logger import create_logger
from jira_api.models.issue import (
    Issue,
    IssueAssignment,
    IssueCreate,
    IssueTransition,
    IssueTransitionRequest,
    IssueUpdate,
)
from jira_api.services.user_service import AsyncUserService, UserService

log = create_logger("jira-api", __file__)


class IssueService:
    """Service for issue-related operations."""

    def __init__(self, client: JiraClient) -> None:
        self.client = client
        self.user_service = UserService(client)

    def create_issue(
        self,
        project_id: str,
        summary: str,
        issue_type_id: str,
        description: str | None = None,
        priority_id: str | None = None,
        assignee_email: str | None = None,
        labels: list[str] | None = None,
    ) -> Issue:
        assignee_account_id = None
        if assignee_email:
            assignee = self.user_service.get_user_by_email(assignee_email)
            if assignee:
                assignee_account_id = assignee.account_id

        issue_data = IssueCreate(
            project_id=project_id,
            summary=summary,
            description=description,
            issue_type_id=issue_type_id,
            priority_id=priority_id,
            assignee_account_id=assignee_account_id,
            labels=labels or [],
        )
        return self.client.create_issue(issue_data)

    def create_issue_by_type_name(
        self,
        project_key: str,
        summary: str,
        issue_type_name: str,
        description: str | None = None,
        priority_id: str | None = None,
        assignee_email: str | None = None,
        labels: list[str] | None = None,
    ) -> Issue:
        project = self.client.get_project(project_key)
        project_id = project.id
        issue_type_id = self.client.get_issue_type_id_by_name(project_key, issue_type_name)
        return self.create_issue(
            project_id=project_id,
            summary=summary,
            issue_type_id=issue_type_id,
            description=description,
            priority_id=priority_id,
            assignee_email=assignee_email,
            labels=labels,
        )

    def get_issue(self, issue_key: str) -> Issue:
        return self.client.get_issue(issue_key)

    def update_issue_summary(self, issue_key: str, summary: str) -> None:
        update_data = IssueUpdate(summary=summary)
        self.client.update_issue(issue_key, update_data)

    def update_issue_description(self, issue_key: str, description: str) -> None:
        update_data = IssueUpdate(description=description)
        self.client.update_issue(issue_key, update_data)

    def add_labels_to_issue(self, issue_key: str, labels: list[str]) -> None:
        update_data = IssueUpdate(labels_add=labels)
        self.client.update_issue(issue_key, update_data)

    def remove_labels_from_issue(self, issue_key: str, labels: list[str]) -> None:
        update_data = IssueUpdate(labels_remove=labels)
        self.client.update_issue(issue_key, update_data)

    def assign_issue_by_email(self, issue_key: str, assignee_email: str) -> None:
        assignee = self.user_service.get_user_by_email(assignee_email)
        if not assignee:
            raise ValueError(f"User with email '{assignee_email}' not found")
        assignment = IssueAssignment(account_id=assignee.account_id)
        self.client.assign_issue(issue_key, assignment)

    def unassign_issue(self, issue_key: str) -> None:
        assignment = IssueAssignment(account_id=None)
        self.client.assign_issue(issue_key, assignment)

    def get_available_transitions(self, issue_key: str) -> list[IssueTransition]:
        return self.client.get_issue_transitions(issue_key)

    def transition_issue_by_name(
        self,
        issue_key: str,
        transition_name: str,
        comment: str | None = None,
        resolution_name: str | None = None,
    ) -> None:
        transitions = self.get_available_transitions(issue_key)
        transition_id = None
        for t in transitions:
            if t.name.lower() == transition_name.lower():
                transition_id = t.id
                break
        if not transition_id:
            available = [t.name for t in transitions]
            raise ValueError(
                f"Transition '{transition_name}' not found. "
                f"Available: {', '.join(available)}"
            )
        request = IssueTransitionRequest(
            transition_id=transition_id,
            comment=comment,
            resolution_name=resolution_name,
        )
        self.client.transition_issue(issue_key, request)

    def transition_issue_by_id(
        self,
        issue_key: str,
        transition_id: str,
        comment: str | None = None,
        resolution_name: str | None = None,
    ) -> None:
        request = IssueTransitionRequest(
            transition_id=transition_id,
            comment=comment,
            resolution_name=resolution_name,
        )
        self.client.transition_issue(issue_key, request)


class AsyncIssueService:
    """Async service for issue-related operations."""

    def __init__(self, client: AsyncJiraClient) -> None:
        self.client = client
        self.user_service = AsyncUserService(client)

    async def create_issue(
        self,
        project_id: str,
        summary: str,
        issue_type_id: str,
        description: str | None = None,
        priority_id: str | None = None,
        assignee_email: str | None = None,
        labels: list[str] | None = None,
    ) -> Issue:
        assignee_account_id = None
        if assignee_email:
            assignee = await self.user_service.get_user_by_email(assignee_email)
            if assignee:
                assignee_account_id = assignee.account_id

        issue_data = IssueCreate(
            project_id=project_id,
            summary=summary,
            description=description,
            issue_type_id=issue_type_id,
            priority_id=priority_id,
            assignee_account_id=assignee_account_id,
            labels=labels or [],
        )
        return await self.client.create_issue(issue_data)

    async def create_issue_by_type_name(
        self,
        project_key: str,
        summary: str,
        issue_type_name: str,
        description: str | None = None,
        priority_id: str | None = None,
        assignee_email: str | None = None,
        labels: list[str] | None = None,
    ) -> Issue:
        project = await self.client.get_project(project_key)
        project_id = project.id
        issue_type_id = await self.client.get_issue_type_id_by_name(project_key, issue_type_name)
        return await self.create_issue(
            project_id=project_id,
            summary=summary,
            issue_type_id=issue_type_id,
            description=description,
            priority_id=priority_id,
            assignee_email=assignee_email,
            labels=labels,
        )

    async def get_issue(self, issue_key: str) -> Issue:
        return await self.client.get_issue(issue_key)

    async def update_issue_summary(self, issue_key: str, summary: str) -> None:
        update_data = IssueUpdate(summary=summary)
        await self.client.update_issue(issue_key, update_data)

    async def update_issue_description(self, issue_key: str, description: str) -> None:
        update_data = IssueUpdate(description=description)
        await self.client.update_issue(issue_key, update_data)

    async def add_labels_to_issue(self, issue_key: str, labels: list[str]) -> None:
        update_data = IssueUpdate(labels_add=labels)
        await self.client.update_issue(issue_key, update_data)

    async def remove_labels_from_issue(self, issue_key: str, labels: list[str]) -> None:
        update_data = IssueUpdate(labels_remove=labels)
        await self.client.update_issue(issue_key, update_data)

    async def assign_issue_by_email(self, issue_key: str, assignee_email: str) -> None:
        assignee = await self.user_service.get_user_by_email(assignee_email)
        if not assignee:
            raise ValueError(f"User with email '{assignee_email}' not found")
        assignment = IssueAssignment(account_id=assignee.account_id)
        await self.client.assign_issue(issue_key, assignment)

    async def unassign_issue(self, issue_key: str) -> None:
        assignment = IssueAssignment(account_id=None)
        await self.client.assign_issue(issue_key, assignment)

    async def get_available_transitions(self, issue_key: str) -> list[IssueTransition]:
        return await self.client.get_issue_transitions(issue_key)

    async def transition_issue_by_name(
        self,
        issue_key: str,
        transition_name: str,
        comment: str | None = None,
        resolution_name: str | None = None,
    ) -> None:
        transitions = await self.get_available_transitions(issue_key)
        transition_id = None
        for t in transitions:
            if t.name.lower() == transition_name.lower():
                transition_id = t.id
                break
        if not transition_id:
            available = [t.name for t in transitions]
            raise ValueError(
                f"Transition '{transition_name}' not found. "
                f"Available: {', '.join(available)}"
            )
        request = IssueTransitionRequest(
            transition_id=transition_id,
            comment=comment,
            resolution_name=resolution_name,
        )
        await self.client.transition_issue(issue_key, request)

    async def transition_issue_by_id(
        self,
        issue_key: str,
        transition_id: str,
        comment: str | None = None,
        resolution_name: str | None = None,
    ) -> None:
        request = IssueTransitionRequest(
            transition_id=transition_id,
            comment=comment,
            resolution_name=resolution_name,
        )
        await self.client.transition_issue(issue_key, request)
