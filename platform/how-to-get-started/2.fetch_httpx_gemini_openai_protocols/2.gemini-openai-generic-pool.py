#!/usr/bin/env python3
"""
Gemini OpenAI-Compatible Generic Pool Example

Uses the GeminiClient from fetch_httpx_gemini_openai_protocols package.
This provides a singleton connection pool specifically configured for Gemini's
OpenAI-compatible endpoint.

Run: python 2.gemini-openai-generic-pool.py
"""

import asyncio
import json
import sys

sys.path.insert(0, "../../packages_py/fetch_httpx_gemini_openai_protocols")

from fetch_httpx_gemini_openai_protocols import (
    get_async_gemini_client,
    close_async_gemini_client,
    GEMINI_ORIGIN,
    GEMINI_CHAT_COMPLETIONS_PATH,
)


async def main():
    print("=" * 60)
    print("Gemini OpenAI-Compatible Generic Pool Example")
    print("=" * 60)
    print()

    # Get singleton Gemini client (uses GEMINI_API_KEY env var)
    # Default origin: https://generativelanguage.googleapis.com
    gemini = get_async_gemini_client(GEMINI_ORIGIN, {
        "timeout_s": 30.0,
        "max_connections": 100,
        "http2": True,
    })

    print(f"Origin: {gemini.origin_host}")
    print(f"Endpoint: {GEMINI_CHAT_COMPLETIONS_PATH}")
    print()

    # Example 1: Simple chat completion
    print("--- Example 1: Simple Chat Completion ---")
    try:
        response = await gemini.chat_completions({
            "model": "gemini-2.0-flash",
            "messages": [
                {"role": "user", "content": 'Say "Hello from Gemini Pool!" in exactly 5 words.'}
            ],
            "temperature": 0.7,
            "max_tokens": 50,
        })

        print(f"Model: {response['model']}")
        print(f"Response: {response['choices'][0]['message']['content']}")
        print(f"Finish reason: {response['choices'][0]['finish_reason']}")
        if "usage" in response:
            print(f"Usage: {response['usage']}")
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Example 2: JSON mode
    print("--- Example 2: JSON Mode ---")
    try:
        response = await gemini.chat_completions({
            "model": "gemini-2.0-flash",
            "messages": [
                {"role": "user", "content": "Return a JSON object with keys: name, status, timestamp"}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0,
        })

        raw = response["choices"][0]["message"]["content"]
        print(f"Raw response: {raw}")
        parsed = json.loads(raw)
        print(f"Parsed JSON: {parsed}")
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Example 3: System message
    print("--- Example 3: System Message ---")
    try:
        response = await gemini.chat_completions({
            "model": "gemini-2.0-flash",
            "messages": [
                {"role": "system", "content": "You are a helpful assistant that responds in haiku format."},
                {"role": "user", "content": "Describe connection pooling."},
            ],
            "temperature": 0.8,
        })

        print("Response:")
        print(response["choices"][0]["message"]["content"])
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Example 4: Multi-turn conversation
    print("--- Example 4: Multi-turn Conversation ---")
    try:
        response = await gemini.chat_completions({
            "model": "gemini-2.0-flash",
            "messages": [
                {"role": "user", "content": "My name is Alice."},
                {"role": "assistant", "content": "Hello Alice! Nice to meet you."},
                {"role": "user", "content": "What is my name?"},
            ],
            "temperature": 0,
        })

        print(f"Response: {response['choices'][0]['message']['content']}")
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Clean up
    await close_async_gemini_client()
    print("Client closed.")


if __name__ == "__main__":
    asyncio.run(main())
