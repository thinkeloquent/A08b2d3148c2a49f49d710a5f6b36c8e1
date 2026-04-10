"""
Figma Hooks Middleware — Figma API SDK

Response processing hooks for Figma API responses.
"""

import json
from typing import Any, Dict, Optional


def response_204_hook(response: Any) -> Any:
    """Handle 204 No Content responses."""
    if hasattr(response, "status_code") and response.status_code == 204:
        return {}
    return response


def json_fallback_hook(response: Any) -> Any:
    """Safely parse JSON, falling back to text wrapper."""
    if isinstance(response, str):
        try:
            return json.loads(response)
        except (json.JSONDecodeError, ValueError):
            return {"data": response}
    return response


def request_id_hook(headers: Dict[str, str]) -> Optional[str]:
    """Extract Figma request ID from headers."""
    return headers.get("x-request-id") or headers.get("x-figma-request-id")


def rate_limit_hook(headers: Dict[str, str]) -> Optional[Dict[str, Any]]:
    """Parse rate limit info from response headers (on 429)."""
    retry_after = headers.get("retry-after")
    if not retry_after:
        return None
    return {
        "retry_after": float(retry_after),
        "plan_tier": headers.get("x-figma-plan-tier"),
        "rate_limit_type": headers.get("x-figma-rate-limit-type"),
        "upgrade_link": headers.get("x-figma-upgrade-link"),
    }
