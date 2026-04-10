"""CLI entry point for extract_imports_text_based_notation.

Usage:
    python -m extract_imports_text_based_notation --file path/to/source.py --mode imports
    cat source.py | python -m extract_imports_text_based_notation --mode exports
"""

import argparse
import json
import sys

from .extractor import extract_exports, extract_imports


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="extract-imports",
        description="Extract import/export declarations from Python source code.",
    )
    parser.add_argument(
        "--file",
        type=str,
        default=None,
        help="Path to the Python source file. Reads from stdin if omitted.",
    )
    parser.add_argument(
        "--mode",
        choices=["imports", "exports", "both"],
        default="both",
        help="What to extract: imports, exports, or both (default: both).",
    )

    args = parser.parse_args()

    # Read source code
    if args.file:
        with open(args.file, encoding="utf-8") as f:
            code = f.read()
    else:
        code = sys.stdin.read()

    output: dict[str, list[tuple[str, list[str]]]] = {}

    if args.mode in ("imports", "both"):
        output["imports"] = extract_imports(code)

    if args.mode in ("exports", "both"):
        output["exports"] = extract_exports(code)

    json.dump(output, sys.stdout, indent=2)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
