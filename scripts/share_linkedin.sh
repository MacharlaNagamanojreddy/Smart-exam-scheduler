#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: ./scripts/share_linkedin.sh <github_repo_url> [post_text]"
  exit 1
fi

REPO_URL="$1"
POST_TEXT="${2:-Built Smart Exam Scheduler with real-time sync, auth, and CSP+GA scheduling.}"

URL_ENCODED="$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1], safe=''))" "$REPO_URL")"
TEXT_ENCODED="$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1], safe=''))" "$POST_TEXT")"

SHARE_URL="https://www.linkedin.com/feed/?shareActive=true&text=${TEXT_ENCODED}%20${URL_ENCODED}"

echo "Open this URL to post on LinkedIn:"
echo "$SHARE_URL"

if command -v open >/dev/null 2>&1; then
  open "$SHARE_URL"
fi
