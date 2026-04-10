"""
09_feature_flags.lifecycle.py

Stores feature flags and feature options on app.state and registers
REST endpoints so frontends can read them at runtime.

YAML source: common/config/feature_flags.yml

Backend:
    app.state.feature_flags                          → dict
    app.state.feature_options                        → dict
    app.state.is_feature_enabled(app_name, flag)     → bool
    app.state.get_feature_option(app_name, area, key) → value | None

Frontend:
    GET /~/api/feature-flags              → { feature_flags, feature_options }
    GET /~/api/feature-flags/{app_name}   → { app, flags, options }
"""

import logging

from fastapi import APIRouter, FastAPI, HTTPException

logger = logging.getLogger("lifecycle:feature_flags")


def _read_section(app: FastAPI, section: str) -> dict:
    """Extract a top-level section from AppYamlConfig on app.state."""
    config = getattr(app.state, "config", None)
    if config is None:
        return {}
    if hasattr(config, "get_nested"):
        return config.get_nested(section, default={}) or {}
    if hasattr(config, "get"):
        return config.get(section, {}) or {}
    return {}


def _is_feature_enabled(flags: dict, app_name: str, flag: str) -> bool:
    """Check whether a feature flag is enabled.

    Returns True (fail-open) when the flag is not defined.
    """
    entry = (flags.get(app_name) or {}).get(flag)
    if isinstance(entry, dict) and "enabled" in entry:
        return bool(entry["enabled"])
    return True


def _get_feature_option(options: dict, app_name: str, area: str, key: str):
    """Get a feature option value. Returns None if not set."""
    return (options.get(app_name) or {}).get(area, {}).get(key)


def onInit(app: FastAPI, config: dict):
    """Store feature flags and options on app.state during onInit phase.

    Runs after 01_app_yaml so app.state.config is available.
    """
    logger.info("Starting feature_flags lifecycle hook...")

    flags = _read_section(app, "feature_flags")
    options = _read_section(app, "feature_options")

    app_count = len(flags)
    flag_count = sum(
        len(v) for v in flags.values() if isinstance(v, dict)
    )
    opt_app_count = len(options)
    opt_count = sum(
        len(v) for v in options.values() if isinstance(v, dict)
    )
    logger.info(
        "Loaded %d flag(s) across %d app(s), %d option area(s) across %d app(s)",
        flag_count, app_count, opt_count, opt_app_count,
    )

    app.state.feature_flags = flags
    app.state.feature_options = options
    app.state.is_feature_enabled = lambda app_name, flag: _is_feature_enabled(
        flags, app_name, flag,
    )
    app.state.get_feature_option = lambda app_name, area, key: _get_feature_option(
        options, app_name, area, key,
    )

    # ── REST endpoints ────────────────────────────────────────────────────
    router = APIRouter(tags=["feature-flags"])

    @router.get("/~/api/feature-flags")
    async def get_all_feature_flags():
        return {"feature_flags": flags, "feature_options": options}

    @router.get("/~/api/feature-flags/{app_name}")
    async def get_app_feature_flags(app_name: str):
        app_flags = flags.get(app_name)
        app_options = options.get(app_name)
        if app_flags is None and app_options is None:
            raise HTTPException(
                status_code=404,
                detail=f'No feature flags or options defined for app "{app_name}"',
            )
        return {"app": app_name, "flags": app_flags or {}, "options": app_options or {}}

    app.include_router(router)

    logger.info(
        "Registered routes: GET /~/api/feature-flags, GET /~/api/feature-flags/{app_name}"
    )
    logger.info("feature_flags lifecycle hook completed successfully")
