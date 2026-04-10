"""
Tags and Releases domain client for the GitHub API.

Provides methods for managing repository tags, releases, tag protections,
and semantic version utilities.
"""

from __future__ import annotations

import logging
from typing import Any, TYPE_CHECKING

from github_api.sdk.tags.models import SemanticVersion, parse_semantic_version
from github_api.sdk.validation import validate_repository_name, validate_username

if TYPE_CHECKING:
    from github_api.sdk.client import GitHubClient

__all__ = ["TagsClient"]


class TagsClient:
    """Client for GitHub Tags and Releases API operations."""

    def __init__(self, client: GitHubClient) -> None:
        """Initialize with a GitHubClient instance.

        Args:
            client: The base HTTP client.
        """
        self._client = client
        self._logger = logging.getLogger("github_api.sdk.tags")

    def _repo_path(self, owner: str, repo: str) -> str:
        """Build the base repo path with validation."""
        validate_username(owner)
        validate_repository_name(repo)
        return f"/repos/{owner}/{repo}"

    # -- Tags --

    async def list_tags(
        self,
        owner: str,
        repo: str,
        *,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """List repository tags.

        Args:
            owner: Repository owner.
            repo: Repository name.
            params: Optional query parameters (per_page, page).

        Returns:
            List of tag data.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Listing tags for %s/%s", owner, repo)
        return await self._client.get(f"{base}/tags", params=params)

    async def get_tag(self, owner: str, repo: str, tag_sha: str) -> dict[str, Any]:
        """Get a tag object by SHA.

        Args:
            owner: Repository owner.
            repo: Repository name.
            tag_sha: The SHA of the tag object.

        Returns:
            Tag object data.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Getting tag %s in %s/%s", tag_sha, owner, repo)
        return await self._client.get(f"{base}/git/tags/{tag_sha}")

    # -- Releases --

    async def create_release(
        self, owner: str, repo: str, data: dict[str, Any]
    ) -> dict[str, Any]:
        """Create a new release.

        Args:
            owner: Repository owner.
            repo: Repository name.
            data: Release parameters (tag_name, name, body, draft, prerelease, etc.).

        Returns:
            Created release data.
        """
        base = self._repo_path(owner, repo)
        self._logger.info(
            "Creating release %s in %s/%s",
            data.get("tag_name", "unknown"), owner, repo,
        )
        return await self._client.post(f"{base}/releases", json=data)

    async def get_release(
        self, owner: str, repo: str, release_id: int
    ) -> dict[str, Any]:
        """Get a release by ID.

        Args:
            owner: Repository owner.
            repo: Repository name.
            release_id: Release ID.

        Returns:
            Release data.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Getting release %d in %s/%s", release_id, owner, repo)
        return await self._client.get(f"{base}/releases/{release_id}")

    async def get_latest_release(self, owner: str, repo: str) -> dict[str, Any]:
        """Get the latest published release.

        Args:
            owner: Repository owner.
            repo: Repository name.

        Returns:
            Latest release data.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Getting latest release for %s/%s", owner, repo)
        return await self._client.get(f"{base}/releases/latest")

    async def get_release_by_tag(
        self, owner: str, repo: str, tag: str
    ) -> dict[str, Any]:
        """Get a release by its tag name.

        Args:
            owner: Repository owner.
            repo: Repository name.
            tag: Tag name.

        Returns:
            Release data.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Getting release for tag %s in %s/%s", tag, owner, repo)
        return await self._client.get(f"{base}/releases/tags/{tag}")

    async def update_release(
        self, owner: str, repo: str, release_id: int, data: dict[str, Any]
    ) -> dict[str, Any]:
        """Update an existing release.

        Args:
            owner: Repository owner.
            repo: Repository name.
            release_id: Release ID.
            data: Fields to update.

        Returns:
            Updated release data.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Updating release %d in %s/%s", release_id, owner, repo)
        return await self._client.patch(f"{base}/releases/{release_id}", json=data)

    async def delete_release(
        self, owner: str, repo: str, release_id: int
    ) -> dict[str, Any]:
        """Delete a release.

        Args:
            owner: Repository owner.
            repo: Repository name.
            release_id: Release ID.

        Returns:
            Empty dict on success (204).
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Deleting release %d in %s/%s", release_id, owner, repo)
        return await self._client.delete(f"{base}/releases/{release_id}")

    async def list_releases(
        self,
        owner: str,
        repo: str,
        *,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """List repository releases.

        Args:
            owner: Repository owner.
            repo: Repository name.
            params: Optional query parameters (per_page, page).

        Returns:
            List of release data.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Listing releases for %s/%s", owner, repo)
        return await self._client.get(f"{base}/releases", params=params)

    # -- Tag Protections --

    async def list_tag_protections(
        self, owner: str, repo: str
    ) -> dict[str, Any]:
        """List tag protection rules.

        Args:
            owner: Repository owner.
            repo: Repository name.

        Returns:
            List of tag protection rules.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Listing tag protections for %s/%s", owner, repo)
        return await self._client.get(f"{base}/tags/protection")

    async def create_tag_protection(
        self, owner: str, repo: str, pattern: str
    ) -> dict[str, Any]:
        """Create a tag protection rule.

        Args:
            owner: Repository owner.
            repo: Repository name.
            pattern: Tag name pattern (glob).

        Returns:
            Created protection rule data.
        """
        base = self._repo_path(owner, repo)
        self._logger.info(
            "Creating tag protection pattern '%s' in %s/%s", pattern, owner, repo
        )
        return await self._client.post(
            f"{base}/tags/protection", json={"pattern": pattern}
        )

    async def delete_tag_protection(
        self, owner: str, repo: str, protection_id: int
    ) -> dict[str, Any]:
        """Delete a tag protection rule.

        Args:
            owner: Repository owner.
            repo: Repository name.
            protection_id: Tag protection rule ID.

        Returns:
            Empty dict on success (204).
        """
        base = self._repo_path(owner, repo)
        self._logger.info(
            "Deleting tag protection %d in %s/%s", protection_id, owner, repo
        )
        return await self._client.delete(f"{base}/tags/protection/{protection_id}")

    # -- Semantic Versioning Utilities --

    @staticmethod
    def parse_semantic_version(version_str: str) -> SemanticVersion | None:
        """Parse a version string into a SemanticVersion.

        Args:
            version_str: Version string (e.g., 'v1.2.3').

        Returns:
            SemanticVersion if parseable, None otherwise.
        """
        return parse_semantic_version(version_str)

    @staticmethod
    def get_next_version(
        current: SemanticVersion,
        bump: str = "patch",
    ) -> SemanticVersion:
        """Calculate the next semantic version.

        Args:
            current: Current version.
            bump: Type of bump ('major', 'minor', 'patch').

        Returns:
            Next version.
        """
        if bump == "major":
            return SemanticVersion(
                major=current.major + 1, minor=0, patch=0,
                raw=f"{current.major + 1}.0.0",
            )
        elif bump == "minor":
            return SemanticVersion(
                major=current.major, minor=current.minor + 1, patch=0,
                raw=f"{current.major}.{current.minor + 1}.0",
            )
        else:
            return SemanticVersion(
                major=current.major, minor=current.minor, patch=current.patch + 1,
                raw=f"{current.major}.{current.minor}.{current.patch + 1}",
            )

    @staticmethod
    def sort_by_version(
        tags: list[dict[str, Any]],
        *,
        descending: bool = True,
    ) -> list[dict[str, Any]]:
        """Sort a list of tag dicts by semantic version.

        Tags that are not valid semver are placed at the end.

        Args:
            tags: List of tag dicts with a 'name' field.
            descending: Sort newest first (default True).

        Returns:
            Sorted list of tag dicts.
        """
        def sort_key(tag: dict[str, Any]) -> tuple[bool, int, int, int]:
            sv = parse_semantic_version(tag.get("name", ""))
            if sv is None:
                return (False, 0, 0, 0)
            return (True, sv.major, sv.minor, sv.patch)

        return sorted(tags, key=sort_key, reverse=descending)
