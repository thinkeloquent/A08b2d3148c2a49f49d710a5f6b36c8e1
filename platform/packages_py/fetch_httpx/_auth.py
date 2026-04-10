"""
Authentication Classes for fetch_httpx package.

This module implements authentication handlers:
- Auth: Base protocol for custom auth
- BasicAuth: HTTP Basic authentication
- DigestAuth: HTTP Digest authentication (RFC 7616)
- BearerAuth: OAuth2 Bearer token authentication

All auth classes implement the auth_flow generator protocol
and include logging with credential redaction.
"""

from __future__ import annotations

import base64
import hashlib
import os
import re
from collections.abc import Generator
from typing import (
    TYPE_CHECKING,
    Any,
)

from . import logger as logger_module
from ._models import Request, Response

if TYPE_CHECKING:
    from ._types import AuthTypes

logger = logger_module.create("fetch_httpx", __file__)


# =============================================================================
# Auth Protocol
# =============================================================================

class Auth:
    """
    Base class for authentication handlers.

    Subclasses should implement either:
    - __call__(request) -> request for simple auth
    - auth_flow(request) -> generator for challenge-response auth

    The auth_flow generator yields requests and receives responses,
    allowing for multi-step authentication like Digest auth.
    """

    requires_request_body: bool = False
    requires_response_body: bool = False

    def __call__(self, request: Request) -> Request:
        """Apply authentication to a request."""
        raise NotImplementedError("Subclasses must implement __call__ or auth_flow")

    def auth_flow(
        self, request: Request
    ) -> Generator[Request, Response, None]:
        """
        Generator-based authentication flow.

        Yields the request, receives the response.
        Can yield modified requests for retry.

        Default implementation calls __call__ once.
        """
        yield self(request)


# =============================================================================
# Basic Authentication
# =============================================================================

class BasicAuth(Auth):
    """
    HTTP Basic Authentication (RFC 7617).

    Encodes username:password as Base64 in Authorization header.

    Example:
        auth = BasicAuth("*****", "*****")
        client = AsyncClient(auth=auth)

    Note: Credentials are never logged.
    """

    def __init__(
        self,
        username: str,
        password: str = "",
        *,
        logger_instance: Any | None = None,
    ) -> None:
        self._username = username
        self._password = password
        self._logger = logger_instance or logger

        # Log creation without credentials
        self._logger.debug(
            "BasicAuth initialized",
            context={"username_length": len(username)}
        )

    def _build_auth_header(self) -> str:
        """Build the Authorization header value."""
        credentials = f"{self._username}:{self._password}"
        encoded = base64.b64encode(credentials.encode("utf-8")).decode("ascii")
        return f"Basic {encoded}"

    def __call__(self, request: Request) -> Request:
        """Apply Basic auth to request."""
        auth_header = self._build_auth_header()

        # Create new headers with Authorization
        new_headers = request.headers.copy()
        new_headers.set("Authorization", auth_header)

        self._logger.trace("BasicAuth applied to request")

        return Request(
            method=request.method,
            url=request.url,
            headers=new_headers,
            content=request.content,
            extensions=request.extensions,
        )

    def __repr__(self) -> str:
        return f"BasicAuth(username={self._username!r}, password='***')"


# =============================================================================
# Digest Authentication
# =============================================================================

