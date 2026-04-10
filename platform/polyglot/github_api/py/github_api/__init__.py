"""
GitHub API SDK — Polyglot Common Interface (Python).

A complete GitHub REST API SDK with FastAPI server integration,
providing typed clients for repositories, branches, collaborators,
tags/releases, webhooks, and security features.
"""

from __future__ import annotations

from github_api.sdk import (
    AuthError,
    BranchesClient,
    CollaboratorsClient,
    ConflictError,
    ForbiddenError,
    GitHubClient,
    GitHubError,
    NotFoundError,
    RateLimitError,
    RateLimitInfo,
    RESERVED_REPO_NAMES,
    ReposClient,
    SecurityClient,
    ServerError,
    TagsClient,
    ValidationError,
    WebhooksClient,
    map_response_to_error,
    mask_token,
    resolve_token,
    validate_branch_name,
    validate_repository_name,
    validate_username,
)

__version__ = "1.0.0"

__all__ = [
    "__version__",
    # Core client
    "GitHubClient",
    # Domain clients
    "ReposClient",
    "BranchesClient",
    "CollaboratorsClient",
    "TagsClient",
    "WebhooksClient",
    "SecurityClient",
    # Errors
    "GitHubError",
    "AuthError",
    "NotFoundError",
    "ValidationError",
    "RateLimitError",
    "ConflictError",
    "ForbiddenError",
    "ServerError",
    "map_response_to_error",
    # Validation
    "validate_repository_name",
    "validate_username",
    "validate_branch_name",
    "RESERVED_REPO_NAMES",
    # Auth
    "resolve_token",
    "mask_token",
    # Rate limiting
    "RateLimitInfo",
]
