#!/usr/bin/env python3
"""
Connection test for Jira API via the internal fetch_httpx package.

Tests proxy, verify_ssl, ca_bundle, and client cert configuration
by resolving config from AppYamlConfig and making a health-check request
using fetch_httpx.AsyncClient directly.

Auth: Basic auth with base64(email:api_token) per Atlassian REST API v3.
Health-check endpoint: GET /rest/api/3/myself
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
from fetch_httpx import AsyncClient, Proxy


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


async def _test_connection(provider_cfg: dict, conn_cfg: dict) -> dict:
    """Test Jira API connection using fetch_httpx.AsyncClient directly."""
    email = (
        provider_cfg.get("email")
        or os.environ.get("JIRA_EMAIL")
    )
    api_token = (
        provider_cfg.get("api_token")
        or os.environ.get("JIRA_API_TOKEN")
    )
    base_url = (
        provider_cfg.get("base_url")
        or os.environ.get("JIRA_BASE_URL")
    )

    if not email:
        return {"skipped": True, "reason": "no JIRA_EMAIL or email in config"}
    if not api_token:
        return {"skipped": True, "reason": "no JIRA_API_TOKEN or api_token in config"}
    if not base_url:
        return {"skipped": True, "reason": "no JIRA_BASE_URL or base_url in config"}

    credentials = base64.b64encode(f"{email}:{api_token}".encode()).decode()

    proxy_url = conn_cfg["proxy_url"]
    verify_ssl = conn_cfg["verify_ssl"]
    ca_bundle = conn_cfg["ca_bundle"]
    client_cert = conn_cfg["client_cert"]
    client_key = conn_cfg["client_key"]

    proxy = Proxy(url=proxy_url) if proxy_url else None
    verify = ca_bundle if ca_bundle else verify_ssl
    cert = (client_cert, client_key) if client_cert else None

    try:
        start = time.monotonic()
        async with AsyncClient(
            base_url=base_url.rstrip("/"),
            headers={
                "Authorization": f"Basic {credentials}",
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            verify=verify,
            cert=cert,
            proxies=proxy,
            trust_env=True,
            timeout=15,
        ) as client:
            resp = await client.get("/rest/api/3/myself")
            latency = round((time.monotonic() - start) * 1000)
            data = resp.json() if resp.content else {}
            account_id = data.get("accountId") if isinstance(data, dict) else None
            display_name = data.get("displayName") if isinstance(data, dict) else None
            return {
                "skipped": False,
                "connected": resp.status_code < 400,
                "status_code": resp.status_code,
                "endpoint": "/rest/api/3/myself",
                "has_account_id": bool(account_id),
                "display_name": display_name,
                "latency_ms": latency,
                "connection": {
                    "base_url": base_url,
                    "proxy": proxy_url or "(none)",
                    "verify_ssl": verify_ssl,
                    "ca_bundle": ca_bundle or "(default)",
                    "has_client_cert": bool(client_cert),
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
        "service": "jira-fetch-httpx",
        "mode": "connection-test",
        "python_package": "fetch_httpx",
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
