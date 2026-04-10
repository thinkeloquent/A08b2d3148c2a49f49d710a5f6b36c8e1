"""Content-domain models for pages, blog posts, and related entities."""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field

from confluence_api.logger import create_logger

log = create_logger('confluence_api', __file__)


class Icon(BaseModel):
    """User or space icon / avatar."""

    model_config = ConfigDict(populate_by_name=True)

    path: str = ""
    width: int = 0
    height: int = 0
    is_default: bool = Field(False, alias="isDefault")


class Person(BaseModel):
    """Represents a Confluence user reference embedded in content responses."""

    model_config = ConfigDict(populate_by_name=True)

    profile_picture: Icon | None = Field(None, alias="profilePicture")
    display_name: str = Field("", alias="displayName")
    type: str = ""


class ReferenceVersion(BaseModel):
    """Lightweight version reference used inside History."""

    model_config = ConfigDict(populate_by_name=True)

    by: Person | None = None
    when: str | None = None
    message: str | None = None
    number: int | None = None
    minor_edit: bool | None = Field(None, alias="minorEdit")


class History(BaseModel):
    """Content history metadata."""

    model_config = ConfigDict(populate_by_name=True)

    latest: bool = True
    created_by: Person | None = Field(None, alias="createdBy")
    created_date: str | None = Field(None, alias="createdDate")
    previous_version: ReferenceVersion | None = Field(None, alias="previousVersion")
    next_version: ReferenceVersion | None = Field(None, alias="nextVersion")
    last_updated: ReferenceVersion | None = Field(None, alias="lastUpdated")


class Version(BaseModel):
    """Full version object attached to content."""

    model_config = ConfigDict(populate_by_name=True)

    by: Person | None = None
    when: str | None = None
    message: str = ""
    number: int = 1
    minor_edit: bool = Field(False, alias="minorEdit")
    hidden: bool = False
    sync_rev: str | None = Field(None, alias="syncRev")


class ContentBody(BaseModel):
    """A single representation of content body (storage, view, etc.)."""

    model_config = ConfigDict(populate_by_name=True)

    value: str = ""
    representation: str = "storage"


class ContentBodyContainer(BaseModel):
    """Container holding multiple representations of a content body."""

    model_config = ConfigDict(populate_by_name=True)

    storage: ContentBody | None = None
    view: ContentBody | None = None
    editor: ContentBody | None = None
    export_view: ContentBody | None = Field(None, alias="export_view")
    styled_view: ContentBody | None = Field(None, alias="styled_view")
    anonymous_export_view: ContentBody | None = Field(None, alias="anonymous_export_view")


class Content(BaseModel):
    """Primary Confluence content entity (page, blog post, comment, etc.)."""

    model_config = ConfigDict(populate_by_name=True)

    id: str | None = None
    type: str = "page"
    status: str = "current"
    title: str = ""
    space: dict[str, Any] | None = None
    history: History | None = None
    version: Version | None = None
    ancestors: list[dict[str, Any]] = Field(default_factory=list)
    body: ContentBodyContainer | None = None
    metadata: dict[str, Any] | None = None
    extensions: dict[str, Any] | None = None
    links: dict[str, Any] | None = Field(None, alias="_links")
    expandable: dict[str, Any] | None = Field(None, alias="_expandable")


class MacroInstance(BaseModel):
    """Represents a macro embedded in content."""

    model_config = ConfigDict(populate_by_name=True)

    name: str = ""
    body: str | None = None
    parameters: dict[str, Any] | None = None


class ContentCreate(BaseModel):
    """Payload for creating new content."""

    model_config = ConfigDict(populate_by_name=True)

    type: str
    title: str
    space: dict[str, str]
    body: ContentBodyContainer
    ancestors: list[dict[str, Any]] | None = None
    status: str = "current"


class ContentUpdate(BaseModel):
    """Payload for updating existing content."""

    model_config = ConfigDict(populate_by_name=True)

    version: Version
    title: str
    type: str
    status: str = "current"
    body: ContentBodyContainer | None = None
