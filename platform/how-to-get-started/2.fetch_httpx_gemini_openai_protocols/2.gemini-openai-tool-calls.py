#!/usr/bin/env python3
"""
Example: OpenAI ↔ Gemini Tool Call Normalization

This example demonstrates:
1. Converting OpenAI tool definitions to Gemini function declarations
2. Converting OpenAI tool_calls to Gemini functionCall parts
3. Converting Gemini function calls back to OpenAI tool_calls
4. Handling tool_choice / toolConfig translation

The translation handles:
- Tool definition schema translation
- Tool call ID generation
- Arguments serialization (JSON string ↔ object)
"""
import os
import sys
import json
import asyncio
from pathlib import Path

# Add packages to path
ROOT_DIR = Path(__file__).parent.parent.parent
sys.path.insert(0, str(ROOT_DIR / "packages_py"))
sys.path.insert(0, str(ROOT_DIR / "packages_py/fetch_httpx_gemini_openai_constant"))

from fetch_httpx import AsyncClient, Timeout
from fetch_httpx_gemini_openai_constant import (
    GEMINI_ORIGIN,
    GEMINI_CONNECT_TIMEOUT_S,
    GEMINI_READ_TIMEOUT_THINKING_S,
)
from fetch_httpx_gemini_openai_protocols import (
    openai_tools_to_gemini,
    gemini_tools_to_openai,
    openai_tool_calls_to_gemini,
    gemini_function_calls_to_openai,
    openai_tool_choice_to_gemini,
    gemini_tool_config_to_openai,
    translate_openai_request_to_gemini,
    translate_gemini_response_to_openai,
    generate_tool_call_id,
)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("ERROR: GEMINI_API_KEY environment variable not set")
    print("Set it with: export GEMINI_API_KEY=your_api_key")
    sys.exit(1)


