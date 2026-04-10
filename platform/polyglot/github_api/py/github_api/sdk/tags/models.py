"""
Pydantic models for GitHub Tags and Releases API resources.
"""

from __future__ import annotations

import re
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

__all__ = [
    "Tag",
    "Release",
    "TagProtection",
    "SemanticVersion",
]

_SEMVER_RE = re.compile(
    r"^v?(?P<major>\d+)\.(?P<minor>\d+)\.(?P<patch>\d+)"
    r"(?:-(?P<prerelease>[a-zA-Z0-9.]+))?"
    r"(?:\+(?P<build>[a-zA-Z0-9.]+))?$"
)


class Tag(BaseModel):
    """GitHub tag reference."""

    name: str = Field(description="Tag name")
    zipball_url: str = Field(default="", description="Zipball download URL")
    tarball_url: str = Field(default="", description="Tarball download URL")
    commit: dict[str, Any] = Field(default_factory=dict, description="Commit data")
    node_id: str = Field(default="", description="GraphQL node ID")

    model_config = {"extra": "allow"}


class Release(BaseModel):
    """GitHub release resource."""

    id: int = Field(description="Release ID")
    tag_name: str = Field(description="Associated tag name")
    name: str | None = Field(default=None, description="Release title")
    body: str | None = Field(default=None, description="Release description (markdown)")
    draft: bool = Field(default=False, description="Whether this is a draft release")
    prerelease: bool = Field(default=False, description="Whether this is a prerelease")
    created_at: datetime | None = Field(default=None, description="Creation timestamp")
    published_at: datetime | None = Field(default=None, description="Publication timestamp")
    html_url: str = Field(default="", description="Release page URL")
    upload_url: str = Field(default="", description="Asset upload URL template")
    tarball_url: str = Field(default="", description="Source tarball URL")
    zipball_url: str = Field(default="", description="Source zipball URL")
    author: dict[str, Any] = Field(default_factory=dict, description="Release author")
    assets: list[dict[str, Any]] = Field(default_factory=list, description="Release assets")
    target_commitish: str = Field(default="", description="Target branch or commit SHA")
    node_id: str = Field(default="", description="GraphQL node ID")

    model_config = {"extra": "allow"}


class TagProtection(BaseModel):
    """Tag protection rule."""

    id: int = Field(description="Protection rule ID")
    pattern: str = Field(description="Tag name pattern (glob)")
    created_at: datetime | None = Field(default=None, description="Creation timestamp")
    updated_at: datetime | None = Field(default=None, description="Last update timestamp")

    model_config = {"extra": "allow"}


class SemanticVersion(BaseModel):
    """Parsed semantic version."""

    major: int = Field(description="Major version number")
    minor: int = Field(description="Minor version number")
    patch: int = Field(description="Patch version number")
    prerelease: str | None = Field(default=None, description="Pre-release label")
    build: str | None = Field(default=None, description="Build metadata")
    raw: str = Field(default="", description="Original version string")

    @property
    def is_prerelease(self) -> bool:
        """Whether this version has a pre-release label."""
        return self.prerelease is not None

    def __str__(self) -> str:
        version = f"{self.major}.{self.minor}.{self.patch}"
        if self.prerelease:
            version += f"-{self.prerelease}"
        if self.build:
            version += f"+{self.build}"
        return version

    def as_tuple(self) -> tuple[int, int, int]:
        """Return version as a comparable tuple."""
        return (self.major, self.minor, self.patch)


def parse_semantic_version(version_str: str) -> SemanticVersion | None:
    """Parse a version string into a SemanticVersion.

    Args:
        version_str: Version string (e.g., 'v1.2.3', '1.0.0-beta.1').

    Returns:
        SemanticVersion if parseable, None otherwise.
    """
    match = _SEMVER_RE.match(version_str.strip())
    if not match:
        return None

    return SemanticVersion(
        major=int(match.group("major")),
        minor=int(match.group("minor")),
        patch=int(match.group("patch")),
        prerelease=match.group("prerelease"),
        build=match.group("build"),
        raw=version_str,
    )
