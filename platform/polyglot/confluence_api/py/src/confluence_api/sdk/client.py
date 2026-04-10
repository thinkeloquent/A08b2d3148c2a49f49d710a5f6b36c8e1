"""
SDK client for interacting with the Confluence API server.

Communicates with the REST proxy (FastAPI or Fastify) rather than
Confluence Data Center directly. Provides typed methods for all
proxied Confluence API endpoints.

Usage:
    from confluence_api.sdk.client import ConfluenceSDKClient

    with ConfluenceSDKClient(base_url='http://localhost:8000/~/api/rest/2025-01-01/providers/confluence_api') as sdk:
        info = sdk.server_info()
        spaces = sdk.get_spaces()
        results = sdk.search('type = "page" AND space = "DEV"')
"""

from __future__ import annotations

from typing import Any, Optional

import httpx

from confluence_api.exceptions import SDKError
from confluence_api.logger import create_logger

log = create_logger("confluence-api", __file__)


class ConfluenceSDKClient:
    """SDK client for interacting with the Confluence API REST proxy server."""

    def __init__(
        self,
        base_url: str,
        api_key: str | None = None,
        timeout: float = 30.0,
    ) -> None:
        """
        Initialize the SDK client.

        Args:
            base_url: Base URL of the Confluence API proxy server.
            api_key: Optional API key for authentication.
            timeout: Request timeout in seconds (default 30.0).
        """
        if not base_url.endswith("/"):
            base_url += "/"
        self.base_url = base_url
        auth = (api_key, "") if api_key else None
        self._client = httpx.Client(
            auth=auth,
            timeout=timeout,
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
        )

    def __enter__(self) -> ConfluenceSDKClient:
        return self

    def __exit__(self, *args: Any) -> None:
        self.close()

    def close(self) -> None:
        """Close the underlying HTTP client."""
        self._client.close()

    def _request(
        self,
        method: str,
        endpoint: str,
        params: dict[str, Any] | None = None,
        json_data: dict[str, Any] | None = None,
    ) -> Any:
        """Execute an HTTP request against the proxy server."""
        from urllib.parse import urljoin

        url = urljoin(self.base_url, endpoint)
        try:
            response = self._client.request(method=method, url=url, params=params, json=json_data)
            if response.status_code >= 400:
                error_msg = f"HTTP {response.status_code}"
                try:
                    data = response.json()
                    if "detail" in data:
                        error_msg = data["detail"]
                    elif "message" in data:
                        error_msg = data["message"]
                except Exception:
                    data = {}
                raise SDKError(error_msg, status_code=response.status_code, response_data=data)
            if response.status_code == 204 or not response.content:
                return {}
            return response.json()
        except httpx.RequestError as e:
            raise SDKError(f"Request failed: {e}")

    # -- Health ----------------------------------------------------------------

    def health_check(self) -> dict[str, str]:
        """Check the health of the proxy server."""
        return self._request("GET", "health")

    # -- Content ---------------------------------------------------------------

    @property
    def content(self) -> _ContentProxy:
        """Access content operations."""
        return _ContentProxy(self)

    @property
    def space(self) -> _SpaceProxy:
        """Access space operations."""
        return _SpaceProxy(self)

    @property
    def search(self) -> _SearchProxy:
        """Access search operations."""
        return _SearchProxy(self)

    @property
    def user(self) -> _UserProxy:
        """Access user operations."""
        return _UserProxy(self)

    # -- Direct convenience methods --------------------------------------------

    def get_content(self, content_id: str, expand: str | None = None) -> dict[str, Any]:
        """Retrieve a single piece of content by ID."""
        params: dict[str, Any] = {}
        if expand:
            params["expand"] = expand
        return self._request("GET", f"v9/content/{content_id}", params=params or None)

    def get_contents(
        self,
        type: str | None = None,
        space_key: str | None = None,
        title: str | None = None,
        start: int = 0,
        limit: int = 25,
        expand: str | None = None,
    ) -> dict[str, Any]:
        """Retrieve a paginated list of content."""
        params: dict[str, Any] = {"start": start, "limit": limit}
        if type:
            params["type"] = type
        if space_key:
            params["spaceKey"] = space_key
        if title:
            params["title"] = title
        if expand:
            params["expand"] = expand
        return self._request("GET", "v9/content", params=params)

    def create_content(self, data: dict[str, Any]) -> dict[str, Any]:
        """Create a new piece of content."""
        return self._request("POST", "v9/content", json_data=data)

    def update_content(self, content_id: str, data: dict[str, Any]) -> dict[str, Any]:
        """Update an existing piece of content."""
        return self._request("PUT", f"v9/content/{content_id}", json_data=data)

    def delete_content(self, content_id: str) -> dict[str, Any]:
        """Delete a piece of content."""
        return self._request("DELETE", f"v9/content/{content_id}")

    def search_content(self, cql: str, limit: int = 25, start: int = 0, expand: str | None = None) -> dict[str, Any]:
        """Search using CQL."""
        params: dict[str, Any] = {"cql": cql, "start": start, "limit": limit}
        if expand:
            params["expand"] = expand
        return self._request("GET", "v9/search", params=params)

    def get_spaces(self, limit: int = 25, start: int = 0, expand: str | None = None) -> dict[str, Any]:
        """Retrieve a paginated list of spaces."""
        params: dict[str, Any] = {"start": start, "limit": limit}
        if expand:
            params["expand"] = expand
        return self._request("GET", "v9/space", params=params)

    def get_space(self, space_key: str, expand: str | None = None) -> dict[str, Any]:
        """Retrieve a single space by key."""
        params: dict[str, Any] = {}
        if expand:
            params["expand"] = expand
        return self._request("GET", f"v9/space/{space_key}", params=params or None)

    def get_server_info(self) -> dict[str, Any]:
        """Retrieve Confluence server information."""
        return self._request("GET", "v9/server-information")


