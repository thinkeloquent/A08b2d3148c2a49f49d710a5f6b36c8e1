#!/usr/bin/env python3
"""
Copy [tool.poetry.dependencies] from source pyproject.toml (A) to target pyproject.toml (B).

Usage:
    pyproject-poetry-dep-copy <source> <target> [--dry-run]

The source's [tool.poetry.dependencies] section replaces the target's section entirely.
If the target has no [tool.poetry.dependencies] section, one is created.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


SECTION_HEADER = "[tool.poetry.dependencies]"


def extract_section(content: str) -> str | None:
    """Extract the raw text of [tool.poetry.dependencies] from a pyproject.toml string.

    Returns the lines between the header and the next [section] (exclusive),
    or None if the section is not found.
    """
    lines = content.splitlines(keepends=True)
    start_idx = None

    for i, line in enumerate(lines):
        if line.strip() == SECTION_HEADER:
            start_idx = i
            continue
        if start_idx is not None and line.strip().startswith("["):
            # Found the next section — return everything between header and here
            return "".join(lines[start_idx + 1 : i])

    # Section found but runs to end of file
    if start_idx is not None:
        return "".join(lines[start_idx + 1 :])

    return None


def replace_section(target_content: str, new_deps: str) -> str:
    """Replace [tool.poetry.dependencies] in target_content with new_deps.

    If the section doesn't exist, it is appended before [build-system] or at EOF.
    """
    lines = target_content.splitlines(keepends=True)
    start_idx = None
    end_idx = None

    for i, line in enumerate(lines):
        if line.strip() == SECTION_HEADER:
            start_idx = i
            continue
        if start_idx is not None and end_idx is None and line.strip().startswith("["):
            end_idx = i
            break

    if start_idx is not None:
        # Replace existing section (keep header, replace body up to next section)
        if end_idx is None:
            end_idx = len(lines)
        before = lines[: start_idx + 1]
        after = lines[end_idx:]
        return "".join(before) + new_deps + "".join(after)

    # Section doesn't exist — insert before [build-system] or append
    insert_block = f"\n{SECTION_HEADER}\n{new_deps}"
    for i, line in enumerate(lines):
        if line.strip() == "[build-system]":
            before = lines[:i]
            after = lines[i:]
            return "".join(before) + insert_block + "\n" + "".join(after)

    # Append at end
    if not target_content.endswith("\n"):
        insert_block = "\n" + insert_block
    return target_content + insert_block


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Copy [tool.poetry.dependencies] from source pyproject.toml to target"
    )
    parser.add_argument("source", type=Path, help="Source pyproject.toml (A) to read from")
    parser.add_argument("target", type=Path, help="Target pyproject.toml (B) to write to")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show the result without modifying the target file",
    )
    args = parser.parse_args()

    source_path: Path = args.source.resolve()
    target_path: Path = args.target.resolve()

    if not source_path.exists():
        print(f"ERROR: Source file not found: {source_path}", file=sys.stderr)
        sys.exit(1)
    if not target_path.exists():
        print(f"ERROR: Target file not found: {target_path}", file=sys.stderr)
        sys.exit(1)

    source_content = source_path.read_text()
    target_content = target_path.read_text()

    deps_body = extract_section(source_content)
    if deps_body is None:
        print(f"ERROR: No {SECTION_HEADER} section found in {source_path}", file=sys.stderr)
        sys.exit(1)

    new_content = replace_section(target_content, deps_body)

    if new_content == target_content:
        print("Target is already up to date — no changes needed.")
        return

    if args.dry_run:
        print("--- DRY RUN: would write the following to target ---")
        # Show just the replaced section for clarity
        replaced_deps = extract_section(new_content)
        print(f"{SECTION_HEADER}")
        if replaced_deps:
            print(replaced_deps.rstrip())
        print(f"\nDRY RUN: {target_path} was NOT modified.")
    else:
        target_path.write_text(new_content)
        dep_count = sum(
            1
            for line in deps_body.splitlines()
            if line.strip() and not line.strip().startswith("#")
        )
        print(f"Copied {dep_count} dependencies from {source_path.name} to {target_path.name}")


if __name__ == "__main__":
    main()
