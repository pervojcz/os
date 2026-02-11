#!/bin/bash
set -ouex pipefail

SCRIPT_DIR="$(cd -- "$(dirname "$0")" > /dev/null 2>&1; pwd -P)"

if [[ -n "${TASK_NAME:-}" ]]; then
  bun "$SCRIPT_DIR/run-task.ts" "$VARIANT_NAME" "$TASK_NAME"
else
  bun "$SCRIPT_DIR/start-script.ts" "$VARIANT_NAME"
fi
