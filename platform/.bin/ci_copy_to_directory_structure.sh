#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# ci_copy_to_directory_structure.sh
# ---------------------------------------------------------------------------
#
# Description:
#   Copies all files from source directory (A) into destination directory (B),
#   preserving the original directory structure. All files from A end up in B.
#   Files and directories matched by .gitignore rules are excluded, as are
#   .git directories.
#
# How it works:
#   Uses rsync with --filter=':- .gitignore' to honor .gitignore rules at
#   every directory level (including nested .gitignore files). The .git
#   directory itself is always excluded.
#
# Arguments:
#   $1  FROM  - Source directory (A). Must exist.
#   $2  TO    - Destination directory (B). Created if it does not exist.
#
# Usage:
#   .bin/ci_copy_to_directory_structure.sh <FROM> <TO>
#
# Examples:
#   # Copy the entire repo tree into a clean build directory
#   .bin/ci_copy_to_directory_structure.sh . /tmp/build-output
#
#   # Copy a sub-package to a staging area
#   .bin/ci_copy_to_directory_structure.sh fastify_apps/task-graph /tmp/stage
#
# Directory mapping (all files from A end up in B):
#   A/foo/bar.txt   ->  B/foo/bar.txt
#   A/src/index.mjs ->  B/src/index.mjs
#
# Ignored (not copied):
#   - .git/                (always excluded)
#   - Files matching .gitignore rules (at any level)
#
# Exit codes:
#   0  Success
#   1  Missing arguments or source directory does not exist
# ---------------------------------------------------------------------------

set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <FROM> <TO>" >&2
  exit 1
fi

FROM="${1%/}"
TO="${2%/}"

if [[ ! -d "$FROM" ]]; then
  echo "Error: source directory does not exist: $FROM" >&2
  exit 1
fi

mkdir -p "$TO"

rsync -a \
  --filter=':- .gitignore' \
  --exclude='.git' \
  "$FROM/" "$TO/"
