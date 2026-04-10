#!/usr/bin/env python3
"""Direct package test for fetch_httpx_gemini_openai_constant with connection check."""

from __future__ import annotations

import argparse
import json

import re
import sys
from pathlib import Path

_HERE = Path(__file__).resolve().parent
_PLATFORM = _HERE
while _PLATFORM.name != "platform" and _PLATFORM != _PLATFORM.parent:
    _PLATFORM = _PLATFORM.parent

def _inject_paths():
    """Add polyglot/packages_py source dirs to sys.path from platform pyproject.toml."""
    toml = _PLATFORM / "pyproject.toml"
    if not toml.exists():
        return
    for line in toml.read_text().splitlines():
        m = re.search(r'path\s*=\s*"([^"]+)"', line)
        if not m:
            continue
        pkg_path = (_PLATFORM / m.group(1)).resolve()
        src = pkg_path / "src"
        sys.path.insert(0, str(src if src.is_dir() else pkg_path))

_inject_paths()

import httpx

from app_yaml_load import load_app_yaml_config
from fetch_httpx_gemini_openai_constant import (

    GEMINI_ORIGIN,
    GEMINI_CHAT_COMPLETIONS_PATH,
    GEMINI_CONNECT_TIMEOUT_S,
    GEMINI_READ_TIMEOUT_S,
    GEMINI_WRITE_TIMEOUT_S,
    GEMINI_MAX_CONNECTIONS,
    GEMINI_MAX_KEEPALIVE_CONNECTIONS,
    GEMINI_KEEPALIVE_EXPIRY_S,
    GEMINI_HTTP2_ENABLED,
)

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--app-env", default="dev")
    parser.add_argument("--config-dir", required=True)
    args = parser.parse_args()

    app_cfg = load_app_yaml_config(config_dir=args.config_dir, app_env=args.app_env).config
    provider_config = app_cfg.get_nested("providers", "gemini_openai", default={})

    # --- Connection test (TCP reachability of GEMINI_ORIGIN) ---
    connection_test: dict = {"skipped": True, "reason": "constants-only package"}
    try:
        resp = httpx.head(GEMINI_ORIGIN, timeout=10)
        connection_test = {"skipped": False, "connected": resp.status_code < 500, "status": resp.status_code}
    except Exception as exc:
        connection_test = {"skipped": False, "connected": False, "error": str(exc)}

    summary = {
        "service": "transport-constant",
        "mode": "direct-package-import",
        "python_package": "fetch_httpx_gemini_openai_constant",
        "app_yaml_initialized": True,
        "app_yaml_providers_gemini_openai": provider_config,
        "resolved_config": {
            "gemini_origin": GEMINI_ORIGIN,
            "chat_completions_path": GEMINI_CHAT_COMPLETIONS_PATH,
            "connect_timeout_s": GEMINI_CONNECT_TIMEOUT_S,
            "read_timeout_s": GEMINI_READ_TIMEOUT_S,
            "write_timeout_s": GEMINI_WRITE_TIMEOUT_S,
            "max_connections": GEMINI_MAX_CONNECTIONS,
            "max_keepalive_connections": GEMINI_MAX_KEEPALIVE_CONNECTIONS,
            "keepalive_expiry_s": GEMINI_KEEPALIVE_EXPIRY_S,
            "http2_enabled": GEMINI_HTTP2_ENABLED,
        },
        "connection_test": connection_test,
        "uses_app_yaml_directly": False,
        "note": "fetch_httpx_gemini_openai_constant provides pre-configured constants for httpx Gemini clients.",
    }
    print(json.dumps(summary, indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
