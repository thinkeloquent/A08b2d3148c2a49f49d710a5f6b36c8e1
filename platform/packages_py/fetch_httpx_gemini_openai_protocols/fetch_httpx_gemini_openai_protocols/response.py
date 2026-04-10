"""
Response Schema Mapping

Converts between OpenAI chat completion responses and Gemini generateContent responses.
Handles structured output, finish reasons, and usage statistics.
"""

from __future__ import annotations

import json
import random
import re
import time
from collections.abc import Callable
from typing import Any

from fetch_httpx import create_logger

from .messages import map_gemini_role_to_openai
from .tools import (
    gemini_function_calls_to_openai,
    generate_tool_call_id,
    is_gemini_function_call_part,
)
from .types import (
    GeminiCandidate,
    GeminiContent,
    GeminiFunctionCallPart,
    GeminiGenerateResponse,
    GeminiUsageMetadata,
    OpenAIChatResponse,
    OpenAIChoice,
    OpenAIMessage,
    OpenAIUsage,
    TranslationResult,
)

logger = create_logger("fetch_httpx_gemini_openai_protocols.response", __file__)

# =============================================================================
# Finish Reason Mapping
# =============================================================================

OpenAIFinishReason = str | None
GeminiFinishReason = str | None


def map_gemini_finish_reason(reason: GeminiFinishReason) -> OpenAIFinishReason:
    """Map Gemini finish reason to OpenAI finish reason."""
    mapping = {
        "STOP": "stop",
        "MAX_TOKENS": "length",
        "SAFETY": "content_filter",
        "RECITATION": "content_filter",
        "OTHER": None,
    }
    return mapping.get(reason) if reason else None


def map_openai_finish_reason(reason: OpenAIFinishReason) -> GeminiFinishReason:
    """Map OpenAI finish reason to Gemini finish reason."""
    mapping = {
        "stop": "STOP",
        "length": "MAX_TOKENS",
        "content_filter": "SAFETY",
        "tool_calls": "STOP",
        "function_call": "STOP",
    }
    return mapping.get(reason, "OTHER") if reason else None


# =============================================================================
# Usage Statistics Mapping
# =============================================================================


def gemini_usage_to_openai(metadata: GeminiUsageMetadata) -> OpenAIUsage:
    """Convert Gemini usage metadata to OpenAI usage."""
    return {
        "prompt_tokens": metadata.get("promptTokenCount", 0),
        "completion_tokens": metadata.get("candidatesTokenCount", 0),
        "total_tokens": metadata.get("totalTokenCount", 0),
    }


def openai_usage_to_gemini(usage: OpenAIUsage) -> GeminiUsageMetadata:
    """Convert OpenAI usage to Gemini usage metadata."""
    return {
        "promptTokenCount": usage.get("prompt_tokens", 0),
        "candidatesTokenCount": usage.get("completion_tokens", 0),
        "totalTokenCount": usage.get("total_tokens", 0),
    }


# =============================================================================
# Gemini → OpenAI Response Translation
# =============================================================================


def _extract_text_content(content: GeminiContent) -> str:
    """Extract text content from Gemini content."""
    parts = content.get("parts", [])
    return "".join(
        part.get("text", "")
        for part in parts
        if "text" in part
    )


def _extract_function_call_parts(content: GeminiContent) -> list[GeminiFunctionCallPart]:
    """Extract function call parts from Gemini content."""
    parts = content.get("parts", [])
    return [part for part in parts if is_gemini_function_call_part(part)]


def _gemini_candidate_to_openai_choice(
    candidate: GeminiCandidate,
    index: int,
    id_generator: Callable[[], str] | None = None,
) -> OpenAIChoice:
    """Convert Gemini candidate to OpenAI choice."""
    if id_generator is None:
        id_generator = generate_tool_call_id

    content = candidate.get("content", {"role": "model", "parts": []})
    finish_reason = candidate.get("finishReason")

    # Build the message
    message: OpenAIMessage = {
        "role": map_gemini_role_to_openai(content.get("role", "model")),
        "content": _extract_text_content(content) or None,
    }

    # Check for function calls
    function_call_parts = _extract_function_call_parts(content)
    if function_call_parts:
        result = gemini_function_calls_to_openai(function_call_parts, id_generator)
        tool_calls = result.data
        message["tool_calls"] = tool_calls
        return {
            "index": index,
            "message": message,
            "finish_reason": "tool_calls" if tool_calls else map_gemini_finish_reason(finish_reason),
        }

    return {
        "index": index,
        "message": message,
        "finish_reason": map_gemini_finish_reason(finish_reason),
    }


