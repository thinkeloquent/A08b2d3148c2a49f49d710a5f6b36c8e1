#!/usr/bin/env python3
"""
Gemini OpenAI-Compatible Connection Pool Example

Uses fetch_httpx AsyncClient for connection reuse with Gemini's OpenAI-compatible endpoint.

Run: python 2.gemini-openai-async-client-pool.py
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


async def main():
    print("=" * 60)
    print("Gemini OpenAI-Compatible Connection Pool Example")
    print("=" * 60)
    print()

    # Create async client with connection pool settings
    limits = Limits(
        max_connections=100,
        max_keepalive_connections=50,
        keepalive_expiry=60.0,
    )

    async with AsyncClient(
        base_url=BASE_URL,
        limits=limits,
        timeout=Timeout(connect=10.0, read=300.0, write=10.0, pool=None),
        http2=True,
        headers={
            "Authorization": f"Bearer {GEMINI_API_KEY}",
            "Content-Type": "application/json",
        },
    ) as client:
        print(f"Base URL: {BASE_URL}")
        print(f"Path: {CHAT_PATH}")
        print()

        async def chat_completion(messages: list, **options) -> dict:
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

        # Example 1: Simple chat completion
        print("--- Example 1: Simple Chat Completion ---")
        try:
            response = await chat_completion(
                [{"role": "user", "content": 'Say "Hello from Pool!" in exactly 4 words.'}],
                temperature=0.7,
                max_tokens=50,
            )

            print(f"Status: 200")
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
                [{"role": "user", "content": "Return a JSON object with keys: client_type, pool_enabled, http2"}],
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

        # Example 3: System message with conversation
        print("--- Example 3: System Message ---")
        try:
            response = await chat_completion(
                [
                    {"role": "system", "content": "You are a helpful assistant that explains technical concepts simply."},
                    {"role": "user", "content": "Explain HTTP/2 connection pooling in one sentence."},
                ],
                temperature=0.5,
                max_tokens=100,
            )

            print(f"Response: {response['choices'][0]['message']['content']}")
        except Exception as e:
            print(f"Error: {e}")
        print()

        # Example 4: Multi-turn conversation
        print("--- Example 4: Multi-turn Conversation ---")
        try:
            response = await chat_completion(
                [
                    {"role": "user", "content": "Remember: the secret code is ALPHA-7."},
                    {"role": "assistant", "content": "Got it! I will remember that the secret code is ALPHA-7."},
                    {"role": "user", "content": "What is the secret code?"},
                ],
                temperature=0,
            )

            print(f"Response: {response['choices'][0]['message']['content']}")
        except Exception as e:
            print(f"Error: {e}")
        print()

        # Example 5: Multiple requests (demonstrates pool reuse)
        print("--- Example 5: Parallel Requests (Pool Reuse) ---")
        try:
            requests = [
                chat_completion([{"role": "user", "content": "What is 2+2?"}], max_tokens=10),
                chat_completion([{"role": "user", "content": "What is 3+3?"}], max_tokens=10),
                chat_completion([{"role": "user", "content": "What is 4+4?"}], max_tokens=10),
            ]

            results = await asyncio.gather(*requests)
            for i, r in enumerate(results):
                print(f"Request {i + 1}: {r['choices'][0]['message']['content'].strip()}")
        except Exception as e:
            print(f"Error: {e}")
        print()

    print("Client closed.")


if __name__ == "__main__":
    asyncio.run(main())
