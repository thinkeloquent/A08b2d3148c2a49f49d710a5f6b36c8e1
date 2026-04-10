"""Async API key resolution for Gemini OpenAI SDK.

Centralizes API key lookup so it can be awaited from any transport builder.
Resolution order:

1. ``GEMINI_API_KEY`` env var
2. Raises ``ValueError`` if not found
"""

from __future__ import annotations

from env_resolver import resolve_gemini_env

from .logger import create

logger = create("gemini_openai_sdk", __file__)

_gemini_env = resolve_gemini_env()


async def get_api_key() -> str:
    """Return the resolved Gemini API key.

    Raises
    ------
    ValueError
        If ``GEMINI_API_KEY`` is not configured.
    """
    return _resolve()


def get_api_key_sync() -> str:
    """Synchronous variant of :func:`get_api_key`."""
    return _resolve()


def _resolve() -> str:
    """Shared resolution logic."""
    logger.debug("get_api_key: checking environment")
    api_key = _gemini_env.api_key

    if api_key:
        logger.debug("get_api_key: found key (length=%d)", len(api_key))
        return api_key

    error_msg = "GEMINI_API_KEY not found in environment"
    logger.error("get_api_key: API key not configured")
    raise ValueError(error_msg)
