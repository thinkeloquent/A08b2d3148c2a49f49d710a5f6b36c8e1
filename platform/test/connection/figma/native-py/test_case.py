#!/usr/bin/env python3
"""
Connection test for Figma API via httpx directly — no local packages.

Resolves all config from environment variables only.
Uses httpx.AsyncClient with proxy, SSL, and client cert support.
"""

from __future__ import annotations

import asyncio
import json
import os
import ssl
import time

import httpx


# ---------------------------------------------------------------------------
# Connection config resolution (env vars only)
# ---------------------------------------------------------------------------

def _resolve_connection_config() -> dict:
    return {
        "proxy_url": os.environ.get("HTTPS_PROXY") or os.environ.get("HTTP_PROXY"),
        "verify_ssl": os.environ.get("VERIFY_SSL", "true").lower() != "false",
        "ca_bundle": os.environ.get("SSL_CERT_FILE") or os.environ.get("REQUESTS_CA_BUNDLE"),
        "client_cert": os.environ.get("CLIENT_CERT"),
        "client_key": os.environ.get("CLIENT_KEY"),
    }


async def _test_connection(conn_cfg: dict) -> dict:
    """Test Figma API connection using httpx.AsyncClient."""
    token = os.environ.get("FIGMA_TOKEN") or os.environ.get("FIGMA_ACCESS_TOKEN")
    if not token:
        return {"skipped": True, "reason": "no FIGMA_TOKEN or FIGMA_ACCESS_TOKEN env var"}

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
            base_url="https://api.figma.com",
            headers={"X-Figma-Token": token},
            verify=verify,
            cert=cert,
            proxy=proxy,
            trust_env=True,
            timeout=httpx.Timeout(15.0),
        ) as client:
            resp = await client.get("/v1/me")
            resp.raise_for_status()
            result = resp.json()
            latency = round((time.monotonic() - start) * 1000)
            return {
                "skipped": False,
                "connected": True,
                "status_code": resp.status_code,
                "endpoint": "/v1/me",
                "has_user": "id" in result if isinstance(result, dict) else False,
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
    conn_cfg = _resolve_connection_config()
    connection_test = await _test_connection(conn_cfg)

    summary = {
        "service": "figma-native-py",
        "mode": "connection-test",
        "python_package": "httpx",
        "app_yaml_initialized": False,
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
