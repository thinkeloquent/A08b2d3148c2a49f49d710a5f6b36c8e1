#!/usr/bin/env python3
"""Direct package test for jira provider auth config with connection check."""

from __future__ import annotations

import argparse
import base64
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
from auth_config import build_sdk_auth_options, resolve_api_key, resolve_email

def _test_connection(provider_config: dict, api_key: str | None, email: str | None) -> dict:
    health_endpoint = provider_config.get("health_endpoint")
    base_url = provider_config.get("base_url")
    if not health_endpoint or not api_key or not email:
        return {"skipped": True, "reason": "no health_endpoint or credentials"}
    try:
        url = f"{base_url.rstrip('/')}{health_endpoint}" if base_url else health_endpoint
        basic_auth = base64.b64encode(f"{email}:{api_key}".encode()).decode()
        headers = {"Authorization": f"Basic {basic_auth}"}
        resp = httpx.get(url, headers=headers, timeout=10)
        return {"skipped": False, "connected": resp.is_success, "status": resp.status_code}
    except Exception as exc:
        return {"skipped": False, "connected": False, "error": str(exc)}

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--app-env", default="dev")
    parser.add_argument("--config-dir", required=True)
    args = parser.parse_args()

    app_cfg = load_app_yaml_config(config_dir=args.config_dir, app_env=args.app_env).config
    provider_config = app_cfg.get_nested("providers", "jira", default={})
    auth_options = build_sdk_auth_options(provider_config, default_auth_type="basic_email_token")
    api_key = resolve_api_key(provider_config)
    email = resolve_email(provider_config)

    connection_test = _test_connection(provider_config, api_key, email)

    summary = {
        "service": "jira",
        "mode": "direct-package-import",
        "python_package": "auth_config",
        "app_yaml_initialized": True,
        "app_yaml_providers_jira": provider_config,
        "resolved_config": {
            "base_url": provider_config.get("base_url"),
            "health_endpoint": provider_config.get("health_endpoint"),
            "auth_type": auth_options.get("type") if auth_options else None,
            "has_api_key": api_key is not None,
            "email": email,
        },
        "connection_test": connection_test,
        "uses_app_yaml_directly": True,
        "note": "auth_config resolves jira auth (basic_email_token) from AppYamlConfig + env/context.",
    }
    # Redact sensitive fields before logging (CodeQL py/clear-text-logging-sensitive-data)
    _sensitive = {"api_key", "token", "secret", "password", "client_secret"}
    summary["app_yaml_providers_jira"] = {k: ("*******" if k in _sensitive else v) for k, v in summary["app_yaml_providers_jira"].items()}
    print(json.dumps(summary, indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
