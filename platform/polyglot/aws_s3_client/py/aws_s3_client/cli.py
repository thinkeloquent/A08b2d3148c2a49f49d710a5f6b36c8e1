"""
CLI Entry Point for AWS S3 Client

Provides command-line interface for S3 storage operations.

Usage:
    aws-s3-client save --bucket my-bucket < data.json
    aws-s3-client load --bucket my-bucket abc123
    aws-s3-client list --bucket my-bucket
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from typing import Any

from aws_s3_client.config import SDKConfig
from aws_s3_client.logger import create as create_logger
from aws_s3_client.sdk import create_sdk

logger = create_logger("aws_s3_client.cli", __file__)


def create_parser() -> argparse.ArgumentParser:
    """Create the argument parser."""
    parser = argparse.ArgumentParser(
        prog="aws-s3-client",
        description="AWS S3 JSON storage CLI",
    )

    # Global options
    parser.add_argument(
        "--bucket",
        required=True,
        help="S3 bucket name",
    )
    parser.add_argument(
        "--region",
        default="us-east-1",
        help="AWS region (default: us-east-1)",
    )
    parser.add_argument(
        "--prefix",
        default="jss3:",
        help="Key prefix (default: jss3:)",
    )
    parser.add_argument(
        "--ttl",
        type=int,
        default=None,
        help="Default TTL in seconds",
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable verbose logging",
    )
    parser.add_argument(
        "--endpoint-url",
        default=None,
        help="Custom S3 endpoint URL (for LocalStack, etc.)",
    )

    # Subcommands
    subparsers = parser.add_subparsers(dest="command", required=True)

    # save command
    save_parser = subparsers.add_parser("save", help="Save JSON data")
    save_parser.add_argument(
        "--ttl",
        type=int,
        default=None,
        help="TTL for this save (overrides default)",
    )

    # load command
    load_parser = subparsers.add_parser("load", help="Load JSON data")
    load_parser.add_argument("key", help="Storage key")

    # delete command
    delete_parser = subparsers.add_parser("delete", help="Delete object")
    delete_parser.add_argument("key", help="Storage key")

    # exists command
    exists_parser = subparsers.add_parser("exists", help="Check if object exists")
    exists_parser.add_argument("key", help="Storage key")

    # list command
    subparsers.add_parser("list", help="List all keys")

    # clear command
    subparsers.add_parser("clear", help="Delete all objects")

    # stats command
    subparsers.add_parser("stats", help="Show operation statistics")

    # debug command
    subparsers.add_parser("debug", help="Show debug information")

    return parser


async def run_command(args: argparse.Namespace) -> dict[str, Any]:
    """Run the specified command."""
    config = SDKConfig(
        bucket_name=args.bucket,
        region=args.region,
        key_prefix=args.prefix,
        ttl=args.ttl,
        debug=args.verbose,
        endpoint_url=args.endpoint_url,
    )

    if args.verbose:
        logger.info(f"CLI: command={args.command}, bucket={args.bucket}")

    async with create_sdk(config) as sdk:
        if args.command == "save":
            # Read JSON from stdin
            input_data = sys.stdin.read()
            try:
                data = json.loads(input_data)
            except json.JSONDecodeError as e:
                return {"success": False, "error": f"Invalid JSON: {e}"}

            ttl = getattr(args, "ttl", None)
            response = await sdk.save(data, ttl=ttl)
            return response.to_dict()

        elif args.command == "load":
            response = await sdk.load(args.key)
            return response.to_dict()

        elif args.command == "delete":
            response = await sdk.delete(args.key)
            return response.to_dict()

        elif args.command == "exists":
            response = await sdk.exists(args.key)
            return response.to_dict()

        elif args.command == "list":
            response = await sdk.list_keys()
            return response.to_dict()

        elif args.command == "clear":
            response = await sdk.clear()
            return response.to_dict()

        elif args.command == "stats":
            response = await sdk.stats()
            return response.to_dict()

        elif args.command == "debug":
            response = await sdk.debug_info()
            return response.to_dict()

        else:
            return {"success": False, "error": f"Unknown command: {args.command}"}


def main() -> None:
    """Main entry point."""
    parser = create_parser()
    args = parser.parse_args()

    try:
        result = asyncio.run(run_command(args))
        print(json.dumps(result, indent=2))

        if not result.get("success", True):
            sys.exit(1)

    except KeyboardInterrupt:
        print("\nInterrupted")
        sys.exit(130)
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}, indent=2))
        sys.exit(1)


if __name__ == "__main__":
    main()
