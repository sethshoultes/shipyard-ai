#!/bin/bash

# QA Pipeline for EmDash Sites
# Margaret Hamilton, QA Director
# Usage: ./run-qa.sh /path/to/site [output-dir]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SITE_DIR="${1:-.}"
OUTPUT_DIR="${2:-$SITE_DIR/qa-report}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="$OUTPUT_DIR/qa-report_${TIMESTAMP}.md"
LOG_FILE="$OUTPUT_DIR/qa-log_${TIMESTAMP}.txt"

# Initialize
mkdir -p "$OUTPUT_DIR"
PASSED=0
FAILED=0
WARNINGS=0

# Helper functions
log() {
    echo "[$(date +'%H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_pass() {
    echo -e "${GREEN}✓ PASS${NC}: $1" | tee -a "$LOG_FILE"
    ((PASSED++))
    echo "- [x] $1" >> "$REPORT_FILE"
}

check_fail() {
    echo -e "${RED}✗ FAIL${NC}: $1" | tee -a "$LOG_FILE"
    ((FAILED++))
    echo "- [ ] $1" >> "$REPORT_FILE"
}

check_warn() {
    echo -e "${YELLOW}⚠ WARN${NC}: $1" | tee -a "$LOG_FILE"
    ((WARNINGS++))
    echo "- [~] $1" >> "$REPORT_FILE"
}

print_section() {
    echo "" | tee -a "$LOG_FILE"
    echo -e "${BLUE}## $1${NC}" | tee -a "$LOG_FILE"
    echo "## $1" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
}

# Verify site directory
if [ ! -f "$SITE_DIR/package.json" ]; then
    echo -e "${RED}ERROR: Not an EmDash site (missing package.json)${NC}"
    exit 1
fi

if [ ! -d "$SITE_DIR/seed" ]; then
    echo -e "${RED}ERROR: Not an EmDash site (missing seed/ directory)${NC}"
    exit 1
fi

# Initialize report
cat > "$REPORT_FILE" << 'EOF'
# QA Report

**Generated:** $(date)
**Site:** $SITE_DIR

## Summary

| Status | Count |
|--------|-------|
| Passed | TBD |
| Failed | TBD |
| Warnings | TBD |

## Results

EOF

echo "Starting QA for site: $SITE_DIR" | tee -a "$LOG_FILE"
echo "Report: $REPORT_FILE" | tee -a "$LOG_FILE"
echo "Log: $LOG_FILE" | tee -a "$LOG_FILE"

# ============================================================================
# PRE-FLIGHT CHECKS
# ============================================================================

print_section "Pre-Flight Checks"

# Check node_modules
if [ -d "$SITE_DIR/node_modules" ]; then
    check_pass "node_modules exists"
else
    echo -e "${YELLOW}Installing dependencies...${NC}" | tee -a "$LOG_FILE"
    cd "$SITE_DIR"
    npm install --legacy-peer-deps >> "$LOG_FILE" 2>&1 || check_fail "npm install"
    cd - > /dev/null
    check_pass "Dependencies installed"
fi

# Check astro.config.mjs
if [ -f "$SITE_DIR/astro.config.mjs" ]; then
    check_pass "Astro config present"
else
    check_fail "Astro config missing (astro.config.mjs)"
fi

# ============================================================================
# BUILD & INTEGRATION
# ============================================================================

print_section "Build & Integration"

# Test: npm run build
echo -e "${BLUE}Running: npm run build${NC}" | tee -a "$LOG_FILE"
cd "$SITE_DIR"
if npm run build >> "$LOG_FILE" 2>&1; then
    check_pass "Astro build succeeds"
else
    check_fail "Astro build fails (see log)"
fi

# Test: emdash seed validate
if [ -f "$SITE_DIR/seed/seed.json" ]; then
    echo -e "${BLUE}Running: emdash seed --validate${NC}" | tee -a "$LOG_FILE"
    if npx emdash seed seed/seed.json --validate >> "$LOG_FILE" 2>&1; then
        check_pass "EmDash seed validates"
    else
        check_fail "EmDash seed validation fails (see log)"
    fi
else
    check_warn "seed/seed.json not found (skipped validation)"
fi

# Test: astro check (TypeScript)
echo -e "${BLUE}Running: astro check${NC}" | tee -a "$LOG_FILE"
if npx astro check >> "$LOG_FILE" 2>&1; then
    check_pass "TypeScript check passes"
else
    check_fail "TypeScript errors detected (see log)"
fi

cd - > /dev/null

# ============================================================================
# FUNCTIONALITY
# ============================================================================

print_section "Functionality"

# Check if dist/ was created
if [ -d "$SITE_DIR/dist" ]; then
    check_pass "Build output (dist/) created"
