#!/usr/bin/env python3
"""Validate PostgreSQL connection status."""

import asyncio
import json
import sys
import time

import asyncpg

from db_connection_postgres import PostgresConfig


async def main():
    start = time.monotonic()
    config = PostgresConfig()
    config_info = {
        "host": config.host,
        "port": config.port,
        "database": config.database,
        "schema": config.schema,
        "ssl_mode": config.ssl_mode,
        "has_ssl_ca_file": bool(config.ssl_ca_file),
    }
    print(f"[postgres] checking connection {json.dumps(config_info)}", file=sys.stderr)
    conn = None
    try:
        connect_kwargs = config.get_connection_kwargs()
        conn = await asyncpg.connect(**connect_kwargs)
        await conn.fetchval("SELECT 1")
        latency_ms = round((time.monotonic() - start) * 1000)
        result = {
            "status": "ok",
            "service": "postgres",
            "latency_ms": latency_ms,
            **config_info,
        }
    except Exception as exc:
        latency_ms = round((time.monotonic() - start) * 1000)
        error = {
            "name": type(exc).__name__,
            "message": str(exc),
            "code": getattr(exc, "errno", None) or getattr(exc, "code", None),
            "cause": (
                {
                    "name": type(exc.__cause__).__name__,
                    "message": str(exc.__cause__),
                    "code": getattr(exc.__cause__, "code", None),
                }
                if exc.__cause__
                else None
            ),
        }
        print(f"[postgres] connection failed ({latency_ms}ms) — {error['message']}", file=sys.stderr)
        result = {
            "status": "error",
            "service": "postgres",
            "latency_ms": latency_ms,
            **config_info,
            "error": error,
        }
    finally:
        if conn:
            try:
                await conn.close()
            except Exception:
                pass

    print(json.dumps(result, indent=2))
    sys.exit(0 if result["status"] == "ok" else 1)


if __name__ == "__main__":
    asyncio.run(main())
