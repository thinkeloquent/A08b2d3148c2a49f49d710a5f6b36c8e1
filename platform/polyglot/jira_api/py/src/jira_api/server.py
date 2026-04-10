"""FastAPI server for JIRA API operations."""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from pydantic import BaseModel

from jira_api.config import Settings, get_config
from jira_api.core.client import AsyncJiraClient, JiraClient
from jira_api.exceptions import JiraAPIError
from jira_api.logger import create_logger
from jira_api.models.issue import Issue, IssueCreate, IssueTransition, IssueUpdate
from jira_api.models.project import Project, ProjectVersion
from jira_api.models.user import User
from jira_api.services.issue_service import AsyncIssueService, IssueService
from jira_api.services.project_service import AsyncProjectService, ProjectService
from jira_api.services.user_service import AsyncUserService, UserService

log = create_logger("jira-api", __file__)
settings = Settings()
security = HTTPBasic(auto_error=False)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    log.info("Starting JIRA API Server")
    config = get_config()
    if not config:
        log.warning("No JIRA configuration found. Server will require per-request credentials.")
    else:
        log.info("Using JIRA instance", {"base_url": config.base_url})
    yield
    log.info("Shutting down JIRA API Server")


app = FastAPI(
    title="JIRA API Server",
    description="RESTful API for interacting with Jira Cloud REST API v3",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_jira_client() -> JiraClient:
    """Get a JIRA client instance."""
    config = get_config()
    if not config:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="JIRA configuration not found.",
        )
    return JiraClient(
        base_url=config.base_url,
        email=config.email,
        api_token=config.api_token,
    )


def get_async_jira_client() -> AsyncJiraClient:
    """Get an async JIRA client instance."""
    config = get_config()
    if not config:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="JIRA configuration not found.",
        )
    return AsyncJiraClient(
        base_url=config.base_url,
        email=config.email,
        api_token=config.api_token,
    )


def verify_api_key(
    credentials: HTTPBasicCredentials | None = Depends(security),
) -> bool:
    """Verify API key if configured."""
    if not settings.server_api_key:
        return True
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Basic"},
        )
    if credentials.username != settings.server_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
            headers={"WWW-Authenticate": "Basic"},
        )
    return True


# ── Health ───────────────────────────────────────────────────────────────


@app.get("/health", tags=["Health"])
async def health_check() -> dict:
    return {"status": "healthy", "service": "jira-api-server"}


# ── Users ────────────────────────────────────────────────────────────────


@app.get("/users/search", response_model=list[User], tags=["Users"])
async def search_users(
    query: str = Query(...),
    max_results: int = Query(50, ge=1, le=100),
    _: bool = Depends(verify_api_key),
) -> list[User]:
    try:
        async with get_async_jira_client() as client:
            return await AsyncUserService(client).search_users(query, max_results)
    except JiraAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


@app.get("/users/{identifier}", response_model=User, tags=["Users"])
async def get_user(identifier: str, _: bool = Depends(verify_api_key)) -> User:
    try:
        async with get_async_jira_client() as client:
            user = await AsyncUserService(client).get_user_by_identifier(identifier)
            if not user:
                raise HTTPException(status_code=404, detail=f"User '{identifier}' not found")
            return user
    except JiraAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


# ── Issues ───────────────────────────────────────────────────────────────


@app.post("/issues", response_model=Issue, tags=["Issues"])
async def create_issue(issue_data: IssueCreate, _: bool = Depends(verify_api_key)) -> Issue:
    try:
        async with get_async_jira_client() as client:
            svc = AsyncIssueService(client)
            return await svc.create_issue(
                project_id=issue_data.project_id,
                summary=issue_data.summary,
                issue_type_id=issue_data.issue_type_id,
                description=issue_data.description,
                priority_id=issue_data.priority_id,
                labels=issue_data.labels,
            )
    except JiraAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


