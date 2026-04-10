#!/usr/bin/env python3
"""
python .bin/pyproject-sync-pkg-directory.py <main-pyproject> <directory>

Loops over all pyproject.toml files in <directory> (one level deep) and syncs
dependencies from <main-pyproject> into each target.

Syncs:
  - pip-registry deps from [tool.poetry.dependencies] -> target dependencies[]
  - local path deps from [tool.poetry.dependencies] -> target dependencies[]
    with relative paths recalculated from target location

Usage:
    python .bin/pyproject-sync-pkg-directory.py pyproject.toml packages_py [--dry-run]
    python .bin/pyproject-sync-pkg-directory.py pyproject.toml fastapi_apps [--dry-run]
    python .bin/pyproject-sync-pkg-directory.py pyproject.toml test [--dry-run]


Options:
    --dry-run    Show what would be changed without modifying files
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


def parse_poetry_dependencies(content: str) -> tuple[dict[str, str], dict[str, tuple[str, str]]]:
    """Parse [tool.poetry.dependencies] from pyproject.toml.

    Returns:
        (pip_deps, local_deps)
        - pip_deps: dict of name -> poetry spec line (e.g. 'fastapi = "==0.128.0"')
        - local_deps: dict of name -> (path, full_line) for path = "..." entries
    """
    pip_deps: dict[str, str] = {}
    local_deps: dict[str, tuple[str, str]] = {}

    in_section = False
    for line in content.split('\n'):
        stripped = line.strip()
        if stripped == '[tool.poetry.dependencies]':
            in_section = True
            continue
        if in_section:
            if stripped.startswith('['):
                break
            if not stripped or stripped.startswith('#'):
                continue
            # Match: name = {path = "...", develop = true}
            path_match = re.match(
                r'^([\w-]+)\s*=\s*\{path\s*=\s*"([^"]+)"', stripped
            )
            if path_match:
                name = path_match.group(1)
                path = path_match.group(2)
                local_deps[name] = (path, stripped)
                continue
            # Match: name = "version" or name = {version = ...}
            dep_match = re.match(r'^([\w-]+)\s*=\s*(.+)$', stripped)
            if dep_match:
                name = dep_match.group(1)
                if name.lower() == 'python':
                    continue
                pip_deps[name] = stripped
    return pip_deps, local_deps


def normalize_name(name: str) -> str:
    """Normalize package name per PEP 503."""
    return re.sub(r'[-_.]+', '-', name).lower()


def poetry_spec_to_pep508(line: str) -> str | None:
    """Convert a poetry dep line to PEP 508 string for [project].dependencies.

    Examples:
        'fastapi = "==0.128.0"'            -> 'fastapi==0.128.0'
        'uvicorn = {extras = ["standard"], version = "==0.40.0"}' -> 'uvicorn[standard]==0.40.0'
    """
    match = re.match(r'^([\w-]+)\s*=\s*(.+)$', line.strip())
    if not match:
        return None
    name = match.group(1)
    spec = match.group(2).strip()

    # Simple string: name = "version"
    simple = re.match(r'^"([^"]+)"$', spec)
    if simple:
        return f'{name}{simple.group(1)}'

    # Inline table: name = {extras = [...], version = "..."}
    extras_match = re.search(r'extras\s*=\s*\[([^\]]*)\]', spec)
    version_match = re.search(r'version\s*=\s*"([^"]+)"', spec)

    extras_str = ''
    if extras_match:
        extras_raw = extras_match.group(1)
        extras_list = [e.strip().strip('"').strip("'") for e in extras_raw.split(',') if e.strip()]
        if extras_list:
            extras_str = f'[{",".join(extras_list)}]'

    version_str = ''
    if version_match:
        version_str = version_match.group(1)

    if not version_str and not extras_str:
        return None

    return f'{name}{extras_str}{version_str}'


def parse_target_dependencies(content: str) -> set[str]:
    """Parse existing dependency names from a target pyproject.toml dependencies = [...].

    Returns normalized names for comparison.
    """
    deps = set()
    in_deps = False
    for line in content.split('\n'):
        stripped = line.strip()
        if stripped.startswith('dependencies = ['):
            in_deps = True
            # Handle single-line: dependencies = []
            if ']' in stripped:
                # Extract any deps on the same line
                inner = stripped.split('[', 1)[1].rsplit(']', 1)[0]
                for item in inner.split(','):
                    item = item.strip().strip('"').strip("'")
                    if item:
                        name_match = re.match(r'^([a-zA-Z0-9_-]+)', item)
                        if name_match:
                            deps.add(normalize_name(name_match.group(1)))
                return deps
            continue
        if in_deps:
            if stripped == ']':
                break
            match = re.match(r'"([a-zA-Z0-9_-]+)', stripped)
            if match:
                deps.add(normalize_name(match.group(1)))
    return deps


def compute_relative_path(main_pyproject_dir: Path, target_pyproject_dir: Path, dep_path: str) -> str:
    """Compute relative path from target pyproject directory to a dependency.

    Args:
        main_pyproject_dir: Directory containing the main pyproject.toml
        target_pyproject_dir: Directory containing the target pyproject.toml
        dep_path: Path as declared in main pyproject (relative to main_pyproject_dir)
    """
    # Resolve absolute path of the dependency
    abs_dep_path = (main_pyproject_dir / dep_path).resolve()
    # Compute relative path from target to dependency
    try:
        rel_path = abs_dep_path.relative_to(target_pyproject_dir.resolve())
        return str(rel_path)
    except ValueError:
        # Not a subpath, compute with ../ segments
        try:
            from os.path import relpath
            return relpath(abs_dep_path, target_pyproject_dir.resolve())
        except ValueError:
            return str(abs_dep_path)


def read_package_name_from_pyproject(pyproject_path: Path) -> str | None:
    """Read the package name from a pyproject.toml."""
    if not pyproject_path.exists():
        return None
    content = pyproject_path.read_text()
    match = re.search(r'^name\s*=\s*["\']([^"\']+)["\']', content, re.MULTILINE)
    if match:
        return match.group(1)
    return None


def parse_target_poetry_deps(content: str) -> set[str]:
    """Parse existing dep names from [tool.poetry.dependencies].

    Returns normalized names for comparison.
    """
    deps = set()
    in_section = False
    for line in content.split('\n'):
        stripped = line.strip()
        if stripped == '[tool.poetry.dependencies]':
            in_section = True
            continue
        if in_section:
            if stripped.startswith('['):
                break
            if not stripped or stripped.startswith('#'):
                continue
            match = re.match(r'^([\w-]+)\s*=', stripped)
            if match:
                name = match.group(1)
                if name.lower() == 'python':
                    continue
                deps.add(normalize_name(name))
    return deps


def detect_target_format(content: str) -> str:
    """Detect whether target uses PEP 621 dependencies = [...] or poetry format."""
    for line in content.split('\n'):
        stripped = line.strip()
        if stripped.startswith('dependencies = ['):
            return 'pep621'
    if '[tool.poetry.dependencies]' in content:
        return 'poetry'
    return 'unknown'


def update_target_pyproject(
    target_path: Path,
    pip_deps: dict[str, str],
    local_deps: dict[str, tuple[str, str]],
    main_dir: Path,
    dry_run: bool = False,
) -> tuple[bool, list[str], list[str]]:
    """Update a target pyproject.toml with deps from main.

    Handles both PEP 621 (dependencies = [...]) and poetry ([tool.poetry.dependencies]) formats.
    For local path deps, recalculates relative paths from the target's location.

    Returns:
        (changed, added_pip, added_local)
    """
    content = target_path.read_text()
    target_dir = target_path.parent

    # Read target's own package name to exclude self-references
    target_name = read_package_name_from_pyproject(target_path)
    target_norm = normalize_name(target_name) if target_name else ''

    fmt = detect_target_format(content)

    if fmt == 'poetry':
        return _update_poetry_target(
            target_path, content, target_dir, target_norm,
            pip_deps, local_deps, main_dir, dry_run
        )
    elif fmt == 'pep621':
        return _update_pep621_target(
            target_path, content, target_dir, target_norm,
            pip_deps, local_deps, main_dir, dry_run
        )
    else:
        print(f"  WARNING: No dependencies section found in {target_path}")
        return False, [], []


def _update_poetry_target(
    target_path: Path,
    content: str,
    target_dir: Path,
    target_norm: str,
    pip_deps: dict[str, str],
    local_deps: dict[str, tuple[str, str]],
    main_dir: Path,
    dry_run: bool,
) -> tuple[bool, list[str], list[str]]:
    """Update a poetry-format pyproject.toml."""
    existing = parse_target_poetry_deps(content)

    # Determine which pip deps to add
    added_pip: list[str] = []
    pip_lines: list[str] = []
    for name, spec_line in sorted(pip_deps.items()):
        norm = normalize_name(name)
        if norm == target_norm:
            continue
        if norm not in existing:
            pip_lines.append(spec_line)
            added_pip.append(name)

    # Determine which local path deps to add (with recalculated relative paths)
    added_local: list[str] = []
    local_lines: list[str] = []
    for name, (dep_path, _full_line) in sorted(local_deps.items()):
        norm = normalize_name(name)
        if norm == target_norm:
            continue
        if norm not in existing:
            rel_path = compute_relative_path(main_dir, target_dir, dep_path)
            local_lines.append(f'{name} = {{path = "{rel_path}", develop = true}}')
            added_local.append(name)

    if not pip_lines and not local_lines:
        return False, [], []

    # Find end of [tool.poetry.dependencies] section to insert before
    lines = content.split('\n')
    in_section = False
    section_end_line = len(lines)
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped == '[tool.poetry.dependencies]':
            in_section = True
            continue
        if in_section and stripped.startswith('['):
            section_end_line = i
            break

    # Insert new lines before the next section (or end of file)
    insert_lines = pip_lines + local_lines
    # Find last non-empty line before section_end_line to insert after
    insert_at = section_end_line
    lines = lines[:insert_at] + insert_lines + lines[insert_at:]
    new_content = '\n'.join(lines)

    if not dry_run:
        target_path.write_text(new_content)

    return True, added_pip, added_local


def _update_pep621_target(
    target_path: Path,
    content: str,
    target_dir: Path,
    target_norm: str,
    pip_deps: dict[str, str],
    local_deps: dict[str, tuple[str, str]],
    main_dir: Path,
    dry_run: bool,
) -> tuple[bool, list[str], list[str]]:
    """Update a PEP 621 (dependencies = [...]) format pyproject.toml."""
    existing = parse_target_dependencies(content)

    # Determine which pip deps to add
    added_pip: list[str] = []
    pip_lines_to_add: list[str] = []
    for name, spec_line in sorted(pip_deps.items()):
        norm = normalize_name(name)
        if norm == target_norm:
            continue
        if norm not in existing:
            pep508 = poetry_spec_to_pep508(spec_line)
            if pep508:
                pip_lines_to_add.append(f'  "{pep508}",')
                added_pip.append(name)

    # Determine which local deps to add
    added_local: list[str] = []
    local_lines_to_add: list[str] = []
    for name, (dep_path, _full_line) in sorted(local_deps.items()):
        norm = normalize_name(name)
        if norm == target_norm:
            continue
        if norm not in existing:
            local_lines_to_add.append(f'  "{name}",')
            added_local.append(name)

    if not pip_lines_to_add and not local_lines_to_add:
        return False, [], []

    # Insert into dependencies = [...] before the closing ]
    lines = content.split('\n')
    in_deps = False
    deps_end_line = -1
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith('dependencies = ['):
            in_deps = True
            # Handle single-line empty: dependencies = []
            if stripped == 'dependencies = []':
                indent = line[:len(line) - len(line.lstrip())]
                new_dep_block = [f'{indent}dependencies = [']
                new_dep_block.extend(pip_lines_to_add)
                if local_lines_to_add:
                    new_dep_block.append('  # Local packages')
                    new_dep_block.extend(local_lines_to_add)
                new_dep_block.append(f'{indent}]')
                lines[i:i+1] = new_dep_block
                new_content = '\n'.join(lines)
                if not dry_run:
                    target_path.write_text(new_content)
                return True, added_pip, added_local
            continue
        if in_deps and stripped == ']':
            deps_end_line = i
            break

    if deps_end_line < 0:
        print(f"  WARNING: No dependencies = [...] closing bracket in {target_path}")
        return False, [], []

    insert_lines = []
    if pip_lines_to_add:
        insert_lines.extend(pip_lines_to_add)
    if local_lines_to_add:
        insert_lines.append('  # Local packages')
        insert_lines.extend(local_lines_to_add)

    lines = lines[:deps_end_line] + insert_lines + lines[deps_end_line:]
    new_content = '\n'.join(lines)

    if not dry_run:
        target_path.write_text(new_content)

    return True, added_pip, added_local


def main():
    parser = argparse.ArgumentParser(
        description='Sync dependencies from a main pyproject.toml into all pyproject.toml files in a directory'
    )
    parser.add_argument(
        'main_pyproject',
        help='Path to the main pyproject.toml (source of dependencies)'
    )
    parser.add_argument(
        'directory',
        help='Directory to scan for pyproject.toml files (one level deep)'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be changed without modifying files'
    )
    args = parser.parse_args()

    main_pyproject = Path(args.main_pyproject).resolve()
    scan_dir = Path(args.directory).resolve()

    if not main_pyproject.exists():
        print(f"ERROR: Main pyproject.toml not found: {main_pyproject}")
        sys.exit(1)

    if not scan_dir.exists() or not scan_dir.is_dir():
        print(f"ERROR: Directory not found: {scan_dir}")
        sys.exit(1)

    main_dir = main_pyproject.parent

    print(f"Source:    {main_pyproject}")
    print(f"Directory: {scan_dir}")
    print()

    # Parse main pyproject
    main_content = main_pyproject.read_text()
    pip_deps, local_deps = parse_poetry_dependencies(main_content)

    print(f"Found {len(pip_deps)} pip-registry deps in source")
    print(f"Found {len(local_deps)} local path deps in source")
    print()

    # Find all pyproject.toml files in directory (recursive, skip hidden/venv dirs)
    skip_dirs = {'.venv', '.git', '__pycache__', 'node_modules', '.ruff_cache'}
    targets: list[Path] = []
    for p in sorted(scan_dir.rglob('pyproject.toml')):
        # Skip if any parent component is a hidden/venv dir
        parts = p.relative_to(scan_dir).parts
        if any(part in skip_dirs or part.startswith('.') for part in parts):
            continue
        targets.append(p)

    if not targets:
        print("No pyproject.toml files found in subdirectories.")
        sys.exit(0)

    print(f"Found {len(targets)} target pyproject.toml files:")
    for t in targets:
        print(f"  - {t.relative_to(scan_dir)}")
    print()

    # Process each target
    updated_files: list[str] = []
    for target in targets:
        rel = target.relative_to(scan_dir)
        changed, added_pip, added_local = update_target_pyproject(
            target, pip_deps, local_deps, main_dir, dry_run=args.dry_run
        )

        if changed:
            updated_files.append(str(rel))
            total = len(added_pip) + len(added_local)
            print(f"  {rel}: +{total} deps")
            if added_pip:
                for p in added_pip:
                    print(f"    + {p} (pip)")
            if added_local:
                for p in added_local:
                    print(f"    + {p} (local)")
        else:
            print(f"  {rel}: up to date")

    # Summary
    print()
    if updated_files:
        if args.dry_run:
            print(f"DRY RUN: Would update {len(updated_files)} file(s):")
        else:
            print(f"Updated {len(updated_files)} file(s):")
        for f in updated_files:
            print(f"  - {f}")
    else:
        print("All files are already up to date.")


if __name__ == '__main__':
    main()
