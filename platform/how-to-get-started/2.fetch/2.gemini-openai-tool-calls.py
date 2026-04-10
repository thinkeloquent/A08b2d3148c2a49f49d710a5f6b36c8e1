#!/usr/bin/env python3
"""
Gemini OpenAI-Compatible Tool Calls Example

Uses fetch_httpx to demonstrate function calling (tool calls) with
Gemini's OpenAI-compatible endpoint.

Run: python 2.gemini-openai-tool-calls.py
"""
import ast
import asyncio
import json
import operator
import os
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


# Define tools in OpenAI format
weather_tool = {
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get the current weather for a location",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "The city and state, e.g., San Francisco, CA",
                },
                "unit": {
                    "type": "string",
                    "enum": ["celsius", "fahrenheit"],
                    "description": "Temperature unit",
                },
            },
            "required": ["location"],
        },
    },
}

calculator_tool = {
    "type": "function",
    "function": {
        "name": "calculate",
        "description": "Perform a mathematical calculation",
        "parameters": {
            "type": "object",
            "properties": {
                "expression": {
                    "type": "string",
                    "description": "The mathematical expression to evaluate",
                },
            },
            "required": ["expression"],
        },
    },
}


# Simulated tool implementations
def execute_weather(args):
    location = args.get("location")
    unit = args.get("unit", "celsius")
    # Simulated weather data
    return {
        "location": location,
        "temperature": 22 if unit == "celsius" else 72,
        "unit": unit,
        "conditions": "sunny",
        "humidity": 45,
    }


_SAFE_OPS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}


def _eval_math_node(node):
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return node.value
    if isinstance(node, ast.BinOp):
        op = _SAFE_OPS.get(type(node.op))
        if op is None:
            raise ValueError(f"Unsupported operator: {type(node.op).__name__}")
        return op(_eval_math_node(node.left), _eval_math_node(node.right))
    if isinstance(node, ast.UnaryOp):
        op = _SAFE_OPS.get(type(node.op))
        if op is None:
            raise ValueError(f"Unsupported operator: {type(node.op).__name__}")
        return op(_eval_math_node(node.operand))
    raise ValueError(f"Unsupported expression: {type(node).__name__}")


def safe_eval_math(expression):
    tree = ast.parse(expression.strip(), mode="eval")
    return _eval_math_node(tree.body)


def execute_calculate(args):
    expression = args.get("expression")
    try:
        result = safe_eval_math(expression)
        return {"expression": expression, "result": result}
    except Exception:
        return {"expression": expression, "error": "Invalid expression"}


async def main():
    print("=" * 60)
    print("Gemini OpenAI-Compatible Tool Calls Examples")
    print("=" * 60)
    print()

    # Example 1: Basic tool call
    print("--- Example 1: Basic Tool Call ---")
    try:
        response = await chat_completion(
            [
                {"role": "system", "content": "You are a helpful assistant. Use the provided tools when appropriate."},
                {"role": "user", "content": "What is the weather in Tokyo?"}
            ],
            tools=[weather_tool],
            tool_choice="auto",
        )

        print("Response:")
        choice = response["choices"][0]
        print(f"Finish reason: {choice['finish_reason']}")

        tool_calls = choice["message"].get("tool_calls")
        if tool_calls:
            print("Tool calls:")
            for tool_call in tool_calls:
                print(f"  - {tool_call['function']['name']}({tool_call['function']['arguments']})")

                # Execute the tool
                args = json.loads(tool_call["function"]["arguments"])
                result = execute_weather(args)
                print(f"  Result: {json.dumps(result)}")
        else:
            print(f"Content: {choice['message'].get('content')}")
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Example 2: Multiple tools available
    print("--- Example 2: Multiple Tools Available ---")
    try:
        response = await chat_completion(
            [{"role": "user", "content": "What is 15 * 7 + 23?"}],
            tools=[weather_tool, calculator_tool],
            tool_choice="auto",
        )

        choice = response["choices"][0]
        tool_calls = choice["message"].get("tool_calls")
        if tool_calls:
            print("Tool calls:")
            for tool_call in tool_calls:
                print(f"  - {tool_call['function']['name']}({tool_call['function']['arguments']})")

                args = json.loads(tool_call["function"]["arguments"])
                if tool_call["function"]["name"] == "calculate":
                    result = execute_calculate(args)
                    print(f"  Result: {json.dumps(result)}")
        else:
            print(f"Content: {choice['message'].get('content')}")
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Example 3: Complete tool call conversation
    print("--- Example 3: Complete Tool Call Conversation ---")
    try:
        # Initial request
        response1 = await chat_completion(
            [{"role": "user", "content": "What is the weather in Paris?"}],
            tools=[weather_tool],
        )

        choice1 = response1["choices"][0]
        tool_calls = choice1["message"].get("tool_calls")

        if tool_calls:
            print("Step 1 - Model requested tool call:")
            print(f"  {tool_calls[0]['function']['name']}({tool_calls[0]['function']['arguments']})")

            # Execute tool and get result
            args = json.loads(tool_calls[0]["function"]["arguments"])
            tool_result = execute_weather(args)
            print(f"Step 2 - Tool result: {json.dumps(tool_result)}")

            # Continue conversation with tool result
            response2 = await chat_completion(
                [
                    {"role": "user", "content": "What is the weather in Paris?"},
                    {
                        "role": "assistant",
                        "content": None,
                        "tool_calls": tool_calls,
                    },
                    {
                        "role": "tool",
                        "tool_call_id": tool_calls[0]["id"],
                        "content": json.dumps(tool_result),
                    },
                ],
                tools=[weather_tool],
            )

            print("Step 3 - Final response:")
            print(response2["choices"][0]["message"]["content"])
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Example 4: Forced tool choice
    print("--- Example 4: Forced Tool Choice ---")
    try:
        response = await chat_completion(
            [{"role": "user", "content": "Tell me about the Eiffel Tower."}],
            tools=[weather_tool],
            tool_choice={"type": "function", "function": {"name": "get_weather"}},
        )

        choice = response["choices"][0]
        tool_calls = choice["message"].get("tool_calls")
        if tool_calls:
            print("Forced tool call:")
            for tool_call in tool_calls:
                print(f"  - {tool_call['function']['name']}({tool_call['function']['arguments']})")
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Example 5: Tool definition format
    print("--- Example 5: OpenAI Tool Definition Format ---")
    print("""
┌─────────────────────────────────────────────────────────────────┐
│                   OPENAI TOOL DEFINITION FORMAT                  │
├─────────────────────────────────────────────────────────────────┤
│ {                                                               │
│   "type": "function",                                           │
│   "function": {                                                 │
│     "name": "function_name",                                    │
│     "description": "What the function does",                    │
│     "parameters": {                                             │
│       "type": "object",                                         │
│       "properties": {                                           │
│         "param1": { "type": "string", "description": "..." },   │
│         "param2": { "type": "number", "description": "..." }    │
│       },                                                        │
│       "required": ["param1"]                                    │
│     }                                                           │
│   }                                                             │
│ }                                                               │
├─────────────────────────────────────────────────────────────────┤
│ Tool Choice Options:                                            │
│ • "auto" - Model decides whether to use tools                   │
│ • "none" - Model should not use any tools                       │
│ • "required" - Model must use a tool                            │
│ • {"type":"function","function":{"name":"X"}} - Force specific  │
└─────────────────────────────────────────────────────────────────┘
""")

    print("=" * 60)
    print("Tool Calls Examples Complete")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
