"""Comments Routes — Figma API SDK"""

from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

router = APIRouter()


def get_comments_client(request: Request):
    return request.app.state.comments_client


@router.get("/files/{file_key}/comments")
async def list_comments(
    file_key: str, as_md: Optional[bool] = None, client=Depends(get_comments_client)
):
    return await client.list_comments(file_key, as_md=as_md)


@router.post("/files/{file_key}/comments", status_code=201)
async def add_comment(file_key: str, body: Dict[str, Any], client=Depends(get_comments_client)):
    return await client.add_comment(
        file_key,
        message=body.get("message", ""),
        client_meta=body.get("client_meta"),
        comment_id=body.get("comment_id"),
    )


@router.delete("/files/{file_key}/comments/{comment_id}")
async def delete_comment(file_key: str, comment_id: str, client=Depends(get_comments_client)):
    return await client.delete_comment(file_key, comment_id)
