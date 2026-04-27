#!/usr/bin/env bash
# test-file-structure.sh
# Verifies all expected files and directories exist for the Sous frontend sprint.
# Exit 0 on pass, non-zero on fail.

set -euo pipefail

PROJECT_ROOT="${PROJECT_ROOT:-.}"
ERRORS=0

required_dirs=(
  "widget"
  "dashboard"
  "dashboard/src"
  "dashboard/src/views"
  "plugin"
  "worker"
  "infra"
  "tests"
)

required_files=(
  "widget/sous-widget.js"
  "dashboard/index.html"
  "dashboard/src/main.js"
  "dashboard/src/views/DashboardHome.js"
  "dashboard/src/views/OnboardingDetect.js"
  "dashboard/src/api.js"
  "plugin/sous.php"
  "worker/index.js"
  "worker/kv-seed.json"
  "worker/d1-schema.sql"
  "infra/wrangler.toml"
  "infra/stripe-webhook.md"
)

echo "=== File Structure Audit ==="
echo "Project root: $PROJECT_ROOT"
echo ""

for dir in "${required_dirs[@]}"; do
  path="$PROJECT_ROOT/$dir"
  if [[ -d "$path" ]]; then
    echo "[PASS] directory exists: $dir"
  else
    echo "[FAIL] directory missing: $dir"
    ERRORS=$((ERRORS + 1))
  fi
done

echo ""

for file in "${required_files[@]}"; do
  path="$PROJECT_ROOT/$file"
  if [[ -f "$path" ]]; then
    echo "[PASS] file exists: $file"
  else
    echo "[FAIL] file missing: $file"
    ERRORS=$((ERRORS + 1))
  fi
done

echo ""

# Bonus: ensure no empty directories
EMPTY_DIRS=$(find "$PROJECT_ROOT" -type d -empty 2>/dev/null | grep -v '.git' | wc -l)
if [[ "$EMPTY_DIRS" -eq 0 ]]; then
  echo "[PASS] no empty directories"
else
  echo "[FAIL] found $EMPTY_DIRS empty directories:"
  find "$PROJECT_ROOT" -type d -empty 2>/dev/null | grep -v '.git'
  ERRORS=$((ERRORS + 1))
fi

# Ensure no committed node_modules
if [[ -d "$PROJECT_ROOT/widget/node_modules" ]] || [[ -d "$PROJECT_ROOT/dashboard/node_modules" ]]; then
  echo "[FAIL] node_modules detected in widget/ or dashboard/ — add to .gitignore or remove"
  ERRORS=$((ERRORS + 1))
else
  echo "[PASS] no committed node_modules"
fi

echo ""
if [[ "$ERRORS" -eq 0 ]]; then
  echo "=== ALL CHECKS PASSED ==="
  exit 0
else
  echo "=== $ERRORS FAILURE(S) ==="
  exit 1
fi
