"""
GitHub token resolution and type detection.

Resolves authentication tokens from explicit values or environment variables,
detects token types (fine-grained, classic PAT, OAuth, etc.), and provides
token masking utilities.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Literal

from env_resolver import resolve_github_env
from github_api.sdk.errors import AuthError

__all__ = [
    "TokenInfo",
    "TokenType",
    "resolve_token",
    "mask_token",
]

TokenType = Literal[
    "fine-grained",
    "classic-pat",
    "oauth",
    "user-to-server",
    "server-to-server",
    "legacy",
    "unknown",
]

_ENV_VAR_ORDER: list[str] = [
    "GITHUB_TOKEN",
    "GH_TOKEN",
    "GITHUB_ACCESS_TOKEN",
    "GITHUB_PAT",
]

_HEX_40_RE = re.compile(r"^[0-9a-fA-F]{40}$")


@dataclass(frozen=True)
class TokenInfo:
    """Resolved GitHub authentication token with metadata."""

    token: str
    source: str
    type: TokenType

    def __repr__(self) -> str:
        return (
            f"TokenInfo(source={self.source!r}, "
            f"type={self.type!r}, "
            f"token={mask_token(self.token)!r})"
        )


def _detect_token_type(token: str) -> TokenType:
    """Detect the type of a GitHub token from its prefix.

    Args:
        token: The raw token string.

    Returns:
        The detected token type.
    """
    if token.startswith("github_pat_"):
        return "fine-grained"
    if token.startswith("ghp_"):
        return "classic-pat"
    if token.startswith("gho_"):
        return "oauth"
    if token.startswith("ghu_"):
        return "user-to-server"
    if token.startswith("ghs_"):
        return "server-to-server"
    if _HEX_40_RE.match(token):
        return "legacy"
    return "unknown"


def resolve_token(explicit_token: str | None = None) -> TokenInfo:
    """Resolve a GitHub authentication token.

    Checks an explicit token first, then iterates through environment
    variables in order: GITHUB_TOKEN, GH_TOKEN, GITHUB_ACCESS_TOKEN,
    GITHUB_PAT.

    Args:
        explicit_token: An explicitly provided token value.

    Returns:
        TokenInfo with the resolved token, its source, and detected type.

    Raises:
        AuthError: If no token can be resolved from any source.
    """
    if explicit_token:
        return TokenInfo(
            token=explicit_token,
            source="explicit",
            type=_detect_token_type(explicit_token),
        )

    value = resolve_github_env().token
    if value:
        return TokenInfo(
            token=value,
            source="env",
            type=_detect_token_type(value),
        )

    raise AuthError(
        "No GitHub token found. Provide a token explicitly or set one of: "
        + ", ".join(_ENV_VAR_ORDER)
    )


def mask_token(token: str) -> str:
    """Mask a token for safe logging, showing first 4 and last 4 characters.

    Args:
        token: The raw token string.

    Returns:
        Masked token string (e.g., 'ghp_****abcd').
    """
    if len(token) <= 8:
        return "****"
    return f"{token[:4]}{'*' * (len(token) - 8)}{token[-4:]}"
