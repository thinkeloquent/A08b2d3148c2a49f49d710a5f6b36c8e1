"""
Input validation for GitHub API parameters.

Validates repository names, usernames, and branch names against
GitHub's naming rules and reserved names.
"""

from __future__ import annotations

import re
from typing import Any

from github_api.sdk.errors import ValidationError

__all__ = [
    "validate_repository_name",
    "validate_username",
    "validate_branch_name",
    "RESERVED_REPO_NAMES",
]

RESERVED_REPO_NAMES: frozenset[str] = frozenset({
    "settings",
    "security",
    "pulls",
    "issues",
    "actions",
    "apps",
    "codespaces",
    "copilot",
    "discussions",
    "explore",
    "features",
    "marketplace",
    "new",
    "notifications",
    "organizations",
    "packages",
    "projects",
    "search",
    "sponsors",
    "stars",
    "topics",
    "trending",
    "wiki",
    "collections",
    "events",
    "gist",
    "gists",
    "login",
    "logout",
    "pricing",
    "readme",
    "sessions",
    "signup",
    "status",
    "support",
    "terms",
    "watching",
    "account",
    "billing",
    "blog",
    "bounty",
    "case-studies",
    "community",
    "customer-stories",
    "developer",
    "education",
    "enterprise",
    "get-started",
    "graphql",
    "guides",
    "integrations",
    "about",
    "api",
    "docs",
    "join",
    "rest",
})

_REPO_NAME_RE = re.compile(r"^[a-zA-Z0-9._-]+$")
_USERNAME_RE = re.compile(r"^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$")
_BRANCH_CONTROL_RE = re.compile(r"[\x00-\x1f\x7f]")
_BRANCH_INVALID_CHARS_RE = re.compile(r"[ ~^:?*\[\\]")


def validate_repository_name(name: str) -> str:
    """Validate a GitHub repository name.

    Rules:
    - Non-empty, max 100 characters
    - Only alphanumeric, hyphens, underscores, and dots
    - Cannot start or end with a dot
    - Cannot be a reserved name

    Args:
        name: The repository name to validate.

    Returns:
        The validated repository name.

    Raises:
        ValidationError: If the name violates any rule.
    """
    if not name:
        raise ValidationError(
            "Repository name cannot be empty",
            errors=[{"field": "name", "code": "missing"}],
        )

    if len(name) > 100:
        raise ValidationError(
            f"Repository name exceeds maximum length of 100 characters (got {len(name)})",
            errors=[{"field": "name", "code": "too_long"}],
        )

    if not _REPO_NAME_RE.match(name):
        raise ValidationError(
            f"Repository name contains invalid characters: {name!r}. "
            "Only alphanumeric characters, hyphens, underscores, and dots are allowed.",
            errors=[{"field": "name", "code": "invalid"}],
        )

    if name.startswith(".") or name.endswith("."):
        raise ValidationError(
            f"Repository name cannot start or end with a dot: {name!r}",
            errors=[{"field": "name", "code": "invalid_format"}],
        )

    if name.lower() in RESERVED_REPO_NAMES:
        raise ValidationError(
            f"Repository name {name!r} is reserved by GitHub",
            errors=[{"field": "name", "code": "reserved"}],
        )

    return name


def validate_username(owner: str) -> str:
    """Validate a GitHub username or organization name.

    Rules:
    - Non-empty, max 39 characters
    - Alphanumeric and hyphens only
    - Cannot start or end with a hyphen
    - No consecutive hyphens

    Args:
        owner: The username/org name to validate.

    Returns:
        The validated username.

    Raises:
        ValidationError: If the username violates any rule.
    """
    if not owner:
        raise ValidationError(
            "Username cannot be empty",
            errors=[{"field": "owner", "code": "missing"}],
        )

    if len(owner) > 39:
        raise ValidationError(
            f"Username exceeds maximum length of 39 characters (got {len(owner)})",
            errors=[{"field": "owner", "code": "too_long"}],
        )

    if owner.startswith("-") or owner.endswith("-"):
        raise ValidationError(
            f"Username cannot start or end with a hyphen: {owner!r}",
            errors=[{"field": "owner", "code": "invalid_format"}],
        )

    if "--" in owner:
        raise ValidationError(
            f"Username cannot contain consecutive hyphens: {owner!r}",
            errors=[{"field": "owner", "code": "invalid_format"}],
        )

    if not _USERNAME_RE.match(owner):
        raise ValidationError(
            f"Username contains invalid characters: {owner!r}. "
            "Only alphanumeric characters and single hyphens are allowed.",
            errors=[{"field": "owner", "code": "invalid"}],
        )

    return owner


def validate_branch_name(branch: str) -> str:
    """Validate a Git branch name.

    Rules:
    - Non-empty, max 255 characters
    - No control characters
    - No space, ~, ^, :, ?, *, [, or backslash
    - No consecutive slashes
    - Cannot be a single '@'

    Args:
        branch: The branch name to validate.

    Returns:
        The validated branch name.

    Raises:
        ValidationError: If the branch name violates any rule.
    """
    if not branch:
        raise ValidationError(
            "Branch name cannot be empty",
            errors=[{"field": "branch", "code": "missing"}],
        )

    if len(branch) > 255:
        raise ValidationError(
            f"Branch name exceeds maximum length of 255 characters (got {len(branch)})",
            errors=[{"field": "branch", "code": "too_long"}],
        )

    if _BRANCH_CONTROL_RE.search(branch):
        raise ValidationError(
            f"Branch name contains control characters: {branch!r}",
            errors=[{"field": "branch", "code": "invalid"}],
        )

    if _BRANCH_INVALID_CHARS_RE.search(branch):
        raise ValidationError(
            f"Branch name contains invalid characters: {branch!r}. "
            "Characters space, ~, ^, :, ?, *, [, and \\ are not allowed.",
            errors=[{"field": "branch", "code": "invalid"}],
        )

    if "//" in branch:
        raise ValidationError(
            f"Branch name cannot contain consecutive slashes: {branch!r}",
            errors=[{"field": "branch", "code": "invalid_format"}],
        )

    if branch == "@":
        raise ValidationError(
            "Branch name cannot be a single '@'",
            errors=[{"field": "branch", "code": "invalid_format"}],
        )

    return branch