@app.get("/issues/{issue_key}", response_model=Issue, tags=["Issues"])
async def get_issue(issue_key: str, _: bool = Depends(verify_api_key)) -> Issue:
    try:
        async with get_async_jira_client() as client:
            return await AsyncIssueService(client).get_issue(issue_key)
    except JiraAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


@app.patch("/issues/{issue_key}", tags=["Issues"])
async def update_issue(
    issue_key: str, update_data: IssueUpdate, _: bool = Depends(verify_api_key)
) -> dict:
    try:
        async with get_async_jira_client() as client:
            svc = AsyncIssueService(client)
            if update_data.summary:
                await svc.update_issue_summary(issue_key, update_data.summary)
            if update_data.labels_add:
                await svc.add_labels_to_issue(issue_key, update_data.labels_add)
            if update_data.labels_remove:
                await svc.remove_labels_from_issue(issue_key, update_data.labels_remove)
            return {"message": f"Issue {issue_key} updated successfully"}
    except JiraAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


@app.put("/issues/{issue_key}/assign/{email}", tags=["Issues"])
async def assign_issue(
    issue_key: str, email: str, _: bool = Depends(verify_api_key)
) -> dict:
    try:
        async with get_async_jira_client() as client:
            await AsyncIssueService(client).assign_issue_by_email(issue_key, email)
            return {"message": f"Issue {issue_key} assigned to {email}"}
    except JiraAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


@app.get("/issues/{issue_key}/transitions", response_model=list[IssueTransition], tags=["Issues"])
async def get_issue_transitions(
    issue_key: str, _: bool = Depends(verify_api_key)
) -> list[IssueTransition]:
    try:
        async with get_async_jira_client() as client:
            return await AsyncIssueService(client).get_available_transitions(issue_key)
    except JiraAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


class TransitionRequest(BaseModel):
    transition_name: str
    comment: str | None = None
    resolution_name: str | None = None


@app.post("/issues/{issue_key}/transitions", tags=["Issues"])
async def transition_issue(
    issue_key: str, req: TransitionRequest, _: bool = Depends(verify_api_key)
) -> dict:
    try:
        async with get_async_jira_client() as client:
            await AsyncIssueService(client).transition_issue_by_name(
                issue_key, req.transition_name, req.comment, req.resolution_name,
            )
            return {"message": f"Issue {issue_key} transitioned using '{req.transition_name}'"}
    except JiraAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


# ── Projects ─────────────────────────────────────────────────────────────


@app.get("/projects/{project_key}", response_model=Project, tags=["Projects"])
async def get_project(project_key: str, _: bool = Depends(verify_api_key)) -> Project:
    try:
        async with get_async_jira_client() as client:
            return await AsyncProjectService(client).get_project(project_key)
    except JiraAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


@app.get("/projects/{project_key}/versions", response_model=list[ProjectVersion], tags=["Projects"])
async def get_project_versions(
    project_key: str,
    released: bool | None = Query(None),
    _: bool = Depends(verify_api_key),
) -> list[ProjectVersion]:
    try:
        async with get_async_jira_client() as client:
            return await AsyncProjectService(client).get_project_versions(project_key, released_only=released)
    except JiraAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


class VersionCreateRequest(BaseModel):
    name: str
    description: str | None = None


@app.post("/projects/{project_key}/versions", response_model=ProjectVersion, tags=["Projects"])
async def create_project_version(
    project_key: str, req: VersionCreateRequest, _: bool = Depends(verify_api_key)
) -> ProjectVersion:
    try:
        async with get_async_jira_client() as client:
            return await AsyncProjectService(client).create_version(
                project_key, req.name, req.description,
            )
    except JiraAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


def start_server() -> None:
    """Start the FastAPI server (entry point for CLI)."""
    import uvicorn

    uvicorn.run(
        "jira_api.server:app",
        host=settings.server_host,
        port=settings.server_port,
        reload=settings.server_reload,
    )


if __name__ == "__main__":
    start_server()
