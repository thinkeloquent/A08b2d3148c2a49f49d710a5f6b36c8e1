"""argparse CLI for the API health check tool."""

from __future__ import annotations

import argparse
from pathlib import Path

_DEFAULT_CONFIG_DIR = Path(__file__).parent / "config"


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="internal_api_health_check",
        description="Test registered API endpoints across Fastify and FastAPI servers.",
    )
    p.add_argument(
        "--suite",
        action="append",
        dest="suites",
        metavar="NAME",
        help="Run only the named suite(s). Can be repeated. (default: all)",
    )
    p.add_argument(
        "--server",
        action="append",
        dest="servers",
        metavar="NAME",
        help="Run only against the named server(s). Can be repeated. (default: all)",
    )
    p.add_argument(
        "--var",
        action="append",
        dest="vars",
        metavar="KEY=VALUE",
        help="Override a path variable (e.g. --var owner=myorg). Can be repeated.",
    )
    p.add_argument(
        "--base-url",
        metavar="URL",
        help="Override base URL for all servers (e.g. http://localhost:8000).",
    )
    p.add_argument(
        "--config-dir",
        type=Path,
        default=_DEFAULT_CONFIG_DIR,
        metavar="DIR",
        help=f"Path to config directory (default: {_DEFAULT_CONFIG_DIR})",
    )
    p.add_argument(
        "--timeout",
        type=float,
        metavar="SEC",
        help="Override per-test timeout in seconds.",
    )
    p.add_argument(
        "--concurrency",
        type=int,
        default=5,
        metavar="N",
        help="Max concurrent requests (default: 5).",
    )
    p.add_argument(
        "--output",
        choices=["console", "json"],
        default="console",
        help="Output format (default: console).",
    )
    p.add_argument(
        "--output-file",
        metavar="FILE",
        help="Write JSON results to FILE (implies --output json).",
    )
    p.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Show error details and expected/actual status on failures.",
    )
    p.add_argument(
        "--dry-run",
        action="store_true",
        help="Show resolved URLs without executing requests.",
    )
    return p


def parse_vars(raw: list[str] | None) -> dict[str, str]:
    """Parse --var KEY=VALUE pairs into a dict."""
    if not raw:
        return {}
    result = {}
    for item in raw:
        if "=" not in item:
            raise argparse.ArgumentTypeError(f"Invalid --var format: {item!r}  (expected KEY=VALUE)")
        key, value = item.split("=", 1)
        result[key.strip()] = value.strip()
    return result
