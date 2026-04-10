"""Webhooks Routes — Figma API SDK (v2 API)"""

from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, Request

router = APIRouter()


def get_webhooks_client(request: Request):
    return request.app.state.webhooks_client


@router.get("/webhooks/{webhook_id}")
async def get_webhook(webhook_id: str, client=Depends(get_webhooks_client)):
    return await client.get_webhook(webhook_id)


@router.get("/teams/{team_id}/webhooks")
async def list_team_webhooks(team_id: str, client=Depends(get_webhooks_client)):
    return await client.list_team_webhooks(team_id)


@router.post("/webhooks", status_code=201)
async def create_webhook(body: Dict[str, Any], client=Depends(get_webhooks_client)):
    return await client.create_webhook(
        body["team_id"],
        event_type=body["event_type"],
        endpoint=body["endpoint"],
        passcode=body.get("passcode"),
        status=body.get("status"),
        description=body.get("description"),
    )


@router.put("/webhooks/{webhook_id}")
async def update_webhook(
    webhook_id: str, body: Dict[str, Any], client=Depends(get_webhooks_client)
):
    return await client.update_webhook(webhook_id, body)


@router.delete("/webhooks/{webhook_id}")
async def delete_webhook(webhook_id: str, client=Depends(get_webhooks_client)):
    return await client.delete_webhook(webhook_id)


@router.get("/webhooks/{webhook_id}/requests")
async def get_webhook_requests(webhook_id: str, client=Depends(get_webhooks_client)):
    return await client.get_webhook_requests(webhook_id)
