#!/usr/bin/env bash
set -euo pipefail

# Re-register all submodules from .gitmodules into the git index
# then clone their contents.

cd "$(git rev-parse --show-toplevel)"

if [ ! -f .gitmodules ]; then
  echo "No .gitmodules found"
  exit 1
fi

# Parse .gitmodules for path/url pairs
paths=()
urls=()
while IFS= read -r line; do
  if [[ "$line" =~ path\ =\ (.*) ]]; then
    paths+=("${BASH_REMATCH[1]}")
  elif [[ "$line" =~ url\ =\ (.*) ]]; then
    urls+=("${BASH_REMATCH[1]}")
  fi
done < .gitmodules

count=${#paths[@]}
echo "Found $count submodules in .gitmodules"

for ((i=0; i<count; i++)); do
  p="${paths[$i]}"
  u="${urls[$i]}"

  # Check if already in the index
  if git ls-files --stage -- "$p" | grep -q "160000"; then
    echo "SKIP  $p (already registered)"
    continue
  fi

  # Remove empty directory if it exists (blocks git submodule add)
  if [ -d "$p" ] && [ -z "$(ls -A "$p" 2>/dev/null)" ]; then
    echo "CLEAN $p (removing empty dir)"
    rmdir "$p"
  fi

  echo "ADD   $p <- $u"
  mkdir -p "$(dirname "$p")"
  git submodule add --force "$u" "$p" 2>&1 || echo "FAIL  $p"
done

echo ""
echo "Done. Running git submodule update..."
git submodule update --init
echo "All submodules initialized."
