"""System-level models (server info, metrics, long-running tasks)."""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field

from confluence_api.logger import create_logger

log = create_logger('confluence_api', __file__)


class ServerInformation(BaseModel):
    """Confluence server metadata returned by the server-info endpoint."""

    model_config = ConfigDict(populate_by_name=True)

    base_url: str = Field("", alias="baseUrl")
    version: str = ""
    build_number: int | None = Field(None, alias="buildNumber")
    marketplace_build_number: int | None = Field(None, alias="marketplaceBuildNumber")
    build_date: str | None = Field(None, alias="buildDate")


class InstanceMetrics(BaseModel):
    """High-level instance usage metrics."""

    model_config = ConfigDict(populate_by_name=True)

    pages: int = 0
    spaces: int = 0
    users: int = 0


class LongTaskMessage(BaseModel):
    """Internationalised message within a long-running task status."""

    model_config = ConfigDict(populate_by_name=True)

    key: str = ""
    args: list[Any] = Field(default_factory=list)
    translation: str = ""


class LongTaskStatus(BaseModel):
    """Status of a long-running task (e.g. space export, site backup)."""

    model_config = ConfigDict(populate_by_name=True)

    id: str = ""
    name: LongTaskMessage | None = None
    elapsed_time: int = Field(0, alias="elapsedTime")
    percentage_complete: int = Field(0, alias="percentageComplete")
    successful: bool = False
    messages: list[LongTaskMessage] = Field(default_factory=list)
