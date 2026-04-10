"""
fetch_httpx_gemini_openai_protocols - Gemini API Client and Protocol Translation Module

Provides Gemini API client with OpenAI-compatible interface and bidirectional
translation between OpenAI and Gemini API formats.
This module enables the Polyglot Bridge pattern for seamless interoperability
between different LLM providers.

Features:
- Message format translation (OpenAI messages ↔ Gemini contents)
- Tool call normalization (function_call/tool_calls ↔ functionCall)
- Response schema mapping (chat.completion ↔ generateContent)
- Streaming format translation (SSE ↔ NDJSON)

Example:
    from fetch_httpx_gemini_openai_protocols import (
        openai_messages_to_gemini,
        gemini_to_openai_response,
        gemini_stream_to_openai,
        translate_openai_request_to_gemini,
    )

    # Translate OpenAI messages to Gemini format
    result = openai_messages_to_gemini(openai_messages)
    gemini_request = {
        "contents": result.data["contents"],
        "systemInstruction": result.data.get("system_instruction"),
    }

    # Translate Gemini response back to OpenAI format
    result = gemini_to_openai_response(gemini_response)
    openai_response = result.data

    # Stream translation
    async for chunk in gemini_stream_to_openai(stream):
        print(chunk, end="")

    # High-level request translation
    result = translate_openai_request_to_gemini(openai_request)
"""

__version__ = "1.0.0"

from .client import (
    GEMINI_CHAT_COMPLETIONS_PATH,
    GEMINI_ORIGIN,
    AsyncGeminiClient,
    GeminiClient,
    close_async_gemini_client,
    close_gemini_client,
    get_async_gemini_client,
    get_gemini_client,
)
from .messages import (
    gemini_to_openai_messages,
    map_gemini_role_to_openai,
    # Role mapping
    map_openai_role_to_gemini,
    # Message translation
    openai_messages_to_gemini,
    validate_gemini_contents,
    # Validation
    validate_openai_messages,
)
from .response import (
    # Structured output utilities
    extract_json,
    # Response translation
    gemini_to_openai_response,
    # Usage translation
    gemini_usage_to_openai,
    # Finish reason mapping
    map_gemini_finish_reason,
    map_openai_finish_reason,
    openai_to_gemini_response,
    openai_usage_to_gemini,
    validate_against_schema,
)
from .streaming import (
    aggregate_gemini_stream,
    # Stream aggregation
    aggregate_openai_stream,
    # Chunk translation
    gemini_chunk_to_openai,
    # Stream translation (async generators)
    gemini_stream_to_openai,
    openai_chunk_to_gemini,
    openai_stream_to_gemini,
)
from .tools import (
    extract_function_calls,
    gemini_function_calls_to_openai,
    gemini_function_to_openai,
    gemini_schema_to_openai,
    gemini_tool_config_to_openai,
    gemini_tools_to_openai,
    # ID generation
    generate_tool_call_id,
    # Utilities
    is_gemini_function_call_part,
    openai_function_call_to_gemini,
    # Tool definition translation
    openai_function_to_gemini,
    # Schema translation
    openai_schema_to_gemini,
    # Tool call translation
    openai_tool_calls_to_gemini,
    # Tool choice/config translation
    openai_tool_choice_to_gemini,
    openai_tools_to_gemini,
    reset_tool_call_id_counter,
)
from .translator import (
    translate_gemini_request_to_openai,
    translate_gemini_response_to_openai,
    # High-level translation functions
    translate_openai_request_to_gemini,
    translate_openai_response_to_gemini,
)
from .types import (
    GeminiCandidate,
    GeminiContent,
    GeminiFunctionCallPart,
    GeminiFunctionDeclaration,
    GeminiFunctionResponsePart,
    GeminiGenerateRequest,
    GeminiGenerateResponse,
    GeminiGenerationConfig,
    GeminiInlineDataPart,
    GeminiPart,
    # Gemini Types
    GeminiRole,
    GeminiSafetySetting,
    GeminiSchema,
    GeminiSystemInstruction,
    GeminiTextPart,
    GeminiTool,
    GeminiToolConfig,
    GeminiUsageMetadata,
    OpenAIChatRequest,
    OpenAIChatResponse,
    OpenAIChoice,
    OpenAIDelta,
    OpenAIFunctionCall,
    OpenAIFunctionDefinition,
    OpenAIJSONSchema,
    OpenAIMessage,
    # OpenAI Types
    OpenAIRole,
    OpenAIStreamChoice,
    OpenAIStreamChunk,
    OpenAITool,
    OpenAIToolCall,
    OpenAIUsage,
    # Translation Types
    TranslationContext,
    TranslationResult,
)

