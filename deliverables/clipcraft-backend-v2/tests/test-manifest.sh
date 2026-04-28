#!/usr/bin/env bash
set -euo pipefail

# Test: Verify all required files exist per the PRD and spec.
# Exit 0 on pass, non-zero on fail.

DELIVERABLE_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DELIVERABLE_ROOT"

REQUIRED_FILES=(
  "src/index.ts"
  "src/queue-producer.ts"
  "src/queue-consumer.ts"
  "src/render.ts"
  "src/extract.ts"
  "src/outline.ts"
  "src/tts.ts"
  "src/r2.ts"
  "src/db.ts"
  "wrangler.toml"
  "migrations/001_render_jobs.sql"
  "package.json"
  "tsconfig.json"
  "README-INFRA.md"
  "tests/render.test.ts"
  "tests/extract.test.ts"
)

FAIL=0
for f in "${REQUIRED_FILES[@]}"; do
  if [[ -f "$f" ]]; then
    echo "  [OK] $f"
  else
    echo "  [FAIL] MISSING: $f" >&2
    FAIL=1
  fi
done

# Also verify frontend files exist (they are outside this deliverable but required by PRD)
PASTEFORM="../github-issue-sethshoultes-shipyard-ai-92/reel/apps/web/components/PasteForm.tsx"
RENDERSTATUS="../github-issue-sethshoultes-shipyard-ai-92/reel/apps/web/components/RenderStatus.tsx"

for f in "$PASTEFORM" "$RENDERSTATUS"; do
  if [[ -f "$f" ]]; then
    echo "  [OK] $f"
  else
    echo "  [WARN] Frontend file not found (may be created later): $f"
  fi
done

if [[ "$FAIL" -ne 0 ]]; then
  echo "MANIFEST TEST FAILED: one or more required files are missing." >&2
  exit 1
fi

echo "MANIFEST TEST PASSED."
exit 0
