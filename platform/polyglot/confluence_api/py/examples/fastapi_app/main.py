"""
FastAPI Integration Example — Confluence API

Demonstrates how to integrate the confluence_api package into a FastAPI application
with dependency injection, typed responses, and middleware patterns.

Usage:
    uvicorn fastapi_app.main:app --reload --port 9000

Prerequisites:
    pip install -e ".[dev]"    (from the py/ directory)

Environment Variables:
    CONFLUENCE_BASE_URL   — e.g. https://confluence.example.com
    CONFLUENCE_USERNAME   — Confluence username
    CONFLUENCE_API_TOKEN  — Confluence API token / password
    SERVER_API_KEY        — Optional API key for this server
    LOG_LEVEL             — Optional (default: INFO)
"""

from __future__ import annotations

import copy
import os
import tempfile
import uuid
from contextlib import asynccontextmanager
from typing import Annotated, Any, Optional

import uvicorn
from fastapi import Depends, FastAPI, HTTPException, Query, Request, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from pydantic import BaseModel

from confluence_api.config import get_config, load_config_from_env
from confluence_api.core.client import ConfluenceClient
from confluence_api.exceptions import ConfluenceAPIError
from confluence_api.logger import create_logger
from confluence_api.services.attachment_service import AttachmentService
from confluence_api.services.content_service import ContentService
from confluence_api.services.label_service import LabelService
from confluence_api.services.search_service import SearchService
from confluence_api.services.space_service import SpaceService
from confluence_api.services.system_service import SystemService
from confluence_api.services.user_service import UserService

log = create_logger("confluence-api-example", __file__)
security = HTTPBasic(auto_error=False)

# ─── Configuration ─────────────────────────────────────────────────────────────

SERVER_API_KEY = os.environ.get("SERVER_API_KEY", "")

MOCK_CONFIG: dict[str, Any] = {
    "title": "Confluence API Example Server",
    "version": "0.1.0",
    "log_level": os.environ.get("LOG_LEVEL", "INFO"),
}


# ─── Pydantic Response Models ─────────────────────────────────────────────────


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    confluence_configured: bool


class MessageResponse(BaseModel):
    message: str


# ─── Lifespan ──────────────────────────────────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — startup and shutdown logic."""
    log.info("Starting Confluence API example server")
    config = load_config_from_env()
    app.state.confluence_config = config
    app.state.initial_state = {"request_count": 0}
    if config.get("base_url") and config.get("username") and config.get("api_token"):
        log.info("Confluence configured", {"base_url": config["base_url"]})
    else:
        log.warning("No Confluence configuration found — set CONFLUENCE_BASE_URL, CONFLUENCE_USERNAME, CONFLUENCE_API_TOKEN")
    yield
    log.info("Shutting down Confluence API example server")


app = FastAPI(
    title=MOCK_CONFIG["title"],
    version=MOCK_CONFIG["version"],
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Middleware ─────────────────────────────────────────────────────────────────


@app.middleware("http")
async def init_request_state(request: Request, call_next):
    """Middleware to initialize per-request state with unique ID."""
    request.state.request_id = str(uuid.uuid4())
    request.state.data = copy.deepcopy(getattr(app.state, "initial_state", {}))
    request.state.data["request_count"] = request.state.data.get("request_count", 0) + 1
    response = await call_next(request)
    response.headers["X-Request-ID"] = request.state.request_id
    return response


# ─── Dependencies ──────────────────────────────────────────────────────────────


def get_app_config(request: Request) -> dict[str, Any]:
    """Return the application config dict."""
    return MOCK_CONFIG


def verify_api_key(
    credentials: HTTPBasicCredentials | None = Depends(security),
) -> bool:
    """Verify API key if SERVER_API_KEY is configured."""
    if not SERVER_API_KEY:
        return True
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Basic"},
        )
    if credentials.username != SERVER_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
            headers={"WWW-Authenticate": "Basic"},
        )
    return True


def get_confluence_client(request: Request) -> ConfluenceClient:
    """Get a ConfluenceClient from the app-level configuration."""
    config: dict[str, Any] = getattr(request.app.state, "confluence_config", {})
    base_url = config.get("base_url")
    username = config.get("username")
    api_token = config.get("api_token")
    if not base_url or not username or not api_token:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Confluence is not configured. Set CONFLUENCE_BASE_URL, CONFLUENCE_USERNAME, CONFLUENCE_API_TOKEN.",
        )
    return ConfluenceClient(
        base_url=base_url,
        username=username,
        api_token=api_token,
    )


