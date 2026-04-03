#!/bin/bash
# qa-visual-check.sh — Margaret Hamilton, QA Director
# Visual QA check for all Shipyard AI example sites
# Takes screenshots, checks images, verifies no template defaults remain

set -euo pipefail

export LD_LIBRARY_PATH=~/libs/extracted/usr/lib/x86_64-linux-gnu

SCREENSHOT_DIR="/tmp/qa-screenshots"
REPORT_FILE="/home/agent/shipyard-ai/qa-report-003.md"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

mkdir -p "$SCREENSHOT_DIR"

echo "# QA Report 003 — Visual Check" > "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "**Reviewer:** Margaret Hamilton, QA Director" >> "$REPORT_FILE"
echo "**Date:** $TIMESTAMP" >> "$REPORT_FILE"
echo "**Method:** Puppeteer screenshots + HTTP image verification + template reference scan" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "---" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

log_pass() {
  echo "  ✅ PASS: $1" >> "$REPORT_FILE"
  ((PASS_COUNT++))
}

log_fail() {
  echo "  ❌ FAIL: $1" >> "$REPORT_FILE"
  ((FAIL_COUNT++))
}

log_warn() {
  echo "  ⚠️  WARN: $1" >> "$REPORT_FILE"
  ((WARN_COUNT++))
}

# --- Step 1: Take screenshots ---
echo "## 1. Screenshots" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

