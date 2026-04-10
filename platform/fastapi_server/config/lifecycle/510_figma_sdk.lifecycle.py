"""
Figma API SDK Lifecycle Hook for FastAPI

Initializes the Figma API SDK client and registers all Figma API routes
under the /~/api/rest/{api_release_date}/providers/figma_api prefix.

Loading Order: 510 (after core services and GitHub SDK, before static apps)

Environment Variables:
    FIGMA_TOKEN / FIGMA_ACCESS_TOKEN - Figma API token

Usage in routes:
    from fastapi import Request

    client = request.app.state.figma_client                  # Base FigmaClient
    clients = request.app.state.figma_clients                # Domain clients dict
    files = request.app.state.files_client                   # FilesClient
    projects = request.app.state.projects_client             # ProjectsClient

Registered endpoints (prefix: /~/api/rest/{api_release_date}/providers/figma_api):
    GET    /health                                           - Health check
    GET    /v1/files/{file_key}                              - Get file
    GET    /v1/files/{file_key}/nodes                        - Get file nodes
    GET    /v1/images/{file_key}                             - Get images
    GET    /v1/files/{file_key}/images                       - Get image fills
    GET    /v1/files/{file_key}/versions                     - Get file versions
    GET    /v1/teams/{team_id}/projects                      - List team projects
    GET    /v1/projects/{project_id}/files                   - List project files
    GET    /v1/files/{file_key}/comments                     - List comments
    POST   /v1/files/{file_key}/comments                     - Add comment
    DELETE /v1/files/{file_key}/comments/{comment_id}        - Delete comment
    GET    /v1/components/{key}                              - Get component
    GET    /v1/files/{file_key}/components                   - List file components
    GET    /v1/teams/{team_id}/components                    - List team components
    GET    /v1/component_sets/{key}                          - Get component set
    GET    /v1/teams/{team_id}/component_sets                - List team component sets
    GET    /v1/teams/{team_id}/styles                        - List team styles
    GET    /v1/styles/{key}                                  - Get style
    GET    /v1/files/{file_key}/variables/local              - Get local variables
    GET    /v1/files/{file_key}/variables/published          - Get published variables
    POST   /v1/files/{file_key}/variables                    - Create variables
    GET    /v1/files/{file_key}/dev_resources                - List dev resources
    POST   /v1/files/{file_key}/dev_resources                - Create dev resource
    PUT    /v1/files/{file_key}/dev_resources                - Update dev resources
    DELETE /v1/files/{file_key}/dev_resources/{dev_resource_id} - Delete dev resource
    GET    /v1/analytics/libraries/{team_id}/actions         - Library actions
    GET    /v1/analytics/libraries/{team_id}/usages          - Library usages
    GET    /v2/webhooks/{webhook_id}                         - Get webhook
    GET    /v2/teams/{team_id}/webhooks                      - List team webhooks
    POST   /v2/webhooks                                      - Create webhook
    PUT    /v2/webhooks/{webhook_id}                         - Update webhook
    DELETE /v2/webhooks/{webhook_id}                         - Delete webhook
    GET    /v2/webhooks/{webhook_id}/requests                - List webhook requests
    GET    /openapi.yaml                                     - OpenAPI spec (YAML)
    GET    /openapi.json                                     - OpenAPI spec (JSON)
    GET    /docs/endpoints                                   - Endpoint summary table
    GET    /docs/curl                                        - Curl cheat-sheet
"""

import logging
import sys
from pathlib import Path
from typing import Any

from fastapi import APIRouter, FastAPI

# Add polyglot figma_api package and its dependencies to sys.path
_root = Path(__file__).parent.parent.parent.parent
_polyglot_path = _root / "polyglot" / "figma_api" / "py"
_packages_py_path = _root / "packages_py"
if str(_packages_py_path) not in sys.path:
    sys.path.insert(0, str(_packages_py_path))
