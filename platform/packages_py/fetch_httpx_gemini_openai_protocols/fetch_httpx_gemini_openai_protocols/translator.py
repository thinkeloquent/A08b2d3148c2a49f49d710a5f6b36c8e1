"""
High-Level Translation Functions

Provides complete request/response translation between OpenAI and Gemini formats.
"""

from __future__ import annotations

from typing import Any

from .messages import gemini_to_openai_messages, openai_messages_to_gemini
from .response import gemini_to_openai_response, openai_to_gemini_response
from .tools import (
    gemini_tool_config_to_openai,
    gemini_tools_to_openai,
    openai_tool_choice_to_gemini,
    openai_tools_to_gemini,
)
from .types import (
    GeminiGenerateRequest,
    GeminiGenerateResponse,
    OpenAIChatRequest,
    OpenAIChatResponse,
    TranslationResult,
)


def translate_openai_request_to_gemini(
    request: OpenAIChatRequest,
) -> TranslationResult[GeminiGenerateRequest]:
    """
    Convert a complete OpenAI chat request to Gemini generateContent request.

    Args:
        request: OpenAI chat completion request

    Returns:
        TranslationResult containing Gemini generateContent request
    """
    warnings: list[str] = []

    # Translate messages
    messages = request.get("messages", [])
    message_result = openai_messages_to_gemini(messages)
    warnings.extend(message_result.warnings)

    # Build Gemini request
    gemini_request: GeminiGenerateRequest = {
        "contents": message_result.data["contents"],
    }

    # Add system instruction if present
    system_instruction = message_result.data.get("system_instruction")
    if system_instruction:
        gemini_request["systemInstruction"] = system_instruction

    # Translate tools if present
    tools = request.get("tools")
    if tools:
        tools_result = openai_tools_to_gemini(tools)
        warnings.extend(tools_result.warnings)
        gemini_request["tools"] = tools_result.data

    # Translate tool choice if present
    tool_choice = request.get("tool_choice")
    if tool_choice:
        gemini_request["toolConfig"] = openai_tool_choice_to_gemini(tool_choice)

    # Translate generation config
    generation_config: dict[str, Any] = {}

    temperature = request.get("temperature")
    if temperature is not None:
        generation_config["temperature"] = temperature

    top_p = request.get("top_p")
    if top_p is not None:
        generation_config["topP"] = top_p

    max_tokens = request.get("max_tokens")
    if max_tokens is not None:
        generation_config["maxOutputTokens"] = max_tokens

    stop = request.get("stop")
    if stop:
        generation_config["stopSequences"] = [stop] if isinstance(stop, str) else stop

    n = request.get("n")
    if n is not None:
        generation_config["candidateCount"] = n

    # Handle response format
    response_format = request.get("response_format")
    if response_format:
        format_type = response_format.get("type")
        if format_type == "json_object":
            generation_config["responseMimeType"] = "application/json"
        elif format_type == "json_schema":
            generation_config["responseMimeType"] = "application/json"

    if generation_config:
        gemini_request["generationConfig"] = generation_config

    return TranslationResult(data=gemini_request, warnings=warnings)


def translate_gemini_request_to_openai(
    request: GeminiGenerateRequest,
    model: str = "gpt-4",
) -> TranslationResult[OpenAIChatRequest]:
    """
    Convert a complete Gemini generateContent request to OpenAI chat request.

    Args:
        request: Gemini generateContent request
        model: OpenAI model to use (default: gpt-4)

    Returns:
        TranslationResult containing OpenAI chat completion request
    """
    warnings: list[str] = []

    # Translate contents to messages
    contents = request.get("contents", [])
    system_instruction = request.get("systemInstruction")
    message_result = gemini_to_openai_messages(contents, system_instruction)
    warnings.extend(message_result.warnings)

    # Build OpenAI request
    openai_request: OpenAIChatRequest = {
        "model": model,
        "messages": message_result.data,
    }

    # Translate tools if present
    tools = request.get("tools")
    if tools:
        tools_result = gemini_tools_to_openai(tools)
        warnings.extend(tools_result.warnings)
        openai_request["tools"] = tools_result.data

    # Translate tool config if present
    tool_config = request.get("toolConfig")
    if tool_config:
        tool_choice = gemini_tool_config_to_openai(tool_config)
        if tool_choice:
            openai_request["tool_choice"] = tool_choice

    # Translate generation config
    generation_config = request.get("generationConfig")
    if generation_config:
        temperature = generation_config.get("temperature")
        if temperature is not None:
            openai_request["temperature"] = temperature

        top_p = generation_config.get("topP")
        if top_p is not None:
            openai_request["top_p"] = top_p

        max_tokens = generation_config.get("maxOutputTokens")
        if max_tokens is not None:
            openai_request["max_tokens"] = max_tokens

        stop_sequences = generation_config.get("stopSequences")
        if stop_sequences:
            openai_request["stop"] = stop_sequences

        candidate_count = generation_config.get("candidateCount")
        if candidate_count is not None:
            openai_request["n"] = candidate_count

        response_mime_type = generation_config.get("responseMimeType")
        if response_mime_type == "application/json":
            openai_request["response_format"] = {"type": "json_object"}

    return TranslationResult(data=openai_request, warnings=warnings)


def translate_openai_response_to_gemini(
    response: OpenAIChatResponse,
) -> TranslationResult[GeminiGenerateResponse]:
    """
    Translate OpenAI response to Gemini format.

    Args:
        response: OpenAI chat completion response

    Returns:
        TranslationResult containing Gemini generateContent response
    """
    return openai_to_gemini_response(response)


def translate_gemini_response_to_openai(
    response: GeminiGenerateResponse,
    model: str = "gemini-model",
) -> TranslationResult[OpenAIChatResponse]:
    """
    Translate Gemini response to OpenAI format.

    Args:
        response: Gemini generateContent response
        model: Model name to use in response

    Returns:
        TranslationResult containing OpenAI chat completion response
    """
    return gemini_to_openai_response(response, model=model)
