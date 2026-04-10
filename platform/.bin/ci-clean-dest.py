#!/usr/bin/env python3
"""Clean directory contents before sync.

Usage: ci-clean-dest.py <dest_dir>

Removes all contents of dest_dir without removing the directory itself.
Creates dest_dir if it doesn't exist. Used as a pre-step for rsync sync
to avoid macOS rsync --delete "not empty, cannot delete" errors.
"""

import shutil
import sys
from pathlib import Path


def main() -> int:
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <dest_dir>", file=sys.stderr)
        return 1

    dest = Path(sys.argv[1])

    if dest.is_dir():
        for child in dest.iterdir():
            if child.is_dir():
                shutil.rmtree(child)
            else:
                child.unlink()

    dest.mkdir(parents=True, exist_ok=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