# Type aliases for dependency injection
AppConfig = Annotated[dict[str, Any], Depends(get_app_config)]
Auth = Annotated[bool, Depends(verify_api_key)]
Client = Annotated[ConfluenceClient, Depends(get_confluence_client)]


# ─── Routes: Health ────────────────────────────────────────────────────────────


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check(config: AppConfig, request: Request) -> HealthResponse:
    """Health check endpoint with Confluence configuration status."""
    cfg = getattr(request.app.state, "confluence_config", {})
    configured = bool(cfg.get("base_url") and cfg.get("username") and cfg.get("api_token"))
    return HealthResponse(
        status="healthy",
        service=config["title"],
        version=config["version"],
        confluence_configured=configured,
    )


# ─── Routes: Content ──────────────────────────────────────────────────────────


@app.get("/content", tags=["Content"])
async def list_content(
    type: str | None = Query(None, description="Content type filter (page, blogpost)"),
    space_key: str | None = Query(None, alias="spaceKey", description="Space key"),
    limit: int = Query(25, ge=1, le=100),
    start: int = Query(0, ge=0),
    _auth: Auth = True,
    client: Client = None,
) -> dict[str, Any]:
    """List content with optional filters."""
    try:
        with client:
            return ContentService(client).get_contents(
                type=type, space_key=space_key, limit=limit, start=start,
            )
    except ConfluenceAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


@app.get("/content/{content_id}", tags=["Content"])
async def get_content(
    content_id: str,
    expand: str | None = Query(None, description="Fields to expand"),
    _auth: Auth = True,
    client: Client = None,
) -> dict[str, Any]:
    """Get a single piece of content by ID."""
    try:
        with client:
            return ContentService(client).get_content(content_id, expand=expand)
    except ConfluenceAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


@app.post("/content", tags=["Content"])
async def create_content(
    body: dict[str, Any],
    _auth: Auth = True,
    client: Client = None,
) -> dict[str, Any]:
    """Create new content (page, blog post)."""
    try:
        with client:
            return ContentService(client).create_content(body)
    except ConfluenceAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


@app.delete("/content/{content_id}", tags=["Content"])
async def delete_content(
    content_id: str,
    _auth: Auth = True,
    client: Client = None,
) -> MessageResponse:
    """Delete content by ID."""
    try:
        with client:
            ContentService(client).delete_content(content_id)
            return MessageResponse(message=f"Content {content_id} deleted")
    except ConfluenceAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


# ─── Routes: Content Labels ──────────────────────────────────────────────────


@app.get("/content/{content_id}/labels", tags=["Content"])
async def get_content_labels(
    content_id: str,
    _auth: Auth = True,
    client: Client = None,
) -> dict[str, Any]:
    """Get labels on a piece of content."""
    try:
        with client:
            return ContentService(client).get_labels(content_id)
    except ConfluenceAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


@app.post("/content/{content_id}/labels", tags=["Content"])
async def add_content_labels(
    content_id: str,
    labels: list[dict[str, str]],
    _auth: Auth = True,
    client: Client = None,
) -> dict[str, Any]:
    """Add labels to a piece of content."""
    try:
        with client:
            return ContentService(client).add_labels(content_id, labels)
    except ConfluenceAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


# ─── Routes: Attachments ─────────────────────────────────────────────────────


@app.get("/content/{content_id}/attachments", tags=["Attachments"])
async def list_attachments(
    content_id: str,
    limit: int = Query(25, ge=1, le=100),
    start: int = Query(0, ge=0),
    _auth: Auth = True,
    client: Client = None,
) -> dict[str, Any]:
    """List attachments on a piece of content."""
    try:
        with client:
            return AttachmentService(client).get_attachments(content_id, limit=limit, start=start)
    except ConfluenceAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


@app.post("/content/{content_id}/attachments", tags=["Attachments"])
async def upload_attachment(
    content_id: str,
    file: UploadFile,
    comment: str | None = Query(None),
    _auth: Auth = True,
    client: Client = None,
) -> dict[str, Any]:
    """Upload a file attachment to a piece of content."""
    try:
        with client:
            # Write uploaded file to temp location for the service
            with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file.filename}") as tmp:
                content = await file.read()
                tmp.write(content)
                tmp_path = tmp.name
            try:
                return AttachmentService(client).create_attachment(
                    content_id=content_id,
                    file_path=tmp_path,
                    comment=comment,
                )
            finally:
                os.unlink(tmp_path)
    except ConfluenceAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


