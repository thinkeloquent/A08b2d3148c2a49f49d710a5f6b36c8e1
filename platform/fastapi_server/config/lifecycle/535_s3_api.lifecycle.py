"""
AWS S3 Storage API Lifecycle Hook for FastAPI

Registers versioned provider routes for S3 CRUD operations
under the /~/api/rest/{api_release_date}/providers/s3_api prefix.
Bucket is provided as a URL path parameter.

Loading Order: 535 (after GitHub SDK audit at 530)

Environment Variables (for S3 client config):
    AWS_S3_REGION        - AWS region (default: us-east-1)
    AWS_S3_ENDPOINT      - Custom endpoint URL (for LocalStack, MinIO)
    AWS_S3_ACCESS_KEY    - AWS access key ID
    AWS_S3_SECRET_KEY    - AWS secret access key

Registered endpoints (prefix: /~/api/rest/{api_release_date}/providers/s3_api):
    GET    /health                                           - Health check
    GET    /v1/buckets                                       - List all buckets
    POST   /v1/buckets/{bucket}                              - Create bucket
    HEAD   /v1/buckets/{bucket}                              - Check bucket exists
    GET    /v1/buckets/{bucket}/objects                      - List objects (query: prefix, cursor, maxKeys)
    POST   /v1/buckets/{bucket}/objects                      - Put object (body: { key, data, contentType? })
    GET    /v1/buckets/{bucket}/objects/by-key               - Get object (query: key)
    PUT    /v1/buckets/{bucket}/objects/by-key               - Update object (query: key, body: data)
    DELETE /v1/buckets/{bucket}/objects/by-key               - Delete object (query: key)
    HEAD   /v1/buckets/{bucket}/objects/by-key               - Check object exists / metadata (query: key)
    GET    /v1/buckets/{bucket}/objects/metadata             - Get object metadata (query: key)
"""

import logging
import time
from typing import Any

from botocore.config import Config as BotoConfig
from fastapi import APIRouter, FastAPI, Query, Request
from fastapi.responses import JSONResponse, Response

from aws_s3_client import config_from_env

logger = logging.getLogger("lifecycle.s3_api")

VENDOR = "s3_api"
VENDOR_VERSION = "v1.0.0"


def _get_yaml_s3(app: FastAPI) -> dict | None:
    """Get storage.s3 section from AppYamlConfig, or None if unavailable."""
    app_config = getattr(getattr(app, "state", None), "config", None)
    if app_config and hasattr(app_config, "get_nested"):
        return app_config.get_nested("storage", "s3")
    return None


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


async def _create_s3_client(app: FastAPI):
    """Create an aiobotocore S3 client from resolved config."""
    from aiobotocore.session import get_session

    yaml_s3 = _get_yaml_s3(app)
    config = config_from_env(yaml_config=yaml_s3)
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
    return client, config


def _is_not_found(exc: Exception) -> bool:
    """Check if an exception is a 404 / NoSuchKey type error."""
    err_str = str(exc).lower()
    return "nosuchkey" in err_str or "not found" in err_str or "404" in err_str


