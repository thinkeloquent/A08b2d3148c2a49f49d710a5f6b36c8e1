"""Search-domain models."""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from confluence_api.logger import create_logger

log = create_logger('confluence_api', __file__)


class ContainerSummary(BaseModel):
    """Summary of a container (space or parent page) in search results."""

    model_config = ConfigDict(populate_by_name=True)

    title: str = ""
    display_url: str = Field("", alias="displayUrl")


class SearchResult(BaseModel):
    """Single search result from the Confluence CQL search endpoint."""

    model_config = ConfigDict(populate_by_name=True)

    title: str = ""
    excerpt: str = ""
    url: str = ""
    result_parent_container: ContainerSummary | None = Field(
        None, alias="resultParentContainer"
    )
    result_global_container: ContainerSummary | None = Field(
        None, alias="resultGlobalContainer"
    )
    icon_css_class: str | None = Field(None, alias="iconCssClass")
    last_modified: str | None = Field(None, alias="lastModified")
    friendly_last_modified: str | None = Field(None, alias="friendlyLastModified")
    entity_type: str | None = Field(None, alias="entityType")
