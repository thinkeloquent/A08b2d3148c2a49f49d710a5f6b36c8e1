"""Entry point: python -m tools.github_pull_data_repo"""

from __future__ import annotations

import argparse
import sys

from .cli import clone_all, clone_repo, display_repos, interactive_loop, load_repos, search_repos, _CLONE_ROOT


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="github_pull_data_repo",
        description="Search and clone repos listed in common/data/repo.json.",
    )
    p.add_argument(
        "--search", "-s",
        metavar="QUERY",
        help="Filter repos by name, owner, repo slug, or tag.",
    )
    p.add_argument(
        "--clone", "-c",
        metavar="INDEX",
        type=int,
        help="Clone the repo at this index (1-based) from the search results.",
    )
    p.add_argument(
        "--list", "-l",
        action="store_true",
        help="List all repos and exit.",
    )
    p.add_argument(
        "--all", "-a",
        action="store_true",
        help="Clone all repos and exit.",
    )
    return p


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    # Non-interactive: clone all
    if args.all:
        repos = load_repos()
        return clone_all(repos)

    # Non-interactive: list
    if args.list:
        repos = load_repos()
        display_repos(repos)
        return 0

    # Non-interactive: search + optional clone
    if args.search and args.clone:
        repos = load_repos()
        matches = search_repos(repos, args.search)
        if not matches:
            print("No repos match that query.", file=sys.stderr)
            return 1
        if args.clone < 1 or args.clone > len(matches):
            print(f"Index out of range (1-{len(matches)}).", file=sys.stderr)
            return 1
        repo = matches[args.clone - 1]
        dest = _CLONE_ROOT / repo["repo"]
        return 0 if clone_repo(repo, dest) else 1

    if args.search:
        repos = load_repos()
        matches = search_repos(repos, args.search)
        display_repos(matches)
        return 0

    # Interactive mode (default)
    return interactive_loop()


if __name__ == "__main__":
    sys.exit(main())
