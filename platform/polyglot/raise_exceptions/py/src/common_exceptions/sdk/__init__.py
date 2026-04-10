"""
SDK interface for common_exceptions.

Provides programmatic access for CLI tools, LLM agents, and developer tooling.

Usage:
    from common_exceptions.sdk import create_exception, format_for_cli, to_agent_context

    exc = create_exception("NOT_FOUND", "User not found", {"userId": "123"})
    print(format_for_cli(exc))
    context = to_agent_context(exc)
"""

from .agent import AgentErrorContext, to_agent_context
from .cli import format_for_cli
from .factory import (
    create_exception,
    is_common_exception,
    parse_error_response,
)

__all__ = [
    "create_exception",
    "parse_error_response",
    "is_common_exception",
    "format_for_cli",
    "to_agent_context",
    "AgentErrorContext",
]
