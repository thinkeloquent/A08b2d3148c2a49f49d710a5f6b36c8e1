import logging
import time
from dataclasses import asdict

from fastapi import FastAPI, Request

from db_connection_elasticsearch import ElasticsearchConfig, check_connection
from healthz_diagnostics import ConfigSanitizer

logger = logging.getLogger("fastapi_server.routes.healthz_elasticsearch")


def mount(app: FastAPI):
    """
    Mount routes to the FastAPI application.
    This function is called by the server bootstrap process.
    """

    @app.get("/healthz/elasticsearch")
    async def healthz_elasticsearch(request: Request):
        start = time.monotonic()
        try:
            config = ElasticsearchConfig()
            config_info = ConfigSanitizer().sanitize(asdict(config))
            logger.info(
                "healthz/elasticsearch: checking connection host=%s port=%s scheme=%s vendor=%s use_tls=%s index=%s",
                config.host,
                config.port,
                config.scheme,
                config.vendor_type,
                config.use_tls,
                config.index,
            )
            result = await check_connection(config)
            latency_ms = round((time.monotonic() - start) * 1000)
            if result.get("success"):
                logger.info("healthz/elasticsearch: connected (%dms)", latency_ms)
                return {
                    "status": "ok",
                    "service": "elasticsearch",
                    "latency_ms": latency_ms,
                    "config": config_info,
                    "info": result.get("info"),
                }
            error = {
                "name": "ConnectionError",
                "message": result.get("error", "Connection check returned unsuccessful"),
                "code": None,
                "cause": None,
            }
            logger.error(
                "healthz/elasticsearch: connection failed (%dms) — %s",
                latency_ms,
                error["message"],
            )
            return {
                "status": "error",
                "service": "elasticsearch",
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
            logger.error(
                "healthz/elasticsearch: connection failed (%dms) — %s",
                latency_ms,
                error["message"],
            )
            return {
                "status": "error",
                "service": "elasticsearch",
                "latency_ms": latency_ms,
                "error": error,
            }
