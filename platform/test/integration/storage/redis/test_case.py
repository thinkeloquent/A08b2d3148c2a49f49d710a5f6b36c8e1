#!/usr/bin/env python3
"""Direct package test for db_connection_redis with connection check."""

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
from db_connection_redis import RedisConfig
from db_connection_redis.client import check_connection_status

async def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--app-env", default="dev")
    parser.add_argument("--config-dir", required=True)
    args = parser.parse_args()

    app_cfg = load_app_yaml_config(config_dir=args.config_dir, app_env=args.app_env).config
    yaml_redis = app_cfg.get_nested("storage", "redis", default={})
    redis_cfg = RedisConfig()

    connection_test = await check_connection_status(redis_cfg)

    summary = {
        "service": "redis",
        "mode": "direct-package-import",
        "python_package": "db_connection_redis",
        "app_yaml_initialized": True,
        "app_yaml_storage_redis": yaml_redis,
        "resolved_config": {
            "host": redis_cfg.host,
            "port": redis_cfg.port,
            "db": redis_cfg.db,
            "use_ssl": redis_cfg.use_ssl,
        },
        "connection_test": connection_test,
        "uses_app_yaml_directly": True,
        "note": "db_connection_redis reads AppYamlConfig.storage.redis when initialized, then falls back to env/defaults.",
    }
    print(json.dumps(summary, indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
