#!/usr/bin/env python3
"""Direct package test for fetch_gemini client configuration with connection check."""

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

import dataclasses
from app_yaml_load import load_app_yaml_config
from fetch_gemini import DEFAULTS, get_config, validate_config, get_chat_endpoint

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--app-env", default="dev")
    parser.add_argument("--config-dir", required=True)
    args = parser.parse_args()

    app_cfg = load_app_yaml_config(config_dir=args.config_dir, app_env=args.app_env).config
    provider_config = app_cfg.get_nested("providers", "gemini_openai", default={})

    config = get_config()
    validation = validate_config(config)
    chat_endpoint = get_chat_endpoint()
    is_valid = validation is True or (isinstance(validation, dict) and validation.get("valid", False))

    # --- Connection test ---
    connection_test = {"skipped": True, "reason": "no valid config"}
    api_key = getattr(config, "api_key", None) or (config.get("api_key") if isinstance(config, dict) else None)
    if is_valid and api_key:
        try:
            model = getattr(config, "model", None) or (config.get("model") if isinstance(config, dict) else None) or "gemini-2.0-flash"
            resp = httpx.post(
                chat_endpoint,
                headers={"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"},
                json={"model": model, "messages": [{"role": "user", "content": "ping"}], "max_tokens": 1},
                timeout=10,
            )
            connection_test = {"skipped": False, "connected": resp.status_code < 500, "status": resp.status_code}
        except Exception as exc:
            connection_test = {"skipped": False, "connected": False, "error": str(exc)}

    summary = {
        "service": "fetch-client",
        "mode": "direct-package-import",
        "python_package": "fetch_gemini",
        "app_yaml_initialized": True,
        "app_yaml_providers_gemini_openai": provider_config,
        "resolved_config": {
            "defaults": dataclasses.asdict(DEFAULTS),
            "chat_endpoint": chat_endpoint,
            "config_valid": is_valid,
        },
        "connection_test": connection_test,
        "uses_app_yaml_directly": True,
        "note": "fetch_gemini resolves Gemini client config from AppYamlConfig + env.",
    }
    print(json.dumps(summary, indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
