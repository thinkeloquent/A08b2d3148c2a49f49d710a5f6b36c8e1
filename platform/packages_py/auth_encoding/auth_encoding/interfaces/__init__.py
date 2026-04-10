"""
Polyglot interface definitions for auth encoding.
These interfaces ensure identical contracts between TypeScript and Python.
"""
from typing import Protocol, Dict, Optional, Any
from typing_extensions import TypedDict


class AuthCredentials(TypedDict, total=False):
    """Authentication credentials interface."""

    username: Optional[str]
    password: Optional[str]
    email: Optional[str]
    token: Optional[str]
    headerKey: Optional[str]
    headerValue: Optional[str]
    value: Optional[str]
    key: Optional[str]
    apiKey: Optional[str]


class EncodingResult(TypedDict):
    """Result of encoding operation."""

    headers: Dict[str, str]


class EncodingMetadata(TypedDict):
    """Encoding metadata for SDK result."""

    authType: str
    headerName: str
    encoded: bool


class SDKEncodingResult(TypedDict):
    """SDK encoding result with headers and metadata."""

    headers: Dict[str, str]
    metadata: EncodingMetadata


class AuthEncoder(Protocol):
    """Auth encoder interface."""

    def encode(self, auth_type: str, credentials: Dict[str, Any]) -> EncodingResult:
        """Encode credentials into headers."""
        ...


__all__ = [
    "AuthCredentials",
    "EncodingResult",
    "EncodingMetadata",
    "SDKEncodingResult",
    "AuthEncoder",
]
