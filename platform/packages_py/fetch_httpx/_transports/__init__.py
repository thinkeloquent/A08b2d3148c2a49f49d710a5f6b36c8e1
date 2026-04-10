"""
Transport Layer for fetch_httpx package.

This module provides the transport abstraction layer that handles
actual HTTP communication, connection pooling, and service routing.

Exports:
- BaseTransport: Sync transport protocol
- AsyncBaseTransport: Async transport protocol
- HTTPTransport: Sync HTTP transport implementation
- AsyncHTTPTransport: Async HTTP transport implementation
- MountRouter: URL-pattern based transport routing
"""

from ._base import AsyncBaseTransport, BaseTransport
from ._http import AsyncHTTPTransport, HTTPTransport
from ._mounts import MountRouter

__all__ = [
    "BaseTransport",
    "AsyncBaseTransport",
    "HTTPTransport",
    "AsyncHTTPTransport",
    "MountRouter",
]
