"""OpenAI provider client factory."""

from __future__ import annotations


_client = None


def get_openai_client():
    """Get or create a lazy-initialized OpenAI client."""
    global _client
    if _client is None:
        try:
            from openai import OpenAI
        except ImportError:
            raise RuntimeError("LLM provider is not available. Required dependency is not installed.")
        _client = OpenAI()
    return _client


def reset_client():
    """Reset the cached client (for testing)."""
    global _client
    _client = None


_async_client = None


def get_async_openai_client():
    """Get or create a lazy-initialized async OpenAI client."""
    global _async_client
    if _async_client is None:
        try:
            from openai import AsyncOpenAI
        except ImportError:
            raise RuntimeError("LLM provider is not available. Required dependency is not installed.")
        _async_client = AsyncOpenAI()
    return _async_client


def reset_async_client():
    """Reset the cached async client (for testing)."""
    global _async_client
    _async_client = None
