"""
Error classes for app_yaml_overwrites package.
Provides structured error types for resolution, security, and compute failures.
"""

from enum import Enum
from typing import Dict, Any, Optional


class ErrorCode(str, Enum):
    """Error codes for programmatic handling."""
    COMPUTE_FUNCTION_NOT_FOUND = 'ERR_COMPUTE_NOT_FOUND'
    COMPUTE_FUNCTION_FAILED = 'ERR_COMPUTE_FAILED'
    SECURITY_BLOCKED_PATH = 'ERR_SECURITY_PATH'
    RECURSION_LIMIT = 'ERR_RECURSION_LIMIT'
    SCOPE_VIOLATION = 'ERR_SCOPE_VIOLATION'
    VALIDATION_ERROR = 'ERR_VALIDATION_ERROR'


class ResolveError(Exception):
    """
    Base exception for resolution errors.
    Includes error code and context for programmatic handling.
    """
    def __init__(
        self,
        message: str,
        code: ErrorCode,
        context: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message)
        self.code = code
        self.context = context or {}

    def __str__(self) -> str:
        return f"{self.code.value}: {super().__str__()}"


class ComputeFunctionError(ResolveError):
    """Error when a compute function is not found or fails."""
    pass


class SecurityError(ResolveError):
    """Error when a path fails security validation."""
    pass


class RecursionLimitError(ResolveError):
    """Error when recursion depth exceeds maximum."""
    pass


class ScopeViolationError(ResolveError):
    """Error when scope rules are violated."""
    pass


class ValidationError(ResolveError):
    """Error for general validation failures."""
    pass
