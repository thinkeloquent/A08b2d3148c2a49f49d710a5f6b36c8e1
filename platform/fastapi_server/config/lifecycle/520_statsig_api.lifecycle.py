"""
Statsig Console API Lifecycle Hook for FastAPI

Initializes the Statsig Console API client and registers all Statsig API
proxy routes under the /~/api/rest/{api_release_date}/providers/statsig_api prefix.

Loading Order: 520 (after core services, GitHub SDK, and Figma SDK)

Environment Variables:
    STATSIG_API_KEY - Statsig Console API key

Usage in routes:
    from fastapi import Request

    client = request.app.state.statsig                       # StatsigClient
    clients = request.app.state.statsig_clients              # Domain modules dict

Registered endpoints (prefix: /~/api/rest/{api_release_date}/providers/statsig_api):
    GET    /health                                           - Health check
    GET    /v1/experiments                                   - List experiments
    POST   /v1/experiments                                   - Create experiment
    GET    /v1/experiments/{id}                               - Get experiment
    PATCH  /v1/experiments/{id}                               - Update experiment
    DELETE /v1/experiments/{id}                               - Delete experiment
    PUT    /v1/experiments/{id}/start                         - Start experiment
    PUT    /v1/experiments/{id}/make_decision                 - Make decision
    GET    /v1/experiments/{id}/pulse_results                 - Get pulse results
    GET    /v1/gates                                         - List gates
    POST   /v1/gates                                         - Create gate
    GET    /v1/gates/{id}                                    - Get gate
    PUT    /v1/gates/{id}/enable                             - Enable gate
    PUT    /v1/gates/{id}/disable                            - Disable gate
    GET    /v1/metrics/list                                  - List metrics
    POST   /v1/metrics                                       - Create metric
    GET    /v1/segments                                      - List segments
    POST   /v1/segments                                      - Create segment
    GET    /v1/layers                                        - List layers
    GET    /v1/tags                                          - List tags
    GET    /v1/events                                        - List events
    GET    /v1/reports                                       - List reports
    GET    /v1/audit_logs                                    - List audit logs
"""

import logging
import sys
from pathlib import Path
from typing import Any

from fastapi import APIRouter, FastAPI, Request
from fastapi.responses import JSONResponse

# Add polyglot statsig_api package and its dependencies to sys.path
_root = Path(__file__).parent.parent.parent.parent
_polyglot_path = _root / "polyglot" / "statsig_api" / "py"
_packages_py_path = _root / "packages_py"
if str(_packages_py_path) not in sys.path:
    sys.path.insert(0, str(_packages_py_path))
if str(_polyglot_path) not in sys.path:
    sys.path.insert(0, str(_polyglot_path))

from env_resolver import resolve_statsig_env
from statsig_client import StatsigClient, create_statsig_client
from statsig_client.modules.experiments import ExperimentsModule
from statsig_client.modules.gates import GatesModule
from statsig_client.modules.metrics import MetricsModule
from statsig_client.modules.segments import SegmentsModule
from statsig_client.modules.layers import LayersModule
from statsig_client.modules.events import EventsModule
from statsig_client.modules.tags import TagsModule
from statsig_client.modules.reports import ReportsModule
from statsig_client.modules.audit_logs import AuditLogsModule
from statsig_client.middleware import register_error_handlers

logger = logging.getLogger("lifecycle.statsig_api")

VENDOR = "statsig_api"
VENDOR_VERSION = "v1"


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


def _resolve_statsig_api_key(app: FastAPI) -> str:
    """Resolve Statsig Console API key from app config or environment variables.

    Checks app config first (providers.statsig.endpoint_api_key), then falls
    back to the STATSIG_API_KEY environment variable.

    Returns:
        The resolved API key string.

    Raises:
        RuntimeError: If no API key is found.
    """
    config_key = None
    # Prefer resolved_config (with {{fn:...}} templates expanded)
    resolved = getattr(app.state, "resolved_config", None)
    if resolved and isinstance(resolved, dict):
        statsig = (resolved.get("providers") or {}).get("statsig") or {}
        config_key = statsig.get("endpoint_api_key")
    elif hasattr(app.state, "config") and hasattr(app.state.config, "get_nested"):
        try:
            config_key = app.state.config.get_nested(
                "providers", "statsig", "endpoint_api_key"
            )
        except Exception:
            pass

    api_key = config_key or resolve_statsig_env().api_key
    if not api_key:
        raise RuntimeError(
            "Statsig Console API key not found. "
            "Set providers.statsig.endpoint_api_key in config or STATSIG_API_KEY env var."
        )
    return api_key


