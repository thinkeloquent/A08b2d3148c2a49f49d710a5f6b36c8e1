#!/usr/bin/env python3
"""
Gemini OpenAI SDK - Basic Usage Examples (Python)

This script demonstrates the core features of the gemini-openai-sdk package.
Each example is self-contained and shows a different capability.

Requirements:
    - GEMINI_API_KEY environment variable set
    - Python 3.11+
    - gemini-openai-sdk package installed

Usage:
    python basic_usage.py
"""

import asyncio
import os
import sys

# Add parent directory for development
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from gemini_openai_sdk import GeminiClient
from gemini_openai_sdk.agent import get_action_metadata, invoke
from gemini_openai_sdk.logger import create

# Create logger for examples
logger = create("examples", __file__)


# =============================================================================
# Example 1: Simple Chat
# =============================================================================
async def example1_simple_chat():
    """
    Basic chat completion with a single prompt.

    This is the simplest way to interact with the Gemini API.
    """
    print("\n" + "=" * 60)
    print("Example 1: Simple Chat")
    print("=" * 60)

    client = GeminiClient()

    # Check if API key is configured
    health = client.health_check()
    if health["status"] != "healthy":
        print("⚠️  API key not configured. Set GEMINI_API_KEY environment variable.")
        return

    result = await client.chat("What is the capital of France?")

    if result["success"]:
        print(f"Response: {result['content']}")
        print(f"Model: {result.get('model', 'unknown')}")
        print(f"Execution time: {result.get('execution_time_ms', 0):.0f}ms")
    else:
        print(f"Error: {result['error']}")


# =============================================================================
# Example 2: Streaming Response
# =============================================================================
async def example2_streaming():
    """
    Stream a chat response for real-time output.

    Streaming is useful for long responses where you want to show
    progress to the user as the model generates text.
    """
    print("\n" + "=" * 60)
    print("Example 2: Streaming Response")
    print("=" * 60)

    client = GeminiClient()

    health = client.health_check()
    if health["status"] != "healthy":
        print("⚠️  API key not configured.")
        return

    result = await client.stream("Tell me a short joke.")

    if result["success"]:
        print(f"Streamed response: {result['content']}")
        print(f"Chunks received: {result.get('chunk_count', 0)}")
    else:
        print(f"Error: {result['error']}")


# =============================================================================
# Example 3: Structured Output
# =============================================================================
async def example3_structured_output():
    """
    Get structured JSON output matching a schema.

    This is useful when you need the model to return data
    in a specific format for programmatic processing.
    """
    print("\n" + "=" * 60)
    print("Example 3: Structured Output")
    print("=" * 60)

    client = GeminiClient()

    health = client.health_check()
    if health["status"] != "healthy":
        print("⚠️  API key not configured.")
        return

    schema = {
        "type": "object",
        "properties": {
            "name": {"type": "string"},
            "population": {"type": "integer"},
            "country": {"type": "string"}
        },
        "required": ["name", "population", "country"]
    }

    result = await client.structure(
        "Extract information about Paris from: Paris is the capital of France with a population of about 2.1 million.",
        schema
    )

    if result["success"]:
        print(f"Raw content: {result['content']}")
        print(f"Parsed data: {result.get('parsed', {})}")
    else:
        print(f"Error: {result['error']}")


# =============================================================================
# Example 4: Tool Calling
# =============================================================================
async def example4_tool_calling():
    """
    Use function calling to execute tools.

    The model can decide to call functions you define,
    allowing for agentic interactions.
    """
    print("\n" + "=" * 60)
    print("Example 4: Tool Calling")
    print("=" * 60)

    client = GeminiClient()

    health = client.health_check()
    if health["status"] != "healthy":
        print("⚠️  API key not configured.")
        return

    result = await client.tool_call("What is the weather in San Francisco?")

    if result["success"]:
        print(f"Finish reason: {result.get('finish_reason', 'unknown')}")
        if result.get("tool_calls"):
            for tool in result["tool_calls"]:
                print(f"  Tool: {tool['function']}")
                print(f"  Arguments: {tool['arguments']}")
                print(f"  Result: {tool['result']}")
        else:
            print(f"Response: {result.get('content', 'No content')}")
    else:
        print(f"Error: {result['error']}")


