#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

REMOTE_URL="${1:-}"
COMMIT_MESSAGE="${2:-chore: sync smart exam scheduler updates}"
CURRENT_BRANCH="$(git branch --show-current)"

if [[ -z "$CURRENT_BRANCH" ]]; then
  echo "No active git branch found."
  exit 1
fi

if ! git remote | grep -q '^origin$'; then
  if [[ -z "$REMOTE_URL" ]]; then
    echo "Origin remote not found. Pass repo URL:"
    echo "  ./scripts/sync_github.sh https://github.com/<username>/<repo>.git"
    exit 1
  fi
  git remote add origin "$REMOTE_URL"
  echo "Added origin: $REMOTE_URL"
fi

# Remove heavy generated folders from git index if previously added.
for path in backend/node_modules frontend/node_modules frontend/build frontend/dist; do
  if [[ -n "$(git ls-files "$path" 2>/dev/null)" ]]; then
    git rm -r --cached "$path" >/dev/null 2>&1 || true
    echo "Removed from index: $path"
  fi
done

git add -A

if git diff --cached --quiet; then
  echo "No staged changes to commit."
else
  git commit -m "$COMMIT_MESSAGE"
fi

git push -u origin "$CURRENT_BRANCH"
echo "GitHub sync complete on branch: $CURRENT_BRANCH"
