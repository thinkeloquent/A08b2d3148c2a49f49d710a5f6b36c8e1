#!/usr/bin/env python3
"""
Gemini OpenAI-Compatible Stream Format Example

Uses fetch_httpx to demonstrate the SSE stream format details
with Gemini's OpenAI-compatible endpoint.

Run: python 2.gemini-openai-stream-format.py
"""
import asyncio
import json
import os
import sys
from pathlib import Path

# Add packages to path
ROOT_DIR = Path(__file__).parent.parent.parent
sys.path.insert(0, str(ROOT_DIR / "packages_py"))

from fetch_httpx import AsyncClient

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("Error: GEMINI_API_KEY environment variable is required")
    sys.exit(1)

# Gemini OpenAI-compatible endpoint
CHAT_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"


async def main():
    print("=" * 60)
    print("Gemini OpenAI-Compatible Stream Format Examples")
    print("=" * 60)
    print()

    # Example 1: Raw SSE format inspection
    print("--- Example 1: Raw SSE Format Inspection ---")
    print("Streaming raw chunks:")
    print()

    try:
        async with AsyncClient(timeout=60.0) as client:
            async with client.stream(
                "POST",
                CHAT_ENDPOINT,
                headers={
                    "Authorization": f"Bearer {GEMINI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "gemini-2.0-flash",
                    "messages": [{"role": "user", "content": 'Say "Hi" in one word.'}],
                    "stream": True,
                    "max_tokens": 10,
                },
            ) as response:
                if response.status_code >= 400:
                    error_text = await response.aread()
                    raise Exception(f"{response.status_code}: {error_text.decode()}")

                chunk_index = 0
                async for line in response.aiter_lines():
                    if line.strip():
                        print(f'Chunk {chunk_index}: "{line}"')
                        chunk_index += 1
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Example 2: Parsed SSE chunks
    print("--- Example 2: Parsed SSE Chunks ---")
    print("Parsing each SSE data line:")
    print()

    try:
        async with AsyncClient(timeout=60.0) as client:
            async with client.stream(
                "POST",
                CHAT_ENDPOINT,
                headers={
                    "Authorization": f"Bearer {GEMINI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "gemini-2.0-flash",
                    "messages": [{"role": "user", "content": "Count: 1, 2, 3"}],
                    "stream": True,
                    "max_tokens": 50,
                },
            ) as response:
                if response.status_code >= 400:
                    error_text = await response.aread()
                    raise Exception(f"{response.status_code}: {error_text.decode()}")

                chunk_index = 0
                async for line in response.aiter_lines():
                    line = line.strip()
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            print(f"Chunk {chunk_index}: [DONE] - Stream complete")
                            chunk_index += 1
                        else:
                            try:
                                parsed = json.loads(data)
                                delta = parsed.get("choices", [{}])[0].get("delta", {})
                                finish_reason = parsed.get("choices", [{}])[0].get("finish_reason")

                                print(f"Chunk {chunk_index}:")
                                if "role" in delta:
                                    print(f'  role: "{delta["role"]}"')
                                if "content" in delta:
                                    print(f'  content: "{delta["content"]}"')
                                if finish_reason:
                                    print(f'  finish_reason: "{finish_reason}"')
                                if "usage" in parsed:
                                    print(f"  usage: {json.dumps(parsed['usage'])}")
                                chunk_index += 1
                            except json.JSONDecodeError:
                                print(f"Chunk {chunk_index}: (parse error)")
                                chunk_index += 1
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Example 3: Stream accumulator pattern
    print("--- Example 3: Stream Accumulator Pattern ---")
    print("Accumulating content from stream:")
    print()

    try:
        async with AsyncClient(timeout=60.0) as client:
            async with client.stream(
                "POST",
                CHAT_ENDPOINT,
                headers={
                    "Authorization": f"Bearer {GEMINI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "gemini-2.0-flash",
                    "messages": [{"role": "user", "content": "Write a very short haiku about code."}],
                    "stream": True,
                    "temperature": 0.8,
                },
            ) as response:
                if response.status_code >= 400:
                    error_text = await response.aread()
                    raise Exception(f"{response.status_code}: {error_text.decode()}")

                # Accumulator state
                accumulated = {
                    "id": None,
                    "model": None,
                    "role": None,
                    "content": "",
                    "finishReason": None,
                    "usage": None,
                }

                async for line in response.aiter_lines():
                    line = line.strip()
                    if line.startswith("data: "):
                        data = line[6:]
                        if data != "[DONE]":
                            try:
                                parsed = json.loads(data)
                                if parsed.get("id"):
                                    accumulated["id"] = parsed["id"]
                                if parsed.get("model"):
                                    accumulated["model"] = parsed["model"]

                                choice = parsed.get("choices", [{}])[0]
                                delta = choice.get("delta", {})
                                if delta.get("role"):
                                    accumulated["role"] = delta["role"]
                                if delta.get("content"):
                                    accumulated["content"] += delta["content"]
                                if choice.get("finish_reason"):
                                    accumulated["finishReason"] = choice["finish_reason"]
                                if parsed.get("usage"):
                                    accumulated["usage"] = parsed["usage"]
                            except json.JSONDecodeError:
                                pass

                print("Accumulated result:")
                print(json.dumps(accumulated, indent=2))
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Example 4: SSE format specification
    print("--- Example 4: OpenAI SSE Format Specification ---")
    print("""
┌─────────────────────────────────────────────────────────────────┐
│                    OPENAI SSE STREAM FORMAT                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ HTTP Headers:                                                   │
│   Content-Type: text/event-stream                               │
│   Cache-Control: no-cache                                       │
│   Connection: keep-alive                                        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Stream Structure:                                               │
│                                                                 │
│   data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk",  │
│          "model":"gemini-2.0-flash","choices":[                 │
│            {"index":0,"delta":{"role":"assistant"},...}]}       │
│                                                                 │
│   data: {"id":"chatcmpl-xxx","choices":[                        │
│            {"index":0,"delta":{"content":"Hello"},...}]}        │
│                                                                 │
│   data: {"id":"chatcmpl-xxx","choices":[                        │
│            {"index":0,"delta":{},"finish_reason":"stop"}]}      │
│                                                                 │
│   data: [DONE]                                                  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Key Fields:                                                     │
│ • id - Unique stream identifier                                 │
│ • object - Always "chat.completion.chunk" for streaming         │
│ • model - Model name                                            │
│ • choices[].delta.role - Assistant role (first chunk only)      │
│ • choices[].delta.content - Content token                       │
│ • choices[].finish_reason - "stop", "length", "tool_calls"      │
│ • usage - Token counts (may appear in final chunk)              │
└─────────────────────────────────────────────────────────────────┘
""")

    # Example 5: Compare stream vs non-stream
    print("--- Example 5: Stream vs Non-Stream Response Comparison ---")
    print("""
┌─────────────────────────────────────────────────────────────────┐
│              STREAM vs NON-STREAM RESPONSE COMPARISON            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ NON-STREAM (stream: false or omitted):                          │
│ ────────────────────────────────────────                        │
│ {                                                               │
│   "id": "chatcmpl-xxx",                                         │
│   "object": "chat.completion",                                  │
│   "model": "gemini-2.0-flash",                                  │
│   "choices": [{                                                 │
│     "index": 0,                                                 │
│     "message": {                                                │
│       "role": "assistant",                                      │
│       "content": "Complete response here"                       │
│     },                                                          │
│     "finish_reason": "stop"                                     │
│   }],                                                           │
│   "usage": { "prompt_tokens": 10, "completion_tokens": 5, ... } │
│ }                                                               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ STREAM (stream: true):                                          │
│ ──────────────────────                                          │
│ data: {"choices":[{"delta":{"role":"assistant"}}]}              │
│ data: {"choices":[{"delta":{"content":"Complete"}}]}            │
│ data: {"choices":[{"delta":{"content":" response"}}]}           │
│ data: {"choices":[{"delta":{"content":" here"}}]}               │
│ data: {"choices":[{"delta":{},"finish_reason":"stop"}]}         │
│ data: [DONE]                                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
""")

    print("=" * 60)
    print("Stream Format Examples Complete")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
