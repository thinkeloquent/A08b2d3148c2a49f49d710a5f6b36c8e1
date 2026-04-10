"""Project service for JIRA operations."""

from __future__ import annotations

from typing import Any, Optional

from jira_api.core.client import AsyncJiraClient, JiraClient
from jira_api.logger import create_logger
from jira_api.models.project import Project, ProjectVersion, ProjectVersionCreate

log = create_logger("jira-api", __file__)


class ProjectService:
    """Service for project-related operations."""

    def __init__(self, client: JiraClient) -> None:
        self.client = client

    def get_project(self, project_key: str) -> Project:
        return self.client.get_project(project_key)

    def get_project_versions(
        self,
        project_key: str,
        released_only: bool | None = None,
    ) -> list[ProjectVersion]:
        versions = self.client.get_project_versions(project_key)
        if released_only is None:
            return versions
        elif released_only:
            return [v for v in versions if v.released]
        else:
            return [v for v in versions if not v.released]

    def create_version(
        self,
        project_key: str,
        version_name: str,
        description: str | None = None,
        start_date: str | None = None,
        release_date: str | None = None,
        released: bool = False,
        archived: bool = False,
    ) -> ProjectVersion:
        project = self.get_project(project_key)
        project_id = int(project.id)
        version_data = ProjectVersionCreate(
            name=version_name,
            description=description,
            project_id=project_id,
            start_date=start_date,
            release_date=release_date,
            released=released,
            archived=archived,
        )
        return self.client.create_project_version(version_data)

    def get_version_by_name(
        self, project_key: str, version_name: str
    ) -> ProjectVersion | None:
        versions = self.get_project_versions(project_key)
        for v in versions:
            if v.name == version_name:
                return v
        return None

    def get_released_versions(self, project_key: str) -> list[ProjectVersion]:
        return self.get_project_versions(project_key, released_only=True)

    def get_unreleased_versions(self, project_key: str) -> list[ProjectVersion]:
        return self.get_project_versions(project_key, released_only=False)

    def get_issue_types(self) -> list[dict[str, Any]]:
        return self.client.get_issue_types()


class AsyncProjectService:
    """Async service for project-related operations."""

    def __init__(self, client: AsyncJiraClient) -> None:
        self.client = client

    async def get_project(self, project_key: str) -> Project:
        return await self.client.get_project(project_key)

    async def get_project_versions(
        self,
        project_key: str,
        released_only: bool | None = None,
    ) -> list[ProjectVersion]:
        versions = await self.client.get_project_versions(project_key)
        if released_only is None:
            return versions
        elif released_only:
            return [v for v in versions if v.released]
        else:
            return [v for v in versions if not v.released]

    async def create_version(
        self,
        project_key: str,
        version_name: str,
        description: str | None = None,
        start_date: str | None = None,
        release_date: str | None = None,
        released: bool = False,
        archived: bool = False,
    ) -> ProjectVersion:
        project = await self.get_project(project_key)
        project_id = int(project.id)
        version_data = ProjectVersionCreate(
            name=version_name,
            description=description,
            project_id=project_id,
            start_date=start_date,
            release_date=release_date,
            released=released,
            archived=archived,
        )
        return await self.client.create_project_version(version_data)

    async def get_version_by_name(
        self, project_key: str, version_name: str
    ) -> ProjectVersion | None:
        versions = await self.get_project_versions(project_key)
        for v in versions:
            if v.name == version_name:
                return v
        return None

    async def get_released_versions(self, project_key: str) -> list[ProjectVersion]:
        return await self.get_project_versions(project_key, released_only=True)

    async def get_unreleased_versions(self, project_key: str) -> list[ProjectVersion]:
        return await self.get_project_versions(project_key, released_only=False)

    async def get_issue_types(self) -> list[dict[str, Any]]:
        return await self.client.get_issue_types()
