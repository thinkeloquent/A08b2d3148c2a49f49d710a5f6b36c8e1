"""
GitHub SDK API Component Usage Audit — FastAPI Lifecycle Hook

Registers the component usage audit route under the GitHub SDK API prefix.

Loading Order: 530 (after 500_github_sdk which provides the GitHub client)

Registered endpoints:
    POST /~/api/rest/{api_release_date}/providers/github_sdk_api_component_usage_audit/v1/audit
"""

import logging
import sys
from pathlib import Path
from typing import Any

from fastapi import APIRouter, FastAPI

# Add polyglot paths to sys.path
_root = Path(__file__).parent.parent.parent.parent
_module_path = _root / "polyglot" / "github_sdk_api_component_usage_audit" / "py"
_github_api_path = _root / "polyglot" / "github_api" / "py"
_packages_py_path = _root / "packages_py"

for _p in (_module_path, _github_api_path, _packages_py_path):
    if str(_p) not in sys.path:
        sys.path.insert(0, str(_p))

logger = logging.getLogger("lifecycle.github_sdk_api_component_usage_audit")


async def onStartup(app: FastAPI, config: dict[str, Any]) -> None:
    """Startup hook — Register component usage audit routes.

    Requires the GitHub SDK client to be initialized first (lifecycle 500).

    Args:
        app: FastAPI application instance.
        config: Bootstrap configuration dictionary.
    """
    logger.info("Starting github_sdk_api_component_usage_audit lifecycle hook...")
    try:
        # Check that github_client was initialized by 500_github_sdk
        client = getattr(app.state, "github_client", None)
        if client is None:
            logger.warning(
                "GitHub client not found on app.state — skipping route registration. "
                "Ensure 500_github_sdk lifecycle runs first."
            )
            return

        logger.debug("GitHub client found on app.state, registering audit routes")

        from github_sdk_api_component_usage_audit.routes.audit import create_router

        audit_router = create_router(client)

        # Build prefix
        api_release_date = app.state.config.get_nested(
            "api_release_date", "contract_snapshot_date", "provider_github"
        )
        PREFIX = (
            f"/~/api/rest/{api_release_date}"
            f"/providers/github_sdk_api_component_usage_audit/v1"
        )
        logger.debug("Component usage audit prefix: %s", PREFIX)

        parent_router = APIRouter(prefix=PREFIX)
        parent_router.include_router(audit_router)
        app.include_router(parent_router)

        logger.info("Routes registered at %s/*", PREFIX)
        logger.info("github_sdk_api_component_usage_audit lifecycle hook completed successfully")
    except Exception as exc:
        logger.error(
            "github_sdk_api_component_usage_audit lifecycle hook failed: %s", exc, exc_info=True
        )
        raise