async def onStartup(app: FastAPI, config: dict[str, Any]) -> None:
    """Startup hook -- Initialize Statsig Console API client and register routes.

    Args:
        app: FastAPI application instance.
        config: Bootstrap configuration dictionary.
    """
    logger.info("Starting statsig_api lifecycle hook...")
    try:
        logger.info("Initializing Statsig Console API SDK...")

        # ── API Key Resolution ────────────────────────────────────────────
        try:
            api_key = _resolve_statsig_api_key(app)
        except Exception as err:
            logger.warning(
                "Statsig API key not found -- SDK routes will NOT be registered. %s", err
            )
            return

        logger.info("Statsig API key resolved (has_key: %s)", bool(api_key))

        # ── Base Client ───────────────────────────────────────────────────
        statsig = create_statsig_client(api_key=api_key)

        # ── Domain Modules ────────────────────────────────────────────────
        experiments = ExperimentsModule(statsig)
        gates = GatesModule(statsig)
        metrics = MetricsModule(statsig)
        segments = SegmentsModule(statsig)
        layers = LayersModule(statsig)
        events = EventsModule(statsig)
        tags = TagsModule(statsig)
        reports = ReportsModule(statsig)
        audit_logs = AuditLogsModule(statsig)

        clients = {
            "experiments": experiments,
            "gates": gates,
            "metrics": metrics,
            "segments": segments,
            "layers": layers,
            "events": events,
            "tags": tags,
            "reports": reports,
            "audit_logs": audit_logs,
        }

        # ── Store on app.state ────────────────────────────────────────────
        app.state.statsig = statsig
        app.state.statsig_clients = clients

        # ── API Release Date ──────────────────────────────────────────────
        statsig_api_release_date = app.state.config.get_nested(
            "api_release_date", "contract_snapshot_date", "provider_statsig"
        )
        PREFIX = f"/~/api/rest/{statsig_api_release_date}/providers/{VENDOR}"
        logger.debug("Statsig API prefix: %s", PREFIX)

        # ── Route Registration ────────────────────────────────────────────
        statsig_api_router = APIRouter(prefix=PREFIX)

        # Health check
        @statsig_api_router.get("/health")
        async def statsig_health():
            return JSONResponse(
                content={
                    "status": "ok",
                    "vendor": VENDOR,
                    "vendor_version": VENDOR_VERSION,
                }
            )

        # v1 API routes -- Console API proxy
        v1 = APIRouter(prefix="/v1")

        # ── Experiments ───────────────────────────────────────────────────
        @v1.get("/experiments")
        async def list_experiments(request: Request):
            return await request.app.state.statsig_clients["experiments"].list(
                params=dict(request.query_params)
            )

        @v1.post("/experiments")
        async def create_experiment(request: Request):
            body = await request.json()
            return await request.app.state.statsig_clients["experiments"].create(body)

        @v1.get("/experiments/{experiment_id}")
        async def get_experiment(experiment_id: str, request: Request):
            return await request.app.state.statsig_clients["experiments"].get(experiment_id)

        @v1.patch("/experiments/{experiment_id}")
        async def update_experiment(experiment_id: str, request: Request):
            body = await request.json()
            return await request.app.state.statsig_clients["experiments"].update(
                experiment_id, body
            )

        @v1.delete("/experiments/{experiment_id}")
        async def delete_experiment(experiment_id: str, request: Request):
            return await request.app.state.statsig_clients["experiments"].delete(
                experiment_id
            )

        @v1.put("/experiments/{experiment_id}/start")
        async def start_experiment(experiment_id: str, request: Request):
            return await request.app.state.statsig_clients["experiments"].start(
                experiment_id
            )

        @v1.put("/experiments/{experiment_id}/make_decision")
        async def make_decision(experiment_id: str, request: Request):
            body = await request.json()
            return await request.app.state.statsig_clients["experiments"].make_decision(
                experiment_id, body
            )

        @v1.get("/experiments/{experiment_id}/pulse_results")
        async def get_pulse_results(experiment_id: str, request: Request):
            return await request.app.state.statsig_clients["experiments"].pulse_results(
                experiment_id, params=dict(request.query_params)
            )

        # ── Gates ─────────────────────────────────────────────────────────
        @v1.get("/gates")
        async def list_gates(request: Request):
            return await request.app.state.statsig_clients["gates"].list(
                params=dict(request.query_params)
            )

        @v1.post("/gates")
        async def create_gate(request: Request):
            body = await request.json()
            return await request.app.state.statsig_clients["gates"].create(body)

        @v1.get("/gates/{gate_id}")
        async def get_gate(gate_id: str, request: Request):
            return await request.app.state.statsig_clients["gates"].get(gate_id)

        @v1.put("/gates/{gate_id}/enable")
        async def enable_gate(gate_id: str, request: Request):
            return await request.app.state.statsig_clients["gates"].enable(gate_id)

        @v1.put("/gates/{gate_id}/disable")
        async def disable_gate(gate_id: str, request: Request):
            return await request.app.state.statsig_clients["gates"].disable(gate_id)

        # ── Metrics ───────────────────────────────────────────────────────
        @v1.get("/metrics/list")
        async def list_metrics(request: Request):
            return await request.app.state.statsig_clients["metrics"].list(
                params=dict(request.query_params)
            )

        @v1.post("/metrics")
        async def create_metric(request: Request):
            body = await request.json()
            return await request.app.state.statsig_clients["metrics"].create(body)

        # ── Segments ──────────────────────────────────────────────────────
        @v1.get("/segments")
        async def list_segments(request: Request):
            return await request.app.state.statsig_clients["segments"].list(
                params=dict(request.query_params)
            )

        @v1.post("/segments")
        async def create_segment(request: Request):
            body = await request.json()
            return await request.app.state.statsig_clients["segments"].create(body)

        # ── Layers ────────────────────────────────────────────────────────
        @v1.get("/layers")
        async def list_layers(request: Request):
            return await request.app.state.statsig_clients["layers"].list(
                params=dict(request.query_params)
            )

        # ── Tags ──────────────────────────────────────────────────────────
        @v1.get("/tags")
        async def list_tags(request: Request):
            return await request.app.state.statsig_clients["tags"].list(
                params=dict(request.query_params)
            )

        # ── Events ────────────────────────────────────────────────────────
        @v1.get("/events")
        async def list_events(request: Request):
            return await request.app.state.statsig_clients["events"].list(
                params=dict(request.query_params)
            )

        # ── Reports ───────────────────────────────────────────────────────
        @v1.get("/reports")
        async def list_reports(request: Request):
            return await request.app.state.statsig_clients["reports"].list(
                params=dict(request.query_params)
            )

        # ── Audit Logs ────────────────────────────────────────────────────
        @v1.get("/audit_logs")
        async def list_audit_logs(request: Request):
            return await request.app.state.statsig_clients["audit_logs"].list(
                params=dict(request.query_params)
            )

        statsig_api_router.include_router(v1)
        app.include_router(statsig_api_router)

        logger.info("Statsig Console API initialized -- routes registered at %s/*", PREFIX)
        logger.info("statsig_api lifecycle hook completed successfully")
    except Exception as exc:
        logger.error("statsig_api lifecycle hook failed: %s", exc, exc_info=True)
        raise


async def onShutdown(app: FastAPI, config: dict[str, Any]) -> None:
    """Shutdown hook -- Close the Statsig Console API client.

    Args:
        app: FastAPI application instance.
        config: Bootstrap configuration dictionary.
    """
    logger.info("Starting statsig_api shutdown...")
    try:
        client: StatsigClient | None = getattr(app.state, "statsig", None)
        if client:
            logger.info("Closing Statsig Console API client...")
            await client.close()
            logger.info("Statsig Console API client closed")
        else:
            logger.debug("No Statsig client to close")
    except Exception as exc:
        logger.error("statsig_api shutdown failed: %s", exc, exc_info=True)
        raise
