"""Projects Routes — Figma API SDK"""

from fastapi import APIRouter, Depends, Request

router = APIRouter()


def get_projects_client(request: Request):
    return request.app.state.projects_client


@router.get("/teams/{team_id}/projects")
async def get_team_projects(team_id: str, client=Depends(get_projects_client)):
    return await client.get_team_projects(team_id)


@router.get("/projects/{project_id}/files")
async def get_project_files(
    project_id: str, branch_data: bool = False, client=Depends(get_projects_client)
):
    return await client.get_project_files(project_id, branch_data=branch_data)
