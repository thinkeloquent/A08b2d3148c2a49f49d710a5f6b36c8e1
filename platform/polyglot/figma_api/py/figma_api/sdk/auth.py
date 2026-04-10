"""
Auth Module — Figma API SDK

Token resolution and masking utilities.
"""

from dataclasses import dataclass
from typing import Optional

from env_resolver import resolve_figma_env

from ..logger import create_logger

log = create_logger("figma-api", __file__)


class AuthError(Exception):
    """Raised when authentication fails or token is missing."""

    def __init__(self, message: str):
        super().__init__(message)
        self.name = "AuthError"
        self.status = 401


@dataclass(frozen=True)
class TokenInfo:
    """Resolved token information."""

    token: str
    source: str


def resolve_token(explicit_token: Optional[str] = None) -> TokenInfo:
    """
    Resolve Figma API token from explicit value or environment.
    Priority: explicit token > FIGMA_TOKEN env > FIGMA_ACCESS_TOKEN env
    """
    if explicit_token:
        log.debug("token resolved from explicit parameter", source="explicit")
        return TokenInfo(token=explicit_token, source="explicit")

    _figma_env = resolve_figma_env()
    env_token = _figma_env.token
    if env_token:
        log.info("token loaded", source="env-resolver")
        return TokenInfo(token=env_token, source="env-resolver")

    raise AuthError(
        "Figma API token not found. Provide token via constructor or set the Figma token in the environment."
    )


def mask_token(token: Optional[str]) -> str:
    """Mask token for safe logging. Returns first 8 chars + '***'."""
    if not token:
        return "***"
    if len(token) <= 8:
        return "***"
    return token[:8] + "***"
