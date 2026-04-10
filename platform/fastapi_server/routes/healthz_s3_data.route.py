from aws_s3_client import config_from_env
from botocore.config import Config as BotoConfig
from fastapi import FastAPI, Query, Request
from fastapi.responses import JSONResponse


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


def _get_yaml_s3(app) -> dict | None:
    """Get storage.s3 section from AppYamlConfig, or None if unavailable."""
    app_config = getattr(getattr(app, "state", None), "config", None)
    if app_config and hasattr(app_config, "get_nested"):
        return app_config.get_nested("storage", "s3")
    return None


def mount(app: FastAPI):
    """
    Mount S3 data-exploration routes.
    Read-only endpoints for browsing buckets, objects, and object metadata.
    """

    async def _create_client(request_app=None):
        """Create a short-lived S3 client from environment config."""
        from aiobotocore.session import get_session

        yaml_s3 = _get_yaml_s3(request_app or app)
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

    @app.get("/healthz/s3/buckets")
    async def s3_buckets(request: Request):
        client = None
        try:
            client, config = await _create_client(request.app)
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
                "configuredBucket": config["bucket_name"] or None,
                "buckets": buckets,
            }
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"error": str(e)},
            )
        finally:
            if client:
                await client.__aexit__(None, None, None)

    @app.get("/healthz/s3/buckets/{bucket}/objects")
    async def s3_bucket_objects(
        bucket: str,
        request: Request,
        prefix: str = "",
        cursor: str = "",
        maxKeys: int = 50,
    ):
        max_keys_val = min(200, max(1, maxKeys))
        client = None
        try:
            client, _config = await _create_client(request.app)

            params = {"Bucket": bucket, "MaxKeys": max_keys_val}
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
                "bucket": bucket,
                "prefix": prefix or None,
                "nextCursor": response.get("NextContinuationToken"),
                "isTruncated": response.get("IsTruncated", False),
                "keyCount": response.get("KeyCount", 0),
                "objects": objects,
                "commonPrefixes": common_prefixes,
            }
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"error": str(e)},
            )
        finally:
            if client:
                await client.__aexit__(None, None, None)

    @app.get("/healthz/s3/buckets/{bucket}/objects/metadata")
    async def s3_object_metadata(
        bucket: str,
        request: Request,
        key: str = Query(..., description="S3 object key"),
    ):
        object_key = key
        if not object_key:
            return JSONResponse(
                status_code=400,
                content={"error": "Object key is required"},
            )

        client = None
        try:
            client, _config = await _create_client(request.app)
            response = await client.head_object(Bucket=bucket, Key=object_key)

            return {
                "bucket": bucket,
                "key": object_key,
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
        except Exception as e:
            error_str = str(e).lower()
            if "404" in error_str or "not found" in error_str or "nosuchkey" in error_str:
                return JSONResponse(
                    status_code=404,
                    content={"error": f"Object not found: {object_key}"},
                )
            return JSONResponse(
                status_code=500,
                content={"error": str(e)},
            )
        finally:
            if client:
                await client.__aexit__(None, None, None)
