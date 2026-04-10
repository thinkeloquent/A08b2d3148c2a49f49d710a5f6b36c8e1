"""Gemini provider client factory (via OpenAI-compatible endpoint)."""

from __future__ import annotations

from env_resolver import resolve_gemini_env

_gemini_env = resolve_gemini_env()

_client = None

GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"


def get_gemini_client():
    """Get or create a lazy-initialized Gemini client (OpenAI-compatible)."""
    global _client
    if _client is None:
        try:
            from openai import OpenAI
        except ImportError:
            raise RuntimeError("LLM provider is not available. Required dependency is not installed.")
        api_key = _gemini_env.api_key
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required for Gemini provider.")
        _client = OpenAI(api_key=api_key, base_url=GEMINI_BASE_URL)
    return _client


def reset_client():
    """Reset the cached client (for testing)."""
    global _client
    _client = None


_async_client = None


def get_async_gemini_client():
    """Get or create a lazy-initialized async Gemini client (OpenAI-compatible)."""
    global _async_client
    if _async_client is None:
        try:
            from openai import AsyncOpenAI
        except ImportError:
            raise RuntimeError("LLM provider is not available. Required dependency is not installed.")
        api_key = _gemini_env.api_key
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required for Gemini provider.")
        _async_client = AsyncOpenAI(api_key=api_key, base_url=GEMINI_BASE_URL)
    return _async_client


def reset_async_client():
    """Reset the cached async client (for testing)."""
    global _async_client
    _async_client = None
