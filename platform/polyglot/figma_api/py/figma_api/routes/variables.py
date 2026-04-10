"""Variables Routes — Figma API SDK (Enterprise)"""

from typing import Any, Dict

from fastapi import APIRouter, Depends, Request

router = APIRouter()


def get_variables_client(request: Request):
    return request.app.state.variables_client


@router.get("/files/{file_key}/variables/local")
async def get_local_variables(file_key: str, client=Depends(get_variables_client)):
    return await client.get_local_variables(file_key)


@router.get("/files/{file_key}/variables/published")
async def get_published_variables(file_key: str, client=Depends(get_variables_client)):
    return await client.get_published_variables(file_key)


@router.post("/files/{file_key}/variables", status_code=201)
async def create_variables(
    file_key: str, body: Dict[str, Any], client=Depends(get_variables_client)
):
    return await client.create_variables(file_key, body)
