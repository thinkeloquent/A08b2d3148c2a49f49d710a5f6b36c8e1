"""
Type Definitions for fetch_httpx package.

This module defines all the type aliases and union types used throughout
the package, providing type safety and IDE support.

Based on httpx library type definitions with extensions for polyglot interface.
"""

from __future__ import annotations

import ssl
from collections.abc import AsyncIterator, Callable, Iterator, Mapping, Sequence
from typing import (
    TYPE_CHECKING,
    Any,
    TypeVar,
)

if TYPE_CHECKING:
    from ._auth import Auth
    from ._config import Proxy, Timeout
    from ._models import URL, Cookies, Headers, QueryParams, Request, Response


# =============================================================================
# URL Types
# =============================================================================

# URL can be specified as string, bytes, or URL object
# bytes will be decoded to UTF-8 string
URLTypes = str | bytes | URL

# Raw URL components
RawURL = tuple[bytes, bytes, int | None, bytes]


# =============================================================================
# Header Types
# =============================================================================

# Headers can be specified in multiple formats
HeaderTypes = (
    Headers
    | Mapping[str, str]
    | Mapping[bytes, bytes]
    | Sequence[tuple[str, str]]
    | Sequence[tuple[bytes, bytes]]
)


# =============================================================================
# Query Parameter Types
# =============================================================================

# Query params can be dict, QueryParams, or list of tuples
QueryParamTypes = (
    QueryParams
    | Mapping[str, str | list[str]]
    | list[tuple[str, str]]
    | tuple[tuple[str, str], ...]
    | str
    | bytes
    | None
)


# =============================================================================
# Cookie Types
# =============================================================================

# Cookies can be dict or Cookies object
CookieTypes = (
    Cookies
    | dict[str, str]
    | list[tuple[str, str]]
)


# =============================================================================
# Timeout Types
# =============================================================================

# Timeout can be float (seconds), None (disabled), or Timeout object
TimeoutTypes = (
    float
    | None
    | Timeout
    | tuple[float | None, float | None, float | None, float | None]
)


# =============================================================================
# Authentication Types
# =============================================================================

# Auth can be tuple (username, password) or Auth object
AuthTypes = (
    tuple[str, str]
    | tuple[bytes, bytes]
    | Auth
    | Callable[[Request], Request]
    | None
)


# =============================================================================
# Certificate Types
# =============================================================================

# Certificate can be path string or tuple of (cert, key) or (cert, key, password)
CertTypes = (
    str  # Combined PEM file path
    | tuple[str, str]  # (cert_path, key_path)
    | tuple[str, str, str]  # (cert_path, key_path, password)
    | None
)


# =============================================================================
# SSL/TLS Types
# =============================================================================

# Verify can be bool, CA bundle path, or SSL context
VerifyTypes = bool | str | ssl.SSLContext


# =============================================================================
# Proxy Types
# =============================================================================

# Proxy can be URL string or Proxy object
ProxyTypes = str | Proxy | None

# Multiple proxies by scheme
ProxiesTypes = ProxyTypes | dict[str, ProxyTypes]


# =============================================================================
# Content Types
# =============================================================================

# Request content can be various types
RequestContent = str | bytes | Iterator[bytes] | AsyncIterator[bytes]

# Request data for form encoding
RequestData = Mapping[str, Any] | Sequence[tuple[str, Any]]

# Request files
FileContent = bytes | str
FileTypes = (
    tuple[str, FileContent]  # (filename, content)
    | tuple[str, FileContent, str]  # (filename, content, content_type)
    | tuple[str, FileContent, str, Mapping[str, str]]  # (filename, content, content_type, headers)
)
RequestFiles = Mapping[str, FileTypes] | Sequence[tuple[str, FileTypes]]


# =============================================================================
# Response Types
# =============================================================================

# Response content types
ResponseContent = bytes | str | Iterator[bytes] | AsyncIterator[bytes]


# =============================================================================
# Event Hook Types
# =============================================================================

# Sync event hook
SyncEventHook = Callable[[Request], None]
SyncResponseHook = Callable[[Response], None]

# Async event hook
AsyncEventHook = Callable[[Request], Any]
AsyncResponseHook = Callable[[Response], Any]

# Combined event hooks
EventHook = SyncEventHook | AsyncEventHook
ResponseHook = SyncResponseHook | AsyncResponseHook

# Event hooks mapping
EventHooks = dict[str, list[EventHook | ResponseHook]]


# =============================================================================
# Transport Types
# =============================================================================

# Type variable for request
T = TypeVar("T")

# HTTP methods
HTTPMethod = str  # "GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH"


# =============================================================================
# Primitive Coercion Functions
# =============================================================================

def primitive_value_to_str(value: Any) -> str:
    """Convert primitive value to string for headers/params."""
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, int | float):
        return str(value)
    if isinstance(value, bytes):
        return value.decode("utf-8", errors="replace")
    return str(value)


def coerce_header_value(value: Any) -> str:
    """Coerce a value to a valid header string."""
    if isinstance(value, str):
        return value
    if isinstance(value, bytes):
        return value.decode("latin-1")
    return str(value)


def coerce_query_param(key: str, value: Any) -> list[tuple[str, str]]:
    """Coerce a query parameter value to list of tuples."""
    if value is None:
        return []
    if isinstance(value, list | tuple):
        return [(key, primitive_value_to_str(v)) for v in value]
    return [(key, primitive_value_to_str(value))]


__all__ = [
    # URL types
    "URLTypes",
    "RawURL",
    # Header types
    "HeaderTypes",
    # Query param types
    "QueryParamTypes",
    # Cookie types
    "CookieTypes",
    # Timeout types
    "TimeoutTypes",
    # Auth types
    "AuthTypes",
    # Certificate types
    "CertTypes",
    # SSL types
    "VerifyTypes",
    # Proxy types
    "ProxyTypes",
    "ProxiesTypes",
    # Content types
    "RequestContent",
    "RequestData",
    "RequestFiles",
    "FileTypes",
    "FileContent",
    "ResponseContent",
    # Event hook types
    "EventHook",
    "ResponseHook",
    "EventHooks",
    # Transport types
    "HTTPMethod",
    # Coercion functions
    "primitive_value_to_str",
    "coerce_header_value",
    "coerce_query_param",
]