if str(_polyglot_path) not in sys.path:
    sys.path.insert(0, str(_polyglot_path))

# OpenAPI spec and docs paths
_figma_docs_dir = (
    _root / "__SPECS__" / "mta-SPECS" / "v800" / "CODE"
    / "figma-api-module-main" / "docs"
)
_openapi_table_path = _figma_docs_dir / "figma.v3.1.0.openapi.table.md"
_openapi_curl_path = _figma_docs_dir / "figma.v3.1.0.curl.md"

from figma_api.sdk import (
    FigmaClient,
    ProjectsClient,
    FilesClient,
    CommentsClient,
    ComponentsClient,
    VariablesClient,
    DevResourcesClient,
    LibraryAnalyticsClient,
    WebhooksClient,
    resolve_token,
    mask_token,
)
from figma_api.middleware.error_handler import register_error_handlers
from figma_api.routes.health import router as health_router
from figma_api.routes.projects import router as projects_router
from figma_api.routes.files import router as files_router
from figma_api.routes.comments import router as comments_router
from figma_api.routes.components import router as components_router
from figma_api.routes.variables import router as variables_router
from figma_api.routes.dev_resources import router as dev_resources_router
from figma_api.routes.library_analytics import router as library_analytics_router
from figma_api.routes.webhooks import router as webhooks_router

logger = logging.getLogger("lifecycle.figma_sdk")

VENDOR = "figma_api"


def onInit(app: FastAPI, config: dict[str, Any]) -> None:
    """Init hook -- Register exception handlers before middleware stack is built.

    FastAPI's ExceptionMiddleware captures a snapshot of app.exception_handlers
    when the middleware stack is built (on first ASGI event). Handlers registered
    later (e.g. during onStartup/lifespan) are invisible to it. This hook runs
    before the ASGI app starts, ensuring handlers are in place.

    Args:
        app: FastAPI application instance.
        config: Bootstrap configuration dictionary.
    """
    register_error_handlers(app)


def _resolve_figma_token(app: FastAPI):
    """Resolve Figma token from app config or environment variables.

    Checks app config first (providers.figma.token), then falls back
    to the SDK's resolve_token which checks FIGMA_TOKEN,
    FIGMA_ACCESS_TOKEN environment variables.

    Returns:
        TokenInfo with token and source fields.
    """
    config_token = None
    # Prefer resolved_config (with {{fn:...}} templates expanded)
    resolved = getattr(app.state, "resolved_config", None)
    if resolved and isinstance(resolved, dict):
        figma = (resolved.get("providers") or {}).get("figma") or {}
        config_token = figma.get("token")
    elif hasattr(app.state, "config") and hasattr(app.state.config, "get_nested"):
        try:
            config_token = app.state.config.get_nested("providers", "figma", "token")
        except Exception:
            pass

    return resolve_token(config_token or None)


