#!/usr/bin/env python3
"""
Gemini OpenAI-Compatible Structured Output Example

Uses fetch_httpx to call Gemini's OpenAI-compatible endpoint with JSON schema.

Run: python 1.fetch-providers-gemini-openai-structure.py
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
OPENAI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"

# JSON schema for structured output
schema = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "priority": {"type": "string", "enum": ["low", "medium", "high"]},
        "tags": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["title", "priority", "tags"],
    "additionalProperties": False,
}

# OpenAI-compatible request payload
payload = {
    "model": "gemini-2.0-flash",
    "messages": [
        {"role": "system", "content": "Return ONLY valid JSON matching the schema."},
        {"role": "user", "content": "Create a task for 'pay rent' with priority high and tags finance, home."},
    ],
    "response_format": {
        "type": "json_schema",
        "json_schema": {
            "name": "Task",
            "schema": schema,
            "strict": True,
        },
    },
}


def main():
    print("=" * 60)
    print("Gemini OpenAI-Compatible Structured Output")
    print("=" * 60)
    print()
    print(f"Endpoint: {OPENAI_ENDPOINT}")
    print(f"Model: {payload['model']}")
    print()

    with Client(timeout=30.0) as client:
        response = client.post(
            OPENAI_ENDPOINT,
            headers={
                "Authorization": f"Bearer {GEMINI_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
        )

    if response.status_code >= 400:
        print(f"Error: {response.status_code} {response.text}")
        sys.exit(1)

    data = response.json()
    print(f"Status: {response.status_code}")
    print(f"Model: {data['model']}")
    print(f"Finish Reason: {data['choices'][0]['finish_reason']}")
    print()

    content = data["choices"][0]["message"]["content"]
    print(f"Raw Response: {content}")
    print()

    task = json.loads(content)
    print(f"Parsed JSON: {task}")

    if "usage" in data:
        print()
        print(f"Usage: {data['usage']}")


if __name__ == "__main__":
    main()
