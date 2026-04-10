#!/usr/bin/env bash
# dev-fastify-watch.sh - Watch, build, and restart Fastify server with debouncing
#
# Watches source directories for file changes. When changes are detected,
# waits for a throttle period (to batch rapid changes), runs the build,
# then restarts the Fastify server.
#
# Required env: MAKEFILE_DIR
# Optional env: THROTTLE_SECS (default: 2)

set -euo pipefail

: "${MAKEFILE_DIR:?MAKEFILE_DIR must be set}"

THROTTLE="${THROTTLE_SECS:-2}"
MARKER="/tmp/.mta-fastify-watch-$$"
SERVER_LOG="${MAKEFILE_DIR}logs/fastify-server.log"
PID=""

# Crash detection: if server crashes within this many seconds, it's a startup failure
CRASH_THRESHOLD_SECS=5
LAST_START_TIME=0
CONSECUTIVE_CRASHES=0
MAX_CONSECUTIVE_CRASHES=3

# Directories to watch (relative to MAKEFILE_DIR)
WATCH_DIRS=(
  packages_mjs
  polyglot/*/mjs
  common
  fastify_apps/*/backend
  fastify_apps/*/api
  fastify_server/src
  fastify_server/routes
  fastify_server/config
  fastify_server/computed_functions
)

cleanup() {
  [ -n "${PID:-}" ] && kill "$PID" 2>/dev/null || true
  rm -f "$MARKER"
  exit 0
}
trap cleanup INT TERM EXIT

stop_server() {
  if [ -n "${PID:-}" ] && kill -0 "$PID" 2>/dev/null; then
    kill "$PID" 2>/dev/null || true
    wait "$PID" 2>/dev/null || true
  fi
  PID=""
}

start_server() {
  mkdir -p "${MAKEFILE_DIR}logs"
  LAST_START_TIME=$(date +%s)
  (cd "${MAKEFILE_DIR}fastify_server" && exec node src/main.mjs 2>&1 | tee -a "$SERVER_LOG") &
  PID=$!
}

run_build() {
  echo "[watch] Building..."
  (cd "${MAKEFILE_DIR}" && pnpm run build 2>&1) || echo "[watch] Build completed with errors"
}

show_crash_error() {
  echo ""
  echo "=========================================="
  echo "[watch] SERVER CRASHED ON STARTUP"
  echo "=========================================="
  echo ""
  echo "The server crashed $CONSECUTIVE_CRASHES time(s) within ${CRASH_THRESHOLD_SECS}s of starting."
  echo "This usually indicates a fatal error (missing dependency, syntax error, etc.)"
  echo ""
  echo "Last 30 lines of server log:"
  echo "------------------------------------------"
  tail -30 "$SERVER_LOG" 2>/dev/null || echo "(no log available)"
  echo "------------------------------------------"
  echo ""
  echo "Full log: $SERVER_LOG"
  echo ""
}

# Resolve existing watch directories
FIND_PATHS=()
for d in "${WATCH_DIRS[@]}"; do
  [ -d "${MAKEFILE_DIR}${d}" ] && FIND_PATHS+=("${MAKEFILE_DIR}${d}")
done

if [ ${#FIND_PATHS[@]} -eq 0 ]; then
  echo "[watch] No watch directories found" >&2
  exit 1
fi

# Initial build and start
run_build
touch "$MARKER"

# Clear previous log
mkdir -p "${MAKEFILE_DIR}logs"
> "$SERVER_LOG"

start_server
echo "[watch] Fastify server started (PID: $PID)"
echo "[watch] Server log: $SERVER_LOG"
echo "[watch] Watching ${#FIND_PATHS[@]} directories (throttle: ${THROTTLE}s)"

while true; do
  sleep 1

  # Check for files newer than our marker
  CHANGED=$(find "${FIND_PATHS[@]}" \
    -type f \( -name "*.mjs" -o -name "*.js" -o -name "*.ts" -o -name "*.json" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/dist/*" \
    -not -path "*/.nx/*" \
    -not -path "*/build/*" \
    -newer "$MARKER" 2>/dev/null | head -1) || true

  if [ -n "$CHANGED" ]; then
    # Debounce: wait for changes to settle
    echo "[watch] Changes detected, waiting ${THROTTLE}s for more changes..."
    sleep "$THROTTLE"
    touch "$MARKER"

    # Reset crash counter on intentional restart
    CONSECUTIVE_CRASHES=0

    stop_server
    run_build
    start_server
    echo "[watch] Server restarted (PID: $PID)"
  fi

  # Auto-restart if server crashed
  if [ -n "${PID:-}" ] && ! kill -0 "$PID" 2>/dev/null; then
    NOW=$(date +%s)
    UPTIME=$((NOW - LAST_START_TIME))

    if [ "$UPTIME" -lt "$CRASH_THRESHOLD_SECS" ]; then
      # Rapid crash - likely a startup error
      CONSECUTIVE_CRASHES=$((CONSECUTIVE_CRASHES + 1))
      echo "[watch] Server crashed after ${UPTIME}s (crash #${CONSECUTIVE_CRASHES})"

      if [ "$CONSECUTIVE_CRASHES" -ge "$MAX_CONSECUTIVE_CRASHES" ]; then
        show_crash_error
        echo "[watch] Exiting due to repeated startup failures."
        echo "[watch] Fix the error and run 'make dev' again."
        exit 1
      fi

      echo "[watch] Retrying in 2s..."
      sleep 2
    else
      # Normal crash after running for a while - reset counter
      CONSECUTIVE_CRASHES=0
      echo "[watch] Server exited after ${UPTIME}s, restarting..."
    fi

    run_build
    start_server
    echo "[watch] Server restarted (PID: $PID)"
  fi
done