async def main():
    # =========================================================================
    # Example 1: Tool Definition Translation
    # =========================================================================

    print("=" * 60)
    print("Example 1: OpenAI → Gemini Tool Definition Translation")
    print("=" * 60)

    # OpenAI-style tool definitions
    openai_tools = [
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get the current weather for a location",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "string",
                            "description": "The city and state, e.g., San Francisco, CA",
                        },
                        "unit": {
                            "type": "string",
                            "enum": ["celsius", "fahrenheit"],
                            "description": "Temperature unit",
                        },
                    },
                    "required": ["location"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "search_web",
                "description": "Search the web for information",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The search query",
                        },
                        "max_results": {
                            "type": "number",
                            "description": "Maximum number of results",
                        },
                    },
                    "required": ["query"],
                },
            },
        },
    ]

    print("\nOpenAI Tools:")
    print(json.dumps(openai_tools, indent=2))

    # Translate to Gemini format
    gemini_tools_result = openai_tools_to_gemini(openai_tools)

    print("\nGemini Tools:")
    print(json.dumps(gemini_tools_result.data, indent=2))

    # =========================================================================
    # Example 2: Tool Call Translation (OpenAI → Gemini)
    # =========================================================================

    print("\n" + "=" * 60)
    print("Example 2: OpenAI → Gemini Tool Call Translation")
    print("=" * 60)

    # OpenAI-style tool calls (from assistant response)
    openai_tool_calls = [
        {
            "id": "call_abc123",
            "type": "function",
            "function": {
                "name": "get_weather",
                "arguments": json.dumps({"location": "San Francisco, CA", "unit": "fahrenheit"}),
            },
        },
        {
            "id": "call_def456",
            "type": "function",
            "function": {
                "name": "search_web",
                "arguments": json.dumps({"query": "best restaurants SF", "max_results": 5}),
            },
        },
    ]

    print("\nOpenAI Tool Calls:")
    print(json.dumps(openai_tool_calls, indent=2))

    # Translate to Gemini format
    gemini_parts_result = openai_tool_calls_to_gemini(openai_tool_calls)

    print("\nGemini Function Call Parts:")
    print(json.dumps(gemini_parts_result.data, indent=2))

    # =========================================================================
    # Example 3: Tool Call Translation (Gemini → OpenAI)
    # =========================================================================

    print("\n" + "=" * 60)
    print("Example 3: Gemini → OpenAI Tool Call Translation")
    print("=" * 60)

    # Gemini-style function call parts
    gemini_function_call_parts = [
        {
            "functionCall": {
                "name": "get_weather",
                "args": {"location": "New York, NY", "unit": "celsius"},
            },
        },
        {
            "functionCall": {
                "name": "search_web",
                "args": {"query": "weather forecast NYC"},
            },
        },
    ]

    print("\nGemini Function Call Parts:")
    print(json.dumps(gemini_function_call_parts, indent=2))

    # Translate to OpenAI format
    openai_tool_calls_result = gemini_function_calls_to_openai(gemini_function_call_parts)

    print("\nOpenAI Tool Calls:")
    print(json.dumps(openai_tool_calls_result.data, indent=2))

    # =========================================================================
    # Example 4: Tool Choice Translation
    # =========================================================================

    print("\n" + "=" * 60)
    print("Example 4: Tool Choice / Tool Config Translation")
    print("=" * 60)

    tool_choices = [
        "none",
        "auto",
        "required",
        {"type": "function", "function": {"name": "get_weather"}},
    ]

    for choice in tool_choices:
        gemini_config = openai_tool_choice_to_gemini(choice)
        print(f"\nOpenAI tool_choice: {json.dumps(choice)}")
        print(f"Gemini toolConfig: {json.dumps(gemini_config)}")

        # Translate back
        back_to_openai = gemini_tool_config_to_openai(gemini_config)
        print(f"Back to OpenAI: {json.dumps(back_to_openai)}")

    # =========================================================================
    # Example 5: Live API Call with Tool Calls
    # =========================================================================

    print("\n" + "=" * 60)
    print("Example 5: Live API Call with Tool Calls")
    print("=" * 60)

    # OpenAI-style request with tools
    openai_request = {
        "model": "gemini-2.0-flash",
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful assistant. Use the provided tools when appropriate.",
            },
            {"role": "user", "content": "What is the weather in Tokyo?"},
        ],
        "tools": [
            {
                "type": "function",
                "function": {
                    "name": "get_weather",
                    "description": "Get the current weather for a location",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "location": {"type": "string", "description": "City name"},
                            "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                        },
                        "required": ["location"],
                    },
                },
            },
        ],
        "tool_choice": "auto",
    }

    print("\nOpenAI-style Request:")
    print(json.dumps(openai_request, indent=2))

    # Translate to Gemini
    translated_request = translate_openai_request_to_gemini(openai_request)
    print("\nTranslated to Gemini Request:")
    print(json.dumps(translated_request.data, indent=2))

    # Make API call to Gemini's native endpoint
    GEMINI_URL = f"{GEMINI_ORIGIN}/v1beta/models/gemini-2.0-flash:generateContent"

    async with AsyncClient(timeout=Timeout(connect=GEMINI_CONNECT_TIMEOUT_S, read=GEMINI_READ_TIMEOUT_THINKING_S)) as client:
        try:
            response = await client.post(
                GEMINI_URL,
                headers={
                    "Content-Type": "application/json",
                    "x-goog-api-key": GEMINI_API_KEY,
                },
                json=translated_request.data,
            )

            if response.is_success:
                gemini_response = response.json()
                print("\nGemini Native Response:")
                print(json.dumps(gemini_response, indent=2))

                # Translate response back to OpenAI format
                openai_response = translate_gemini_response_to_openai(
                    gemini_response, model="gemini-2.0-flash"
                )
                print("\nTranslated to OpenAI Response:")
                print(json.dumps(openai_response.data, indent=2))

                # Check for tool calls
                choice = openai_response.data.get("choices", [{}])[0]
                tool_calls = choice.get("message", {}).get("tool_calls")
                if tool_calls:
                    print("\nTool Calls Detected:")
                    for tc in tool_calls:
                        print(f"  - {tc['function']['name']}({tc['function']['arguments']})")
                elif choice.get("message", {}).get("content"):
                    print("\nText Response:", choice["message"]["content"])
            else:
                print(f"\nAPI Error: {response.status_code} {response.text}")

        except Exception as e:
            print(f"\nRequest Error: {e}")

    # =========================================================================
    # Example 6: Gemini → OpenAI Tool Definition Translation
    # =========================================================================

    print("\n" + "=" * 60)
    print("Example 6: Gemini → OpenAI Tool Definition Translation")
    print("=" * 60)

    # Gemini-style tools
    gemini_tools = [
        {
            "functionDeclarations": [
                {
                    "name": "calculate",
                    "description": "Perform a mathematical calculation",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "expression": {"type": "string", "description": "Math expression to evaluate"},
                        },
                        "required": ["expression"],
                    },
                },
                {
                    "name": "translate",
                    "description": "Translate text to another language",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "text": {"type": "string", "description": "Text to translate"},
                            "target_language": {"type": "string", "description": "Target language code"},
                        },
                        "required": ["text", "target_language"],
                    },
                },
            ],
        },
    ]

    print("\nGemini Tools:")
    print(json.dumps(gemini_tools, indent=2))

    # Translate to OpenAI format
    openai_tools_result = gemini_tools_to_openai(gemini_tools)

    print("\nOpenAI Tools:")
    print(json.dumps(openai_tools_result.data, indent=2))

    print("\n" + "=" * 60)
    print("Tool Call Examples Complete")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
