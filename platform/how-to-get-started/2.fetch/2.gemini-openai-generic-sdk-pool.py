#!/usr/bin/env python3
"""
Gemini OpenAI-Compatible Generic SDK Pool Example

Uses fetch_httpx AsyncClient with a generic factory pattern for connection management.
Demonstrates multi-origin pool management with Gemini's OpenAI-compatible endpoint.

Run: python 2.gemini-openai-generic-sdk-pool.py
"""
import asyncio
import json
import os
import sys
from pathlib import Path

# Add packages to path
ROOT_DIR = Path(__file__).parent.parent.parent
sys.path.insert(0, str(ROOT_DIR / "packages_py"))

from fetch_httpx import AsyncClient, Timeout, Limits

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("Error: GEMINI_API_KEY environment variable is required")
    sys.exit(1)

# Gemini OpenAI-compatible endpoint
GEMINI_ORIGIN = "https://generativelanguage.googleapis.com"
CHAT_PATH = "/v1beta/openai/chat/completions"

# Pool registry for multi-origin management
_pools = {}


def get_async_pool(origin, options=None):
    if options is None:
        options = {}

    if origin not in _pools:
        limits = Limits(
            max_connections=options.get("max_connections", 100),
            max_keepalive_connections=options.get("max_keepalive_connections", 50),
            keepalive_expiry=options.get("keepalive_expiry", 60.0),
        )
        _pools[origin] = AsyncClient(
            base_url=origin,
            limits=limits,
            timeout=Timeout(
                connect=options.get("connect_timeout", 10.0),
                read=options.get("read_timeout", 300.0),
                write=options.get("write_timeout", 10.0),
                pool=None,
            ),
            http2=options.get("http2", True),
            headers=options.get("headers", {}),
        )
    return _pools[origin]


async def close_async_pool(origin):
    if origin in _pools:
        await _pools[origin].aclose()
        del _pools[origin]


async def close_all_async_pools():
    for origin in list(_pools.keys()):
        await _pools[origin].aclose()
    _pools.clear()


def get_active_async_pool_origins():
    return list(_pools.keys())


async def main():
    print("=" * 60)
    print("Gemini OpenAI-Compatible Generic SDK Pool Example")
    print("=" * 60)
    print()

    # Get pool for Gemini origin with auth header
    pool = get_async_pool(GEMINI_ORIGIN, {
        "max_connections": 100,
        "headers": {
            "Authorization": f"Bearer {GEMINI_API_KEY}",
            "Content-Type": "application/json",
        },
    })

    print(f"Origin: {GEMINI_ORIGIN}")
    print(f"Active pools: {', '.join(get_active_async_pool_origins())}")
    print()

    async def chat_completion(messages, **options):
        payload = {
            "model": options.get("model", "gemini-2.0-flash"),
            "messages": messages,
            "temperature": options.get("temperature", 0.7),
            "max_tokens": options.get("max_tokens", 1000),
            **{k: v for k, v in options.items() if k not in ["model", "temperature", "max_tokens"]},
        }

        response = await pool.post(CHAT_PATH, json=payload)

        if response.status_code >= 400:
            raise Exception(f"{response.status_code}: {response.text}")

        return response.json()

    # Example 1: Simple chat completion
    print("--- Example 1: Simple Chat Completion ---")
    try:
        response = await chat_completion(
            [{"role": "user", "content": 'Say "Hello from Generic SDK Pool!" in exactly 6 words.'}],
            temperature=0.7,
            max_tokens=50,
        )

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
        response = await chat_completion(
            [{"role": "user", "content": "Return a JSON object with keys: service, pool_type, active"}],
            response_format={"type": "json_object"},
            temperature=0,
        )

        raw = response["choices"][0]["message"]["content"]
        print(f"Raw response: {raw}")
        parsed = json.loads(raw)
        print(f"Parsed JSON: {parsed}")
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Example 3: Direct client access for custom requests
    print("--- Example 3: Direct Client Access ---")
    try:
        response = await pool.post(
            CHAT_PATH,
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
        response = await chat_completion(
            [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "My favorite number is 42."},
                {"role": "assistant", "content": "That is a great number! The answer to life, the universe, and everything."},
                {"role": "user", "content": "What is my favorite number?"},
            ],
            temperature=0,
        )

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
