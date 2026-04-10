"""
Security domain client for the GitHub API.

Provides methods for managing vulnerability alerts, security analysis
settings, and repository rulesets.
"""

from __future__ import annotations

import logging
from typing import Any, TYPE_CHECKING

from github_api.sdk.validation import validate_repository_name, validate_username

if TYPE_CHECKING:
    from github_api.sdk.client import GitHubClient

__all__ = ["SecurityClient"]


class SecurityClient:
    """Client for GitHub Security API operations."""

    def __init__(self, client: GitHubClient) -> None:
        """Initialize with a GitHubClient instance.

        Args:
            client: The base HTTP client.
        """
        self._client = client
        self._logger = logging.getLogger("github_api.sdk.security")

    def _repo_path(self, owner: str, repo: str) -> str:
        """Build the base repo path with validation."""
        validate_username(owner)
        validate_repository_name(repo)
        return f"/repos/{owner}/{repo}"

    # -- Security Analysis --

    async def get_security_analysis(
        self, owner: str, repo: str
    ) -> dict[str, Any]:
        """Get repository security and analysis settings.

        Args:
            owner: Repository owner.
            repo: Repository name.

        Returns:
            Security analysis configuration from the repository data.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Getting security analysis for %s/%s", owner, repo)
        repo_data = await self._client.get(base)
        return {
            "security_and_analysis": repo_data.get("security_and_analysis", {}),
        }

    async def update_security_analysis(
        self, owner: str, repo: str, data: dict[str, Any]
    ) -> dict[str, Any]:
        """Update repository security and analysis settings.

        Args:
            owner: Repository owner.
            repo: Repository name.
            data: Security analysis configuration to update.

        Returns:
            Updated repository data.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Updating security analysis for %s/%s", owner, repo)
        return await self._client.patch(
            base, json={"security_and_analysis": data}
        )

    # -- Vulnerability Alerts --

    async def get_vulnerability_alerts(
        self, owner: str, repo: str
    ) -> dict[str, Any]:
        """Check if vulnerability alerts are enabled.

        Args:
            owner: Repository owner.
            repo: Repository name.

        Returns:
            Dict with 'enabled' field.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Checking vulnerability alerts for %s/%s", owner, repo)
        try:
            await self._client.get(f"{base}/vulnerability-alerts")
            return {"enabled": True}
        except Exception:
            return {"enabled": False}

    async def enable_vulnerability_alerts(
        self, owner: str, repo: str
    ) -> dict[str, Any]:
        """Enable vulnerability alerts for a repository.

        Args:
            owner: Repository owner.
            repo: Repository name.

        Returns:
            Empty dict on success (204).
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Enabling vulnerability alerts for %s/%s", owner, repo)
        return await self._client.put(f"{base}/vulnerability-alerts")

    async def disable_vulnerability_alerts(
        self, owner: str, repo: str
    ) -> dict[str, Any]:
        """Disable vulnerability alerts for a repository.

        Args:
            owner: Repository owner.
            repo: Repository name.

        Returns:
            Empty dict on success (204).
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Disabling vulnerability alerts for %s/%s", owner, repo)
        return await self._client.delete(f"{base}/vulnerability-alerts")

    # -- Rulesets --

    async def list_rulesets(
        self,
        owner: str,
        repo: str,
        *,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """List repository rulesets.

        Args:
            owner: Repository owner.
            repo: Repository name.
            params: Optional query parameters (per_page, page, includes_parents).

        Returns:
            List of ruleset data.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Listing rulesets for %s/%s", owner, repo)
        return await self._client.get(f"{base}/rulesets", params=params)

    async def get_ruleset(
        self, owner: str, repo: str, ruleset_id: int
    ) -> dict[str, Any]:
        """Get a specific repository ruleset.

        Args:
            owner: Repository owner.
            repo: Repository name.
            ruleset_id: Ruleset ID.

        Returns:
            Ruleset data.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Getting ruleset %d for %s/%s", ruleset_id, owner, repo)
        return await self._client.get(f"{base}/rulesets/{ruleset_id}")

    async def create_ruleset(
        self, owner: str, repo: str, data: dict[str, Any]
    ) -> dict[str, Any]:
        """Create a repository ruleset.

        Args:
            owner: Repository owner.
            repo: Repository name.
            data: Ruleset configuration (name, target, enforcement, rules, conditions, etc.).

        Returns:
            Created ruleset data.
        """
        base = self._repo_path(owner, repo)
        self._logger.info(
            "Creating ruleset '%s' in %s/%s", data.get("name", "unknown"), owner, repo
        )
        return await self._client.post(f"{base}/rulesets", json=data)

    async def update_ruleset(
        self, owner: str, repo: str, ruleset_id: int, data: dict[str, Any]
    ) -> dict[str, Any]:
        """Update a repository ruleset.

        Args:
            owner: Repository owner.
            repo: Repository name.
            ruleset_id: Ruleset ID.
            data: Fields to update.

        Returns:
            Updated ruleset data.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Updating ruleset %d in %s/%s", ruleset_id, owner, repo)
        return await self._client.put(f"{base}/rulesets/{ruleset_id}", json=data)

    async def delete_ruleset(
        self, owner: str, repo: str, ruleset_id: int
    ) -> dict[str, Any]:
        """Delete a repository ruleset.

        Args:
            owner: Repository owner.
            repo: Repository name.
            ruleset_id: Ruleset ID.

        Returns:
            Empty dict on success (204).
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Deleting ruleset %d in %s/%s", ruleset_id, owner, repo)
        return await self._client.delete(f"{base}/rulesets/{ruleset_id}")
