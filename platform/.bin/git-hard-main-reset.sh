#!/bin/bash
#
# git-hard-main-reset.sh - Reset the local main branch to match the remote
#
# Fetches the latest from origin and hard-resets the working tree to
# origin/main. Aborts if there are uncommitted changes (unless --force).
#
# Usage:
#   .bin/git-hard-main-reset.sh           # Reset to origin/main (with safety checks)
#   .bin/git-hard-main-reset.sh --force   # Skip uncommitted-changes check
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

FORCE=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --force|-f)
            FORCE=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Reset the local main branch to match origin/main."
            echo ""
            echo "Options:"
            echo "  --force, -f  Skip uncommitted-changes safety check"
            echo "  --help, -h   Show this help"
            exit 0
            ;;
        *)
            echo -e "${RED}[git-hard-main-reset]${NC} Unknown option: $1"
            exit 1
            ;;
    esac
done

cd "$ROOT_DIR"

# Ensure we are in a git repo
if ! git rev-parse --is-inside-work-tree &>/dev/null; then
    echo -e "${RED}[git-hard-main-reset]${NC} Not a git repository"
    exit 1
fi

# Check for uncommitted changes
if [ "$FORCE" = false ]; then
    if ! git diff --quiet || ! git diff --cached --quiet; then
        echo -e "${RED}[git-hard-main-reset]${NC} Uncommitted changes detected."
        echo "  Commit or stash your changes first, or use --force to override."
        exit 1
    fi
fi

CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || true)

# Checkout main if not already on it
if [[ "$CURRENT_BRANCH" != "main" ]]; then
    echo -e "${YELLOW}[git-hard-main-reset]${NC} Switching from '$CURRENT_BRANCH' to main..."
    git checkout main
fi

# Fetch latest from origin
echo -e "${YELLOW}[git-hard-main-reset]${NC} Fetching from origin..."
git fetch origin main

# Hard reset to origin/main
echo -e "${YELLOW}[git-hard-main-reset]${NC} Resetting to origin/main..."
git reset --hard origin/main

# Update submodules
if [[ -f ".gitmodules" ]]; then
    echo -e "${YELLOW}[git-hard-main-reset]${NC} Updating submodules..."
    git submodule update --init --recursive
fi

echo -e "${GREEN}[git-hard-main-reset]${NC} Reset complete. HEAD is now at $(git rev-parse --short HEAD)"
