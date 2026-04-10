"""
Gemini OpenAI SDK - Python Package

A polyglot SDK for interacting with Google's Gemini AI models
via the OpenAI-compatible API interface.

Usage:
    from gemini_openai_sdk import GeminiClient

    client = GeminiClient()
    result = await client.chat("What is the capital of France?")
    print(result.content)
"""

from .agent import invoke
from .client import chat_completion, stream_chat_completion
from .constants import (
    BASE_URL,
    CHAT_ENDPOINT,
    DEFAULT_MODEL,
    DEFAULTS,
    MODELS,
    ROUTE_PREFIX,
    SYSTEM_PROMPT,
)
from .gemini_client import GeminiClient
from .helpers import (
    extract_json,
    get_api_key,
    get_headers,
    get_model,
    validate_schema,
)
from .logger import create as create_logger
from .tools import CALCULATOR_TOOL, WEATHER_TOOL, execute_tool
from .types import (
    ChatMessage,
    ChatResponse,
    StreamChunk,
    ToolCall,
    ToolResult,
    UsageStats,
)

__version__ = "0.1.0"
__all__ = [
    # Logger
    "create_logger",
    # Constants
    "MODELS",
    "DEFAULT_MODEL",
    "SYSTEM_PROMPT",
    "BASE_URL",
    "CHAT_ENDPOINT",
    "DEFAULTS",
    "ROUTE_PREFIX",
    # Helpers
    "get_api_key",
    "get_model",
    "get_headers",
    "extract_json",
    "validate_schema",
    # Client
    "chat_completion",
    "stream_chat_completion",
    # Tools
    "WEATHER_TOOL",
    "CALCULATOR_TOOL",
    "execute_tool",
    # Types
    "ChatMessage",
    "ChatResponse",
    "StreamChunk",
    "ToolCall",
    "ToolResult",
    "UsageStats",
    # High-level
    "GeminiClient",
    "invoke",
]
