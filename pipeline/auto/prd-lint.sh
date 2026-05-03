#!/usr/bin/env bash
# PRD linter — runs before a PRD enters the pipeline.
# Exits 0 = pass, 1 = lint failure (blocks queueing).
# Reads PRD path from $1, writes report to <prd>.lint-report.md alongside.
#
# Designed conservative: only flags clear failure patterns from real incidents (2026-05-03).
# Adjust by editing the rule blocks below. Keep <50 rules. If complexity grows, port to Python.

set -u
PRD="${1:-}"
[ -n "$PRD" ] || { echo "usage: $0 <prd-path>"; exit 2; }
[ -f "$PRD" ] || { echo "lint: file not found: $PRD"; exit 2; }

REPORT="${PRD%.md}.lint-report.md"
SLUG=$(basename "$PRD" .md)
FAILS=()
WARNS=()
SIZE=$(wc -c < "$PRD")
LINES=$(wc -l < "$PRD")

# ── Skip linting for templates ──
case "$SLUG" in
  TEMPLATE|CODE-TEMPLATE|PAID-TEMPLATE) exit 0 ;;
esac

# ── Skip linting for github-issue auto-converted dream PRDs (intake handles those) ──
# But warn loudly so dream stubs get rewritten before they waste pipeline time.
if [[ "$SLUG" == github-issue-* ]] || grep -q '^> Auto-generated from GitHub issue' "$PRD"; then
  if [ "$SIZE" -lt 1500 ]; then
    WARNS+=("Auto-generated dream stub is short ($SIZE bytes). Builder likely produces markdown, not source. Consider promoting to a proper code PRD before queueing.")
  fi
  # don't hard-fail dream PRDs — they bypass lint by design
fi

# ── Hard fails ──

# Rule 1: too small
if [ "$SIZE" -lt 500 ]; then
  FAILS+=("PRD is too small ($SIZE bytes < 500). Add concrete file list, acceptance criteria, and test commands.")
fi

# Rule 2: read-existing pattern without embedded data
# Trigger if PRD says "READ each ..." or "synthesize description" without "EXACT contents" or "verbatim"
if grep -qiE 'READ each|read all the.*files|read every|synthesize a description|describe each' "$PRD" 2>/dev/null; then
  if ! grep -qiE 'EXACT contents|verbatim|literal copy-paste|pre-baked|pre-researched|embedded below' "$PRD" 2>/dev/null; then
    FAILS+=("Anti-pattern detected: PRD asks builder to READ existing code AND synthesize without embedding the data. Builders write markdown, not source. Either embed the data in 'EXACT contents' blocks, or scope the PRD to creating new code from scratch.")
  fi
fi

# Rule 3: missing acceptance criteria section
if ! grep -qiE '^##\s*Acceptance|^##\s*Success Criteria' "$PRD"; then
  FAILS+=("Missing 'Acceptance Criteria' or 'Success Criteria' section. Build gate cannot verify the PRD without testable assertions.")
fi

# Rule 4: missing required-files list
# Check for any of: "Required Files", "Required Output", explicit file list, or known file extensions in code blocks
if ! grep -qiE '^##\s*Required (Files|Output|Deliverables)|deliverables/.*\.(ts|tsx|js|jsx|py|php|go|rs|md)' "$PRD"; then
  FAILS+=("No Required Files / Required Output section and no explicit file paths. Builder will guess what to write. Add a section listing every file the build must produce.")
fi

# Rule 5: no source-code file extensions mentioned anywhere
# Hollow-build gate counts only .ts/.tsx/.js/.jsx/.php/.py/.go/.rs files. If PRD mentions none, hollow gate will fire.
if ! grep -qE '\.(ts|tsx|js|jsx|php|py|go|rs)\b' "$PRD"; then
  # exception: docs-only PRDs are OK
  if ! grep -qiE '^type:\s*docs|^##.*docs.only|documentation.only' "$PRD"; then
    FAILS+=("PRD mentions no source-code file extensions (.ts/.tsx/.js/.php/.py/.go/.rs). Hollow-build gate will reject the build. If this is a docs-only PRD, add 'type: docs' to frontmatter.")
  fi
fi

# ── Warns (don't block, but log) ──

# Rule W1: missing test commands
if ! grep -qiE '^##\s*Test Commands|^##\s*Test Instructions|^##\s*Tests' "$PRD"; then
  WARNS+=("No 'Test Commands' or 'Test Instructions' section. QA cannot verify the build.")
fi

# Rule W2: missing out-of-scope
if ! grep -qiE '^##\s*Out of Scope|^##\s*Done When' "$PRD"; then
  WARNS+=("No 'Out of Scope' or 'Done When' section. Risk of scope creep during build.")
fi

# Rule W3: missing rock mapping (per EOS)
if ! grep -qiE 'rock\s*[:#]|maps to rock|tied to rock' "$PRD"; then
  WARNS+=("No rock mapping. EOS-CONTEXT.md requires PRDs to map to a quarterly rock.")
fi

# Rule W4: vague language
if grep -qiE 'should work correctly|looks good|polish|cleanup|various improvements|misc fixes' "$PRD"; then
  WARNS+=("Vague language detected ('should work', 'looks good', etc.). Replace with testable assertions.")
fi

# ── Build report ──
{
  echo "# Lint Report — $SLUG"
  echo
  echo "PRD: \`$PRD\`"
  echo "Size: $SIZE bytes / $LINES lines"
  echo "Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo
  if [ ${#FAILS[@]} -eq 0 ] && [ ${#WARNS[@]} -eq 0 ]; then
    echo "## ✅ PASS"
    echo
    echo "No issues found. PRD will be queued."
  else
    if [ ${#FAILS[@]} -gt 0 ]; then
      echo "## ❌ HARD FAILS (${#FAILS[@]})"
      echo
      for f in "${FAILS[@]}"; do echo "- $f"; done
      echo
    fi
    if [ ${#WARNS[@]} -gt 0 ]; then
      echo "## ⚠️ WARNINGS (${#WARNS[@]})"
      echo
      for w in "${WARNS[@]}"; do echo "- $w"; done
      echo
    fi
    echo "## How to fix"
    echo
    echo "Read \`/home/agent/shipyard-ai/prds/CODE-TEMPLATE.md\` for the expected structure."
    echo "Edit this PRD locally and re-deploy: \`scp -i ~/.ssh/greatminds <prd> root@164.90.151.82:/home/agent/shipyard-ai/prds/\`"
  fi
} > "$REPORT"

if [ ${#FAILS[@]} -gt 0 ]; then
  exit 1
fi
exit 0
