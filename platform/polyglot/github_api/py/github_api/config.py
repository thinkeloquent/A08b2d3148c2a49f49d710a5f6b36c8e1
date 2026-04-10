"""
Configuration for the GitHub API server.

Resolves settings from environment variables with sensible defaults.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field

from env_resolver import resolve_github_env

__all__ = ["Config"]


def _resolve_github_token() -> str:
    """Resolve a GitHub token from environment variables."""
    return resolve_github_env().token or ""


def _resolve_github_base_url() -> str:
    """Resolve GitHub API base URL from environment variables."""
    return resolve_github_env().base_api_url


@dataclass(frozen=True)
class Config:
    """Server and SDK configuration.

    Attributes:
        github_token: GitHub personal access token (resolved from env if not set).
        base_url: GitHub API base URL.
        log_level: Logging level name (DEBUG, INFO, WARNING, ERROR).
        port: HTTP server port.
        host: HTTP server bind address.
        rate_limit_auto_wait: Auto-sleep when rate limit is exhausted.
        rate_limit_threshold: Remaining count at which to trigger wait.
    """

    github_token: str = field(default_factory=_resolve_github_token)
    base_url: str = field(default_factory=_resolve_github_base_url)
    log_level: str = "INFO"
    port: int = 3100
    host: str = "0.0.0.0"
    rate_limit_auto_wait: bool = True
    rate_limit_threshold: int = 0

    @classmethod
    def from_env(cls) -> Config:
        """Create a Config from environment variables.

        Environment variables:
        - GITHUB_TOKEN / GH_TOKEN / GITHUB_ACCESS_TOKEN / GITHUB_PAT
        - GITHUB_BASE_API_URL / GITHUB_API_BASE_URL / GITHUB_BASE_URL (via env_resolver)
        - LOG_LEVEL (default: INFO)
        - PORT (default: 3100)
        - HOST (default: 0.0.0.0)
        - RATE_LIMIT_AUTO_WAIT (default: true)
        - RATE_LIMIT_THRESHOLD (default: 0)
        """
        _github_env = resolve_github_env()
        return cls(
            github_token=_github_env.token or "",
            base_url=_github_env.base_api_url,
            log_level=os.environ.get("LOG_LEVEL", "INFO"),
            port=int(os.environ.get("PORT", "3100")),
            host=os.environ.get("HOST", "0.0.0.0"),
            rate_limit_auto_wait=os.environ.get(
                "RATE_LIMIT_AUTO_WAIT", "true"
            ).lower() in ("true", "1", "yes"),
            rate_limit_threshold=int(
                os.environ.get("RATE_LIMIT_THRESHOLD", "0")
            ),
        )
