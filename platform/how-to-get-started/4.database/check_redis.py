#!/usr/bin/env python3
"""Validate Redis connection status."""

import asyncio
import json
import sys
import time

from db_connection_redis import RedisConfig, RedisConnectionFactory


async def main():
    start = time.monotonic()
    config = RedisConfig()
    config_info = {
        "host": config.host,
        "port": config.port,
        "db": config.db,
        "use_ssl": config.use_ssl,
        "ssl_cert_reqs": config.ssl_cert_reqs,
        "has_ssl_ca_certs": bool(config.ssl_ca_certs),
    }
    print(f"[redis] checking connection {json.dumps(config_info)}", file=sys.stderr)
    try:
        async with RedisConnectionFactory(config) as factory:
            pong = await factory.ping()
            latency_ms = round((time.monotonic() - start) * 1000)
            if pong:
                result = {
                    "status": "ok",
                    "service": "redis",
                    "latency_ms": latency_ms,
                    **config_info,
                }
            else:
                result = {
                    "status": "error",
                    "service": "redis",
                    "latency_ms": latency_ms,
                    **config_info,
                    "error": {
                        "name": "ConnectionError",
                        "message": "PING returned false",
                        "code": None,
                        "cause": None,
                    },
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
        print(f"[redis] connection failed ({latency_ms}ms) — {error['message']}", file=sys.stderr)
        result = {
            "status": "error",
            "service": "redis",
            "latency_ms": latency_ms,
            **config_info,
            "error": error,
        }

    print(json.dumps(result, indent=2))
    sys.exit(0 if result["status"] == "ok" else 1)


if __name__ == "__main__":
    asyncio.run(main())
