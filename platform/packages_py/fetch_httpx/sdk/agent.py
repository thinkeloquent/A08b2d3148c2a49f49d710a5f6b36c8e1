"""
Agent Integration Utilities for fetch_httpx package.

Provides HTTP client utilities optimized for AI agent usage,
with structured output and tool-friendly interfaces.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import TYPE_CHECKING, Any

from .. import logger as logger_module
from .._client import AsyncClient
from .._models import Response

if TYPE_CHECKING:
    from .._types import AuthTypes, HeaderTypes

logger = logger_module.create("fetch_httpx", __file__)


# =============================================================================
# Agent Response
# =============================================================================

@dataclass
class AgentResponse:
    """
    Structured response for agent consumption.

    Provides a simplified, structured view of HTTP responses
    suitable for AI agent processing.
    """

    success: bool
    status_code: int
    headers: dict[str, str]
    body: Any
    error: str | None = None
    url: str | None = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for serialization."""
        result = {
            "success": self.success,
            "status_code": self.status_code,
            "headers": self.headers,
            "body": self.body,
        }
        if self.error:
            result["error"] = self.error
        if self.url:
            result["url"] = self.url
        return result

    def to_json(self) -> str:
        """Convert to JSON string."""
        return json.dumps(self.to_dict(), indent=2)

    @classmethod
    def from_response(cls, response: Response) -> AgentResponse:
        """Create AgentResponse from HTTP Response."""
        # Try to parse body as JSON
        content_type = response.headers.get("content-type", "")
        if "json" in content_type:
            try:
                body = response.json()
            except Exception:
                body = response.text
        else:
            body = response.text

        return cls(
            success=response.is_success,
            status_code=response.status_code,
            headers=dict(response.headers.items()),
            body=body,
            url=str(response.url) if response.url else None,
        )

    @classmethod
    def from_error(cls, error: Exception, url: str | None = None) -> AgentResponse:
        """Create AgentResponse from an error."""
        return cls(
            success=False,
            status_code=0,
            headers={},
            body=None,
            error=str(error),
            url=url,
        )


# =============================================================================
# Agent HTTP Client
# =============================================================================

