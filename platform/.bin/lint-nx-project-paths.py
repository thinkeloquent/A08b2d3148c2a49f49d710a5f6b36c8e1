#!/usr/bin/env python3
"""
Lint NX project.json files to verify that cwd and sourceRoot paths exist on disk.

Catches mismatches like hyphens vs underscores in directory names that cause
misleading 'spawn /bin/sh ENOENT' errors at build time.
"""
import json
import os
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

# Directories to skip when scanning for project.json
EXCLUDE_DIRS = {"node_modules", "__STAGE__", "__SPECS__", ".git", ".venv", "dataset"}


def find_project_files(root: Path):
    """Walk the repo and yield project.json paths, skipping excluded dirs."""
    for dirpath, dirnames, filenames in os.walk(root):
        # Prune excluded directories in-place so os.walk doesn't descend
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
        if "project.json" in filenames:
            yield Path(dirpath) / "project.json"


def extract_paths(data, prefix=""):
    """Recursively extract cwd and sourceRoot values from project.json."""
    paths = []
    if isinstance(data, dict):
        for key, value in data.items():
            if key in ("cwd", "sourceRoot") and isinstance(value, str):
                paths.append((f"{prefix}.{key}" if prefix else key, value))
            elif isinstance(value, (dict, list)):
                paths.extend(extract_paths(value, f"{prefix}.{key}" if prefix else key))
    elif isinstance(data, list):
        for i, item in enumerate(data):
            paths.extend(extract_paths(item, f"{prefix}[{i}]"))
    return paths


def main():
    errors = []

    for project_file in sorted(find_project_files(REPO_ROOT)):
        try:
            data = json.loads(project_file.read_text())
        except (json.JSONDecodeError, OSError) as e:
            errors.append(f"  {project_file.relative_to(REPO_ROOT)}: parse error: {e}")
            continue

        project_name = data.get("name", project_file.relative_to(REPO_ROOT))

        for field, rel_path in extract_paths(data):
            full_path = REPO_ROOT / rel_path
            if not full_path.exists():
                errors.append(
                    f"  {project_name} ({project_file.relative_to(REPO_ROOT)})\n"
                    f"    {field}: \"{rel_path}\" does not exist"
                )

    if errors:
        print("ERROR: NX project.json path lint failed.\n")
        print("The following paths in project.json files do not exist on disk:\n")
        for err in errors:
            print(err)
            print()
        print("Fix the paths above and re-run the build.")
        sys.exit(1)
    else:
        print("[lint] NX project.json paths OK")


if __name__ == "__main__":
    main()
