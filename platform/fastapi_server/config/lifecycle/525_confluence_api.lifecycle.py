"""
Confluence Data Center REST API v9.2.3 Lifecycle Hook for FastAPI

Initializes the Confluence API client and registers all Confluence API
proxy routes under the /~/api/rest/{api_release_date}/providers/confluence_api prefix.

Loading Order: 525 (after core services, GitHub SDK, Figma SDK, and Jira SDK)

Environment Variables:
    CONFLUENCE_BASE_URL  - Confluence Data Center base URL
    CONFLUENCE_USERNAME  - Confluence username for Basic Auth
    CONFLUENCE_API_TOKEN - Confluence API token / password

Usage in routes:
    from fastapi import Request

    client = request.app.state.confluence_api                        # ConfluenceClient
    services = request.app.state.confluence_api_services             # Service modules dict

Registered endpoints (prefix: /~/api/rest/{api_release_date}/providers/confluence_api):
    GET    /health                                             - Health check
    GET    /v9/content                                         - List content
    POST   /v9/content                                         - Create content
    GET    /v9/content/{content_id}                             - Get content
    PUT    /v9/content/{content_id}                             - Update content
    DELETE /v9/content/{content_id}                             - Delete content
    GET    /v9/search                                          - Search (CQL)
    GET    /v9/space                                           - List spaces
    POST   /v9/space                                           - Create space
    GET    /v9/space/{space_key}                                - Get space
    PUT    /v9/space/{space_key}                                - Update space
    DELETE /v9/space/{space_key}                                - Delete space
    GET    /v9/user                                            - Search users
    GET    /v9/user/current                                    - Get current user
    GET    /v9/user/anonymous                                  - Get anonymous user
    GET    /v9/group                                           - List groups
    GET    /v9/group/{group_name}/member                       - Get group members
    GET    /v9/server-information                              - Get server info
"""

import logging
import sys
from pathlib import Path
from typing import Any, Optional

from fastapi import APIRouter, FastAPI, Query, Request
from fastapi.responses import JSONResponse

_root = Path(__file__).parent.parent.parent.parent
_polyglot_path = _root / "polyglot" / "confluence_api" / "py" / "src"
_packages_py_path = _root / "packages_py"
if str(_packages_py_path) not in sys.path:
    sys.path.insert(0, str(_packages_py_path))
if str(_polyglot_path) not in sys.path:
    sys.path.insert(0, str(_polyglot_path))

from env_resolver import resolve_confluence_env
from confluence_api import AsyncConfluenceClient, ConfluenceClient
from confluence_api.exceptions import ConfluenceAPIError
from confluence_api.services.content_service import AsyncContentService, ContentService
from confluence_api.services.attachment_service import AsyncAttachmentService, AttachmentService
from confluence_api.services.search_service import AsyncSearchService, SearchService

logger = logging.getLogger("lifecycle.confluence_api")

VENDOR = "confluence_api"
VENDOR_VERSION = "v9.2.3"


def _error_response(exc: ConfluenceAPIError) -> JSONResponse:
    """Convert a ConfluenceAPIError into a JSONResponse."""
    status_code = exc.status_code or 500
    return JSONResponse(
        status_code=status_code,
        content={
            "error": True,
            "message": str(exc),
            "type": type(exc).__name__,
            "context": exc.response_data or {},
        },
    )


def _resolve_confluence_credentials(app: FastAPI) -> dict[str, str]:
    """Resolve Confluence credentials from app config or env vars."""
    config_base_url = None
    config_username = None
    config_api_token = None

    # Prefer resolved_config (with {{fn:...}} templates expanded)
    resolved = getattr(app.state, "resolved_config", None)
    if resolved and isinstance(resolved, dict):
        confluence = (resolved.get("providers") or {}).get("confluence") or {}
        config_base_url = confluence.get("base_url")
        config_username = confluence.get("username")
        config_api_token = confluence.get("endpoint_api_key")
    elif hasattr(app.state, "config") and hasattr(app.state.config, "get_nested"):
        try:
            config_base_url = app.state.config.get_nested("providers", "confluence", "base_url")
        except Exception:
            pass
        try:
            config_username = app.state.config.get_nested("providers", "confluence", "username")
        except Exception:
            pass
        try:
            config_api_token = app.state.config.get_nested("providers", "confluence", "endpoint_api_key")
        except Exception:
            pass

    _confluence_env = resolve_confluence_env()
    base_url = config_base_url or _confluence_env.base_url
    username = config_username or _confluence_env.username
    api_token = config_api_token or _confluence_env.api_token

    if not base_url or not username or not api_token:
        raise RuntimeError(
            "Confluence credentials not found. "
            "Set providers.confluence.base_url, providers.confluence.username, providers.confluence.endpoint_api_key "
            "in config or CONFLUENCE_BASE_URL, CONFLUENCE_USERNAME, CONFLUENCE_API_TOKEN env vars."
        )
    return {"base_url": base_url, "username": username, "api_token": api_token}


