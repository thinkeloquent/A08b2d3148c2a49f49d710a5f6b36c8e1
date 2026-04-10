#!/usr/bin/env python3
"""
python .bin/packagejson-sync-polyglot-mjs.py

Scans polyglot/*/mjs and fastify_apps/*/* directories for JavaScript packages
and updates root package.json and fastify_server/package.json to include them
as workspace: dependencies.

This is the JavaScript equivalent of pyproject-sync-pkg-repo.py.

Usage:
    python .bin/packagejson-sync-polyglot-mjs.py [--dry-run]

Options:
    --dry-run    Show what would be changed without modifying files
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def get_script_root() -> Path:
    """Get the monorepo root directory."""
    script_path = Path(__file__).resolve()
    return script_path.parent.parent


def find_mjs_packages(root: Path) -> list[tuple[str, str, str]]:
    """
    Find all JavaScript packages in polyglot/*/mjs directories.

    A valid package has a package.json file with a "name" field.

    Returns:
        List of (package_name, relative_path, polyglot_folder_name) tuples
    """
    packages = []
    polyglot_dir = root / 'polyglot'

    if not polyglot_dir.exists():
        return packages

    for item in sorted(polyglot_dir.iterdir()):
        if not item.is_dir() or item.name.startswith(('.', '_')):
            continue

        mjs_dir = item / 'mjs'
        if not mjs_dir.exists() or not mjs_dir.is_dir():
            continue

        # Check if mjs/ directory itself has a package.json
        pkg_json = mjs_dir / 'package.json'
        if pkg_json.exists():
            pkg_data = json.loads(pkg_json.read_text())
            if 'name' in pkg_data:
                rel_path = f"polyglot/{item.name}/mjs"
                packages.append((pkg_data['name'], rel_path, item.name))
            continue

        # Check for subdirectories with package.json (nested packages)
        for subdir in sorted(mjs_dir.iterdir()):
            if not subdir.is_dir() or subdir.name.startswith(('.', '_', 'node_modules')):
                continue
            pkg_json = subdir / 'package.json'
            if pkg_json.exists():
                pkg_data = json.loads(pkg_json.read_text())
                if 'name' in pkg_data:
                    rel_path = f"polyglot/{item.name}/mjs/{subdir.name}"
                    packages.append((pkg_data['name'], rel_path, item.name))

    return packages


def find_fastify_apps_packages(root: Path) -> list[tuple[str, str, str]]:
    """
    Find all JavaScript packages in fastify_apps/*/* directories.

    A valid package has a package.json file with a "name" field.
    Skips directories starting with '.', '_', or 'node_modules'.

    Returns:
        List of (package_name, relative_path, app_name) tuples
    """
    packages = []
    fastify_apps_dir = root / 'fastify_apps'

    if not fastify_apps_dir.exists():
        return packages

    for app_dir in sorted(fastify_apps_dir.iterdir()):
        if not app_dir.is_dir() or app_dir.name.startswith(('.', '_')):
            continue

        for sub_dir in sorted(app_dir.iterdir()):
            if not sub_dir.is_dir() or sub_dir.name.startswith(('.', '_', 'node_modules')):
                continue

            pkg_json = sub_dir / 'package.json'
            if pkg_json.exists():
                pkg_data = json.loads(pkg_json.read_text())
                if 'name' in pkg_data:
                    rel_path = f"fastify_apps/{app_dir.name}/{sub_dir.name}"
                    packages.append((pkg_data['name'], rel_path, app_dir.name))

    return packages


def parse_existing_deps(pkg_json: dict) -> set[str]:
    """
    Parse all existing dependency names from package.json.

    Returns set of package names - both the keys AND any names referenced
    in workspace: protocol values (e.g., workspace:@internal/foo@* -> @internal/foo).
    """
    names = set()
    for key, value in pkg_json.get('dependencies', {}).items():
        names.add(key)
        # Also extract package name from workspace: protocol
        # Format: workspace:package-name@* or workspace:@scope/name@*
        if isinstance(value, str) and value.startswith('workspace:'):
            # Extract the package name from workspace:package@* or workspace:@scope/pkg@*
            ws_value = value[10:]  # Remove 'workspace:'
            # Handle @scope/name@version or name@version
            if '@' in ws_value:
                # Find the last @ which separates name from version
                at_idx = ws_value.rfind('@')
                if at_idx > 0:  # Not the first char (not @scope start)
                    pkg_name = ws_value[:at_idx]
                    names.add(pkg_name)
                elif ws_value == '*':
                    # workspace:* - no explicit package name
                    pass
    return names


def update_package_json(
    pkg_json_path: Path,
    packages: list[tuple[str, str, str]],
    dry_run: bool = False
) -> tuple[bool, list[str], list[str]]:
    """
    Update package.json with polyglot mjs packages.

    Only adds packages that aren't already present (under any protocol).

    Args:
        pkg_json_path: Path to package.json
        packages: List of (package_name, relative_path, polyglot_folder_name)
        dry_run: If True, don't actually write changes

    Returns:
        (changed, added, removed)
    """
    content = pkg_json_path.read_text()
    pkg_json = json.loads(content)

    existing_names = parse_existing_deps(pkg_json)

    desired = {name: path for name, path, _ in packages}
    desired_names = set(desired.keys())

    to_add = sorted(desired_names - existing_names)
    # Don't remove - only add missing packages

    if not to_add:
        return False, [], []

    # Add new dependencies
    if 'dependencies' not in pkg_json:
        pkg_json['dependencies'] = {}

    for name in to_add:
        # Use workspace protocol since packages are in the pnpm workspace
        pkg_json['dependencies'][name] = "workspace:*"

    # Sort dependencies for consistency
    pkg_json['dependencies'] = dict(sorted(pkg_json['dependencies'].items()))

    if not dry_run:
        # Pretty print with 2-space indent
        new_content = json.dumps(pkg_json, indent=2) + '\n'
        pkg_json_path.write_text(new_content)

    return True, to_add, []


def main():
    parser = argparse.ArgumentParser(
        description='Sync polyglot mjs and fastify_apps packages with root and fastify_server package.json'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be changed without modifying files'
    )
    args = parser.parse_args()

    root = get_script_root()
    root_pkg_json = root / 'package.json'
    fastify_pkg_json = root / 'fastify_server' / 'package.json'

    print(f"Scanning: {root / 'polyglot' / '*' / 'mjs'}")
    print(f"          {root / 'fastify_apps' / '*' / '*'}")
    print(f"Targets:  {root_pkg_json}")
    print(f"          {fastify_pkg_json}")
    print()

    if not root_pkg_json.exists():
        print(f"ERROR: package.json not found at {root_pkg_json}")
        sys.exit(1)

    if not fastify_pkg_json.exists():
        print(f"ERROR: package.json not found at {fastify_pkg_json}")
        sys.exit(1)

    polyglot_packages = find_mjs_packages(root)
    fastify_apps_packages = find_fastify_apps_packages(root)

    if polyglot_packages:
        print(f"Found {len(polyglot_packages)} package(s) in polyglot/*/mjs:")
        for name, path, folder in polyglot_packages:
            print(f"  - {name} ({path})")
    else:
        print("No packages found in polyglot/*/mjs")

    if fastify_apps_packages:
        print(f"Found {len(fastify_apps_packages)} package(s) in fastify_apps/*/*:")
        for name, path, folder in fastify_apps_packages:
            print(f"  - {name} ({path})")
    else:
        print("No packages found in fastify_apps/*/*")
    print()

    packages = polyglot_packages + fastify_apps_packages

    any_changed = False

    # Update root package.json
    changed, added, removed = update_package_json(
        root_pkg_json,
        packages,
        dry_run=args.dry_run
    )
    if changed:
        any_changed = True
        print("package.json (root):")
        if added:
            print(f"  Added {len(added)} package(s):")
            for pkg in added:
                print(f"    + {pkg}")
    else:
        print("package.json (root) is already up to date.")

    # Update fastify_server/package.json
    changed, added, removed = update_package_json(
        fastify_pkg_json,
        packages,
        dry_run=args.dry_run
    )
    if changed:
        any_changed = True
        print("fastify_server/package.json:")
        if added:
            print(f"  Added {len(added)} package(s):")
            for pkg in added:
                print(f"    + {pkg}")
    else:
        print("fastify_server/package.json is already up to date.")

    print()

    if args.dry_run and any_changed:
        print("DRY RUN: Would update files. Run without --dry-run to apply.")
    elif any_changed:
        print("Files updated successfully.")
        print()
        print("Next steps:")
        print("  Run: pnpm install")
    else:
        print("All files are already up to date.")


if __name__ == '__main__':
    main()
