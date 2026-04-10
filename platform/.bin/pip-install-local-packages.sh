#!/bin/bash

# Scan a directory (depth=1) for sub-packages with pyproject.toml
# and install each via `pip install -e <path>`.
#
# Usage:
#   .bin/pip-install-local-packages.sh <directory>
#   .bin/pip-install-local-packages.sh packages_py
#   .bin/pip-install-local-packages.sh --dry-run fastapi_apps
#   .bin/pip-install-local-packages.sh --no-editable packages_py

set -euo pipefail

DRY_RUN=false
EDITABLE=true

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run|-n)
      DRY_RUN=true
      shift
      ;;
    --no-editable)
      EDITABLE=false
      shift
      ;;
    -*)
      echo "Unknown option: $1" >&2
      echo "Usage: $0 [--dry-run] [--no-editable] <directory>" >&2
      exit 1
      ;;
    *)
      break
      ;;
  esac
done

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 [--dry-run] [--no-editable] <directory>" >&2
  exit 1
fi

TARGET_DIR="$1"

if [[ ! -d "$TARGET_DIR" ]]; then
  echo "Error: '$TARGET_DIR' is not a directory" >&2
  exit 1
fi

INSTALLED=0
SKIPPED=0

for dir in "$TARGET_DIR"/*/; do
  [[ -d "$dir" ]] || continue

  pyproject="$dir/pyproject.toml"
  [[ -f "$pyproject" ]] || continue

  # Extract project name from pyproject.toml ([project] name = "..." or [tool.poetry] name = "...")
  pkg_name=$(python3 -c "
import sys
try:
    import tomllib
except ImportError:
    import tomli as tomllib
with open('$pyproject', 'rb') as f:
    data = tomllib.load(f)
name = data.get('project', {}).get('name') or data.get('tool', {}).get('poetry', {}).get('name') or ''
sys.stdout.write(name)
" 2>/dev/null)

  if [[ -z "$pkg_name" ]]; then
    echo "SKIP  $dir (no name in pyproject.toml)"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  if [[ "$EDITABLE" == true ]]; then
    install_arg="-e ${dir%/}"
  else
    install_arg="${dir%/}"
  fi

  if [[ "$DRY_RUN" == true ]]; then
    echo "DRY   pip install $install_arg  ($pkg_name)"
  else
    echo "ADD   $pkg_name  ($install_arg)"
    pip install $install_arg
  fi
  INSTALLED=$((INSTALLED + 1))
done

echo ""
if [[ "$DRY_RUN" == true ]]; then
  echo "Dry run: $INSTALLED package(s) would be installed, $SKIPPED skipped"
else
  echo "Done: $INSTALLED package(s) installed, $SKIPPED skipped"
fi