@app.delete("/content/{content_id}/attachments/{attachment_id}", tags=["Attachments"])
async def delete_attachment(
    content_id: str,
    attachment_id: str,
    _auth: Auth = True,
    client: Client = None,
) -> MessageResponse:
    """Delete an attachment from a piece of content."""
    try:
        with client:
            AttachmentService(client).delete_attachment(content_id, attachment_id)
            return MessageResponse(message=f"Attachment {attachment_id} deleted")
    except ConfluenceAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


# ─── Routes: Spaces ───────────────────────────────────────────────────────────


@app.get("/spaces", tags=["Spaces"])
async def list_spaces(
    limit: int = Query(25, ge=1, le=100),
    start: int = Query(0, ge=0),
    _auth: Auth = True,
    client: Client = None,
) -> dict[str, Any]:
    """List all spaces."""
    try:
        with client:
            return SpaceService(client).get_spaces(limit=limit, start=start)
    except ConfluenceAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


@app.get("/spaces/{space_key}", tags=["Spaces"])
async def get_space(
    space_key: str,
    expand: str | None = Query(None),
    _auth: Auth = True,
    client: Client = None,
) -> dict[str, Any]:
    """Get a single space by key."""
    try:
        with client:
            return SpaceService(client).get_space(space_key, expand=expand)
    except ConfluenceAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


# ─── Routes: Search ───────────────────────────────────────────────────────────


@app.get("/search", tags=["Search"])
async def search_content(
    cql: str = Query(..., description="CQL query string"),
    limit: int = Query(25, ge=1, le=200),
    start: int = Query(0, ge=0),
    _auth: Auth = True,
    client: Client = None,
) -> dict[str, Any]:
    """Search content using CQL (Confluence Query Language)."""
    try:
        with client:
            return SearchService(client).search_content(cql, limit=limit, start=start)
    except ConfluenceAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


# ─── Routes: Users ─────────────────────────────────────────────────────────────


@app.get("/user/current", tags=["Users"])
async def get_current_user(
    _auth: Auth = True,
    client: Client = None,
) -> dict[str, Any]:
    """Get the current authenticated user."""
    try:
        with client:
            return UserService(client).get_current_user()
    except ConfluenceAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


@app.get("/user/{username}", tags=["Users"])
async def get_user(
    username: str,
    _auth: Auth = True,
    client: Client = None,
) -> dict[str, Any]:
    """Get a user by username."""
    try:
        with client:
            return UserService(client).get_user(username)
    except ConfluenceAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


# ─── Routes: Labels ──────────────────────────────────────────────────────────


@app.get("/labels/recent", tags=["Labels"])
async def get_recent_labels(
    _auth: Auth = True,
    client: Client = None,
) -> dict[str, Any]:
    """Get recently used labels."""
    try:
        with client:
            return LabelService(client).get_recent_labels()
    except ConfluenceAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


@app.get("/labels/{label_name}/related", tags=["Labels"])
async def get_related_labels(
    label_name: str,
    _auth: Auth = True,
    client: Client = None,
) -> dict[str, Any]:
    """Get labels related to the specified label."""
    try:
        with client:
            return LabelService(client).get_related_labels(label_name)
    except ConfluenceAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


# ─── Routes: System ───────────────────────────────────────────────────────────


@app.get("/system/info", tags=["System"])
async def get_server_info(
    _auth: Auth = True,
    client: Client = None,
) -> dict[str, Any]:
    """Get Confluence server information."""
    try:
        with client:
            return SystemService(client).get_server_info()
    except ConfluenceAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


@app.get("/system/metrics", tags=["System"])
async def get_instance_metrics(
    _auth: Auth = True,
    client: Client = None,
) -> dict[str, Any]:
    """Get Confluence instance metrics."""
    try:
        with client:
            return SystemService(client).get_instance_metrics()
    except ConfluenceAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


# ─── Routes: Config / Debug ────────────────────────────────────────────────────


@app.get("/config", tags=["Debug"])
async def get_config_endpoint(config: AppConfig) -> dict[str, Any]:
    """Return the application configuration (non-sensitive)."""
    return config


@app.get("/state", tags=["Debug"])
async def get_request_state(request: Request) -> dict[str, Any]:
    """Return the per-request state (demonstrates middleware)."""
    return {
        "request_id": request.state.request_id,
        "data": request.state.data,
    }


# ─── Entry Point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run(
        "fastapi_app.main:app",
        host="0.0.0.0",
        port=9000,
        reload=True,
    )
