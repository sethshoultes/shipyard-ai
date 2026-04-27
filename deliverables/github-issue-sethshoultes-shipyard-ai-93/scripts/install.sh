#!/usr/bin/env bash
set -euo pipefail

if ! command -v npm &> /dev/null; then
  echo "Error: npm is required but not installed" >&2
  exit 1
fi

npm install -g still
still install
echo "still installed and hook registered"