class DigestAuth(Auth):
    """
    HTTP Digest Authentication (RFC 7616).

    Implements challenge-response authentication using MD5 or SHA-256.

    The auth_flow handles:
    1. Initial request without auth
    2. Parse 401 WWW-Authenticate challenge
    3. Compute digest response
    4. Retry with Authorization header

    Note: Credentials are never logged.
    """

    requires_response_body = False

    def __init__(
        self,
        username: str,
        password: str = "",
        *,
        logger_instance: Any | None = None,
    ) -> None:
        self._username = username
        self._password = password
        self._logger = logger_instance or logger

        # Challenge state
        self._nonce: str | None = None
        self._nonce_count = 0
        self._opaque: str | None = None
        self._qop: str | None = None
        self._algorithm: str = "MD5"
        self._realm: str | None = None

        self._logger.debug(
            "DigestAuth initialized",
            context={"username_length": len(username)}
        )

    def _parse_challenge(self, header: str) -> dict[str, str]:
        """Parse WWW-Authenticate challenge header."""
        # Remove 'Digest ' prefix
        if header.lower().startswith("digest "):
            header = header[7:]

        # Parse key="value" pairs
        result: dict[str, str] = {}
        pattern = r'(\w+)=(?:"([^"]+)"|([^\s,]+))'

        for match in re.finditer(pattern, header):
            key = match.group(1).lower()
            value = match.group(2) or match.group(3)
            result[key] = value

        return result

    def _compute_digest(
        self,
        method: str,
        uri: str,
        body_hash: str | None = None,
    ) -> str:
        """Compute the digest response."""
        # Get hash function
        if self._algorithm.upper() in ("SHA-256", "SHA256"):
            hash_fn = hashlib.sha256
        else:
            hash_fn = hashlib.md5

        # A1 = username:realm:password
        a1 = f"{self._username}:{self._realm}:{self._password}"
        ha1 = hash_fn(a1.encode()).hexdigest()

        # A2 depends on qop
        if self._qop == "auth-int" and body_hash:
            a2 = f"{method}:{uri}:{body_hash}"
        else:
            a2 = f"{method}:{uri}"
        ha2 = hash_fn(a2.encode()).hexdigest()

        # Generate cnonce
        cnonce = hashlib.md5(os.urandom(8)).hexdigest()[:16]

        # Increment nonce count
        self._nonce_count += 1
        nc = f"{self._nonce_count:08x}"

        # Compute response
        if self._qop:
            response_data = f"{ha1}:{self._nonce}:{nc}:{cnonce}:{self._qop}:{ha2}"
        else:
            response_data = f"{ha1}:{self._nonce}:{ha2}"

        response = hash_fn(response_data.encode()).hexdigest()

        return self._build_header(uri, response, nc, cnonce)

    def _build_header(
        self,
        uri: str,
        response: str,
        nc: str,
        cnonce: str,
    ) -> str:
        """Build the Authorization header value."""
        parts = [
            f'username="{self._username}"',
            f'realm="{self._realm}"',
            f'nonce="{self._nonce}"',
            f'uri="{uri}"',
            f'response="{response}"',
            f'algorithm={self._algorithm}',
        ]

        if self._qop:
            parts.extend([
                f'qop={self._qop}',
                f'nc={nc}',
                f'cnonce="{cnonce}"',
            ])

        if self._opaque:
            parts.append(f'opaque="{self._opaque}"')

        return "Digest " + ", ".join(parts)

    def auth_flow(
        self, request: Request
    ) -> Generator[Request, Response, None]:
        """Digest auth challenge-response flow."""
        # First request without auth (if no cached challenge)
        if self._nonce is None:
            self._logger.debug("DigestAuth: sending initial request")
            response = yield request

            # Check for 401 with WWW-Authenticate
            if response.status_code != 401:
                return

            www_auth = response.headers.get("WWW-Authenticate", "")
            if not www_auth.lower().startswith("digest"):
                return

            # Parse the challenge
            challenge = self._parse_challenge(www_auth)
            self._nonce = challenge.get("nonce")
            self._realm = challenge.get("realm")
            self._opaque = challenge.get("opaque")
            self._qop = challenge.get("qop", "").split(",")[0].strip() or None
            self._algorithm = challenge.get("algorithm", "MD5")

            self._logger.debug(
                "DigestAuth: challenge received",
                context={
                    "realm": self._realm,
                    "algorithm": self._algorithm,
                    "qop": self._qop,
                }
            )

        # Compute digest and retry
        uri = request.url.raw_path or "/"
        auth_header = self._compute_digest(request.method, uri)

        new_headers = request.headers.copy()
        new_headers.set("Authorization", auth_header)

        self._logger.trace("DigestAuth: sending authenticated request")

        yield Request(
            method=request.method,
            url=request.url,
            headers=new_headers,
            content=request.content,
            extensions=request.extensions,
        )

    def __call__(self, request: Request) -> Request:
        """For simple usage, apply cached digest if available."""
        if self._nonce is None:
            # No cached challenge, return unmodified
            return request

        uri = request.url.raw_path or "/"
        auth_header = self._compute_digest(request.method, uri)

        new_headers = request.headers.copy()
        new_headers.set("Authorization", auth_header)

        return Request(
            method=request.method,
            url=request.url,
            headers=new_headers,
            content=request.content,
            extensions=request.extensions,
        )

    def __repr__(self) -> str:
        return f"DigestAuth(username={self._username!r}, password='***')"


# =============================================================================
# Bearer Token Authentication
# =============================================================================

class BearerAuth(Auth):
    """
    OAuth2 Bearer Token Authentication (RFC 6750).

    Sets Authorization header with Bearer token.

    Example:
        auth = BearerAuth("eyJhbGciOiJIUzI1NiIs...")
        client = AsyncClient(auth=auth)

    Note: Token is never logged.
    """

    def __init__(
        self,
        token: str,
        *,
        logger_instance: Any | None = None,
    ) -> None:
        self._token = token
        self._logger = logger_instance or logger

        self._logger.debug(
            "BearerAuth initialized",
            context={"token_length": len(token)}
        )

    def _build_auth_header(self) -> str:
        """Build the Authorization header value."""
        return f"Bearer {self._token}"

    def __call__(self, request: Request) -> Request:
        """Apply Bearer auth to request."""
        auth_header = self._build_auth_header()

        new_headers = request.headers.copy()
        new_headers.set("Authorization", auth_header)

        self._logger.trace("BearerAuth applied to request")

        return Request(
            method=request.method,
            url=request.url,
            headers=new_headers,
            content=request.content,
            extensions=request.extensions,
        )

    def __repr__(self) -> str:
        return "BearerAuth(token='***')"


# =============================================================================
# Auth Factory
# =============================================================================

def build_auth(auth: AuthTypes) -> Auth | None:
    """
    Build an Auth instance from various input types.

    Args:
        auth: Can be:
            - None: No authentication
            - (username, password): BasicAuth tuple
            - Auth instance: Used directly
            - Callable: Custom auth function

    Returns:
        Auth instance or None
    """
    if auth is None:
        return None

    if isinstance(auth, Auth):
        return auth

    if isinstance(auth, tuple) and len(auth) == 2:
        username, password = auth
        if isinstance(username, bytes):
            username = username.decode("utf-8")
        if isinstance(password, bytes):
            password = password.decode("utf-8")
        return BasicAuth(username, password)

    if callable(auth):
        # Wrap callable in Auth
        class CallableAuth(Auth):
            def __call__(self, request: Request) -> Request:
                return auth(request)
        return CallableAuth()

    raise TypeError(f"Invalid auth type: {type(auth)}")


__all__ = [
    "Auth",
    "BasicAuth",
    "DigestAuth",
    "BearerAuth",
    "build_auth",
]
