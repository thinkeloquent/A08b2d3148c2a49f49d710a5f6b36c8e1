#!/usr/bin/env python3
"""
Example: OpenAI ↔ Gemini Streaming Format Translation

This example demonstrates:
1. Converting individual Gemini streaming chunks to OpenAI SSE format
2. Converting individual OpenAI SSE chunks to Gemini NDJSON format
3. Understanding the structural differences between streaming formats

Key Differences:
- OpenAI: Server-Sent Events (SSE) with "data: {...}\\n\\n" format, ends with "data: [DONE]"
- Gemini: Newline-delimited JSON (NDJSON) with one JSON object per line

This example focuses on CHUNK-LEVEL translation (not full stream).
See 2.gemini-openai-streaming.py for full streaming translation.
"""
import sys
import json
import time
from pathlib import Path

# Add packages to path
ROOT_DIR = Path(__file__).parent.parent.parent
sys.path.insert(0, str(ROOT_DIR / "packages_py"))

from fetch_httpx_gemini_openai_protocols import (
    gemini_chunk_to_openai,
    openai_chunk_to_gemini,
    StreamAccumulator,
)


def main():
    # =========================================================================
    # Example 1: Gemini Chunk → OpenAI Chunk
    # =========================================================================

    print("=" * 60)
    print("Example 1: Gemini Chunk → OpenAI SSE Chunk Translation")
    print("=" * 60)

    # Simulated Gemini streaming chunks (as they arrive in NDJSON format)
    gemini_chunks = [
        # First chunk - contains initial content
        {
            "candidates": [
                {
                    "content": {
                        "role": "model",
                        "parts": [{"text": "Hello! "}],
                    },
                    "index": 0,
                },
            ],
        },
        # Second chunk - more content
        {
            "candidates": [
                {
                    "content": {
                        "role": "model",
                        "parts": [{"text": "How can I "}],
                    },
                    "index": 0,
                },
            ],
        },
        # Third chunk - even more content
        {
            "candidates": [
                {
                    "content": {
                        "role": "model",
                        "parts": [{"text": "help you today?"}],
                    },
                    "index": 0,
                },
            ],
        },
        # Final chunk - with finish reason
        {
            "candidates": [
                {
                    "content": {
                        "role": "model",
                        "parts": [{"text": ""}],
                    },
                    "finishReason": "STOP",
                    "index": 0,
                },
            ],
            "usageMetadata": {
                "promptTokenCount": 10,
                "candidatesTokenCount": 8,
                "totalTokenCount": 18,
            },
        },
    ]

    print("\nSimulated Gemini NDJSON chunks arriving over the wire:")
    print("(Each line is a separate JSON object)")
    print("-" * 40)

    is_first = True
    stream_id = f"chatcmpl-{int(time.time())}"

    for chunk in gemini_chunks:
        # What Gemini sends (NDJSON line)
        print(f"\nGemini chunk: {json.dumps(chunk)}")

        # Translate to OpenAI format
        result = gemini_chunk_to_openai(
            chunk,
            id=stream_id,
            model="gemini-2.0-flash",
            is_first=is_first,
        )
        is_first = False

        # What we'd send in OpenAI SSE format
        sse_format = f"data: {json.dumps(result.data)}\n\n"
        print(f"OpenAI SSE:  {sse_format.strip()}")

    # OpenAI streams end with [DONE]
    print("\nOpenAI SSE:  data: [DONE]\n")

    # =========================================================================
    # Example 2: OpenAI Chunk → Gemini Chunk
    # =========================================================================

    print("\n" + "=" * 60)
    print("Example 2: OpenAI SSE Chunk → Gemini NDJSON Chunk Translation")
    print("=" * 60)

    # Simulated OpenAI SSE chunks (parsed from "data: {...}" lines)
    current_time = int(time.time())
    openai_chunks = [
        # First chunk with role
        {
            "id": "chatcmpl-abc123",
            "object": "chat.completion.chunk",
            "created": current_time,
            "model": "gpt-4",
            "choices": [
                {
                    "index": 0,
                    "delta": {"role": "assistant", "content": "The "},
                    "finish_reason": None,
                },
            ],
        },
        # Content chunks
        {
            "id": "chatcmpl-abc123",
            "object": "chat.completion.chunk",
            "created": current_time,
            "model": "gpt-4",
            "choices": [
                {
                    "index": 0,
                    "delta": {"content": "weather "},
                    "finish_reason": None,
                },
            ],
        },
        {
            "id": "chatcmpl-abc123",
            "object": "chat.completion.chunk",
            "created": current_time,
            "model": "gpt-4",
            "choices": [
                {
                    "index": 0,
                    "delta": {"content": "is sunny."},
                    "finish_reason": None,
                },
            ],
        },
        # Final chunk
        {
            "id": "chatcmpl-abc123",
            "object": "chat.completion.chunk",
            "created": current_time,
            "model": "gpt-4",
            "choices": [
                {
                    "index": 0,
                    "delta": {},
                    "finish_reason": "stop",
                },
            ],
        },
    ]

    print("\nSimulated OpenAI SSE chunks arriving over the wire:")
    print('(Each "data: ..." line contains a JSON object)')
    print("-" * 40)

    # Create accumulator for stateful translation
    accumulator = StreamAccumulator()

    for chunk in openai_chunks:
        # What OpenAI sends (SSE format)
        print(f"\nOpenAI SSE:  data: {json.dumps(chunk)}")

        # Translate to Gemini format
        result = openai_chunk_to_gemini(chunk, accumulator)

        if result.data:
            # What we'd send in Gemini NDJSON format
            print(f"Gemini NDJSON: {json.dumps(result.data)}")
        else:
            print("Gemini NDJSON: (no output - accumulated)")

    # =========================================================================
    # Example 3: Chunk with Tool Calls
    # =========================================================================

    print("\n" + "=" * 60)
    print("Example 3: Streaming Chunk with Tool Calls")
    print("=" * 60)

    # Gemini chunk with function call
    gemini_tool_call_chunk = {
        "candidates": [
            {
                "content": {
                    "role": "model",
                    "parts": [
                        {
                            "functionCall": {
                                "name": "get_weather",
                                "args": {"location": "Tokyo"},
                            },
                        },
                    ],
                },
                "finishReason": "STOP",
                "index": 0,
            },
        ],
    }

    print("\nGemini chunk with function call:")
    print(json.dumps(gemini_tool_call_chunk, indent=2))

    tool_call_result = gemini_chunk_to_openai(
        gemini_tool_call_chunk,
        id=f"chatcmpl-{int(time.time())}",
        model="gemini-2.0-flash",
        is_first=True,
    )

    print("\nTranslated to OpenAI SSE format:")
    print(json.dumps(tool_call_result.data, indent=2))

    # =========================================================================
    # Example 4: Format Comparison Summary
    # =========================================================================

    print("\n" + "=" * 60)
    print("Example 4: Format Comparison Summary")
    print("=" * 60)

    print("""
┌─────────────────────────────────────────────────────────────────┐
│                    STREAMING FORMAT COMPARISON                   │
├─────────────────────────────────────────────────────────────────┤
│ Aspect              │ OpenAI SSE           │ Gemini NDJSON       │
├─────────────────────────────────────────────────────────────────┤
│ Line Format         │ data: {...}\\n\\n      │ {...}\\n             │
│ Content-Type        │ text/event-stream    │ application/json    │
│ End Marker          │ data: [DONE]\\n\\n     │ (none)              │
│ Role Location       │ First chunk delta    │ Every chunk content │
│ Content Key         │ delta.content        │ parts[].text        │
│ Function Calls      │ delta.tool_calls[]   │ parts[].functionCall│
│ Finish Reason       │ finish_reason        │ finishReason        │
│ Usage Stats         │ Separate final chunk │ Last chunk metadata │
└─────────────────────────────────────────────────────────────────┘
""")

    print("OpenAI SSE Example Stream:")
    print("-" * 40)
    print('data: {"id":"chatcmpl-1","choices":[{"delta":{"role":"assistant","content":"Hi"}}]}')
    print("")
    print('data: {"id":"chatcmpl-1","choices":[{"delta":{"content":" there"}}]}')
    print("")
    print('data: {"id":"chatcmpl-1","choices":[{"delta":{},"finish_reason":"stop"}]}')
    print("")
    print("data: [DONE]")
    print("")

    print("\nGemini NDJSON Example Stream:")
    print("-" * 40)
    print('{"candidates":[{"content":{"role":"model","parts":[{"text":"Hi"}]}}]}')
    print('{"candidates":[{"content":{"role":"model","parts":[{"text":" there"}]}}]}')
    print('{"candidates":[{"content":{"role":"model","parts":[]},"finishReason":"STOP"}],"usageMetadata":{...}}')

    print("\n" + "=" * 60)
    print("Stream Format Examples Complete")
    print("=" * 60)


if __name__ == "__main__":
    main()
