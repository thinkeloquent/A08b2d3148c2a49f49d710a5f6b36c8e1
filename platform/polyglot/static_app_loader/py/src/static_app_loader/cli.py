"""CLI commands for static app loader."""

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Dict

import yaml

from .sdk import validate_config
from .types import StaticLoaderOptions


def load_config_file(config_path: str) -> dict[str, Any]:
    """Load configuration from a YAML or JSON file."""
    path = Path(config_path)

    if not path.exists():
        raise FileNotFoundError(f"Config file not found: {config_path}")

    content = path.read_text(encoding="utf-8")

    if path.suffix in (".yaml", ".yml"):
        try:
            return yaml.safe_load(content)
        except ImportError:
            print("Warning: PyYAML not installed, trying JSON parser", file=sys.stderr)
            return json.loads(content)
    else:
        return json.loads(content)


def validate_command(args: argparse.Namespace) -> int:
    """Execute the validate command."""
    try:
        config = load_config_file(args.config)
    except FileNotFoundError as e:
        if args.json:
            print(json.dumps({"success": False, "errors": [str(e)]}))
        else:
            print(f"Error: {e}", file=sys.stderr)
        return 1
    except (json.JSONDecodeError, Exception) as e:
        if args.json:
            print(json.dumps({"success": False, "errors": [f"Invalid config file: {e}"]}))
        else:
            print(f"Error: Invalid config file: {e}", file=sys.stderr)
        return 1

    result = validate_config(config)

    if args.json:
        output = {"success": result["success"]}
        if result["success"]:
            output["data"] = result["data"].model_dump() if hasattr(result["data"], "model_dump") else result["data"]
        else:
            output["errors"] = result.get("errors", [])
        print(json.dumps(output, indent=2))
    else:
        if result["success"]:
            print("✓ Configuration is valid")
            data = result["data"]
            if isinstance(data, StaticLoaderOptions):
                print(f"  App Name: {data.app_name}")
                print(f"  Root Path: {data.root_path}")
                print(f"  SPA Mode: {data.spa_mode}")
                print(f"  Template Engine: {data.template_engine}")
                print(f"  URL Prefix: {data.url_prefix}")
                print(f"  Max Age: {data.max_age}s")
        else:
            print("✗ Configuration validation failed:", file=sys.stderr)
            for error in result.get("errors", []):
                print(f"  - {error}", file=sys.stderr)

    return 0 if result["success"] else 1


def main() -> None:
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        prog="static-app-loader",
        description="Static App Loader CLI - Validate and manage static app configurations",
    )
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Validate command
    validate_parser = subparsers.add_parser(
        "validate", help="Validate a configuration file"
    )
    validate_parser.add_argument(
        "--config",
        "-c",
        required=True,
        help="Path to configuration file (YAML or JSON)",
    )
    validate_parser.add_argument(
        "--json",
        "-j",
        action="store_true",
        help="Output results as JSON",
    )

    args = parser.parse_args()

    if args.command == "validate":
        sys.exit(validate_command(args))
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
