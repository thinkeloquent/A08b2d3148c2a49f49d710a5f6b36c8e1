#!/usr/bin/env python3
"""Direct package test for db_connection_elasticsearch with connection check."""

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
from db_connection_elasticsearch.config import ElasticsearchConfig
from db_connection_elasticsearch.client import check_connection

async def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--app-env", default="dev")
    parser.add_argument("--config-dir", required=True)
    args = parser.parse_args()

    result = load_app_yaml_config(config_dir=args.config_dir, app_env=args.app_env)
    app_cfg = result.config
    es_cfg = ElasticsearchConfig()

    connection_test = await check_connection(es_cfg)

    summary = {
        "service": "elasticsearch",
        "mode": "direct-package-import",
        "python_package": "db_connection_elasticsearch",
        "app_yaml_initialized": True,
        "app_yaml_storage_elasticsearch": app_cfg.get_nested("storage", "elasticsearch", default={}),
        "resolved_config": {
            "vendor_type": es_cfg.vendor_type,
            "host": es_cfg.host,
            "port": es_cfg.port,
            "scheme": es_cfg.scheme,
            "index": es_cfg.index,
        },
        "connection_test": {
            "connected": connection_test.get("success", False),
            "info": connection_test.get("info"),
            "error": connection_test.get("error"),
        },
        "uses_app_yaml_directly": False,
        "note": "db_connection_elasticsearch resolves env/config/defaults; it does not read AppYamlConfig internally.",
    }
    print(json.dumps(summary, indent=2, default=str))
    return 0

if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