node -e "
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const sites = [
    { name: 'bellas', port: 4321, pages: ['/', '/pricing', '/contact'] },
    { name: 'dental', port: 4322, pages: ['/', '/pricing', '/contact'] },
    { name: 'craft',  port: 4323, pages: ['/', '/work', '/contact'] },
  ];

  const results = [];
  for (const site of sites) {
    for (const p of site.pages) {
      const url = 'http://localhost:' + site.port + p;
      const slug = site.name + (p === '/' ? '-home' : p.replace(/\\//g, '-'));
      const filepath = '$SCREENSHOT_DIR/' + slug + '.png';
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
        await page.screenshot({ path: filepath, fullPage: true });
        results.push({ site: site.name, page: p, status: 'ok', file: filepath });
      } catch (e) {
        results.push({ site: site.name, page: p, status: 'fail', error: e.message });
      }
    }
  }
  console.log(JSON.stringify(results));
  await browser.close();
})();
" 2>/dev/null | python3 -c "
import json, sys
data = json.load(sys.stdin)
for r in data:
    if r['status'] == 'ok':
        print(f\"SCREENSHOT_OK {r['site']} {r['page']} {r['file']}\")
    else:
        print(f\"SCREENSHOT_FAIL {r['site']} {r['page']} {r['error']}\")
" | while read -r line; do
  echo "- $line" >> "$REPORT_FILE"
done

echo "" >> "$REPORT_FILE"

# --- Step 2: Check all img src URLs for HTTP 200 ---
echo "## 2. Image URL Verification" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

for port_site in "4321:bellas" "4322:dental" "4323:craft"; do
  PORT="${port_site%%:*}"
  SITE="${port_site##*:}"

  echo "### $SITE (port $PORT)" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"

  # Get all pages
  case "$SITE" in
    bellas) PAGES="/ /pricing /contact" ;;
    dental) PAGES="/ /pricing /contact" ;;
    craft)  PAGES="/ /work /contact" ;;
  esac

  for PAGE in $PAGES; do
    FOUND_IMAGES=0
    # Fetch page HTML and extract img src values
    HTML=$(curl -s "http://localhost:${PORT}${PAGE}" 2>/dev/null || echo "")

    if [ -z "$HTML" ]; then
      log_fail "$SITE$PAGE — page failed to load"
      continue
    fi

    # Extract img src URLs (handles both extension-ending and query-param URLs like Unsplash)
    IMG_URLS=$(echo "$HTML" | grep -oP '<img[^>]+src="[^"]*"' | grep -oP 'src="[^"]*"' | sed 's/src="//;s/"$//' | sort -u || true)

    if [ -z "$IMG_URLS" ]; then
      log_warn "$SITE$PAGE — no img tags with image src found"
    else
      while IFS= read -r img_url; do
        FOUND_IMAGES=1
        # Make absolute URL if relative
        if [[ "$img_url" == /* ]]; then
          CHECK_URL="http://localhost:${PORT}${img_url}"
        elif [[ "$img_url" == http* ]]; then
          CHECK_URL="$img_url"
        else
          CHECK_URL="http://localhost:${PORT}/${img_url}"
        fi

        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$CHECK_URL" 2>/dev/null || echo "000")

        if [ "$HTTP_CODE" = "200" ]; then
          log_pass "$SITE$PAGE — image $img_url → $HTTP_CODE"
        else
          log_fail "$SITE$PAGE — BROKEN IMAGE: $img_url → HTTP $HTTP_CODE"
        fi
      done <<< "$IMG_URLS"
    fi

    # Check for display:none on hero images
    HIDDEN_IMGS=$(echo "$HTML" | grep -oP '<img[^>]*style="[^"]*display:\s*none[^"]*"[^>]*>' || true)
    if [ -n "$HIDDEN_IMGS" ]; then
      log_fail "$SITE$PAGE — found hidden img with display:none"
    fi
  done

  echo "" >> "$REPORT_FILE"
done

# --- Step 3: Check for template defaults / acme references ---
echo "## 3. Template Default Scan" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

for port_site in "4321:bellas" "4322:dental" "4323:craft"; do
  PORT="${port_site%%:*}"
  SITE="${port_site##*:}"

  echo "### $SITE" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"

  for PAGE in / /pricing /contact; do
    HTML=$(curl -s "http://localhost:${PORT}${PAGE}" 2>/dev/null || echo "")

    # Check for "acme" (case-insensitive, skip CSS/JS noise)
    ACME_HITS=$(echo "$HTML" | grep -ioP '(?<![a-z])acme(?![a-z])' | wc -l)
    if [ "$ACME_HITS" -gt 0 ]; then
      log_fail "$SITE$PAGE — found 'acme' $ACME_HITS times in rendered HTML"
    else
      log_pass "$SITE$PAGE — no 'acme' references"
    fi

    # Check for "undefined" in visible content (skip script tags)
    VISIBLE_HTML=$(echo "$HTML" | sed 's/<script[^>]*>.*<\/script>//g' 2>/dev/null || echo "$HTML")
    UNDEF_HITS=$(echo "$VISIBLE_HTML" | grep -oP '(?<!")undefined(?!")' | wc -l)
    if [ "$UNDEF_HITS" -gt 0 ]; then
      log_warn "$SITE$PAGE — found 'undefined' $UNDEF_HITS times outside scripts"
    else
      log_pass "$SITE$PAGE — no 'undefined' in visible content"
    fi

    # Check for /signup links
    SIGNUP_HITS=$(echo "$HTML" | grep -oP 'href="/signup"' | wc -l)
    if [ "$SIGNUP_HITS" -gt 0 ]; then
      log_fail "$SITE$PAGE — found /signup link ($SIGNUP_HITS occurrences) — 404!"
    else
      log_pass "$SITE$PAGE — no /signup links"
    fi

    # Check for lorem ipsum
    LOREM_HITS=$(echo "$HTML" | grep -ioP 'lorem ipsum' | wc -l)
    if [ "$LOREM_HITS" -gt 0 ]; then
      log_fail "$SITE$PAGE — found 'lorem ipsum' $LOREM_HITS times"
    else
      log_pass "$SITE$PAGE — no lorem ipsum"
    fi

    # Check for "Build products people actually want" (template tagline)
    TAGLINE_HITS=$(echo "$HTML" | grep -oP 'Build products people actually want' | wc -l)
    if [ "$TAGLINE_HITS" -gt 0 ]; then
      log_fail "$SITE$PAGE — found template default tagline 'Build products people actually want'"
    else
      log_pass "$SITE$PAGE — no template default tagline"
    fi
  done

  echo "" >> "$REPORT_FILE"
done

# --- Summary ---
echo "---" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "## Summary" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "| Metric | Count |" >> "$REPORT_FILE"
echo "|--------|-------|" >> "$REPORT_FILE"
echo "| Passes | $PASS_COUNT |" >> "$REPORT_FILE"
echo "| Failures | $FAIL_COUNT |" >> "$REPORT_FILE"
echo "| Warnings | $WARN_COUNT |" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

if [ "$FAIL_COUNT" -gt 0 ]; then
  echo "**VERDICT: BLOCK** — $FAIL_COUNT failures require attention before deploy." >> "$REPORT_FILE"
elif [ "$WARN_COUNT" -gt 0 ]; then
  echo "**VERDICT: PASS WITH WARNINGS** — $WARN_COUNT warnings noted, no blockers." >> "$REPORT_FILE"
else
  echo "**VERDICT: PASS** — All checks passed." >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
echo "---" >> "$REPORT_FILE"
echo "*Margaret Hamilton, QA Director — \"Would this survive a production incident at 3 AM?\"*" >> "$REPORT_FILE"

echo ""
echo "=========================================="
echo "QA Visual Check Complete"
echo "  Passes:   $PASS_COUNT"
echo "  Failures: $FAIL_COUNT"
echo "  Warnings: $WARN_COUNT"
echo "  Report:   $REPORT_FILE"
echo "=========================================="
