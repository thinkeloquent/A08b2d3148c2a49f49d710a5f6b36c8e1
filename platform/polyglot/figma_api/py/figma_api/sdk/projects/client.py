"""
Projects Module — Figma API SDK

Wraps team project and project file listing endpoints.
"""
from typing import Any, Dict, List, Optional

from ...logger import create_logger

log = create_logger("figma-api", __file__)


class ProjectsClient:
    """Client for Figma Projects API endpoints."""

    def __init__(self, client, *, logger=None):
        self._client = client
        self._log = logger or log

    async def get_team_projects(self, team_id: str) -> Dict[str, Any]:
        """List all projects for a team.

        GET /v1/teams/{team_id}/projects
        """
        self._log.info("fetching team projects", team_id=team_id)
        result = await self._client.get(f"/v1/teams/{team_id}/projects")
        project_count = len(result.get("projects", []))
        self._log.debug(
            "team projects fetched",
            team_id=team_id,
            project_count=project_count,
        )
        return result

    async def get_project_files(
        self,
        project_id: str,
        *,
        branch_data: bool = False,
    ) -> Dict[str, Any]:
        """List all files in a project.

        GET /v1/projects/{project_id}/files
        """
        self._log.info(
            "fetching project files",
            project_id=project_id,
            branch_data=branch_data,
        )
        params: Dict[str, Any] = {}
        if branch_data:
            params["branch_data"] = "true"

        result = await self._client.get(
            f"/v1/projects/{project_id}/files", params=params or None
        )
        file_count = len(result.get("files", []))
        self._log.debug(
            "project files fetched",
            project_id=project_id,
            file_count=file_count,
        )
        return result
