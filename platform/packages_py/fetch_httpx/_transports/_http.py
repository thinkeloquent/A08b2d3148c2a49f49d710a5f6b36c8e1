"""
HTTP Transport Implementation for fetch_httpx package.

Provides concrete HTTP transport implementations using httpx as the backend.
Includes connection pooling, retry logic, and full configuration support.
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from .. import logger as logger_module
from .._config import DEFAULT_LIMITS, DEFAULT_TIMEOUT, Limits, Proxy, Timeout
from .._exceptions import (
    map_exception,
)
from .._models import Headers, Request, Response, StreamingResponse
from ._base import AsyncBaseTransport, BaseTransport

if TYPE_CHECKING:
    from .._types import CertTypes, VerifyTypes

logger = logger_module.create("fetch_httpx", __file__)


def _mask_proxy_url(proxy: Proxy | None) -> str | None:
    """Mask credentials in proxy URL for safe logging."""
    if proxy is None:
        return None
    url = str(proxy.url)
    if "@" in url:
        # URL has credentials - mask them
        try:
            scheme_end = url.index("://") + 3
            at_pos = url.index("@")
            return f"{url[:scheme_end]}***:***{url[at_pos:]}"
        except ValueError:
            return url
    return url


# =============================================================================
# HTTP Transport (Sync)
# =============================================================================

class HTTPTransport(BaseTransport):
    """
    Synchronous HTTP transport implementation.

    Wraps httpx.HTTPTransport with additional features:
    - Connection retry logic
    - Comprehensive logging
    - Configuration management

    Example:
        transport = HTTPTransport(
            verify=True,
            cert=("/path/to/cert.pem", "/path/to/key.pem"),
            timeout=Timeout(connect=5.0, read=30.0),
            retries=3,
        )
    """

    def __init__(
        self,
        *,
        verify: VerifyTypes = True,
        cert: CertTypes | None = None,
        http1: bool = True,
        http2: bool = False,
        limits: Limits | None = None,
        proxy: Proxy | None = None,
        uds: str | None = None,
        local_address: str | None = None,
        retries: int = 0,
        timeout: Timeout | None = None,
    ) -> None:
        self._verify = verify
        self._cert = cert
        self._http1 = http1
        self._http2 = http2
        self._limits = limits or DEFAULT_LIMITS
        self._proxy = proxy
        self._uds = uds
        self._local_address = local_address
        self._retries = retries
        self._timeout = timeout or DEFAULT_TIMEOUT

        self._transport: Any | None = None
        self._closed = False

        # Log proxy if configured
        if proxy:
            logger.warn(
                "Proxy configured for transport",
                context={"proxy": _mask_proxy_url(proxy)},
            )

        logger.info(
            "HTTPTransport created",
            context={
                "http2": http2,
                "retries": retries,
                "verify": verify if isinstance(verify, bool) else "custom",
                "proxy_enabled": proxy is not None,
            }
        )

    def _ensure_transport(self) -> Any:
        """Lazily initialize the underlying transport."""
        if self._transport is None:
            try:
                import httpx

                self._transport = httpx.HTTPTransport(
                    verify=self._verify,
                    cert=self._cert,
                    http1=self._http1,
                    http2=self._http2,
                    limits=httpx.Limits(
                        max_connections=self._limits.max_connections,
                        max_keepalive_connections=self._limits.max_keepalive_connections,
                        keepalive_expiry=self._limits.keepalive_expiry,
                    ),
                    proxy=str(self._proxy.url) if self._proxy else None,
                    uds=self._uds,
                    local_address=self._local_address,
                    retries=self._retries,
                )
            except ImportError as err:
                raise ImportError(
                    "httpx is required for HTTPTransport. "
                    "Install with: pip install httpx"
                ) from err

        return self._transport

    def handle_request(self, request: Request) -> Response:
        """Send request and return response."""
        transport = self._ensure_transport()

        logger.debug(
            "Sending request",
            context={
                "method": request.method,
                "url": str(request.url),
            }
        )

        try:
            import httpx

            # Convert to httpx request
            httpx_request = httpx.Request(
                method=request.method,
                url=str(request.url),
                headers=dict(request.headers.items()),
                content=request.content,
            )

            # Note: timeout is configured on the transport, not per-request
            httpx_response = transport.handle_request(httpx_request)

            # Convert to our Response
            response = Response(
                status_code=httpx_response.status_code,
                headers=Headers(list(httpx_response.headers.items())),
                content=httpx_response.content,
                request=request,
            )

            logger.debug(
                "Response received",
                context={
                    "status_code": response.status_code,
                }
            )

            return response

        except Exception as e:
            logger.error(
                "Request failed",
                context={
                    "error": str(e),
                    "error_type": type(e).__name__,
                    "url": str(request.url),
                    "method": request.method,
                }
            )
            raise map_exception(e, request=request) from e

    def close(self) -> None:
        """Close the transport."""
        if self._transport is not None and not self._closed:
            self._transport.close()
            self._closed = True
            logger.debug("HTTPTransport closed")


# =============================================================================
# Async HTTP Transport
# =============================================================================

class AsyncHTTPTransport(AsyncBaseTransport):
    """
    Asynchronous HTTP transport implementation.

    Wraps httpx.AsyncHTTPTransport with additional features:
    - Connection retry logic
    - Comprehensive logging
    - Configuration management

    Example:
        transport = AsyncHTTPTransport(
            verify=True,
            cert=("/path/to/cert.pem", "/path/to/key.pem"),
            timeout=Timeout(connect=5.0, read=30.0),
            retries=3,
            http2=True,
        )
    """

    def __init__(
        self,
        *,
        verify: VerifyTypes = True,
        cert: CertTypes | None = None,
        http1: bool = True,
        http2: bool = False,
        limits: Limits | None = None,
        proxy: Proxy | None = None,
        uds: str | None = None,
        local_address: str | None = None,
        retries: int = 0,
        timeout: Timeout | None = None,
    ) -> None:
        self._verify = verify
        self._cert = cert
        self._http1 = http1
        self._http2 = http2
        self._limits = limits or DEFAULT_LIMITS
        self._proxy = proxy
        self._uds = uds
        self._local_address = local_address
        self._retries = retries
        self._timeout = timeout or DEFAULT_TIMEOUT

        self._transport: Any | None = None
        self._closed = False

        # Log proxy if configured
        if proxy:
            logger.warn(
                "Proxy configured for async transport",
                context={"proxy": _mask_proxy_url(proxy)},
            )

        logger.info(
            "AsyncHTTPTransport created",
            context={
                "http2": http2,
                "retries": retries,
                "verify": verify if isinstance(verify, bool) else "custom",
                "proxy_enabled": proxy is not None,
            }
        )

    async def _ensure_transport(self) -> Any:
        """Lazily initialize the underlying transport."""
        if self._transport is None:
            try:
                import httpx

                self._transport = httpx.AsyncHTTPTransport(
                    verify=self._verify,
                    cert=self._cert,
                    http1=self._http1,
                    http2=self._http2,
                    limits=httpx.Limits(
                        max_connections=self._limits.max_connections,
                        max_keepalive_connections=self._limits.max_keepalive_connections,
                        keepalive_expiry=self._limits.keepalive_expiry,
                    ),
                    proxy=str(self._proxy.url) if self._proxy else None,
                    uds=self._uds,
                    local_address=self._local_address,
                    retries=self._retries,
                )
            except ImportError as err:
                raise ImportError(
                    "httpx is required for AsyncHTTPTransport. "
                    "Install with: pip install httpx"
                ) from err

        return self._transport

    async def handle_async_request(self, request: Request) -> Response:
        """Send request and return response asynchronously."""
        transport = await self._ensure_transport()

        logger.debug(
            "Sending async request",
            context={
                "method": request.method,
                "url": str(request.url),
            }
        )

        try:
            import httpx

            # Convert to httpx request
            httpx_request = httpx.Request(
                method=request.method,
                url=str(request.url),
                headers=dict(request.headers.items()),
                content=request.content,
            )

            httpx_response = await transport.handle_async_request(httpx_request)

            # Read response content
            content = await httpx_response.aread()

            # Convert to our Response
            response = Response(
                status_code=httpx_response.status_code,
                headers=Headers(list(httpx_response.headers.items())),
                content=content,
                request=request,
            )

            logger.debug(
                "Async response received",
                context={
                    "status_code": response.status_code,
                }
            )

            return response

        except Exception as e:
            logger.error(
                "Async request failed",
                context={
                    "error": str(e),
                    "error_type": type(e).__name__,
                    "url": str(request.url),
                    "method": request.method,
                }
            )
            raise map_exception(e, request=request) from e

    async def handle_async_stream(self, request: Request) -> StreamingResponse:
        """Send request and return streaming response asynchronously.

        Unlike handle_async_request, this does NOT read the response body,
        allowing for streaming iteration.
        """
        transport = await self._ensure_transport()

        logger.debug(
            "Sending async stream request",
            context={
                "method": request.method,
                "url": str(request.url),
            }
        )

        try:
            import httpx

            # Convert to httpx request
            httpx_request = httpx.Request(
                method=request.method,
                url=str(request.url),
                headers=dict(request.headers.items()),
                content=request.content,
            )

            httpx_response = await transport.handle_async_request(httpx_request)

            # Return streaming response (do NOT read content)
            response = StreamingResponse(
                httpx_response=httpx_response,
                request=request,
            )

            logger.debug(
                "Async stream response received",
                context={
                    "status_code": response.status_code,
                }
            )

            return response

        except Exception as e:
            logger.error(
                "Async stream request failed",
                context={
                    "error": str(e),
                    "error_type": type(e).__name__,
                    "url": str(request.url),
                    "method": request.method,
                }
            )
            raise map_exception(e, request=request) from e

    async def aclose(self) -> None:
        """Close the transport asynchronously."""
        if self._transport is not None and not self._closed:
            await self._transport.aclose()
            self._closed = True
            logger.debug("AsyncHTTPTransport closed")


__all__ = [
    "HTTPTransport",
    "AsyncHTTPTransport",
]
