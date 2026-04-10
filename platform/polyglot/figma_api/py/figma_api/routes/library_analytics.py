"""Library Analytics Routes — Figma API SDK"""

from typing import Optional

from fastapi import APIRouter, Depends, Request

router = APIRouter()


def get_library_analytics_client(request: Request):
    return request.app.state.library_analytics_client


@router.get("/analytics/libraries/{team_id}/actions")
async def get_actions(
    team_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    group_by: Optional[str] = None,
    order: Optional[str] = None,
    cursor: Optional[str] = None,
    page_size: Optional[int] = None,
    client=Depends(get_library_analytics_client),
):
    return await client.get_actions(
        team_id,
        start_date=start_date, end_date=end_date,
        group_by=group_by, order=order, cursor=cursor, page_size=page_size,
    )


@router.get("/analytics/libraries/{team_id}/usages")
async def get_usages(
    team_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    group_by: Optional[str] = None,
    order: Optional[str] = None,
    cursor: Optional[str] = None,
    page_size: Optional[int] = None,
    client=Depends(get_library_analytics_client),
):
    return await client.get_usages(
        team_id,
        start_date=start_date, end_date=end_date,
        group_by=group_by, order=order, cursor=cursor, page_size=page_size,
    )
