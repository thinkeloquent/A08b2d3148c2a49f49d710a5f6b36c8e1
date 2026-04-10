"""
GitHub API SDK Lifecycle Hook for FastAPI

Initializes the GitHub API SDK client and registers all GitHub API routes
under the /~/api/rest/{api_release_date}/providers/github_api/{api_version} prefix.

Loading Order: 500 (after core services, before static apps)

Environment Variables:
    GITHUB_TOKEN / GH_TOKEN / GITHUB_ACCESS_TOKEN / GITHUB_PAT - GitHub API token

Usage in routes:
    from fastapi import Request

    client = request.app.state.github_client          # Base GitHubClient
    clients = request.app.state.github_clients         # Domain clients dict
    repos = request.app.state.github_clients["repos"]  # ReposClient

Registered endpoints (prefix: /~/api/rest/{api_release_date}/providers/github_api/2022-11-28):
    GET    /health                                         - Health check
    GET    /health/rate-limit                               - Full rate limit status
    GET    /repos/{owner}/{repo}                            - Get repository
    GET    /repos/user/{username}                           - List user repos
    GET    /repos/me                                        - List authenticated user repos
    GET    /repos/org/{org}                                 - List org repos
    POST   /repos                                           - Create repo
    POST   /repos/org/{org}                                 - Create org repo
    PATCH  /repos/{owner}/{repo}                            - Update repo
    DELETE /repos/{owner}/{repo}                            - Delete repo
    GET    /repos/{owner}/{repo}/topics                     - Get topics
    PUT    /repos/{owner}/{repo}/topics                     - Replace topics
    GET    /repos/{owner}/{repo}/languages                  - Get languages
    GET    /repos/{owner}/{repo}/contributors               - List contributors
    POST   /repos/{owner}/{repo}/forks                      - Fork repo
    GET    /repos/{owner}/{repo}/forks                      - List forks
    PUT    /repos/{owner}/{repo}/subscription               - Watch repo
    DELETE /repos/{owner}/{repo}/subscription               - Unwatch repo
    GET    /repos/{owner}/{repo}/branches                   - List branches
    GET    /repos/{owner}/{repo}/branches/{branch}          - Get branch
    GET    /repos/{owner}/{repo}/branches/{branch}/protection - Get protection
    PUT    /repos/{owner}/{repo}/branches/{branch}/protection - Update protection
    DELETE /repos/{owner}/{repo}/branches/{branch}/protection - Remove protection
    POST   /repos/{owner}/{repo}/branches/{branch}/rename   - Rename branch
    POST   /repos/{owner}/{repo}/merges                     - Merge branches
    GET    /repos/{owner}/{repo}/compare/{basehead}         - Compare refs
    GET    /repos/{owner}/{repo}/collaborators               - List collaborators
    PUT    /repos/{owner}/{repo}/collaborators/{username}    - Add collaborator
    DELETE /repos/{owner}/{repo}/collaborators/{username}    - Remove collaborator
    GET    /repos/{owner}/{repo}/collaborators/{username}/permission - Check permission
    GET    /repos/{owner}/{repo}/invitations                 - List invitations
    GET    /repos/{owner}/{repo}/tags                        - List tags
    GET    /repos/{owner}/{repo}/releases                    - List releases
    POST   /repos/{owner}/{repo}/releases                    - Create release
    GET    /repos/{owner}/{repo}/releases/latest             - Latest release
    GET    /repos/{owner}/{repo}/releases/tags/{tag}         - Release by tag
    GET    /repos/{owner}/{repo}/releases/{release_id}       - Get release
    PATCH  /repos/{owner}/{repo}/releases/{release_id}       - Update release
    DELETE /repos/{owner}/{repo}/releases/{release_id}       - Delete release
    GET    /repos/{owner}/{repo}/hooks                       - List webhooks
    GET    /repos/{owner}/{repo}/hooks/{hook_id}             - Get webhook
    POST   /repos/{owner}/{repo}/hooks                       - Create webhook
    PATCH  /repos/{owner}/{repo}/hooks/{hook_id}             - Update webhook
    DELETE /repos/{owner}/{repo}/hooks/{hook_id}             - Delete webhook
    POST   /repos/{owner}/{repo}/hooks/{hook_id}/tests       - Test webhook
    POST   /repos/{owner}/{repo}/hooks/{hook_id}/pings       - Ping webhook
    GET    /repos/{owner}/{repo}/vulnerability-alerts        - Get vulnerability alerts
    PUT    /repos/{owner}/{repo}/vulnerability-alerts        - Enable vulnerability alerts
    DELETE /repos/{owner}/{repo}/vulnerability-alerts        - Disable vulnerability alerts
    GET    /repos/{owner}/{repo}/rulesets                    - List rulesets
    GET    /repos/{owner}/{repo}/rulesets/{ruleset_id}       - Get ruleset
    POST   /repos/{owner}/{repo}/rulesets                    - Create ruleset
    PUT    /repos/{owner}/{repo}/rulesets/{ruleset_id}       - Update ruleset
    DELETE /repos/{owner}/{repo}/rulesets/{ruleset_id}       - Delete ruleset
    GET    /repos/{owner}/{repo}/actions/workflows             - List workflows
    GET    /repos/{owner}/{repo}/actions/workflows/{id}      - Get workflow
    GET    /repos/{owner}/{repo}/actions/workflows/{id}/runs - List workflow runs
    GET    /repos/{owner}/{repo}/actions/runs                - List runs
    GET    /repos/{owner}/{repo}/actions/runs/{id}           - Get run
    POST   /repos/{owner}/{repo}/actions/runs/{id}/cancel    - Cancel run
    POST   /repos/{owner}/{repo}/actions/runs/{id}/rerun     - Re-run workflow
    POST   /repos/{owner}/{repo}/actions/runs/{id}/rerun-failed-jobs - Re-run failed
    GET    /repos/{owner}/{repo}/actions/runs/{id}/jobs      - List jobs for run
    GET    /repos/{owner}/{repo}/actions/jobs/{id}           - Get job
    GET    /repos/{owner}/{repo}/actions/artifacts           - List artifacts
    GET    /repos/{owner}/{repo}/actions/runs/{id}/artifacts - List run artifacts
    GET    /repos/{owner}/{repo}/actions/artifacts/{id}      - Get artifact
    DELETE /repos/{owner}/{repo}/actions/artifacts/{id}      - Delete artifact
    GET    /openapi.yaml                                     - OpenAPI spec (YAML)
    GET    /openapi.json                                     - OpenAPI spec (JSON)
"""

