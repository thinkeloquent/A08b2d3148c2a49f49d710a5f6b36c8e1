#!/usr/bin/env python3
"""
Gemini OpenAI-Compatible AsyncClient Pool Example

Uses the full AsyncClient from fetch_httpx with pool configuration.
This provides access to all features (auth, retries, circuit breaker, etc.)
while configuring connection pooling.

Run: python 2.gemini-openai-async-client-pool.py
"""

import asyncio
import json
import os
import sys
from pathlib import Path

# Add packages to path using __file__ to work regardless of cwd
_script_dir = Path(__file__).resolve().parent
_packages_py = _script_dir / "../../packages_py"
sys.path.insert(0, str(_packages_py))
sys.path.insert(0, str(_packages_py / "fetch_httpx_gemini_openai_constant"))

from fetch_httpx import AsyncClient, Limits, Timeout, BearerAuth
from fetch_httpx_gemini_openai_constant import (
    GEMINI_ORIGIN,
    GEMINI_CHAT_COMPLETIONS_PATH,
    GEMINI_MAX_CONNECTIONS,
    GEMINI_MAX_KEEPALIVE_CONNECTIONS,
    GEMINI_KEEPALIVE_EXPIRY_S,
    GEMINI_CONNECT_TIMEOUT_S,
    GEMINI_READ_TIMEOUT_S,
    GEMINI_WRITE_TIMEOUT_S,
    GEMINI_HTTP2_ENABLED,
)


async def main():
    print("=" * 60)
    print("Gemini OpenAI-Compatible AsyncClient Pool Example")
    print("=" * 60)
    print()

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable is required")
        sys.exit(1)

    # Create AsyncClient with full pool configuration using Gemini constants
    async with AsyncClient(
        base_url=GEMINI_ORIGIN,

        # Authentication
        auth=BearerAuth(api_key),

        # Connection pool limits (using Gemini-optimized constants)
        limits=Limits(
            max_connections=GEMINI_MAX_CONNECTIONS,              # 100 - High ceiling for LLM workloads
            max_keepalive_connections=GEMINI_MAX_KEEPALIVE_CONNECTIONS,  # 50 - Balanced for concurrency
            keepalive_expiry=GEMINI_KEEPALIVE_EXPIRY_S,          # 60s - Aligns with chat typing pauses
        ),

        # Timeout configuration (using Gemini-optimized constants for thinking models)
        timeout=Timeout(
            connect=GEMINI_CONNECT_TIMEOUT_S,   # 10s - Fast fail on network issues
            read=GEMINI_READ_TIMEOUT_S,        # None - Disabled for thinking models
            write=GEMINI_WRITE_TIMEOUT_S,      # 10s - Prompt sending should be fast
            pool=None,                         # Disabled
        ),

        # HTTP/2 support
        http2=GEMINI_HTTP2_ENABLED,

        # Default headers
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json",
        },

        # Follow redirects
        follow_redirects=True,
        max_redirects=5,
    ) as client:
        print(f"Base URL: {GEMINI_ORIGIN}")
        print(f"Endpoint: {GEMINI_CHAT_COMPLETIONS_PATH}")
        print()

        # Example 1: Simple chat completion
        print("--- Example 1: Simple Chat Completion ---")
        try:
            response = await client.post(
                GEMINI_CHAT_COMPLETIONS_PATH,
                json={
                    "model": "gemini-2.0-flash",
                    "messages": [
                        {"role": "user", "content": 'Say "Hello from AsyncClient!" in exactly 4 words.'}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 50,
                },
            )

            data = response.json()
            print(f"Status: {response.status_code}")
            print(f"Model: {data['model']}")
            print(f"Response: {data['choices'][0]['message']['content']}")
            print(f"Finish reason: {data['choices'][0]['finish_reason']}")
            if "usage" in data:
                print(f"Usage: {data['usage']}")
        except Exception as e:
            print(f"Error: {e}")
        print()

        # Example 2: JSON mode
        print("--- Example 2: JSON Mode ---")
        try:
            response = await client.post(
                GEMINI_CHAT_COMPLETIONS_PATH,
                json={
                    "model": "gemini-2.0-flash",
                    "messages": [
                        {"role": "user", "content": "Return a JSON object with keys: client_type, pool_enabled, http2"}
                    ],
                    "response_format": {"type": "json_object"},
                    "temperature": 0,
                },
            )

            data = response.json()
            raw = data["choices"][0]["message"]["content"]
            print(f"Raw response: {raw}")
            parsed = json.loads(raw)
            print(f"Parsed JSON: {parsed}")
        except Exception as e:
            print(f"Error: {e}")
        print()

        # Example 3: System message with conversation
        print("--- Example 3: System Message ---")
        try:
            response = await client.post(
                GEMINI_CHAT_COMPLETIONS_PATH,
                json={
                    "model": "gemini-2.0-flash",
                    "messages": [
                        {"role": "system", "content": "You are a helpful assistant that explains technical concepts simply."},
                        {"role": "user", "content": "Explain HTTP/2 connection pooling in one sentence."},
                    ],
                    "temperature": 0.5,
                    "max_tokens": 100,
                },
            )

            data = response.json()
            print(f"Response: {data['choices'][0]['message']['content']}")
        except Exception as e:
            print(f"Error: {e}")
        print()

        # Example 4: Multi-turn conversation
        print("--- Example 4: Multi-turn Conversation ---")
        try:
            response = await client.post(
                GEMINI_CHAT_COMPLETIONS_PATH,
                json={
                    "model": "gemini-2.0-flash",
                    "messages": [
                        {"role": "user", "content": "Remember: the secret code is ALPHA-7."},
                        {"role": "assistant", "content": "Got it! I will remember that the secret code is ALPHA-7."},
                        {"role": "user", "content": "What is the secret code?"},
                    ],
                    "temperature": 0,
                },
            )

            data = response.json()
            print(f"Response: {data['choices'][0]['message']['content']}")
        except Exception as e:
            print(f"Error: {e}")
        print()

        # Example 5: Request with custom timeout override
        print("--- Example 5: Custom Timeout Override ---")
        try:
            response = await client.post(
                GEMINI_CHAT_COMPLETIONS_PATH,
                json={
                    "model": "gemini-2.0-flash",
                    "messages": [
                        {"role": "user", "content": "What is 2 + 2?"}
                    ],
                    "max_tokens": 20,
                },
                # Override timeout for this specific request
                timeout=60.0,
            )

            data = response.json()
            print(f"Response: {data['choices'][0]['message']['content']}")
        except Exception as e:
            print(f"Error: {e}")
        print()

    print("Client closed.")


if __name__ == "__main__":
    asyncio.run(main())