class _ContentProxy:
    """Namespaced content operations."""

    def __init__(self, sdk: ConfluenceSDKClient) -> None:
        self._sdk = sdk

    def get(self, content_id: str, expand: str | None = None) -> dict[str, Any]:
        return self._sdk.get_content(content_id, expand=expand)

    def list(self, **kwargs: Any) -> dict[str, Any]:
        return self._sdk.get_contents(**kwargs)

    def create(self, data: dict[str, Any]) -> dict[str, Any]:
        return self._sdk.create_content(data)

    def update(self, content_id: str, data: dict[str, Any]) -> dict[str, Any]:
        return self._sdk.update_content(content_id, data)

    def delete(self, content_id: str) -> dict[str, Any]:
        return self._sdk.delete_content(content_id)


class _SpaceProxy:
    """Namespaced space operations."""

    def __init__(self, sdk: ConfluenceSDKClient) -> None:
        self._sdk = sdk

    def get(self, space_key: str, expand: str | None = None) -> dict[str, Any]:
        return self._sdk.get_space(space_key, expand=expand)

    def list(self, **kwargs: Any) -> dict[str, Any]:
        return self._sdk.get_spaces(**kwargs)


class _SearchProxy:
    """Namespaced search operations."""

    def __init__(self, sdk: ConfluenceSDKClient) -> None:
        self._sdk = sdk

    def query(self, cql: str, **kwargs: Any) -> dict[str, Any]:
        return self._sdk.search_content(cql, **kwargs)


class _UserProxy:
    """Namespaced user operations."""

    def __init__(self, sdk: ConfluenceSDKClient) -> None:
        self._sdk = sdk

    def get_current(self, expand: str | None = None) -> dict[str, Any]:
        params: dict[str, Any] = {}
        if expand:
            params["expand"] = expand
        return self._sdk._request("GET", "v9/user/current", params=params or None)

    def search(self, username: str | None = None, key: str | None = None) -> dict[str, Any]:
        params: dict[str, Any] = {}
        if username:
            params["username"] = username
        if key:
            params["key"] = key
        return self._sdk._request("GET", "v9/user", params=params or None)


