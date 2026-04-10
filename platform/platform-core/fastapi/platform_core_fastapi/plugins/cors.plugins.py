"""CORS plugin — builds the CORSMiddleware configuration dict.

Usage:
    from plugins.cors_plugins import get_cors_config
    config = get_cors_config()
    app.add_middleware(CORSMiddleware, **config)
"""
import logging
import os
from typing import Any, Dict, List

log = logging.getLogger("platform.plugins.cors")


def get_cors_config(
    origins: List[str] | None = None,
    allow_methods: List[str] | None = None,
    allow_headers: List[str] | None = None,
) -> Dict[str, Any]:
    """Return a CORSMiddleware kwargs dict.

    Falls back to environment variables when arguments are not provided.
    """
    if origins is None:
        raw = os.getenv("CORS_ORIGINS", "*")
        if raw == "*":
            origins = ["*"]
        else:
            origins = [o.strip() for o in raw.split(",") if o.strip()]

    allow_credentials = "*" not in origins

    config: Dict[str, Any] = {
        "allow_origins": origins,
        "allow_credentials": allow_credentials,
        "allow_methods": allow_methods or ["*"],
        "allow_headers": allow_headers or ["*"],
    }
    log.debug("CORS config built", extra={"origins": origins})
    return config
