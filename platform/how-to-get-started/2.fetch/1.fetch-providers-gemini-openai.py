#!/usr/bin/env python3
"""
Gemini OpenAI-Compatible Basic Example

Uses fetch_httpx to call Gemini's OpenAI-compatible endpoint.
Demonstrates basic chat completion with health check.

Run: python 1.fetch-providers-gemini-openai.py
"""
import json
import os
import sys
from pathlib import Path

# Add packages to path
ROOT_DIR = Path(__file__).parent.parent.parent
sys.path.insert(0, str(ROOT_DIR / "packages_py"))

from fetch_httpx import Client

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("Error: GEMINI_API_KEY environment variable is required")
    sys.exit(1)

# Gemini OpenAI-compatible endpoints
BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai"
MODELS_ENDPOINT = f"{BASE_URL}/models"
CHAT_ENDPOINT = f"{BASE_URL}/chat/completions"


def health_check(client: Client) -> bool:
    print("=" * 60)
    print("Health Check: List Models")
    print("=" * 60)
    print()

    response = client.get(
        MODELS_ENDPOINT,
        headers={"Authorization": f"Bearer {GEMINI_API_KEY}"},
    )

    if response.status_code >= 400:
        print(f"Error: {response.status_code} {response.text}")
        return False

    data = response.json()
    print(f"Status: {response.status_code}")
    print(f"Models available: {len(data.get('data', []))}")

    if data.get("data"):
        print("First 5 models:")
        for m in data["data"][:5]:
            print(f"  - {m['id']}")

    return True


def chat_completion(client: Client, messages: list, **options) -> dict:
    payload = {
        "model": options.get("model", "gemini-2.0-flash"),
        "messages": messages,
        "temperature": options.get("temperature", 0.7),
        "max_tokens": options.get("max_tokens", 1000),
        **{k: v for k, v in options.items() if k not in ["model", "temperature", "max_tokens"]},
    }

    response = client.post(
        CHAT_ENDPOINT,
        headers={
            "Authorization": f"Bearer {GEMINI_API_KEY}",
            "Content-Type": "application/json",
        },
        json=payload,
    )

    if response.status_code >= 400:
        raise Exception(f"{response.status_code}: {response.text}")

    return response.json()


def main():
    with Client(timeout=60.0) as client:
        # Health check
        healthy = health_check(client)
        if not healthy:
            print("Health check failed")
            sys.exit(1)
        print()

        # Example 1: Simple chat
        print("=" * 60)
        print("Example 1: Simple Chat Completion")
        print("=" * 60)
        print()

        try:
            response = chat_completion(
                client,
                [{"role": "user", "content": 'Say "Hello from Gemini!" in exactly 4 words.'}],
                temperature=0.7,
                max_tokens=50,
            )

            print(f"Model: {response['model']}")
            print(f"Response: {response['choices'][0]['message']['content']}")
            print(f"Finish Reason: {response['choices'][0]['finish_reason']}")
            if "usage" in response:
                print(f"Usage: {response['usage']}")
        except Exception as e:
            print(f"Error: {e}")
        print()

        # Example 2: System message
        print("=" * 60)
        print("Example 2: System Message")
        print("=" * 60)
        print()

        try:
            response = chat_completion(
                client,
                [
                    {"role": "system", "content": "You are a helpful assistant that responds in haiku format."},
                    {"role": "user", "content": "Describe programming."},
                ],
                temperature=0.8,
            )

            print("Response:")
            print(response["choices"][0]["message"]["content"])
        except Exception as e:
            print(f"Error: {e}")
        print()

        # Example 3: Multi-turn conversation
        print("=" * 60)
        print("Example 3: Multi-turn Conversation")
        print("=" * 60)
        print()

        try:
            response = chat_completion(
                client,
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

        # Example 4: JSON mode
        print("=" * 60)
        print("Example 4: JSON Mode")
        print("=" * 60)
        print()

        try:
            response = chat_completion(
                client,
                [{"role": "user", "content": "Return a JSON object with keys: name, age, city"}],
                temperature=0,
                response_format={"type": "json_object"},
            )

            raw = response["choices"][0]["message"]["content"]
            print(f"Raw: {raw}")
            parsed = json.loads(raw)
            print(f"Parsed: {parsed}")
        except Exception as e:
            print(f"Error: {e}")

        print()
        print("=" * 60)
        print("Examples Complete")
        print("=" * 60)


if __name__ == "__main__":
    main()
