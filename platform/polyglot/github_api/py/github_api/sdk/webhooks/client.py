"""
Webhooks domain client for the GitHub API.

Provides methods for creating, updating, deleting, testing, and
pinging repository webhooks.
"""

from __future__ import annotations

import logging
from typing import Any, TYPE_CHECKING

from github_api.sdk.errors import ValidationError
from github_api.sdk.validation import validate_repository_name, validate_username

if TYPE_CHECKING:
    from github_api.sdk.client import GitHubClient

__all__ = ["WebhooksClient"]


class WebhooksClient:
    """Client for GitHub Webhooks API operations."""

    def __init__(self, client: GitHubClient) -> None:
        """Initialize with a GitHubClient instance.

        Args:
            client: The base HTTP client.
        """
        self._client = client
        self._logger = logging.getLogger("github_api.sdk.webhooks")

    def _repo_path(self, owner: str, repo: str) -> str:
        """Build the base repo path with validation."""
        validate_username(owner)
        validate_repository_name(repo)
        return f"/repos/{owner}/{repo}"

    async def list(
        self,
        owner: str,
        repo: str,
        *,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """List repository webhooks.

        Args:
            owner: Repository owner.
            repo: Repository name.
            params: Optional query parameters (per_page, page).

        Returns:
            List of webhook data.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Listing webhooks for %s/%s", owner, repo)
        return await self._client.get(f"{base}/hooks", params=params)

    async def get(self, owner: str, repo: str, hook_id: int) -> dict[str, Any]:
        """Get a specific webhook.

        Args:
            owner: Repository owner.
            repo: Repository name.
            hook_id: Webhook ID.

        Returns:
            Webhook data.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Getting webhook %d for %s/%s", hook_id, owner, repo)
        return await self._client.get(f"{base}/hooks/{hook_id}")

    async def create(
        self, owner: str, repo: str, data: dict[str, Any]
    ) -> dict[str, Any]:
        """Create a repository webhook.

        Args:
            owner: Repository owner.
            repo: Repository name.
            data: Webhook configuration (config, events, active).

        Returns:
            Created webhook data.
        """
        base = self._repo_path(owner, repo)
        self.validate_config(data.get("config", {}))
        self._logger.info("Creating webhook for %s/%s", owner, repo)
        return await self._client.post(f"{base}/hooks", json=data)

    async def update(
        self, owner: str, repo: str, hook_id: int, data: dict[str, Any]
    ) -> dict[str, Any]:
        """Update a repository webhook.

        Args:
            owner: Repository owner.
            repo: Repository name.
            hook_id: Webhook ID.
            data: Fields to update.

        Returns:
            Updated webhook data.
        """
        base = self._repo_path(owner, repo)
        if "config" in data:
            self.validate_config(data["config"])
        self._logger.info("Updating webhook %d for %s/%s", hook_id, owner, repo)
        return await self._client.patch(f"{base}/hooks/{hook_id}", json=data)

    async def delete(self, owner: str, repo: str, hook_id: int) -> dict[str, Any]:
        """Delete a repository webhook.

        Args:
            owner: Repository owner.
            repo: Repository name.
            hook_id: Webhook ID.

        Returns:
            Empty dict on success (204).
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Deleting webhook %d for %s/%s", hook_id, owner, repo)
        return await self._client.delete(f"{base}/hooks/{hook_id}")

    async def test(self, owner: str, repo: str, hook_id: int) -> dict[str, Any]:
        """Trigger a test delivery for a webhook.

        This sends the latest push event for the repository.

        Args:
            owner: Repository owner.
            repo: Repository name.
            hook_id: Webhook ID.

        Returns:
            Empty dict on success (204).
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Testing webhook %d for %s/%s", hook_id, owner, repo)
        return await self._client.post(f"{base}/hooks/{hook_id}/tests")

    async def ping(self, owner: str, repo: str, hook_id: int) -> dict[str, Any]:
        """Ping a repository webhook.

        Sends a ping event to verify the webhook is configured correctly.

        Args:
            owner: Repository owner.
            repo: Repository name.
            hook_id: Webhook ID.

        Returns:
            Empty dict on success (204).
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Pinging webhook %d for %s/%s", hook_id, owner, repo)
        return await self._client.post(f"{base}/hooks/{hook_id}/pings")

    @staticmethod
    def validate_config(config: dict[str, Any]) -> None:
        """Validate webhook configuration.

        Args:
            config: Webhook config dictionary.

        Raises:
            ValidationError: If the configuration is invalid.
        """
        if not config:
            return  # Allow empty config for partial updates

        url = config.get("url", "")
        if url and not url.startswith(("http://", "https://")):
            raise ValidationError(
                f"Webhook URL must use HTTP or HTTPS: {url!r}",
                errors=[{"field": "config.url", "code": "invalid"}],
            )

        content_type = config.get("content_type", "json")
        if content_type not in ("json", "form"):
            raise ValidationError(
                f"Webhook content_type must be 'json' or 'form', got {content_type!r}",
                errors=[{"field": "config.content_type", "code": "invalid"}],
            )

        insecure_ssl = config.get("insecure_ssl", "0")
        if str(insecure_ssl) not in ("0", "1"):
            raise ValidationError(
                f"insecure_ssl must be '0' or '1', got {insecure_ssl!r}",
                errors=[{"field": "config.insecure_ssl", "code": "invalid"}],
            )
