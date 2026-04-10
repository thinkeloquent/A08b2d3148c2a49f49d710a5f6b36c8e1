"""
Message Format Translation

Converts between OpenAI chat message format and Gemini content format.
Handles role mapping, content structure, and system instructions.
"""

from __future__ import annotations

import json
from typing import Any

from fetch_httpx import create_logger

from .types import (
    GeminiContent,
    GeminiPart,
    GeminiRole,
    GeminiSystemInstruction,
    OpenAIMessage,
    OpenAIRole,
    TranslationContext,
    TranslationResult,
)

logger = create_logger("fetch_httpx_gemini_openai_protocols", __file__)

# =============================================================================
# Role Mapping
# =============================================================================

OPENAI_TO_GEMINI_ROLE: dict[OpenAIRole, GeminiRole | str] = {
    "system": "system",  # Special handling
    "user": "user",
    "assistant": "model",
    "tool": "user",  # Tool responses go as user
    "function": "user",  # Legacy function responses
}

GEMINI_TO_OPENAI_ROLE: dict[GeminiRole, OpenAIRole] = {
    "user": "user",
    "model": "assistant",
}


def map_openai_role_to_gemini(role: OpenAIRole) -> GeminiRole | str:
    """Map OpenAI role to Gemini role."""
    return OPENAI_TO_GEMINI_ROLE.get(role, "user")


def map_gemini_role_to_openai(role: GeminiRole) -> OpenAIRole:
    """Map Gemini role to OpenAI role."""
    return GEMINI_TO_OPENAI_ROLE.get(role, "user")


# =============================================================================
# OpenAI → Gemini Translation
# =============================================================================


def _openai_message_to_parts(message: OpenAIMessage) -> list[GeminiPart]:
    """Convert OpenAI message to Gemini content parts."""
    parts: list[GeminiPart] = []

    # Handle text content
    content = message.get("content")
    if content:
        parts.append({"text": content})

    # Handle tool/function response
    role = message.get("role")
    if role == "tool" and message.get("tool_call_id") and content:
        parts.append({
            "functionResponse": {
                "name": message.get("name", "unknown"),
                "response": {"result": content},
            }
        })

    # Handle legacy function response
    if role == "function" and message.get("name") and content:
        parts.append({
            "functionResponse": {
                "name": message["name"],
                "response": {"result": content},
            }
        })

    return parts


def openai_messages_to_gemini(
    messages: list[OpenAIMessage],
    context: TranslationContext | None = None,
) -> TranslationResult[dict[str, Any]]:
    """
    Convert OpenAI messages to Gemini contents and system instruction.

    Args:
        messages: List of OpenAI messages
        context: Optional translation context

    Returns:
        TranslationResult containing:
            - contents: List of Gemini contents
            - system_instruction: Optional Gemini system instruction
    """
    logger.debug(
        "Converting OpenAI messages to Gemini",
        context={"message_count": len(messages)},
    )

    warnings: list[str] = []
    contents: list[GeminiContent] = []
    system_instruction: GeminiSystemInstruction | None = None

    # Group consecutive messages by role for Gemini format
    current_content: GeminiContent | None = None

    for message in messages:
        role = message.get("role", "user")

        # Handle system messages separately
        if role == "system":
            content = message.get("content")
            if system_instruction:
                # Append to existing system instruction
                if content:
                    system_instruction["parts"].append({"text": content})
            else:
                # Create new system instruction
                system_instruction = {
                    "parts": [{"text": content}] if content else [],
                }
            continue

        gemini_role = map_openai_role_to_gemini(role)
        if gemini_role == "system":
            continue  # Already handled

        parts = _openai_message_to_parts(message)

        # If empty parts, skip or add warning
        if not parts:
            tool_calls = message.get("tool_calls")
            if tool_calls and len(tool_calls) > 0:
                # Assistant message with tool calls but no content - valid
                continue
            warnings.append(f"Skipped empty message with role: {role}")
            continue

        # Gemini requires alternating user/model roles
        if current_content and current_content["role"] == gemini_role:
            current_content["parts"].extend(parts)
        else:
            if current_content:
                contents.append(current_content)
            current_content = {
                "role": gemini_role,
                "parts": parts,
            }

    # Push final content
    if current_content:
        contents.append(current_content)

    logger.debug(
        "Converted to Gemini format",
        context={
            "content_count": len(contents),
            "has_system_instruction": system_instruction is not None,
            "warnings": len(warnings),
        },
    )

    return TranslationResult(
        data={
            "contents": contents,
            "system_instruction": system_instruction,
        },
        warnings=warnings,
    )


