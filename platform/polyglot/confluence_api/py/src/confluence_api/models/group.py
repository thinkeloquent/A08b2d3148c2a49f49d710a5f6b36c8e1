"""Group-domain models."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict

from confluence_api.logger import create_logger

log = create_logger('confluence_api', __file__)


class Group(BaseModel):
    """Confluence user group."""

    model_config = ConfigDict(populate_by_name=True)

    name: str = ""
    type: str = "group"
