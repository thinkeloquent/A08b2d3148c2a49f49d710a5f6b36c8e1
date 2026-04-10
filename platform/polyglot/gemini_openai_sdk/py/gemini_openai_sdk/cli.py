"""
CLI Module - Command Line Interface

Provides command-line access to SDK functionality.

Usage:
    gemini-openai chat "What is the capital of France?"
    gemini-openai stream "Write a haiku"
    gemini-openai structure "Generate a weather report" --schema-file schema.json
"""

import argparse
import asyncio
import json
import sys
from typing import Optional

from .gemini_client import GeminiClient
from .logger import create

logger = create("gemini_openai_sdk", __file__)


def create_parser() -> argparse.ArgumentParser:
    """Create argument parser for CLI."""
    parser = argparse.ArgumentParser(
        prog="gemini-openai",
        description="Gemini OpenAI SDK - Command Line Interface",
    )

    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Enable verbose logging",
    )

    parser.add_argument(
        "--model",
        default="flash",
        choices=["flash", "pro"],
        help="Model to use (default: flash)",
    )

    parser.add_argument(
        "--temperature",
        type=float,
        default=None,
        help="Sampling temperature (0.0-2.0)",
    )

    parser.add_argument(
        "--max-tokens",
        type=int,
        default=None,
        help="Maximum tokens in response",
    )

    parser.add_argument(
        "--format",
        choices=["text", "json"],
        default="text",
        help="Output format (default: text)",
    )

    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Chat command
    chat_parser = subparsers.add_parser("chat", help="Send a chat message")
    chat_parser.add_argument("prompt", help="The prompt to send")

    # Stream command
    stream_parser = subparsers.add_parser("stream", help="Stream a chat response")
    stream_parser.add_argument("prompt", help="The prompt to send")

    # Structure command
    structure_parser = subparsers.add_parser("structure", help="Get structured JSON output")
    structure_parser.add_argument("prompt", help="The prompt to send")
    structure_parser.add_argument(
        "--schema-file",
        help="Path to JSON schema file",
    )
    structure_parser.add_argument(
        "--schema",
        help="Inline JSON schema",
    )

    # Tool call command
    tool_parser = subparsers.add_parser("tool-call", help="Execute with tool calling")
    tool_parser.add_argument("prompt", help="The prompt to send")

    # Health command
    subparsers.add_parser("health", help="Check SDK health status")

    return parser


async def cmd_chat(client: GeminiClient, args: argparse.Namespace) -> dict:
    """Execute chat command."""
    result = await client.chat(
        prompt=args.prompt,
        model=args.model,
        temperature=args.temperature,
        max_tokens=args.max_tokens,
    )
    return result.to_dict()


async def cmd_stream(client: GeminiClient, args: argparse.Namespace) -> dict:
    """Execute stream command."""
    result = await client.stream(
        prompt=args.prompt,
        model=args.model,
        temperature=args.temperature,
    )
    return result.to_dict()


async def cmd_structure(client: GeminiClient, args: argparse.Namespace) -> dict:
    """Execute structure command."""
    schema = None

    if args.schema_file:
        with open(args.schema_file) as f:
            schema = json.load(f)
    elif args.schema:
        schema = json.loads(args.schema)
    else:
        # Default schema
        schema = {
            "type": "object",
            "properties": {
                "result": {"type": "string"},
            },
            "required": ["result"],
        }

    result = await client.structure(
        prompt=args.prompt,
        schema=schema,
        model=args.model,
    )
    return result.to_dict()


async def cmd_tool_call(client: GeminiClient, args: argparse.Namespace) -> dict:
    """Execute tool-call command."""
    result = await client.tool_call(
        prompt=args.prompt,
        model=args.model,
    )
    return result.to_dict()


def cmd_health(client: GeminiClient) -> dict:
    """Execute health command."""
    return client.health_check()


async def async_main(args: argparse.Namespace) -> int:
    """Async main entry point."""
    if args.verbose:
        import os
        os.environ["LOG_LEVEL"] = "DEBUG"

    client = GeminiClient(model=args.model)

    result: Optional[dict] = None

    if args.command == "chat":
        result = await cmd_chat(client, args)
    elif args.command == "stream":
        result = await cmd_stream(client, args)
    elif args.command == "structure":
        result = await cmd_structure(client, args)
    elif args.command == "tool-call":
        result = await cmd_tool_call(client, args)
    elif args.command == "health":
        result = cmd_health(client)
    else:
        print("No command specified. Use --help for usage.", file=sys.stderr)
        return 1

    # Output result
    if result:
        if args.format == "json":
            print(json.dumps(result, indent=2))
        else:
            if result.get("success", True):
                content = result.get("content") or result.get("parsed") or result
                if isinstance(content, dict):
                    print(json.dumps(content, indent=2))
                else:
                    print(content)
            else:
                print(f"Error: {result.get('error', 'Unknown error')}", file=sys.stderr)
                return 1

    return 0


def main() -> int:
    """Main entry point for CLI."""
    parser = create_parser()
    args = parser.parse_args()

    logger.debug("cli: starting", command=args.command)

    try:
        return asyncio.run(async_main(args))
    except KeyboardInterrupt:
        print("\nInterrupted", file=sys.stderr)
        return 130
    except Exception as e:
        logger.error("cli: unhandled error", error=str(e))
        print(f"Error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
