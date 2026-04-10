#!/usr/bin/env python3
"""Direct package test for gemini_openai_sdk health check."""

from __future__ import annotations

import argparse
import asyncio
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

from app_yaml_load import load_app_yaml_config
from gemini_openai_sdk import GeminiClient, get_api_key

async def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--app-env", default="dev")
    parser.add_argument("--config-dir", required=True)
    args = parser.parse_args()

    app_cfg = load_app_yaml_config(config_dir=args.config_dir, app_env=args.app_env).config
    provider_config = app_cfg.get_nested("providers", "gemini_openai", default={})

    api_key = None
    try:
        api_key = get_api_key()
    except Exception:
        pass

    health_result = None
    health_error = None
    if api_key:
        try:
            client = GeminiClient()
            health_result = await client.health_check()
        except Exception as exc:
            health_error = str(exc)

    if api_key:
        connection_test = {"skipped": False, "connected": health_result is not None and not health_error, "error": health_error}
    else:
        connection_test = {"skipped": True, "reason": "no api_key"}

    summary = {
        "service": "health-check",
        "mode": "direct-package-import",
        "python_package": "gemini_openai_sdk",
        "app_yaml_initialized": True,
        "app_yaml_providers_gemini_openai": provider_config,
        "resolved_config": {
            "has_api_key": api_key is not None,
            "health_result": health_result,
            "health_error": health_error,
        },
        "connection_test": connection_test,
        "uses_app_yaml_directly": True,
        "note": "gemini_openai_sdk health_check verifies Gemini API connectivity.",
    }
    print(json.dumps(summary, indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
