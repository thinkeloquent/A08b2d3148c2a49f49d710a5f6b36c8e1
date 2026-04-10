"""
LLM Agent context for common_exceptions.

Provides structured error context for LLM agent tool responses.
"""

from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from ..base import BaseHttpException
from ..codes import ErrorCode, get_code_category
from ..logger import create

logger = create("common_exceptions", __file__)


@dataclass
class AgentErrorContext:
    """
    Structured error context for LLM agents.

    Provides agent-friendly error information including:
    - code: Machine-readable error code
    - message: Human-readable error message
    - severity: Error severity (critical, high, medium, low)
    - category: Error category (auth, request, network, etc.)
    - suggested_actions: List of suggested remediation actions
    - details: Additional context dict
    """

    code: str
    message: str
    severity: str
    category: str
    suggested_actions: List[str]
    details: Optional[Dict[str, Any]] = None
    request_id: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to JSON-serializable dict."""
        result = {
            "code": self.code,
            "message": self.message,
            "severity": self.severity,
            "category": self.category,
            "suggestedActions": self.suggested_actions,
        }
        if self.details:
            result["details"] = self.details
        if self.request_id:
            result["requestId"] = self.request_id
        return result


# Suggested actions by error code
_SUGGESTED_ACTIONS: Dict[ErrorCode, List[str]] = {
    # Auth
    ErrorCode.AUTH_NOT_AUTHENTICATED: [
        "Check if authentication token is provided",
        "Verify token format is correct",
        "Ensure token has not expired",
    ],
    ErrorCode.AUTH_TOKEN_EXPIRED: [
        "Refresh the authentication token",
        "Re-authenticate the user",
    ],
    ErrorCode.AUTH_TOKEN_INVALID: [
        "Verify token signature",
        "Check if token was issued by trusted authority",
    ],
    # Authz
    ErrorCode.AUTHZ_FORBIDDEN: [
        "Check user permissions for this resource",
        "Verify user has required role",
        "Contact administrator for access",
    ],
    # Request
    ErrorCode.BAD_REQUEST: [
        "Verify request syntax",
        "Check required parameters",
        "Validate request body format",
    ],
    ErrorCode.NOT_FOUND: [
        "Verify the resource identifier",
        "Check if the resource was deleted",
        "Ensure the correct API endpoint is used",
    ],
    ErrorCode.VALIDATION_FAILED: [
        "Review field-level errors in details",
        "Correct invalid field values",
        "Ensure required fields are provided",
    ],
    ErrorCode.CONFLICT: [
        "Check for duplicate resources",
        "Refresh and retry the operation",
        "Verify resource state before modifying",
    ],
    ErrorCode.TOO_MANY_REQUESTS: [
        "Wait before retrying (check retryAfterMs)",
        "Implement request throttling",
        "Contact support for rate limit increase",
    ],
    # Network
    ErrorCode.NETWORK_CONNECT_TIMEOUT: [
        "Check network connectivity",
        "Verify upstream service is running",
        "Increase connection timeout if needed",
    ],
    ErrorCode.NETWORK_READ_TIMEOUT: [
        "Check upstream service health",
        "Increase read timeout for slow operations",
        "Consider async processing for long operations",
    ],
    ErrorCode.NETWORK_ERROR: [
        "Check network connectivity",
        "Verify DNS resolution",
        "Check firewall rules",
    ],
    # Upstream
    ErrorCode.UPSTREAM_SERVICE_ERROR: [
        "Check upstream service logs",
        "Verify upstream service health",
        "Review request payload for issues",
    ],
    ErrorCode.UPSTREAM_TIMEOUT: [
        "Increase timeout configuration",
        "Check upstream service performance",
        "Consider circuit breaker pattern",
    ],
    # Internal
    ErrorCode.INTERNAL_SERVER_ERROR: [
        "Check server logs for details",
        "Report error with request ID",
        "Retry the request",
    ],
    ErrorCode.SERVICE_UNAVAILABLE: [
        "Wait and retry (check retryAfterMs)",
        "Check service health status",
        "Consider fallback options",
    ],
    ErrorCode.BAD_GATEWAY: [
        "Check upstream service health",
        "Verify upstream response format",
        "Review proxy configuration",
    ],
}


def _get_severity(code: ErrorCode, status: int) -> str:
    """Determine error severity from code and status."""
    # Critical: 5xx internal errors
    if code in (ErrorCode.INTERNAL_SERVER_ERROR,):
        return "critical"

    # High: auth/authz, service unavailable
    if code in (
        ErrorCode.AUTH_NOT_AUTHENTICATED,
        ErrorCode.AUTHZ_FORBIDDEN,
        ErrorCode.SERVICE_UNAVAILABLE,
    ):
        return "high"

    # Medium: network, upstream, conflict
    if status >= 500 or code.value.startswith("NETWORK_") or code.value.startswith("UPSTREAM_"):
        return "medium"

    # Low: client errors (4xx)
    return "low"


def to_agent_context(exc: BaseHttpException) -> AgentErrorContext:
    """
    Convert exception to LLM agent-friendly context.

    Provides structured error information with suggested actions
    that an LLM agent can use to understand and respond to errors.

    Args:
        exc: Exception to convert

    Returns:
        AgentErrorContext with error information and suggestions

    Example:
        exc = NotFoundException("User not found")
        context = to_agent_context(exc)
        # Use in agent tool response
        return {"error": context.to_dict()}
    """
    logger.debug(f"Creating agent context for: {exc.code.value}")

    # Get suggested actions
    actions = _SUGGESTED_ACTIONS.get(exc.code, [
        "Review error details",
        "Check logs for more information",
        "Retry the operation",
    ])

    return AgentErrorContext(
        code=exc.code.value,
        message=exc.message,
        severity=_get_severity(exc.code, exc.status),
        category=get_code_category(exc.code),
        suggested_actions=actions,
        details=exc.details if exc.details else None,
        request_id=exc.request_id,
    )


logger.debug("Agent context module initialized")
