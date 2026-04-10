"""
Base Transport Protocols for fetch_httpx package.

Defines the abstract transport interfaces that must be implemented
by concrete transport classes.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .._models import Request, Response


class BaseTransport(ABC):
    """
    Abstract base class for synchronous HTTP transports.

    Transports handle the actual sending of HTTP requests and
    receiving of responses at the network level.

    Implementations should handle:
    - Connection management (pooling, keepalive)
    - TLS/SSL configuration
    - Proxy handling
    - Timeout application
    - Retry logic (for connection errors only)
    """

    @abstractmethod
    def handle_request(self, request: Request) -> Response:
        """
        Send an HTTP request and return the response.

        Args:
            request: The prepared HTTP request

        Returns:
            The HTTP response

        Raises:
            TransportError: For connection/network errors
            TimeoutException: For timeout errors
        """
        ...

    def close(self) -> None:
        """
        Close the transport and release resources.

        Should close any open connections and clean up resources.
        Safe to call multiple times.
        """
        return None

    def __enter__(self) -> BaseTransport:
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        self.close()


class AsyncBaseTransport(ABC):
    """
    Abstract base class for asynchronous HTTP transports.

    Async version of BaseTransport for use with asyncio.
    """

    @abstractmethod
    async def handle_async_request(self, request: Request) -> Response:
        """
        Send an HTTP request and return the response asynchronously.

        Args:
            request: The prepared HTTP request

        Returns:
            The HTTP response

        Raises:
            TransportError: For connection/network errors
            TimeoutException: For timeout errors
        """
        ...

    async def aclose(self) -> None:
        """
        Close the transport and release resources asynchronously.

        Should close any open connections and clean up resources.
        Safe to call multiple times.
        """
        return None

    async def __aenter__(self) -> AsyncBaseTransport:
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        await self.aclose()


__all__ = [
    "BaseTransport",
    "AsyncBaseTransport",
]
