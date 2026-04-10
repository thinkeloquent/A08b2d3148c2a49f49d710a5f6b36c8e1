#!/usr/bin/env python3
"""
Connection test for OpenAI Embeddings via the openai SDK.

Tests proxy, verify_ssl, ca_bundle, and client cert configuration
by resolving config from AppYamlConfig and making an embedding request.
OpenAI uses Bearer token auth.
"""

from __future__ import annotations

import argparse
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
from auth_config import resolve_api_key


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


def _effective_api_key(provider_cfg: dict) -> str | None:
    """Resolve API key from config, falling back to env."""
    key = resolve_api_key(provider_cfg)
    if not key or key.startswith("{{"):
        key = os.environ.get("OPENAI_EMBEDDINGS_API_KEY") or os.environ.get("OPENAI_API_KEY")
    return key


def _test_connection(provider_cfg: dict, conn_cfg: dict) -> dict:
    """Test OpenAI Embeddings connection using the openai SDK."""
    from openai import OpenAI
    import httpx as _httpx

    api_key = _effective_api_key(provider_cfg)
    if not api_key:
        return {"skipped": True, "reason": "no OPENAI_API_KEY or api_key in config"}

    base_url = provider_cfg.get("base_url", "https://api.openai.com/v1")
    model = provider_cfg.get("model", "text-embedding-3-small")

    # Build httpx client with proxy/SSL/cert for the OpenAI SDK
    verify = conn_cfg["ca_bundle"] if conn_cfg["ca_bundle"] else conn_cfg["verify_ssl"]
    cert = (conn_cfg["client_cert"], conn_cfg["client_key"]) if conn_cfg["client_cert"] else None
    proxy = conn_cfg["proxy_url"]

    http_client = _httpx.Client(
        verify=verify,
        cert=cert,
        proxy=proxy,
        trust_env=True,
    )

    try:
        start = time.monotonic()
        client = OpenAI(
            api_key=api_key,
            base_url=base_url,
            http_client=http_client,
            timeout=30.0,
        )
        response = client.embeddings.create(model=model, input="Hello, world!")
        latency = round((time.monotonic() - start) * 1000)
        embedding = response.data[0].embedding

        return {
            "skipped": False,
            "connected": len(embedding) > 0,
            "endpoint": "POST /v1/embeddings",
            "model": response.model,
            "dimensions": len(embedding),
            "usage_total_tokens": response.usage.total_tokens,
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
    finally:
        http_client.close()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--app-env", default="dev")
    parser.add_argument("--config-dir", required=True)
    args = parser.parse_args()

    app_cfg = load_app_yaml_config(config_dir=args.config_dir, app_env=args.app_env).config
    provider_cfg = app_cfg.get_nested("providers", "openai_embeddings", default={}) or {}
    conn_cfg = _resolve_connection_config(provider_cfg)

    connection_test = _test_connection(provider_cfg, conn_cfg)

    summary = {
        "service": "openai-embeddings-sdk",
        "mode": "connection-test",
        "python_package": "openai",
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
    raise SystemExit(main())
