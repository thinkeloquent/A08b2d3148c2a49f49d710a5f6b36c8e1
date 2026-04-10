import logging
import time
from dataclasses import asdict

from fastapi import FastAPI, Request

from db_connection_redis import RedisConfig, get_async_redis_client
from healthz_diagnostics import ConfigSanitizer

logger = logging.getLogger("fastapi_server.routes.healthz_redis")


def mount(app: FastAPI):
    """
    Mount routes to the FastAPI application.
    This function is called by the server bootstrap process.
    """

    @app.get("/healthz/redis")
    async def healthz_redis(request: Request):
        start = time.monotonic()
        config = RedisConfig()
        config_info = ConfigSanitizer().sanitize(asdict(config))
        logger.info(
            "healthz/redis: checking connection host=%s port=%s db=%s use_ssl=%s ssl_cert_reqs=%s",
            config.host,
            config.port,
            config.db,
            config.use_ssl,
            config.ssl_cert_reqs,
        )
        redis_client = None
        try:
            redis_client = await get_async_redis_client(config)
            pong = await redis_client.ping()
            latency_ms = round((time.monotonic() - start) * 1000)
            if pong:
                logger.info("healthz/redis: connected (%dms)", latency_ms)
                return {
                    "status": "ok",
                    "service": "redis",
                    "latency_ms": latency_ms,
                    "config": config_info,
                }
            error = {
                "name": "ConnectionError",
                "message": "PING returned false",
                "code": None,
                "cause": None,
            }
            logger.error("healthz/redis: connection failed (%dms) — %s", latency_ms, error["message"])
            return {
                "status": "error",
                "service": "redis",
                "latency_ms": latency_ms,
                "config": config_info,
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
            logger.error("healthz/redis: connection failed (%dms) — %s", latency_ms, error["message"])
            return {
                "status": "error",
                "service": "redis",
                "latency_ms": latency_ms,
                "config": config_info,
                "error": error,
            }
        finally:
            if redis_client:
                try:
                    await redis_client.close()
                except Exception:
                    pass
