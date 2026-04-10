"""
Webhook service for Confluence Data Center REST API v9.2.3.

Provides CRUD operations for webhooks including testing,
invocation history, and statistics.
"""

from __future__ import annotations

from typing import Any

from confluence_api.logger import create_logger

log = create_logger("confluence_api", __file__)


class WebhookService:
    """Service for Confluence webhook operations."""

    def __init__(self, client: Any) -> None:
        self._client = client

    def get_webhooks(self) -> dict:
        """Retrieve all registered webhooks."""
        log.debug("get_webhooks called")
        result = self._client.get("webhook")
        log.info("get_webhooks succeeded")
        return result

    def create_webhook(self, data: dict) -> dict:
        """
        Register a new webhook.

        Args:
            data: Webhook configuration including url, events, etc.

        Returns:
            Created webhook data dict.
        """
        log.debug("create_webhook called", {"url": data.get("url")})
        result = self._client.post("webhook", json_data=data)
        log.info("create_webhook succeeded", {"id": result.get("id")})
        return result

    def get_webhook(self, webhook_id: int) -> dict:
        """Retrieve a specific webhook by ID."""
        log.debug("get_webhook called", {"webhook_id": webhook_id})
        result = self._client.get(f"webhook/{webhook_id}")
        log.info("get_webhook succeeded", {"webhook_id": webhook_id})
        return result

    def update_webhook(self, webhook_id: int, data: dict) -> dict:
        """Update an existing webhook."""
        log.debug("update_webhook called", {"webhook_id": webhook_id})
        result = self._client.put(f"webhook/{webhook_id}", json_data=data)
        log.info("update_webhook succeeded", {"webhook_id": webhook_id})
        return result

    def delete_webhook(self, webhook_id: int) -> dict:
        """Delete a webhook by ID."""
        log.debug("delete_webhook called", {"webhook_id": webhook_id})
        result = self._client.delete(f"webhook/{webhook_id}")
        log.info("delete_webhook succeeded", {"webhook_id": webhook_id})
        return result

    def test_webhook(self, data: dict) -> dict:
        """
        Send a test event to a webhook URL.

        Args:
            data: Test payload configuration.

        Returns:
            Test result dict.
        """
        log.debug("test_webhook called", {"url": data.get("url")})
        result = self._client.post("webhook/test", json_data=data)
        log.info("test_webhook succeeded")
        return result

    def get_latest_invocations(self, webhook_id: int) -> dict:
        """Retrieve the latest invocation history for a webhook."""
        log.debug("get_latest_invocations called", {"webhook_id": webhook_id})
        result = self._client.get(f"webhook/{webhook_id}/history")
        log.info("get_latest_invocations succeeded", {"webhook_id": webhook_id})
        return result

    def get_webhook_statistics(self, webhook_id: int) -> dict:
        """Retrieve detailed statistics for a specific webhook."""
        log.debug("get_webhook_statistics called", {"webhook_id": webhook_id})
        result = self._client.get(f"webhook/{webhook_id}/statistics")
        log.info("get_webhook_statistics succeeded", {"webhook_id": webhook_id})
        return result

    def get_webhook_statistics_summary(self, webhook_id: int) -> dict:
        """Retrieve a summary of statistics for a specific webhook."""
        log.debug("get_webhook_statistics_summary called", {"webhook_id": webhook_id})
        result = self._client.get(f"webhook/{webhook_id}/statistics/summary")
        log.info("get_webhook_statistics_summary succeeded", {"webhook_id": webhook_id})
        return result


class AsyncWebhookService:
    """Async service for Confluence webhook operations."""

    def __init__(self, client: Any) -> None:
        self._client = client

    async def get_webhooks(self) -> dict:
        """Retrieve all registered webhooks."""
        log.debug("get_webhooks called")
        result = await self._client.get("webhook")
        log.info("get_webhooks succeeded")
        return result

    async def create_webhook(self, data: dict) -> dict:
        """Register a new webhook."""
        log.debug("create_webhook called", {"url": data.get("url")})
        result = await self._client.post("webhook", json_data=data)
        log.info("create_webhook succeeded", {"id": result.get("id")})
        return result

    async def get_webhook(self, webhook_id: int) -> dict:
        """Retrieve a specific webhook by ID."""
        log.debug("get_webhook called", {"webhook_id": webhook_id})
        result = await self._client.get(f"webhook/{webhook_id}")
        log.info("get_webhook succeeded", {"webhook_id": webhook_id})
        return result

    async def update_webhook(self, webhook_id: int, data: dict) -> dict:
        """Update an existing webhook."""
        log.debug("update_webhook called", {"webhook_id": webhook_id})
        result = await self._client.put(f"webhook/{webhook_id}", json_data=data)
        log.info("update_webhook succeeded", {"webhook_id": webhook_id})
        return result

    async def delete_webhook(self, webhook_id: int) -> dict:
        """Delete a webhook by ID."""
        log.debug("delete_webhook called", {"webhook_id": webhook_id})
        result = await self._client.delete(f"webhook/{webhook_id}")
        log.info("delete_webhook succeeded", {"webhook_id": webhook_id})
        return result

    async def test_webhook(self, data: dict) -> dict:
        """Send a test event to a webhook URL."""
        log.debug("test_webhook called", {"url": data.get("url")})
        result = await self._client.post("webhook/test", json_data=data)
        log.info("test_webhook succeeded")
        return result

    async def get_latest_invocations(self, webhook_id: int) -> dict:
        """Retrieve the latest invocation history for a webhook."""
        log.debug("get_latest_invocations called", {"webhook_id": webhook_id})
        result = await self._client.get(f"webhook/{webhook_id}/history")
        log.info("get_latest_invocations succeeded", {"webhook_id": webhook_id})
        return result

    async def get_webhook_statistics(self, webhook_id: int) -> dict:
        """Retrieve detailed statistics for a specific webhook."""
        log.debug("get_webhook_statistics called", {"webhook_id": webhook_id})
        result = await self._client.get(f"webhook/{webhook_id}/statistics")
        log.info("get_webhook_statistics succeeded", {"webhook_id": webhook_id})
        return result

    async def get_webhook_statistics_summary(self, webhook_id: int) -> dict:
        """Retrieve a summary of statistics for a specific webhook."""
        log.debug("get_webhook_statistics_summary called", {"webhook_id": webhook_id})
        result = await self._client.get(f"webhook/{webhook_id}/statistics/summary")
        log.info("get_webhook_statistics_summary succeeded", {"webhook_id": webhook_id})
        return result
