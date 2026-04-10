"""
Httpx-based S3 Client implementations.

Provides HttpxS3ClientAsync and HttpxS3ClientSync that implement the
S3ClientProtocol using httpx + botocore SigV4Auth for request signing.
This gives true httpx transport injection while maintaining the same
6-method protocol expected by storage.py.

Polyglot parity with TypeScript undici-http-handler.ts + S3Client pattern.

Usage:
    import httpx
    from cache_json_awss3_storage.httpx_s3_client import HttpxS3ClientAsync
    from cache_json_awss3_storage.models import ClientConfig

    config = ClientConfig(bucket_name="my-bucket", region_name="us-east-1")
    async with httpx.AsyncClient() as http:
        s3 = HttpxS3ClientAsync(config, http)
        await s3.put_object(Bucket="my-bucket", Key="k", Body=b"data")
"""

from __future__ import annotations

import hashlib
import io
from typing import Any
from xml.etree import ElementTree

import httpx

from cache_json_awss3_storage.logger import create as create_logger
from cache_json_awss3_storage.models import ClientConfig

_logger = create_logger("cache_json_awss3_storage", __file__)


class AsyncBytesIO:
    """
    Wrapper around bytes that provides an async read() method.

    Required because storage.py line 380-381 does:
        body = response["Body"]
        if hasattr(body, "read"):
            content = await body.read()
    """

    def __init__(self, data: bytes) -> None:
        self._data = data

    async def read(self) -> bytes:
        """Return the underlying bytes (awaitable for async compat)."""
        return self._data


class SyncBytesIO:
    """
    Wrapper around bytes that provides a sync read() method.

    For sync S3 client protocol compat with storage patterns.
    """

    def __init__(self, data: bytes) -> None:
        self._data = data

    def read(self) -> bytes:
        """Return the underlying bytes."""
        return self._data


def _get_credentials(config: ClientConfig) -> tuple[str, str]:
    """
    Resolve AWS credentials from config or environment/profile.

    Returns (access_key_id, secret_access_key).
    """
    if config.aws_access_key_id and config.aws_secret_access_key:
        return config.aws_access_key_id, config.aws_secret_access_key

    from botocore.session import Session

    session = Session()
    creds = session.get_credentials()
    if creds is None:
        raise RuntimeError(
            "No AWS credentials found. Provide aws_access_key_id and "
            "aws_secret_access_key in config, or configure credentials via "
            "environment variables or AWS profile."
        )
    resolved = creds.get_frozen_credentials()
    return resolved.access_key, resolved.secret_key


def _sign_request(
    *,
    method: str,
    url: str,
    headers: dict[str, str],
    body: bytes | None,
    region: str,
    access_key: str,
    secret_key: str,
    service: str = "s3",
) -> dict[str, str]:
    """
    Sign an HTTP request using AWS SigV4.

    Returns a new headers dict with Authorization, X-Amz-Date,
    and x-amz-content-sha256 added.
    """
    from botocore.auth import SigV4Auth
    from botocore.awsrequest import AWSRequest
    from botocore.credentials import Credentials

    credentials = Credentials(access_key, secret_key)

    aws_request = AWSRequest(
        method=method.upper(),
        url=url,
        headers=headers,
        data=body or b"",
    )

    signer = SigV4Auth(credentials, service, region)
    signer.add_auth(aws_request)

    # Merge signed headers back
    signed_headers = dict(aws_request.headers)
    return signed_headers


