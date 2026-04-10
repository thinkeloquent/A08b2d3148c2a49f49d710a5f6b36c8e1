"""
HTTPX adapter for common_exceptions.

Provides error wrapping for HTTPX HTTP client.

Usage:
    from common_exceptions.httpx import wrap_httpx_errors

    @wrap_httpx_errors(service="user-service")
    async def get_user(user_id: str):
        async with httpx.AsyncClient() as client:
            response = await client.get(f"/users/{user_id}")
            response.raise_for_status()
            return response.json()
"""

from .wrappers import (
    extract_service_from_url,
    httpx_error_to_exception,
    wrap_httpx_errors,
)

__all__ = [
    "wrap_httpx_errors",
    "httpx_error_to_exception",
    "extract_service_from_url",
]
