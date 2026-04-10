#!/usr/bin/env python3
"""
python .bin/data_repo_remap001.py

Remaps the older repo.json format to the new seed-compatible structure.

Old format (per entry):
    name, owner, repo, url, tags, stars? (string like "19.8k")

New format (per entry):
    name, description, type, githubUrl, packageUrl, stars, forks, version,
    maintainer, lastUpdated, trending, verified, language, license, size,
    dependencies, healthScore, status, tags, documentation

Fields that cannot be derived from the old format are set to empty-string
placeholders so they can be filled in later.

Usage:
    python .bin/data_repo_remap001.py                          # stdout
    python .bin/data_repo_remap001.py -o common/data/repo.json # write file
    python .bin/data_repo_remap001.py -i custom/input.json     # custom input
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

PLATFORM_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_INPUT = PLATFORM_ROOT / "common" / "data" / "repo.json"


def parse_stars(raw_stars) -> int:
    """Convert a stars value (int, string like '19.8k', or None) to an integer."""
    if raw_stars is None:
        return 0
    if isinstance(raw_stars, (int, float)):
        return int(raw_stars)
    s = str(raw_stars).strip().lower()
    match = re.match(r"^([\d.]+)\s*k$", s)
    if match:
        return int(float(match.group(1)) * 1000)
    try:
        return int(s.replace(",", ""))
    except ValueError:
        return 0


def remap_entry(old: dict) -> dict:
    """Map one old-format entry to the new seed-compatible structure."""
    name = old.get("name", "")
    owner = old.get("owner", "")
    repo = old.get("repo", "")
    url = old.get("url", "")
    tags = old.get("tags", [])

    # Derive githubUrl from url or reconstruct from owner/repo
    github_url = url if url else (f"https://github.com/{owner}/{repo}" if owner and repo else "")

    # Derive maintainer from owner if available
    maintainer = owner if owner else ""

    return {
        "name": name,
        "description": "",
        "type": "npm",
        "githubUrl": github_url,
        "packageUrl": "",
        "stars": parse_stars(old.get("stars")),
        "forks": 0,
        "version": "",
        "maintainer": maintainer,
        "lastUpdated": "",
        "trending": False,
        "verified": False,
        "language": "",
        "license": "",
        "size": "",
        "dependencies": None,
        "healthScore": None,
        "status": "stable",
        "tags": tags,
        "documentation": [],
    }


def main():
    parser = argparse.ArgumentParser(
        description="Remap old repo.json format to new seed-compatible structure."
    )
    parser.add_argument(
        "-i", "--input",
        type=Path,
        default=DEFAULT_INPUT,
        help=f"Input JSON file (default: {DEFAULT_INPUT.relative_to(PLATFORM_ROOT)})",
    )
    parser.add_argument(
        "-o", "--output",
        type=Path,
        default=None,
        help="Output file path (default: stdout). Relative paths resolve from platform root.",
    )
    args = parser.parse_args()

    input_path: Path = args.input
    if not input_path.is_absolute():
        input_path = PLATFORM_ROOT / input_path

    if not input_path.exists():
        print(f"Error: input file not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    old_entries = json.loads(input_path.read_text(encoding="utf-8"))
    new_entries = [remap_entry(entry) for entry in old_entries]
    output_json = json.dumps(new_entries, indent=2, ensure_ascii=False) + "\n"

    output_path: Path | None = args.output
    if output_path is None:
        print(output_json, end="")
    else:
        if not output_path.is_absolute():
            output_path = PLATFORM_ROOT / output_path
        output_path.write_text(output_json, encoding="utf-8")
        print(f"Wrote {len(new_entries)} entries to {output_path}", file=sys.stderr)


if __name__ == "__main__":
    main()
