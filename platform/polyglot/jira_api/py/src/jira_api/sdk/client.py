"""SDK client for interacting with the JIRA API server."""

from __future__ import annotations

from typing import Any, Optional

import httpx

from jira_api.exceptions import SDKError
from jira_api.logger import create_logger
from jira_api.models.issue import Issue, IssueCreate, IssueTransition, IssueUpdate
from jira_api.models.project import Project, ProjectVersion
from jira_api.models.user import User

log = create_logger("jira-api", __file__)


class JiraSDKClient:
    """SDK client for interacting with the JIRA API server."""

    def __init__(
        self,
        base_url: str,
        api_key: str | None = None,
        timeout: float = 30.0,
    ) -> None:
        if not base_url.endswith("/"):
            base_url += "/"
        self.base_url = base_url
        auth = (api_key, "") if api_key else None
        self._client = httpx.Client(
            auth=auth,
            timeout=timeout,
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
        )

    def __enter__(self) -> JiraSDKClient:
        return self

    def __exit__(self, *args: Any) -> None:
        self.close()

    def close(self) -> None:
        self._client.close()

    def _request(
        self,
        method: str,
        endpoint: str,
        params: dict[str, Any] | None = None,
        json_data: dict[str, Any] | None = None,
    ) -> Any:
        from urllib.parse import urljoin

        url = urljoin(self.base_url, endpoint)
        try:
            response = self._client.request(method=method, url=url, params=params, json=json_data)
            if response.status_code >= 400:
                error_msg = f"HTTP {response.status_code}"
                try:
                    data = response.json()
                    if "detail" in data:
                        error_msg = data["detail"]
                except Exception:
                    data = {}
                raise SDKError(error_msg, status_code=response.status_code, response_data=data)
            if response.status_code == 204 or not response.content:
                return {}
            return response.json()
        except httpx.RequestError as e:
            raise SDKError(f"Request failed: {e}")

    # ── Health ───────────────────────────────────────────────────────────

    def health_check(self) -> dict[str, str]:
        return self._request("GET", "health")

    # ── Users ────────────────────────────────────────────────────────────

    def search_users(self, query: str, max_results: int = 50) -> list[User]:
        data = self._request("GET", "users/search", params={"query": query, "max_results": max_results})
        return [User(**u) for u in data]

    def get_user(self, identifier: str) -> User:
        data = self._request("GET", f"users/{identifier}")
        return User(**data)

    # ── Issues ───────────────────────────────────────────────────────────

    def create_issue(self, issue_data: IssueCreate) -> Issue:
        data = self._request("POST", "issues", json_data=issue_data.model_dump(exclude_unset=True))
        return Issue(**data)

    def get_issue(self, issue_key: str) -> Issue:
        data = self._request("GET", f"issues/{issue_key}")
        return Issue(**data)

    def update_issue(self, issue_key: str, update_data: IssueUpdate) -> dict[str, str]:
        return self._request("PATCH", f"issues/{issue_key}", json_data=update_data.model_dump(exclude_unset=True))

    def assign_issue(self, issue_key: str, email: str) -> dict[str, str]:
        return self._request("PUT", f"issues/{issue_key}/assign/{email}")

    def get_issue_transitions(self, issue_key: str) -> list[IssueTransition]:
        data = self._request("GET", f"issues/{issue_key}/transitions")
        return [IssueTransition(**t) for t in data]

    def transition_issue(
        self,
        issue_key: str,
        transition_name: str,
        comment: str | None = None,
        resolution_name: str | None = None,
    ) -> dict[str, str]:
        return self._request(
            "POST",
            f"issues/{issue_key}/transitions",
            json_data={"transition_name": transition_name, "comment": comment, "resolution_name": resolution_name},
        )

    # ── Projects ─────────────────────────────────────────────────────────

    def get_project(self, project_key: str) -> Project:
        data = self._request("GET", f"projects/{project_key}")
        return Project(**data)

    def get_project_versions(self, project_key: str, released: bool | None = None) -> list[ProjectVersion]:
        params = {}
        if released is not None:
            params["released"] = released
        data = self._request("GET", f"projects/{project_key}/versions", params=params)
        return [ProjectVersion(**v) for v in data]

    def create_project_version(self, project_key: str, name: str, description: str | None = None) -> ProjectVersion:
        json_data: dict[str, Any] = {"name": name}
        if description:
            json_data["description"] = description
        data = self._request("POST", f"projects/{project_key}/versions", json_data=json_data)
        return ProjectVersion(**data)


