#!/usr/bin/env python3
"""Direct package test for gemini_openai_sdk GeminiClient configuration with connection check."""

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
from gemini_openai_sdk import GeminiClient, DEFAULTS, DEFAULT_MODEL, get_api_key

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

    # --- Connection test ---
    connection_test = {"skipped": True, "reason": "no api_key"}
    if api_key:
        try:
            client = GeminiClient()
            health_result = await client.health_check()
            connection_test = {"skipped": False, "connected": bool(health_result)}
        except Exception as exc:
            connection_test = {"skipped": False, "connected": False, "error": str(exc)}

    summary = {
        "service": "client-config",
        "mode": "direct-package-import",
        "python_package": "gemini_openai_sdk",
        "app_yaml_initialized": True,
        "app_yaml_providers_gemini_openai": provider_config,
        "resolved_config": {
            "has_api_key": api_key is not None,
            "default_model": DEFAULT_MODEL,
            "defaults": DEFAULTS,
        },
        "connection_test": connection_test,
        "uses_app_yaml_directly": True,
        "note": "gemini_openai_sdk resolves Gemini config from AppYamlConfig + env.",
    }
    print(json.dumps(summary, indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
