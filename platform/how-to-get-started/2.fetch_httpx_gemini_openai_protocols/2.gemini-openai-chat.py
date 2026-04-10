#!/usr/bin/env python3
"""
Example: OpenAI ↔ Gemini Chat Message Translation

This example demonstrates:
1. Converting OpenAI chat messages to Gemini format
2. Converting Gemini responses back to OpenAI format
3. Using the protocol translation layer with fetch_httpx

The translation handles:
- Role mapping (assistant → model, system → systemInstruction)
- Message content structure differences
- System message extraction
"""
import os
import sys
import json
import asyncio
from pathlib import Path

# Add packages to path
ROOT_DIR = Path(__file__).parent.parent.parent
sys.path.insert(0, str(ROOT_DIR / "packages_py"))
sys.path.insert(0, str(ROOT_DIR / "packages_py/fetch_httpx_gemini_openai_constant"))

from fetch_httpx import AsyncClient, Timeout
from fetch_httpx_gemini_openai_constant import (
    GEMINI_ORIGIN,
    GEMINI_CONNECT_TIMEOUT_S,
    GEMINI_READ_TIMEOUT_THINKING_S,
)
from fetch_httpx_gemini_openai_protocols import (
    translate_openai_request_to_gemini,
    translate_gemini_response_to_openai,
    openai_messages_to_gemini,
    gemini_to_openai_messages,
)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("ERROR: GEMINI_API_KEY environment variable not set")
    print("Set it with: export GEMINI_API_KEY=your_api_key")
    sys.exit(1)


async def main():
    # =========================================================================
    # Example 1: Basic Message Translation
    # =========================================================================

    print("=" * 60)
    print("Example 1: Basic OpenAI → Gemini Message Translation")
    print("=" * 60)

    # OpenAI-style messages
    openai_messages = [
        {"role": "system", "content": "You are a helpful assistant that speaks like a pirate."},
        {"role": "user", "content": "What is the weather like today?"},
        {"role": "assistant", "content": "Arrr, I be not knowin' the current weather, matey!"},
        {"role": "user", "content": "Tell me a joke about the sea."},
    ]

    print("\nOpenAI Messages:")
    print(json.dumps(openai_messages, indent=2))

    # Translate to Gemini format
    gemini_result = openai_messages_to_gemini(openai_messages)

    print("\nGemini Contents:")
    print(json.dumps(gemini_result.data["contents"], indent=2))

    print("\nGemini System Instruction:")
    print(json.dumps(gemini_result.data.get("system_instruction"), indent=2))

    if gemini_result.warnings:
        print("\nWarnings:", gemini_result.warnings)

    # =========================================================================
    # Example 2: Full Request Translation
    # =========================================================================

    print("\n" + "=" * 60)
    print("Example 2: Full OpenAI Request → Gemini Request Translation")
    print("=" * 60)

    # OpenAI-style chat completion request
    openai_request = {
        "model": "gpt-4",
        "messages": [
            {"role": "system", "content": "You are a concise assistant."},
            {"role": "user", "content": "Explain quantum computing in one sentence."},
        ],
        "temperature": 0.7,
        "max_tokens": 100,
        "top_p": 0.9,
    }

    print("\nOpenAI Request:")
    print(json.dumps(openai_request, indent=2))

    # Translate to Gemini format
    gemini_request_result = translate_openai_request_to_gemini(openai_request)

    print("\nGemini Request:")
    print(json.dumps(gemini_request_result.data, indent=2))

    # =========================================================================
    # Example 3: Make Actual API Call
    # =========================================================================

    print("\n" + "=" * 60)
    print("Example 3: Live API Call with Protocol Translation")
    print("=" * 60)

    # Create OpenAI-style request
    chat_request = {
        "model": "gemini-2.0-flash",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant. Be concise."},
            {"role": "user", "content": "What is 2 + 2? Reply with just the number."},
        ],
        "temperature": 0.1,
        "max_tokens": 50,
    }

    print("\nOpenAI-style Request:")
    print(json.dumps(chat_request, indent=2))

    # Translate to Gemini
    translated_request = translate_openai_request_to_gemini(chat_request)
    print("\nTranslated to Gemini Request:")
    print(json.dumps(translated_request.data, indent=2))

    # Make API call to Gemini's native endpoint
    GEMINI_URL = f"{GEMINI_ORIGIN}/v1beta/models/gemini-2.0-flash:generateContent"

    async with AsyncClient(timeout=Timeout(connect=GEMINI_CONNECT_TIMEOUT_S, read=GEMINI_READ_TIMEOUT_THINKING_S)) as client:
        try:
            response = await client.post(
                GEMINI_URL,
                headers={
                    "Content-Type": "application/json",
                    "x-goog-api-key": GEMINI_API_KEY,
                },
                json=translated_request.data,
            )

            if response.is_success:
                gemini_response = response.json()
                print("\nGemini Native Response:")
                print(json.dumps(gemini_response, indent=2))

                # Translate response back to OpenAI format
                openai_response = translate_gemini_response_to_openai(
                    gemini_response, model="gemini-2.0-flash"
                )
                print("\nTranslated to OpenAI Response:")
                print(json.dumps(openai_response.data, indent=2))

                # Extract the message content (OpenAI style)
                content = openai_response.data.get("choices", [{}])[0].get("message", {}).get("content")
                print("\nExtracted Content:", content)
            else:
                print(f"\nAPI Error: {response.status_code} {response.text}")

        except Exception as e:
            print(f"\nRequest Error: {e}")

    # =========================================================================
    # Example 4: Gemini → OpenAI Message Translation
    # =========================================================================

    print("\n" + "=" * 60)
    print("Example 4: Gemini → OpenAI Message Translation")
    print("=" * 60)

    # Gemini-style contents
    gemini_contents = [
        {
            "role": "user",
            "parts": [{"text": "Hello, how are you?"}],
        },
        {
            "role": "model",
            "parts": [{"text": "I am doing well, thank you for asking!"}],
        },
    ]

    gemini_system_instruction = {
        "parts": [{"text": "You are a friendly assistant."}],
    }

    print("\nGemini Contents:")
    print(json.dumps(gemini_contents, indent=2))

    print("\nGemini System Instruction:")
    print(json.dumps(gemini_system_instruction, indent=2))

    # Translate back to OpenAI format
    openai_result = gemini_to_openai_messages(gemini_contents, gemini_system_instruction)

    print("\nOpenAI Messages:")
    print(json.dumps(openai_result.data, indent=2))

    print("\n" + "=" * 60)
    print("Chat Translation Examples Complete")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
