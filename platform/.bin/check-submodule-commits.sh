#!/bin/bash
#
# check-submodule-commits.sh - Verify staged submodule commits exist on their remotes
#
# Prevents committing submodule pointer updates where the referenced commit
# hasn't been pushed to the submodule's remote. Without this check, cloning
# the repo on another machine fails with:
#   "a submodule points to a commit which does not exist"
#
# Usage:
#   .bin/check-submodule-commits.sh           # Check staged submodule changes
#   .bin/check-submodule-commits.sh --all     # Check all submodules (not just staged)
#   .bin/check-submodule-commits.sh --verbose # Show detailed output
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Options
CHECK_ALL=false
VERBOSE=false

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${YELLOW}[submodule-check]${NC} $1"
    fi
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --all|-a)
            CHECK_ALL=true
            shift
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Checks that submodule commits exist on their remotes."
            echo ""
            echo "Options:"
            echo "  --all, -a      Check all submodules (not just staged changes)"
            echo "  --verbose, -v  Show detailed output"
            echo "  --help, -h     Show this help"
            exit 0
            ;;
        *)
            echo -e "${RED}[submodule-check]${NC} Unknown option: $1"
            exit 1
            ;;
    esac
done

cd "$ROOT_DIR"

if [[ ! -f ".gitmodules" ]]; then
    log_verbose "No .gitmodules found, nothing to check"
    exit 0
fi

# Collect submodule paths and SHAs to check (parallel arrays for bash 3 compat)
SM_PATHS=()
SM_SHAS=()

if [ "$CHECK_ALL" = true ]; then
    while IFS= read -r line; do
        sm_sha=$(echo "$line" | awk '{print $1}' | sed 's/^[-+U]*//')
        sm_path=$(echo "$line" | awk '{print $2}')
        if [[ -n "$sm_path" && -n "$sm_sha" ]]; then
            SM_PATHS+=("$sm_path")
            SM_SHAS+=("$sm_sha")
        fi
    done < <(git submodule status 2>/dev/null)
else
    # Only check submodules with staged changes
    STAGED_FILES=$(git diff --cached --name-only 2>/dev/null || true)
    while IFS= read -r sm_line; do
        sm_path=$(echo "$sm_line" | sed 's/.*path = //' | tr -d '[:space:]')
        if echo "$STAGED_FILES" | grep -q "^${sm_path}$"; then
            # Get the staged SHA from the index
            sm_sha=$(git ls-files --stage -- "$sm_path" 2>/dev/null | awk '{print $2}' || true)
            if [[ -n "$sm_sha" ]]; then
                SM_PATHS+=("$sm_path")
                SM_SHAS+=("$sm_sha")
            fi
        fi
    done < <(grep 'path = ' .gitmodules)
fi

if [[ ${#SM_PATHS[@]} -eq 0 ]]; then
    log_verbose "No submodule changes to check"
    exit 0
fi

log_verbose "Checking ${#SM_PATHS[@]} submodule(s)..."

FAILED=false
FAILED_MODULES=()

for i in "${!SM_PATHS[@]}"; do
    sm_path="${SM_PATHS[$i]}"
    sm_sha="${SM_SHAS[$i]}"
    log_verbose "Checking $sm_path @ ${sm_sha:0:12}"

    # Get the remote URL for this submodule
    sm_url=""
    # Find the submodule name by matching path in .gitmodules
    sm_name=$(git config --file .gitmodules --name-only --get-regexp 'submodule\..*\.path' "^${sm_path}$" 2>/dev/null \
        | sed 's/\.path$//' | sed 's/^submodule\.//' || true)
    if [[ -n "$sm_name" ]]; then
        sm_url=$(git config --file .gitmodules --get "submodule.${sm_name}.url" 2>/dev/null || true)
    fi

    if [[ -z "$sm_url" ]]; then
        echo -e "${YELLOW}[submodule-check]${NC} Warning: Could not find remote URL for $sm_path, skipping"
        continue
    fi

    log_verbose "  Remote: $sm_url"

    # Check if the commit exists on the remote using ls-remote
    REMOTE_REFS=$(git ls-remote "$sm_url" 2>/dev/null || true)

    if [[ -z "$REMOTE_REFS" ]]; then
        echo -e "${YELLOW}[submodule-check]${NC} Warning: Could not reach remote for $sm_path ($sm_url), skipping"
        continue
    fi

    # Check if the exact SHA appears as a ref tip on the remote
    if echo "$REMOTE_REFS" | grep -q "^${sm_sha}"; then
        log_verbose "  OK: Commit is a ref tip on remote"
        continue
    fi

    # The SHA might not be a ref tip but could still exist on the remote.
    # Use the submodule's local repo to verify reachability from remote branches.
    if [[ -d "$sm_path/.git" || -f "$sm_path/.git" ]]; then
        # Fetch latest from remote
        if git -C "$sm_path" fetch --quiet 2>/dev/null; then
            log_verbose "  Fetched latest from remote"
        fi

        # Check if the commit is reachable from any remote branch
        REMOTE_BRANCHES=$(git -C "$sm_path" branch -r --list 'origin/*' 2>/dev/null | tr -d ' ' || true)
        FOUND=false
        for rbranch in $REMOTE_BRANCHES; do
            if git -C "$sm_path" merge-base --is-ancestor "$sm_sha" "$rbranch" 2>/dev/null; then
                log_verbose "  OK: Commit is reachable from $rbranch"
                FOUND=true
                break
            fi
        done

        if [ "$FOUND" = true ]; then
            continue
        fi

        # Commit exists locally but not on any remote branch
        if git -C "$sm_path" cat-file -t "$sm_sha" &>/dev/null; then
            echo -e "${RED}[submodule-check]${NC} $sm_path @ ${sm_sha:0:12}"
            echo -e "  Commit exists locally but is NOT pushed to remote"
            echo -e "  Remote: $sm_url"
            echo -e "  Fix: cd $sm_path && git push"
            FAILED=true
            FAILED_MODULES+=("$sm_path")
        else
            echo -e "${RED}[submodule-check]${NC} $sm_path @ ${sm_sha:0:12}"
            echo -e "  Commit does not exist locally or on remote"
            echo -e "  Remote: $sm_url"
            FAILED=true
            FAILED_MODULES+=("$sm_path")
        fi
    else
        # Submodule not initialized locally - can only check remote ref tips
        echo -e "${RED}[submodule-check]${NC} $sm_path @ ${sm_sha:0:12}"
        echo -e "  Commit not found in remote refs (submodule not initialized locally)"
        echo -e "  Remote: $sm_url"
        echo -e "  Fix: git submodule update --init $sm_path && cd $sm_path && git push"
        FAILED=true
        FAILED_MODULES+=("$sm_path")
    fi
done

if [ "$FAILED" = true ]; then
    echo ""
    echo -e "${RED}Submodule commit(s) not found on remote!${NC}"
    echo ""
    echo "The following submodule(s) reference commits that don't exist on their remotes:"
    for mod in "${FAILED_MODULES[@]}"; do
        echo "  - $mod"
    done
    echo ""
    echo "This will cause clone failures on other machines."
    echo "Push the submodule commits before committing the parent repo."
    exit 1
fi

log_verbose "All submodule commits verified on remotes"
exit 0