class AgentHTTPClient:
    """
    HTTP client optimized for AI agent usage.

    Provides tool-friendly methods with structured responses
    suitable for function calling and tool use.

    Example:
        async with AgentHTTPClient(base_url="https://api.example.com") as client:
            response = await client.fetch("GET", "/users")
            if response.success:
                users = response.body
    """

    def __init__(
        self,
        *,
        base_url: str | None = None,
        auth: AuthTypes | None = None,
        headers: HeaderTypes | None = None,
        timeout: float = 30.0,
        max_response_size: int = 1_000_000,  # 1MB
    ) -> None:
        self._client = AsyncClient(
            base_url=base_url,
            auth=auth,
            headers=headers,
            timeout=timeout,
            follow_redirects=True,
        )
        self._max_response_size = max_response_size

        logger.info(
            "AgentHTTPClient created",
            context={"base_url": base_url}
        )

    async def fetch(
        self,
        method: str,
        url: str,
        *,
        params: dict[str, str] | None = None,
        headers: dict[str, str] | None = None,
        json_body: Any | None = None,
        form_data: dict[str, str] | None = None,
    ) -> AgentResponse:
        """
        Fetch a URL and return structured response.

        This is the main entry point for agent HTTP operations.

        Args:
            method: HTTP method (GET, POST, PUT, PATCH, DELETE)
            url: URL to fetch
            params: Query parameters
            headers: Additional headers
            json_body: JSON request body
            form_data: Form data for POST

        Returns:
            AgentResponse with structured data
        """
        try:
            logger.debug(
                "Agent fetching URL",
                context={"method": method, "url": url}
            )

            response = await self._client.request(
                method.upper(),
                url,
                params=params,
                headers=headers,
                json=json_body,
                data=form_data,
            )

            # Check response size
            content_length = response.headers.get("content-length")
            if content_length and int(content_length) > self._max_response_size:
                return AgentResponse(
                    success=False,
                    status_code=response.status_code,
                    headers=dict(response.headers.items()),
                    body=None,
                    error=f"Response too large: {content_length} bytes",
                    url=str(response.url) if response.url else url,
                )

            agent_response = AgentResponse.from_response(response)

            logger.debug(
                "Agent fetch complete",
                context={
                    "success": agent_response.success,
                    "status_code": agent_response.status_code,
                }
            )

            return agent_response

        except Exception as e:
            logger.error(
                "Agent fetch failed",
                context={"error": str(e), "url": url}
            )
            return AgentResponse.from_error(e, url)

    async def get(
        self,
        url: str,
        params: dict[str, str] | None = None,
        headers: dict[str, str] | None = None,
    ) -> AgentResponse:
        """Make a GET request."""
        return await self.fetch("GET", url, params=params, headers=headers)

    async def post(
        self,
        url: str,
        *,
        json_body: Any | None = None,
        form_data: dict[str, str] | None = None,
        headers: dict[str, str] | None = None,
    ) -> AgentResponse:
        """Make a POST request."""
        return await self.fetch(
            "POST",
            url,
            json_body=json_body,
            form_data=form_data,
            headers=headers,
        )

    async def put(
        self,
        url: str,
        *,
        json_body: Any | None = None,
        headers: dict[str, str] | None = None,
    ) -> AgentResponse:
        """Make a PUT request."""
        return await self.fetch("PUT", url, json_body=json_body, headers=headers)

    async def patch(
        self,
        url: str,
        *,
        json_body: Any | None = None,
        headers: dict[str, str] | None = None,
    ) -> AgentResponse:
        """Make a PATCH request."""
        return await self.fetch("PATCH", url, json_body=json_body, headers=headers)

    async def delete(
        self,
        url: str,
        headers: dict[str, str] | None = None,
    ) -> AgentResponse:
        """Make a DELETE request."""
        return await self.fetch("DELETE", url, headers=headers)

    async def aclose(self) -> None:
        """Close the client."""
        await self._client.aclose()
        logger.debug("AgentHTTPClient closed")

    async def __aenter__(self) -> AgentHTTPClient:
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        await self.aclose()


# =============================================================================
# Tool Definitions
# =============================================================================

def get_http_tool_definitions() -> list[dict[str, Any]]:
    """
    Get tool definitions for AI agent function calling.

    Returns JSON-schema compatible tool definitions that can be
    used with OpenAI, Anthropic, or other AI APIs.

    Returns:
        List of tool definition dictionaries
    """
    return [
        {
            "name": "http_request",
            "description": "Make an HTTP request to a URL and get the response",
            "parameters": {
                "type": "object",
                "properties": {
                    "method": {
                        "type": "string",
                        "enum": ["GET", "POST", "PUT", "PATCH", "DELETE"],
                        "description": "HTTP method to use",
                    },
                    "url": {
                        "type": "string",
                        "description": "URL to request",
                    },
                    "params": {
                        "type": "object",
                        "description": "Query parameters",
                        "additionalProperties": {"type": "string"},
                    },
                    "headers": {
                        "type": "object",
                        "description": "HTTP headers",
                        "additionalProperties": {"type": "string"},
                    },
                    "json_body": {
                        "type": "object",
                        "description": "JSON request body",
                    },
                },
                "required": ["method", "url"],
            },
        },
    ]


# =============================================================================
# Factory Function
# =============================================================================

def create_agent_client(
    *,
    base_url: str | None = None,
    auth: AuthTypes | None = None,
    headers: HeaderTypes | None = None,
    timeout: float = 30.0,
    max_response_size: int = 1_000_000,
) -> AgentHTTPClient:
    """
    Factory function to create an agent HTTP client.

    Args:
        base_url: Base URL for requests
        auth: Authentication configuration
        headers: Default headers
        timeout: Request timeout
        max_response_size: Maximum response size in bytes

    Returns:
        Configured agent HTTP client
    """
    return AgentHTTPClient(
        base_url=base_url,
        auth=auth,
        headers=headers,
        timeout=timeout,
        max_response_size=max_response_size,
    )


__all__ = [
    "AgentResponse",
    "AgentHTTPClient",
    "create_agent_client",
    "get_http_tool_definitions",
]
