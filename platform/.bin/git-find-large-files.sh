#!/bin/bash
#
# git-find-large-files.sh - Identify large files in git history
#
# Scans git objects to find the largest files tracked in a branch or across
# the entire repository history. Useful for diagnosing bloated repos, finding
# files that should be in .gitignore or Git LFS, and cleaning up before pushes.
#
# Usage:
#   .bin/git-find-large-files.sh                      # Top 20 largest files in current branch
#   .bin/git-find-large-files.sh --all                # Top 20 across all branches
#   .bin/git-find-large-files.sh --branch feature/x   # Top 20 in specific branch
#   .bin/git-find-large-files.sh --top 50             # Show top 50
#   .bin/git-find-large-files.sh --threshold 1M       # Only files >= 1 MB
#   .bin/git-find-large-files.sh --current             # Only files in current working tree
#

set -uo pipefail
# Note: -e is intentionally omitted. Pipelines with early-exit awk (top-N filtering)
# produce SIGPIPE (exit 141) which is expected and harmless.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Defaults
TOP_N=20
BRANCH=""
ALL_BRANCHES=false
CURRENT_ONLY=false
THRESHOLD_BYTES=0
THRESHOLD_LABEL=""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# Convert human-readable size to bytes (e.g., 1M -> 1048576, 500K -> 512000)
parse_size() {
    local input="$1"
    local num unit
    num=$(echo "$input" | sed 's/[^0-9.]//g')
    unit=$(echo "$input" | sed 's/[0-9.]//g' | tr '[:lower:]' '[:upper:]')

    case "$unit" in
        B|"")  echo "${num%.*}" ;;
        K|KB)  echo "$(echo "$num * 1024" | bc | sed 's/\..*//')" ;;
        M|MB)  echo "$(echo "$num * 1048576" | bc | sed 's/\..*//')" ;;
        G|GB)  echo "$(echo "$num * 1073741824" | bc | sed 's/\..*//')" ;;
        *)     echo -e "${RED}[large-files]${NC} Unknown size unit: $unit" >&2; exit 1 ;;
    esac
}

# Format bytes to human-readable
format_size() {
    local bytes=$1
    if (( bytes >= 1073741824 )); then
        printf "%.1f GB" "$(echo "$bytes / 1073741824" | bc -l)"
    elif (( bytes >= 1048576 )); then
        printf "%.1f MB" "$(echo "$bytes / 1048576" | bc -l)"
    elif (( bytes >= 1024 )); then
        printf "%.1f KB" "$(echo "$bytes / 1024" | bc -l)"
    else
        printf "%d B" "$bytes"
    fi
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --all|-a)
            ALL_BRANCHES=true
            shift
            ;;
        --branch|-b)
            BRANCH="$2"
            shift 2
            ;;
        --top|-n)
            TOP_N="$2"
            shift 2
            ;;
        --threshold|-t)
            THRESHOLD_LABEL="$2"
            THRESHOLD_BYTES=$(parse_size "$2")
            shift 2
            ;;
        --current|-c)
            CURRENT_ONLY=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Identify large files in git history."
            echo ""
            echo "Options:"
            echo "  --all, -a              Scan all branches (default: current branch only)"
            echo "  --branch, -b BRANCH    Scan a specific branch"
            echo "  --top, -n N            Show top N files (default: 20)"
            echo "  --threshold, -t SIZE   Only show files >= SIZE (e.g., 500K, 1M, 50M)"
            echo "  --current, -c          Only scan files in current working tree"
            echo "  --help, -h             Show this help"
            echo ""
            echo "Examples:"
            echo "  $0                        # Top 20 in current branch history"
            echo "  $0 --all --top 50         # Top 50 across all branches"
            echo "  $0 --threshold 5M         # Files >= 5 MB in current branch"
            echo "  $0 --current --threshold 1M  # Large files in working tree"
            exit 0
            ;;
        *)
            echo -e "${RED}[large-files]${NC} Unknown option: $1" >&2
            exit 1
            ;;
    esac
done

cd "$ROOT_DIR"

if ! git rev-parse --is-inside-work-tree &>/dev/null; then
    echo -e "${RED}[large-files]${NC} Not a git repository" >&2
    exit 1
fi

