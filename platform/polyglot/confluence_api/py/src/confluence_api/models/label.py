"""Label-domain models."""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict

from confluence_api.logger import create_logger

log = create_logger('confluence_api', __file__)


class Label(BaseModel):
    """Content or space label."""

    model_config = ConfigDict(populate_by_name=True)

    prefix: str = ""
    name: str = ""
    id: str | None = None
    label: str | None = None
