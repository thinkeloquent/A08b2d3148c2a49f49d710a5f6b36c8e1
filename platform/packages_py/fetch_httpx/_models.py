"""
Core Data Models for fetch_httpx package.

This module implements the fundamental data classes:
- URL: URL parsing, joining, and manipulation
- Headers: Case-insensitive HTTP headers
- QueryParams: Query parameter handling
- Cookies: Cookie management
- Request: Immutable HTTP request representation
- Response: HTTP response with helper methods

All classes include logging for debugging and observability.
"""

from __future__ import annotations

import json
from collections.abc import Iterator, Mapping
from typing import (
    TYPE_CHECKING,
    Any,
)
from urllib.parse import (
    parse_qs,
    parse_qsl,
    urlencode,
    urljoin,
    urlparse,
    urlunparse,
)

from . import logger as logger_module
from ._exceptions import DecodingError, HTTPStatusError, InvalidURL

if TYPE_CHECKING:
    from ._types import CookieTypes, HeaderTypes, QueryParamTypes

logger = logger_module.create("fetch_httpx", __file__)


# =============================================================================
# URL Class
# =============================================================================

class URL:
    """
    Immutable URL class with parsing and manipulation.

    Provides RFC 3986 compliant URL handling with components:
    scheme, host, port, path, query, fragment.

    Example:
        url = URL("https://api.example.com:8080/v1/users?page=1#section")
        print(url.host)  # "api.example.com"
        print(url.port)  # 8080

        # Create modified copy
        new_url = url.copy_with(path="/v2/users")
    """

    __slots__ = ("_parsed", "_raw")

    def __init__(self, url: str | bytes | URL | None = "") -> None:
        if isinstance(url, URL):
            self._parsed = url._parsed
            self._raw = url._raw
        else:
            # Handle None - convert to empty string
            if url is None:
                logger.error(
                    "URL received None value",
                    context={"url_type": "NoneType"},
                )
                raise InvalidURL("Invalid URL: received None instead of URL string")

            # Handle bytes input - decode to string
            if isinstance(url, bytes):
                try:
                    url = url.decode("utf-8")
                except UnicodeDecodeError as e:
                    logger.error(
                        "URL bytes decoding failed",
                        context={"url_type": "bytes", "url_repr": repr(url)[:100], "error": str(e)},
                    )
                    raise InvalidURL(f"Invalid URL: cannot decode bytes - {e}") from e

            # Ensure url is a string at this point
            if not isinstance(url, str):
                logger.error(
                    "URL received invalid type",
                    context={"url_type": type(url).__name__, "url_repr": repr(url)[:100]},
                )
                raise InvalidURL(f"Invalid URL: expected string, got {type(url).__name__}")

            self._raw = url
            try:
                self._parsed = urlparse(url)
            except Exception as e:
                logger.error(
                    "URL parsing failed",
                    context={"url": url if len(url) < 200 else url[:200] + "...", "error": str(e)},
                )
                raise InvalidURL(f"Invalid URL: {url}") from e

        logger.trace("URL parsed", context={"url": str(self)})

    @property
    def scheme(self) -> str:
        """URL scheme (e.g., 'https', 'http')."""
        return self._parsed.scheme

    @property
    def host(self) -> str:
        """URL host (e.g., 'example.com')."""
        return self._parsed.hostname or ""

    @property
    def port(self) -> int | None:
        """URL port number, or None if using default port."""
        return self._parsed.port

    @property
    def path(self) -> str:
        """URL path (e.g., '/v1/users')."""
        return self._parsed.path

    @property
    def query(self) -> str:
        """URL query string (e.g., 'page=1&limit=10')."""
        return self._parsed.query

    @property
    def fragment(self) -> str:
        """URL fragment (e.g., 'section')."""
        return self._parsed.fragment

    @property
    def netloc(self) -> str:
        """URL network location (host:port)."""
        return self._parsed.netloc

    @property
    def raw_path(self) -> str:
        """Raw path including query string."""
        if self.query:
            return f"{self.path}?{self.query}"
        return self.path

    @property
    def params(self) -> dict[str, list[str]]:
        """Parse query string into dict of lists."""
        return parse_qs(self.query)

    def copy_with(
        self,
        scheme: str | None = None,
        host: str | None = None,
        port: int | None = None,
        path: str | None = None,
        query: str | None = None,
        fragment: str | None = None,
    ) -> URL:
        """Create a copy with modified components."""
        new_scheme = scheme if scheme is not None else self.scheme
        new_host = host if host is not None else self.host
        new_port = port if port is not None else self.port
        new_path = path if path is not None else self.path
        new_query = query if query is not None else self.query
        new_fragment = fragment if fragment is not None else self.fragment

        # Rebuild netloc
        if new_port:
            new_netloc = f"{new_host}:{new_port}"
        else:
            new_netloc = new_host

        new_url = urlunparse((
            new_scheme,
            new_netloc,
            new_path,
            "",  # params (rarely used)
            new_query,
            new_fragment,
        ))

        return URL(new_url)

    def join(self, url: str | URL) -> URL:
        """Join this URL with a relative URL, preserving base path segments.

        Unlike RFC 3986 urljoin (which treats '/path' as absolute from root),
        this method appends the relative path to the base URL's full path.
        For example: join('https://api.example.com/v1', '/users') returns
        'https://api.example.com/v1/users' instead of 'https://api.example.com/users'.
        """
        relative = str(url)
        base_str = str(self)

        # If relative is a full URL, use it directly
        if relative.startswith(("http://", "https://")):
            return URL(relative)

        # Parse base to get components
        parsed = urlparse(base_str)
        base_path = parsed.path

        # Ensure base path ends with /
        if not base_path.endswith("/"):
            base_path += "/"

        # Strip leading / from relative to avoid double slashes
        clean_relative = relative.lstrip("/")

        new_path = base_path + clean_relative
        joined = urlunparse((
            parsed.scheme,
            parsed.netloc,
            new_path,
            "",  # params
            "",  # query (from relative if needed)
            "",  # fragment
        ))
        return URL(joined)

    def __str__(self) -> str:
        if isinstance(self._raw, str):
            return self._raw
        if isinstance(self._raw, bytes):
            # Defensive: should not happen after __init__ fix, but handle gracefully
            try:
                return self._raw.decode("utf-8")
            except UnicodeDecodeError:
                pass
        # Fallback to urlunparse - ensure result is always str
        try:
            result = urlunparse(self._parsed)
            # urlunparse can return bytes if ParseResult has bytes components
            if isinstance(result, bytes):
                return result.decode("utf-8", errors="replace")
            return result if isinstance(result, str) else str(result)
        except Exception:
            # Last resort fallback
            return ""

    def __repr__(self) -> str:
        return f"URL({str(self)!r})"

    def __eq__(self, other: Any) -> bool:
        if isinstance(other, URL):
            return str(self) == str(other)
        if isinstance(other, str):
            return str(self) == other
        return False

    def __hash__(self) -> int:
        return hash(str(self))


