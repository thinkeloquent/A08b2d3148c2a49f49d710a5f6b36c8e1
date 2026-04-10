"""Watch and property models for content and space watchers / properties."""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field

from confluence_api.logger import create_logger

log = create_logger('confluence_api', __file__)


class ContentWatch(BaseModel):
    """A watch on a specific piece of content."""

    model_config = ConfigDict(populate_by_name=True)

    watcher: dict[str, Any] | None = None
    content_id: str | None = Field(None, alias="contentId")
    content: dict[str, Any] | None = None


class SpaceWatch(BaseModel):
    """A watch on an entire space."""

    model_config = ConfigDict(populate_by_name=True)

    watcher: dict[str, Any] | None = None
    space: dict[str, Any] | None = None
    content_types: list[str] = Field(default_factory=list, alias="contentTypes")


class JsonContentProperty(BaseModel):
    """JSON property attached to a piece of content."""

    model_config = ConfigDict(populate_by_name=True)

    key: str = ""
    value: Any | None = None
    version: dict[str, Any] | None = None
    content: dict[str, Any] | None = None


class JsonSpaceProperty(BaseModel):
    """JSON property attached to a space."""

    model_config = ConfigDict(populate_by_name=True)

    key: str = ""
    value: Any | None = None
    version: dict[str, Any] | None = None
    space: dict[str, Any] | None = None
