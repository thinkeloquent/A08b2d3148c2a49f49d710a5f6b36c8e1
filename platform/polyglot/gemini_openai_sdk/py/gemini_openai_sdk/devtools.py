"""
DevTools Module - Developer Utilities

Provides debugging utilities for SDK development and testing.
"""

import json
from typing import Any, Dict, List, Optional

from env_resolver import resolve_gemini_env

from .constants import CHAT_ENDPOINT, DEFAULT_MODEL, DEFAULTS, MODELS, SYSTEM_PROMPT
from .gemini_client import GeminiClient
from .helpers import get_api_key, get_headers, get_model
from .logger import create

logger = create("gemini_openai_sdk", __file__)

_gemini_env = resolve_gemini_env()


def create_debug_client(
    model: str = DEFAULT_MODEL,
    verbose: bool = True,
) -> GeminiClient:
    """
    Create a client with verbose logging enabled.

    Args:
        model: Model type to use
        verbose: Whether to enable verbose logging (default: True)

    Returns:
        GeminiClient configured for debugging
    """
    import os

    if verbose:
        os.environ["LOG_LEVEL"] = "DEBUG"

    logger.info("create_debug_client: creating debug client", model=model)
    return GeminiClient(model=model)


def inspect_request(
    messages: List[Dict[str, str]],
    model: Optional[str] = None,
    temperature: Optional[float] = None,
    max_tokens: Optional[int] = None,
    **kwargs: Any,
) -> Dict[str, Any]:
    """
    Inspect what would be sent to API without executing.

    Args:
        messages: Messages array
        model: Model type
        temperature: Temperature setting
        max_tokens: Max tokens setting
        **kwargs: Additional parameters

    Returns:
        Dictionary showing request details
    """
    logger.debug("inspect_request: building request preview")

    api_key = _gemini_env.api_key
    resolved_model = get_model(model or DEFAULT_MODEL)

    payload = {
        "model": resolved_model,
        "messages": messages,
        "temperature": temperature if temperature is not None else DEFAULTS["temperature"],
        "max_tokens": max_tokens if max_tokens is not None else DEFAULTS["max_tokens"],
        **kwargs,
    }

    headers = get_headers(api_key or "API_KEY_NOT_SET")
    # Mask auth header for display
    headers_display = {
        **headers,
        "Authorization": "Bearer ***" + (api_key[-4:] if api_key else "****"),
    }

    return {
        "endpoint": CHAT_ENDPOINT,
        "method": "POST",
        "headers": headers_display,
        "payload": payload,
        "api_key_set": bool(api_key),
        "resolved_model": resolved_model,
    }


def mock_response(
    content: str = "Mock response content",
    model: str = "gemini-2.0-flash",
    finish_reason: str = "stop",
    prompt_tokens: int = 10,
    completion_tokens: int = 20,
) -> Dict[str, Any]:
    """
    Create a mock API response for testing.

    Args:
        content: Response content
        model: Model name in response
        finish_reason: Finish reason
        prompt_tokens: Token count
        completion_tokens: Token count

    Returns:
        Mock API response dictionary
    """
    logger.debug("mock_response: creating mock response")

    return {
        "id": "chatcmpl-mock-12345",
        "object": "chat.completion",
        "created": 1234567890,
        "model": model,
        "choices": [
            {
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": content,
                },
                "finish_reason": finish_reason,
            }
        ],
        "usage": {
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": prompt_tokens + completion_tokens,
        },
    }


def mock_stream_chunks(
    content: str = "Hello world",
    model: str = "gemini-2.0-flash",
) -> List[str]:
    """
    Create mock streaming chunks for testing.

    Args:
        content: Content to split into chunks
        model: Model name

    Returns:
        List of SSE data strings
    """
    logger.debug("mock_stream_chunks: creating mock stream")

    chunks = []

    # First chunk with role
    chunks.append(json.dumps({
        "id": "chatcmpl-mock-stream",
        "object": "chat.completion.chunk",
        "model": model,
        "choices": [
            {
                "index": 0,
                "delta": {"role": "assistant"},
                "finish_reason": None,
            }
        ],
    }))

    # Content chunks
    for char in content:
        chunks.append(json.dumps({
            "id": "chatcmpl-mock-stream",
            "object": "chat.completion.chunk",
            "model": model,
            "choices": [
                {
                    "index": 0,
                    "delta": {"content": char},
                    "finish_reason": None,
                }
            ],
        }))

    # Final chunk
    chunks.append(json.dumps({
        "id": "chatcmpl-mock-stream",
        "object": "chat.completion.chunk",
        "model": model,
        "choices": [
            {
                "index": 0,
                "delta": {},
                "finish_reason": "stop",
            }
        ],
    }))

    return chunks


def show_config() -> Dict[str, Any]:
    """
    Display current SDK configuration.

    Returns:
        Configuration dictionary
    """
    api_key = _gemini_env.api_key

    return {
        "models": MODELS,
        "default_model": DEFAULT_MODEL,
        "base_url": CHAT_ENDPOINT.rsplit("/", 1)[0],
        "chat_endpoint": CHAT_ENDPOINT,
        "defaults": DEFAULTS,
        "system_prompt": SYSTEM_PROMPT[:50] + "..." if len(SYSTEM_PROMPT) > 50 else SYSTEM_PROMPT,
        "api_key_configured": bool(api_key),
        "api_key_preview": "***" + api_key[-4:] if api_key else None,
    }


def validate_environment() -> Dict[str, Any]:
    """
    Validate environment setup.

    Returns:
        Validation result with any issues found
    """
    issues = []

    api_key = _gemini_env.api_key
    if not api_key:
        issues.append("GEMINI_API_KEY environment variable not set")

    import sys
    python_version = sys.version_info
    if python_version < (3, 11):
        issues.append(f"Python 3.11+ required, found {python_version.major}.{python_version.minor}")

    try:
        import httpx
    except ImportError:
        issues.append("httpx package not installed")

    return {
        "valid": len(issues) == 0,
        "issues": issues,
        "python_version": f"{python_version.major}.{python_version.minor}.{python_version.micro}",
        "api_key_set": bool(api_key),
    }
