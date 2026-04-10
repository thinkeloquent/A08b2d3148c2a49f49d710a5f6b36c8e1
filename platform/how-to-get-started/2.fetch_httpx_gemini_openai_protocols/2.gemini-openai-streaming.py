#!/usr/bin/env python3
"""
Example: Full Streaming Translation with Live API Calls

This example demonstrates:
1. Making a streaming request to Gemini's native API
2. Translating Gemini NDJSON stream to OpenAI SSE format in real-time
3. Aggregating streaming responses into complete messages
4. Handling tool calls in streaming responses

This uses the full stream translation functions (async generators).
"""
import os
import sys
import json
import asyncio
from pathlib import Path
from typing import AsyncIterator

# Add packages to path
ROOT_DIR = Path(__file__).parent.parent.parent
sys.path.insert(0, str(ROOT_DIR / "packages_py"))
sys.path.insert(0, str(ROOT_DIR / "packages_py/fetch_httpx_gemini_openai_constant"))

from fetch_httpx import AsyncClient, Timeout
from fetch_httpx_gemini_openai_constant import (
    GEMINI_ORIGIN,
    GEMINI_CONNECT_TIMEOUT_S,
    GEMINI_READ_TIMEOUT_S,
)
from fetch_httpx_gemini_openai_protocols import (
    translate_openai_request_to_gemini,
    gemini_stream_to_openai,
    aggregate_openai_stream,
)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("ERROR: GEMINI_API_KEY environment variable not set")
    print("Set it with: export GEMINI_API_KEY=your_api_key")
    sys.exit(1)


