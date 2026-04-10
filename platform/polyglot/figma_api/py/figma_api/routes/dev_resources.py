"""Dev Resources Routes — Figma API SDK"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, Request

router = APIRouter()


def get_dev_resources_client(request: Request):
    return request.app.state.dev_resources_client


@router.get("/files/{file_key}/dev_resources")
async def list_dev_resources(
    file_key: str, node_id: Optional[str] = None, client=Depends(get_dev_resources_client)
):
    return await client.list_dev_resources(file_key, node_id=node_id)


@router.post("/files/{file_key}/dev_resources", status_code=201)
async def create_dev_resources(
    file_key: str, body: List[Dict[str, Any]], client=Depends(get_dev_resources_client)
):
    return await client.create_dev_resources(file_key, body)


@router.put("/files/{file_key}/dev_resources")
async def update_dev_resources(
    file_key: str, body: List[Dict[str, Any]], client=Depends(get_dev_resources_client)
):
    return await client.update_dev_resources(file_key, body)


@router.delete("/files/{file_key}/dev_resources/{dev_resource_id}")
async def delete_dev_resource(
    file_key: str, dev_resource_id: str, client=Depends(get_dev_resources_client)
):
    return await client.delete_dev_resource(file_key, dev_resource_id)
