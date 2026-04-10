"""Space-domain models."""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field

from confluence_api.logger import create_logger

log = create_logger('confluence_api', __file__)


class Space(BaseModel):
    """Confluence space entity."""

    model_config = ConfigDict(populate_by_name=True)

    id: int | None = None
    key: str = ""
    name: str = ""
    status: str = "current"
    type: str = "global"
    description: dict[str, Any] | None = None
    homepage: dict[str, Any] | None = None
    icon: dict[str, Any] | None = None
    metadata: dict[str, Any] | None = None
    links: dict[str, Any] | None = Field(None, alias="_links")
    expandable: dict[str, Any] | None = Field(None, alias="_expandable")


class SpaceCreate(BaseModel):
    """Payload for creating a new space."""

    model_config = ConfigDict(populate_by_name=True)

    key: str
    name: str
    description: dict[str, Any] | None = None
    type: str = "global"


class SpaceUpdate(BaseModel):
    """Payload for updating an existing space."""

    model_config = ConfigDict(populate_by_name=True)

    name: str | None = None
    description: dict[str, Any] | None = None
    homepage: dict[str, Any] | None = None


class LongTaskSubmission(BaseModel):
    """Response returned when a long-running task is submitted (e.g. space deletion)."""

    model_config = ConfigDict(populate_by_name=True)

    id: str = ""
    links: dict[str, Any] | None = Field(None, alias="_links")
