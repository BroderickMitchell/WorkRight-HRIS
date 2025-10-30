#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: run-all.sh [options]

Launches the WorkRight HRIS API and web applications in development mode.
By default, both services are started. Optional flags can restrict what is
started or provision local infrastructure dependencies via Docker Compose.

Options:
  --with-deps    Start supporting services (db, redis, minio, mailhog) using
                 docker compose before launching the applications.
  --api-only     Only start the API service.
  --web-only     Only start the web application.
  -h, --help     Display this help text.
USAGE
}

WITH_DEPS=false
START_API=true
START_WEB=true

while [[ $# -gt 0 ]]; do
  case "$1" in
    --with-deps)
      WITH_DEPS=true
      ;;
    --api-only)
      START_WEB=false
      ;;
    --web-only)
      START_API=false
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 64
      ;;
  esac
  shift
done

if ! $START_API && ! $START_WEB; then
  echo "Nothing to launch: both --api-only and --web-only were supplied." >&2
  exit 64
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "Error: pnpm is required but was not found in PATH." >&2
  exit 127
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f pnpm-workspace.yaml ]]; then
  echo "Error: run-all.sh must be executed from within the repository root." >&2
  exit 1
fi

if $WITH_DEPS; then
  if ! command -v docker >/dev/null 2>&1; then
    echo "Error: docker is required when using --with-deps." >&2
    exit 127
  fi
  if ! docker compose version >/dev/null 2>&1; then
    echo "Error: docker compose v2 is required when using --with-deps." >&2
    exit 127
  fi

  echo "\n>> Starting local infrastructure dependencies (db, redis, minio, mailhog)..."
  docker compose up -d db redis minio mailhog
fi

PIDS=()

cleanup() {
  for pid in "${PIDS[@]}"; do
    if [[ -n "$pid" ]] && kill -0 "$pid" >/dev/null 2>&1; then
      kill "$pid" >/dev/null 2>&1 || true
    fi
  done
}

cleanup_and_wait() {
  trap - EXIT
  local code=$?
  cleanup
  for pid in "${PIDS[@]}"; do
    if [[ -n "$pid" ]]; then
      wait "$pid" >/dev/null 2>&1 || true
    fi
  done
  exit "$code"
}
trap cleanup_and_wait EXIT
trap 'cleanup; exit 130' INT
trap 'cleanup; exit 143' TERM

if $START_API; then
  echo ">> Launching API: pnpm --filter api run start:dev"
  pnpm --filter api run start:dev &
  PIDS+=($!)
fi

if $START_WEB; then
  echo ">> Launching Web: pnpm --filter web dev"
  pnpm --filter web dev &
  PIDS+=($!)
fi

set +e
wait -n "${PIDS[@]}"
EXIT_CODE=$?
set -e

if [[ $EXIT_CODE -ne 0 ]]; then
  echo "\nA process exited with status $EXIT_CODE. Shutting down remaining services..."
else
  echo "\nA process exited. Shutting down remaining services..."
fi

exit "$EXIT_CODE"
