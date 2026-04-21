#!/usr/bin/env bash
# test-banned-patterns.sh
# Verify the codebase does not contain patterns explicitly cut from v1.
# Exit 0 on pass, non-zero on fail.

set -euo pipefail

PROJECT_ROOT="${PROJECT_ROOT:-.}"
ERRORS=0

ban_pattern() {
  local pattern="$1"
  local reason="$2"
  # Search ts, tsx, js, json, toml files; exclude node_modules and tests themselves
  local matches
  matches=$(grep -ri --include='*.ts' --include='*.tsx' --include='*.js' --include='*.json' --include='*.toml' --exclude-dir='node_modules' --exclude-dir='tests' --exclude-dir='.wrangler' "$pattern" "$PROJECT_ROOT" || true)

  if [[ -n "$matches" ]]; then
    echo "FAIL: banned pattern found ($reason): '$pattern'"
    echo "$matches"
    ERRORS=$((ERRORS + 1))
  else
    echo "PASS: no banned pattern '$pattern' ($reason)"
  fi
}

echo "=== Banned Pattern Tests ==="

# Output format bans
ban_pattern '\.jpg' "JPG output is banned — PNG only"
ban_pattern '\.jpeg' "JPEG output is banned — PNG only"
ban_pattern 'image/jpeg' "JPEG mime type is banned — PNG only"

# Database bans
ban_pattern 'prisma' "Database ORM is banned — stateless only"
ban_pattern 'drizzle' "Database ORM is banned — stateless only"
ban_pattern 'postgres' "Database is banned — stateless only"
ban_pattern 'mysql' "Database is banned — stateless only"
ban_pattern 'sqlite' "Database is banned — stateless only"
ban_pattern 'mongodb' "Database is banned — stateless only"
ban_pattern 'CREATE TABLE' "Database schema is banned — stateless only"

# AI tagline bans
ban_pattern 'claude' "AI tagline generation is banned in v1"
ban_pattern 'anthropic' "AI tagline generation is banned in v1"
ban_pattern 'openai' "AI tagline generation is banned in v1"
ban_pattern 'generateTagline' "AI tagline generation is banned in v1"
ban_pattern 'aiTagline' "AI tagline generation is banned in v1"

# Visualization bans
ban_pattern 'pie' "Pie charts are banned — text labels only"
ban_pattern 'doughnut' "Doughnut charts are banned — text labels only"
ban_pattern 'chartjs' "Chart library is banned — text labels only"

# Customization bans
ban_pattern 'slider' "Customization UI is banned — one inevitable layout only"
ban_pattern 'color picker' "Customization UI is banned — one inevitable layout only"
ban_pattern 'themeId' "Multiple templates are banned — one inevitable layout only"
ban_pattern 'templateId' "Multiple templates are banned — one inevitable layout only"

# GitHub Actions integration ban
ban_pattern 'actions.yml' "GitHub Actions integration is banned in v1"
ban_pattern 'github-actions' "GitHub Actions integration is banned in v1"

# CDN font ban (self-hosted only)
ban_pattern 'fonts.googleapis' "Google Fonts CDN is banned — self-host fonts only"
ban_pattern 'fonts.gstatic' "Google Fonts CDN is banned — self-host fonts only"

if [[ "$ERRORS" -gt 0 ]]; then
  echo "=== $ERRORS failure(s) ==="
  exit 1
fi

echo "=== All banned pattern tests passed ==="
exit 0
