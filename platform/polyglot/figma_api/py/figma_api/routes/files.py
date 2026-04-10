"""Files Routes — Figma API SDK"""

from typing import Optional

from fastapi import APIRouter, Depends, Request

router = APIRouter()


def get_files_client(request: Request):
    return request.app.state.files_client


@router.get("/files/{file_key}")
async def get_file(
    file_key: str,
    version: Optional[str] = None,
    ids: Optional[str] = None,
    depth: Optional[int] = None,
    geometry: Optional[str] = None,
    plugin_data: Optional[str] = None,
    client=Depends(get_files_client),
):
    return await client.get_file(
        file_key, version=version, ids=ids, depth=depth,
        geometry=geometry, plugin_data=plugin_data,
    )


@router.get("/files/{file_key}/nodes")
async def get_file_nodes(
    file_key: str,
    ids: str = "",
    version: Optional[str] = None,
    depth: Optional[int] = None,
    geometry: Optional[str] = None,
    plugin_data: Optional[str] = None,
    client=Depends(get_files_client),
):
    return await client.get_file_nodes(
        file_key, ids, version=version, depth=depth,
        geometry=geometry, plugin_data=plugin_data,
    )


@router.get("/images/{file_key}")
async def get_images(
    file_key: str,
    ids: str = "",
    scale: Optional[float] = None,
    format: Optional[str] = None,
    client=Depends(get_files_client),
):
    return await client.get_images(file_key, ids, scale=scale, format=format)


@router.get("/files/{file_key}/images")
async def get_image_fills(file_key: str, client=Depends(get_files_client)):
    return await client.get_image_fills(file_key)


@router.get("/files/{file_key}/versions")
async def get_file_versions(file_key: str, client=Depends(get_files_client)):
    return await client.get_file_versions(file_key)
