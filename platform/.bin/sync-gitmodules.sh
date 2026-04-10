#!/bin/bash
#
# sync-gitmodules.sh - Prune orphaned entries from .gitmodules
#
# An orphaned entry is a submodule declared in .gitmodules that has no
# matching gitlink (mode 160000) in the git index. These orphans cause
# GitHub Desktop clone failures: "a submodule points to a commit which
# does not exist."
#
# One level only — does not recurse into nested submodules.
#
# Usage:
#   .bin/sync-gitmodules.sh              # Prune orphans, stage .gitmodules
#   .bin/sync-gitmodules.sh --dry-run    # Show what would be removed
#   .bin/sync-gitmodules.sh --check      # Exit 1 if orphans found (for CI/hooks)
#   .bin/sync-gitmodules.sh --verbose    # Detailed output
#   .bin/sync-gitmodules.sh --check --verbose  # Combine flags
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
GITMODULES="$ROOT_DIR/.gitmodules"

# Options
DRY_RUN=false
CHECK_MODE=false
VERBOSE=false

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[sync-gitmodules]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[sync-gitmodules]${NC} $1"; }
log_error() { echo -e "${RED}[sync-gitmodules]${NC} $1"; }
log_verbose() { if [ "$VERBOSE" = true ]; then echo -e "  $1"; fi; }

# Parse arguments
while [ $# -gt 0 ]; do
    case "$1" in
        --dry-run)  DRY_RUN=true;  shift ;;
        --check)    CHECK_MODE=true; shift ;;
        --verbose)  VERBOSE=true;  shift ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Prune orphaned entries from .gitmodules (entries with no"
            echo "matching gitlink in the index)."
            echo ""
            echo "Options:"
            echo "  --dry-run    Show what would be removed (no changes)"
            echo "  --check      Exit 1 if orphans found, 0 if clean (for CI/hooks)"
            echo "  --verbose    Detailed output"
            echo "  --help, -h   Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                      # Prune orphans, stage .gitmodules"
            echo "  $0 --dry-run            # Preview only"
            echo "  $0 --check --verbose    # CI gate with details"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Sanity checks
if [ ! -f "$GITMODULES" ]; then
    log_info "No .gitmodules file found — nothing to do."
    exit 0
fi

cd "$ROOT_DIR"

# Step 1: Get gitlink paths from the index (mode 160000) into a temp file
GITLINK_PATHS=$(git ls-files --stage | grep "^160000 " | sed 's/.*	//' || true)

if [ "$VERBOSE" = true ]; then
    gitlink_count=$(echo "$GITLINK_PATHS" | grep -c . || echo 0)
    log_info "Gitlinks in index: $gitlink_count"
    if [ -n "$GITLINK_PATHS" ]; then
        echo "$GITLINK_PATHS" | while IFS= read -r p; do
            log_verbose "  gitlink: $p"
        done
    fi
fi

# Step 2: Get declared paths and sections from .gitmodules
DECLARED_ENTRIES=$(git config --file "$GITMODULES" --get-regexp '\.path$' 2>/dev/null || true)

if [ "$VERBOSE" = true ]; then
    declared_count=$(echo "$DECLARED_ENTRIES" | grep -c . || echo 0)
    log_info "Entries in .gitmodules: $declared_count"
    if [ -n "$DECLARED_ENTRIES" ]; then
        echo "$DECLARED_ENTRIES" | while IFS= read -r line; do
            path="${line##* }"
            log_verbose "  declared: $path"
        done
    fi
fi

# Step 3: Find orphans (in .gitmodules but not in gitlinks)
ORPHAN_COUNT=0
ORPHAN_PATHS=""
ORPHAN_SECTIONS=""

if [ -n "$DECLARED_ENTRIES" ]; then
    while IFS= read -r line; do
        [ -z "$line" ] && continue
        section="${line%%.path *}"    # submodule.<name>
        path="${line##* }"            # <path>

        # Check if this path exists in gitlinks
        if ! echo "$GITLINK_PATHS" | grep -qxF "$path"; then
            ORPHAN_COUNT=$((ORPHAN_COUNT + 1))
            ORPHAN_PATHS="${ORPHAN_PATHS}${path}
"
            ORPHAN_SECTIONS="${ORPHAN_SECTIONS}${section}
"
        fi
    done <<EOF
$DECLARED_ENTRIES
EOF
fi

# Report results
if [ "$ORPHAN_COUNT" -eq 0 ]; then
    log_info "No orphaned entries found — .gitmodules is clean."
    exit 0
fi

log_warn "Found $ORPHAN_COUNT orphaned entry/entries in .gitmodules:"

# Print orphan details
i=1
echo "$ORPHAN_PATHS" | while IFS= read -r path; do
    [ -z "$path" ] && continue
    section=$(echo "$ORPHAN_SECTIONS" | sed -n "${i}p")
    echo -e "  ${YELLOW}-${NC} $path  ${YELLOW}[$section]${NC}"
    i=$((i + 1))
done

# --check mode: just report and exit
if [ "$CHECK_MODE" = true ]; then
    echo ""
    log_warn "Run '.bin/sync-gitmodules.sh' to prune these entries."
    exit 1
fi

# --dry-run mode: report only
if [ "$DRY_RUN" = true ]; then
    echo ""
    log_info "(dry-run) No changes made."
    exit 0
fi

# Step 4: Remove orphan sections from .gitmodules and local git config
echo "$ORPHAN_SECTIONS" | while IFS= read -r section; do
    [ -z "$section" ] && continue
    log_info "Removing [$section] from .gitmodules"
    git config --file "$GITMODULES" --remove-section "$section" 2>/dev/null || true
    # Also clean local git config if present
    git config --local --remove-section "$section" 2>/dev/null || true
done

# Step 5: Stage .gitmodules
git add "$GITMODULES"
log_info "Staged .gitmodules"

echo ""
log_info "Done — pruned $ORPHAN_COUNT orphaned entry/entries."
log_info "Review with 'git diff --cached .gitmodules' before committing."