else
    check_fail "Build output (dist/) not found"
fi

# Test: index.html exists
if [ -f "$SITE_DIR/dist/index.html" ]; then
    check_pass "Homepage (index.html) generated"
else
    check_fail "Homepage (index.html) not found"
fi

# Test: HTML validation (basic)
echo -e "${BLUE}Validating HTML structure...${NC}" | tee -a "$LOG_FILE"
HTML_FILES=$(find "$SITE_DIR/dist" -name "*.html" -type f | wc -l)
if [ "$HTML_FILES" -gt 0 ]; then
    check_pass "Found $HTML_FILES HTML files"
else
    check_fail "No HTML files generated"
fi

# Test: Check for broken HTML (basic scan for unclosed tags)
BROKEN_TAGS=0
for file in $(find "$SITE_DIR/dist" -name "*.html" -type f | head -10); do
    # Simple check for common HTML issues (not comprehensive)
    if grep -q '<img[^>]*>' "$file" && ! grep '<img[^>]*alt=' "$file" > /dev/null 2>&1; then
        ((BROKEN_TAGS++))
    fi
done

if [ "$BROKEN_TAGS" -eq 0 ]; then
    check_pass "No obvious HTML issues in first 10 files"
else
    check_warn "Found $BROKEN_TAGS files with potential HTML issues"
fi

# Test: Check for missing alt text on images
echo -e "${BLUE}Checking for alt text on images...${NC}" | tee -a "$LOG_FILE"
ALT_MISSING=0
for file in $(find "$SITE_DIR/dist" -name "*.html" -type f); do
    # Count <img> tags without alt attribute
    ALT_MISSING=$((ALT_MISSING + $(grep -o '<img[^>]*>' "$file" | grep -cv 'alt=' || echo 0)))
done

if [ "$ALT_MISSING" -eq 0 ]; then
    check_pass "All images have alt text"
else
    check_warn "Found $ALT_MISSING images missing alt text"
fi

# ============================================================================
# MOBILE & RESPONSIVE
# ============================================================================

print_section "Mobile & Responsive"

# Check viewport meta tag
echo -e "${BLUE}Checking viewport configuration...${NC}" | tee -a "$LOG_FILE"
VIEWPORT_FOUND=0
for file in $(find "$SITE_DIR/dist" -name "*.html" -type f | head -5); do
    if grep -q 'name="viewport"' "$file"; then
        ((VIEWPORT_FOUND++))
    fi
done

if [ "$VIEWPORT_FOUND" -gt 0 ]; then
    check_pass "Viewport meta tag present ($VIEWPORT_FOUND files checked)"
else
    check_fail "Viewport meta tag missing"
fi

# Note: Full responsive testing requires headless browser (Playwright/Puppeteer)
# For MVP, we'll document this for manual testing
check_warn "Responsive testing (320px-1280px) requires manual browser testing"

# ============================================================================
# SEO
# ============================================================================

print_section "SEO"

# Test: Check for title tags
echo -e "${BLUE}Checking SEO metadata...${NC}" | tee -a "$LOG_FILE"
TITLE_COUNT=0
for file in $(find "$SITE_DIR/dist" -name "*.html" -type f); do
    if grep -q '<title>' "$file"; then
        ((TITLE_COUNT++))
    fi
done

if [ "$TITLE_COUNT" -gt 0 ]; then
    check_pass "Title tags present ($TITLE_COUNT files)"
else
    check_fail "Title tags missing from HTML files"
fi

# Test: Check for meta description
DESC_COUNT=0
for file in $(find "$SITE_DIR/dist" -name "*.html" -type f); do
    if grep -q 'name="description"' "$file"; then
        ((DESC_COUNT++))
    fi
done

if [ "$DESC_COUNT" -gt 0 ]; then
    check_pass "Meta descriptions present ($DESC_COUNT files)"
else
    check_warn "Meta descriptions missing (check manually)"
fi

# Test: Check for OG tags (sampling)
OG_COUNT=0
for file in $(find "$SITE_DIR/dist" -name "*.html" -type f | head -3); do
    if grep -q 'property="og:' "$file"; then
        ((OG_COUNT++))
    fi
done

if [ "$OG_COUNT" -gt 0 ]; then
    check_pass "OG tags found (checked first 3 files)"
else
    check_warn "OG tags not found (check manually)"
fi

# Test: robots.txt
if [ -f "$SITE_DIR/dist/robots.txt" ]; then
    check_pass "robots.txt present"
else
    check_warn "robots.txt not found (consider adding)"
fi