async def main():
    # =========================================================================
    # Example 1: Simple Streaming Chat
    # =========================================================================

    print("=" * 60)
    print("Example 1: Streaming Chat with Format Translation")
    print("=" * 60)

    openai_request = {
        "model": "gemini-2.0-flash",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant. Keep responses brief."},
            {"role": "user", "content": "Write a haiku about programming."},
        ],
        "temperature": 0.7,
        "max_tokens": 100,
        "stream": True,  # Enable streaming
    }

    print("\nOpenAI-style Request:")
    print(json.dumps(openai_request, indent=2))

    # Translate to Gemini format
    gemini_request = translate_openai_request_to_gemini(openai_request)
    print("\nTranslated to Gemini Request:")
    print(json.dumps(gemini_request.data, indent=2))

    # Make streaming request to Gemini
    GEMINI_STREAM_URL = f"{GEMINI_ORIGIN}/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse"

    async with AsyncClient(timeout=Timeout(connect=GEMINI_CONNECT_TIMEOUT_S, read=GEMINI_READ_TIMEOUT_S)) as client:
        print("\n--- Starting Streaming Request ---")
        print("URL:", GEMINI_STREAM_URL)

        async with client.stream(
            "POST",
            GEMINI_STREAM_URL,
            headers={
                "Content-Type": "application/json",
                "x-goog-api-key": GEMINI_API_KEY,
            },
            json=gemini_request.data,
        ) as response:
            if not response.is_success:
                error_text = await response.aread()
                print(f"API Error: {response.status_code} {error_text.decode()}")
                return

            print("\n--- Gemini SSE Stream (raw) ---")

            # Collect lines for translation
            lines = []
            async for line in response.aiter_lines():
                # Gemini with alt=sse sends SSE format
                if line.startswith("data: "):
                    json_line = line[6:]
                    if json_line.strip():
                        display = json_line[:80] + ("..." if len(json_line) > 80 else "")
                        print(f"Gemini: {display}")
                        lines.append(json_line)

            print("\n--- Translating to OpenAI SSE Format ---")

            # Create async iterator from collected lines
            async def iter_lines(lines_list):
                for line in lines_list:
                    yield line

            # Translate the stream
            full_content = ""
            async for openai_sse in gemini_stream_to_openai(iter_lines(lines), "gemini-2.0-flash"):
                print(f"OpenAI: {openai_sse.strip()}")

                # Parse to extract content
                if openai_sse.startswith("data: ") and "[DONE]" not in openai_sse:
                    try:
                        chunk = json.loads(openai_sse[6:])
                        content = chunk.get("choices", [{}])[0].get("delta", {}).get("content", "")
                        full_content += content
                    except json.JSONDecodeError:
                        pass

            print("\n--- Aggregated Response ---")
            print("Full content:", full_content)

    # =========================================================================
    # Example 2: Streaming with Tool Calls
    # =========================================================================

    print("\n" + "=" * 60)
    print("Example 2: Streaming with Tool Calls")
    print("=" * 60)

    tool_request = {
        "model": "gemini-2.0-flash",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant. Use tools when needed."},
            {"role": "user", "content": "What is the weather in Paris?"},
        ],
        "tools": [
            {
                "type": "function",
                "function": {
                    "name": "get_weather",
                    "description": "Get the weather for a location",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "location": {"type": "string", "description": "City name"},
                        },
                        "required": ["location"],
                    },
                },
            },
        ],
        "tool_choice": "auto",
        "stream": True,
    }

    print("\nOpenAI-style Request with Tools:")
    print(json.dumps(tool_request, indent=2))

    # Translate to Gemini
    gemini_tool_request = translate_openai_request_to_gemini(tool_request)
    print("\nTranslated to Gemini:")
    print(json.dumps(gemini_tool_request.data, indent=2))

    async with AsyncClient(timeout=Timeout(connect=GEMINI_CONNECT_TIMEOUT_S, read=GEMINI_READ_TIMEOUT_S)) as client:
        async with client.stream(
            "POST",
            GEMINI_STREAM_URL,
            headers={
                "Content-Type": "application/json",
                "x-goog-api-key": GEMINI_API_KEY,
            },
            json=gemini_tool_request.data,
        ) as response:
            if not response.is_success:
                error_text = await response.aread()
                print(f"API Error: {response.status_code} {error_text.decode()}")
            else:
                print("\n--- Streaming Response ---")

                # Collect and display chunks
                lines = []
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        json_line = line[6:]
                        if json_line.strip():
                            display = json_line[:100] + ("..." if len(json_line) > 100 else "")
                            print(f"Raw: {display}")
                            lines.append(json_line)

                # Parse and show tool calls
                print("\n--- Parsed Tool Calls ---")
                for line in lines:
                    try:
                        chunk = json.loads(line)
                        parts = chunk.get("candidates", [{}])[0].get("content", {}).get("parts", [])
                        for part in parts:
                            if "functionCall" in part:
                                fc = part["functionCall"]
                                print(f"Tool Call: {fc['name']}({json.dumps(fc.get('args', {}))})")
                    except json.JSONDecodeError:
                        pass

    # =========================================================================
    # Example 3: Stream Aggregation
    # =========================================================================

    print("\n" + "=" * 60)
    print("Example 3: Stream Aggregation Demo")
    print("=" * 60)

    # Simulate an OpenAI SSE stream
    simulated_sse_lines = [
        'data: {"id":"chatcmpl-1","choices":[{"delta":{"role":"assistant","content":"Hello"}}]}',
        'data: {"id":"chatcmpl-1","choices":[{"delta":{"content":" world"}}]}',
        'data: {"id":"chatcmpl-1","choices":[{"delta":{"content":"!"}}]}',
        'data: {"id":"chatcmpl-1","choices":[{"delta":{},"finish_reason":"stop"}]}',
        "data: [DONE]",
    ]

    print("\nSimulated OpenAI SSE Stream:")
    for line in simulated_sse_lines:
        print(line)

    # Create async iterator
    async def iter_sse(lines_list):
        for line in lines_list:
            yield line

    # Aggregate the stream
    aggregated = await aggregate_openai_stream(iter_sse(simulated_sse_lines))

    print("\nAggregated Result:")
    print(json.dumps(aggregated.data, indent=2))

    content = aggregated.data.get("choices", [{}])[0].get("delta", {}).get("content")
    print("\nFull Message:", content)

    print("\n" + "=" * 60)
    print("Streaming Examples Complete")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
