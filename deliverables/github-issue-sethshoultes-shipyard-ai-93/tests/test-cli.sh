#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="${PROJECT_ROOT:-$(pwd)}"
cd "$PROJECT_ROOT"

if [[ ! -f "package.json" ]]; then
  echo "FAIL: package.json not found" >&2
  exit 1
fi

if ! grep -q '"bin"' package.json; then
  echo "FAIL: package.json missing bin entry" >&2
  exit 1
fi

if ! npm ci --silent >/dev/null 2>&1; then
  echo "FAIL: npm ci failed" >&2
  exit 1
fi

if ! npm run build >/dev/null 2>&1; then
  echo "FAIL: npm run build failed" >&2
  exit 1
fi

CLI_BIN=""
if [[ -x "bin/still" ]]; then
  CLI_BIN="bin/still"
elif [[ -f "dist/cli.js" ]]; then
  CLI_BIN="dist/cli.js"
elif [[ -f "dist/index.js" ]]; then
  CLI_BIN="dist/index.js"
else
  echo "FAIL: No compiled CLI binary found (looked in bin/still, dist/cli.js, dist/index.js)" >&2
  exit 1
fi

if ! node "$CLI_BIN" --version >/dev/null 2>&1; then
  echo "FAIL: CLI --version returned non-zero" >&2
  exit 1
fi

VERSION_OUTPUT=$(node "$CLI_BIN" --version 2>&1)
if ! echo "$VERSION_OUTPUT" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+'; then
  echo "FAIL: CLI --version did not print semver: $VERSION_OUTPUT" >&2
  exit 1
fi

echo "PASS: CLI binary builds and responds to --version with semver"
exit 0
