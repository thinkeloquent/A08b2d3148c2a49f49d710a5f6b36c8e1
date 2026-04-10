#!/usr/bin/env python3
"""Validate Elasticsearch connection status."""

import asyncio
import json
import sys
import time

from db_connection_elasticsearch import ElasticsearchConfig, check_connection


async def main():
    start = time.monotonic()
    config = ElasticsearchConfig()
    config_info = {
        "host": config.host,
        "port": config.port,
        "scheme": config.scheme,
        "vendor": config.vendor_type,
        "use_tls": config.use_tls,
        "verify_certs": config.verify_certs,
        "ssl_show_warn": config.ssl_show_warn,
        "has_ca_certs": bool(config.ca_certs),
    }
    print(f"[elasticsearch] checking connection {json.dumps(config_info)}", file=sys.stderr)
    try:
        result = await check_connection(config)
        latency_ms = round((time.monotonic() - start) * 1000)
        if result.get("success"):
            output = {
                "status": "ok",
                "service": "elasticsearch",
                "latency_ms": latency_ms,
                **config_info,
                "info": result.get("info"),
            }
        else:
            error = {
                "name": "ConnectionError",
                "message": result.get("error", "Connection check returned unsuccessful"),
                "code": None,
                "cause": None,
            }
            print(f"[elasticsearch] connection failed ({latency_ms}ms) — {error['message']}", file=sys.stderr)
            output = {
                "status": "error",
                "service": "elasticsearch",
                "latency_ms": latency_ms,
                **config_info,
                "error": error,
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
        print(f"[elasticsearch] connection failed ({latency_ms}ms) — {error['message']}", file=sys.stderr)
        output = {
            "status": "error",
            "service": "elasticsearch",
            "latency_ms": latency_ms,
            **config_info,
            "error": error,
        }

    print(json.dumps(output, indent=2))
    sys.exit(0 if output["status"] == "ok" else 1)


if __name__ == "__main__":
    asyncio.run(main())
