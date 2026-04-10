"""
GitHub API SDK — core client, domain clients, errors, validation, and rate limiting.
"""

from github_api.sdk.actions import ActionsClient
from github_api.sdk.auth import TokenInfo, mask_token, resolve_token
from github_api.sdk.branches import BranchesClient
from github_api.sdk.client import GitHubClient
from github_api.sdk.collaborators import CollaboratorsClient
from github_api.sdk.errors import (
    AuthError,
    ConflictError,
    ForbiddenError,
    GitHubError,
    NotFoundError,
    RateLimitError,
    ServerError,
    ValidationError,
    map_response_to_error,
)
from github_api.sdk.pagination import paginate, paginate_all
from github_api.sdk.rate_limit import RateLimitInfo
from github_api.sdk.repos import ReposClient
from github_api.sdk.security import SecurityClient
from github_api.sdk.tags import TagsClient
from github_api.sdk.validation import (
    RESERVED_REPO_NAMES,
    validate_branch_name,
    validate_repository_name,
    validate_username,
)
from github_api.sdk.webhooks import WebhooksClient

__all__ = [
    # Core client
    "GitHubClient",
    # Domain clients
    "ReposClient",
    "BranchesClient",
    "CollaboratorsClient",
    "TagsClient",
    "WebhooksClient",
    "SecurityClient",
    "ActionsClient",
    # Auth
    "TokenInfo",
    "resolve_token",
    "mask_token",
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
    # Rate limiting
    "RateLimitInfo",
    # Pagination
    "paginate",
    "paginate_all",
]
