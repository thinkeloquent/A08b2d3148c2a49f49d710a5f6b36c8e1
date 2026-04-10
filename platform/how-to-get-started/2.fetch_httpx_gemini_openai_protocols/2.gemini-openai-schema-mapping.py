#!/usr/bin/env python3
"""
Example: OpenAI ↔ Gemini Response Schema Mapping

This example demonstrates:
1. Converting complete OpenAI responses to Gemini format
2. Converting complete Gemini responses to OpenAI format
3. Handling finish reasons, usage statistics, and structured output
4. Extracting JSON from responses (including markdown code blocks)

The translation handles:
- Response ID generation
- Finish reason mapping (stop ↔ STOP, length ↔ MAX_TOKENS, etc.)
- Usage statistics translation
- Candidate/choice mapping
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
    gemini_to_openai_response,
    openai_to_gemini_response,
    map_gemini_finish_reason,
    map_openai_finish_reason,
    gemini_usage_to_openai,
    openai_usage_to_gemini,
    extract_json,
    validate_against_schema,
    translate_openai_request_to_gemini,
)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")


async def main():
    # =========================================================================
    # Example 1: Finish Reason Mapping
    # =========================================================================

    print("=" * 60)
    print("Example 1: Finish Reason Mapping")
    print("=" * 60)

    gemini_finish_reasons = ["STOP", "MAX_TOKENS", "SAFETY", "RECITATION", "OTHER", None]
    openai_finish_reasons = ["stop", "length", "content_filter", "tool_calls", "function_call", None]

    print("\nGemini → OpenAI Finish Reason Mapping:")
    for reason in gemini_finish_reasons:
        mapped = map_gemini_finish_reason(reason)
        print(f"  {reason} → {mapped}")

    print("\nOpenAI → Gemini Finish Reason Mapping:")
    for reason in openai_finish_reasons:
        mapped = map_openai_finish_reason(reason)
        print(f"  {reason} → {mapped}")

    # =========================================================================
    # Example 2: Usage Statistics Translation
    # =========================================================================

    print("\n" + "=" * 60)
    print("Example 2: Usage Statistics Translation")
    print("=" * 60)

    # Gemini usage metadata
    gemini_usage = {
        "promptTokenCount": 150,
        "candidatesTokenCount": 75,
        "totalTokenCount": 225,
    }

    print("\nGemini Usage Metadata:")
    print(json.dumps(gemini_usage, indent=2))

    openai_usage = gemini_usage_to_openai(gemini_usage)
    print("\nTranslated to OpenAI Usage:")
    print(json.dumps(openai_usage, indent=2))

    # OpenAI usage
    openai_usage_data = {
        "prompt_tokens": 100,
        "completion_tokens": 50,
        "total_tokens": 150,
    }

    print("\nOpenAI Usage:")
    print(json.dumps(openai_usage_data, indent=2))

    gemini_usage_data = openai_usage_to_gemini(openai_usage_data)
    print("\nTranslated to Gemini Usage Metadata:")
    print(json.dumps(gemini_usage_data, indent=2))

    # =========================================================================
    # Example 3: Complete Response Translation (Gemini → OpenAI)
    # =========================================================================

    print("\n" + "=" * 60)
    print("Example 3: Gemini → OpenAI Response Translation")
    print("=" * 60)

    # Simulated Gemini generateContent response
    gemini_response = {
        "candidates": [
            {
                "content": {
                    "role": "model",
                    "parts": [
                        {"text": "The weather in San Francisco is typically mild and pleasant."},
                    ],
                },
                "finishReason": "STOP",
                "index": 0,
            },
        ],
        "usageMetadata": {
            "promptTokenCount": 25,
            "candidatesTokenCount": 15,
            "totalTokenCount": 40,
        },
    }

    print("\nGemini Response:")
    print(json.dumps(gemini_response, indent=2))

    openai_response_result = gemini_to_openai_response(gemini_response, model="gemini-2.0-flash")

    print("\nTranslated to OpenAI Response:")
    print(json.dumps(openai_response_result.data, indent=2))

    # =========================================================================
    # Example 4: Complete Response Translation (OpenAI → Gemini)
    # =========================================================================

    print("\n" + "=" * 60)
    print("Example 4: OpenAI → Gemini Response Translation")
    print("=" * 60)

    # Simulated OpenAI chat completion response
    openai_response = {
        "id": "chatcmpl-123456",
        "object": "chat.completion",
        "created": 1700000000,
        "model": "gpt-4",
        "choices": [
            {
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": "Hello! How can I assist you today?",
                },
                "finish_reason": "stop",
            },
        ],
        "usage": {
            "prompt_tokens": 10,
            "completion_tokens": 8,
            "total_tokens": 18,
        },
    }

    print("\nOpenAI Response:")
    print(json.dumps(openai_response, indent=2))

    gemini_response_result = openai_to_gemini_response(openai_response)

    print("\nTranslated to Gemini Response:")
    print(json.dumps(gemini_response_result.data, indent=2))

    # =========================================================================
    # Example 5: Response with Tool Calls Translation
    # =========================================================================

    print("\n" + "=" * 60)
    print("Example 5: Response with Tool Calls Translation")
    print("=" * 60)

    # Gemini response with function calls
    gemini_with_function_calls = {
        "candidates": [
            {
                "content": {
                    "role": "model",
                    "parts": [
                        {
                            "functionCall": {
                                "name": "get_weather",
                                "args": {"location": "Tokyo", "unit": "celsius"},
                            },
                        },
                    ],
                },
                "finishReason": "STOP",
                "index": 0,
            },
        ],
        "usageMetadata": {
            "promptTokenCount": 50,
            "candidatesTokenCount": 20,
            "totalTokenCount": 70,
        },
    }

    print("\nGemini Response with Function Call:")
    print(json.dumps(gemini_with_function_calls, indent=2))

    openai_with_tool_calls = gemini_to_openai_response(
        gemini_with_function_calls, model="gemini-2.0-flash"
    )

    print("\nTranslated to OpenAI Response:")
    print(json.dumps(openai_with_tool_calls.data, indent=2))

    # Notice: finish_reason becomes 'tool_calls' when function calls are present

    # =========================================================================
    # Example 6: JSON Extraction from Response Content
    # =========================================================================

    print("\n" + "=" * 60)
    print("Example 6: JSON Extraction from Response Content")
    print("=" * 60)

    test_cases = [
        # Direct JSON
        '{"name": "John", "age": 30}',
        # JSON in markdown code block
        '```json\n{"city": "Boston", "temp": 72}\n```',
        # JSON in code block without language tag
        '```\n{"status": "ok"}\n```',
        # JSON embedded in text
        'Here is the result: {"success": true, "data": [1, 2, 3]} as requested.',
        # Invalid JSON
        "This is not JSON at all.",
    ]

    for content in test_cases:
        display = content[:50] + ("..." if len(content) > 50 else "")
        print(f'\nInput: "{display}"')
        extracted = extract_json(content)
        print(f"Extracted: {json.dumps(extracted)}")

    # =========================================================================
    # Example 7: Live API Call with Structured Output
    # =========================================================================

    if GEMINI_API_KEY:
        print("\n" + "=" * 60)
        print("Example 7: Live API Call with Structured Output")
        print("=" * 60)

        schema = {
            "type": "object",
            "properties": {
                "city": {"type": "string"},
                "temperature": {"type": "number"},
                "conditions": {"type": "string"},
            },
            "required": ["city", "temperature", "conditions"],
        }

        openai_request = {
            "model": "gemini-2.0-flash",
            "messages": [
                {"role": "system", "content": "Return ONLY valid JSON matching the schema."},
                {"role": "user", "content": "Generate a weather report for Seattle."},
            ],
            "response_format": {
                "type": "json_schema",
                "json_schema": {
                    "name": "WeatherReport",
                    "schema": schema,
                    "strict": True,
                },
            },
        }

        print("\nOpenAI-style Request:")
        print(json.dumps(openai_request, indent=2))

        # Translate to Gemini
        translated_request = translate_openai_request_to_gemini(openai_request)
        print("\nTranslated to Gemini Request:")
        print(json.dumps(translated_request.data, indent=2))

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
                    gemini_resp = response.json()
                    print("\nGemini Native Response:")
                    print(json.dumps(gemini_resp, indent=2))

                    # Translate to OpenAI format
                    openai_resp = gemini_to_openai_response(gemini_resp, model="gemini-2.0-flash")
                    print("\nTranslated to OpenAI Response:")
                    print(json.dumps(openai_resp.data, indent=2))

                    # Extract JSON from response
                    content = openai_resp.data.get("choices", [{}])[0].get("message", {}).get("content")
                    if content:
                        parsed_json = extract_json(content)
                        print("\nExtracted JSON:")
                        print(json.dumps(parsed_json, indent=2))

                        # Validate against schema
                        is_valid, errors = validate_against_schema(parsed_json, schema)
                        print(f"\nSchema Validation: {'PASSED' if is_valid else 'FAILED'}")
                        if not is_valid:
                            print("Validation Errors:", errors)
                else:
                    print(f"\nAPI Error: {response.status_code} {response.text}")

            except Exception as e:
                print(f"\nRequest Error: {e}")
    else:
        print("\n(Skipping live API example - GEMINI_API_KEY not set)")

    print("\n" + "=" * 60)
    print("Schema Mapping Examples Complete")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
