#!/usr/bin/env python3
"""
Synchronize dependency versions from root pyproject.toml to sub-packages.

This script ensures all dependencies in sub-packages match the pinned versions
defined in the root pyproject.toml [tool.poetry.dependencies] section.

Scans:
  - fastapi_server/pyproject.toml
  - packages_py/*/pyproject.toml
  - polyglot/**/py/**/pyproject.toml

Usage:
    .bin/pyproject-install-fix-versions.py [--dry-run] [--verbose]
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from typing import Any

# Try to import tomllib (Python 3.11+) or fallback to tomli
try:
    import tomllib
except ImportError:
    try:
        import tomli as tomllib  # type: ignore
    except ImportError:
        print("Error: tomli package required for Python < 3.11")
        print("Install with: pip install tomli")
        sys.exit(1)


def parse_version_spec(spec: str | dict[str, Any]) -> tuple[str | None, list[str] | None]:
    """
    Parse a version specification from pyproject.toml.

    Returns:
        Tuple of (version_string, extras_list or None)
    """
    if isinstance(spec, dict):
        version = spec.get("version")
        extras = spec.get("extras")
        return version, extras
    elif isinstance(spec, str):
        return spec, None
    return None, None


def normalize_package_name(name: str) -> str:
    """Normalize package name for comparison (PEP 503)."""
    return re.sub(r"[-_.]+", "-", name.lower())


def extract_package_and_extras(dep_line: str) -> tuple[str, list[str] | None, str | None]:
    """
    Extract package name, extras, and version constraint from a dependency line.

    Examples:
        "aiofiles>=24.1.0" -> ("aiofiles", None, ">=24.1.0")
        "uvicorn[standard]>=0.32.0" -> ("uvicorn", ["standard"], ">=0.32.0")
    """
    match = re.match(r"^([a-zA-Z0-9_-]+)(?:\[([^\]]+)\])?(.*)?$", dep_line.strip())
    if not match:
        return dep_line, None, None

    package = match.group(1)
    extras_str = match.group(2)
    version = match.group(3) if match.group(3) else None

    extras = [e.strip() for e in extras_str.split(",")] if extras_str else None

    return package, extras, version


def format_dependency_array(package: str, version: str, extras: list[str] | None = None) -> str:
    """Format a dependency for array-style [project.dependencies]."""
    if extras:
        return f"{package}[{','.join(extras)}]{version}"
    return f"{package}{version}"


def format_dependency_poetry(package: str, version: str, extras: list[str] | None = None) -> str:
    """Format a dependency for poetry-style [tool.poetry.dependencies]."""
    if extras:
        return f'{package} = {{extras = {extras}, version = "{version}"}}'
    return f'{package} = "{version}"'


def load_root_versions(root_pyproject: Path) -> dict[str, tuple[str, list[str] | None]]:
    """
    Load pinned versions from root pyproject.toml.

    Returns:
        Dict mapping normalized package name to (version_spec, extras)
    """
    with open(root_pyproject, "rb") as f:
        data = tomllib.load(f)

    versions: dict[str, tuple[str, list[str] | None]] = {}

    # Get dependencies from [tool.poetry.dependencies]
    poetry_deps = data.get("tool", {}).get("poetry", {}).get("dependencies", {})

    for name, spec in poetry_deps.items():
        if name == "python":
            continue

        # Skip local packages (path references)
        if isinstance(spec, dict) and "path" in spec:
            continue

        version, extras = parse_version_spec(spec)
        if version:
            normalized = normalize_package_name(name)
            versions[normalized] = (version, extras)

    return versions


def find_pyproject_files(root_dir: Path) -> list[Path]:
    """Find all pyproject.toml files in target directories."""
    files: list[Path] = []

    # fastapi_server
    fastapi_server = root_dir / "fastapi_server" / "pyproject.toml"
    if fastapi_server.exists():
        files.append(fastapi_server)

    # packages_py/*
    packages_py = root_dir / "packages_py"
    if packages_py.exists():
        for pkg_dir in packages_py.iterdir():
            if pkg_dir.is_dir():
                pyproject = pkg_dir / "pyproject.toml"
                if pyproject.exists():
                    files.append(pyproject)

    # polyglot/**/py/**
    polyglot = root_dir / "polyglot"
    if polyglot.exists():
        for pyproject in polyglot.rglob("**/py/**/pyproject.toml"):
            if "__" not in str(pyproject):
                files.append(pyproject)
        for pyproject in polyglot.glob("*/py/pyproject.toml"):
            if pyproject not in files:
                files.append(pyproject)

    return sorted(set(files))


def process_array_dependency(
    line: str,
    root_versions: dict[str, tuple[str, list[str] | None]],
) -> tuple[str, str | None]:
    """
    Process an array-style dependency line.

    Returns:
        Tuple of (new_line, change_description or None)
    """
    stripped = line.strip()

    # Extract the dependency string (remove quotes and comma)
    match = re.match(r'^"([^"]+)"[,]?$', stripped)
    if not match:
        return line, None

    dep_str = match.group(1)

    # Skip local packages
    if any(x in dep_str.lower() for x in ["workspace", "path", "{"]):
        return line, None

    # Parse the dependency
    package, extras, current_version = extract_package_and_extras(dep_str)
    normalized = normalize_package_name(package)

    if normalized not in root_versions:
        return line, None

    root_version, root_extras = root_versions[normalized]
    final_extras = root_extras if root_extras else extras

    new_dep = format_dependency_array(package, root_version, final_extras)

    if new_dep == dep_str:
        return line, None

    # Preserve indentation and trailing comma
    indent = len(line) - len(line.lstrip())
    has_comma = stripped.endswith(",")
    suffix = "," if has_comma else ""
    new_line = " " * indent + f'"{new_dep}"{suffix}\n'

    return new_line, f"{dep_str} -> {new_dep}"


def process_poetry_dependency(
    line: str,
    root_versions: dict[str, tuple[str, list[str] | None]],
) -> tuple[str, str | None]:
    """
    Process a poetry-style dependency line.

    Returns:
        Tuple of (new_line, change_description or None)
    """
    stripped = line.strip()

    # Skip if it's a section header or empty
    if not stripped or stripped.startswith("[") or stripped.startswith("#"):
        return line, None

    # Match poetry dependency patterns:
    # package = "version"
    # package = {extras = [...], version = "..."}
    # package = {path = "...", develop = true}

    # Simple version: package = "version"
    simple_match = re.match(r'^([a-zA-Z0-9_-]+)\s*=\s*"([^"]+)"$', stripped)
    if simple_match:
        package = simple_match.group(1)
        current_version = simple_match.group(2)
        normalized = normalize_package_name(package)

        if normalized not in root_versions:
            return line, None

        root_version, root_extras = root_versions[normalized]

        if root_extras:
            # Need to convert to dict format
            new_line_content = f'{package} = {{extras = {root_extras}, version = "{root_version}"}}'
        else:
            new_line_content = f'{package} = "{root_version}"'

        if f'"{current_version}"' == f'"{root_version}"' and not root_extras:
            return line, None

        indent = len(line) - len(line.lstrip())
        new_line = " " * indent + new_line_content + "\n"

        old_desc = f'{package} = "{current_version}"'
        return new_line, f"{old_desc} -> {new_line_content}"

    # Dict version: package = {extras = [...], version = "..."}
    dict_match = re.match(r'^([a-zA-Z0-9_-]+)\s*=\s*\{(.+)\}$', stripped)
    if dict_match:
        package = dict_match.group(1)
        dict_content = dict_match.group(2)

        # Skip path-based dependencies
        if "path" in dict_content:
            return line, None

        # Extract version
        version_match = re.search(r'version\s*=\s*"([^"]+)"', dict_content)
        if not version_match:
            return line, None

        current_version = version_match.group(1)
        normalized = normalize_package_name(package)

        if normalized not in root_versions:
            return line, None

        root_version, root_extras = root_versions[normalized]

        # Extract existing extras
        extras_match = re.search(r'extras\s*=\s*\[([^\]]*)\]', dict_content)
        existing_extras = None
        if extras_match:
            extras_str = extras_match.group(1)
            existing_extras = [e.strip().strip('"\'') for e in extras_str.split(",") if e.strip()]

        final_extras = root_extras if root_extras else existing_extras

        if final_extras:
            extras_formatted = "[" + ", ".join(f'"{e}"' for e in final_extras) + "]"
            new_line_content = f'{package} = {{extras = {extras_formatted}, version = "{root_version}"}}'
        else:
            new_line_content = f'{package} = "{root_version}"'

        # Check if changed
        if current_version == root_version.lstrip("="):
            # Check extras too
            if set(existing_extras or []) == set(final_extras or []):
                return line, None

        indent = len(line) - len(line.lstrip())
        new_line = " " * indent + new_line_content + "\n"

        return new_line, f"{stripped} -> {new_line_content}"

    return line, None


def process_pyproject_file(
    filepath: Path,
    root_versions: dict[str, tuple[str, list[str] | None]],
    dry_run: bool = False,
    verbose: bool = False,
) -> list[str]:
    """
    Process a single pyproject.toml file.

    Returns:
        List of changes made
    """
    changes: list[str] = []

    content = filepath.read_text()
    lines = content.splitlines(keepends=True)
    new_lines: list[str] = []

    section = None  # Current section name

    for line in lines:
        stripped = line.strip()

        # Track section headers
        if stripped.startswith("[") and stripped.endswith("]"):
            section = stripped[1:-1]
            new_lines.append(line)
            continue

        # Process based on section
        if section == "project":
            # Check if we're in dependencies array
            if "dependencies" in stripped or (stripped.startswith('"') and section == "project"):
                pass  # Will be handled by array processing

        # Process array-style dependencies (in [project] dependencies = [...])
        if stripped.startswith('"') and stripped.endswith((',', '"')):
            new_line, change = process_array_dependency(line, root_versions)
            if change:
                changes.append(change)
            new_lines.append(new_line)
            continue

        # Process poetry-style dependencies
        if section and "dependencies" in section.lower():
            if "=" in stripped and not stripped.startswith("["):
                new_line, change = process_poetry_dependency(line, root_versions)
                if change:
                    changes.append(change)
                new_lines.append(new_line)
                continue

        new_lines.append(line)

    # Write changes if not dry run
    if changes and not dry_run:
        filepath.write_text("".join(new_lines))

    return changes


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Synchronize dependency versions from root pyproject.toml to sub-packages"
    )
    parser.add_argument(
        "--dry-run", "-n",
        action="store_true",
        help="Show what would be changed without making changes"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Show detailed output"
    )
    parser.add_argument(
        "--root",
        type=Path,
        default=None,
        help="Root directory (default: auto-detect from script location)"
    )

    args = parser.parse_args()

    # Find root directory
    if args.root:
        root_dir = args.root.resolve()
    else:
        script_dir = Path(__file__).resolve().parent
        root_dir = script_dir.parent

    root_pyproject = root_dir / "pyproject.toml"

    if not root_pyproject.exists():
        print(f"Error: Root pyproject.toml not found at {root_pyproject}")
        return 1

    print(f"Root: {root_dir}")
    print(f"Mode: {'DRY RUN' if args.dry_run else 'APPLY CHANGES'}")
    print()

    # Load root versions
    root_versions = load_root_versions(root_pyproject)

    if args.verbose:
        print("Pinned versions from root:")
        for name, (version, extras) in sorted(root_versions.items()):
            extras_str = f"[{','.join(extras)}]" if extras else ""
            print(f"  {name}{extras_str}: {version}")
        print()

    # Find and process pyproject files
    pyproject_files = find_pyproject_files(root_dir)

    print(f"Found {len(pyproject_files)} pyproject.toml files to check")
    print()

    total_changes = 0
    files_changed = 0

    for filepath in pyproject_files:
        relative_path = filepath.relative_to(root_dir)

        changes = process_pyproject_file(
            filepath,
            root_versions,
            dry_run=args.dry_run,
            verbose=args.verbose,
        )

        if changes:
            files_changed += 1
            total_changes += len(changes)
            print(f"{relative_path}:")
            for change in changes:
                print(f"  {change}")
            print()

    # Summary
    print("-" * 60)
    if total_changes > 0:
        action = "Would update" if args.dry_run else "Updated"
        print(f"{action} {total_changes} dependencies in {files_changed} files")
    else:
        print("All dependencies are already in sync!")

    return 0


if __name__ == "__main__":
    sys.exit(main())