import logging
import sys
from pathlib import Path
from typing import Any

from fastapi import APIRouter, FastAPI
from env_resolver import resolve_github_env

# Add polyglot github_api package and its dependencies to sys.path
_root = Path(__file__).parent.parent.parent.parent
_polyglot_path = _root / "polyglot" / "github_api" / "py"
_packages_py_path = _root / "packages_py"
if str(_packages_py_path) not in sys.path:
    sys.path.insert(0, str(_packages_py_path))
if str(_polyglot_path) not in sys.path:
    sys.path.insert(0, str(_polyglot_path))

from github_api.sdk import (
    GitHubClient,
    ReposClient,
    BranchesClient,
    CollaboratorsClient,
    TagsClient,
    WebhooksClient,
    SecurityClient,
    ActionsClient,
    resolve_token,
    mask_token,
)
from github_api.middleware.error_handler import register_error_handlers
from github_api.routes.health import router as health_router
from github_api.routes.repos import router as repos_router
from github_api.routes.branches import router as branches_router
from github_api.routes.collaborators import router as collaborators_router
from github_api.routes.tags import router as tags_router
from github_api.routes.webhooks import router as webhooks_router
from github_api.routes.security import router as security_router
from github_api.routes.actions import router as actions_router

logger = logging.getLogger("lifecycle.github_sdk")

GITHUB_API_VERSION = "2022-11-28"


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


def _resolve_github_token(app: FastAPI) -> dict[str, str]:
    """Resolve GitHub token from AppYamlConfig → env-resolver → SDK fallback.

    Resolution order:
        1. AppYamlConfig: providers.github.endpoint_api_key (template-resolved via {{fn:provider_api_keys.github}})
        2. env_resolver: resolve_github_env().token (GITHUB_TOKEN, GH_TOKEN, etc.)
        3. SDK resolve_token: final fallback with AuthError if nothing found

    Returns:
        TokenInfo with token, source, and type fields.
    """
    # 1. Try AppYamlConfig first (providers.github.endpoint_api_key, resolved from {{fn:provider_api_keys.github}})
    config_token = None
    resolved = getattr(app.state, "resolved_config", None)
    if resolved and isinstance(resolved, dict):
        github = (resolved.get("providers") or {}).get("github") or {}
        config_token = github.get("endpoint_api_key")
    elif hasattr(app.state, "config") and hasattr(app.state.config, "get_nested"):
        try:
            config_token = app.state.config.get_nested("providers", "github", "endpoint_api_key")
        except Exception:
            pass

    # Skip unresolved templates ({{fn:...}}, {{env:...}}) — they aren't real tokens
    if config_token and not config_token.startswith("{{"):
        return resolve_token(config_token)

    # 2. Fall back to env_resolver (GITHUB_TOKEN, GH_TOKEN, GITHUB_ACCESS_TOKEN, GITHUB_PAT)
    env_resolved = resolve_github_env()
    if env_resolved.token:
        return resolve_token(env_resolved.token)

    # 3. Final fallback — SDK resolve_token raises AuthError if nothing found
    return resolve_token(None)