def _build_url(
    config: ClientConfig,
    bucket: str,
    key: str = "",
    query_params: dict[str, str] | None = None,
) -> str:
    """
    Build the S3 URL for path-style or virtual-hosted addressing.

    Path-style:    https://endpoint/bucket/key
    Virtual-hosted: https://bucket.endpoint/key
    """
    endpoint = config.endpoint_url
    if not endpoint:
        region = config.region_name or "us-east-1"
        endpoint = f"https://s3.{region}.amazonaws.com"

    # Strip trailing slash
    endpoint = endpoint.rstrip("/")

    if config.addressing_style == "virtual":
        # Insert bucket as subdomain
        if endpoint.startswith("https://"):
            base = f"https://{bucket}.{endpoint[8:]}"
        elif endpoint.startswith("http://"):
            base = f"http://{bucket}.{endpoint[7:]}"
        else:
            base = f"https://{bucket}.{endpoint}"
    else:
        # Path-style (default)
        base = f"{endpoint}/{bucket}"

    url = f"{base}/{key}" if key else base

    if query_params:
        qs = "&".join(
            f"{k}={v}" for k, v in sorted(query_params.items()) if v is not None
        )
        if qs:
            url = f"{url}?{qs}"

    return url


def _parse_list_objects_xml(xml_bytes: bytes) -> dict[str, Any]:
    """Parse ListObjectsV2 XML response into the expected dict format."""
    root = ElementTree.fromstring(xml_bytes)
    # S3 XML uses a namespace
    ns = ""
    if root.tag.startswith("{"):
        ns = root.tag.split("}")[0] + "}"

    result: dict[str, Any] = {
        "Contents": [],
        "IsTruncated": False,
    }

    for content_el in root.findall(f"{ns}Contents"):
        key_el = content_el.find(f"{ns}Key")
        if key_el is not None and key_el.text:
            entry: dict[str, Any] = {"Key": key_el.text}

            size_el = content_el.find(f"{ns}Size")
            if size_el is not None and size_el.text:
                entry["Size"] = int(size_el.text)

            etag_el = content_el.find(f"{ns}ETag")
            if etag_el is not None and etag_el.text:
                entry["ETag"] = etag_el.text

            last_modified_el = content_el.find(f"{ns}LastModified")
            if last_modified_el is not None and last_modified_el.text:
                entry["LastModified"] = last_modified_el.text

            result["Contents"].append(entry)

    is_truncated_el = root.find(f"{ns}IsTruncated")
    if is_truncated_el is not None and is_truncated_el.text:
        result["IsTruncated"] = is_truncated_el.text.lower() == "true"

    next_token_el = root.find(f"{ns}NextContinuationToken")
    if next_token_el is not None and next_token_el.text:
        result["NextContinuationToken"] = next_token_el.text

    return result


def _build_delete_objects_xml(delete: dict[str, Any]) -> bytes:
    """Build the XML body for a DeleteObjects request."""
    objects = delete.get("Objects", [])
    quiet = delete.get("Quiet", False)

    parts = ['<?xml version="1.0" encoding="UTF-8"?>', "<Delete>"]
    if quiet:
        parts.append("<Quiet>true</Quiet>")
    for obj in objects:
        key = obj["Key"]
        parts.append(f"<Object><Key>{key}</Key></Object>")
    parts.append("</Delete>")

    return "".join(parts).encode("utf-8")


def _parse_delete_objects_xml(xml_bytes: bytes) -> dict[str, Any]:
    """Parse DeleteObjects XML response."""
    root = ElementTree.fromstring(xml_bytes)
    ns = ""
    if root.tag.startswith("{"):
        ns = root.tag.split("}")[0] + "}"

    deleted = []
    for deleted_el in root.findall(f"{ns}Deleted"):
        key_el = deleted_el.find(f"{ns}Key")
        if key_el is not None and key_el.text:
            deleted.append({"Key": key_el.text})

    return {"Deleted": deleted}


