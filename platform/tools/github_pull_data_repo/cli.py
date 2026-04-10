"""Interactive CLI for searching and cloning repos from repo.json."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

_REPO_JSON = Path(__file__).resolve().parent.parent.parent / "common" / "data" / "repo.json"
_CLONE_ROOT = Path(__file__).resolve().parent.parent.parent / "data" / "repos"


def load_repos(path: Path = _REPO_JSON) -> list[dict]:
    with open(path) as f:
        return json.load(f)


def search_repos(repos: list[dict], query: str) -> list[dict]:
    q = query.lower()
    return [
        r for r in repos
        if q in r.get("name", "").lower()
        or q in r.get("owner", "").lower()
        or q in r.get("repo", "").lower()
        or q in r.get("url", "").lower()
        or any(q in t.lower() for t in r.get("tags", []))
    ]


def display_repos(repos: list[dict]) -> None:
    if not repos:
        print("  No repos found.")
        return
    max_idx_width = len(str(len(repos)))
    for i, r in enumerate(repos, 1):
        tags = ", ".join(r.get("tags", []))
        tag_str = f"  [{tags}]" if tags else ""
        print(f"  {i:>{max_idx_width}}. {r['name']}  ({r['owner']}/{r['repo']}){tag_str}")


def clone_repo(repo: dict, dest: Path) -> bool:
    url = repo["url"]
    if dest.exists():
        print(f"  [skip] Already cloned: {dest}")
        return True
    dest.parent.mkdir(parents=True, exist_ok=True)
    print(f"  Cloning {url} -> {dest} ...")
    result = subprocess.run(
        ["git", "clone", "--depth", "1", url, str(dest)],
        capture_output=False,
    )
    return result.returncode == 0


def clone_all(repos: list[dict]) -> int:
    print(f"\n  Cloning all {len(repos)} repos...\n")
    failed = []
    for repo in repos:
        dest = _CLONE_ROOT / repo["repo"]
        if not clone_repo(repo, dest):
            failed.append(repo["name"])
        print()
    if failed:
        print(f"  Failed ({len(failed)}): {', '.join(failed)}")
        return 1
    print(f"  All {len(repos)} repos cloned.")
    return 0


def interactive_loop() -> int:
    repos = load_repos()
    print(f"\nLoaded {len(repos)} repos from {_REPO_JSON.name}\n")

    while True:
        query = input("Search (or 'all' to clone all, Enter to list all, 'q' to quit): ").strip()
        if query.lower() == "q":
            return 0

        if query.lower() == "all":
            return clone_all(repos)

        matches = search_repos(repos, query) if query else repos
        print()
        display_repos(matches)

        if not matches:
            print()
            continue

        print()
        selection = input("Select repo # to clone (or Enter to search again): ").strip()
        if not selection:
            continue

        try:
            idx = int(selection)
        except ValueError:
            print("  Invalid number.\n")
            continue

        if idx < 1 or idx > len(matches):
            print(f"  Out of range (1-{len(matches)}).\n")
            continue

        repo = matches[idx - 1]
        dest = _CLONE_ROOT / repo["repo"]
        ok = clone_repo(repo, dest)
        if ok:
            print(f"  Done: {dest}\n")
        else:
            print(f"  Clone failed.\n")
            return 1

        again = input("Clone another? (y/N): ").strip().lower()
        if again != "y":
            return 0

    return 0
