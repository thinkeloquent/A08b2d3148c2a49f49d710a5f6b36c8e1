"""Components Routes — Figma API SDK"""

from typing import Optional

from fastapi import APIRouter, Depends, Request

router = APIRouter()


def get_components_client(request: Request):
    return request.app.state.components_client


@router.get("/components/{key}")
async def get_component(key: str, client=Depends(get_components_client)):
    return await client.get_component(key)


@router.get("/files/{file_key}/components")
async def get_file_components(file_key: str, client=Depends(get_components_client)):
    return await client.get_file_components(file_key)


@router.get("/teams/{team_id}/components")
async def get_team_components(
    team_id: str,
    page_size: Optional[int] = None,
    cursor: Optional[str] = None,
    client=Depends(get_components_client),
):
    return await client.get_team_components(team_id, page_size=page_size, cursor=cursor)


@router.get("/component_sets/{key}")
async def get_component_set(key: str, client=Depends(get_components_client)):
    return await client.get_component_set(key)


@router.get("/teams/{team_id}/component_sets")
async def get_team_component_sets(
    team_id: str,
    page_size: Optional[int] = None,
    cursor: Optional[str] = None,
    client=Depends(get_components_client),
):
    return await client.get_team_component_sets(team_id, page_size=page_size, cursor=cursor)


@router.get("/teams/{team_id}/styles")
async def get_team_styles(
    team_id: str,
    page_size: Optional[int] = None,
    cursor: Optional[str] = None,
    client=Depends(get_components_client),
):
    return await client.get_team_styles(team_id, page_size=page_size, cursor=cursor)


@router.get("/styles/{key}")
async def get_style(key: str, client=Depends(get_components_client)):
    return await client.get_style(key)
