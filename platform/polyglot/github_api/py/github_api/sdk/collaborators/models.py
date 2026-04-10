"""
Pydantic models for GitHub Collaborators API resources.
"""

from __future__ import annotations

import enum
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

__all__ = [
    "Collaborator",
    "Permission",
    "Invitation",
    "CollaboratorStats",
]


class Permission(str, enum.Enum):
    """Repository permission levels with hierarchy.

    Ordered from least to most permissive:
    NONE < PULL < TRIAGE < PUSH < MAINTAIN < ADMIN
    """

    NONE = "none"
    PULL = "pull"
    TRIAGE = "triage"
    PUSH = "push"
    MAINTAIN = "maintain"
    ADMIN = "admin"

    @property
    def level(self) -> int:
        """Numeric level for comparison."""
        _levels = {
            "none": 0,
            "pull": 1,
            "triage": 2,
            "push": 3,
            "maintain": 4,
            "admin": 5,
        }
        return _levels[self.value]

    def __ge__(self, other: Permission) -> bool:
        if not isinstance(other, Permission):
            return NotImplemented
        return self.level >= other.level

    def __gt__(self, other: Permission) -> bool:
        if not isinstance(other, Permission):
            return NotImplemented
        return self.level > other.level

    def __le__(self, other: Permission) -> bool:
        if not isinstance(other, Permission):
            return NotImplemented
        return self.level <= other.level

    def __lt__(self, other: Permission) -> bool:
        if not isinstance(other, Permission):
            return NotImplemented
        return self.level < other.level


class Collaborator(BaseModel):
    """GitHub repository collaborator."""

    login: str = Field(description="GitHub username")
    id: int = Field(description="User ID")
    node_id: str = Field(default="", description="GraphQL node ID")
    avatar_url: str = Field(default="", description="Avatar URL")
    type: str = Field(default="User", description="Account type")
    site_admin: bool = Field(default=False, description="Whether user is a site admin")
    permissions: dict[str, bool] = Field(
        default_factory=dict,
        description="Permission flags (admin, maintain, push, triage, pull)",
    )
    role_name: str = Field(default="", description="Role name")

    model_config = {"extra": "allow"}


class Invitation(BaseModel):
    """Repository collaboration invitation."""

    id: int = Field(description="Invitation ID")
    repository: dict[str, Any] = Field(default_factory=dict, description="Repository data")
    invitee: dict[str, Any] | None = Field(default=None, description="Invited user data")
    inviter: dict[str, Any] = Field(default_factory=dict, description="Inviting user data")
    permissions: str = Field(default="read", description="Permission level")
    created_at: datetime | None = Field(default=None, description="Invitation creation time")
    expired: bool = Field(default=False, description="Whether invitation has expired")
    url: str = Field(default="", description="Invitation API URL")
    html_url: str = Field(default="", description="Invitation web URL")
    node_id: str = Field(default="", description="GraphQL node ID")

    model_config = {"extra": "allow"}


class CollaboratorStats(BaseModel):
    """Summary statistics for repository collaborators."""

    total: int = Field(default=0, description="Total number of collaborators")
    admins: int = Field(default=0, description="Number of admins")
    maintainers: int = Field(default=0, description="Number of maintainers")
    writers: int = Field(default=0, description="Number with push access")
    triagers: int = Field(default=0, description="Number with triage access")
    readers: int = Field(default=0, description="Number with read-only access")
