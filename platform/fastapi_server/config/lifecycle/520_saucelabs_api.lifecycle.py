"""
Sauce Labs REST API Lifecycle Hook for FastAPI

Initializes the Sauce Labs API client and registers all Sauce Labs API
proxy routes under the /~/api/rest/{api_release_date}/providers/saucelabs_api prefix.

Loading Order: 520 (after core services, GitHub SDK, and Figma SDK)

Environment Variables:
    SAUCE_USERNAME   - Sauce Labs username
    SAUCE_ACCESS_KEY - Sauce Labs access key

Usage in routes:
    from fastapi import Request

    client = request.app.state.saucelabs                       # SaucelabsClient
    clients = request.app.state.saucelabs_clients              # Domain modules dict

Registered endpoints (prefix: /~/api/rest/{api_release_date}/providers/saucelabs_api):
    GET    /health                                             - Health check
    GET    /v1/jobs                                            - List jobs
    GET    /v1/jobs/{job_id}                                   - Get job
    GET    /v1/platform/status                                 - Get platform status
    GET    /v1/platform/{automation_api}                       - Get platforms
    GET    /v1/users/{username}                                - Get user
    GET    /v1/users/{username}/concurrency                    - Get concurrency
    POST   /v1/upload                                          - Upload app
"""

import logging
import sys
from pathlib import Path
from typing import Any

from fastapi import APIRouter, FastAPI, Request
from fastapi.responses import JSONResponse

# Add polyglot saucelabs_api package and its dependencies to sys.path
_root = Path(__file__).parent.parent.parent.parent
_polyglot_path = _root / "polyglot" / "saucelabs_api" / "py"
_packages_py_path = _root / "packages_py"
if str(_packages_py_path) not in sys.path:
    sys.path.insert(0, str(_packages_py_path))
if str(_polyglot_path) not in sys.path:
    sys.path.insert(0, str(_polyglot_path))

from env_resolver import resolve_saucelabs_env
from saucelabs_api import SaucelabsClient, create_saucelabs_client
from saucelabs_api.errors import (
    SaucelabsAuthError,
    SaucelabsError,
    SaucelabsNotFoundError,
    SaucelabsRateLimitError,
    SaucelabsServerError,
    SaucelabsValidationError,
)
from saucelabs_api.modules.jobs import JobsModule
from saucelabs_api.modules.platform import PlatformModule
from saucelabs_api.modules.users import UsersModule
from saucelabs_api.modules.upload import UploadModule

logger = logging.getLogger("lifecycle.saucelabs_api")

VENDOR = "saucelabs_api"
VENDOR_VERSION = "v1"


def _error_response(exc: SaucelabsError) -> JSONResponse:
    """Convert a SaucelabsError into a JSONResponse with the correct status code."""
    if isinstance(exc, SaucelabsRateLimitError):
        retry_after = exc.retry_after or 60
        return JSONResponse(
            status_code=429,
            content={
                "error": True,
                "message": str(exc),
                "type": "SaucelabsRateLimitError",
                "context": {"retry_after": retry_after},
            },
            headers={"Retry-After": str(retry_after)},
        )
    status_map = {
        SaucelabsAuthError: 401,
        SaucelabsNotFoundError: 404,
        SaucelabsValidationError: 400,
        SaucelabsServerError: 500,
    }
    status_code = status_map.get(type(exc), exc.status_code or 500)
    return JSONResponse(
        status_code=status_code,
        content={
            "error": True,
            "message": str(exc),
            "type": type(exc).__name__,
            "context": {},
        },
    )


def _resolve_saucelabs_credentials(app: FastAPI) -> dict[str, str]:
    """Resolve Sauce Labs credentials from app config or environment variables.

    Checks app config first (providers.saucelabs.username and
    providers.saucelabs.endpoint_api_key), then falls back to
    SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables.

    Returns:
        A dict with 'username' and 'api_key' keys.

    Raises:
        RuntimeError: If credentials are not found.
    """
    config_username = None
    config_api_key = None

    # Prefer resolved_config (with {{fn:...}} templates expanded)
    resolved = getattr(app.state, "resolved_config", None)
    if resolved and isinstance(resolved, dict):
        saucelabs = (resolved.get("providers") or {}).get("saucelabs") or {}
        config_username = saucelabs.get("username")
        config_api_key = saucelabs.get("endpoint_api_key")
    elif hasattr(app.state, "config") and hasattr(app.state.config, "get_nested"):
        try:
            config_username = app.state.config.get_nested(
                "providers", "saucelabs", "username"
            )
        except Exception:
            pass
        try:
            config_api_key = app.state.config.get_nested(
                "providers", "saucelabs", "endpoint_api_key"
            )
        except Exception:
            pass

    _saucelabs_env = resolve_saucelabs_env()
    username = config_username or _saucelabs_env.username
    api_key = config_api_key or _saucelabs_env.access_key

    if not username or not api_key:
        raise RuntimeError(
            "Sauce Labs credentials not found. "
            "Set providers.saucelabs.username and providers.saucelabs.endpoint_api_key "
            "in config or SAUCE_USERNAME and SAUCE_ACCESS_KEY env vars."
        )
    return {"username": username, "api_key": api_key}


