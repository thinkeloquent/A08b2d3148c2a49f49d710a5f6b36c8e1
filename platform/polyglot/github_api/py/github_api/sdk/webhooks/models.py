"""
Pydantic models for GitHub Webhooks API resources.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

__all__ = [
    "Webhook",
    "WebhookConfig",
    "WebhookResponse",
    "WebhookEvent",
]


class WebhookConfig(BaseModel):
    """Webhook configuration (URL, content type, secret)."""

    url: str = Field(description="Payload delivery URL")
    content_type: str = Field(default="json", description="Content type (json or form)")
    secret: str | None = Field(default=None, description="Webhook secret for HMAC verification")
    insecure_ssl: str = Field(default="0", description="SSL verification (0=verify, 1=skip)")

    model_config = {"extra": "allow"}


class Webhook(BaseModel):
    """GitHub repository webhook."""

    id: int = Field(description="Webhook ID")
    name: str = Field(default="web", description="Webhook name (always 'web')")
    active: bool = Field(default=True, description="Whether the webhook is active")
    events: list[str] = Field(default_factory=list, description="Events that trigger delivery")
    config: WebhookConfig | dict[str, Any] = Field(
        default_factory=dict, description="Webhook configuration"
    )
    type: str = Field(default="Repository", description="Webhook type")
    url: str = Field(default="", description="Webhook API URL")
    test_url: str = Field(default="", description="Test URL")
    ping_url: str = Field(default="", description="Ping URL")
    deliveries_url: str = Field(default="", description="Deliveries URL")
    created_at: datetime | None = Field(default=None, description="Creation timestamp")
    updated_at: datetime | None = Field(default=None, description="Last update timestamp")
    last_response: dict[str, Any] = Field(
        default_factory=dict, description="Most recent delivery response"
    )

    model_config = {"extra": "allow"}


class WebhookResponse(BaseModel):
    """Webhook delivery response summary."""

    code: int | None = Field(default=None, description="HTTP status code of delivery")
    status: str = Field(default="", description="Delivery status")
    message: str | None = Field(default=None, description="Response message")


class WebhookEvent(BaseModel):
    """GitHub webhook event type descriptor."""

    name: str = Field(description="Event name (e.g., 'push', 'pull_request')")
    description: str = Field(default="", description="Event description")
