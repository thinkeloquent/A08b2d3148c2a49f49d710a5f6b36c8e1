import logging
import time
from dataclasses import asdict

import asyncpg
from fastapi import FastAPI, Request

from db_connection_postgres import PostgresConfig
from healthz_diagnostics import ConfigSanitizer

logger = logging.getLogger("fastapi_server.routes.healthz_postgres")


def mount(app: FastAPI):
    """
    Mount routes to the FastAPI application.
    This function is called by the server bootstrap process.
    """

    @app.get("/healthz/postgres")
    async def healthz_postgres(request: Request):
        start = time.monotonic()
        config = PostgresConfig()
        config_info = ConfigSanitizer().sanitize(asdict(config))
        logger.info(
            "healthz/postgres: checking connection host=%s port=%s database=%s schema=%s ssl_mode=%s",
            config.host,
            config.port,
            config.database,
            config.schema,
            config.ssl_mode,
        )
        conn = None
        try:
            connect_kwargs = config.get_connection_kwargs()
            conn = await asyncpg.connect(**connect_kwargs)
            await conn.fetchval("SELECT 1")
            latency_ms = round((time.monotonic() - start) * 1000)
            logger.info("healthz/postgres: connected (%dms)", latency_ms)
            return {
                "status": "ok",
                "service": "postgres",
                "latency_ms": latency_ms,
                "config": config_info,
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
            logger.error(
                "healthz/postgres: connection failed (%dms) — %s",
                latency_ms,
                error["message"],
            )
            return {
                "status": "error",
                "service": "postgres",
                "latency_ms": latency_ms,
                "config": config_info,
                "error": error,
            }
        finally:
            if conn:
                try:
                    await conn.close()
                except Exception:
                    pass
