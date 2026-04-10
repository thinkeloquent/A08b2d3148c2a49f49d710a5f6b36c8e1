"""Core JIRA API client using HTTPX."""

from __future__ import annotations

from typing import Any
from urllib.parse import urljoin

import httpx

from jira_api.exceptions import (
    JiraAPIError,
    JiraAuthenticationError,
    JiraNotFoundError,
    JiraPermissionError,
    JiraRateLimitError,
    JiraServerError,
    JiraValidationError,
)
from jira_api.logger import create_logger

log = create_logger("jira-api", __file__)


class JiraClient:
    """Core JIRA API client for interacting with Jira Cloud REST API v3."""

    def __init__(
        self,
        base_url: str,
        email: str,
        api_token: str,
        timeout: float = 30.0,
    ) -> None:
        if not base_url.startswith(("http://", "https://")):
            raise JiraValidationError("Base URL must start with http:// or https://")

        if not base_url.endswith("/"):
            base_url += "/"

        self.base_url = urljoin(base_url, "rest/api/3/")
        self.email = email
        self.api_token = api_token
        self.timeout = timeout

        self._client = httpx.Client(
            auth=(email, api_token),
            timeout=timeout,
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
        )
        log.debug("JiraClient initialized", {"base_url": self.base_url})

    def __enter__(self) -> JiraClient:
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        self.close()

    def close(self) -> None:
        self._client.close()

    def _make_request(
        self,
        method: str,
        endpoint: str,
        params: dict[str, Any] | None = None,
        json_data: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        url = urljoin(self.base_url, endpoint)

        try:
            log.debug("request", {"method": method, "url": url})
            response = self._client.request(
                method=method,
                url=url,
                params=params,
                json=json_data,
            )

            if response.status_code == 401:
                raise JiraAuthenticationError("Invalid credentials or expired token")
            elif response.status_code == 403:
                raise JiraPermissionError("Insufficient permissions for this operation")
            elif response.status_code == 404:
                raise JiraNotFoundError("Resource not found")
            elif response.status_code == 400:
                error_msg = "Bad request"
                try:
                    error_data = response.json()
                    if "errorMessages" in error_data:
                        error_msg = "; ".join(error_data["errorMessages"])
                except Exception:
                    pass
                raise JiraValidationError(error_msg)
            elif response.status_code == 429:
                retry_after = float(response.headers.get("retry-after", 0)) or None
                raise JiraRateLimitError("Rate limit exceeded", retry_after=retry_after)
            elif response.status_code >= 500:
                raise JiraServerError(
                    f"Server error: {response.status_code}",
                    status_code=response.status_code,
                )
            elif response.status_code >= 400:
                error_msg = f"HTTP {response.status_code}"
                try:
                    error_data = response.json()
                    if "errorMessages" in error_data:
                        error_msg = "; ".join(error_data["errorMessages"])
                except Exception:
                    pass
                raise JiraAPIError(error_msg, status_code=response.status_code)

            if response.status_code == 204 or not response.content:
                return {}

            try:
                return response.json()
            except Exception as e:
                raise JiraAPIError(f"Failed to parse response JSON: {e}")

        except httpx.RequestError as e:
            raise JiraAPIError(f"Request failed: {e}")

    # ── User Management ──────────────────────────────────────────────────

    def get_user(self, account_id: str) -> Any:
        from jira_api.models.user import User

        params = {"accountId": account_id}
        data = self._make_request("GET", "user", params=params)
        return User(**data)

    def search_users(self, query: str, max_results: int = 50) -> list[Any]:
        from jira_api.models.user import User

        params: dict[str, Any] = {"query": query, "maxResults": max_results}
        data = self._make_request("GET", "user/search", params=params)
        return [User(**u) for u in data]

    def find_assignable_users(
        self,
        project_keys: list[str],
        query: str | None = None,
        max_results: int = 50,
    ) -> list[Any]:
        from jira_api.models.user import User

        params: dict[str, Any] = {
            "projectKeys": ",".join(project_keys),
            "maxResults": max_results,
        }
        if query:
            params["query"] = query
        data = self._make_request("GET", "user/assignable/multiProjectSearch", params=params)
        return [User(**u) for u in data]

    # ── Issue Management ─────────────────────────────────────────────────

    def create_issue(self, issue_data: Any) -> Any:
        from jira_api.models.issue import Issue

        json_data = issue_data.to_jira_format()
        data = self._make_request("POST", "issue", json_data=json_data)
        issue_key = data.get("key")
        if not issue_key:
            raise JiraAPIError("Issue created but key not returned")
        return self.get_issue(issue_key)

    def get_issue(self, issue_key: str) -> Any:
        from jira_api.models.issue import Issue

        data = self._make_request("GET", f"issue/{issue_key}")
        return Issue(**data)

    def update_issue(self, issue_key: str, update_data: Any) -> None:
        json_data = update_data.to_jira_format()
        self._make_request("PUT", f"issue/{issue_key}", json_data=json_data)

    def assign_issue(self, issue_key: str, assignment: Any) -> None:
        json_data = assignment.to_jira_format()
        self._make_request("PUT", f"issue/{issue_key}/assignee", json_data=json_data)

    def get_issue_transitions(self, issue_key: str) -> list[Any]:
        from jira_api.models.issue import IssueTransition

        data = self._make_request("GET", f"issue/{issue_key}/transitions")
        return [IssueTransition(**t) for t in data.get("transitions", [])]

    def transition_issue(self, issue_key: str, transition_request: Any) -> None:
        json_data = transition_request.to_jira_format()
        self._make_request("POST", f"issue/{issue_key}/transitions", json_data=json_data)

    # ── Project Management ───────────────────────────────────────────────

    def get_project(self, project_key: str) -> Any:
        from jira_api.models.project import Project

        data = self._make_request("GET", f"project/{project_key}")
        return Project(**data)

    def get_project_versions(self, project_key: str) -> list[Any]:
        from jira_api.models.project import ProjectVersion

        data = self._make_request("GET", f"project/{project_key}/versions")
        return [ProjectVersion(**v) for v in data]

    def create_project_version(self, version_data: Any) -> Any:
        from jira_api.models.project import ProjectVersion

        json_data = version_data.model_dump(exclude_unset=True)
        data = self._make_request("POST", "version", json_data=json_data)
        return ProjectVersion(**data)

    def get_issue_types(self) -> list[dict[str, Any]]:
        return self._make_request("GET", "issuetype")

    def get_project_issue_types(self, project_key: str) -> list[dict[str, Any]]:
        project_data = self._make_request("GET", f"project/{project_key}")
        return project_data.get("issueTypes", [])

    def get_issue_type_id_by_name(self, project_key: str, issue_type_name: str) -> str:
        issue_types = self.get_project_issue_types(project_key)
        for it in issue_types:
            if it.get("name", "").lower() == issue_type_name.lower():
                return it["id"]
        available = [it.get("name", "") for it in issue_types]
        raise JiraValidationError(
            f"Issue type '{issue_type_name}' not found in project '{project_key}'. "
            f"Available types: {', '.join(available)}"
        )


class AsyncJiraClient:
    """Async core JIRA API client for interacting with Jira Cloud REST API v3."""

    def __init__(
        self,
        base_url: str,
        email: str,
        api_token: str,
        timeout: float = 30.0,
    ) -> None:
        if not base_url.startswith(("http://", "https://")):
            raise JiraValidationError("Base URL must start with http:// or https://")

        if not base_url.endswith("/"):
            base_url += "/"

        self.base_url = urljoin(base_url, "rest/api/3/")
        self.email = email
        self.api_token = api_token
        self.timeout = timeout

        self._client = httpx.AsyncClient(
            auth=(email, api_token),
            timeout=timeout,
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
        )
        log.debug("AsyncJiraClient initialized", {"base_url": self.base_url})

    async def __aenter__(self) -> AsyncJiraClient:
        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        await self.aclose()

    async def aclose(self) -> None:
        await self._client.aclose()

    async def _make_request(
        self,
        method: str,
        endpoint: str,
        params: dict[str, Any] | None = None,
        json_data: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        url = urljoin(self.base_url, endpoint)

        try:
            log.debug("request", {"method": method, "url": url})
            response = await self._client.request(
                method=method,
                url=url,
                params=params,
                json=json_data,
            )

            if response.status_code == 401:
                raise JiraAuthenticationError("Invalid credentials or expired token")
            elif response.status_code == 403:
                raise JiraPermissionError("Insufficient permissions for this operation")
            elif response.status_code == 404:
                raise JiraNotFoundError("Resource not found")
            elif response.status_code == 400:
                error_msg = "Bad request"
                try:
                    error_data = response.json()
                    if "errorMessages" in error_data:
                        error_msg = "; ".join(error_data["errorMessages"])
                except Exception:
                    pass
                raise JiraValidationError(error_msg)
            elif response.status_code == 429:
                retry_after = float(response.headers.get("retry-after", 0)) or None
                raise JiraRateLimitError("Rate limit exceeded", retry_after=retry_after)
            elif response.status_code >= 500:
                raise JiraServerError(
                    f"Server error: {response.status_code}",
                    status_code=response.status_code,
                )
            elif response.status_code >= 400:
                error_msg = f"HTTP {response.status_code}"
                try:
                    error_data = response.json()
                    if "errorMessages" in error_data:
                        error_msg = "; ".join(error_data["errorMessages"])
                except Exception:
                    pass
                raise JiraAPIError(error_msg, status_code=response.status_code)

            if response.status_code == 204 or not response.content:
                return {}

            try:
                return response.json()
            except Exception as e:
                raise JiraAPIError(f"Failed to parse response JSON: {e}")

        except httpx.RequestError as e:
            raise JiraAPIError(f"Request failed: {e}")

    # ── User Management ──────────────────────────────────────────────────

    async def get_user(self, account_id: str) -> Any:
        from jira_api.models.user import User

        params = {"accountId": account_id}
        data = await self._make_request("GET", "user", params=params)
        return User(**data)

    async def search_users(self, query: str, max_results: int = 50) -> list[Any]:
        from jira_api.models.user import User

        params: dict[str, Any] = {"query": query, "maxResults": max_results}
        data = await self._make_request("GET", "user/search", params=params)
        return [User(**u) for u in data]

    async def find_assignable_users(
        self,
        project_keys: list[str],
        query: str | None = None,
        max_results: int = 50,
    ) -> list[Any]:
        from jira_api.models.user import User

        params: dict[str, Any] = {
            "projectKeys": ",".join(project_keys),
            "maxResults": max_results,
        }
        if query:
            params["query"] = query
        data = await self._make_request("GET", "user/assignable/multiProjectSearch", params=params)
        return [User(**u) for u in data]

    # ── Issue Management ─────────────────────────────────────────────────

    async def create_issue(self, issue_data: Any) -> Any:
        from jira_api.models.issue import Issue

        json_data = issue_data.to_jira_format()
        data = await self._make_request("POST", "issue", json_data=json_data)
        issue_key = data.get("key")
        if not issue_key:
            raise JiraAPIError("Issue created but key not returned")
        return await self.get_issue(issue_key)

    async def get_issue(self, issue_key: str) -> Any:
        from jira_api.models.issue import Issue

        data = await self._make_request("GET", f"issue/{issue_key}")
        return Issue(**data)

    async def update_issue(self, issue_key: str, update_data: Any) -> None:
        json_data = update_data.to_jira_format()
        await self._make_request("PUT", f"issue/{issue_key}", json_data=json_data)

    async def assign_issue(self, issue_key: str, assignment: Any) -> None:
        json_data = assignment.to_jira_format()
        await self._make_request("PUT", f"issue/{issue_key}/assignee", json_data=json_data)

    async def get_issue_transitions(self, issue_key: str) -> list[Any]:
        from jira_api.models.issue import IssueTransition

        data = await self._make_request("GET", f"issue/{issue_key}/transitions")
        return [IssueTransition(**t) for t in data.get("transitions", [])]

    async def transition_issue(self, issue_key: str, transition_request: Any) -> None:
        json_data = transition_request.to_jira_format()
        await self._make_request("POST", f"issue/{issue_key}/transitions", json_data=json_data)

    # ── Project Management ───────────────────────────────────────────────

    async def get_project(self, project_key: str) -> Any:
        from jira_api.models.project import Project

        data = await self._make_request("GET", f"project/{project_key}")
        return Project(**data)

    async def get_project_versions(self, project_key: str) -> list[Any]:
        from jira_api.models.project import ProjectVersion

        data = await self._make_request("GET", f"project/{project_key}/versions")
        return [ProjectVersion(**v) for v in data]

    async def create_project_version(self, version_data: Any) -> Any:
        from jira_api.models.project import ProjectVersion

        json_data = version_data.model_dump(exclude_unset=True)
        data = await self._make_request("POST", "version", json_data=json_data)
        return ProjectVersion(**data)

    async def get_issue_types(self) -> list[dict[str, Any]]:
        return await self._make_request("GET", "issuetype")

    async def get_project_issue_types(self, project_key: str) -> list[dict[str, Any]]:
        project_data = await self._make_request("GET", f"project/{project_key}")
        return project_data.get("issueTypes", [])

    async def get_issue_type_id_by_name(self, project_key: str, issue_type_name: str) -> str:
        issue_types = await self.get_project_issue_types(project_key)
        for it in issue_types:
            if it.get("name", "").lower() == issue_type_name.lower():
                return it["id"]
        available = [it.get("name", "") for it in issue_types]
        raise JiraValidationError(
            f"Issue type '{issue_type_name}' not found in project '{project_key}'. "
            f"Available types: {', '.join(available)}"
        )
