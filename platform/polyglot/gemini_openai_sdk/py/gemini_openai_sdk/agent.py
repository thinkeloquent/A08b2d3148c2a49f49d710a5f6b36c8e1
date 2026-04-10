"""
Agent Module - LLM Agent-Friendly API

Provides a simplified API surface for LLM agent integration.
Single dispatch function for all operations.
"""

import asyncio
from typing import Any, Dict, List, Optional

from .gemini_client import GeminiClient
from .logger import create

logger = create("gemini_openai_sdk", __file__)

# Singleton client for agent use
_agent_client: Optional[GeminiClient] = None


def get_client() -> GeminiClient:
    """Get or create singleton client."""
    global _agent_client
    if _agent_client is None:
        _agent_client = GeminiClient()
    return _agent_client


def set_client(client: GeminiClient) -> None:
    """Set custom client for agent use."""
    global _agent_client
    _agent_client = client


async def invoke_async(action: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Invoke SDK action asynchronously.

    Args:
        action: Action name ("chat", "stream", "structure", "tool_call", "conversation")
        params: Parameters for the action

    Returns:
        Result dictionary with success status and data
    """
    logger.debug("invoke_async: enter", action=action)

    client = get_client()

    try:
        if action == "chat":
            prompt = params.get("prompt", "")
            result = await client.chat(
                prompt=prompt,
                model=params.get("model"),
                temperature=params.get("temperature"),
                max_tokens=params.get("max_tokens"),
                use_system_prompt=params.get("use_system_prompt", True),
            )

        elif action == "chat_messages":
            messages = params.get("messages", [])
            result = await client.chat_messages(
                messages=messages,
                model=params.get("model"),
                temperature=params.get("temperature"),
                max_tokens=params.get("max_tokens"),
            )

        elif action == "stream":
            prompt = params.get("prompt", "")
            result = await client.stream(
                prompt=prompt,
                model=params.get("model"),
                temperature=params.get("temperature"),
            )

        elif action == "structure":
            prompt = params.get("prompt", "")
            schema = params.get("schema", {})
            result = await client.structure(
                prompt=prompt,
                schema=schema,
                model=params.get("model"),
            )

        elif action == "tool_call":
            prompt = params.get("prompt", "")
            tools = params.get("tools")
            result = await client.tool_call(
                prompt=prompt,
                tools=tools,
                model=params.get("model"),
            )

        elif action == "schema_mapping":
            prompt = params.get("prompt", "")
            schema = params.get("schema", {})
            result = await client.schema_mapping(
                prompt=prompt,
                schema=schema,
                model=params.get("model"),
            )

        elif action == "conversation":
            messages = params.get("messages", [])
            result = await client.conversation(
                messages=messages,
                model=params.get("model"),
                temperature=params.get("temperature"),
                max_tokens=params.get("max_tokens"),
            )

        elif action == "json_mode":
            prompt = params.get("prompt", "")
            result = await client.json_mode(
                prompt=prompt,
                model=params.get("model"),
            )

        elif action == "health":
            return client.health_check()

        else:
            logger.warn("invoke_async: unknown action", action=action)
            return {
                "success": False,
                "error": f"Unknown action: {action}",
                "available_actions": [
                    "chat", "chat_messages", "stream", "structure",
                    "tool_call", "schema_mapping", "conversation", "json_mode", "health"
                ],
            }

        response = result.to_dict()
        logger.info("invoke_async: success", action=action)
        return response

    except Exception as e:
        logger.error("invoke_async: failed", action=action, error=str(e))
        return {
            "success": False,
            "error": str(e),
        }


def invoke(action: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Invoke SDK action synchronously.

    Wrapper around invoke_async for sync contexts.

    Args:
        action: Action name
        params: Parameters for the action

    Returns:
        Result dictionary
    """
    params = params or {}
    return asyncio.run(invoke_async(action, params))


# =============================================================================
# Action Metadata for Agent Discovery
# =============================================================================

ACTION_METADATA: Dict[str, Dict[str, Any]] = {
    "chat": {
        "description": "Send a chat message and get a response",
        "params": {
            "prompt": {"type": "string", "required": True},
            "model": {"type": "string", "default": "flash"},
            "temperature": {"type": "number", "default": 0.7},
            "max_tokens": {"type": "integer", "default": 1000},
            "use_system_prompt": {"type": "boolean", "default": True},
        },
    },
    "stream": {
        "description": "Stream a chat response (returns accumulated result)",
        "params": {
            "prompt": {"type": "string", "required": True},
            "model": {"type": "string", "default": "flash"},
            "temperature": {"type": "number", "default": 0.8},
        },
    },
    "structure": {
        "description": "Get structured JSON output matching a schema",
        "params": {
            "prompt": {"type": "string", "required": True},
            "schema": {"type": "object", "required": True},
            "model": {"type": "string", "default": "flash"},
        },
    },
    "tool_call": {
        "description": "Execute with function calling (tools)",
        "params": {
            "prompt": {"type": "string", "required": True},
            "tools": {"type": "array", "default": "built-in tools"},
            "model": {"type": "string", "default": "flash"},
        },
    },
    "conversation": {
        "description": "Multi-turn conversation with message history",
        "params": {
            "messages": {"type": "array", "required": True},
            "model": {"type": "string", "default": "flash"},
            "temperature": {"type": "number", "default": 0.7},
            "max_tokens": {"type": "integer", "default": 1000},
        },
    },
    "json_mode": {
        "description": "Request JSON object response",
        "params": {
            "prompt": {"type": "string", "required": True},
            "model": {"type": "string", "default": "flash"},
        },
    },
    "health": {
        "description": "Check SDK health and configuration",
        "params": {},
    },
}


def get_action_metadata() -> Dict[str, Dict[str, Any]]:
    """Get metadata for all available actions (useful for agent discovery)."""
    return ACTION_METADATA


def list_actions() -> List[str]:
    """List available action names."""
    return list(ACTION_METADATA.keys())
