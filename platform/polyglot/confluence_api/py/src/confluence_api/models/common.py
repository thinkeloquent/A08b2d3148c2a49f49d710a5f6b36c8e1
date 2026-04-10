"""Common models shared across the Confluence API package."""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field

from confluence_api.logger import create_logger

log = create_logger('confluence_api', __file__)


class ValidationResult(BaseModel):
    """Result of a validation check performed by the Confluence server."""

    model_config = ConfigDict(populate_by_name=True)

    authorized: bool = False
    valid: bool = False
    errors: dict[str, Any] | None = None
    successful: bool = False
    allowed_in_read_only_mode: bool = Field(False, alias="allowedInReadOnlyMode")


class RestError(BaseModel):
    """Standard REST error envelope returned by the Confluence API."""

    model_config = ConfigDict(populate_by_name=True)

    status_code: int = Field(alias="statusCode")
    data: ValidationResult | None = None
    message: str = ""
    reason: str = ""


class PaginationLinks(BaseModel):
    """HAL-style pagination links included in paginated responses."""

    model_config = ConfigDict(populate_by_name=True)

    base: str | None = None
    self_link: str | None = Field(None, alias="self")
    context: str | None = None
    next_link: str | None = Field(None, alias="next")
    prev_link: str | None = Field(None, alias="prev")


class PaginatedResponse(BaseModel):
    """Generic paginated response. Results typed as list[dict] -- callers parse into specific models."""

    model_config = ConfigDict(populate_by_name=True)

    results: list[dict[str, Any]] = Field(default_factory=list)
    start: int = 0
    limit: int = 25
    size: int = 0
    links: PaginationLinks | None = Field(None, alias="_links")


class OperationCheckResult(BaseModel):
    """Result of an operation permission check."""

    model_config = ConfigDict(populate_by_name=True)

    operation: str = ""
    target_type: str = Field("", alias="targetType")