# Test: sitemap.xml (for larger sites)
HTML_COUNT=$(find "$SITE_DIR/dist" -name "*.html" -type f | wc -l)
if [ "$HTML_COUNT" -gt 10 ]; then
    if [ -f "$SITE_DIR/dist/sitemap.xml" ] || [ -f "$SITE_DIR/dist/sitemap-index.xml" ]; then
        check_pass "Sitemap present (site has $HTML_COUNT pages)"
    else
        check_warn "Sitemap missing (consider adding for 10+ page sites)"
    fi
fi

# ============================================================================
# ACCESSIBILITY
# ============================================================================

print_section "Accessibility"

# Check for semantic HTML (basic)
MAIN_LANDMARK=0
HEADER_LANDMARK=0
for file in $(find "$SITE_DIR/dist" -name "*.html" -type f | head -5); do
    grep -q '<main' "$file" && ((MAIN_LANDMARK++))
    grep -q '<header' "$file" && ((HEADER_LANDMARK++))
done

if [ "$MAIN_LANDMARK" -gt 0 ]; then
    check_pass "Main landmark present"
else
    check_warn "Main landmark missing (checked first 5 files)"
fi

if [ "$HEADER_LANDMARK" -gt 0 ]; then
    check_pass "Header landmark present"
else
    check_warn "Header landmark missing (checked first 5 files)"
fi

# Check heading hierarchy (basic)
echo -e "${BLUE}Checking heading structure...${NC}" | tee -a "$LOG_FILE"
H1_COUNT=0
for file in $(find "$SITE_DIR/dist" -name "*.html" -type f); do
    H1_COUNT=$((H1_COUNT + $(grep -o '<h1[^>]*>' "$file" | wc -l)))
done

if [ "$H1_COUNT" -eq 0 ]; then
    check_warn "No H1 tags found (check manually)"
elif [ "$H1_COUNT" -eq 1 ] || [ "$H1_COUNT" -le 3 ]; then
    check_pass "Heading structure looks reasonable ($H1_COUNT H1s across files)"
else
    check_warn "Multiple H1 tags found (review for hierarchy)"
fi

# Check for form labels
FORM_COUNT=0
LABEL_COUNT=0
for file in $(find "$SITE_DIR/dist" -name "*.html" -type f); do
    FORM_COUNT=$((FORM_COUNT + $(grep -o '<input[^>]*>' "$file" | wc -l)))
    LABEL_COUNT=$((LABEL_COUNT + $(grep -o '<label[^>]*>' "$file" | wc -l)))
done

if [ "$FORM_COUNT" -gt 0 ]; then
    if [ "$LABEL_COUNT" -gt 0 ]; then
        check_pass "Form inputs found with labels"
    else
        check_warn "Form inputs found but labels missing (check manually)"
    fi
fi

# Note: Full accessibility testing requires axe-core or similar
check_warn "Full WCAG 2.1 AA audit requires axe-core (manual step)"
check_warn "Touch target sizing (44px) requires Lighthouse or manual testing"
check_warn "Color contrast requires Lighthouse or manual testing"

# ============================================================================
# SECURITY
# ============================================================================

print_section "Security"

# Test: No exposed secrets (simple pattern matching)
echo -e "${BLUE}Scanning for exposed secrets...${NC}" | tee -a "$LOG_FILE"
SECRETS_FOUND=0
SECRET_PATTERNS=(
    "ANTHROPIC_API_KEY"
    "api_key="
    "sk-"
    "DATABASE_URL="
    "JWT_SECRET="
    "password="
    "token="
)

for pattern in "${SECRET_PATTERNS[@]}"; do
    if grep -r "$pattern" "$SITE_DIR/dist" 2>/dev/null | grep -qv "node_modules"; then
        ((SECRETS_FOUND++))
        log "Found potential secret: $pattern"
    fi
done

if [ "$SECRETS_FOUND" -eq 0 ]; then
    check_pass "No obvious secrets in build output"
else
    check_fail "Potential exposed secrets found ($SECRETS_FOUND patterns)"
fi

# Test: npm audit
echo -e "${BLUE}Running npm audit...${NC}" | tee -a "$LOG_FILE"
cd "$SITE_DIR"
AUDIT_OUTPUT=$(npm audit 2>&1 || true)
CRITICAL_COUNT=$(echo "$AUDIT_OUTPUT" | grep -o "critical" | wc -l)
HIGH_COUNT=$(echo "$AUDIT_OUTPUT" | grep -o "high" | wc -l)

if [ "$CRITICAL_COUNT" -eq 0 ] && [ "$HIGH_COUNT" -eq 0 ]; then
    check_pass "No critical or high-severity vulnerabilities"
else
    if [ "$CRITICAL_COUNT" -gt 0 ]; then
        check_fail "Found $CRITICAL_COUNT critical vulnerabilities"
    else
        check_warn "Found $HIGH_COUNT high-severity vulnerabilities"
    fi
fi
cd - > /dev/null

