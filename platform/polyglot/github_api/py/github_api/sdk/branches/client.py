"""
Branches domain client for the GitHub API.

Provides methods for listing, protecting, renaming, merging,
and comparing branches.
"""

from __future__ import annotations

import logging
from typing import Any, TYPE_CHECKING

from github_api.sdk.validation import validate_branch_name, validate_repository_name, validate_username

if TYPE_CHECKING:
    from github_api.sdk.client import GitHubClient

__all__ = ["BranchesClient"]


class BranchesClient:
    """Client for GitHub Branches API operations."""

    def __init__(self, client: GitHubClient) -> None:
        """Initialize with a GitHubClient instance.

        Args:
            client: The base HTTP client.
        """
        self._client = client
        self._logger = logging.getLogger("github_api.sdk.branches")

    def _repo_path(self, owner: str, repo: str) -> str:
        """Build the base repo path."""
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
        """List branches for a repository.

        Args:
            owner: Repository owner.
            repo: Repository name.
            params: Optional query parameters (protected, per_page, page).

        Returns:
            List of branch data.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Listing branches for %s/%s", owner, repo)
        return await self._client.get(f"{base}/branches", params=params)

    async def get(self, owner: str, repo: str, branch: str) -> dict[str, Any]:
        """Get a specific branch.

        Args:
            owner: Repository owner.
            repo: Repository name.
            branch: Branch name.

        Returns:
            Branch data.
        """
        base = self._repo_path(owner, repo)
        validate_branch_name(branch)
        self._logger.info("Getting branch %s/%s:%s", owner, repo, branch)
        return await self._client.get(f"{base}/branches/{branch}")

    async def get_protection(self, owner: str, repo: str, branch: str) -> dict[str, Any]:
        """Get branch protection rules.

        Args:
            owner: Repository owner.
            repo: Repository name.
            branch: Branch name.

        Returns:
            Branch protection configuration.
        """
        base = self._repo_path(owner, repo)
        validate_branch_name(branch)
        self._logger.info("Getting protection for %s/%s:%s", owner, repo, branch)
        return await self._client.get(f"{base}/branches/{branch}/protection")

    async def update_protection(
        self, owner: str, repo: str, branch: str, data: dict[str, Any]
    ) -> dict[str, Any]:
        """Update branch protection rules.

        Args:
            owner: Repository owner.
            repo: Repository name.
            branch: Branch name.
            data: Protection configuration.

        Returns:
            Updated protection data.
        """
        base = self._repo_path(owner, repo)
        validate_branch_name(branch)
        self._logger.info("Updating protection for %s/%s:%s", owner, repo, branch)
        return await self._client.put(f"{base}/branches/{branch}/protection", json=data)

    async def remove_protection(self, owner: str, repo: str, branch: str) -> dict[str, Any]:
        """Remove branch protection.

        Args:
            owner: Repository owner.
            repo: Repository name.
            branch: Branch name.

        Returns:
            Empty dict on success.
        """
        base = self._repo_path(owner, repo)
        validate_branch_name(branch)
        self._logger.info("Removing protection for %s/%s:%s", owner, repo, branch)
        return await self._client.delete(f"{base}/branches/{branch}/protection")

    async def get_status_checks(
        self, owner: str, repo: str, branch: str
    ) -> dict[str, Any]:
        """Get required status checks for a protected branch.

        Args:
            owner: Repository owner.
            repo: Repository name.
            branch: Branch name.

        Returns:
            Status check configuration.
        """
        base = self._repo_path(owner, repo)
        validate_branch_name(branch)
        self._logger.info("Getting status checks for %s/%s:%s", owner, repo, branch)
        return await self._client.get(
            f"{base}/branches/{branch}/protection/required_status_checks"
        )

    async def update_status_checks(
        self, owner: str, repo: str, branch: str, data: dict[str, Any]
    ) -> dict[str, Any]:
        """Update required status checks.

        Args:
            owner: Repository owner.
            repo: Repository name.
            branch: Branch name.
            data: Status check configuration.

        Returns:
            Updated status check data.
        """
        base = self._repo_path(owner, repo)
        validate_branch_name(branch)
        self._logger.info("Updating status checks for %s/%s:%s", owner, repo, branch)
        return await self._client.patch(
            f"{base}/branches/{branch}/protection/required_status_checks",
            json=data,
        )

    async def get_review_protection(
        self, owner: str, repo: str, branch: str
    ) -> dict[str, Any]:
        """Get required pull request reviews protection.

        Args:
            owner: Repository owner.
            repo: Repository name.
            branch: Branch name.

        Returns:
            Review protection configuration.
        """
        base = self._repo_path(owner, repo)
        validate_branch_name(branch)
        self._logger.info("Getting review protection for %s/%s:%s", owner, repo, branch)
        return await self._client.get(
            f"{base}/branches/{branch}/protection/required_pull_request_reviews"
        )

    async def update_review_protection(
        self, owner: str, repo: str, branch: str, data: dict[str, Any]
    ) -> dict[str, Any]:
        """Update required pull request reviews.

        Args:
            owner: Repository owner.
            repo: Repository name.
            branch: Branch name.
            data: Review protection configuration.

        Returns:
            Updated review protection data.
        """
        base = self._repo_path(owner, repo)
        validate_branch_name(branch)
        self._logger.info("Updating review protection for %s/%s:%s", owner, repo, branch)
        return await self._client.patch(
            f"{base}/branches/{branch}/protection/required_pull_request_reviews",
            json=data,
        )

    async def delete_review_protection(
        self, owner: str, repo: str, branch: str
    ) -> dict[str, Any]:
        """Delete required pull request reviews protection.

        Args:
            owner: Repository owner.
            repo: Repository name.
            branch: Branch name.

        Returns:
            Empty dict on success.
        """
        base = self._repo_path(owner, repo)
        validate_branch_name(branch)
        self._logger.info("Deleting review protection for %s/%s:%s", owner, repo, branch)
        return await self._client.delete(
            f"{base}/branches/{branch}/protection/required_pull_request_reviews"
        )

    async def get_admin_enforcement(
        self, owner: str, repo: str, branch: str
    ) -> dict[str, Any]:
        """Get admin enforcement status for branch protection.

        Args:
            owner: Repository owner.
            repo: Repository name.
            branch: Branch name.

        Returns:
            Admin enforcement data.
        """
        base = self._repo_path(owner, repo)
        validate_branch_name(branch)
        self._logger.info("Getting admin enforcement for %s/%s:%s", owner, repo, branch)
        return await self._client.get(
            f"{base}/branches/{branch}/protection/enforce_admins"
        )

    async def set_admin_enforcement(
        self, owner: str, repo: str, branch: str
    ) -> dict[str, Any]:
        """Enable admin enforcement for branch protection.

        Args:
            owner: Repository owner.
            repo: Repository name.
            branch: Branch name.

        Returns:
            Admin enforcement data.
        """
        base = self._repo_path(owner, repo)
        validate_branch_name(branch)
        self._logger.info("Setting admin enforcement for %s/%s:%s", owner, repo, branch)
        return await self._client.post(
            f"{base}/branches/{branch}/protection/enforce_admins"
        )

    async def remove_admin_enforcement(
        self, owner: str, repo: str, branch: str
    ) -> dict[str, Any]:
        """Remove admin enforcement for branch protection.

        Args:
            owner: Repository owner.
            repo: Repository name.
            branch: Branch name.

        Returns:
            Empty dict on success.
        """
        base = self._repo_path(owner, repo)
        validate_branch_name(branch)
        self._logger.info("Removing admin enforcement for %s/%s:%s", owner, repo, branch)
        return await self._client.delete(
            f"{base}/branches/{branch}/protection/enforce_admins"
        )

    async def get_push_restrictions(
        self, owner: str, repo: str, branch: str
    ) -> dict[str, Any]:
        """Get push restrictions for a protected branch.

        Args:
            owner: Repository owner.
            repo: Repository name.
            branch: Branch name.

        Returns:
            Push restriction data.
        """
        base = self._repo_path(owner, repo)
        validate_branch_name(branch)
        self._logger.info("Getting push restrictions for %s/%s:%s", owner, repo, branch)
        return await self._client.get(
            f"{base}/branches/{branch}/protection/restrictions"
        )

    async def update_push_restrictions(
        self, owner: str, repo: str, branch: str, data: dict[str, Any]
    ) -> dict[str, Any]:
        """Update push restrictions for a protected branch.

        Args:
            owner: Repository owner.
            repo: Repository name.
            branch: Branch name.
            data: Restriction configuration (users, teams, apps).

        Returns:
            Updated restriction data.
        """
        base = self._repo_path(owner, repo)
        validate_branch_name(branch)
        self._logger.info("Updating push restrictions for %s/%s:%s", owner, repo, branch)
        return await self._client.put(
            f"{base}/branches/{branch}/protection/restrictions",
            json=data,
        )

    async def delete_push_restrictions(
        self, owner: str, repo: str, branch: str
    ) -> dict[str, Any]:
        """Delete push restrictions from a protected branch.

        Args:
            owner: Repository owner.
            repo: Repository name.
            branch: Branch name.

        Returns:
            Empty dict on success.
        """
        base = self._repo_path(owner, repo)
        validate_branch_name(branch)
        self._logger.info("Deleting push restrictions for %s/%s:%s", owner, repo, branch)
        return await self._client.delete(
            f"{base}/branches/{branch}/protection/restrictions"
        )

    async def rename(
        self, owner: str, repo: str, branch: str, new_name: str
    ) -> dict[str, Any]:
        """Rename a branch.

        Args:
            owner: Repository owner.
            repo: Repository name.
            branch: Current branch name.
            new_name: New branch name.

        Returns:
            Renamed branch data.
        """
        base = self._repo_path(owner, repo)
        validate_branch_name(branch)
        validate_branch_name(new_name)
        self._logger.info("Renaming branch %s/%s:%s to %s", owner, repo, branch, new_name)
        return await self._client.post(
            f"{base}/branches/{branch}/rename",
            json={"new_name": new_name},
        )

    async def merge(
        self, owner: str, repo: str, data: dict[str, Any]
    ) -> dict[str, Any]:
        """Perform a branch merge.

        Args:
            owner: Repository owner.
            repo: Repository name.
            data: Merge parameters (base, head, commit_message).

        Returns:
            Merge commit data.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Merging branches in %s/%s", owner, repo)
        return await self._client.post(f"{base}/merges", json=data)

    async def compare(
        self, owner: str, repo: str, base_ref: str, head_ref: str
    ) -> dict[str, Any]:
        """Compare two branches/commits/tags.

        Args:
            owner: Repository owner.
            repo: Repository name.
            base_ref: Base reference (branch, tag, or SHA).
            head_ref: Head reference (branch, tag, or SHA).

        Returns:
            Comparison data.
        """
        base = self._repo_path(owner, repo)
        self._logger.info("Comparing %s...%s in %s/%s", base_ref, head_ref, owner, repo)
        return await self._client.get(f"{base}/compare/{base_ref}...{head_ref}")

    async def create_protection_template(
        self, owner: str, repo: str, branch: str, *, template: str = "standard"
    ) -> dict[str, Any]:
        """Apply a predefined protection template to a branch.

        Templates:
        - 'standard': Require PR reviews, status checks, no force push.
        - 'strict': Standard + admin enforcement, dismiss stale reviews.
        - 'minimal': Only require PR reviews.

        Args:
            owner: Repository owner.
            repo: Repository name.
            branch: Branch name.
            template: Template name ('standard', 'strict', 'minimal').

        Returns:
            Applied protection data.
        """
        templates: dict[str, dict[str, Any]] = {
            "minimal": {
                "required_pull_request_reviews": {
                    "required_approving_review_count": 1,
                },
                "required_status_checks": None,
                "enforce_admins": False,
                "restrictions": None,
            },
            "standard": {
                "required_pull_request_reviews": {
                    "dismiss_stale_reviews": False,
                    "require_code_owner_reviews": False,
                    "required_approving_review_count": 1,
                },
                "required_status_checks": {
                    "strict": True,
                    "contexts": [],
                },
                "enforce_admins": False,
                "restrictions": None,
            },
            "strict": {
                "required_pull_request_reviews": {
                    "dismiss_stale_reviews": True,
                    "require_code_owner_reviews": True,
                    "required_approving_review_count": 2,
                },
                "required_status_checks": {
                    "strict": True,
                    "contexts": [],
                },
                "enforce_admins": True,
                "restrictions": None,
            },
        }

        config = templates.get(template, templates["standard"])
        self._logger.info(
            "Applying '%s' protection template to %s/%s:%s",
            template, owner, repo, branch,
        )
        return await self.update_protection(owner, repo, branch, config)
