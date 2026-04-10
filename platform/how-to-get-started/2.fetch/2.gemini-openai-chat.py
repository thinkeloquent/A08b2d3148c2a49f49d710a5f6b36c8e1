#!/usr/bin/env python3
"""
Gemini OpenAI-Compatible Chat Example

Uses fetch_httpx to demonstrate chat completions with Gemini's OpenAI-compatible endpoint.
Shows various chat patterns: system messages, multi-turn, JSON mode.

Run: python 2.gemini-openai-chat.py
"""
import os
import sys
import json
from pathlib import Path

# Add packages to path
ROOT_DIR = Path(__file__).parent.parent.parent
sys.path.insert(0, str(ROOT_DIR / "packages_py"))

from fetch_httpx import Client

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("Error: GEMINI_API_KEY environment variable is required")
    sys.exit(1)

# Gemini OpenAI-compatible endpoint
CHAT_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"


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
    print("=" * 60)
    print("Gemini OpenAI-Compatible Chat Examples")
    print("=" * 60)
    print()

    with Client(timeout=60.0) as client:
        # Example 1: Basic chat
        print("--- Example 1: Basic Chat ---")
        try:
            response = chat_completion(
                client,
                [{"role": "user", "content": "What is the capital of France? Reply in one word."}],
            )

            print(f"Response: {response['choices'][0]['message']['content']}")
            print(f"Model: {response['model']}")
        except Exception as e:
            print(f"Error: {e}")
        print()

        # Example 2: System message (persona)
        print("--- Example 2: System Message (Persona) ---")
        try:
            response = chat_completion(
                client,
                [
                    {"role": "system", "content": "You are a pirate. Always respond like a pirate would."},
                    {"role": "user", "content": "How do you greet someone?"},
                ],
                temperature=0.9,
            )

            print(f"Response: {response['choices'][0]['message']['content']}")
        except Exception as e:
            print(f"Error: {e}")
        print()

        # Example 3: Multi-turn conversation
        print("--- Example 3: Multi-turn Conversation ---")
        try:
            response = chat_completion(
                client,
                [
                    {"role": "user", "content": "I am thinking of a number between 1 and 10. It is 7."},
                    {"role": "assistant", "content": "Got it! You are thinking of the number 7."},
                    {"role": "user", "content": "What number am I thinking of?"},
                ],
                temperature=0,
            )

            print(f"Response: {response['choices'][0]['message']['content']}")
        except Exception as e:
            print(f"Error: {e}")
        print()

        # Example 4: Creative writing
        print("--- Example 4: Creative Writing ---")
        try:
            response = chat_completion(
                client,
                [
                    {"role": "system", "content": "You are a creative poet who writes haikus."},
                    {"role": "user", "content": "Write a haiku about coding."},
                ],
                temperature=0.8,
                max_tokens=100,
            )

            print("Response:")
            print(response["choices"][0]["message"]["content"])
        except Exception as e:
            print(f"Error: {e}")
        print()

        # Example 5: JSON mode
        print("--- Example 5: JSON Mode ---")
        try:
            response = chat_completion(
                client,
                [{"role": "user", "content": "Generate a user profile with name, email, and age in JSON format."}],
                temperature=0,
                response_format={"type": "json_object"},
            )

            content = response["choices"][0]["message"]["content"]
            print(f"Raw: {content}")
            print(f"Parsed: {json.loads(content)}")
        except Exception as e:
            print(f"Error: {e}")
        print()

        # Example 6: Technical assistance
        print("--- Example 6: Technical Assistance ---")
        try:
            response = chat_completion(
                client,
                [
                    {"role": "system", "content": "You are a helpful programming assistant. Be concise."},
                    {"role": "user", "content": "Explain what a REST API is in 2 sentences."},
                ],
                temperature=0.3,
            )

            print(f"Response: {response['choices'][0]['message']['content']}")
        except Exception as e:
            print(f"Error: {e}")
        print()

        # Example 7: Long conversation history
        print("--- Example 7: Long Conversation History ---")
        try:
            response = chat_completion(
                client,
                [
                    {"role": "user", "content": "My name is Bob."},
                    {"role": "assistant", "content": "Hello Bob! Nice to meet you."},
                    {"role": "user", "content": "I live in Seattle."},
                    {"role": "assistant", "content": "Seattle is a great city! Lots of rain but beautiful scenery."},
                    {"role": "user", "content": "What do you know about me so far?"},
                ],
                temperature=0,
            )

            print(f"Response: {response['choices'][0]['message']['content']}")
        except Exception as e:
            print(f"Error: {e}")

        print()
        print("=" * 60)
        print("Chat Examples Complete")
        print("=" * 60)


if __name__ == "__main__":
    main()