def _resolve_github_base_url(app: FastAPI) -> str:
    """Resolve GitHub API base URL from AppYamlConfig (providers.github.base_url).

    Three-tier resolution: overwrite_from_context ({{env.GITHUB_API_BASE_URL}}) → YAML → default.

    Returns:
        GitHub API base URL string.
    """
    config_base_url = None
    # Prefer resolved_config (with {{fn:...}} templates expanded)
    resolved = getattr(app.state, "resolved_config", None)
    if resolved and isinstance(resolved, dict):
        github = (resolved.get("providers") or {}).get("github") or {}
        config_base_url = github.get("base_url")
    elif hasattr(app.state, "config") and hasattr(app.state.config, "get_nested"):
        try:
            config_base_url = app.state.config.get_nested("providers", "github", "base_url")
        except Exception:
            pass

    return config_base_url or resolve_github_env().base_api_url


async def onStartup(app: FastAPI, config: dict[str, Any]) -> None:
    """Startup hook -- Initialize GitHub SDK client and register routes.

    Args:
        app: FastAPI application instance.
        config: Bootstrap configuration dictionary.
    """
    logger.info("Starting github_sdk lifecycle hook...")
    try:
        logger.info("Initializing GitHub API SDK...")

        # ── Token Resolution ──────────────────────────────────────────────
        try:
            token_info = _resolve_github_token(app)
        except Exception as err:
            logger.warning(
                "GitHub token not found -- SDK routes will NOT be registered. %s", err
            )
            return

        logger.info("Token resolved from %s (type: %s)", token_info.source, token_info.type)
        logger.info("Masked token: %s", mask_token(token_info.token))

        # ── Base URL Resolution (AppYamlConfig: providers.github.base_url) ──
        base_url = _resolve_github_base_url(app)
        logger.info("GitHub API base URL: %s", base_url)

        # ── Base Client ───────────────────────────────────────────────────
        github = GitHubClient(
            token=token_info.token,
            base_url=base_url,
            rate_limit_auto_wait=True,
            rate_limit_threshold=10,
        )

        # ── Domain Clients ────────────────────────────────────────────────
        repos = ReposClient(github)
        branches = BranchesClient(github)
        collaborators = CollaboratorsClient(github)
        tags = TagsClient(github)
        webhooks = WebhooksClient(github)
        security = SecurityClient(github)
        actions = ActionsClient(github)

        clients = {
            "repos": repos,
            "branches": branches,
            "collaborators": collaborators,
            "tags": tags,
            "webhooks": webhooks,
            "security": security,
            "actions": actions,
        }

        # ── Store on app.state ────────────────────────────────────────────
        app.state.github_client = github
        app.state.github_clients = clients

        # ── API Release Date ─────────────────────────────────────────────
        github_api_release_date = app.state.config.get_nested(
            "api_release_date", "contract_snapshot_date", "provider_github"
        )
        PREFIX = f"/~/api/rest/{github_api_release_date}/providers/github_api/{GITHUB_API_VERSION}"
        logger.debug("GitHub API prefix: %s", PREFIX)

        # ── Route Registration ────────────────────────────────────────────
        github_api_router = APIRouter(prefix=PREFIX)
        github_api_router.include_router(health_router)
        github_api_router.include_router(repos_router)
        github_api_router.include_router(branches_router)
        github_api_router.include_router(collaborators_router)
        github_api_router.include_router(tags_router)
        github_api_router.include_router(webhooks_router)
        github_api_router.include_router(security_router)
        github_api_router.include_router(actions_router)

        app.include_router(github_api_router)

        logger.info("GitHub API SDK initialized -- routes registered at %s/*", PREFIX)
        logger.info("github_sdk lifecycle hook completed successfully")
    except Exception as exc:
        logger.error("github_sdk lifecycle hook failed: %s", exc, exc_info=True)
        raise


async def onShutdown(app: FastAPI, config: dict[str, Any]) -> None:
    """Shutdown hook -- Close the GitHub SDK client.

    Args:
        app: FastAPI application instance.
        config: Bootstrap configuration dictionary.
    """
    logger.info("Starting github_sdk shutdown...")
    try:
        client: GitHubClient | None = getattr(app.state, "github_client", None)
        if client:
            logger.info("Closing GitHub SDK client...")
            await client.close()
            logger.info("GitHub SDK client closed")
        else:
            logger.debug("No GitHub SDK client to close")
    except Exception as exc:
        logger.error("github_sdk shutdown failed: %s", exc, exc_info=True)
        raise