# =============================================================================
# Headers Class
# =============================================================================

class Headers:
    """
    Case-insensitive HTTP headers.

    Supports multiple values per key and various initialization formats.

    Example:
        headers = Headers({"Content-Type": "application/json"})
        print(headers.get("content-type"))  # "application/json"

        # Multiple values
        headers = Headers([("Accept", "text/html"), ("Accept", "application/json")])
        print(headers.get_list("Accept"))  # ["text/html", "application/json"]
    """

    def __init__(
        self,
        headers: HeaderTypes | Headers | None = None,
    ) -> None:
        self._list: list[tuple[str, str]] = []

        if headers is None:
            pass
        elif isinstance(headers, Headers):
            self._list = list(headers._list)
        elif isinstance(headers, Mapping):
            for key, value in headers.items():
                if isinstance(key, bytes):
                    key = key.decode("latin-1")
                if isinstance(value, bytes):
                    value = value.decode("latin-1")
                self._list.append((key, value))
        elif isinstance(headers, list | tuple):
            for key, value in headers:
                if isinstance(key, bytes):
                    key = key.decode("latin-1")
                if isinstance(value, bytes):
                    value = value.decode("latin-1")
                self._list.append((key, value))

    def get(self, key: str, default: str | None = None) -> str | None:
        """Get first value for key (case-insensitive)."""
        key_lower = key.lower()
        for k, v in self._list:
            if k.lower() == key_lower:
                return v
        return default

    def get_list(self, key: str) -> list[str]:
        """Get all values for key (case-insensitive)."""
        key_lower = key.lower()
        return [v for k, v in self._list if k.lower() == key_lower]

    def keys(self) -> list[str]:
        """Get unique header names."""
        seen = set()
        result = []
        for k, _ in self._list:
            k_lower = k.lower()
            if k_lower not in seen:
                seen.add(k_lower)
                result.append(k)
        return result

    def values(self) -> list[str]:
        """Get all header values."""
        return [v for _, v in self._list]

    def items(self) -> list[tuple[str, str]]:
        """Get all (key, value) pairs."""
        return list(self._list)

    def __getitem__(self, key: str) -> str:
        value = self.get(key)
        if value is None:
            raise KeyError(key)
        return value

    def __contains__(self, key: str) -> bool:
        return self.get(key) is not None

    def __iter__(self) -> Iterator[str]:
        return iter(self.keys())

    def __len__(self) -> int:
        return len(self._list)

    def __eq__(self, other: Any) -> bool:
        if isinstance(other, Headers):
            return self._list == other._list
        return False

    def __repr__(self) -> str:
        return f"Headers({dict(self.items())!r})"

    def copy(self) -> Headers:
        """Create a copy of these headers."""
        return Headers(self._list)

    def set(self, key: str, value: str) -> None:
        """Set a header value (replaces existing)."""
        # Remove existing values for this key
        key_lower = key.lower()
        self._list = [(k, v) for k, v in self._list if k.lower() != key_lower]
        self._list.append((key, value))

    def add(self, key: str, value: str) -> None:
        """Add a header value (keeps existing)."""
        self._list.append((key, value))

    def remove(self, key: str) -> None:
        """Remove all values for a key."""
        key_lower = key.lower()
        self._list = [(k, v) for k, v in self._list if k.lower() != key_lower]


