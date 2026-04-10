"""
Jira REST API v3 Lifecycle Hook for FastAPI

Initializes the Jira API client and registers all Jira API
proxy routes under the /~/api/rest/{api_release_date}/providers/jira_api prefix.

Loading Order: 520 (after core services, GitHub SDK, and Figma SDK)

Environment Variables:
    JIRA_BASE_URL  - Jira Cloud base URL
    JIRA_EMAIL     - Jira user email
    JIRA_API_TOKEN - Jira API token

Usage in routes:
    from fastapi import Request

    client = request.app.state.jira_api                        # JiraClient
    services = request.app.state.jira_api_services             # Service modules dict

Registered endpoints (prefix: /~/api/rest/{api_release_date}/providers/jira_api):
    GET    /health                                             - Health check
    GET    /v3/users/search                                    - Search users
    GET    /v3/users/{identifier}                              - Get user
    POST   /v3/issues                                          - Create issue
    GET    /v3/issues/{issue_key}                               - Get issue
    PATCH  /v3/issues/{issue_key}                               - Update issue
    PUT    /v3/issues/{issue_key}/assign/{email}                - Assign issue
    GET    /v3/issues/{issue_key}/transitions                   - Get transitions
    POST   /v3/issues/{issue_key}/transitions                   - Transition issue
    GET    /v3/projects/{project_key}                            - Get project
    GET    /v3/projects/{project_key}/versions                   - Get versions
    POST   /v3/projects/{project_key}/versions                   - Create version
"""

import logging
import sys
from pathlib import Path
from typing import Any, Optional

from fastapi import APIRouter, FastAPI, Query, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

_root = Path(__file__).parent.parent.parent.parent
_polyglot_path = _root / "polyglot" / "jira_api" / "py" / "src"
_packages_py_path = _root / "packages_py"
if str(_packages_py_path) not in sys.path:
    sys.path.insert(0, str(_packages_py_path))
if str(_polyglot_path) not in sys.path:
    sys.path.insert(0, str(_polyglot_path))

from env_resolver import resolve_jira_env
from jira_api import AsyncJiraClient, JiraClient
from jira_api.exceptions import JiraAPIError
from jira_api.models.issue import IssueCreate, IssueUpdate
from jira_api.services.issue_service import AsyncIssueService, IssueService
from jira_api.services.project_service import AsyncProjectService, ProjectService
from jira_api.services.user_service import AsyncUserService, UserService

logger = logging.getLogger("lifecycle.jira_api")

VENDOR = "jira_api"
VENDOR_VERSION = "v3"


def _error_response(exc: JiraAPIError) -> JSONResponse:
    """Convert a JiraAPIError into a JSONResponse."""
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


def _resolve_jira_credentials(app: FastAPI) -> dict[str, str]:
    """Resolve Jira credentials from app config or env vars."""
    config_base_url = None
    config_email = None
    config_api_token = None

    # Prefer resolved_config (with {{fn:...}} templates expanded)
    resolved = getattr(app.state, "resolved_config", None)
    if resolved and isinstance(resolved, dict):
        jira = (resolved.get("providers") or {}).get("jira") or {}
        config_base_url = jira.get("base_url")
        config_email = jira.get("email")
        config_api_token = jira.get("endpoint_api_key")
    elif hasattr(app.state, "config") and hasattr(app.state.config, "get_nested"):
        try:
            config_base_url = app.state.config.get_nested("providers", "jira", "base_url")
        except Exception:
            pass
        try:
            config_email = app.state.config.get_nested("providers", "jira", "email")
        except Exception:
            pass
        try:
            config_api_token = app.state.config.get_nested("providers", "jira", "endpoint_api_key")
        except Exception:
            pass

    _jira_env = resolve_jira_env()
    base_url = config_base_url or _jira_env.base_url
    email = config_email or _jira_env.email
    api_token = config_api_token or _jira_env.api_token

    if not base_url or not email or not api_token:
        raise RuntimeError(
            "Jira credentials not found. "
            "Set providers.jira.base_url, providers.jira.email, providers.jira.endpoint_api_key "
            "in config or JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN env vars."
        )
    return {"base_url": base_url, "email": email, "api_token": api_token}


class TransitionRequest(BaseModel):
    transition_name: str
    comment: Optional[str] = None
    resolution_name: Optional[str] = None


class VersionCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None


