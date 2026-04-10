"""Webhook-domain models."""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field

from confluence_api.logger import create_logger

log = create_logger('confluence_api', __file__)


class WebhookScope(BaseModel):
    """Scope for a webhook (e.g. a specific space)."""

    model_config = ConfigDict(populate_by_name=True)

    id: str = ""
    type: str = ""


class WebhookEvent(BaseModel):
    """Event type that a webhook can subscribe to."""

    model_config = ConfigDict(populate_by_name=True)

    id: str | None = None
    i18n_key: str | None = Field(None, alias="i18nKey")


class WebhookCredentials(BaseModel):
    """Basic auth credentials for webhook callbacks."""

    model_config = ConfigDict(populate_by_name=True)

    username: str | None = None
    password: str | None = None


class Webhook(BaseModel):
    """Full webhook entity as returned by the Confluence API."""

    model_config = ConfigDict(populate_by_name=True)

    name: str = ""
    id: int | None = None
    active: bool = True
    configuration: dict[str, Any] | None = None
    url: str = ""
    scope: WebhookScope | None = None
    credentials: WebhookCredentials | None = None
    events: list[WebhookEvent] = Field(default_factory=list)
    created_date: str | None = Field(None, alias="createdDate")
    updated_date: str | None = Field(None, alias="updatedDate")
    ssl_verification_required: bool = Field(True, alias="sslVerificationRequired")


class RestWebhook(BaseModel):
    """Payload for creating or updating a webhook via the REST API."""

    model_config = ConfigDict(populate_by_name=True)

    name: str
    url: str
    events: list[str] = Field(default_factory=list)
    scope_type: str | None = Field(None, alias="scopeType")
    active: bool = True
    ssl_verification_required: bool = Field(True, alias="sslVerificationRequired")
    credentials: WebhookCredentials | None = None


class DetailedInvocationResult(BaseModel):
    """Outcome of a single webhook invocation (ERROR, FAILURE, SUCCESS)."""

    model_config = ConfigDict(populate_by_name=True)

    description: str = ""
    outcome: str = ""


class DetailedInvocation(BaseModel):
    """Detailed record of a webhook invocation."""

    model_config = ConfigDict(populate_by_name=True)

    id: int | None = None
    result: DetailedInvocationResult | None = None
    event_scope: WebhookScope | None = Field(None, alias="eventScope")
    event: WebhookEvent | None = None
    duration: int | None = None
    start: str | None = None
    finish: str | None = None