# =============================================================================
# QueryParams Class
# =============================================================================

class QueryParams:
    """
    Query parameter handling.

    Supports multiple values per key and URL encoding.

    Example:
        params = QueryParams({"page": "1", "filter": ["a", "b"]})
        print(str(params))  # "page=1&filter=a&filter=b"
    """

    def __init__(
        self,
        params: QueryParamTypes | None = None,
    ) -> None:
        self._list: list[tuple[str, str]] = []

        if params is None:
            pass
        elif isinstance(params, QueryParams):
            self._list = list(params._list)
        elif isinstance(params, str):
            self._list = parse_qsl(params)
        elif isinstance(params, bytes):
            self._list = parse_qsl(params.decode("utf-8"))
        elif isinstance(params, Mapping):
            for key, value in params.items():
                if isinstance(value, list | tuple):
                    for v in value:
                        self._list.append((key, str(v)))
                else:
                    self._list.append((key, str(value)))
        elif isinstance(params, list | tuple):
            for key, value in params:
                self._list.append((str(key), str(value)))

    def get(self, key: str, default: str | None = None) -> str | None:
        """Get first value for key."""
        for k, v in self._list:
            if k == key:
                return v
        return default

    def get_list(self, key: str) -> list[str]:
        """Get all values for key."""
        return [v for k, v in self._list if k == key]

    def keys(self) -> list[str]:
        """Get unique parameter names."""
        seen = set()
        result = []
        for k, _ in self._list:
            if k not in seen:
                seen.add(k)
                result.append(k)
        return result

    def values(self) -> list[str]:
        """Get all values."""
        return [v for _, v in self._list]

    def items(self) -> list[tuple[str, str]]:
        """Get all (key, value) pairs."""
        return list(self._list)

    def __str__(self) -> str:
        return urlencode(self._list)

    def __repr__(self) -> str:
        return f"QueryParams({str(self)!r})"

    def __bool__(self) -> bool:
        return bool(self._list)


# =============================================================================
# Cookies Class
# =============================================================================