async def onStartup(app: FastAPI, config: dict[str, Any]) -> None:
    """Startup hook -- Initialize Jira API client and register routes."""
    logger.info("Starting jira_api lifecycle hook...")
    try:
        logger.info("Initializing Jira API SDK...")

        jira_api_release_date = app.state.config.get_nested(
            "api_release_date", "contract_snapshot_date", "provider_jira"
        )
        PREFIX = f"/~/api/rest/{jira_api_release_date}/providers/{VENDOR}"
        logger.debug("Jira API prefix: %s", PREFIX)

        configured = False
        creds = None
        try:
            creds = _resolve_jira_credentials(app)
            configured = True
        except Exception as err:
            logger.warning("Jira credentials not found -- v3 routes will NOT be registered. %s", err)

        if configured:
            base_url = creds["base_url"]
            email = creds["email"]
            api_token = creds["api_token"]
            masked_token = api_token[:4] + "****" + api_token[-4:] if len(api_token) > 8 else "****"
            masked_email = email[:2] + "*******" if len(email) > 2 else "*******"
            logger.info("Jira credentials resolved (email: %s, token: %s)", masked_email, masked_token)

            client = AsyncJiraClient(base_url=base_url, email=email, api_token=api_token)

            services = {
                "users": AsyncUserService(client),
                "issues": AsyncIssueService(client),
                "projects": AsyncProjectService(client),
            }

            app.state.jira_api = client
            app.state.jira_api_services = services

        router = APIRouter(prefix=PREFIX)

        @router.get("/health")
        async def jira_health():
            return JSONResponse(content={
                "status": "ok",
                "vendor": VENDOR,
                "vendor_version": VENDOR_VERSION,
                "configured": configured,
            })

        if configured:
            v3 = APIRouter(prefix="/v3")

            # Users
            @v3.get("/users/search")
            async def search_users(request: Request, query: str = Query(...), max_results: int = Query(50)):
                try:
                    return await request.app.state.jira_api_services["users"].search_users(query, max_results)
                except JiraAPIError as exc:
                    return _error_response(exc)

            @v3.get("/users/{identifier}")
            async def get_user(identifier: str, request: Request):
                try:
                    user = await request.app.state.jira_api_services["users"].get_user_by_identifier(identifier)
                    if not user:
                        return JSONResponse(status_code=404, content={"error": True, "message": f"User '{identifier}' not found"})
                    return user
                except JiraAPIError as exc:
                    return _error_response(exc)

            # Issues
            @v3.post("/issues")
            async def create_issue(issue_data: IssueCreate, request: Request):
                try:
                    svc = request.app.state.jira_api_services["issues"]
                    return await svc.create_issue(
                        project_id=issue_data.project_id,
                        summary=issue_data.summary,
                        issue_type_id=issue_data.issue_type_id,
                        description=issue_data.description,
                        priority_id=issue_data.priority_id,
                        labels=issue_data.labels,
                    )
                except JiraAPIError as exc:
                    return _error_response(exc)

            @v3.get("/issues/{issue_key}")
            async def get_issue(issue_key: str, request: Request):
                try:
                    return await request.app.state.jira_api_services["issues"].get_issue(issue_key)
                except JiraAPIError as exc:
                    return _error_response(exc)

            @v3.patch("/issues/{issue_key}")
            async def update_issue(issue_key: str, update_data: IssueUpdate, request: Request):
                try:
                    svc = request.app.state.jira_api_services["issues"]
                    if update_data.summary:
                        await svc.update_issue_summary(issue_key, update_data.summary)
                    if update_data.labels_add:
                        await svc.add_labels_to_issue(issue_key, update_data.labels_add)
                    if update_data.labels_remove:
                        await svc.remove_labels_from_issue(issue_key, update_data.labels_remove)
                    return {"message": f"Issue {issue_key} updated"}
                except JiraAPIError as exc:
                    return _error_response(exc)

            @v3.put("/issues/{issue_key}/assign/{email}")
            async def assign_issue(issue_key: str, email: str, request: Request):
                try:
                    await request.app.state.jira_api_services["issues"].assign_issue_by_email(issue_key, email)
                    return {"message": f"Issue {issue_key} assigned to {email}"}
                except JiraAPIError as exc:
                    return _error_response(exc)

            @v3.get("/issues/{issue_key}/transitions")
            async def get_transitions(issue_key: str, request: Request):
                try:
                    return await request.app.state.jira_api_services["issues"].get_available_transitions(issue_key)
                except JiraAPIError as exc:
                    return _error_response(exc)

            @v3.post("/issues/{issue_key}/transitions")
            async def transition_issue(issue_key: str, req: TransitionRequest, request: Request):
                try:
                    await request.app.state.jira_api_services["issues"].transition_issue_by_name(
                        issue_key, req.transition_name, req.comment, req.resolution_name,
                    )
                    return {"message": f"Issue {issue_key} transitioned using '{req.transition_name}'"}
                except JiraAPIError as exc:
                    return _error_response(exc)

            # Projects
            @v3.get("/projects/{project_key}")
            async def get_project(project_key: str, request: Request):
                try:
                    return await request.app.state.jira_api_services["projects"].get_project(project_key)
                except JiraAPIError as exc:
                    return _error_response(exc)

            @v3.get("/projects/{project_key}/versions")
            async def get_versions(project_key: str, request: Request, released: Optional[bool] = Query(None)):
                try:
                    return await request.app.state.jira_api_services["projects"].get_project_versions(project_key, released_only=released)
                except JiraAPIError as exc:
                    return _error_response(exc)

            @v3.post("/projects/{project_key}/versions")
            async def create_version(project_key: str, req: VersionCreateRequest, request: Request):
                try:
                    return await request.app.state.jira_api_services["projects"].create_version(
                        project_key, req.name, req.description,
                    )
                except JiraAPIError as exc:
                    return _error_response(exc)

            router.include_router(v3)

        app.include_router(router)

        if configured:
            logger.info("Jira API initialized -- routes registered at %s/*", PREFIX)
        else:
            logger.info(
                "Health endpoint registered at %s/health (v3 routes skipped -- no credentials)",
                PREFIX,
            )

        logger.info("jira_api lifecycle hook completed successfully")
    except Exception as exc:
        logger.error("jira_api lifecycle hook failed: %s", exc, exc_info=True)
        raise


async def onShutdown(app: FastAPI, config: dict[str, Any]) -> None:
    """Shutdown hook -- Close the Jira API client."""
    logger.info("Starting jira_api shutdown...")
    try:
        client: AsyncJiraClient | None = getattr(app.state, "jira_api", None)
        if client:
            logger.info("Closing Jira API client...")
            await client.aclose()
            logger.info("Jira API client closed")
        else:
            logger.debug("No Jira API client to close")
    except Exception as exc:
        logger.error("jira_api shutdown failed: %s", exc, exc_info=True)
        raise
