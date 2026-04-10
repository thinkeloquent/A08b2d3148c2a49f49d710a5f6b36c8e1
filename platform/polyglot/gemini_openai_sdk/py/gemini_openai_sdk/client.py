"""
Client Module - HTTP Client Functions

Async HTTP client functions for Gemini API communication.
Delegates HTTP transport to :class:`client_http_methods.HttpMethods`.
"""

import json
from typing import Any, AsyncGenerator, Dict, List, Optional

from .client_http_methods import HttpMethods
from .constants import CHAT_ENDPOINT, DEFAULT_MODEL, DEFAULTS, MODELS
from .get_api_key import get_api_key
from .helpers import get_headers
from .logger import create

logger = create("gemini_openai_sdk", __file__)

_http = HttpMethods()


async def chat_completion(
    messages: List[Dict[str, str]],
    model: Optional[str] = None,
    temperature: Optional[float] = None,
    max_tokens: Optional[int] = None,
    stream: bool = False,
    timeout: Optional[float] = None,
    **kwargs: Any,
) -> Dict[str, Any]:
    """
    Execute chat completion request to Gemini API.

    Args:
        messages: List of message dictionaries with role and content
        model: Model name (defaults to configured default)
        temperature: Sampling temperature (0.0-2.0)
        max_tokens: Maximum tokens in response
        stream: Whether to stream response (for internal use)
        timeout: Request timeout in seconds
        **kwargs: Additional parameters passed to API

    Returns:
        Parsed JSON response from API

    Raises:
        ValueError: If API key is not configured
        Exception: On API error with status code and message
    """
    logger.debug(
        "chat_completion: enter",
        messages_count=len(messages),
        model=model,
        stream=stream,
    )

    api_key = await get_api_key()

    payload = {
        "model": model or MODELS[DEFAULT_MODEL],
        "messages": messages,
        "temperature": temperature if temperature is not None else DEFAULTS["temperature"],
        "max_tokens": max_tokens if max_tokens is not None else DEFAULTS["max_tokens"],
        "stream": stream,
        **kwargs,
    }
    if "reasoning_effort" in kwargs:
        payload["reasoning_effort"] = kwargs.pop("reasoning_effort")

    request_timeout = timeout or DEFAULTS["timeout_seconds"]

    logger.debug(
        "chat_completion: sending request",
        endpoint=CHAT_ENDPOINT[:50] + "...",
        model=payload["model"],
    )

    result = await _http.apost(
        CHAT_ENDPOINT,
        get_headers(api_key),
        payload,
        request_timeout,
    )

    return result


async def stream_chat_completion(
    messages: List[Dict[str, str]],
    model: Optional[str] = None,
    temperature: Optional[float] = None,
    max_tokens: Optional[int] = None,
    timeout: Optional[float] = None,
    **kwargs: Any,
) -> AsyncGenerator[str, None]:
    """
    Stream chat completion request to Gemini API.

    Yields individual data chunks as strings (without 'data: ' prefix).

    Args:
        messages: List of message dictionaries
        model: Model name
        temperature: Sampling temperature
        max_tokens: Maximum tokens
        timeout: Request timeout in seconds
        **kwargs: Additional API parameters

    Yields:
        JSON string chunks from SSE stream

    Raises:
        ValueError: If API key not configured
        Exception: On API error
    """
    logger.debug(
        "stream_chat_completion: enter",
        messages_count=len(messages),
        model=model,
    )

    api_key = await get_api_key()

    payload = {
        "model": model or MODELS[DEFAULT_MODEL],
        "messages": messages,
        "temperature": temperature if temperature is not None else DEFAULTS["temperature"],
        "max_tokens": max_tokens if max_tokens is not None else DEFAULTS["max_tokens"],
        "stream": True,
        **kwargs,
    }
    if "reasoning_effort" in kwargs:
        payload["reasoning_effort"] = kwargs.pop("reasoning_effort")

    request_timeout = timeout or DEFAULTS["timeout_seconds"]

    async for data in _http.apost_stream(
        CHAT_ENDPOINT,
        get_headers(api_key),
        payload,
        request_timeout,
    ):
        yield data


async def accumulate_stream(
    messages: List[Dict[str, str]],
    model: Optional[str] = None,
    temperature: Optional[float] = None,
    max_tokens: Optional[int] = None,
    **kwargs: Any,
) -> Dict[str, Any]:
    """
    Stream and accumulate response into single result.

    Args:
        messages: List of message dictionaries
        model: Model name
        temperature: Sampling temperature
        max_tokens: Maximum tokens
        **kwargs: Additional API parameters

    Returns:
        Dictionary with accumulated content and metadata
    """
    logger.debug("accumulate_stream: enter")

    chunks: List[str] = []
    full_content = ""
    usage = None

    async for data in stream_chat_completion(
        messages=messages,
        model=model,
        temperature=temperature,
        max_tokens=max_tokens,
        **kwargs,
    ):
        try:
            parsed = json.loads(data)
            choice = parsed.get("choices", [{}])[0]
            delta = choice.get("delta", {})
            content = delta.get("content")

            if content:
                full_content += content
                chunks.append(content)

            if "usage" in parsed:
                usage = parsed["usage"]
        except json.JSONDecodeError:
            logger.debug("accumulate_stream: skipping invalid JSON chunk")

    logger.debug("accumulate_stream: accumulated %d chunks", len(chunks))

    return {
        "content": full_content,
        "chunk_count": len(chunks),
        "usage": usage,
    }
