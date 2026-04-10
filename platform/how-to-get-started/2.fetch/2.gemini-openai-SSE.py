#!/usr/bin/env python3
"""
Gemini OpenAI-Compatible SSE Streaming Example

Uses fetch_httpx to demonstrate Server-Sent Events (SSE) streaming
with Gemini's OpenAI-compatible endpoint.

Run: python 2.gemini-openai-SSE.py
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


async def stream_sse(response):
    """Async generator that yields SSE data chunks."""
    async for line in response.aiter_lines():
        line = line.strip()
        if line.startswith("data: "):
            data = line[6:]
            if data == "[DONE]":
                return
            if data:
                yield data


async def stream_chat_completion(messages, **options):
    """Stream chat completion and return async generator of SSE data."""
    payload = {
        "model": options.get("model", "gemini-2.0-flash"),
        "messages": messages,
        "stream": True,
        "temperature": options.get("temperature", 0.7),
        "max_tokens": options.get("max_tokens", 1000),
        **{k: v for k, v in options.items() if k not in ["model", "temperature", "max_tokens"]},
    }

    async with AsyncClient(timeout=60.0) as client:
        async with client.stream(
            "POST",
            CHAT_ENDPOINT,
            headers={
                "Authorization": f"Bearer {GEMINI_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
        ) as response:
            if response.status_code >= 400:
                error_text = await response.aread()
                raise Exception(f"{response.status_code}: {error_text.decode()}")

            async for data in stream_sse(response):
                yield data


async def main():
    print("=" * 60)
    print("Gemini OpenAI-Compatible SSE Streaming Examples")
    print("=" * 60)
    print()

    # Example 1: Basic SSE streaming
    print("--- Example 1: Basic SSE Streaming ---")
    print("Streaming response:")
    try:
        full_content = ""
        async for data in stream_chat_completion([
            {"role": "user", "content": "Count from 1 to 5, one number per line."}
        ]):
            try:
                parsed = json.loads(data)
                content = parsed.get("choices", [{}])[0].get("delta", {}).get("content")
                if content:
                    print(content, end="", flush=True)
                    full_content += content
            except json.JSONDecodeError:
                pass
        print("\n")
        print(f"Full content: {full_content.strip()}")
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Example 2: SSE with system message
    print("--- Example 2: SSE with System Message ---")
    print("Streaming response:")
    try:
        async for data in stream_chat_completion([
            {"role": "system", "content": "You are a pirate. Always respond like a pirate would."},
            {"role": "user", "content": "How do you greet someone?"}
        ], temperature=0.9):
            try:
                parsed = json.loads(data)
                content = parsed.get("choices", [{}])[0].get("delta", {}).get("content")
                if content:
                    print(content, end="", flush=True)
            except json.JSONDecodeError:
                pass
        print("\n")
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Example 3: SSE with token counting
    print("--- Example 3: SSE with Token Counting ---")
    print("Streaming response:")
    try:
        chunk_count = 0
        usage = None
        async for data in stream_chat_completion([
            {"role": "user", "content": "Write a haiku about coding."}
        ], temperature=0.8):
            try:
                parsed = json.loads(data)
                content = parsed.get("choices", [{}])[0].get("delta", {}).get("content")
                if content:
                    print(content, end="", flush=True)
                    chunk_count += 1
                if "usage" in parsed:
                    usage = parsed["usage"]
            except json.JSONDecodeError:
                pass
        print("\n")
        print(f"Chunks received: {chunk_count}")
        if usage:
            print(f"Usage: {usage}")
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Example 4: Raw SSE data inspection
    print("--- Example 4: Raw SSE Data Inspection ---")
    print("Raw SSE chunks:")
    try:
        async for data in stream_chat_completion([
            {"role": "user", "content": 'Say "Hi" in one word.'}
        ], max_tokens=10):
            display = data[:100] + ("..." if len(data) > 100 else "")
            print(f"data: {display}")
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Example 5: SSE Format explanation
    print("--- Example 5: SSE Format Specification ---")
    print("""
┌─────────────────────────────────────────────────────────────────┐
│                  SERVER-SENT EVENTS (SSE) FORMAT                 │
├─────────────────────────────────────────────────────────────────┤
│ Content-Type: text/event-stream                                  │
│ Cache-Control: no-cache                                          │
│ Connection: keep-alive                                           │
├─────────────────────────────────────────────────────────────────┤
│ STRUCTURE:                                                       │
│                                                                  │
│   data: <JSON object>\\n                                          │
│   \\n                          ← Empty line between events        │
│   data: <JSON object>\\n                                          │
│   \\n                                                             │
│   data: [DONE]\\n              ← End marker (OpenAI convention)   │
│   \\n                                                             │
├─────────────────────────────────────────────────────────────────┤
│ OpenAI SSE Chunk Structure:                                      │
│ {                                                                │
│   "id": "chatcmpl-xxx",                                          │
│   "object": "chat.completion.chunk",                             │
│   "model": "gemini-2.0-flash",                                   │
│   "choices": [{                                                  │
│     "index": 0,                                                  │
│     "delta": { "content": "Hello" },                             │
│     "finish_reason": null                                        │
│   }]                                                             │
│ }                                                                │
└─────────────────────────────────────────────────────────────────┘
""")

    print("=" * 60)
    print("SSE Streaming Examples Complete")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
