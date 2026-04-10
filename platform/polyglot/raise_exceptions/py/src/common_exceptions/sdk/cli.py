"""
CLI formatting for common_exceptions.

Provides terminal-friendly error output with optional colors.
"""

import os
from typing import Optional

from ..base import BaseHttpException
from ..codes import get_code_category
from ..logger import create

logger = create("common_exceptions", __file__)


# ANSI color codes
class Colors:
    """ANSI color codes for terminal output."""

    RED = "\033[91m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    CYAN = "\033[96m"
    GRAY = "\033[90m"
    BOLD = "\033[1m"
    RESET = "\033[0m"


def _supports_color() -> bool:
    """Check if terminal supports color output."""
    # Respect NO_COLOR env var
    if os.environ.get("NO_COLOR"):
        return False

    # Respect FORCE_COLOR env var
    if os.environ.get("FORCE_COLOR"):
        return True

    # Check if stdout is a TTY
    import sys

    if not hasattr(sys.stdout, "isatty"):
        return False

    return sys.stdout.isatty()


def format_for_cli(
    exc: BaseHttpException,
    verbose: bool = False,
    use_colors: Optional[bool] = None,
) -> str:
    """
    Format an exception for CLI output.

    Args:
        exc: Exception to format
        verbose: If True, include stack trace
        use_colors: Force color on/off (auto-detect if None)

    Returns:
        Formatted string for terminal output

    Example:
        exc = NotFoundException("User not found")
        print(format_for_cli(exc))
        # Output:
        # [NOT_FOUND] User not found (404)
    """
    colors = use_colors if use_colors is not None else _supports_color()

    logger.debug(f"Formatting exception for CLI: {exc.code.value}")

    # Build output
    lines = []

    # Header line: [CODE] Message (status)
    if colors:
        code_color = _get_color_for_category(get_code_category(exc.code))
        header = (
            f"{code_color}{Colors.BOLD}[{exc.code.value}]{Colors.RESET} "
            f"{exc.message} "
            f"{Colors.GRAY}({exc.status}){Colors.RESET}"
        )
    else:
        header = f"[{exc.code.value}] {exc.message} ({exc.status})"

    lines.append(header)

    # Details
    if exc.details:
        if colors:
            lines.append(f"\n{Colors.CYAN}Details:{Colors.RESET}")
        else:
            lines.append("\nDetails:")

        for key, value in exc.details.items():
            if colors:
                lines.append(f"  {Colors.GRAY}{key}:{Colors.RESET} {value}")
            else:
                lines.append(f"  {key}: {value}")

    # Request ID
    if exc.request_id:
        if colors:
            lines.append(f"\n{Colors.GRAY}Request ID: {exc.request_id}{Colors.RESET}")
        else:
            lines.append(f"\nRequest ID: {exc.request_id}")

    # Verbose: include stack trace
    if verbose:
        log_entry = exc.to_log_entry()
        traceback = log_entry.get("error", {}).get("traceback")
        if traceback and traceback != "NoneType: None\n":
            if colors:
                lines.append(f"\n{Colors.GRAY}Stack Trace:{Colors.RESET}")
                lines.append(f"{Colors.GRAY}{traceback}{Colors.RESET}")
            else:
                lines.append("\nStack Trace:")
                lines.append(traceback)

    return "\n".join(lines)


def _get_color_for_category(category: str) -> str:
    """Get color code for error category."""
    category_colors = {
        "auth": Colors.RED,
        "authz": Colors.RED,
        "request": Colors.YELLOW,
        "network": Colors.BLUE,
        "upstream": Colors.BLUE,
        "internal": Colors.RED,
    }
    return category_colors.get(category, Colors.YELLOW)


def print_error(
    exc: BaseHttpException,
    verbose: bool = False,
) -> None:
    """
    Print formatted error to stderr.

    Args:
        exc: Exception to print
        verbose: If True, include stack trace
    """
    import sys

    print(format_for_cli(exc, verbose), file=sys.stderr)


logger.debug("CLI formatter initialized")