async def onStartup(app: FastAPI, config: dict[str, Any]) -> None:
    """Startup hook -- Register S3 provider routes."""
    logger.info("Starting s3_api lifecycle hook...")
    try:
        logger.info("Initializing S3 API...")

        s3_api_release_date = app.state.config.get_nested(
            "api_release_date", "contract_snapshot_date", "provider_s3"
        )
        PREFIX = f"/~/api/rest/{s3_api_release_date}/providers/{VENDOR}"
        logger.debug("S3 API prefix: %s", PREFIX)

        # Test connectivity
        configured = False
        s3_config: dict = {}
        try:
            yaml_s3 = _get_yaml_s3(app)
            s3_config = config_from_env(yaml_config=yaml_s3)
            # Quick connectivity test
            client, _ = await _create_s3_client(app)
            await client.__aexit__(None, None, None)
            configured = True
            logger.info(
                "S3 client verified: region=%s endpoint=%s",
                s3_config.get("region"),
                s3_config.get("endpoint_url") or "(default)",
            )
        except Exception as err:
            logger.warning(
                "S3 client creation failed -- v1 routes will NOT be registered. %s", err
            )

        router = APIRouter(prefix=PREFIX)

        @router.get("/health")
        async def s3_health():
            return JSONResponse(content={
                "status": "ok",
                "vendor": VENDOR,
                "vendor_version": VENDOR_VERSION,
                "configured": configured,
                "region": s3_config.get("region"),
                "endpointUrl": s3_config.get("endpoint_url"),
            })

        if configured:
            v1 = APIRouter(prefix="/v1")

            # ── List all buckets ──
            @v1.get("/buckets")
            async def list_buckets(request: Request):
                start = time.monotonic()
                client = None
                try:
                    client, _ = await _create_s3_client(request.app)
                    response = await client.list_buckets()
                    buckets = [
                        {
                            "name": b.get("Name"),
                            "creationDate": b["CreationDate"].isoformat()
                            if b.get("CreationDate")
                            else None,
                        }
                        for b in response.get("Buckets", [])
                    ]
                    return {
                        "status": "ok",
                        "latency_ms": round((time.monotonic() - start) * 1000),
                        "buckets": buckets,
                    }
                except Exception as exc:
                    return JSONResponse(
                        status_code=500,
                        content={
                            "status": "error",
                            "latency_ms": round((time.monotonic() - start) * 1000),
                            "error": "S3 operation failed",
                        },
                    )
                finally:
                    if client:
                        await client.__aexit__(None, None, None)

            # ── Create bucket ──
            @v1.post("/buckets/{bucket}")
            async def create_bucket(bucket: str, request: Request):
                start = time.monotonic()
                client = None
                try:
                    client, _ = await _create_s3_client(request.app)
                    await client.create_bucket(Bucket=bucket)
                    return JSONResponse(
                        status_code=201,
                        content={
                            "status": "ok",
                            "latency_ms": round((time.monotonic() - start) * 1000),
                            "bucket": bucket,
                            "created": True,
                        },
                    )
                except Exception as exc:
                    return JSONResponse(
                        status_code=500,
                        content={
                            "status": "error",
                            "latency_ms": round((time.monotonic() - start) * 1000),
                            "error": "S3 operation failed",
                        },
                    )
                finally:
                    if client:
                        await client.__aexit__(None, None, None)

            # ── Check bucket exists ──
            @v1.head("/buckets/{bucket}")
            async def head_bucket(bucket: str, request: Request):
                client = None
                try:
                    client, _ = await _create_s3_client(request.app)
                    await client.head_bucket(Bucket=bucket)
                    return Response(status_code=200)
                except Exception:
                    return Response(status_code=404)
                finally:
                    if client:
                        await client.__aexit__(None, None, None)

            # ── List objects in bucket ──
            @v1.get("/buckets/{bucket}/objects")
            async def list_objects(
                bucket: str,
                request: Request,
                prefix: str = "",
                cursor: str = "",
                maxKeys: int = 50,
            ):
                start = time.monotonic()
                max_keys_val = min(200, max(1, maxKeys))
                client = None
                try:
                    client, _ = await _create_s3_client(request.app)
                    params: dict = {"Bucket": bucket, "MaxKeys": max_keys_val}
                    if prefix:
                        params["Prefix"] = prefix
                    if cursor:
                        params["ContinuationToken"] = cursor

                    response = await client.list_objects_v2(**params)

                    objects = [
                        {
                            "key": obj.get("Key"),
                            "size": obj.get("Size"),
                            "lastModified": obj["LastModified"].isoformat()
                            if obj.get("LastModified")
                            else None,
                            "storageClass": obj.get("StorageClass"),
                        }
                        for obj in response.get("Contents", [])
                    ]
                    common_prefixes = [
                        p.get("Prefix") for p in response.get("CommonPrefixes", [])
                    ]

                    return {
                        "status": "ok",
                        "latency_ms": round((time.monotonic() - start) * 1000),
                        "bucket": bucket,
                        "prefix": prefix or None,
                        "nextCursor": response.get("NextContinuationToken"),
                        "isTruncated": response.get("IsTruncated", False),
                        "keyCount": response.get("KeyCount", 0),
                        "objects": objects,
                        "commonPrefixes": common_prefixes,
                    }
                except Exception as exc:
                    return JSONResponse(
                        status_code=500,
                        content={
                            "status": "error",
                            "latency_ms": round((time.monotonic() - start) * 1000),
                            "error": "S3 operation failed",
                        },
                    )
                finally:
                    if client:
                        await client.__aexit__(None, None, None)

            # ── Put object (create/update) ──
            @v1.post("/buckets/{bucket}/objects")
            async def put_object(bucket: str, request: Request):
                start = time.monotonic()
                client = None
                try:
                    body = await request.json()
                    key = body.get("key")
                    data = body.get("data", {})
                    content_type = body.get("contentType", "application/json")

                    if not key:
                        return JSONResponse(
                            status_code=400,
                            content={"status": "error", "error": "key is required in request body"},
                        )

                    encoded = data if isinstance(data, str) else __import__("json").dumps(data)

                    client, _ = await _create_s3_client(request.app)
                    await client.put_object(
                        Bucket=bucket,
                        Key=key,
                        Body=encoded.encode("utf-8"),
                        ContentType=content_type,
                    )

                    return JSONResponse(
                        status_code=201,
                        content={
                            "status": "ok",
                            "latency_ms": round((time.monotonic() - start) * 1000),
                            "bucket": bucket,
                            "key": key,
                            "size_bytes": len(encoded.encode("utf-8")),
                        },
                    )
                except Exception as exc:
                    return JSONResponse(
                        status_code=500,
                        content={
                            "status": "error",
                            "latency_ms": round((time.monotonic() - start) * 1000),
                            "error": "S3 operation failed",
                        },
                    )
                finally:
                    if client:
                        await client.__aexit__(None, None, None)

            # ── Get object by key ──
            @v1.get("/buckets/{bucket}/objects/by-key")
            async def get_object(
                bucket: str,
                request: Request,
                key: str = Query(..., description="S3 object key"),
            ):
                start = time.monotonic()
                if not key:
                    return JSONResponse(
                        status_code=400,
                        content={"status": "error", "error": 'query parameter "key" is required'},
                    )

                client = None
                try:
                    client, _ = await _create_s3_client(request.app)
                    response = await client.get_object(Bucket=bucket, Key=key)
                    content = await response["Body"].read()
                    content_str = content.decode("utf-8")

                    import json as _json
                    try:
                        parsed = _json.loads(content_str)
                    except (ValueError, _json.JSONDecodeError):
                        parsed = content_str

                    return {
                        "status": "ok",
                        "latency_ms": round((time.monotonic() - start) * 1000),
                        "bucket": bucket,
                        "key": key,
                        "contentType": response.get("ContentType"),
                        "contentLength": response.get("ContentLength", 0),
                        "data": parsed,
                    }
                except Exception as exc:
                    if _is_not_found(exc):
                        return JSONResponse(
                            status_code=404,
                            content={"status": "error", "error": f"Object not found: {key}"},
                        )
                    return JSONResponse(
                        status_code=500,
                        content={
                            "status": "error",
                            "latency_ms": round((time.monotonic() - start) * 1000),
                            "error": "S3 operation failed",
                        },
                    )
                finally:
                    if client:
                        await client.__aexit__(None, None, None)

            # ── Update object by key ──
            @v1.put("/buckets/{bucket}/objects/by-key")
            async def update_object(
                bucket: str,
                request: Request,
                key: str = Query(..., description="S3 object key"),
            ):
                start = time.monotonic()
                if not key:
                    return JSONResponse(
                        status_code=400,
                        content={"status": "error", "error": 'query parameter "key" is required'},
                    )

                client = None
                try:
                    body = await request.body()
                    content_type = request.headers.get("content-type", "application/json")

                    client, _ = await _create_s3_client(request.app)
                    await client.put_object(
                        Bucket=bucket,
                        Key=key,
                        Body=body,
                        ContentType=content_type,
                    )

                    return {
                        "status": "ok",
                        "latency_ms": round((time.monotonic() - start) * 1000),
                        "bucket": bucket,
                        "key": key,
                        "size_bytes": len(body),
                    }
                except Exception as exc:
                    return JSONResponse(
                        status_code=500,
                        content={
                            "status": "error",
                            "latency_ms": round((time.monotonic() - start) * 1000),
                            "error": "S3 operation failed",
                        },
                    )
                finally:
                    if client:
                        await client.__aexit__(None, None, None)

            # ── Delete object by key ──
            @v1.delete("/buckets/{bucket}/objects/by-key")
            async def delete_object(
                bucket: str,
                request: Request,
                key: str = Query(..., description="S3 object key"),
            ):
                start = time.monotonic()
                if not key:
                    return JSONResponse(
                        status_code=400,
                        content={"status": "error", "error": 'query parameter "key" is required'},
                    )

                client = None
                try:
                    client, _ = await _create_s3_client(request.app)
                    await client.delete_object(Bucket=bucket, Key=key)

                    return {
                        "status": "ok",
                        "latency_ms": round((time.monotonic() - start) * 1000),
                        "bucket": bucket,
                        "key": key,
                        "deleted": True,
                    }
                except Exception as exc:
                    return JSONResponse(
                        status_code=500,
                        content={
                            "status": "error",
                            "latency_ms": round((time.monotonic() - start) * 1000),
                            "error": "S3 operation failed",
                        },
                    )
                finally:
                    if client:
                        await client.__aexit__(None, None, None)

            # ── Head object (exists + metadata) ──
            @v1.head("/buckets/{bucket}/objects/by-key")
            async def head_object(
                bucket: str,
                request: Request,
                key: str = Query(..., description="S3 object key"),
            ):
                if not key:
                    return Response(status_code=400)

                client = None
                try:
                    client, _ = await _create_s3_client(request.app)
                    response = await client.head_object(Bucket=bucket, Key=key)
                    headers = {
                        "x-s3-content-type": response.get("ContentType", ""),
                        "x-s3-content-length": str(response.get("ContentLength", 0)),
                        "x-s3-last-modified": response["LastModified"].isoformat()
                        if response.get("LastModified")
                        else "",
                        "x-s3-etag": response.get("ETag", ""),
                        "x-s3-storage-class": response.get("StorageClass", ""),
                    }
                    return Response(status_code=200, headers=headers)
                except Exception:
                    return Response(status_code=404)
                finally:
                    if client:
                        await client.__aexit__(None, None, None)

            # ── Get object metadata (GET version) ──
            @v1.get("/buckets/{bucket}/objects/metadata")
            async def get_object_metadata(
                bucket: str,
                request: Request,
                key: str = Query(..., description="S3 object key"),
            ):
                start = time.monotonic()
                if not key:
                    return JSONResponse(
                        status_code=400,
                        content={"status": "error", "error": 'query parameter "key" is required'},
                    )

                client = None
                try:
                    client, _ = await _create_s3_client(request.app)
                    response = await client.head_object(Bucket=bucket, Key=key)

                    return {
                        "status": "ok",
                        "latency_ms": round((time.monotonic() - start) * 1000),
                        "bucket": bucket,
                        "key": key,
                        "contentType": response.get("ContentType"),
                        "contentLength": response.get("ContentLength", 0),
                        "lastModified": response["LastModified"].isoformat()
                        if response.get("LastModified")
                        else None,
                        "eTag": response.get("ETag"),
                        "storageClass": response.get("StorageClass"),
                        "metadata": response.get("Metadata", {}),
                        "serverSideEncryption": response.get("ServerSideEncryption"),
                    }
                except Exception as exc:
                    if _is_not_found(exc):
                        return JSONResponse(
                            status_code=404,
                            content={"status": "error", "error": f"Object not found: {key}"},
                        )
                    return JSONResponse(
                        status_code=500,
                        content={
                            "status": "error",
                            "latency_ms": round((time.monotonic() - start) * 1000),
                            "error": "S3 operation failed",
                        },
                    )
                finally:
                    if client:
                        await client.__aexit__(None, None, None)

            router.include_router(v1)

        app.include_router(router)

        if configured:
            logger.info("S3 API initialized -- routes registered at %s/*", PREFIX)
        else:
            logger.info(
                "Health endpoint registered at %s/health (v1 routes skipped -- no S3 client)",
                PREFIX,
            )

        logger.info("s3_api lifecycle hook completed successfully")
    except Exception as exc:
        logger.error("s3_api lifecycle hook failed: %s", exc, exc_info=True)
        raise


async def onShutdown(app: FastAPI, config: dict[str, Any]) -> None:
    """Shutdown hook."""
    logger.info("s3_api shutdown complete")
