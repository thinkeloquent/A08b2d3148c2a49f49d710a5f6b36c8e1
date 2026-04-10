"""
GitHub Branches SDK module.
"""

from github_api.sdk.branches.client import BranchesClient
from github_api.sdk.branches.models import (
    Branch,
    BranchComparison,
    BranchProtection,
    MergeResult,
    PushRestrictions,
    RequiredPullRequestReviews,
    RequiredStatusChecks,
)

__all__ = [
    "BranchesClient",
    "Branch",
    "BranchComparison",
    "BranchProtection",
    "MergeResult",
    "PushRestrictions",
    "RequiredPullRequestReviews",
    "RequiredStatusChecks",
]
