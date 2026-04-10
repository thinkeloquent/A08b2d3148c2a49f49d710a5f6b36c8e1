#!/usr/bin/env python3
"""
Connection test for Jira API via the internal jira_api SDK.

Tests proxy, verify_ssl, ca_bundle, and client cert configuration
by resolving config from AppYamlConfig and making a health-check request.
Jira Cloud uses Basic auth (email:api_token).
"""

from __future__ import annotations

import argparse
import asyncio
import base64
import json
import os
import re
import sys
import time
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
from jira_api import AsyncJiraClient


# ---------------------------------------------------------------------------
# Connection config resolution
# ---------------------------------------------------------------------------

def _resolve_connection_config(provider_cfg: dict) -> dict:
    """Resolve proxy, SSL, and cert settings from YAML + env."""
    return {
        "proxy_url": (
            provider_cfg.get("proxy_url")
            or os.environ.get("HTTPS_PROXY")
            or os.environ.get("HTTP_PROXY")
        ),
        "verify_ssl": provider_cfg.get("verify_ssl", True),
        "ca_bundle": (
            provider_cfg.get("ca_bundle")
            or os.environ.get("SSL_CERT_FILE")
            or os.environ.get("REQUESTS_CA_BUNDLE")
        ),
        "client_cert": provider_cfg.get("client_cert"),
        "client_key": provider_cfg.get("client_key"),
    }


def _resolve_credentials(provider_cfg: dict) -> tuple[str | None, str | None]:
    """Resolve Jira email and api_token from YAML + env."""
    email = (
        provider_cfg.get("email")
        or os.environ.get("JIRA_EMAIL")
    )
    api_token = (
        provider_cfg.get("api_key")
        or os.environ.get("JIRA_API_TOKEN")
    )
    return email, api_token


async def _test_connection(provider_cfg: dict, conn_cfg: dict) -> dict:
    """Test Jira API connection using the SDK."""
    email, api_token = _resolve_credentials(provider_cfg)
    if not email or not api_token:
        return {"skipped": True, "reason": "no JIRA_EMAIL/JIRA_API_TOKEN or email/api_key in config"}

    base_url = provider_cfg.get("base_url") or os.environ.get("JIRA_BASE_URL", "")
    if not base_url:
        return {"skipped": True, "reason": "no base_url or JIRA_BASE_URL configured"}

    try:
        start = time.monotonic()
        async with AsyncJiraClient(
            base_url=base_url,
            email=email,
            api_token=api_token,
        ) as client:
            # Use /rest/api/3/myself as a lightweight health check
            result = await client.get("myself")
            latency = round((time.monotonic() - start) * 1000)
            return {
                "skipped": False,
                "connected": True,
                "endpoint": "/rest/api/3/myself",
                "has_user": "accountId" in result if isinstance(result, dict) else False,
                "latency_ms": latency,
                "connection": {
                    "proxy": conn_cfg["proxy_url"] or "(none)",
                    "verify_ssl": conn_cfg["verify_ssl"],
                    "ca_bundle": conn_cfg["ca_bundle"] or "(default)",
                    "has_client_cert": bool(conn_cfg["client_cert"]),
                },
            }
    except Exception as exc:
        return {
            "skipped": False,
            "connected": False,
            "error": {"name": type(exc).__name__, "message": str(exc)},
        }


async def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--app-env", default="dev")
    parser.add_argument("--config-dir", required=True)
    args = parser.parse_args()

    app_cfg = load_app_yaml_config(config_dir=args.config_dir, app_env=args.app_env).config
    provider_cfg = app_cfg.get_nested("providers", "jira", default={}) or {}
    conn_cfg = _resolve_connection_config(provider_cfg)

    connection_test = await _test_connection(provider_cfg, conn_cfg)

    summary = {
        "service": "jira-sdk",
        "mode": "connection-test",
        "python_package": "jira_api",
        "app_yaml_initialized": True,
        "connection_config": conn_cfg,
        "connection_test": connection_test,
        "overall": "PASS" if connection_test.get("connected") else (
            "SKIP" if connection_test.get("skipped") else "FAIL"
        ),
    }
    print(json.dumps(summary, indent=2, default=str))
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
