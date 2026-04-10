"""
Repository domain client for the GitHub API.

Provides methods for creating, reading, updating, and deleting repositories,
as well as managing topics, forks, stars, and subscriptions.
"""

from __future__ import annotations

import logging
from typing import Any, TYPE_CHECKING

from github_api.sdk.validation import validate_repository_name, validate_username

if TYPE_CHECKING:
    from github_api.sdk.client import GitHubClient

__all__ = ["ReposClient"]


class ReposClient:
    """Client for GitHub Repository API operations.

    Wraps the base GitHubClient to provide typed, validated methods
    for all repository-related endpoints.
    """

    def __init__(self, client: GitHubClient) -> None:
        """Initialize with a GitHubClient instance.

        Args:
            client: The base HTTP client.
        """
        self._client = client
        self._logger = logging.getLogger("github_api.sdk.repos")

    async def get(self, owner: str, repo: str) -> dict[str, Any]:
        """Get a repository by owner and name.

        Args:
            owner: Repository owner (user or org).
            repo: Repository name.

        Returns:
            Repository data.
        """
        validate_username(owner)
        validate_repository_name(repo)
        self._logger.info("Getting repository %s/%s", owner, repo)
        return await self._client.get(f"/repos/{owner}/{repo}")

    async def list_for_user(
        self, username: str, *, params: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        """List public repositories for a user.

        Args:
            username: GitHub username.
            params: Optional query parameters (type, sort, direction, per_page, page).

        Returns:
            List of repositories.
        """
        validate_username(username)
        self._logger.info("Listing repositories for user %s", username)
        return await self._client.get(f"/users/{username}/repos", params=params)

    async def list_for_authenticated_user(
        self, *, params: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        """List repositories for the authenticated user.

        Args:
            params: Optional query parameters.

        Returns:
            List of repositories.
        """
        self._logger.info("Listing repositories for authenticated user")
        return await self._client.get("/user/repos", params=params)

    async def list_for_org(
        self, org: str, *, params: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        """List repositories for an organization.

        Args:
            org: Organization name.
            params: Optional query parameters.

        Returns:
            List of repositories.
        """
        validate_username(org)
        self._logger.info("Listing repositories for org %s", org)
        return await self._client.get(f"/orgs/{org}/repos", params=params)

    async def create(self, data: dict[str, Any]) -> dict[str, Any]:
        """Create a repository for the authenticated user.

        Args:
            data: Repository creation parameters.

        Returns:
            Created repository data.
        """
        if "name" in data:
            validate_repository_name(data["name"])
        self._logger.info("Creating repository %s", data.get("name", "unknown"))
        return await self._client.post("/user/repos", json=data)

    async def create_in_org(self, org: str, data: dict[str, Any]) -> dict[str, Any]:
        """Create a repository in an organization.

        Args:
            org: Organization name.
            data: Repository creation parameters.

        Returns:
            Created repository data.
        """
        validate_username(org)
        if "name" in data:
            validate_repository_name(data["name"])
        self._logger.info("Creating repository %s in org %s", data.get("name", "unknown"), org)
        return await self._client.post(f"/orgs/{org}/repos", json=data)

    async def update(self, owner: str, repo: str, data: dict[str, Any]) -> dict[str, Any]:
        """Update a repository.

        Args:
            owner: Repository owner.
            repo: Repository name.
            data: Fields to update.

        Returns:
            Updated repository data.
        """
        validate_username(owner)
        validate_repository_name(repo)
        self._logger.info("Updating repository %s/%s", owner, repo)
        return await self._client.patch(f"/repos/{owner}/{repo}", json=data)

    async def delete(self, owner: str, repo: str) -> dict[str, Any]:
        """Delete a repository.

        Args:
            owner: Repository owner.
            repo: Repository name.

        Returns:
            Empty dict on success.
        """
        validate_username(owner)
        validate_repository_name(repo)
        self._logger.info("Deleting repository %s/%s", owner, repo)
        return await self._client.delete(f"/repos/{owner}/{repo}")

    async def get_topics(self, owner: str, repo: str) -> dict[str, Any]:
        """Get repository topics.

        Args:
            owner: Repository owner.
            repo: Repository name.

        Returns:
            Topics data with 'names' list.
        """
        validate_username(owner)
        validate_repository_name(repo)
        self._logger.info("Getting topics for %s/%s", owner, repo)
        return await self._client.get(f"/repos/{owner}/{repo}/topics")

    async def replace_topics(
        self, owner: str, repo: str, names: list[str]
    ) -> dict[str, Any]:
        """Replace all repository topics.

        Args:
            owner: Repository owner.
            repo: Repository name.
            names: New list of topic names.

        Returns:
            Updated topics data.
        """
        validate_username(owner)
        validate_repository_name(repo)
        self._logger.info("Replacing topics for %s/%s with %s", owner, repo, names)
        return await self._client.put(
            f"/repos/{owner}/{repo}/topics", json={"names": names}
        )

    async def get_languages(self, owner: str, repo: str) -> dict[str, Any]:
        """Get repository language breakdown.

        Args:
            owner: Repository owner.
            repo: Repository name.

        Returns:
            Language-to-bytes mapping.
        """
        validate_username(owner)
        validate_repository_name(repo)
        self._logger.info("Getting languages for %s/%s", owner, repo)
        return await self._client.get(f"/repos/{owner}/{repo}/languages")

    async def list_contributors(
        self,
        owner: str,
        repo: str,
        *,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """List repository contributors.

        Args:
            owner: Repository owner.
            repo: Repository name.
            params: Optional query parameters.

        Returns:
            List of contributor data.
        """
        validate_username(owner)
        validate_repository_name(repo)
        self._logger.info("Listing contributors for %s/%s", owner, repo)
        return await self._client.get(
            f"/repos/{owner}/{repo}/contributors", params=params
        )

    async def fork(
        self,
        owner: str,
        repo: str,
        *,
        options: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Create a fork of a repository.

        Args:
            owner: Repository owner.
            repo: Repository name.
            options: Optional fork configuration (organization, name, default_branch_only).

        Returns:
            Created fork data.
        """
        validate_username(owner)
        validate_repository_name(repo)
        self._logger.info("Forking repository %s/%s", owner, repo)
        return await self._client.post(
            f"/repos/{owner}/{repo}/forks", json=options
        )

    async def list_forks(
        self,
        owner: str,
        repo: str,
        *,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """List forks of a repository.

        Args:
            owner: Repository owner.
            repo: Repository name.
            params: Optional query parameters (sort, per_page, page).

        Returns:
            List of fork data.
        """
        validate_username(owner)
        validate_repository_name(repo)
        self._logger.info("Listing forks for %s/%s", owner, repo)
        return await self._client.get(
            f"/repos/{owner}/{repo}/forks", params=params
        )

    async def transfer(
        self,
        owner: str,
        repo: str,
        new_owner: str,
        *,
        options: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Transfer a repository to a new owner.

        Args:
            owner: Current repository owner.
            repo: Repository name.
            new_owner: New owner (user or org).
            options: Additional transfer options (team_ids).

        Returns:
            Transferred repository data.
        """
        validate_username(owner)
        validate_repository_name(repo)
        validate_username(new_owner)
        body: dict[str, Any] = {"new_owner": new_owner}
        if options:
            body.update(options)
        self._logger.info("Transferring %s/%s to %s", owner, repo, new_owner)
        return await self._client.post(
            f"/repos/{owner}/{repo}/transfer", json=body
        )

    async def star(self, owner: str, repo: str) -> dict[str, Any]:
        """Star a repository for the authenticated user.

        Args:
            owner: Repository owner.
            repo: Repository name.

        Returns:
            Empty dict on success (204).
        """
        validate_username(owner)
        validate_repository_name(repo)
        self._logger.info("Starring %s/%s", owner, repo)
        return await self._client.put(f"/user/starred/{owner}/{repo}")

    async def unstar(self, owner: str, repo: str) -> dict[str, Any]:
        """Unstar a repository for the authenticated user.

        Args:
            owner: Repository owner.
            repo: Repository name.

        Returns:
            Empty dict on success (204).
        """
        validate_username(owner)
        validate_repository_name(repo)
        self._logger.info("Unstarring %s/%s", owner, repo)
        return await self._client.delete(f"/user/starred/{owner}/{repo}")

    async def is_starred(self, owner: str, repo: str) -> bool:
        """Check if the authenticated user has starred a repository.

        Args:
            owner: Repository owner.
            repo: Repository name.

        Returns:
            True if starred, False otherwise.
        """
        validate_username(owner)
        validate_repository_name(repo)
        self._logger.info("Checking star status for %s/%s", owner, repo)
        try:
            await self._client.get(f"/user/starred/{owner}/{repo}")
            return True
        except Exception:
            return False

    async def watch(self, owner: str, repo: str) -> dict[str, Any]:
        """Watch (subscribe to) a repository.

        Args:
            owner: Repository owner.
            repo: Repository name.

        Returns:
            Subscription data.
        """
        validate_username(owner)
        validate_repository_name(repo)
        self._logger.info("Watching %s/%s", owner, repo)
        return await self._client.put(
            f"/repos/{owner}/{repo}/subscription",
            json={"subscribed": True},
        )

    async def unwatch(self, owner: str, repo: str) -> dict[str, Any]:
        """Unwatch (unsubscribe from) a repository.

        Args:
            owner: Repository owner.
            repo: Repository name.

        Returns:
            Empty dict on success (204).
        """
        validate_username(owner)
        validate_repository_name(repo)
        self._logger.info("Unwatching %s/%s", owner, repo)
        return await self._client.delete(f"/repos/{owner}/{repo}/subscription")

    async def get_subscription(self, owner: str, repo: str) -> dict[str, Any]:
        """Get the authenticated user's subscription for a repository.

        Args:
            owner: Repository owner.
            repo: Repository name.

        Returns:
            Subscription data.
        """
        validate_username(owner)
        validate_repository_name(repo)
        self._logger.info("Getting subscription for %s/%s", owner, repo)
        return await self._client.get(f"/repos/{owner}/{repo}/subscription")

    async def get_commits(
        self,
        owner: str,
        repo: str,
        *,
        params: dict[str, Any] | None = None,
    ) -> list[dict[str, Any]]:
        """List commits for a repository.

        Args:
            owner: Repository owner.
            repo: Repository name.
            params: Optional query parameters (path, sha, per_page, page).

        Returns:
            List of commit data.
        """
        validate_username(owner)
        validate_repository_name(repo)
        self._logger.info("Getting commits for %s/%s", owner, repo)
        return await self._client.get(f"/repos/{owner}/{repo}/commits", params=params)

    async def get_commit(
        self,
        owner: str,
        repo: str,
        ref: str,
    ) -> dict[str, Any]:
        """Get a single commit by ref (SHA, branch, or tag).

        Returns full commit details including file-level stats.

        Args:
            owner: Repository owner.
            repo: Repository name.
            ref: Commit SHA, branch name, or tag.

        Returns:
            Full commit data with files and stats.
        """
        validate_username(owner)
        validate_repository_name(repo)
        self._logger.info("Getting commit for %s/%s ref=%s", owner, repo, ref)
        return await self._client.get(f"/repos/{owner}/{repo}/commits/{ref}")

    async def list_commit_pulls(
        self,
        owner: str,
        repo: str,
        commit_sha: str,
    ) -> list[dict[str, Any]]:
        """List pull requests associated with a commit.

        Args:
            owner: Repository owner.
            repo: Repository name.
            commit_sha: Commit SHA.

        Returns:
            List of associated pull request data.
        """
        validate_username(owner)
        validate_repository_name(repo)
        self._logger.info("Listing pulls for commit %s in %s/%s", commit_sha, owner, repo)
        return await self._client.get(f"/repos/{owner}/{repo}/commits/{commit_sha}/pulls")

    async def get_contents(
        self,
        owner: str,
        repo: str,
        path: str = "",
        *,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any] | list[dict[str, Any]]:
        """Get repository contents at a path.

        Args:
            owner: Repository owner.
            repo: Repository name.
            path: Path within the repository (empty for root).
            params: Optional query parameters (e.g. ref for branch/tag/sha).

        Returns:
            Contents data (array for directories, object for files).
        """
        validate_username(owner)
        validate_repository_name(repo)
        self._logger.info("Getting contents for %s/%s path=%s", owner, repo, path)
        encoded = "/".join(p for p in path.split("/") if p) if path else ""
        url = f"/repos/{owner}/{repo}/contents"
        if encoded:
            url = f"{url}/{encoded}"
        return await self._client.get(url, params=params)

    async def get_git_tree(
        self,
        owner: str,
        repo: str,
        tree_sha: str,
        *,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Get a Git tree by SHA or branch name.

        Args:
            owner: Repository owner.
            repo: Repository name.
            tree_sha: Tree SHA or branch name.
            params: Optional query parameters (recursive).

        Returns:
            Tree data with entries including modes.
        """
        validate_username(owner)
        validate_repository_name(repo)
        self._logger.info("Getting git tree for %s/%s sha=%s", owner, repo, tree_sha)
        return await self._client.get(
            f"/repos/{owner}/{repo}/git/trees/{tree_sha}", params=params
        )