async def onStartup(app: FastAPI, config: dict[str, Any]) -> None:
    """Startup hook -- Initialize Confluence API client and register routes."""
    logger.info("Starting confluence_api lifecycle hook...")
    try:
        logger.info("Initializing Confluence API SDK...")

        confluence_api_release_date = app.state.config.get_nested(
            "api_release_date", "contract_snapshot_date", "provider_confluence_api"
        )
        PREFIX = f"/~/api/rest/{confluence_api_release_date}/providers/{VENDOR}"
        logger.debug("Confluence API prefix: %s", PREFIX)

        configured = False
        creds = None
        try:
            creds = _resolve_confluence_credentials(app)
            configured = True
        except Exception as err:
            logger.warning(
                "Confluence credentials not found -- v9 routes will NOT be registered. %s", err
            )

        if configured:
            base_url = creds["base_url"]
            username = creds["username"]
            api_token = creds["api_token"]
            masked_token = api_token[:4] + "****" + api_token[-4:] if len(api_token) > 8 else "****"
            masked_user = username[:2] + "*******" if len(username) > 2 else "*******"
            logger.info("Confluence credentials resolved (username: %s, token: %s)", masked_user, masked_token)

            client = AsyncConfluenceClient(base_url=base_url, username=username, api_token=api_token)

            services = {
                "content": AsyncContentService(client),
                "attachment": AsyncAttachmentService(client),
                "search": AsyncSearchService(client),
            }

            app.state.confluence_api = client
            app.state.confluence_api_services = services

        router = APIRouter(prefix=PREFIX)

        @router.get("/health")
        async def confluence_health():
            return JSONResponse(content={
                "status": "ok",
                "vendor": VENDOR,
                "vendor_version": VENDOR_VERSION,
                "configured": configured,
            })

        if configured:
            v9 = APIRouter(prefix="/v9")

            # Content
            @v9.get("/content")
            async def list_content(
                request: Request,
                type: Optional[str] = Query(None),
                spaceKey: Optional[str] = Query(None),
                title: Optional[str] = Query(None),
                status: Optional[str] = Query(None),
                expand: Optional[str] = Query(None),
                start: int = Query(0),
                limit: int = Query(25),
            ):
                try:
                    return await request.app.state.confluence_api_services["content"].get_contents(
                        type=type,
                        space_key=spaceKey,
                        title=title,
                        status=status,
                        expand=expand,
                        start=start,
                        limit=limit,
                    )
                except ConfluenceAPIError as exc:
                    return _error_response(exc)

            @v9.post("/content")
            async def create_content(request: Request):
                try:
                    body = await request.json()
                    return await request.app.state.confluence_api_services["content"].create_content(body)
                except ConfluenceAPIError as exc:
                    return _error_response(exc)

            @v9.get("/content/{content_id}")
            async def get_content(content_id: str, request: Request, expand: Optional[str] = Query(None)):
                try:
                    return await request.app.state.confluence_api_services["content"].get_content(content_id, expand=expand)
                except ConfluenceAPIError as exc:
                    return _error_response(exc)

            @v9.put("/content/{content_id}")
            async def update_content(content_id: str, request: Request):
                try:
                    body = await request.json()
                    return await request.app.state.confluence_api_services["content"].update_content(content_id, body)
                except ConfluenceAPIError as exc:
                    return _error_response(exc)

            @v9.delete("/content/{content_id}")
            async def delete_content(content_id: str, request: Request, status: Optional[str] = Query(None)):
                try:
                    return await request.app.state.confluence_api_services["content"].delete_content(content_id, status=status)
                except ConfluenceAPIError as exc:
                    return _error_response(exc)

            # Search
            @v9.get("/search")
            async def search_content(
                request: Request,
                cql: str = Query(...),
                cqlcontext: Optional[str] = Query(None),
                excerpt: Optional[str] = Query(None),
                expand: Optional[str] = Query(None),
                start: int = Query(0),
                limit: int = Query(25),
            ):
                try:
                    return await request.app.state.confluence_api_services["search"].search(
                        cql=cql,
                        cqlcontext=cqlcontext,
                        excerpt=excerpt,
                        expand=expand,
                        start=start,
                        limit=limit,
                    )
                except ConfluenceAPIError as exc:
                    return _error_response(exc)

            # Space
            @v9.get("/space")
            async def list_spaces(
                request: Request,
                spaceKey: Optional[str] = Query(None),
                type: Optional[str] = Query(None),
                status: Optional[str] = Query(None),
                expand: Optional[str] = Query(None),
                start: int = Query(0),
                limit: int = Query(25),
            ):
                try:
                    params: dict[str, Any] = {"start": start, "limit": limit}
                    if spaceKey is not None:
                        params["spaceKey"] = spaceKey
                    if type is not None:
                        params["type"] = type
                    if status is not None:
                        params["status"] = status
                    if expand is not None:
                        params["expand"] = expand
                    return await request.app.state.confluence_api.get("space", params=params)
                except ConfluenceAPIError as exc:
                    return _error_response(exc)

            @v9.post("/space")
            async def create_space(request: Request):
                try:
                    body = await request.json()
                    return await request.app.state.confluence_api.post("space", json_data=body)
                except ConfluenceAPIError as exc:
                    return _error_response(exc)

            @v9.get("/space/{space_key}")
            async def get_space(space_key: str, request: Request, expand: Optional[str] = Query(None)):
                try:
                    params: dict[str, Any] = {}
                    if expand is not None:
                        params["expand"] = expand
                    return await request.app.state.confluence_api.get(f"space/{space_key}", params=params or None)
                except ConfluenceAPIError as exc:
                    return _error_response(exc)

            @v9.put("/space/{space_key}")
            async def update_space(space_key: str, request: Request):
                try:
                    body = await request.json()
                    return await request.app.state.confluence_api.put(f"space/{space_key}", json_data=body)
                except ConfluenceAPIError as exc:
                    return _error_response(exc)

            @v9.delete("/space/{space_key}")
            async def delete_space(space_key: str, request: Request):
                try:
                    return await request.app.state.confluence_api.delete(f"space/{space_key}")
                except ConfluenceAPIError as exc:
                    return _error_response(exc)

            # User
            @v9.get("/user")
            async def search_users(
                request: Request,
                username: Optional[str] = Query(None),
                key: Optional[str] = Query(None),
                expand: Optional[str] = Query(None),
            ):
                try:
                    params: dict[str, Any] = {}
                    if username is not None:
                        params["username"] = username
                    if key is not None:
                        params["key"] = key
                    if expand is not None:
                        params["expand"] = expand
                    return await request.app.state.confluence_api.get("user", params=params or None)
                except ConfluenceAPIError as exc:
                    return _error_response(exc)

            @v9.get("/user/current")
            async def get_current_user(request: Request, expand: Optional[str] = Query(None)):
                try:
                    params: dict[str, Any] = {}
                    if expand is not None:
                        params["expand"] = expand
                    return await request.app.state.confluence_api.get("user/current", params=params or None)
                except ConfluenceAPIError as exc:
                    return _error_response(exc)

            @v9.get("/user/anonymous")
            async def get_anonymous_user(request: Request, expand: Optional[str] = Query(None)):
                try:
                    params: dict[str, Any] = {}
                    if expand is not None:
                        params["expand"] = expand
                    return await request.app.state.confluence_api.get("user/anonymous", params=params or None)
                except ConfluenceAPIError as exc:
                    return _error_response(exc)

            # Group
            @v9.get("/group")
            async def list_groups(
                request: Request,
                expand: Optional[str] = Query(None),
                start: int = Query(0),
                limit: int = Query(25),
            ):
                try:
                    params: dict[str, Any] = {"start": start, "limit": limit}
                    if expand is not None:
                        params["expand"] = expand
                    return await request.app.state.confluence_api.get("group", params=params)
                except ConfluenceAPIError as exc:
                    return _error_response(exc)

            @v9.get("/group/{group_name}/member")
            async def get_group_members(
                group_name: str,
                request: Request,
                expand: Optional[str] = Query(None),
                start: int = Query(0),
                limit: int = Query(25),
            ):
                try:
                    params: dict[str, Any] = {"start": start, "limit": limit}
                    if expand is not None:
                        params["expand"] = expand
                    return await request.app.state.confluence_api.get(f"group/{group_name}/member", params=params)
                except ConfluenceAPIError as exc:
                    return _error_response(exc)

            # System
            @v9.get("/server-information")
            async def get_server_information(request: Request):
                try:
                    return await request.app.state.confluence_api.get("settings/lookandfeel/../../../rest/api/server-information")
                except ConfluenceAPIError:
                    pass
                try:
                    return await request.app.state.confluence_api.get("server-information")
                except ConfluenceAPIError as exc:
                    return _error_response(exc)

            router.include_router(v9)

        app.include_router(router)

        if configured:
            logger.info("Confluence API initialized -- routes registered at %s/*", PREFIX)
        else:
            logger.info(
                "Health endpoint registered at %s/health (v9 routes skipped -- no credentials)",
                PREFIX,
            )

        logger.info("confluence_api lifecycle hook completed successfully")
    except Exception as exc:
        logger.error("confluence_api lifecycle hook failed: %s", exc, exc_info=True)
        raise


async def onShutdown(app: FastAPI, config: dict[str, Any]) -> None:
    """Shutdown hook -- Close the Confluence API client."""
    logger.info("Starting confluence_api shutdown...")
    try:
        client: AsyncConfluenceClient | None = getattr(app.state, "confluence_api", None)
        if client:
            logger.info("Closing Confluence API client...")
            await client.aclose()
            logger.info("Confluence API client closed")
        else:
            logger.debug("No Confluence API client to close")
    except Exception as exc:
        logger.error("confluence_api shutdown failed: %s", exc, exc_info=True)
        raise