def gemini_to_openai_response(
    response: GeminiGenerateResponse,
    model: str = "gemini-model",
    id_generator: Callable[[], str] | None = None,
) -> TranslationResult[OpenAIChatResponse]:
    """Convert Gemini generateContent response to OpenAI chat completion response."""
    logger.debug(
        "Converting Gemini response to OpenAI",
        context={"candidate_count": len(response.get("candidates", []))},
    )

    warnings: list[str] = []

    # Generate a unique ID
    random_suffix = "".join(random.choices("abcdefghijklmnopqrstuvwxyz0123456789", k=7))
    response_id = f"chatcmpl-{int(time.time())}-{random_suffix}"

    # Convert candidates to choices
    candidates = response.get("candidates", [])
    choices: list[OpenAIChoice] = [
        _gemini_candidate_to_openai_choice(candidate, index, id_generator)
        for index, candidate in enumerate(candidates)
    ]

    # Handle blocked responses
    prompt_feedback = response.get("promptFeedback")
    if prompt_feedback and prompt_feedback.get("blockReason"):
        warnings.append(f"Prompt blocked: {prompt_feedback['blockReason']}")

    result: OpenAIChatResponse = {
        "id": response_id,
        "object": "chat.completion",
        "created": int(time.time()),
        "model": model,
        "choices": choices,
    }

    # Add usage if available
    usage_metadata = response.get("usageMetadata")
    if usage_metadata:
        result["usage"] = gemini_usage_to_openai(usage_metadata)

    logger.debug(
        "Converted to OpenAI response",
        context={
            "id": result["id"],
            "choice_count": len(choices),
            "has_usage": "usage" in result,
        },
    )

    return TranslationResult(data=result, warnings=warnings)


# =============================================================================
# OpenAI → Gemini Response Translation
# =============================================================================


def _openai_message_to_gemini_content(message: OpenAIMessage) -> GeminiContent:
    """Convert OpenAI message to Gemini content."""
    parts: list[dict[str, Any]] = []

    # Add text content
    content = message.get("content")
    if content:
        parts.append({"text": content})

    # Add function calls
    tool_calls = message.get("tool_calls")
    if tool_calls:
        for tool_call in tool_calls:
            if tool_call.get("type") == "function":
                func = tool_call.get("function", {})
                try:
                    args = json.loads(func.get("arguments", "{}"))
                except json.JSONDecodeError:
                    args = {}
                parts.append({
                    "functionCall": {
                        "name": func.get("name", ""),
                        "args": args,
                    }
                })

    # Handle legacy function_call
    function_call = message.get("function_call")
    if function_call:
        try:
            args = json.loads(function_call.get("arguments", "{}"))
        except json.JSONDecodeError:
            args = {}
        parts.append({
            "functionCall": {
                "name": function_call.get("name", ""),
                "args": args,
            }
        })

    role = message.get("role", "assistant")
    return {
        "role": "model" if role == "assistant" else "user",
        "parts": parts,
    }


def _openai_choice_to_gemini_candidate(choice: OpenAIChoice) -> GeminiCandidate:
    """Convert OpenAI choice to Gemini candidate."""
    message = choice.get("message", {})
    return {
        "content": _openai_message_to_gemini_content(message),
        "finishReason": map_openai_finish_reason(choice.get("finish_reason")),
        "index": choice.get("index", 0),
    }


def openai_to_gemini_response(
    response: OpenAIChatResponse,
) -> TranslationResult[GeminiGenerateResponse]:
    """Convert OpenAI chat completion response to Gemini generateContent response."""
    logger.debug(
        "Converting OpenAI response to Gemini",
        context={
            "id": response.get("id"),
            "choice_count": len(response.get("choices", [])),
        },
    )

    warnings: list[str] = []

    choices = response.get("choices", [])
    result: GeminiGenerateResponse = {
        "candidates": [_openai_choice_to_gemini_candidate(choice) for choice in choices],
    }

    # Add usage metadata if available
    usage = response.get("usage")
    if usage:
        result["usageMetadata"] = openai_usage_to_gemini(usage)

    logger.debug(
        "Converted to Gemini response",
        context={
            "candidate_count": len(result["candidates"]),
            "has_usage": "usageMetadata" in result,
        },
    )

    return TranslationResult(data=result, warnings=warnings)


# =============================================================================
# Structured Output Helpers
# =============================================================================


def extract_json(content: str) -> Any | None:
    """Extract JSON from response content (handles markdown code blocks)."""
    # Try direct parse first
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        pass

    # Try to extract from markdown code block
    code_block_match = re.search(r"```(?:json)?\s*([\s\S]*?)```", content)
    if code_block_match:
        try:
            return json.loads(code_block_match.group(1).strip())
        except json.JSONDecodeError:
            pass

    # Try to find JSON object in content
    json_match = re.search(r"\{[\s\S]*\}", content)
    if json_match:
        try:
            return json.loads(json_match.group(0))
        except json.JSONDecodeError:
            pass

    return None


def validate_against_schema(
    data: Any,
    schema: dict[str, Any],
) -> tuple[bool, list[str]]:
    """Validate response against JSON schema (basic validation)."""
    # Basic type validation - full JSON Schema validation would require a library
    if data is None:
        return False, ["Data is null or undefined"]

    # For now, just check it's an object (full validation would use jsonschema)
    if not isinstance(data, dict):
        return False, ["Data is not an object"]

    return True, []
