"""
GitHub Webhooks SDK module.
"""

from github_api.sdk.webhooks.client import WebhooksClient
from github_api.sdk.webhooks.models import (
    Webhook,
    WebhookConfig,
    WebhookEvent,
    WebhookResponse,
)

__all__ = [
    "WebhooksClient",
    "Webhook",
    "WebhookConfig",
    "WebhookEvent",
    "WebhookResponse",
]
