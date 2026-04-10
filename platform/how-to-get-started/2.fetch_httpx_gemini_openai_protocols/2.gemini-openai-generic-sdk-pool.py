#!/usr/bin/env python3
"""
Gemini OpenAI-Compatible Generic SDK Pool Example

Uses the generic PoolClient from fetch_httpx SDK.
This demonstrates using the generic pool factory to connect to Gemini's
OpenAI-compatible endpoint (or any other API).

Run: python 2.gemini-openai-generic-sdk-pool.py
"""

import asyncio
import json
import os
import sys

sys.path.insert(0, "../../packages_py")
sys.path.insert(0, "../../packages_py/fetch_httpx_gemini_openai_constant")

from fetch_httpx.sdk.pool import (
    get_async_pool,
    close_async_pool,
    close_all_async_pools,
    get_active_async_pool_origins,
)
from fetch_httpx_gemini_openai_constant import (
    GEMINI_ORIGIN,
    GEMINI_CHAT_COMPLETIONS_PATH,
    GEMINI_MAX_CONNECTIONS,
    GEMINI_HTTP2_ENABLED,
)


async def main():
    print("=" * 60)
    print("Gemini OpenAI-Compatible Generic SDK Pool Example")
    print("=" * 60)
    print()

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable is required")
        sys.exit(1)

    # Get singleton pool for Gemini origin with auth header (using Gemini constants)
    pool = get_async_pool(GEMINI_ORIGIN, {
        "headers": {
            "Authorization": f"Bearer {api_key}",
        },
        "timeout_s": None,                           # Disabled for thinking models
        "max_connections": GEMINI_MAX_CONNECTIONS,   # 100 - High ceiling for LLM workloads
        "http2": GEMINI_HTTP2_ENABLED,
    })

    print(f"Origin: {pool.origin_host}")
    print(f"Active pools: {', '.join(get_active_async_pool_origins())}")
    print()

    # Example 1: Simple chat completion using generic post()
    print("--- Example 1: Simple Chat Completion ---")
    try:
        response = await pool.post(GEMINI_CHAT_COMPLETIONS_PATH, {
            "model": "gemini-2.0-flash",
            "messages": [
                {"role": "user", "content": 'Say "Hello from Generic SDK Pool!" in exactly 6 words.'}
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
        response = await pool.post(GEMINI_CHAT_COMPLETIONS_PATH, {
            "model": "gemini-2.0-flash",
            "messages": [
                {"role": "user", "content": "Return a JSON object with keys: service, pool_type, active"}
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

    # Example 3: Using underlying httpx client for more control
    print("--- Example 3: Direct Client Access ---")
    try:
        # Access the underlying httpx.AsyncClient for custom requests
        client = pool.client
        response = await client.post(
            GEMINI_CHAT_COMPLETIONS_PATH,
            json={
                "model": "gemini-2.0-flash",
                "messages": [
                    {"role": "user", "content": "What HTTP method is used for creating resources?"}
                ],
                "max_tokens": 100,
            },
            headers={
                "X-Custom-Header": "custom-value",
            },
        )
        response.raise_for_status()
        data = response.json()

        print(f"Status: {response.status_code}")
        print(f"Response: {data['choices'][0]['message']['content']}")
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Example 4: Multi-turn conversation
    print("--- Example 4: Multi-turn Conversation ---")
    try:
        response = await pool.post(GEMINI_CHAT_COMPLETIONS_PATH, {
            "model": "gemini-2.0-flash",
            "messages": [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "My favorite number is 42."},
                {"role": "assistant", "content": "That is a great number! The answer to life, the universe, and everything."},
                {"role": "user", "content": "What is my favorite number?"},
            ],
            "temperature": 0,
        })

        print(f"Response: {response['choices'][0]['message']['content']}")
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Example 5: Demonstrate pool reuse
    print("--- Example 5: Pool Reuse (same origin) ---")
    pool2 = get_async_pool(GEMINI_ORIGIN)  # Same origin, returns cached pool
    print(f"Same pool instance: {pool is pool2}")
    print(f"Active pool origins: {get_active_async_pool_origins()}")
    print()

    # Clean up
    await close_all_async_pools()
    print("All pools closed.")
    print(f"Active pool origins after close: {get_active_async_pool_origins()}")


if __name__ == "__main__":
    asyncio.run(main())
