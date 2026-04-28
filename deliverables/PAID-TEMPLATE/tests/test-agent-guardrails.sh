#!/usr/bin/env bash
# test-agent-guardrails.sh — Verify agent prompts and guardrails exist and enforce scope
# Exit 0 on pass, non-zero on fail

set -euo pipefail

REPO_ROOT="/home/agent/shipyard-ai"
cd "$REPO_ROOT"

ERRORS=0

# 1. All three agent prompt files must exist and be non-empty
PROMPTS=("agent/prompts/design.txt" "agent/prompts/component.txt" "agent/prompts/deploy.txt")
for prompt in "${PROMPTS[@]}"; do
  if [[ -f "$prompt" ]] && [[ -s "$prompt" ]]; then
    echo "PASS: $prompt exists and is non-empty"
  else
    echo "FAIL: $prompt missing or empty"
    ERRORS=$((ERRORS + 1))
  fi
done

# 2. Prompt files must be under 4KB (safe for haiku input context)
for prompt in "${PROMPTS[@]}"; do
  if [[ -f "$prompt" ]]; then
    SIZE=$(stat -c%s "$prompt" 2>/dev/null || stat -f%z "$prompt" 2>/dev/null || echo "99999")
    if [[ "$SIZE" -lt 4096 ]]; then
      echo "PASS: $prompt is $SIZE bytes (<4KB)"
    else
      echo "FAIL: $prompt is $SIZE bytes (max 4096)"
      ERRORS=$((ERRORS + 1))
    fi
  fi
done

# 3. guardrails.json must exist and be valid JSON
if [[ -f "agent/guardrails.json" ]]; then
  if python3 -m json.tool "agent/guardrails.json" > /dev/null 2>&1; then
    echo "PASS: agent/guardrails.json is valid JSON"
  else
    echo "FAIL: agent/guardrails.json is not valid JSON"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "FAIL: agent/guardrails.json does not exist"
  ERRORS=$((ERRORS + 1))
fi

# 4. guardrails.json must contain banned scope keywords
if [[ -f "agent/guardrails.json" ]]; then
  BANNED_KEYWORDS=("e-commerce" "auth" "i18n" "membership" "woocommerce")
  MISSING=0
  for kw in "${BANNED_KEYWORDS[@]}"; do
    if ! grep -qi "$kw" "agent/guardrails.json"; then
      echo "FAIL: agent/guardrails.json missing banned keyword: $kw"
      MISSING=$((MISSING + 1))
    fi
  done
  if [[ "$MISSING" -eq 0 ]]; then
    echo "PASS: agent/guardrails.json contains all banned scope keywords"
  else
    ERRORS=$((ERRORS + MISSING))
  fi
fi

# 5. guardrails.json must contain max page count
if [[ -f "agent/guardrails.json" ]]; then
  if grep -qi "page.*count\|max.*page\|5.*page" "agent/guardrails.json"; then
    echo "PASS: agent/guardrails.json enforces page count limit"
  else
    echo "FAIL: agent/guardrails.json missing page count limit"
    ERRORS=$((ERRORS + 1))
  fi
fi

# 6. At least one prompt must reference guardrails
GUARDRAIL_REFS=0
for prompt in "${PROMPTS[@]}"; do
  if [[ -f "$prompt" ]] && grep -qi "guardrail" "$prompt"; then
    GUARDRAIL_REFS=$((GUARDRAIL_REFS + 1))
  fi
done
if [[ "$GUARDRAIL_REFS" -ge 1 ]]; then
  echo "PASS: At least one agent prompt references guardrails ($GUARDRAIL_REFS found)"
else
  echo "FAIL: No agent prompt references guardrails"
  ERRORS=$((ERRORS + 1))
fi

if [[ "$ERRORS" -gt 0 ]]; then
  echo ""
  echo "AGENT GUARDRAILS TEST FAILED: $ERRORS violation(s)"
  exit 1
fi

echo ""
echo "AGENT GUARDRAILS TEST PASSED"
exit 0
