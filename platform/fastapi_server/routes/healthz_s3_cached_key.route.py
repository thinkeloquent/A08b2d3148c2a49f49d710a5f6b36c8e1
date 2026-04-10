import json
import logging
import time

from aws_s3_client import config_from_env
from fastapi import FastAPI, Request
from healthz_diagnostics import ConfigSanitizer
from pydantic import BaseModel
from typing import Any, Optional

from cache_json_awss3_storage import (
    ClientAsync,
    create_storage,
    get_client_factory_from_app_config,
)

logger = logging.getLogger("fastapi_server.routes.healthz_s3_cached_key")


class OperationParams(BaseModel):
    key: Optional[str] = None
    data: Optional[dict[str, Any]] = None
    ttl: Optional[float] = None


class OperationRequest(BaseModel):
    config: Optional[dict[str, Any]] = None
    operation: str
    params: Optional[OperationParams] = None


def _get_yaml_s3(app: FastAPI) -> dict | None:
    """Get storage.s3 section from AppYamlConfig, or None if unavailable."""
    app_config = getattr(getattr(app, "state", None), "config", None)
    if app_config and hasattr(app_config, "get_nested"):
        return app_config.get_nested("storage", "s3")
    return None


def mount(app: FastAPI):
    """
    Mount S3 cached-key test routes.
    Provides a Postman-style API for testing cache_json_awss3_storage operations
    (save, load, delete, exists, list, clear) with user-supplied config.
    """

    @app.get("/healthz/s3-cached-key/defaults")
    async def healthz_s3_cached_key_defaults(request: Request):
        """Return server-resolved S3 config (credentials masked) for frontend pre-fill."""
        yaml_s3 = _get_yaml_s3(request.app)
        resolved = config_from_env(yaml_config=yaml_s3)
        return {
            "bucket_name": resolved.get("bucket_name") or "",
            "region_name": resolved.get("region") or "",
            "endpoint_url": resolved.get("endpoint_url") or "",
            "has_credentials": bool(
                resolved.get("aws_access_key_id") and resolved.get("aws_secret_access_key")
            ),
            "proxy_url": resolved.get("proxy_url") or "",
            "addressing_style": "path" if resolved.get("force_path_style") else "virtual",
            "key_prefix": resolved.get("key_prefix") or "jss3:",
        }

    @app.post("/healthz/s3-cached-key")
    async def healthz_s3_cached_key(request: Request):
        """
        Execute S3 cache operations with user-supplied or server-resolved config.

        Body:
            config: { bucket_name?, endpoint_url?, region_name?, aws_access_key_id?,
                      aws_secret_access_key?, proxy_url?, addressing_style?, verify?,
                      connection_timeout?, read_timeout?, key_prefix?, ttl? }
            operation: "save" | "load" | "delete" | "exists" | "list" | "clear"
            params: { key?, data?, ttl? }
        """
        body = await request.json()
        user_cfg = body.get("config") or {}
        operation = body.get("operation")
        params = body.get("params") or {}

        if not operation:
            return {"status": "error", "error": "operation is required"}

        # Build config: user overrides -> server defaults
        yaml_s3 = _get_yaml_s3(request.app)
        overrides: dict[str, Any] = {}
        if user_cfg.get("bucket_name"):
            overrides["bucket_name"] = user_cfg["bucket_name"]
        if user_cfg.get("region_name"):
            overrides["region_name"] = user_cfg["region_name"]
        if user_cfg.get("endpoint_url"):
            overrides["endpoint_url"] = user_cfg["endpoint_url"]
        if user_cfg.get("aws_access_key_id"):
            overrides["aws_access_key_id"] = user_cfg["aws_access_key_id"]
        if user_cfg.get("aws_secret_access_key"):
            overrides["aws_secret_access_key"] = user_cfg["aws_secret_access_key"]
        if user_cfg.get("proxy_url"):
            overrides["proxy_url"] = user_cfg["proxy_url"]
        if user_cfg.get("addressing_style"):
            overrides["addressing_style"] = user_cfg["addressing_style"]
        if user_cfg.get("connection_timeout") is not None:
            overrides["connection_timeout"] = user_cfg["connection_timeout"]
        if user_cfg.get("read_timeout") is not None:
            overrides["read_timeout"] = user_cfg["read_timeout"]
        if user_cfg.get("verify") is not None:
            overrides["verify"] = user_cfg["verify"]
        if user_cfg.get("ttl") is not None:
            overrides["ttl"] = user_cfg["ttl"]

        try:
            client_config = get_client_factory_from_app_config(yaml_s3, **overrides)
        except Exception as exc:
            return {
                "status": "error",
                "error": f"Config resolution failed: {exc}",
            }

        if not client_config.bucket_name:
            return {
                "status": "error",
                "error": "bucket_name is required (not in request or server config)",
            }

        key_prefix = user_cfg.get("key_prefix") or client_config.bucket_name and "jss3:" or "jss3:"
        default_ttl = client_config.ttl

        start = time.monotonic()
        try:
            async with ClientAsync(client_config) as s3_client:
                # Ensure bucket exists
                try:
                    await s3_client.head_bucket(Bucket=client_config.bucket_name)
                except Exception as bucket_err:
                    err_str = str(bucket_err).lower()
                    if "404" in err_str or "not found" in err_str or "nosuchbucket" in err_str or "403" in err_str:
                        logger.info("healthz/s3-cached-key: bucket not found, creating %s", client_config.bucket_name)
                        await s3_client.create_bucket(Bucket=client_config.bucket_name)
                        logger.info("healthz/s3-cached-key: bucket created %s", client_config.bucket_name)
                    else:
                        raise

                storage = create_storage(
                    s3_client,
                    client_config.bucket_name,
                    key_prefix=key_prefix,
                    ttl=default_ttl,
                )

                result = await _execute_operation(storage, operation, params, key_prefix, default_ttl, s3_client, client_config.bucket_name)
                latency_ms = round((time.monotonic() - start) * 1000)
                return {
                    "status": "ok",
                    "operation": operation,
                    "latency_ms": latency_ms,
                    "result": result,
                }

        except Exception as exc:
            latency_ms = round((time.monotonic() - start) * 1000)
            logger.error(
                "healthz/s3-cached-key: operation=%s failed (%dms) — %s",
                operation, latency_ms, str(exc),
            )
            return {
                "status": "error",
                "operation": operation,
                "latency_ms": latency_ms,
                "error": {
                    "name": type(exc).__name__,
                    "message": str(exc),
                    "code": getattr(exc, "code", None),
                    "cause": (
                        {
                            "name": type(exc.__cause__).__name__,
                            "message": str(exc.__cause__),
                            "code": getattr(exc.__cause__, "code", None),
                        }
                        if exc.__cause__
                        else None
                    ),
                },
            }


