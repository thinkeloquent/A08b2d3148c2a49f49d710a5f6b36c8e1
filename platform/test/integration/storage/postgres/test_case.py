#!/usr/bin/env python3
"""Direct package test for db_connection_postgres with connection check."""

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
from db_connection_postgres.config import PostgresConfig
from db_connection_postgres.client import get_async_sqlalchemy_engine

async def _test_connection(config: PostgresConfig) -> dict:
    engine = get_async_sqlalchemy_engine(config)
    try:
        from sqlalchemy import text

        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return {"connected": True, "error": None}
    except Exception as exc:
        return {"connected": False, "error": str(exc)}
    finally:
        await engine.dispose()

async def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--app-env", default="dev")
    parser.add_argument("--config-dir", required=True)
    args = parser.parse_args()

    app_cfg = load_app_yaml_config(config_dir=args.config_dir, app_env=args.app_env).config
    pg_cfg = PostgresConfig()

    connection_test = await _test_connection(pg_cfg)

    summary = {
        "service": "postgres",
        "mode": "direct-package-import",
        "python_package": "db_connection_postgres",
        "app_yaml_initialized": True,
        "app_yaml_storage_postgres": app_cfg.get_nested("storage", "postgres", default={}),
        "resolved_config": {
            "host": pg_cfg.host,
            "port": pg_cfg.port,
            "database": pg_cfg.database,
            "schema": pg_cfg.schema,
            "ssl_mode": pg_cfg.ssl_mode,
        },
        "connection_test": connection_test,
        "uses_app_yaml_directly": False,
        "note": "db_connection_postgres resolves env/config/defaults; it does not read AppYamlConfig internally.",
    }
    print(json.dumps(summary, indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