# ─── Mode: Current working tree only ───────────────────────────────────────────
if [ "$CURRENT_ONLY" = true ]; then
    echo -e "${BOLD}Scanning current working tree for large files...${NC}"
    echo ""

    # Use git ls-tree to get blob sizes directly (no stat calls, handles large file lists)
    git ls-tree -r -l HEAD \
        | awk '{ size=$4; path=""; for(i=5;i<=NF;i++) path=(path==""?$i:path" "$i); print size "\t" path }' \
        | sort -rn \
        | awk -v threshold="$THRESHOLD_BYTES" -v top_n="$TOP_N" -F'\t' '
            BEGIN { count = 0 }
            {
                if (threshold > 0 && $1 + 0 < threshold) exit
                count++
                if (count > top_n) exit
                print $1 "\t" $2
            }
        ' \
        | while IFS=$'\t' read -r size filepath; do
            printf "  ${CYAN}%10s${NC}  %s\n" "$(format_size "$size")" "$filepath"
        done

    exit 0
fi

# ─── Mode: Git history scan ────────────────────────────────────────────────────

# Determine revision range
if [ "$ALL_BRANCHES" = true ]; then
    REV_LIST="--all"
    SCOPE_LABEL="all branches"
elif [ -n "$BRANCH" ]; then
    if ! git rev-parse --verify "$BRANCH" &>/dev/null; then
        echo -e "${RED}[large-files]${NC} Branch not found: $BRANCH" >&2
        exit 1
    fi
    REV_LIST="$BRANCH"
    SCOPE_LABEL="branch '$BRANCH'"
else
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "HEAD")
    REV_LIST="$CURRENT_BRANCH"
    SCOPE_LABEL="branch '$CURRENT_BRANCH'"
fi

THRESHOLD_MSG=""
if [ -n "$THRESHOLD_LABEL" ]; then
    THRESHOLD_MSG=" (>= $THRESHOLD_LABEL)"
fi

echo -e "${BOLD}Scanning git history for large files in ${SCOPE_LABEL}...${NC}"
echo -e "${DIM}This may take a moment for large repositories.${NC}"
echo ""

# Collect all blob objects reachable from the given revisions, then look up their sizes.
# Steps:
#   1. git rev-list --objects: lists all objects (commits, trees, blobs) with paths
#   2. Filter to blob objects and get their sizes via cat-file --batch-check
#   3. Sort by size descending and apply threshold/top filters

git rev-list --objects $REV_LIST \
    | git cat-file --batch-check='%(objecttype) %(objectsize) %(objectname) %(rest)' \
    | awk '/^blob / { print $2, $3, $4 }' \
    | sort -rn \
    | awk -v threshold="$THRESHOLD_BYTES" -v top_n="$TOP_N" '
        BEGIN { count = 0 }
        {
            size = $1
            sha  = $2
            path = ""
            for (i = 3; i <= NF; i++) {
                path = (path == "" ? $i : path " " $i)
            }
            if (threshold > 0 && size < threshold) exit
            count++
            if (count > top_n) exit
            print size "\t" sha "\t" path
        }
    ' \
    | while IFS=$'\t' read -r size sha filepath; do
        # Check if this blob still exists in the current tree
        current_sha=$(git ls-tree -r HEAD -- "$filepath" 2>/dev/null | awk '{print $3}' || true)
        if [ "$current_sha" = "$sha" ]; then
            status="${GREEN}current${NC}"
        else
            # Check if the file exists at all in HEAD
            if git ls-tree -r HEAD -- "$filepath" &>/dev/null && [ -n "$(git ls-tree -r HEAD -- "$filepath")" ]; then
                status="${YELLOW}old ver${NC}"
            else
                status="${RED}deleted${NC}"
            fi
        fi

        printf "  ${CYAN}%10s${NC}  %-9b  ${DIM}%s${NC}  %s\n" \
            "$(format_size "$size")" \
            "$status" \
            "${sha:0:10}" \
            "$filepath"
    done

echo ""
echo -e "${DIM}Status: ${GREEN}current${NC}${DIM} = in HEAD, ${YELLOW}old ver${NC}${DIM} = file changed, ${RED}deleted${NC}${DIM} = removed from HEAD${NC}"
