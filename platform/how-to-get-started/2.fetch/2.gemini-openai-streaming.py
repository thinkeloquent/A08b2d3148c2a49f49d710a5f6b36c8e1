#!/usr/bin/env python3
"""
Gemini OpenAI-Compatible Streaming Example

Uses fetch_httpx to demonstrate streaming chat completions with
Gemini's OpenAI-compatible endpoint.

Run: python 2.gemini-openai-streaming.py
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


async def stream_chat(messages, **options):
    """Async generator for streaming chat completions."""
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

            async for line in response.aiter_lines():
                line = line.strip()
                if line.startswith("data: "):
                    data = line[6:]
                    if data == "[DONE]":
                        return
                    if data:
                        try:
                            yield json.loads(data)
                        except json.JSONDecodeError:
                            pass


async def main():
    print("=" * 60)
    print("Gemini OpenAI-Compatible Streaming Examples")
    print("=" * 60)
    print()

    # Example 1: Basic streaming
    print("--- Example 1: Basic Streaming ---")
    print("Response:")
    try:
        full_content = ""
        async for chunk in stream_chat([
            {"role": "system", "content": "You are a helpful assistant. Be concise."},
            {"role": "user", "content": "Write a haiku about programming."}
        ], temperature=0.8):
            content = chunk.get("choices", [{}])[0].get("delta", {}).get("content")
            if content:
                print(content, end="", flush=True)
                full_content += content
        print("\n")
        print("Extracted content:")
        print(full_content)
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Example 2: Streaming with token counting
    print("--- Example 2: Streaming with Token Counting ---")
    print("Response:")
    try:
        chunk_count = 0
        usage = None
        async for chunk in stream_chat([
            {"role": "user", "content": "Count from 1 to 5, with a brief description for each number."}
        ]):
            content = chunk.get("choices", [{}])[0].get("delta", {}).get("content")
            if content:
                print(content, end="", flush=True)
                chunk_count += 1
            if "usage" in chunk:
                usage = chunk["usage"]
        print("\n")
        print(f"Chunks received: {chunk_count}")
        if usage:
            print(f"Usage: {json.dumps(usage, indent=2)}")
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Example 3: Multi-turn streaming conversation
    print("--- Example 3: Multi-turn Streaming Conversation ---")
    print("Response:")
    try:
        async for chunk in stream_chat([
            {"role": "user", "content": "My favorite color is blue."},
            {"role": "assistant", "content": "Blue is a great color! It is often associated with calmness and trust."},
            {"role": "user", "content": "What is my favorite color?"}
        ], temperature=0):
            content = chunk.get("choices", [{}])[0].get("delta", {}).get("content")
            if content:
                print(content, end="", flush=True)
        print("\n")
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Example 4: Streaming format comparison
    print("--- Example 4: Streaming Format Comparison ---")
    print("""
┌───────────────────────────────────────────────────────────────┐
│                    STREAMING FORMAT COMPARISON                 │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  OpenAI SSE Format (Gemini OpenAI-compatible):                │
│  ─────────────────────────────────────────────                │
│  data: {"choices":[{"delta":{"content":"Hello"}}]}           │
│  data: {"choices":[{"delta":{"content":" World"}}]}          │
│  data: {"choices":[{"delta":{},"finish_reason":"stop"}]}     │
│  data: [DONE]                                                 │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│ Key Points:                                                   │
│ • Uses Server-Sent Events (SSE) format                        │
│ • Each chunk has "delta" containing incremental content       │
│ • Stream ends with "data: [DONE]"                            │
│ • finish_reason appears in final content chunk                │
└───────────────────────────────────────────────────────────────┘
""")

    print("=" * 60)
    print("Streaming Examples Complete")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
