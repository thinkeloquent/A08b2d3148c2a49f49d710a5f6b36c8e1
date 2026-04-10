"""
Webhooks Module — Figma API SDK

Wraps webhook CRUD and request log endpoints (v2 API).
"""
from typing import Any, Dict, List, Optional

from ...logger import create_logger

log = create_logger("figma-api", __file__)


class WebhooksClient:
    """Client for Figma Webhooks API endpoints (v2)."""

    def __init__(self, client, *, logger=None):
        self._client = client
        self._log = logger or log

    async def get_webhook(self, webhook_id: str) -> Dict[str, Any]:
        """Get a webhook by ID.

        GET /v2/webhooks/{webhook_id}
        """
        self._log.info("fetching webhook", webhook_id=webhook_id)
        result = await self._client.get(f"/v2/webhooks/{webhook_id}")
        self._log.debug(
            "webhook fetched",
            webhook_id=webhook_id,
            event_type=result.get("event_type"),
        )
        return result

    async def list_team_webhooks(self, team_id: str) -> Dict[str, Any]:
        """List all webhooks for a team.

        GET /v2/teams/{team_id}/webhooks
        """
        self._log.info("listing team webhooks", team_id=team_id)
        result = await self._client.get(f"/v2/teams/{team_id}/webhooks")
        webhook_count = len(result.get("webhooks", []))
        self._log.debug(
            "team webhooks listed",
            team_id=team_id,
            webhook_count=webhook_count,
        )
        return result

    async def create_webhook(
        self,
        team_id: str,
        *,
        event_type: str,
        endpoint: str,
        passcode: Optional[str] = None,
        status: Optional[str] = None,
        description: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create a webhook for a team.

        POST /v2/webhooks
        """
        self._log.info(
            "creating webhook",
            team_id=team_id,
            event_type=event_type,
            endpoint=endpoint,
        )
        body: Dict[str, Any] = {
            "team_id": team_id,
            "event_type": event_type,
            "endpoint": endpoint,
        }
        if passcode is not None:
            body["passcode"] = passcode
        if status is not None:
            body["status"] = status
        if description is not None:
            body["description"] = description

        result = await self._client.post("/v2/webhooks", body)
        self._log.debug(
            "webhook created",
            webhook_id=result.get("id"),
            team_id=team_id,
            event_type=event_type,
        )
        return result

    async def update_webhook(
        self,
        webhook_id: str,
        payload: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Update a webhook.

        PUT /v2/webhooks/{webhook_id}
        """
        self._log.info("updating webhook", webhook_id=webhook_id)
        result = await self._client.put(
            f"/v2/webhooks/{webhook_id}", payload
        )
        self._log.debug(
            "webhook updated",
            webhook_id=webhook_id,
            event_type=result.get("event_type"),
        )
        return result

    async def delete_webhook(self, webhook_id: str) -> Dict[str, Any]:
        """Delete a webhook.

        DELETE /v2/webhooks/{webhook_id}
        """
        self._log.info("deleting webhook", webhook_id=webhook_id)
        result = await self._client.delete(f"/v2/webhooks/{webhook_id}")
        self._log.debug("webhook deleted", webhook_id=webhook_id)
        return result

    async def get_webhook_requests(self, webhook_id: str) -> Dict[str, Any]:
        """Get request log for a webhook.

        GET /v2/webhooks/{webhook_id}/requests
        """
        self._log.info(
            "fetching webhook requests", webhook_id=webhook_id
        )
        result = await self._client.get(
            f"/v2/webhooks/{webhook_id}/requests"
        )
        request_count = len(result.get("requests", []))
        self._log.debug(
            "webhook requests fetched",
            webhook_id=webhook_id,
            request_count=request_count,
        )
        return result
