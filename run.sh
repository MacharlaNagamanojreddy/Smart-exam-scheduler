#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required but was not found."
  exit 1
fi

is_port_in_use() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1
    return $?
  fi
  if command -v nc >/dev/null 2>&1; then
    nc -z localhost "$port" >/dev/null 2>&1
    return $?
  fi
  return 1
}

find_free_port() {
  local start_port="$1"
  local end_port="$2"
  local port
  for ((port=start_port; port<=end_port; port++)); do
    if ! is_port_in_use "$port"; then
      echo "$port"
      return 0
    fi
  done
  return 1
}

if [[ ! -f backend/config.env ]]; then
  cp backend/config.env.example backend/config.env
  echo "Created backend/config.env from example."
fi

if [[ ! -f frontend/.env ]]; then
  cp frontend/.env.example frontend/.env
  echo "Created frontend/.env from example."
fi

if [[ ! -d backend/node_modules ]]; then
  echo "Installing backend dependencies..."
  npm --prefix backend install
fi

if [[ ! -d frontend/node_modules ]]; then
  echo "Installing frontend dependencies..."
  npm --prefix frontend install
fi

if command -v nc >/dev/null 2>&1; then
  if ! nc -z localhost 27017 >/dev/null 2>&1; then
    echo "Warning: MongoDB not detected on localhost:27017."
    echo "Start MongoDB before using the app."
  fi
else
  echo "Note: 'nc' not found, skipping MongoDB port check."
fi

echo "Starting backend..."
BACKEND_PORT="$(find_free_port 5000 5010 || true)"
if [[ -z "${BACKEND_PORT}" ]]; then
  echo "No free backend port found in range 5000-5010."
  exit 1
fi
PORT="$BACKEND_PORT" npm --prefix backend run start &
BACKEND_PID=$!

echo "Starting frontend..."
FRONTEND_PORT="$(find_free_port 3000 3010 || true)"
if [[ -z "${FRONTEND_PORT}" ]]; then
  echo "No free frontend port found in range 3000-3010."
  exit 1
fi
VITE_API_URL="http://localhost:${BACKEND_PORT}/api" \
  npm --prefix frontend run dev -- --host 0.0.0.0 --port "$FRONTEND_PORT" &
FRONTEND_PID=$!

cleanup() {
  echo
  echo "Stopping dev servers..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

echo
echo "App is starting..."
echo "Frontend: http://localhost:${FRONTEND_PORT}"
echo "Backend:  http://localhost:${BACKEND_PORT}"
echo "API URL:  http://localhost:${BACKEND_PORT}/api"
echo

# Bash 3.2 on macOS does not support `wait -n`.
# Poll child processes and exit when either one stops.
while true; do
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    wait "$BACKEND_PID" 2>/dev/null || true
    break
  fi
  if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
    wait "$FRONTEND_PID" 2>/dev/null || true
    break
  fi
  sleep 1
done