class Cookies:
    """
    Cookie management.

    Example:
        cookies = Cookies({"session_id": "abc123"})
        print(cookies.get("session_id"))  # "abc123"
    """

    def __init__(
        self,
        cookies: CookieTypes | None = None,
    ) -> None:
        self._dict: dict[str, str] = {}

        if cookies is None:
            pass
        elif isinstance(cookies, Cookies):
            self._dict = dict(cookies._dict)
        elif isinstance(cookies, dict):
            self._dict = dict(cookies)
        elif isinstance(cookies, list | tuple):
            for key, value in cookies:
                self._dict[key] = value

    def get(self, name: str, default: str | None = None) -> str | None:
        """Get cookie value by name."""
        return self._dict.get(name, default)

    def set(self, name: str, value: str) -> None:
        """Set a cookie."""
        self._dict[name] = value

    def delete(self, name: str) -> None:
        """Delete a cookie."""
        self._dict.pop(name, None)

    def keys(self) -> list[str]:
        """Get cookie names."""
        return list(self._dict.keys())

    def values(self) -> list[str]:
        """Get cookie values."""
        return list(self._dict.values())

    def items(self) -> list[tuple[str, str]]:
        """Get all (name, value) pairs."""
        return list(self._dict.items())

    def __contains__(self, name: str) -> bool:
        return name in self._dict

    def __iter__(self) -> Iterator[str]:
        return iter(self._dict)

    def __len__(self) -> int:
        return len(self._dict)

    def __repr__(self) -> str:
        return f"Cookies({self._dict!r})"


# =============================================================================
# Request Class
# =============================================================================

class Request:
    """
    Immutable HTTP request representation.

    Contains all data needed to send an HTTP request:
    method, URL, headers, content, and extensions.

    Example:
        request = Request(
            method="GET",
            url=URL("https://api.example.com/users"),
            headers=Headers({"Accept": "application/json"}),
        )
    """

    def __init__(
        self,
        method: str,
        url: str | URL,
        *,
        headers: Headers | None = None,
        content: bytes | None = None,
        extensions: dict[str, Any] | None = None,
    ) -> None:
        self.method = method.upper()
        self.url = url if isinstance(url, URL) else URL(url)
        self.headers = headers or Headers()
        self.content = content
        self.extensions = extensions or {}

        logger.debug(
            "Request created",
            context={
                "method": self.method,
                "url": str(self.url),
            }
        )

    def __repr__(self) -> str:
        # Redact Authorization header for safety
        class_name = self.__class__.__name__
        url = str(self.url)
        return f"<{class_name}({self.method!r}, {url!r})>"


# =============================================================================
# Response Class
# =============================================================================

class Response:
    """
    HTTP response with helper methods.

    Provides convenient access to response data and status helpers.

    Example:
        if response.is_success:
            data = response.json()
        else:
            response.raise_for_status()
    """

    def __init__(
        self,
        status_code: int,
        *,
        headers: Headers | None = None,
        content: bytes | None = None,
        text: str | None = None,
        request: Request | None = None,
        history: list[Response] | None = None,
        url: URL | None = None,
        extensions: dict[str, Any] | None = None,
    ) -> None:
        self.status_code = status_code
        self.headers = headers or Headers()
        self._content = content
        self._text = text
        self.request = request
        self.history = history or []
        self.url = url or (request.url if request else None)
        self.extensions = extensions or {}

        logger.debug(
            "Response received",
            context={
                "status_code": status_code,
                "url": str(self.url) if self.url else None,
            }
        )

    @property
    def content(self) -> bytes:
        """Response body as bytes."""
        if self._content is None:
            return b""
        return self._content

    @property
    def text(self) -> str:
        """Response body as text."""
        if self._text is not None:
            return self._text
        if self._content is None:
            return ""

        # Detect encoding from Content-Type header
        encoding = self._get_encoding()
        try:
            return self._content.decode(encoding)
        except UnicodeDecodeError as e:
            logger.warn(
                "Text decoding failed, using replacement chars",
                context={
                    "encoding": encoding,
                    "error": str(e),
                    "url": str(self.url),
                    "content_length": len(self._content),
                },
            )
            return self._content.decode("utf-8", errors="replace")

    def _get_encoding(self) -> str:
        """Get encoding from Content-Type header."""
        content_type = self.headers.get("content-type", "")
        if "charset=" in content_type:
            _, charset = content_type.split("charset=", 1)
            return charset.split(";")[0].strip().strip('"\'')
        return "utf-8"

    def json(self, **kwargs: Any) -> Any:
        """Parse response body as JSON."""
        try:
            return json.loads(self.text, **kwargs)
        except json.JSONDecodeError as e:
            # Include content preview for debugging (truncated for safety)
            content_preview = self.text[:200] if self.text else "(empty)"
            logger.error(
                "JSON decoding failed",
                context={
                    "error": str(e),
                    "status_code": self.status_code,
                    "url": str(self.url),
                    "content_type": self.headers.get("content-type", "unknown"),
                    "content_preview": content_preview,
                },
            )
            raise DecodingError(f"Failed to decode JSON: {e}") from e

    # Status helpers
    @property
    def is_informational(self) -> bool:
        """True for 1xx status codes."""
        return 100 <= self.status_code < 200

    @property
    def is_success(self) -> bool:
        """True for 2xx status codes."""
        return 200 <= self.status_code < 300

    @property
    def is_redirect(self) -> bool:
        """True for 3xx status codes."""
        return 300 <= self.status_code < 400

    @property
    def is_client_error(self) -> bool:
        """True for 4xx status codes."""
        return 400 <= self.status_code < 500

    @property
    def is_server_error(self) -> bool:
        """True for 5xx status codes."""
        return 500 <= self.status_code < 600

    @property
    def is_error(self) -> bool:
        """True for 4xx or 5xx status codes."""
        return self.is_client_error or self.is_server_error

    @property
    def reason_phrase(self) -> str:
        """HTTP reason phrase for status code."""
        phrases = {
            200: "OK",
            201: "Created",
            204: "No Content",
            301: "Moved Permanently",
            302: "Found",
            304: "Not Modified",
            400: "Bad Request",
            401: "Unauthorized",
            403: "Forbidden",
            404: "Not Found",
            405: "Method Not Allowed",
            500: "Internal Server Error",
            502: "Bad Gateway",
            503: "Service Unavailable",
            504: "Gateway Timeout",
        }
        return phrases.get(self.status_code, "")

    def raise_for_status(self) -> Response:
        """
        Raise HTTPStatusError for 4xx/5xx responses.

        Returns self for method chaining on success.
        """
        if self.is_error:
            message = f"HTTP {self.status_code}"
            if self.reason_phrase:
                message = f"{message} {self.reason_phrase}"

            logger.warn(
                "HTTP status error",
                context={
                    "status_code": self.status_code,
                    "url": str(self.url) if self.url else None,
                }
            )

            raise HTTPStatusError(
                message,
                request=self.request,
                response=self,
            )
        return self

    def __repr__(self) -> str:
        return f"<Response [{self.status_code}]>"


