"""
GitHub Collaborators SDK module.
"""

from github_api.sdk.collaborators.client import CollaboratorsClient
from github_api.sdk.collaborators.models import (
    Collaborator,
    CollaboratorStats,
    Invitation,
    Permission,
)

__all__ = [
    "CollaboratorsClient",
    "Collaborator",
    "CollaboratorStats",
    "Invitation",
    "Permission",
]
