"""
CLI entry point for GitHub Component Usage Audit (Python).

Usage:
    python -m github_sdk_api_component_usage_audit.main \
        --component-name Accordion \
        --token $GITHUB_TOKEN \
        --max-pages 1
"""

from __future__ import annotations

import argparse
import asyncio
import json
import logging
import os
import sys

from env_resolver import resolve_github_env

from github_sdk_api_component_usage_audit.config import Config
from github_sdk_api_component_usage_audit.services.component_audit import ComponentUsageAudit


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse CLI arguments."""
    parser = argparse.ArgumentParser(
        prog="github_sdk_api_component_usage_audit",
        description="Audit real-world usage of a React UI component across public GitHub repositories.",
    )
    parser.add_argument(
        "--component-name",
        required=True,
        help="React component name to search for (e.g. Accordion)",
    )
    parser.add_argument(
        "--token",
        default=resolve_github_env().token,
        help="GitHub personal access token (default: $GITHUB_TOKEN)",
    )
    parser.add_argument(
        "--min-stars",
        type=int,
        default=500,
        help="Minimum stargazers for repo validation (default: 500)",
    )
    parser.add_argument(
        "--max-pages",
        type=int,
        default=10,
        help="Maximum search result pages, 1-10 (default: 10)",
    )
    parser.add_argument(
        "--min-file-size",
        type=int,
        default=1000,
        help="Minimum file size in bytes for search query (default: 1000)",
    )
    parser.add_argument(
        "--output-dir",
        default="./output",
        help="Output directory (default: ./output)",
    )
    parser.add_argument(
        "--format",
        choices=["json"],
        default="json",
        help="Output format (default: json)",
    )
    parser.add_argument(
        "--filename",
        default=None,
        help="Output filename (without extension)",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose logging",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Enable debug mode",
    )
    return parser.parse_args(argv)


async def run(args: argparse.Namespace) -> None:
    """Run the audit."""
    # Add polyglot paths
    root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    github_api_path = os.path.join(os.path.dirname(root), "github_api", "py")
    packages_py_path = os.path.join(os.path.dirname(os.path.dirname(root)), "packages_py")

    for p in (github_api_path, packages_py_path):
        if p not in sys.path:
            sys.path.insert(0, p)

    if not args.token:
        print("Error: --token or GITHUB_TOKEN environment variable is required", file=sys.stderr)
        sys.exit(1)

    # Configure logging
    log_level = logging.DEBUG if args.debug else (logging.INFO if args.verbose else logging.WARNING)
    logging.basicConfig(level=log_level, format="%(levelname)s %(name)s: %(message)s")

    config = Config(
        component_name=args.component_name,
        token=args.token,
        min_stars=args.min_stars,
        max_pages=args.max_pages,
        min_file_size=args.min_file_size,
        output_dir=args.output_dir,
        format=args.format,
        filename=args.filename,
        verbose=args.verbose,
        debug=args.debug,
    )

    from github_api.sdk.client import GitHubClient

    async with GitHubClient(token=config.token) as client:
        audit = ComponentUsageAudit(config)
        report = await audit.run(client)

    print(json.dumps(report["summary"], indent=2))


def main(argv: list[str] | None = None) -> None:
    """CLI entry point."""
    args = parse_args(argv)
    asyncio.run(run(args))


if __name__ == "__main__":
    main()
