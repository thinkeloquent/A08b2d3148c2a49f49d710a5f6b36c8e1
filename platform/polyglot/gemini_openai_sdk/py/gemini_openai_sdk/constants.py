"""
Constants Module - Configuration and Defaults

Centralized configuration constants for the Gemini OpenAI SDK.
Values can be overridden via environment variables where applicable.
"""

from typing import Any, Dict

from env_resolver import resolve_gemini_env

from .logger import create

logger = create("gemini_openai_sdk", __file__)

_gemini_env = resolve_gemini_env()

# =============================================================================
# Model Configurations
# =============================================================================

MODELS: Dict[str, str] = {
    "flash": "gemini-2.0-flash",
    "pro": "gemini-2.0-pro-exp-02-05",
}

DEFAULT_MODEL: str = _gemini_env.default_model

# =============================================================================
# System Prompt
# =============================================================================

SYSTEM_PROMPT: str = _gemini_env.system_prompt

# =============================================================================
# API Endpoints
# =============================================================================

BASE_URL: str = _gemini_env.base_url

CHAT_ENDPOINT: str = f"{BASE_URL}/chat/completions"

# =============================================================================
# Default Settings
# =============================================================================

DEFAULTS: Dict[str, Any] = {
    "temperature": _gemini_env.default_temperature,
    "max_tokens": _gemini_env.default_max_tokens,
    "timeout_seconds": _gemini_env.timeout_seconds,
}

# =============================================================================
# Route Configuration
# =============================================================================

ROUTE_PREFIX: str = "/api/llm/gemini-openai-v1"

# =============================================================================
# Logging
# =============================================================================

logger.debug(
    "constants loaded",
    default_model=DEFAULT_MODEL,
    base_url=BASE_URL[:50] + "...",
    defaults=DEFAULTS,
)
