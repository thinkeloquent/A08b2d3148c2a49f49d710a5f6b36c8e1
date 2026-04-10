"""
Security Validation Module for app_yaml_overwrites package.
Provides path validation to prevent prototype pollution and code injection attacks.
"""

import re
from typing import Set

from .errors import SecurityError, ErrorCode
from .logger import create as create_logger, ILogger

# Create module-level logger
logger = create_logger("app_yaml_overwrites", "security.py")


class Security:
    """
    Security validation for template paths.

    Validates paths against:
    - Blocked patterns (__proto__, constructor, etc.)
    - Underscore-prefixed segments
    - Path traversal (..)
    - Valid path format (starts with letter, alphanumeric/underscore/dot only)
    """

    # Allowed: start with alpha, then alpha/num/underscore/dot
    PATH_PATTERN = re.compile(r'^[a-zA-Z][a-zA-Z0-9_.]*$')

    # Dangerous patterns that could lead to prototype pollution or code injection
    BLOCKED_PATTERNS: Set[str] = {
        "__proto__",
        "__class__",
        "__dict__",
        "constructor",
        "prototype"
    }

    @classmethod
    def validate_path(cls, path: str) -> None:
        """
        Validate a path against security rules.

        Args:
            path: The path string to validate

        Raises:
            SecurityError: If the path fails validation
        """
        logger.debug(f"Validating path: {path}")

        if not path:
            logger.warn("Empty path provided")
            raise SecurityError(
                "Path cannot be empty",
                ErrorCode.SECURITY_BLOCKED_PATH
            )

        # Check basic format
        if not cls.PATH_PATTERN.match(path):
            logger.warn(f"Invalid path format: {path}")
            raise SecurityError(
                f"Invalid path: {path}. Must start with letter and contain only alphanumeric, underscore, or dot.",
                ErrorCode.SECURITY_BLOCKED_PATH,
                {"path": path}
            )

        # Check for path traversal
        if ".." in path:
            logger.warn(f"Path traversal attempt: {path}")
            raise SecurityError(
                "Path traversal not allowed (..)",
                ErrorCode.SECURITY_BLOCKED_PATH,
                {"path": path}
            )

        # Check each segment
        segments = path.split('.')
        for segment in segments:
            # Check for blocked patterns
            if segment in cls.BLOCKED_PATTERNS:
                logger.warn(f"Blocked pattern detected: {segment} in {path}")
                raise SecurityError(
                    f"Path contains blocked segment: {segment}",
                    ErrorCode.SECURITY_BLOCKED_PATH,
                    {"path": path, "segment": segment}
                )

            # Check for underscore prefix (private access)
            if segment.startswith("_"):
                logger.warn(f"Underscore prefix detected: {segment} in {path}")
                raise SecurityError(
                    f"Path segment starts with underscore: {segment}",
                    ErrorCode.SECURITY_BLOCKED_PATH,
                    {"path": path, "segment": segment}
                )

        logger.debug(f"Path validation passed: {path}")

    @classmethod
    def is_safe_path(cls, path: str) -> bool:
        """
        Check if a path is safe without raising an exception.

        Args:
            path: The path string to check

        Returns:
            True if the path is safe, False otherwise
        """
        try:
            cls.validate_path(path)
            return True
        except SecurityError:
            return False


def validate_path(path: str) -> None:
    """
    Convenience function to validate a path.

    Args:
        path: The path string to validate

    Raises:
        SecurityError: If the path fails validation
    """
    Security.validate_path(path)


def is_safe_path(path: str) -> bool:
    """
    Convenience function to check if a path is safe.

    Args:
        path: The path string to check

    Returns:
        True if the path is safe, False otherwise
    """
    return Security.is_safe_path(path)
