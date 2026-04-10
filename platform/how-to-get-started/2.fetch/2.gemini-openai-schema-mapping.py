#!/usr/bin/env python3
"""
Gemini OpenAI-Compatible Schema Mapping Example

Uses fetch_httpx to demonstrate JSON schema validation and structured outputs
with Gemini's OpenAI-compatible endpoint.

Run: python 2.gemini-openai-schema-mapping.py
"""
import asyncio
import json
import os
import re
import sys
from pathlib import Path

# Add packages to path
ROOT_DIR = Path(__file__).parent.parent.parent
sys.path.insert(0, str(ROOT_DIR / "packages_py"))

from fetch_httpx import AsyncClient

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("Error: GEMINI_API_KEY environment variable is required")
    sys.exit(1)

# Gemini OpenAI-compatible endpoint
CHAT_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"


async def chat_completion(messages, **options):
    payload = {
        "model": options.get("model", "gemini-2.0-flash"),
        "messages": messages,
        "temperature": options.get("temperature", 0.7),
        "max_tokens": options.get("max_tokens", 1000),
        **{k: v for k, v in options.items() if k not in ["model", "temperature", "max_tokens"]},
    }

    async with AsyncClient(timeout=60.0) as client:
        response = await client.post(
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


def extract_json(content):
    """Extract JSON from response content."""
    if not content:
        return None

    # Try direct parse
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        pass

    # Try extracting from markdown code block
    code_block_match = re.search(r"```(?:json)?\s*([\s\S]*?)```", content)
    if code_block_match:
        try:
            return json.loads(code_block_match.group(1).strip())
        except json.JSONDecodeError:
            pass

    # Try finding JSON object in text
    json_match = re.search(r"\{[\s\S]*\}", content)
    if json_match:
        try:
            return json.loads(json_match.group(0))
        except json.JSONDecodeError:
            pass

    return None


def validate_schema(data, schema):
    """Simple schema validator."""
    errors = []

    if schema.get("type") == "object" and not isinstance(data, dict):
        errors.append("Expected object")
        return {"valid": False, "errors": errors}

    if "required" in schema:
        for field in schema["required"]:
            if field not in data:
                errors.append(f"Missing required field: {field}")

    if "properties" in schema:
        for key, prop_schema in schema["properties"].items():
            if key in data:
                value = data[key]
                prop_type = prop_schema.get("type")
                if prop_type == "string" and not isinstance(value, str):
                    errors.append(f"{key} should be string")
                if prop_type == "number" and not isinstance(value, (int, float)):
                    errors.append(f"{key} should be number")
                if prop_type == "boolean" and not isinstance(value, bool):
                    errors.append(f"{key} should be boolean")
                if prop_type == "array" and not isinstance(value, list):
                    errors.append(f"{key} should be array")

    return {"valid": len(errors) == 0, "errors": errors}


async def main():
    print("=" * 60)
    print("Gemini OpenAI-Compatible Schema Mapping Examples")
    print("=" * 60)
    print()

    # Example 1: Basic JSON mode
    print("--- Example 1: Basic JSON Mode ---")
    try:
        response = await chat_completion(
            [{"role": "user", "content": "Generate a user profile with name, email, and age in JSON format."}],
            response_format={"type": "json_object"},
            temperature=0,
        )

        content = response["choices"][0]["message"]["content"]
        print(f"Raw response: {content}")
        parsed = extract_json(content)
        print(f"Parsed JSON: {parsed}")
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Example 2: Structured output with schema
    print("--- Example 2: Structured Output with Schema ---")
    weather_schema = {
        "type": "object",
        "properties": {
            "city": {"type": "string"},
            "temperature": {"type": "number"},
            "conditions": {"type": "string"},
            "humidity": {"type": "number"},
        },
        "required": ["city", "temperature", "conditions"],
    }

    try:
        response = await chat_completion(
            [
                {"role": "system", "content": "Return ONLY valid JSON matching the schema. No explanation."},
                {"role": "user", "content": "Generate a weather report for Seattle."},
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "WeatherReport",
                    "schema": weather_schema,
                    "strict": True,
                },
            },
            temperature=0,
        )

        content = response["choices"][0]["message"]["content"]
        print(f"Raw response: {content}")
        parsed = extract_json(content)
        print(f"Parsed JSON: {parsed}")

        # Validate against schema
        validation = validate_schema(parsed, weather_schema)
        print(f"Schema validation: {'PASSED' if validation['valid'] else 'FAILED'}")
        if not validation["valid"]:
            print(f"Errors: {validation['errors']}")
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Example 3: Array response
    print("--- Example 3: Array Response ---")
    try:
        response = await chat_completion(
            [
                {
                    "role": "user",
                    "content": 'List 3 programming languages with their year created as JSON array. Each item should have "name" and "year" fields.',
                }
            ],
            response_format={"type": "json_object"},
            temperature=0,
        )

        content = response["choices"][0]["message"]["content"]
        print(f"Raw response: {content}")
        parsed = extract_json(content)
        print(f"Parsed JSON: {parsed}")
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Example 4: Nested object schema
    print("--- Example 4: Nested Object Schema ---")
    book_schema = {
        "type": "object",
        "properties": {
            "title": {"type": "string"},
            "author": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "birthYear": {"type": "number"},
                },
                "required": ["name"],
            },
            "genres": {"type": "array"},
            "rating": {"type": "number"},
        },
        "required": ["title", "author"],
    }

    try:
        response = await chat_completion(
            [
                {"role": "system", "content": "Return ONLY valid JSON. No markdown, no explanation."},
                {"role": "user", "content": 'Generate a book entry for "1984" by George Orwell with genres and rating.'},
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "BookEntry",
                    "schema": book_schema,
                    "strict": True,
                },
            },
            temperature=0,
        )

        content = response["choices"][0]["message"]["content"]
        print(f"Raw response: {content}")
        parsed = extract_json(content)
        print(f"Parsed JSON: {json.dumps(parsed, indent=2)}")
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Example 5: Schema format reference
    print("--- Example 5: OpenAI Response Format Reference ---")
    print("""
┌─────────────────────────────────────────────────────────────────┐
│                   OPENAI RESPONSE FORMAT OPTIONS                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 1. JSON Mode (basic):                                           │
│    response_format: { type: "json_object" }                     │
│                                                                 │
│ 2. JSON Schema (structured):                                    │
│    response_format: {                                           │
│      type: "json_schema",                                       │
│      json_schema: {                                             │
│        name: "SchemaName",                                      │
│        schema: {                                                │
│          type: "object",                                        │
│          properties: { ... },                                   │
│          required: [ ... ]                                      │
│        },                                                       │
│        strict: true                                             │
│      }                                                          │
│    }                                                            │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ JSON Schema Types:                                              │
│ • "string" - Text values                                        │
│ • "number" - Numeric values (int or float)                      │
│ • "boolean" - true/false                                        │
│ • "array" - List of items                                       │
│ • "object" - Nested objects                                     │
│ • "null" - Null value                                           │
└─────────────────────────────────────────────────────────────────┘
""")

    print("=" * 60)
    print("Schema Mapping Examples Complete")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