class AsyncConfluenceSDKClient:
    """Async SDK client for interacting with the Confluence API REST proxy server."""

    def __init__(
        self,
        base_url: str,
        api_key: str | None = None,
        timeout: float = 30.0,
    ) -> None:
        """
        Initialize the async SDK client.

        Args:
            base_url: Base URL of the Confluence API proxy server.
            api_key: Optional API key for authentication.
            timeout: Request timeout in seconds (default 30.0).
        """
        if not base_url.endswith("/"):
            base_url += "/"
        self.base_url = base_url
        auth = (api_key, "") if api_key else None
        self._client = httpx.AsyncClient(
            auth=auth,
            timeout=timeout,
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
        )

    async def __aenter__(self) -> AsyncConfluenceSDKClient:
        return self

    async def __aexit__(self, *args: Any) -> None:
        await self.aclose()

    async def aclose(self) -> None:
        """Close the underlying async HTTP client."""
        await self._client.aclose()

    async def _request(
        self,
        method: str,
        endpoint: str,
        params: dict[str, Any] | None = None,
        json_data: dict[str, Any] | None = None,
    ) -> Any:
        """Execute an async HTTP request against the proxy server."""
        from urllib.parse import urljoin

        url = urljoin(self.base_url, endpoint)
        try:
            response = await self._client.request(method=method, url=url, params=params, json=json_data)
            if response.status_code >= 400:
                error_msg = f"HTTP {response.status_code}"
                try:
                    data = response.json()
                    if "detail" in data:
                        error_msg = data["detail"]
                    elif "message" in data:
                        error_msg = data["message"]
                except Exception:
                    data = {}
                raise SDKError(error_msg, status_code=response.status_code, response_data=data)
            if response.status_code == 204 or not response.content:
                return {}
            return response.json()
        except httpx.RequestError as e:
            raise SDKError(f"Request failed: {e}")

    # -- Health ----------------------------------------------------------------

    async def health_check(self) -> dict[str, str]:
        """Check the health of the proxy server."""
        return await self._request("GET", "health")

    # -- Content ---------------------------------------------------------------

    @property
    def content(self) -> _AsyncContentProxy:
        """Access content operations."""
        return _AsyncContentProxy(self)

    @property
    def space(self) -> _AsyncSpaceProxy:
        """Access space operations."""
        return _AsyncSpaceProxy(self)

    @property
    def search(self) -> _AsyncSearchProxy:
        """Access search operations."""
        return _AsyncSearchProxy(self)

    @property
    def user(self) -> _AsyncUserProxy:
        """Access user operations."""
        return _AsyncUserProxy(self)

    # -- Direct convenience methods --------------------------------------------

    async def get_content(self, content_id: str, expand: str | None = None) -> dict[str, Any]:
        """Retrieve a single piece of content by ID."""
        params: dict[str, Any] = {}
        if expand:
            params["expand"] = expand
        return await self._request("GET", f"v9/content/{content_id}", params=params or None)

    async def get_contents(
        self,
        type: str | None = None,
        space_key: str | None = None,
        title: str | None = None,
        start: int = 0,
        limit: int = 25,
        expand: str | None = None,
    ) -> dict[str, Any]:
        """Retrieve a paginated list of content."""
        params: dict[str, Any] = {"start": start, "limit": limit}
        if type:
            params["type"] = type
        if space_key:
            params["spaceKey"] = space_key
        if title:
            params["title"] = title
        if expand:
            params["expand"] = expand
        return await self._request("GET", "v9/content", params=params)

    async def create_content(self, data: dict[str, Any]) -> dict[str, Any]:
        """Create a new piece of content."""
        return await self._request("POST", "v9/content", json_data=data)

    async def update_content(self, content_id: str, data: dict[str, Any]) -> dict[str, Any]:
        """Update an existing piece of content."""
        return await self._request("PUT", f"v9/content/{content_id}", json_data=data)

    async def delete_content(self, content_id: str) -> dict[str, Any]:
        """Delete a piece of content."""
        return await self._request("DELETE", f"v9/content/{content_id}")

    async def search_content(self, cql: str, limit: int = 25, start: int = 0, expand: str | None = None) -> dict[str, Any]:
        """Search using CQL."""
        params: dict[str, Any] = {"cql": cql, "start": start, "limit": limit}
        if expand:
            params["expand"] = expand
        return await self._request("GET", "v9/search", params=params)

    async def get_spaces(self, limit: int = 25, start: int = 0, expand: str | None = None) -> dict[str, Any]:
        """Retrieve a paginated list of spaces."""
        params: dict[str, Any] = {"start": start, "limit": limit}
        if expand:
            params["expand"] = expand
        return await self._request("GET", "v9/space", params=params)

    async def get_space(self, space_key: str, expand: str | None = None) -> dict[str, Any]:
        """Retrieve a single space by key."""
        params: dict[str, Any] = {}
        if expand:
            params["expand"] = expand
        return await self._request("GET", f"v9/space/{space_key}", params=params or None)

    async def get_server_info(self) -> dict[str, Any]:
        """Retrieve Confluence server information."""
        return await self._request("GET", "v9/server-information")


class _AsyncContentProxy:
    """Namespaced async content operations."""

    def __init__(self, sdk: AsyncConfluenceSDKClient) -> None:
        self._sdk = sdk

    async def get(self, content_id: str, expand: str | None = None) -> dict[str, Any]:
        return await self._sdk.get_content(content_id, expand=expand)

    async def list(self, **kwargs: Any) -> dict[str, Any]:
        return await self._sdk.get_contents(**kwargs)

    async def create(self, data: dict[str, Any]) -> dict[str, Any]:
        return await self._sdk.create_content(data)

    async def update(self, content_id: str, data: dict[str, Any]) -> dict[str, Any]:
        return await self._sdk.update_content(content_id, data)

    async def delete(self, content_id: str) -> dict[str, Any]:
        return await self._sdk.delete_content(content_id)


class _AsyncSpaceProxy:
    """Namespaced async space operations."""

    def __init__(self, sdk: AsyncConfluenceSDKClient) -> None:
        self._sdk = sdk

    async def get(self, space_key: str, expand: str | None = None) -> dict[str, Any]:
        return await self._sdk.get_space(space_key, expand=expand)

    async def list(self, **kwargs: Any) -> dict[str, Any]:
        return await self._sdk.get_spaces(**kwargs)


class _AsyncSearchProxy:
    """Namespaced async search operations."""

    def __init__(self, sdk: AsyncConfluenceSDKClient) -> None:
        self._sdk = sdk

    async def query(self, cql: str, **kwargs: Any) -> dict[str, Any]:
        return await self._sdk.search_content(cql, **kwargs)


class _AsyncUserProxy:
    """Namespaced async user operations."""

    def __init__(self, sdk: AsyncConfluenceSDKClient) -> None:
        self._sdk = sdk

    async def get_current(self, expand: str | None = None) -> dict[str, Any]:
        params: dict[str, Any] = {}
        if expand:
            params["expand"] = expand
        return await self._sdk._request("GET", "v9/user/current", params=params or None)

    async def search(self, username: str | None = None, key: str | None = None) -> dict[str, Any]:
        params: dict[str, Any] = {}
        if username:
            params["username"] = username
        if key:
            params["key"] = key
        return await self._sdk._request("GET", "v9/user", params=params or None)