class AsyncJiraSDKClient:
    """Async SDK client for interacting with the JIRA API server."""

    def __init__(
        self,
        base_url: str,
        api_key: str | None = None,
        timeout: float = 30.0,
    ) -> None:
        if not base_url.endswith("/"):
            base_url += "/"
        self.base_url = base_url
        auth = (api_key, "") if api_key else None
        self._client = httpx.AsyncClient(
            auth=auth,
            timeout=timeout,
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
        )

    async def __aenter__(self) -> AsyncJiraSDKClient:
        return self

    async def __aexit__(self, *args: Any) -> None:
        await self.aclose()

    async def aclose(self) -> None:
        await self._client.aclose()

    async def _request(
        self,
        method: str,
        endpoint: str,
        params: dict[str, Any] | None = None,
        json_data: dict[str, Any] | None = None,
    ) -> Any:
        from urllib.parse import urljoin

        url = urljoin(self.base_url, endpoint)
        try:
            response = await self._client.request(method=method, url=url, params=params, json=json_data)
            if response.status_code >= 400:
                error_msg = f"HTTP {response.status_code}"
                try:
                    data = response.json()
                    if "detail" in data:
                        error_msg = data["detail"]
                except Exception:
                    data = {}
                raise SDKError(error_msg, status_code=response.status_code, response_data=data)
            if response.status_code == 204 or not response.content:
                return {}
            return response.json()
        except httpx.RequestError as e:
            raise SDKError(f"Request failed: {e}")

    # ── Health ───────────────────────────────────────────────────────────

    async def health_check(self) -> dict[str, str]:
        return await self._request("GET", "health")

    # ── Users ────────────────────────────────────────────────────────────

    async def search_users(self, query: str, max_results: int = 50) -> list[User]:
        data = await self._request("GET", "users/search", params={"query": query, "max_results": max_results})
        return [User(**u) for u in data]

    async def get_user(self, identifier: str) -> User:
        data = await self._request("GET", f"users/{identifier}")
        return User(**data)

    # ── Issues ───────────────────────────────────────────────────────────

    async def create_issue(self, issue_data: IssueCreate) -> Issue:
        data = await self._request("POST", "issues", json_data=issue_data.model_dump(exclude_unset=True))
        return Issue(**data)

    async def get_issue(self, issue_key: str) -> Issue:
        data = await self._request("GET", f"issues/{issue_key}")
        return Issue(**data)

    async def update_issue(self, issue_key: str, update_data: IssueUpdate) -> dict[str, str]:
        return await self._request("PATCH", f"issues/{issue_key}", json_data=update_data.model_dump(exclude_unset=True))

    async def assign_issue(self, issue_key: str, email: str) -> dict[str, str]:
        return await self._request("PUT", f"issues/{issue_key}/assign/{email}")

    async def get_issue_transitions(self, issue_key: str) -> list[IssueTransition]:
        data = await self._request("GET", f"issues/{issue_key}/transitions")
        return [IssueTransition(**t) for t in data]

    async def transition_issue(
        self,
        issue_key: str,
        transition_name: str,
        comment: str | None = None,
        resolution_name: str | None = None,
    ) -> dict[str, str]:
        return await self._request(
            "POST",
            f"issues/{issue_key}/transitions",
            json_data={"transition_name": transition_name, "comment": comment, "resolution_name": resolution_name},
        )

    # ── Projects ─────────────────────────────────────────────────────────

    async def get_project(self, project_key: str) -> Project:
        data = await self._request("GET", f"projects/{project_key}")
        return Project(**data)

    async def get_project_versions(self, project_key: str, released: bool | None = None) -> list[ProjectVersion]:
        params = {}
        if released is not None:
            params["released"] = released
        data = await self._request("GET", f"projects/{project_key}/versions", params=params)
        return [ProjectVersion(**v) for v in data]

    async def create_project_version(self, project_key: str, name: str, description: str | None = None) -> ProjectVersion:
        json_data: dict[str, Any] = {"name": name}
        if description:
            json_data["description"] = description
        data = await self._request("POST", f"projects/{project_key}/versions", json_data=json_data)
        return ProjectVersion(**data)