__all__ = [
    # Version
    "__version__",
    # Client
    "GeminiClient",
    "AsyncGeminiClient",
    "get_gemini_client",
    "get_async_gemini_client",
    "close_gemini_client",
    "close_async_gemini_client",
    "GEMINI_ORIGIN",
    "GEMINI_CHAT_COMPLETIONS_PATH",
    # OpenAI Types
    "OpenAIRole",
    "OpenAIFunctionCall",
    "OpenAIToolCall",
    "OpenAIMessage",
    "OpenAIFunctionDefinition",
    "OpenAITool",
    "OpenAIJSONSchema",
    "OpenAIChatRequest",
    "OpenAIChoice",
    "OpenAIUsage",
    "OpenAIChatResponse",
    "OpenAIDelta",
    "OpenAIStreamChoice",
    "OpenAIStreamChunk",
    # Gemini Types
    "GeminiRole",
    "GeminiTextPart",
    "GeminiFunctionCallPart",
    "GeminiFunctionResponsePart",
    "GeminiInlineDataPart",
    "GeminiPart",
    "GeminiContent",
    "GeminiFunctionDeclaration",
    "GeminiSchema",
    "GeminiTool",
    "GeminiToolConfig",
    "GeminiGenerationConfig",
    "GeminiSafetySetting",
    "GeminiSystemInstruction",
    "GeminiGenerateRequest",
    "GeminiCandidate",
    "GeminiUsageMetadata",
    "GeminiGenerateResponse",
    # Translation Types
    "TranslationContext",
    "TranslationResult",
    # Message translation
    "map_openai_role_to_gemini",
    "map_gemini_role_to_openai",
    "openai_messages_to_gemini",
    "gemini_to_openai_messages",
    "validate_openai_messages",
    "validate_gemini_contents",
    # Tool translation
    "generate_tool_call_id",
    "reset_tool_call_id_counter",
    "openai_schema_to_gemini",
    "gemini_schema_to_openai",
    "openai_function_to_gemini",
    "gemini_function_to_openai",
    "openai_tools_to_gemini",
    "gemini_tools_to_openai",
    "openai_tool_choice_to_gemini",
    "gemini_tool_config_to_openai",
    "openai_tool_calls_to_gemini",
    "openai_function_call_to_gemini",
    "gemini_function_calls_to_openai",
    "is_gemini_function_call_part",
    "extract_function_calls",
    # Response translation
    "map_gemini_finish_reason",
    "map_openai_finish_reason",
    "gemini_usage_to_openai",
    "openai_usage_to_gemini",
    "gemini_to_openai_response",
    "openai_to_gemini_response",
    "extract_json",
    "validate_against_schema",
    # Streaming translation
    "gemini_chunk_to_openai",
    "openai_chunk_to_gemini",
    "gemini_stream_to_openai",
    "openai_stream_to_gemini",
    "aggregate_openai_stream",
    "aggregate_gemini_stream",
    # High-level translation
    "translate_openai_request_to_gemini",
    "translate_gemini_request_to_openai",
    "translate_openai_response_to_gemini",
    "translate_gemini_response_to_openai",
]
