"""
Tool Call Normalization

Maps between OpenAI function_call/tool_calls and Gemini functionCall format.
Handles tool definitions, tool calls in messages, and tool responses.
"""

from __future__ import annotations

import json
import time
from collections.abc import Callable
from typing import Any

from fetch_httpx import create_logger

from .types import (
    GeminiFunctionCallPart,
    GeminiFunctionDeclaration,
    GeminiSchema,
    GeminiTool,
    GeminiToolConfig,
    OpenAIFunctionCall,
    OpenAIFunctionDefinition,
    OpenAIJSONSchema,
    OpenAITool,
    OpenAIToolCall,
    OpenAIToolChoice,
    TranslationResult,
)

logger = create_logger("fetch_httpx_gemini_openai_protocols.tools", __file__)

# =============================================================================
# Tool Call ID Generation
# =============================================================================

_tool_call_id_counter = 0


def generate_tool_call_id() -> str:
    """Generate a unique tool call ID (OpenAI format)."""
    global _tool_call_id_counter
    _tool_call_id_counter += 1
    return f"call_{int(time.time() * 1000)}_{_tool_call_id_counter}"


def reset_tool_call_id_counter() -> None:
    """Reset tool call ID counter (for testing)."""
    global _tool_call_id_counter
    _tool_call_id_counter = 0


# =============================================================================
# Schema Translation
# =============================================================================


def openai_schema_to_gemini(schema: OpenAIJSONSchema) -> GeminiSchema:
    """Convert OpenAI JSON Schema to Gemini Schema."""
    result: GeminiSchema = {
        "type": schema.get("type", "object"),
    }

    if "description" in schema:
        result["description"] = schema["description"]

    if "properties" in schema:
        result["properties"] = {
            key: openai_schema_to_gemini(value)
            for key, value in schema["properties"].items()
        }

    if "required" in schema:
        result["required"] = schema["required"]

    if "items" in schema:
        result["items"] = openai_schema_to_gemini(schema["items"])

    if "enum" in schema:
        result["enum"] = [str(e) for e in schema["enum"]]

    return result


def gemini_schema_to_openai(schema: GeminiSchema) -> OpenAIJSONSchema:
    """Convert Gemini Schema to OpenAI JSON Schema."""
    result: OpenAIJSONSchema = {
        "type": schema.get("type", "object"),
    }

    if "description" in schema:
        result["description"] = schema["description"]

    if "properties" in schema:
        result["properties"] = {
            key: gemini_schema_to_openai(value)
            for key, value in schema["properties"].items()
        }

    if "required" in schema:
        result["required"] = schema["required"]

    if "items" in schema:
        result["items"] = gemini_schema_to_openai(schema["items"])

    if "enum" in schema:
        result["enum"] = schema["enum"]

    return result


# =============================================================================
# Tool Definition Translation
# =============================================================================


def openai_function_to_gemini(func: OpenAIFunctionDefinition) -> GeminiFunctionDeclaration:
    """Convert OpenAI function definition to Gemini function declaration."""
    declaration: GeminiFunctionDeclaration = {
        "name": func["name"],
    }

    if "description" in func:
        declaration["description"] = func["description"]

    if "parameters" in func:
        declaration["parameters"] = openai_schema_to_gemini(func["parameters"])

    return declaration


def gemini_function_to_openai(declaration: GeminiFunctionDeclaration) -> OpenAIFunctionDefinition:
    """Convert Gemini function declaration to OpenAI function definition."""
    func: OpenAIFunctionDefinition = {
        "name": declaration["name"],
    }

    if "description" in declaration:
        func["description"] = declaration["description"]

    if "parameters" in declaration:
        func["parameters"] = gemini_schema_to_openai(declaration["parameters"])

    return func


def openai_tools_to_gemini(tools: list[OpenAITool]) -> TranslationResult[list[GeminiTool]]:
    """Convert OpenAI tools to Gemini tools."""
    logger.debug("Converting OpenAI tools to Gemini", context={"tool_count": len(tools)})

    warnings: list[str] = []
    declarations: list[GeminiFunctionDeclaration] = []

    for tool in tools:
        if tool.get("type") != "function":
            warnings.append(f"Skipping unsupported tool type: {tool.get('type')}")
            continue
        declarations.append(openai_function_to_gemini(tool["function"]))

    # Gemini groups all functions into a single tool object
    gemini_tools: list[GeminiTool] = (
        [{"functionDeclarations": declarations}] if declarations else []
    )

    return TranslationResult(data=gemini_tools, warnings=warnings)


