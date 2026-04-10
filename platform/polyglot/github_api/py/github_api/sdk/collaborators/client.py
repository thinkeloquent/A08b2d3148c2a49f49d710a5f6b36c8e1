"""
Collaborators domain client for the GitHub API.

Provides methods for managing repository collaborators, permissions,
invitations, and bulk operations.
"""

from __future__ import annotations

import logging
from typing import Any, TYPE_CHECKING

from github_api.sdk.collaborators.models import Permission
from github_api.sdk.validation import validate_repository_name, validate_username

if TYPE_CHECKING:
    from github_api.sdk.client import GitHubClient

__all__ = ["CollaboratorsClient"]


class CollaboratorsClient:
    """Client for GitHub Collaborators API operations."""

    def __init__(self, client: GitHubClient) -> None:
        """Initialize with a GitHubClient instance.

        Args:
            client: The base HTTP client.
        """
        self._client = client
        self._logger = logging.getLogger("github_api.sdk.collaborators")

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
        """List repository collaborators.

        Args:
            owner: Repository owner.
            repo: Repository name.
            params: Optional query parameters (affiliation, permission, per_page, page).

        Returns:
            List of collaborator data.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Listing collaborators for %s/%s", owner, repo)
        return await self._client.get(f"{base}/collaborators", params=params)

    async def add(
        self,
        owner: str,
        repo: str,
        username: str,
        *,
        permission: str = "push",
    ) -> dict[str, Any]:
        """Add a collaborator to a repository.

        Args:
            owner: Repository owner.
            repo: Repository name.
            username: Username to add.
            permission: Permission level (pull, triage, push, maintain, admin).

        Returns:
            Invitation data or empty dict if already a collaborator.
        """
        base = self._repo_path(owner, repo)
        validate_username(username)
        self._logger.info(
            "Adding collaborator %s to %s/%s with permission %s",
            username, owner, repo, permission,
        )
        return await self._client.put(
            f"{base}/collaborators/{username}",
            json={"permission": permission},
        )

    async def remove(self, owner: str, repo: str, username: str) -> dict[str, Any]:
        """Remove a collaborator from a repository.

        Args:
            owner: Repository owner.
            repo: Repository name.
            username: Username to remove.

        Returns:
            Empty dict on success (204).
        """
        base = self._repo_path(owner, repo)
        validate_username(username)
        self._logger.info("Removing collaborator %s from %s/%s", username, owner, repo)
        return await self._client.delete(f"{base}/collaborators/{username}")

    async def check_permission(
        self, owner: str, repo: str, username: str
    ) -> dict[str, Any]:
        """Check a user's permission level on a repository.

        Args:
            owner: Repository owner.
            repo: Repository name.
            username: Username to check.

        Returns:
            Permission data including 'permission' field.
        """
        base = self._repo_path(owner, repo)
        validate_username(username)
        self._logger.info(
            "Checking permission for %s on %s/%s", username, owner, repo
        )
        return await self._client.get(f"{base}/collaborators/{username}/permission")

    async def has_permission(
        self,
        owner: str,
        repo: str,
        username: str,
        required: str | Permission,
    ) -> bool:
        """Check if a user has at least the specified permission level.

        Uses the Permission enum hierarchy for comparison.

        Args:
            owner: Repository owner.
            repo: Repository name.
            username: Username to check.
            required: Minimum required permission level.

        Returns:
            True if the user has at least the required permission.
        """
        if isinstance(required, str):
            required = Permission(required)

        result = await self.check_permission(owner, repo, username)
        actual_permission_str = result.get("permission", "none")
        try:
            actual = Permission(actual_permission_str)
        except ValueError:
            actual = Permission.NONE

        return actual >= required

    async def list_invitations(
        self,
        owner: str,
        repo: str,
        *,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """List pending collaboration invitations.

        Args:
            owner: Repository owner.
            repo: Repository name.
            params: Optional query parameters.

        Returns:
            List of invitation data.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Listing invitations for %s/%s", owner, repo)
        return await self._client.get(f"{base}/invitations", params=params)

    async def update_invitation(
        self,
        owner: str,
        repo: str,
        invitation_id: int,
        *,
        permission: str = "push",
    ) -> dict[str, Any]:
        """Update a pending collaboration invitation.

        Args:
            owner: Repository owner.
            repo: Repository name.
            invitation_id: Invitation ID to update.
            permission: New permission level.

        Returns:
            Updated invitation data.
        """
        base = self._repo_path(owner, repo)
        self._logger.info(
            "Updating invitation %d for %s/%s to permission %s",
            invitation_id, owner, repo, permission,
        )
        return await self._client.patch(
            f"{base}/invitations/{invitation_id}",
            json={"permissions": permission},
        )

    async def delete_invitation(
        self, owner: str, repo: str, invitation_id: int
    ) -> dict[str, Any]:
        """Delete a pending collaboration invitation.

        Args:
            owner: Repository owner.
            repo: Repository name.
            invitation_id: Invitation ID to delete.

        Returns:
            Empty dict on success (204).
        """
        base = self._repo_path(owner, repo)
        self._logger.info(
            "Deleting invitation %d for %s/%s", invitation_id, owner, repo
        )
        return await self._client.delete(f"{base}/invitations/{invitation_id}")

    async def bulk_add(
        self,
        owner: str,
        repo: str,
        users: list[dict[str, str]],
    ) -> list[dict[str, Any]]:
        """Add multiple collaborators in bulk.

        Args:
            owner: Repository owner.
            repo: Repository name.
            users: List of dicts with 'username' and optional 'permission' keys.

        Returns:
            List of results for each user (success or error).
        """
        self._logger.info(
            "Bulk adding %d collaborators to %s/%s", len(users), owner, repo
        )
        results: list[dict[str, Any]] = []
        for user_spec in users:
            username = user_spec["username"]
            permission = user_spec.get("permission", "push")
            try:
                result = await self.add(
                    owner, repo, username, permission=permission
                )
                results.append({
                    "username": username,
                    "status": "success",
                    "data": result,
                })
            except Exception as exc:
                results.append({
                    "username": username,
                    "status": "error",
                    "error": str(exc),
                })
        return results

    async def get_stats(self, owner: str, repo: str) -> dict[str, int]:
        """Get collaborator permission statistics for a repository.

        Args:
            owner: Repository owner.
            repo: Repository name.

        Returns:
            Dictionary with counts by permission level.
        """
        self._logger.info("Getting collaborator stats for %s/%s", owner, repo)
        result = await self.list(owner, repo, params={"per_page": "100"})

        stats = {
            "total": 0,
            "admins": 0,
            "maintainers": 0,
            "writers": 0,
            "triagers": 0,
            "readers": 0,
        }

        items = result.get("data", result) if isinstance(result, dict) else result
        if not isinstance(items, list):
            items = [items] if items else []

        for collab in items:
            stats["total"] += 1
            perms = collab.get("permissions", {})
            if perms.get("admin"):
                stats["admins"] += 1
            elif perms.get("maintain"):
                stats["maintainers"] += 1
            elif perms.get("push"):
                stats["writers"] += 1
            elif perms.get("triage"):
                stats["triagers"] += 1
            else:
                stats["readers"] += 1

        return stats