# =============================================================================
# Gemini → OpenAI Translation
# =============================================================================


def _is_text_part(part: GeminiPart) -> bool:
    """Check if a part is a text part."""
    return "text" in part


def _is_function_response_part(part: GeminiPart) -> bool:
    """Check if a part is a function response part."""
    return "functionResponse" in part


def _extract_text_from_parts(parts: list[GeminiPart]) -> str:
    """Extract text content from Gemini parts."""
    return "".join(
        part["text"]
        for part in parts
        if _is_text_part(part)
    )


def _gemini_content_to_openai(content: GeminiContent) -> list[OpenAIMessage]:
    """Convert Gemini content to OpenAI message(s)."""
    messages: list[OpenAIMessage] = []
    role = map_gemini_role_to_openai(content["role"])

    # Check for function responses (these become separate tool messages)
    function_responses = [
        part for part in content["parts"]
        if _is_function_response_part(part)
    ]

    if function_responses:
        for fr in function_responses:
            fr_data = fr["functionResponse"]
            messages.append({
                "role": "tool",
                "content": json.dumps(fr_data["response"]),
                "name": fr_data["name"],
                "tool_call_id": f"call_{fr_data['name']}",  # Synthesize ID
            })

    # Extract text content
    text_content = _extract_text_from_parts(content["parts"])
    if text_content or not content["parts"]:
        messages.append({
            "role": role,
            "content": text_content or None,
        })

    return messages


def gemini_to_openai_messages(
    contents: list[GeminiContent],
    system_instruction: GeminiSystemInstruction | None = None,
    context: TranslationContext | None = None,
) -> TranslationResult[list[OpenAIMessage]]:
    """
    Convert Gemini contents and system instruction to OpenAI messages.

    Args:
        contents: List of Gemini contents
        system_instruction: Optional Gemini system instruction
        context: Optional translation context

    Returns:
        TranslationResult containing list of OpenAI messages
    """
    logger.debug(
        "Converting Gemini contents to OpenAI",
        context={
            "content_count": len(contents),
            "has_system_instruction": system_instruction is not None,
        },
    )

    warnings: list[str] = []
    messages: list[OpenAIMessage] = []

    # Add system instruction as first message
    if system_instruction and system_instruction.get("parts"):
        system_text = _extract_text_from_parts(system_instruction["parts"])
        if system_text:
            messages.append({
                "role": "system",
                "content": system_text,
            })

    # Convert contents
    for content in contents:
        converted = _gemini_content_to_openai(content)
        messages.extend(converted)

    logger.debug(
        "Converted to OpenAI format",
        context={
            "message_count": len(messages),
            "warnings": len(warnings),
        },
    )

    return TranslationResult(data=messages, warnings=warnings)


# =============================================================================
# Utility Functions
# =============================================================================


def validate_openai_messages(messages: list[OpenAIMessage]) -> list[str]:
    """Validate OpenAI messages."""
    errors: list[str] = []

    if not isinstance(messages, list):
        errors.append("messages must be a list")
        return errors

    for i, msg in enumerate(messages):
        if not msg.get("role"):
            errors.append(f"Message {i}: missing role")
        if (
            msg.get("content") is None
            and not msg.get("tool_calls")
            and not msg.get("function_call")
        ):
            errors.append(f"Message {i}: missing content, tool_calls, or function_call")

    return errors


def validate_gemini_contents(contents: list[GeminiContent]) -> list[str]:
    """Validate Gemini contents."""
    errors: list[str] = []

    if not isinstance(contents, list):
        errors.append("contents must be a list")
        return errors

    for i, content in enumerate(contents):
        if not content.get("role"):
            errors.append(f"Content {i}: missing role")
        parts = content.get("parts")
        if not parts or not isinstance(parts, list):
            errors.append(f"Content {i}: missing or invalid parts")

    # Check for alternating roles (Gemini requirement)
    for i in range(1, len(contents)):
        if contents[i].get("role") == contents[i - 1].get("role"):
            errors.append(
                f"Content {i}: consecutive messages with same role '{contents[i].get('role')}'"
            )

    return errors
