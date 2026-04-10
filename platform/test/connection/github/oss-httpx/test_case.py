#!/usr/bin/env python3
"""
Connection test for GitHub API via raw open-source httpx library.

Tests proxy, verify_ssl, ca_bundle, and client cert configuration
by resolving config from AppYamlConfig and making a health-check request
using httpx.AsyncClient directly (NOT the internal fetch_httpx wrapper).
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import re
import ssl
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

import httpx

from app_yaml_load import load_app_yaml_config


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
    """Test GitHub API connection using raw httpx.AsyncClient."""
    token = (
        provider_cfg.get("api_key")
        or os.environ.get("GITHUB_TOKEN")
        or os.environ.get("GH_TOKEN")
        or os.environ.get("GITHUB_ACCESS_TOKEN")
    )
    if not token:
        return {"skipped": True, "reason": "no GITHUB_TOKEN, GH_TOKEN, GITHUB_ACCESS_TOKEN, or api_key in config"}

    proxy_url = conn_cfg["proxy_url"]
    verify_ssl = conn_cfg["verify_ssl"]
    ca_bundle = conn_cfg["ca_bundle"]
    client_cert = conn_cfg["client_cert"]
    client_key = conn_cfg["client_key"]

    # SSL context
    verify: bool | ssl.SSLContext = True
    if ca_bundle:
        ssl_ctx = ssl.create_default_context(cafile=ca_bundle)
        verify = ssl_ctx
    elif not verify_ssl:
        verify = False

    # Client cert
    cert = None
    if client_cert and client_key:
        cert = (client_cert, client_key)
    elif client_cert:
        cert = client_cert

    # Proxy
    proxy = proxy_url if proxy_url else None

    try:
        start = time.monotonic()
        async with httpx.AsyncClient(
            base_url="https://api.github.com",
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
            },
            verify=verify,
            cert=cert,
            proxy=proxy,
            trust_env=True,
            timeout=httpx.Timeout(15.0),
        ) as client:
            resp = await client.get("/rate_limit")
            resp.raise_for_status()
            result = resp.json()
            latency = round((time.monotonic() - start) * 1000)
            return {
                "skipped": False,
                "connected": True,
                "endpoint": "/rate_limit",
                "has_rate_limit": "rate" in result if isinstance(result, dict) else False,
                "latency_ms": latency,
                "connection": {
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
    provider_cfg = app_cfg.get_nested("providers", "github", default={}) or {}
    conn_cfg = _resolve_connection_config(provider_cfg)

    connection_test = await _test_connection(provider_cfg, conn_cfg)

    summary = {
        "service": "github-oss-httpx",
        "mode": "connection-test",
        "python_package": "httpx",
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
