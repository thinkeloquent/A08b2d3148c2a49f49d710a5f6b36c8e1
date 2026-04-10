#!/usr/bin/env python3
"""
Connection test for OpenAI Embeddings API via Python stdlib (urllib.request).

Tests proxy, verify_ssl, ca_bundle, and client cert configuration
by resolving config from AppYamlConfig and making a health-check request
using only native Python modules — no third-party HTTP libraries.
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
import urllib.request
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


def _resolve_api_key(provider_cfg: dict) -> str | None:
    """Resolve API key from config (with template guard) or env fallbacks."""
    cfg_key = provider_cfg.get("api_key") or ""
    if cfg_key and not cfg_key.startswith("{{"):
        return cfg_key
    return (
        os.environ.get("OPENAI_EMBEDDINGS_API_KEY")
        or os.environ.get("OPENAI_API_KEY")
    )


def _build_ssl_context(conn_cfg: dict) -> ssl.SSLContext:
    """Build an ssl.SSLContext from connection config."""
    if not conn_cfg["verify_ssl"]:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
    elif conn_cfg["ca_bundle"]:
        ctx = ssl.create_default_context(cafile=conn_cfg["ca_bundle"])
    else:
        ctx = ssl.create_default_context()

    if conn_cfg["client_cert"]:
        ctx.load_cert_chain(
            certfile=conn_cfg["client_cert"],
            keyfile=conn_cfg["client_key"],
        )
    return ctx


def _test_connection(provider_cfg: dict, conn_cfg: dict) -> dict:
    """Test OpenAI Embeddings API connection using urllib.request."""
    api_key = _resolve_api_key(provider_cfg)
    if not api_key:
        return {
            "skipped": True,
            "reason": "no OPENAI_EMBEDDINGS_API_KEY, OPENAI_API_KEY, or api_key in config",
        }

    base_url = provider_cfg.get("base_url") or "https://api.openai.com/v1"
    url = f"{base_url}/embeddings"

    ssl_ctx = _build_ssl_context(conn_cfg)

    # Proxy handler
    proxy_url = conn_cfg["proxy_url"]
    if proxy_url:
        proxy_handler = urllib.request.ProxyHandler({"https": proxy_url, "http": proxy_url})
        opener = urllib.request.build_opener(
            proxy_handler,
            urllib.request.HTTPSHandler(context=ssl_ctx),
        )
    else:
        opener = urllib.request.build_opener(
            urllib.request.HTTPSHandler(context=ssl_ctx),
        )

    payload = json.dumps({"model": "text-embedding-3-small", "input": "Hello, world!"}).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        method="POST",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "openai-embeddings-connection-test/1.0",
        },
    )

    try:
        start = time.monotonic()
        with opener.open(req, timeout=15) as resp:
            status_code = resp.status
            raw = resp.read()
        latency = round((time.monotonic() - start) * 1000)

        data = json.loads(raw)
        embedding = data.get("data", [{}])[0].get("embedding", [])

        return {
            "skipped": False,
            "connected": status_code < 400,
            "status_code": status_code,
            "endpoint": "POST /embeddings",
            "has_embedding": len(embedding) > 0,
            "embedding_length": len(embedding),
            "latency_ms": latency,
            "connection": {
                "base_url": base_url,
                "proxy": proxy_url or "(none)",
                "verify_ssl": conn_cfg["verify_ssl"],
                "ca_bundle": conn_cfg["ca_bundle"] or "(default)",
                "has_client_cert": bool(conn_cfg["client_cert"]),
            },
        }
    except urllib.error.HTTPError as exc:
        return {
            "skipped": False,
            "connected": False,
            "status_code": exc.code,
            "error": {"name": "HTTPError", "message": str(exc)},
        }
    except Exception as exc:
        return {
            "skipped": False,
            "connected": False,
            "error": {"name": type(exc).__name__, "message": str(exc)},
        }


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
        "service": "openai-embeddings-native-py",
        "mode": "connection-test",
        "python_module": "urllib.request",
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