# =============================================================================
# Example 5: Multi-turn Conversation
# =============================================================================
async def example5_conversation():
    """
    Have a multi-turn conversation with context.

    The conversation method maintains message history,
    allowing for contextual follow-up questions.
    """
    print("\n" + "=" * 60)
    print("Example 5: Multi-turn Conversation")
    print("=" * 60)

    client = GeminiClient()

    health = client.health_check()
    if health["status"] != "healthy":
        print("⚠️  API key not configured.")
        return

    messages = [
        {"role": "user", "content": "My name is Alice."},
        {"role": "assistant", "content": "Hello Alice! Nice to meet you."},
        {"role": "user", "content": "What is my name?"}
    ]

    result = await client.conversation(messages)

    if result["success"]:
        print(f"Response: {result.get('assistant_message', {}).get('content', 'No response')}")
    else:
        print(f"Error: {result['error']}")


# =============================================================================
# Example 6: JSON Mode
# =============================================================================
async def example6_json_mode():
    """
    Request a JSON object response.

    JSON mode ensures the model returns valid JSON,
    useful for data extraction tasks.
    """
    print("\n" + "=" * 60)
    print("Example 6: JSON Mode")
    print("=" * 60)

    client = GeminiClient()

    health = client.health_check()
    if health["status"] != "healthy":
        print("⚠️  API key not configured.")
        return

    result = await client.json_mode(
        "Return a JSON object with three programming languages and their paradigms."
    )

    if result["success"]:
        print(f"Raw: {result['content']}")
        print(f"Parsed: {result.get('parsed', {})}")
    else:
        print(f"Error: {result['error']}")


# =============================================================================
# Example 7: Agent API
# =============================================================================
async def example7_agent_api():
    """
    Use the Agent API for LLM-friendly interactions.

    The Agent API provides a simplified interface that's
    easy for other LLMs or automation tools to use.
    """
    print("\n" + "=" * 60)
    print("Example 7: Agent API")
    print("=" * 60)

    # List available actions
    print("Available actions:")
    metadata = get_action_metadata()
    for action, info in metadata.items():
        print(f"  - {action}: {info['description']}")

    # Invoke an action
    result = await invoke("health")
    print(f"\nHealth check: {result}")


# =============================================================================
# Example 8: Custom Model Selection
# =============================================================================
async def example8_model_selection():
    """
    Use different model variants.

    Available models: flash (fast), pro (capable), thinking (reasoning)
    """
    print("\n" + "=" * 60)
    print("Example 8: Model Selection")
    print("=" * 60)

    health = GeminiClient().health_check()
    if health["status"] != "healthy":
        print("⚠️  API key not configured.")
        return

    models = ["flash", "pro"]

    for model in models:
        print(f"\nUsing model: {model}")
        client = GeminiClient(model=model)
        result = await client.chat("Say 'Hello from {model}!' where {model} is your model name.")

        if result["success"]:
            print(f"  Response: {result['content'][:100]}...")
        else:
            print(f"  Error: {result['error']}")


# =============================================================================
# Main Runner
# =============================================================================
async def main():
    """Run all examples sequentially."""
    print("Gemini OpenAI SDK - Python Examples")
    print("=" * 60)

    examples = [
        example1_simple_chat,
        example2_streaming,
        example3_structured_output,
        example4_tool_calling,
        example5_conversation,
        example6_json_mode,
        example7_agent_api,
        example8_model_selection,
    ]

    for example in examples:
        try:
            await example()
        except Exception as e:
            print(f"Error in {example.__name__}: {e}")

    print("\n" + "=" * 60)
    print("All examples completed!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
