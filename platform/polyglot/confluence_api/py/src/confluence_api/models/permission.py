"""Permission and restriction models."""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field

from confluence_api.logger import create_logger

log = create_logger('confluence_api', __file__)


class Subject(BaseModel):
    """Principal (user or group) that a permission applies to."""

    model_config = ConfigDict(populate_by_name=True)

    display_name: str = Field("", alias="displayName")
    type: str = ""


class OperationDescription(BaseModel):
    """Describes a single operation on a target type (e.g. read on page)."""

    model_config = ConfigDict(populate_by_name=True)

    operation: str = ""
    target_type: str = Field("", alias="targetType")


class SpacePermission(BaseModel):
    """A single space permission entry (subject + operation)."""

    model_config = ConfigDict(populate_by_name=True)

    subject: Subject | None = None
    operation: OperationDescription | None = None


class SpacePermissionsForSubject(BaseModel):
    """All space permissions granted to a single subject."""

    model_config = ConfigDict(populate_by_name=True)

    subject: Subject | None = None
    operations: list[OperationDescription] = Field(default_factory=list)


class ContentRestriction(BaseModel):
    """Restriction applied to a piece of content."""

    model_config = ConfigDict(populate_by_name=True)

    operation: str = ""
    restrictions: dict[str, Any] | None = None