async def onStartup(app: FastAPI, config: dict[str, Any]) -> None:
    """Startup hook -- Initialize Figma SDK client and register routes.

    Args:
        app: FastAPI application instance.
        config: Bootstrap configuration dictionary.
    """
    logger.info("Starting figma_sdk lifecycle hook...")
    try:
        logger.info("Initializing Figma API SDK...")

        # ── Token Resolution ──────────────────────────────────────────────
        try:
            token_info = _resolve_figma_token(app)
        except Exception as err:
            logger.warning(
                "Figma token not found -- SDK routes will NOT be registered. %s", err
            )
            return

        logger.info("Token resolved from %s", token_info.source)
        logger.info("Masked token: %s", mask_token(token_info.token))

        # ── Base Client ───────────────────────────────────────────────────
        figma = FigmaClient(
            token=token_info.token,
            rate_limit_auto_wait=True,
        )

        # ── Domain Clients ────────────────────────────────────────────────
        projects = ProjectsClient(figma)
        files = FilesClient(figma)
        comments = CommentsClient(figma)
        components = ComponentsClient(figma)
        variables = VariablesClient(figma)
        dev_resources = DevResourcesClient(figma)
        library_analytics = LibraryAnalyticsClient(figma)
        webhooks = WebhooksClient(figma)

        clients = {
            "projects": projects,
            "files": files,
            "comments": comments,
            "components": components,
            "variables": variables,
            "dev_resources": dev_resources,
            "library_analytics": library_analytics,
            "webhooks": webhooks,
        }

        # ── Store on app.state ────────────────────────────────────────────
        # Base client and clients dict
        app.state.figma_client = figma
        app.state.figma_clients = clients

        # Individual domain clients (required by route dependency injection)
        app.state.projects_client = projects
        app.state.files_client = files
        app.state.comments_client = comments
        app.state.components_client = components
        app.state.variables_client = variables
        app.state.dev_resources_client = dev_resources
        app.state.library_analytics_client = library_analytics
        app.state.webhooks_client = webhooks

        # ── API Release Date ─────────────────────────────────────────────
        figma_api_release_date = app.state.config.get_nested(
            "api_release_date", "contract_snapshot_date", "provider_figma"
        )
        PREFIX = f"/~/api/rest/{figma_api_release_date}/providers/{VENDOR}"
        logger.debug("Figma API prefix: %s", PREFIX)

        # ── Route Registration ────────────────────────────────────────────
        figma_api_router = APIRouter(prefix=PREFIX)

        # Health routes at prefix root
        figma_api_router.include_router(health_router)

        # v1 API routes
        v1 = APIRouter(prefix="/v1")
        v1.include_router(projects_router)
        v1.include_router(files_router)
        v1.include_router(comments_router)
        v1.include_router(components_router)
        v1.include_router(variables_router)
        v1.include_router(dev_resources_router)
        v1.include_router(library_analytics_router)
        figma_api_router.include_router(v1)

        # v2 API routes (webhooks)
        v2 = APIRouter(prefix="/v2")
        v2.include_router(webhooks_router)
        figma_api_router.include_router(v2)

        # Documentation routes (file-based)
        from fastapi.responses import Response

        docs_router = APIRouter(tags=["openapi-docs"])

        if _openapi_table_path.is_file():
            table_md = _openapi_table_path.read_text(encoding="utf-8")
            logger.debug("Loaded Figma OpenAPI table docs from %s", _openapi_table_path)

            @docs_router.get("/docs/endpoints")
            async def figma_docs_endpoints():
                return Response(content=table_md, media_type="text/markdown")

        if _openapi_curl_path.is_file():
            curl_md = _openapi_curl_path.read_text(encoding="utf-8")
            logger.debug("Loaded Figma curl docs from %s", _openapi_curl_path)

            @docs_router.get("/docs/curl")
            async def figma_docs_curl():
                return Response(content=curl_md, media_type="text/markdown")

        figma_api_router.include_router(docs_router)

        app.include_router(figma_api_router)

        logger.info("Figma API SDK initialized -- routes registered at %s/*", PREFIX)
        logger.info("figma_sdk lifecycle hook completed successfully")
    except Exception as exc:
        logger.error("figma_sdk lifecycle hook failed: %s", exc, exc_info=True)
        raise


async def onShutdown(app: FastAPI, config: dict[str, Any]) -> None:
    """Shutdown hook -- Close the Figma SDK client.

    Args:
        app: FastAPI application instance.
        config: Bootstrap configuration dictionary.
    """
    logger.info("Starting figma_sdk shutdown...")
    try:
        client: FigmaClient | None = getattr(app.state, "figma_client", None)
        if client:
            logger.info("Closing Figma SDK client...")
            await client.close()
            logger.info("Figma SDK client closed")
        else:
            logger.debug("No Figma SDK client to close")
    except Exception as exc:
        logger.error("figma_sdk shutdown failed: %s", exc, exc_info=True)
        raise