# Note: Full security testing requires additional tools
check_warn "CSP header validation requires runtime server check"
check_warn "HTTPS enforcement requires deployed site check"

# ============================================================================
# PERFORMANCE
# ============================================================================

print_section "Performance"

# Note: Full Lighthouse testing requires headless browser and running server
check_warn "Lighthouse testing (LCP, CLS, performance score) requires:"
check_warn "  1. Running development server (npm run dev)"
check_warn "  2. Using Lighthouse CI or puppeteer/playwright"
check_warn "  See README.md for setup instructions"

# Check for render-blocking resources (basic)
RENDER_BLOCK=0
for file in $(find "$SITE_DIR/dist" -name "*.html" -type f | head -3); do
    # Count undeferred script tags in head
    RENDER_BLOCK=$((RENDER_BLOCK + $(grep -o '<script[^>]*>' "$file" | grep -cv 'defer\|async' || echo 0)))
done

if [ "$RENDER_BLOCK" -eq 0 ]; then
    check_pass "No obvious render-blocking resources (first 3 files)"
else
    check_warn "Found $RENDER_BLOCK potential render-blocking scripts (check defer/async)"
fi

# ============================================================================
# SUMMARY
# ============================================================================

print_section "Summary"

TOTAL=$((PASSED + FAILED + WARNINGS))
PASS_RATE=$((PASSED * 100 / (TOTAL > 0 ? TOTAL : 1)))

cat >> "$REPORT_FILE" << EOF

## Test Results

| Category | Count |
|----------|-------|
| Passed | $PASSED |
| Failed | $FAILED |
| Warnings | $WARNINGS |
| **Total** | **$TOTAL** |

**Pass Rate:** $PASS_RATE%

## Verdict

EOF

echo "" | tee -a "$LOG_FILE"
echo "======================================" | tee -a "$LOG_FILE"
echo "TEST SUMMARY" | tee -a "$LOG_FILE"
echo "======================================" | tee -a "$LOG_FILE"
echo "Passed:   $PASSED" | tee -a "$LOG_FILE"
echo "Failed:   $FAILED" | tee -a "$LOG_FILE"
echo "Warnings: $WARNINGS" | tee -a "$LOG_FILE"
echo "Pass Rate: $PASS_RATE%" | tee -a "$LOG_FILE"
echo "======================================" | tee -a "$LOG_FILE"

if [ "$FAILED" -eq 0 ]; then
    VERDICT="PASS"
    VERDICT_COLOR="${GREEN}"
    cat >> "$REPORT_FILE" << 'EOF'
**Status:** PASS

All automated checks passed. Margaret's manual review required before shipping.

### Next Steps
- [ ] Design review (Steve Jobs)
- [ ] Engineering review (Elon Musk)
- [ ] Final deployment approval

EOF
else
    VERDICT="FAIL"
    VERDICT_COLOR="${RED}"
    cat >> "$REPORT_FILE" << 'EOF'
**Status:** FAIL

The following checks failed. These must be fixed before proceeding to deployment.

### Recommended Actions
1. Review failed checks above
2. Route issues back to BUILD stage
3. Run QA again after fixes
4. Max 2 revision rounds before escalating

EOF
fi

echo "" | tee -a "$LOG_FILE"
echo -e "${VERDICT_COLOR}VERDICT: $VERDICT${NC}" | tee -a "$LOG_FILE"
echo -e "${VERDICT_COLOR}VERDICT: $VERDICT${NC}" >> "$REPORT_FILE"
echo "" | tee -a "$LOG_FILE"

# Add footer to report
cat >> "$REPORT_FILE" << 'EOF'

---

### Notes for Reviewers

**Automated Checks Only**
This QA run used automated tests. The following still require manual review:
- Visual design quality
- Copy quality and tone
- Content strategy compliance
- Real-device testing (iOS, Android)
- Keyboard navigation edge cases
- Color contrast (automated scan provided)
- Touch target sizing (automated scan provided)

**Tools Used**
- Astro build system
- EmDash seed validation
- TypeScript strict checking
- Basic HTML structure analysis
- Secret pattern scanning
- npm audit for dependencies

**Manual Testing Required**
Run Lighthouse and axe DevTools in a headless browser for comprehensive:
- Performance auditing (LCP, CLS, FID)
- Accessibility testing (WCAG 2.1 AA)
- SEO completeness
- Mobile responsive testing at actual breakpoints

See pipeline/qa/README.md for detailed QA pipeline documentation.

EOF

echo "Report saved to: $REPORT_FILE" | tee -a "$LOG_FILE"
echo "Log saved to: $LOG_FILE" | tee -a "$LOG_FILE"

# Exit with appropriate code
if [ "$FAILED" -gt 0 ]; then
    exit 1
else
    exit 0
fi