# =============================================================================
# Streaming Response
# =============================================================================

class StreamingResponse:
    """
    Streaming HTTP response wrapper.

    Wraps an httpx Response for streaming operations, providing async methods
    for iterating over response content without loading it all into memory.

    Example:
        async with client.stream("GET", url) as response:
            async for line in response.aiter_lines():
                print(line)
    """

    def __init__(
        self,
        httpx_response: Any,  # httpx.Response
        request: Request | None = None,
    ) -> None:
        self._httpx_response = httpx_response
        self._request = request
        self._closed = False

    @property
    def status_code(self) -> int:
        """HTTP status code."""
        return self._httpx_response.status_code

    @property
    def headers(self) -> Headers:
        """Response headers."""
        return Headers(list(self._httpx_response.headers.items()))

    @property
    def request(self) -> Request | None:
        """The request that generated this response."""
        return self._request

    @property
    def is_success(self) -> bool:
        """True for 2xx status codes."""
        return 200 <= self.status_code < 300

    @property
    def is_error(self) -> bool:
        """True for 4xx or 5xx status codes."""
        return 400 <= self.status_code < 600

    async def aread(self) -> bytes:
        """Read the entire response body."""
        return await self._httpx_response.aread()

    async def aiter_bytes(self, chunk_size: int | None = None):
        """Async iterator over response bytes."""
        async for chunk in self._httpx_response.aiter_bytes(chunk_size):
            yield chunk

    async def aiter_text(self, chunk_size: int | None = None):
        """Async iterator over response text."""
        async for chunk in self._httpx_response.aiter_text(chunk_size):
            yield chunk

    async def aiter_lines(self):
        """Async iterator over response lines."""
        async for line in self._httpx_response.aiter_lines():
            yield line

    async def aclose(self) -> None:
        """Close the response and release resources."""
        if not self._closed:
            await self._httpx_response.aclose()
            self._closed = True

    def __repr__(self) -> str:
        return f"<StreamingResponse [{self.status_code}]>"


__all__ = [
    "URL",
    "Headers",
    "QueryParams",
    "Cookies",
    "Request",
    "Response",
    "StreamingResponse",
]