async def _execute_operation(
    storage,
    operation: str,
    params: dict,
    key_prefix: str,
    default_ttl: float | None,
    s3_client: Any,
    bucket_name: str,
) -> dict[str, Any]:
    """Dispatch to the appropriate storage operation."""

    if operation == "save":
        key = params.get("key")
        if not key:
            raise ValueError("params.key is required for save")
        data = params.get("data") or {}
        ttl = params.get("ttl") or default_ttl

        await storage.save(key, data, ttl=ttl)

        s3_key = f"{key_prefix}{key}"
        now = time.time()
        expires_at = now + ttl if ttl else None
        body_size = len(json.dumps({"key": key, "data": data, "created_at": now, "expires_at": expires_at}).encode("utf-8"))

        return {
            "key": key,
            "s3_key": s3_key,
            "ttl": ttl,
            "expires_at": expires_at,
            "size_bytes": body_size,
        }

    elif operation == "load":
        key = params.get("key")
        if not key:
            raise ValueError("params.key is required for load")

        s3_key = f"{key_prefix}{key}"

        # Use raw S3 GET to get full entry (including metadata)
        try:
            response = await s3_client.get_object(Bucket=bucket_name, Key=s3_key)
            body = response["Body"]
            content = await body.read() if hasattr(body, "read") else body
            entry = json.loads(content)

            now = time.time()
            is_expired = entry.get("expires_at") is not None and now > entry["expires_at"]

            return {
                "key": key,
                "s3_key": s3_key,
                "found": True,
                "expired": is_expired,
                "entry": entry,
            }
        except Exception as e:
            err_str = str(e).lower()
            if "nosuchkey" in err_str or "404" in err_str or "not found" in err_str:
                return {"key": key, "s3_key": s3_key, "found": False, "data": None}
            raise

    elif operation == "delete":
        key = params.get("key")
        if not key:
            raise ValueError("params.key is required for delete")

        await storage.delete(key)
        return {"key": key, "s3_key": f"{key_prefix}{key}", "deleted": True}

    elif operation == "exists":
        key = params.get("key")
        if not key:
            raise ValueError("params.key is required for exists")

        exists = await storage.exists(key)
        return {"key": key, "s3_key": f"{key_prefix}{key}", "exists": exists}

    elif operation == "list":
        keys = await storage.list_keys()
        key_details = []
        for k in keys:
            key_details.append({
                "key": k,
                "s3_key": f"{key_prefix}{k}",
            })
        return {
            "key_prefix": key_prefix,
            "count": len(keys),
            "keys": key_details,
        }

    elif operation == "clear":
        deleted_count = await storage.clear()
        return {
            "key_prefix": key_prefix,
            "deleted_count": deleted_count,
        }

    else:
        raise ValueError(
            f"Unknown operation: {operation}. Use: save, load, delete, exists, list, clear"
        )
