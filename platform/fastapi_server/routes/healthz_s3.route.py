import logging
import time

from aws_s3_client import config_from_env
from botocore.config import Config as BotoConfig
from fastapi import FastAPI, Request
from healthz_diagnostics import ConfigSanitizer

logger = logging.getLogger("fastapi_server.routes.healthz_s3")


def _build_boto_config(config: dict) -> BotoConfig:
    """Build a botocore Config from the S3 config dict."""
    kwargs: dict = {
        "connect_timeout": config.get("connect_timeout", 10),
        "read_timeout": config.get("read_timeout", 60),
        "retries": {"max_attempts": config.get("max_retries", 3)},
    }
    proxy_url = config.get("proxy_url")
    if proxy_url:
        kwargs["proxies"] = {"http": proxy_url, "https": proxy_url}
    return BotoConfig(**kwargs)


def _get_yaml_s3(app: FastAPI) -> dict | None:
    """Get storage.s3 section from AppYamlConfig, or None if unavailable."""
    app_config = getattr(getattr(app, "state", None), "config", None)
    if app_config and hasattr(app_config, "get_nested"):
        return app_config.get_nested("storage", "s3")
    return None


def mount(app: FastAPI):
    """
    Mount routes to the FastAPI application.
    This function is called by the server bootstrap process.
    """
    yaml_s3 = _get_yaml_s3(app)
    config = config_from_env(yaml_config=yaml_s3)
    logger.info(
        "[s3] S3 configuration loaded: region=%s, bucket=%s, endpointUrl=%s, keyPrefix=%s, hasCredentials=%s, proxy=%s",
        config["region"],
        config["bucket_name"] or "(not set)",
        config["endpoint_url"] or "(default)",
        config["key_prefix"],
        bool(config["aws_access_key_id"] and config["aws_secret_access_key"]),
        config.get("proxy_url") or "(none)",
    )

    @app.get("/healthz/s3")
    async def healthz_s3(request: Request):
        start = time.monotonic()
        yaml_s3 = _get_yaml_s3(request.app)
        config = config_from_env(yaml_config=yaml_s3)

        logger.info(
            "healthz/s3: checking connection region=%s endpoint=%s hasCredentials=%s",
            config["region"],
            config["endpoint_url"] or "(default)",
            bool(config["aws_access_key_id"] and config["aws_secret_access_key"]),
        )

        session = None
        client = None
        try:
            from aiobotocore.session import get_session

            session = get_session()
            client_kwargs: dict = {
                "region_name": config["region"],
                "config": _build_boto_config(config),
                "verify": config.get("verify_ssl", False),
            }
            if config["endpoint_url"]:
                client_kwargs["endpoint_url"] = config["endpoint_url"]
            if config["aws_access_key_id"] and config["aws_secret_access_key"]:
                client_kwargs["aws_access_key_id"] = config["aws_access_key_id"]
                client_kwargs["aws_secret_access_key"] = config["aws_secret_access_key"]

            client = await session.create_client("s3", **client_kwargs).__aenter__()
            response = await client.list_buckets()
            bucket_count = len(response.get("Buckets", []))
            latency_ms = round((time.monotonic() - start) * 1000)

            logger.info("healthz/s3: connected (%dms) bucketCount=%d", latency_ms, bucket_count)
            return {
                "status": "ok",
                "service": "s3",
                "latency_ms": latency_ms,
                "config": ConfigSanitizer().sanitize(config),
                "bucketCount": bucket_count,
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
                "healthz/s3: connection failed (%dms) — %s", latency_ms, error["message"]
            )
            return {
                "status": "error",
                "service": "s3",
                "latency_ms": latency_ms,
                "error": error,
            }
        finally:
            if client:
                await client.__aexit__(None, None, None)
