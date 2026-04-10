"""Thin argparse wrapper for file_compare_diff_snapshot."""

import argparse
import sys
from pathlib import Path

from . import __version__
from .core import clean_snapshot, run


def create_parser():
    """Build argument parser."""
    parser = argparse.ArgumentParser(
        prog="file-compare-diff-snapshot",
        description="Compare files between two directories, hash diffs, and verify snapshot stability.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""\
Exit codes:
  0  Snapshot created or verified successfully
  1  Snapshot mismatch detected
  2  Runtime error

Examples:
  %(prog)s ./src ./ref -g "**/*.py"
  %(prog)s ./src ./ref --clean
  %(prog)s ./src ./ref -g "**/*.py" -v
""",
    )

    parser.add_argument("dir_a", help="Directory to scan (source)")
    parser.add_argument("dir_b", help="Reference directory (match by relative path)")

    parser.add_argument(
        "-g", "--glob",
        metavar="PATTERN",
        default=None,
        help='Filter files in dir_a (e.g. "**/*.py")',
    )
    parser.add_argument(
        "--cache-dir",
        metavar="PATH",
        default=None,
        help="Override cache directory",
    )
    parser.add_argument(
        "--clean",
        action="store_true",
        help="Remove cached snapshot for this dir_a/dir_b pair",
    )
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Verbose output",
    )
    parser.add_argument(
        "--version",
        action="version",
        version=f"%(prog)s {__version__}",
    )

    return parser


def resolve_cache_dir(override=None):
    """Walk up to find .git for project root, default cache dir under it."""
    if override:
        return Path(override)

    current = Path.cwd()
    while current != current.parent:
        if (current / ".git").exists():
            return current / ".cache" / "file_compare_diff_snapshot"
        current = current.parent

    # Fallback: use cwd
    return Path.cwd() / ".cache" / "file_compare_diff_snapshot"


def main():
    """Parse args and delegate to core."""
    parser = create_parser()
    args = parser.parse_args()

    cache_dir = resolve_cache_dir(args.cache_dir)

    if args.clean:
        removed = clean_snapshot(cache_dir, args.dir_a, args.dir_b, args.glob)
        if removed:
            print("Snapshot removed.")
        else:
            print("No snapshot found for this directory pair.")
        sys.exit(0)

    exit_code = run(
        dir_a=args.dir_a,
        dir_b=args.dir_b,
        glob_pattern=args.glob,
        cache_dir=cache_dir,
        verbose=args.verbose,
    )
    sys.exit(exit_code)
