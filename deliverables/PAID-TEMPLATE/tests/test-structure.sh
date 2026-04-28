#!/usr/bin/env bash
# test-structure.sh — Verify the required file tree exists for PAID-TEMPLATE
# Exit 0 on pass, non-zero on fail

set -euo pipefail

REPO_ROOT="/home/agent/shipyard-ai"
cd "$REPO_ROOT"

ERRORS=0

required_dirs=(
  "intake"
  "schema"
  "prd"
  "agent/prompts"
  "build"
  "deploy"
  "ops"
  "components"
  "assets"
)

required_files=(
  "intake/index.html"
  "intake/questions.json"
  "intake/mapper.js"
  "schema/template.md"
  "prd/rules.md"
  "agent/prompts/design.txt"
  "agent/prompts/component.txt"
  "agent/prompts/deploy.txt"
  "agent/guardrails.json"
  "build/index.js"
  "build/context-shard.js"
  "deploy/preview.js"
  "deploy/badge-injector.js"
  "deploy/target-config.json"
  "ops/stripe-webhook.js"
  "ops/hubspot-sync.js"
  "components/README.md"
)

for dir in "${required_dirs[@]}"; do
  if [[ ! -d "$dir" ]]; then
    echo "FAIL: Missing directory: $dir"
    ERRORS=$((ERRORS + 1))
  else
    echo "PASS: Directory exists: $dir"
  fi
done

for file in "${required_files[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "FAIL: Missing file: $file"
    ERRORS=$((ERRORS + 1))
  else
    echo "PASS: File exists: $file"
  fi
done

if [[ "$ERRORS" -gt 0 ]]; then
  echo ""
  echo "STRUCTURE TEST FAILED: $ERRORS missing item(s)"
  exit 1
fi

echo ""
echo "STRUCTURE TEST PASSED: all required directories and files present"
exit 0