def gemini_tools_to_openai(tools: list[GeminiTool]) -> TranslationResult[list[OpenAITool]]:
    """Convert Gemini tools to OpenAI tools."""
    logger.debug("Converting Gemini tools to OpenAI", context={"tool_count": len(tools)})

    warnings: list[str] = []
    openai_tools: list[OpenAITool] = []

    for tool in tools:
        declarations = tool.get("functionDeclarations", [])
        for declaration in declarations:
            openai_tools.append({
                "type": "function",
                "function": gemini_function_to_openai(declaration),
            })

    return TranslationResult(data=openai_tools, warnings=warnings)


# =============================================================================
# Tool Choice Translation
# =============================================================================


def openai_tool_choice_to_gemini(tool_choice: OpenAIToolChoice) -> GeminiToolConfig:
    """Convert OpenAI tool_choice to Gemini toolConfig."""
    if tool_choice == "none":
        return {"functionCallingConfig": {"mode": "NONE"}}

    if tool_choice == "auto":
        return {"functionCallingConfig": {"mode": "AUTO"}}

    if tool_choice == "required":
        return {"functionCallingConfig": {"mode": "ANY"}}

    # Specific function
    if isinstance(tool_choice, dict) and "function" in tool_choice:
        func_name = tool_choice["function"].get("name", "")
        return {
            "functionCallingConfig": {
                "mode": "ANY",
                "allowedFunctionNames": [func_name],
            }
        }

    # Default to auto
    return {"functionCallingConfig": {"mode": "AUTO"}}


def gemini_tool_config_to_openai(
    config: GeminiToolConfig,
) -> OpenAIToolChoice | None:
    """Convert Gemini toolConfig to OpenAI tool_choice."""
    fc_config = config.get("functionCallingConfig")
    if not fc_config:
        return None

    mode = fc_config.get("mode")
    allowed_names = fc_config.get("allowedFunctionNames")

    if mode == "NONE":
        return "none"

    if mode == "AUTO":
        return "auto"

    if mode == "ANY":
        if allowed_names and len(allowed_names) == 1:
            return {"type": "function", "function": {"name": allowed_names[0]}}
        return "required"

    return "auto"


# =============================================================================
# Tool Call Translation (in messages/responses)
# =============================================================================


def openai_tool_calls_to_gemini(
    tool_calls: list[OpenAIToolCall],
) -> TranslationResult[list[GeminiFunctionCallPart]]:
    """Convert OpenAI tool calls to Gemini function call parts."""
    logger.debug("Converting OpenAI tool calls to Gemini", context={"count": len(tool_calls)})

    warnings: list[str] = []
    parts: list[GeminiFunctionCallPart] = []

    for call in tool_calls:
        if call.get("type") != "function":
            warnings.append(f"Skipping unsupported tool call type: {call.get('type')}")
            continue

        func = call.get("function", {})
        try:
            args = json.loads(func.get("arguments", "{}"))
        except json.JSONDecodeError:
            warnings.append(f"Failed to parse arguments for tool call {call.get('id')}")
            args = {}

        parts.append({
            "functionCall": {
                "name": func.get("name", ""),
                "args": args,
            }
        })

    return TranslationResult(data=parts, warnings=warnings)


def openai_function_call_to_gemini(
    function_call: OpenAIFunctionCall,
) -> TranslationResult[GeminiFunctionCallPart]:
    """Convert legacy OpenAI function_call to Gemini function call part."""
    try:
        args = json.loads(function_call.get("arguments", "{}"))
        warnings = []
    except json.JSONDecodeError:
        args = {}
        warnings = ["Failed to parse function_call arguments"]

    return TranslationResult(
        data={
            "functionCall": {
                "name": function_call.get("name", ""),
                "args": args,
            }
        },
        warnings=warnings,
    )


def gemini_function_calls_to_openai(
    parts: list[GeminiFunctionCallPart],
    generate_id: Callable[[], str] | None = None,
) -> TranslationResult[list[OpenAIToolCall]]:
    """Convert Gemini function call parts to OpenAI tool calls."""
    logger.debug("Converting Gemini function calls to OpenAI", context={"count": len(parts)})

    if generate_id is None:
        generate_id = generate_tool_call_id

    warnings: list[str] = []
    tool_calls: list[OpenAIToolCall] = []

    for part in parts:
        fc = part.get("functionCall", {})
        tool_calls.append({
            "id": generate_id(),
            "type": "function",
            "function": {
                "name": fc.get("name", ""),
                "arguments": json.dumps(fc.get("args", {})),
            },
        })

    return TranslationResult(data=tool_calls, warnings=warnings)


# =============================================================================
# Utility Functions
# =============================================================================


def is_gemini_function_call_part(part: Any) -> bool:
    """Check if a part is a Gemini function call part."""
    return (
        isinstance(part, dict)
        and "functionCall" in part
        and isinstance(part["functionCall"], dict)
    )


def extract_function_calls(parts: list[Any]) -> list[GeminiFunctionCallPart]:
    """Extract function calls from Gemini parts."""
    return [part for part in parts if is_gemini_function_call_part(part)]