async def onStartup(app: FastAPI, config: dict[str, Any]) -> None:
    """Startup hook -- Initialize Sauce Labs API client and register routes.

    Args:
        app: FastAPI application instance.
        config: Bootstrap configuration dictionary.
    """
    logger.info("Starting saucelabs_api lifecycle hook...")
    try:
        logger.info("Initializing Sauce Labs API SDK...")

        # ── Credential Resolution ──────────────────────────────────────────
        try:
            creds = _resolve_saucelabs_credentials(app)
        except Exception as err:
            logger.warning(
                "Sauce Labs credentials not found -- SDK routes will NOT be registered. %s", err
            )
            return

        username = creds["username"]
        api_key = creds["api_key"]
        masked_key = api_key[:4] + "****" + api_key[-4:] if len(api_key) > 8 else "****"
        masked_user = username[:2] + "*******" if len(username) > 2 else "*******"
        logger.info("Sauce Labs credentials resolved (user: %s, key: %s)", masked_user, masked_key)

        # ── Base Client ───────────────────────────────────────────────────
        saucelabs = create_saucelabs_client(username=username, api_key=api_key)

        # ── Domain Modules ────────────────────────────────────────────────
        clients = {
            "jobs": saucelabs.jobs,
            "platform": saucelabs.platform,
            "users": saucelabs.users,
            "upload": saucelabs.upload,
        }

        # ── Store on app.state ────────────────────────────────────────────
        app.state.saucelabs = saucelabs
        app.state.saucelabs_clients = clients

        # ── API Release Date ──────────────────────────────────────────────
        saucelabs_api_release_date = app.state.config.get_nested(
            "api_release_date", "contract_snapshot_date", "provider_saucelabs"
        )
        PREFIX = f"/~/api/rest/{saucelabs_api_release_date}/providers/{VENDOR}"
        logger.debug("Sauce Labs API prefix: %s", PREFIX)

        # ── Route Registration ────────────────────────────────────────────
        saucelabs_api_router = APIRouter(prefix=PREFIX)

        # Health check
        @saucelabs_api_router.get("/health")
        async def saucelabs_health():
            return JSONResponse(
                content={
                    "status": "ok",
                    "vendor": VENDOR,
                    "vendor_version": VENDOR_VERSION,
                }
            )

        # v1 API routes -- Sauce Labs proxy
        v1 = APIRouter(prefix="/v1")

        # ── Jobs ──────────────────────────────────────────────────────────
        @v1.get("/jobs")
        async def list_jobs(request: Request):
            try:
                return await request.app.state.saucelabs_clients["jobs"].list(
                    params=dict(request.query_params)
                )
            except SaucelabsError as exc:
                return _error_response(exc)

        @v1.get("/jobs/{job_id}")
        async def get_job(job_id: str, request: Request):
            try:
                return await request.app.state.saucelabs_clients["jobs"].get(job_id)
            except SaucelabsError as exc:
                return _error_response(exc)

        # ── Platform ─────────────────────────────────────────────────────
        @v1.get("/platform/status")
        async def get_platform_status(request: Request):
            try:
                return await request.app.state.saucelabs_clients["platform"].get_status()
            except SaucelabsError as exc:
                return _error_response(exc)

        @v1.get("/platform/{automation_api}")
        async def get_platforms(automation_api: str, request: Request):
            try:
                return await request.app.state.saucelabs_clients["platform"].get_platforms(
                    automation_api
                )
            except SaucelabsError as exc:
                return _error_response(exc)

        # ── Users ────────────────────────────────────────────────────────
        @v1.get("/users/{username}")
        async def get_user(username: str, request: Request):
            try:
                return await request.app.state.saucelabs_clients["users"].get_user(username)
            except SaucelabsError as exc:
                return _error_response(exc)

        @v1.get("/users/{username}/concurrency")
        async def get_concurrency(username: str, request: Request):
            try:
                return await request.app.state.saucelabs_clients["users"].get_concurrency(
                    username
                )
            except SaucelabsError as exc:
                return _error_response(exc)

        # ── Upload ───────────────────────────────────────────────────────
        @v1.post("/upload")
        async def upload_app(request: Request):
            try:
                body = await request.json()
                return await request.app.state.saucelabs_clients["upload"].upload_app(body)
            except SaucelabsError as exc:
                return _error_response(exc)

        saucelabs_api_router.include_router(v1)
        app.include_router(saucelabs_api_router)

        logger.info("Sauce Labs API initialized -- routes registered at %s/*", PREFIX)
        logger.info("saucelabs_api lifecycle hook completed successfully")
    except Exception as exc:
        logger.error("saucelabs_api lifecycle hook failed: %s", exc, exc_info=True)
        raise


async def onShutdown(app: FastAPI, config: dict[str, Any]) -> None:
    """Shutdown hook -- Close the Sauce Labs API client.

    Args:
        app: FastAPI application instance.
        config: Bootstrap configuration dictionary.
    """
    logger.info("Starting saucelabs_api shutdown...")
    try:
        client: SaucelabsClient | None = getattr(app.state, "saucelabs", None)
        if client:
            logger.info("Closing Sauce Labs API client...")
            await client.close()
            logger.info("Sauce Labs API client closed")
        else:
            logger.debug("No Sauce Labs client to close")
    except Exception as exc:
        logger.error("saucelabs_api shutdown failed: %s", exc, exc_info=True)
        raise
