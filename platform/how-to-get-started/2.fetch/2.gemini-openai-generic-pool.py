#!/usr/bin/env python3
"""
Gemini OpenAI-Compatible Generic Pool Example

Uses fetch_httpx AsyncClient for efficient connection reuse with Gemini's OpenAI-compatible endpoint.
Demonstrates singleton pattern for connection management.

Run: python 2.gemini-openai-generic-pool.py
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
BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai"
CHAT_PATH = "/chat/completions"

# Singleton client instance
_client_instance = None


def get_client():
    global _client_instance
    if _client_instance is None:
        limits = Limits(
            max_connections=100,
            max_keepalive_connections=50,
            keepalive_expiry=60.0,
        )
        _client_instance = AsyncClient(
            base_url=BASE_URL,
            limits=limits,
            timeout=Timeout(connect=10.0, read=300.0, write=10.0, pool=None),
            http2=True,
            headers={
                "Authorization": f"Bearer {GEMINI_API_KEY}",
                "Content-Type": "application/json",
            },
        )
    return _client_instance


async def close_client():
    global _client_instance
    if _client_instance is not None:
        await _client_instance.aclose()
        _client_instance = None


async def chat_completion(messages: list, **options) -> dict:
    client = get_client()

    payload = {
        "model": options.get("model", "gemini-2.0-flash"),
        "messages": messages,
        "temperature": options.get("temperature", 0.7),
        "max_tokens": options.get("max_tokens", 1000),
        **{k: v for k, v in options.items() if k not in ["model", "temperature", "max_tokens"]},
    }

    response = await client.post(CHAT_PATH, json=payload)

    if response.status_code >= 400:
        raise Exception(f"{response.status_code}: {response.text}")

    return response.json()


async def main():
    print("=" * 60)
    print("Gemini OpenAI-Compatible Generic Pool Example")
    print("=" * 60)
    print()

    print(f"Base URL: {BASE_URL}")
    print(f"Path: {CHAT_PATH}")
    print()

    # Example 1: Simple chat completion
    print("--- Example 1: Simple Chat Completion ---")
    try:
        response = await chat_completion(
            [{"role": "user", "content": 'Say "Hello from Gemini Pool!" in exactly 5 words.'}],
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
            [{"role": "user", "content": "Return a JSON object with keys: name, status, timestamp"}],
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

    # Example 3: System message
    print("--- Example 3: System Message ---")
    try:
        response = await chat_completion(
            [
                {"role": "system", "content": "You are a helpful assistant that responds in haiku format."},
                {"role": "user", "content": "Describe connection pooling."},
            ],
            temperature=0.8,
        )

        print("Response:")
        print(response["choices"][0]["message"]["content"])
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Example 4: Multi-turn conversation
    print("--- Example 4: Multi-turn Conversation ---")
    try:
        response = await chat_completion(
            [
                {"role": "user", "content": "My name is Alice."},
                {"role": "assistant", "content": "Hello Alice! Nice to meet you."},
                {"role": "user", "content": "What is my name?"},
            ],
            temperature=0,
        )

        print(f"Response: {response['choices'][0]['message']['content']}")
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Example 5: Demonstrate client reuse
    print("--- Example 5: Client Reuse ---")
    client1 = get_client()
    client2 = get_client()
    print(f"Same client instance: {client1 is client2}")
    print()

    # Clean up
    await close_client()
    print("Client closed.")


if __name__ == "__main__":
    asyncio.run(main())
