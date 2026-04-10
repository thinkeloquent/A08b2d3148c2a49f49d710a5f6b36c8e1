#!/usr/bin/env python3
"""Direct package test for aws_s3_client.config_from_env with connection check."""

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
from aws_s3_client.config import config_from_env
from aws_s3_client import create_sdk

async def _test_connection(resolved: dict) -> dict:
    try:
        sdk = create_sdk(resolved)
        await sdk.list_keys()
        await sdk.close()
        return {"connected": True, "error": None}
    except Exception as exc:
        return {"connected": False, "error": str(exc)}

async def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--app-env", default="dev")
    parser.add_argument("--config-dir", required=True)
    args = parser.parse_args()

    app_cfg = load_app_yaml_config(config_dir=args.config_dir, app_env=args.app_env).config
    yaml_s3 = app_cfg.get_nested("storage", "s3", default={}) or {}
    resolved = config_from_env(yaml_config=yaml_s3)

    connection_test = await _test_connection(resolved)

    summary = {
        "service": "s3",
        "mode": "direct-package-import",
        "python_package": "aws_s3_client.config",
        "app_yaml_initialized": True,
        "app_yaml_storage_s3": yaml_s3,
        "resolved_config": {
            "bucket_name": resolved.get("bucket_name"),
            "region": resolved.get("region"),
            "endpoint_url": resolved.get("endpoint_url"),
            "proxy_url": resolved.get("proxy_url"),
            "force_path_style": resolved.get("force_path_style"),
        },
        "connection_test": connection_test,
        "uses_app_yaml_directly": True,
        "note": "config_from_env supports yaml_config (storage.s3) and env/default fallback.",
    }
    # Redact sensitive fields before logging (CodeQL py/clear-text-logging-sensitive-data)
    _sensitive = {"access_key", "secret_key", "token", "password", "api_key", "secret"}
    summary["app_yaml_storage_s3"] = {k: ("*******" if k in _sensitive else v) for k, v in (summary["app_yaml_storage_s3"] or {}).items()}
    print(json.dumps(summary, indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