class HttpxS3ClientAsync:
    """
    Async S3 client implementing S3ClientProtocol via httpx.AsyncClient + SigV4.

    Uses the provided httpx.AsyncClient for all HTTP transport. The caller
    owns the httpx client lifecycle.
    """

    def __init__(self, config: ClientConfig, httpx_client: httpx.AsyncClient) -> None:
        self._config = config
        self._http = httpx_client
        self._region = config.region_name or "us-east-1"
        self._access_key, self._secret_key = _get_credentials(config)

    def _sign(
        self,
        method: str,
        url: str,
        headers: dict[str, str],
        body: bytes | None = None,
    ) -> dict[str, str]:
        return _sign_request(
            method=method,
            url=url,
            headers=headers,
            body=body,
            region=self._region,
            access_key=self._access_key,
            secret_key=self._secret_key,
        )

    async def put_object(
        self,
        *,
        Bucket: str,
        Key: str,
        Body: bytes,
        ContentType: str | None = None,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Put an object to S3."""
        url = _build_url(self._config, Bucket, Key)
        headers: dict[str, str] = {}
        if ContentType:
            headers["Content-Type"] = ContentType

        signed_headers = self._sign("PUT", url, headers, Body)
        response = await self._http.put(url, content=Body, headers=signed_headers)
        response.raise_for_status()

        etag = response.headers.get("etag", "")
        return {"ETag": etag}

    async def get_object(
        self,
        *,
        Bucket: str,
        Key: str,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Get an object from S3."""
        url = _build_url(self._config, Bucket, Key)
        headers: dict[str, str] = {}

        signed_headers = self._sign("GET", url, headers)
        response = await self._http.get(url, headers=signed_headers)
        response.raise_for_status()

        return {
            "Body": AsyncBytesIO(response.content),
            "ContentLength": int(response.headers.get("content-length", 0)),
            "ContentType": response.headers.get("content-type", ""),
            "ETag": response.headers.get("etag", ""),
        }

    async def delete_object(
        self,
        *,
        Bucket: str,
        Key: str,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Delete an object from S3."""
        url = _build_url(self._config, Bucket, Key)
        headers: dict[str, str] = {}

        signed_headers = self._sign("DELETE", url, headers)
        response = await self._http.delete(url, headers=signed_headers)
        response.raise_for_status()

        return {}

    async def head_object(
        self,
        *,
        Bucket: str,
        Key: str,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Get object metadata from S3."""
        url = _build_url(self._config, Bucket, Key)
        headers: dict[str, str] = {}

        signed_headers = self._sign("HEAD", url, headers)
        response = await self._http.head(url, headers=signed_headers)
        response.raise_for_status()

        return {
            "ContentLength": int(response.headers.get("content-length", 0)),
            "ContentType": response.headers.get("content-type", ""),
            "ETag": response.headers.get("etag", ""),
        }

    async def list_objects_v2(
        self,
        *,
        Bucket: str,
        Prefix: str | None = None,
        ContinuationToken: str | None = None,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """List objects in S3 bucket."""
        query_params: dict[str, str] = {"list-type": "2"}
        if Prefix is not None:
            query_params["prefix"] = Prefix
        if ContinuationToken is not None:
            query_params["continuation-token"] = ContinuationToken

        url = _build_url(self._config, Bucket, query_params=query_params)
        headers: dict[str, str] = {}

        signed_headers = self._sign("GET", url, headers)
        response = await self._http.get(url, headers=signed_headers)
        response.raise_for_status()

        return _parse_list_objects_xml(response.content)

    async def delete_objects(
        self,
        *,
        Bucket: str,
        Delete: dict[str, Any],
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Delete multiple objects from S3."""
        xml_body = _build_delete_objects_xml(Delete)
        content_md5 = hashlib.md5(xml_body).digest()
        import base64

        md5_b64 = base64.b64encode(content_md5).decode("ascii")

        query_params: dict[str, str] = {"delete": ""}
        url = _build_url(self._config, Bucket, query_params=query_params)
        headers: dict[str, str] = {
            "Content-Type": "application/xml",
            "Content-MD5": md5_b64,
        }

        signed_headers = self._sign("POST", url, headers, xml_body)
        response = await self._http.post(url, content=xml_body, headers=signed_headers)
        response.raise_for_status()

        return _parse_delete_objects_xml(response.content)


class HttpxS3ClientSync:
    """
    Sync S3 client implementing S3ClientProtocol methods via httpx.Client + SigV4.

    Uses the provided httpx.Client for all HTTP transport. The caller
    owns the httpx client lifecycle.

    Note: Methods are NOT async. This class does not satisfy S3ClientProtocol
    (which is async) but can be used directly where sync access is needed.
    """

    def __init__(self, config: ClientConfig, httpx_client: httpx.Client) -> None:
        self._config = config
        self._http = httpx_client
        self._region = config.region_name or "us-east-1"
        self._access_key, self._secret_key = _get_credentials(config)

    def _sign(
        self,
        method: str,
        url: str,
        headers: dict[str, str],
        body: bytes | None = None,
    ) -> dict[str, str]:
        return _sign_request(
            method=method,
            url=url,
            headers=headers,
            body=body,
            region=self._region,
            access_key=self._access_key,
            secret_key=self._secret_key,
        )

    def put_object(
        self,
        *,
        Bucket: str,
        Key: str,
        Body: bytes,
        ContentType: str | None = None,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Put an object to S3."""
        url = _build_url(self._config, Bucket, Key)
        headers: dict[str, str] = {}
        if ContentType:
            headers["Content-Type"] = ContentType

        signed_headers = self._sign("PUT", url, headers, Body)
        response = self._http.put(url, content=Body, headers=signed_headers)
        response.raise_for_status()

        etag = response.headers.get("etag", "")
        return {"ETag": etag}

    def get_object(
        self,
        *,
        Bucket: str,
        Key: str,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Get an object from S3."""
        url = _build_url(self._config, Bucket, Key)
        headers: dict[str, str] = {}

        signed_headers = self._sign("GET", url, headers)
        response = self._http.get(url, headers=signed_headers)
        response.raise_for_status()

        return {
            "Body": SyncBytesIO(response.content),
            "ContentLength": int(response.headers.get("content-length", 0)),
            "ContentType": response.headers.get("content-type", ""),
            "ETag": response.headers.get("etag", ""),
        }

    def delete_object(
        self,
        *,
        Bucket: str,
        Key: str,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Delete an object from S3."""
        url = _build_url(self._config, Bucket, Key)
        headers: dict[str, str] = {}

        signed_headers = self._sign("DELETE", url, headers)
        response = self._http.delete(url, headers=signed_headers)
        response.raise_for_status()

        return {}

    def head_object(
        self,
        *,
        Bucket: str,
        Key: str,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Get object metadata from S3."""
        url = _build_url(self._config, Bucket, Key)
        headers: dict[str, str] = {}

        signed_headers = self._sign("HEAD", url, headers)
        response = self._http.head(url, headers=signed_headers)
        response.raise_for_status()

        return {
            "ContentLength": int(response.headers.get("content-length", 0)),
            "ContentType": response.headers.get("content-type", ""),
            "ETag": response.headers.get("etag", ""),
        }

    def list_objects_v2(
        self,
        *,
        Bucket: str,
        Prefix: str | None = None,
        ContinuationToken: str | None = None,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """List objects in S3 bucket."""
        query_params: dict[str, str] = {"list-type": "2"}
        if Prefix is not None:
            query_params["prefix"] = Prefix
        if ContinuationToken is not None:
            query_params["continuation-token"] = ContinuationToken

        url = _build_url(self._config, Bucket, query_params=query_params)
        headers: dict[str, str] = {}

        signed_headers = self._sign("GET", url, headers)
        response = self._http.get(url, headers=signed_headers)
        response.raise_for_status()

        return _parse_list_objects_xml(response.content)

    def delete_objects(
        self,
        *,
        Bucket: str,
        Delete: dict[str, Any],
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Delete multiple objects from S3."""
        xml_body = _build_delete_objects_xml(Delete)
        content_md5 = hashlib.md5(xml_body).digest()
        import base64

        md5_b64 = base64.b64encode(content_md5).decode("ascii")

        query_params: dict[str, str] = {"delete": ""}
        url = _build_url(self._config, Bucket, query_params=query_params)
        headers: dict[str, str] = {
            "Content-Type": "application/xml",
            "Content-MD5": md5_b64,
        }

        signed_headers = self._sign("POST", url, headers, xml_body)
        response = self._http.post(url, content=xml_body, headers=signed_headers)
        response.raise_for_status()

        return _parse_delete_objects_xml(response.content)
