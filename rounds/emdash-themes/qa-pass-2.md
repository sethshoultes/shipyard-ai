# QA Pass 2 Report: Palette (emdash-themes)

**QA Director:** Margaret Hamilton
**Date:** 2026-04-08
**Pass:** 2 of N
**Focus:** Integration - cross-file references, consistency, all pieces working together
**Overall Verdict:** **BLOCK**

---

## Executive Summary

QA Pass 1 identified 6 P0 blockers. This pass focuses on integration testing and verifying fixes.

| Status | Count |
|--------|-------|
| PASS | 25 |
| FAIL | 16 |
| **Blocking Issues (P0)** | **5** |
| Critical Issues (P1) | 5 |
| Major Issues (P2) | 6 |

**Ship status: BLOCKED** - Critical integration failures and P0 issues from Pass 1 remain unresolved.

---

## Pass 1 Issue Resolution Status

| P0 Issue | Status | Evidence |
|----------|--------|----------|
| P0-1: No font files | **PARTIALLY FIXED** | Font files added but **integration failures** exist (see details below) |
| P0-2: No image files | **NOT FIXED** | Both `images/` directories still contain only `.gitkeep` |
| P0-3: No README.md | **NOT FIXED** | No README.md at `/palette/` level |
| P0-4: No customization.md | **NOT FIXED** | `/palette/docs/` directory is empty |
| P0-5: No image attribution | **NOT FIXED** | No attribution file exists |
| P0-6: First 3 seconds fails | **NOT FIXED** | Dependent on P0-2 |

---

## Integration Testing Results

### Cross-File Reference Verification

#### Palette One: CSS-to-Font Integration

| @font-face Declaration | File Referenced | File Exists? | Status |
|------------------------|-----------------|--------------|--------|
| `libre-baskerville-regular.woff2` | `../fonts/libre-baskerville-regular.woff2` | YES (302,032 bytes) | **FAIL: SIZE** |
| `libre-baskerville-regular.woff` | `../fonts/libre-baskerville-regular.woff` | YES (302,020 bytes) | **FAIL: SIZE** |
| `libre-baskerville-bold.woff2` | `../fonts/libre-baskerville-bold.woff2` | YES (302,000 bytes) | **FAIL: SIZE** |
| `libre-baskerville-bold.woff` | `../fonts/libre-baskerville-bold.woff` | YES (301,984 bytes) | **FAIL: SIZE** |
| `inter-regular.woff2` | `../fonts/inter-regular.woff2` | YES (111,268 bytes) | **PASS** |
| `inter-regular.woff` | `../fonts/inter-regular.woff` | YES (301,949 bytes) | **FAIL: SIZE** |
| `inter-medium.woff2` | `../fonts/inter-medium.woff2` | YES (114,348 bytes) | **PASS** |
| `inter-medium.woff` | `../fonts/inter-medium.woff` | YES (301,937 bytes) | **FAIL: SIZE** |
| `inter-semibold.woff2` | `../fonts/inter-semibold.woff2` | YES (114,812 bytes) | **PASS** |
| `inter-semibold.woff` | `../fonts/inter-semibold.woff` | YES (301,966 bytes) | **FAIL: SIZE** |

**Palette One Total Font Size: 2,454,316 bytes (2.4MB)**
**REQ-021 Limit: <100KB**
**Result: FAIL - 24x over budget**

#### Palette Two: CSS-to-Font Integration

| @font-face Declaration | File Referenced | File Exists? | Status |
|------------------------|-----------------|--------------|--------|
| `jetbrains-mono-regular.woff2` | `../fonts/jetbrains-mono-regular.woff2` | YES (92,380 bytes) | **PASS** |
| `jetbrains-mono-regular.woff` | `../fonts/jetbrains-mono-regular.woff` | **NO** | **FAIL: MISSING** |
| `jetbrains-mono-medium.woff2` | `../fonts/jetbrains-mono-medium.woff2` | YES (94,284 bytes) | **PASS** |
| `jetbrains-mono-medium.woff` | `../fonts/jetbrains-mono-medium.woff` | **NO** | **FAIL: MISSING** |
| `jetbrains-mono-bold.woff2` | `../fonts/jetbrains-mono-bold.woff2` | **NO** | **FAIL: MISSING** |
| `jetbrains-mono-bold.woff` | `../fonts/jetbrains-mono-bold.woff` | **NO** | **FAIL: MISSING** |

**Palette Two Total woff2 Font Size: 186,664 bytes (182KB)**
**REQ-021 Limit: <100KB**
**Result: FAIL - 82KB over budget**

**Palette Two .woff fallbacks: ALL MISSING**

#### HTML-to-Image Integration

| Theme | Image Reference | File Exists? | Status |
|-------|-----------------|--------------|--------|
| Palette One | `images/hero-featured.jpg` | **NO** | **FAIL** |
| Palette One | `images/about-kitchen.jpg` | **NO** | **FAIL** |
| Palette One | `images/dish-1.jpg` | **NO** | **FAIL** |
| Palette One | `images/dish-2.jpg` | **NO** | **FAIL** |
| Palette One | `images/dish-3.jpg` | **NO** | **FAIL** |
| Palette Two | (no images referenced) | N/A | **PASS** |

#### HTML-to-CSS Integration

| Theme | CSS Reference | File Exists? | Loads Correctly? |
|-------|---------------|--------------|------------------|
| Palette One | `css/variables.css` | YES | **PASS** |
| Palette One | `css/style.css` | YES | **PASS** |
| Palette Two | `css/variables.css` | YES | **PASS** |
| Palette Two | `css/style.css` | YES | **PASS** |

#### CSS-to-CSS Integration (Internal Imports)

| Theme | Import Statement | Consistency Issue? |
|-------|------------------|-------------------|
| Palette One | None (loads via HTML `<link>`) | **INCONSISTENT** |
| Palette Two | `@import url('variables.css');` | **INCONSISTENT** |

**Finding:** Palette Two uses `@import` in style.css while Palette One uses HTML `<link>` tags. This is inconsistent architecture.

### CSS Variable Cross-Reference Verification

#### Palette One: Variables Used vs. Defined

All CSS variables used in `style.css` are defined in `variables.css`: **PASS**

Verified:
- `--color-bg`, `--color-surface`, `--color-text` (L13-17 in variables.css)
- `--color-primary`, `--color-accent` (L20-21)
- `--font-heading`, `--font-body` (L28-29)
- `--radius`, `--radius-lg` (L81-82)
- `--spacing-*` series (L52-66)
- `--transition-fast`, `--transition-base` (L89-90)

#### Palette Two: Variables Used vs. Defined

| Variable Used | Defined in variables.css? | Status |
|---------------|---------------------------|--------|
| `--color-bg` | YES (L12) | **PASS** |
| `--color-text` | YES (L13) | **PASS** |
| `--color-primary` | YES (L16) | **PASS** |
| `--color-accent` | YES (L17) | **PASS** |
| `--color-surface` | YES (L20) | **PASS** |
| `--color-warning` | YES (L23) | **PASS** |
| `--color-error` | YES (L24) | **PASS** |
| `--color-comment` | YES (L25) | **PASS** |
| `--color-success` | YES (L28) | **PASS** |
| `--color-border` | YES (L30) | **PASS** |
| `--font-heading` | YES (L38) | **PASS** |
| `--font-body` | YES (L39) | **PASS** |
| `--font-code` | YES (L40) | **PASS** |
| `--font-weight-*` | YES (L57-59) | **PASS** |
| `--line-height-*` | YES (L62-64) | **PASS** |
| `--radius`, `--radius-lg`, `--radius-xl`, `--radius-full` | YES (L105-108) | **PASS** |
| `--z-*` series | YES (L111-117) | **PASS** |
| `--transition-fast`, `--transition-normal` | YES (L124-126) | **PASS** |
| `--easing-*` | YES (L129-132) | **PASS** |
| `--shadow-*` | YES (L139-142) | **PASS** |
| `--glow-primary`, `--glow-accent` | YES (L145-146) | **PASS** |

All CSS variables properly defined: **PASS**

---

## Requirements Verification (Focus: Integration)

### STRUCTURE (REQ-001 to REQ-008)

| REQ-ID | Requirement | Status | Evidence |
|--------|-------------|--------|----------|
| REQ-001 | Independent codebase for Palette One | **PASS** | Separate directory with independent HTML/CSS |
| REQ-002 | Independent codebase for Palette Two | **PASS** | Separate directory with independent HTML/CSS |
| REQ-003 | Single index.html per theme | **PASS** | Each theme has exactly one index.html |
| REQ-004 | CSS files: style.css and variables.css | **PASS** | Both present in both themes |
| REQ-005 | fonts/ directory with font files | **PARTIAL** | Files exist but size violations (P1/P0) |
| REQ-006 | images/ directory with imagery | **FAIL** | Both directories empty except .gitkeep |
| REQ-007 | docs/customization.md | **FAIL** | docs/ directory exists but is empty |
| REQ-008 | Root-level README.md | **FAIL** | No README.md at /palette/ level |

### DESIGN (REQ-009 to REQ-020)

| REQ-ID | Requirement | Status | Evidence |
|--------|-------------|--------|----------|
| REQ-009 | Palette One: warm colors | **PASS** | `--color-primary: #c45c26` (terracotta), warm palette |
| REQ-010 | Palette Two: dark colors | **PASS** | `--color-bg: #0d0d0d`, neon accents |
| REQ-011 | Palette One: light mode only | **PASS** | No dark mode variants |
| REQ-012 | Palette Two: dark mode only | **PASS** | Comment confirms, no light variants |
| REQ-013 | Emotional resonance in 3 seconds | **FAIL** | Cannot achieve without images |
| REQ-014 | CSS-only animations | **PASS** | No JavaScript for animations |
| REQ-015 | GPU-composited transforms, no parallax | **PASS** | `will-change`, `transform`, no parallax |
| REQ-016 | No horizontal scroll | **PASS** | `overflow-x: hidden` on both |
| REQ-017 | CSS scroll-snap (Should-Have) | **PASS** | `scroll-snap-type` implemented |
| REQ-018 | Mobile-responsive | **PASS** | Breakpoints at 900px and 640px |
| REQ-019 | Real food photography | **FAIL** | No images exist |
| REQ-020 | Developer imagery | **FAIL** | No images exist |

### PERFORMANCE (REQ-021 to REQ-026)

| REQ-ID | Requirement | Status | Evidence |
|--------|-------------|--------|----------|
| REQ-021 | Fonts <100KB per theme | **FAIL** | Palette One: 2.4MB (!), Palette Two: 186KB |
| REQ-022 | Latin subset | **FAIL** | Fonts NOT properly subsetted (sizes prove this) |
| REQ-023 | font-display: swap | **PASS** | All @font-face declarations include it |
| REQ-024 | No JS visual effects | **PASS** | No JavaScript present |
| REQ-025 | No loading spinners | **PASS** | Clean initial load |
| REQ-026 | No Google Fonts | **PASS** | Self-hosted fonts only |

### ACCESSIBILITY (REQ-027 to REQ-030)

| REQ-ID | Requirement | Status | Evidence |
|--------|-------------|--------|----------|
| REQ-027 | Color contrast | **PASS** | High contrast in both themes |
| REQ-028 | Focus states | **PASS** | `:focus-visible` with outline |
| REQ-029 | Alt text | **PASS** | All img tags have descriptive alt |
| REQ-030 | Semantic HTML5 | **PASS** | header, nav, main, section, footer |

### CONTENT (REQ-031 to REQ-033)

| REQ-ID | Requirement | Status | Evidence |
|--------|-------------|--------|----------|
| REQ-031 | Image attribution | **FAIL** | No images, no attribution |
| REQ-032 | Font licensing | **PASS** | LICENSE.txt files present |
| REQ-033 | Theme-specific imagery | **FAIL** | No images present |

### DOCUMENTATION (REQ-034 to REQ-041)

| REQ-ID | Requirement | Status | Evidence |
|--------|-------------|--------|----------|
| REQ-034 | CSS properties documented | **PASS** | Well-commented variables.css files |
| REQ-035 | Variable reference | **PASS** | --primary, --accent, --font-heading, --radius present |
| REQ-036 | Installation instructions | **FAIL** | No README |
| REQ-037 | Customization guide | **FAIL** | No README |
| REQ-038 | Deployment options | **FAIL** | No README |
| REQ-039 | Deploy buttons (Should-Have) | **FAIL** | No README |
| REQ-040 | EmDash version (Should-Have) | **FAIL** | Not documented |
| REQ-041 | Shared patterns (Should-Have) | **FAIL** | Not documented |

---

## NEW Integration Issues Found in Pass 2

### P0 - Critical Blockers

| # | Issue | Files Affected | Impact |
|---|-------|----------------|--------|
| P0-1 | **Font files NOT subsetted - Palette One 2.4MB** | `/palette-one/fonts/*` | Completely violates <100KB requirement. Fonts are full character sets, not Latin subset. |
| P0-2 | **Missing .woff fallbacks for Palette Two** | `/palette-two/fonts/` | CSS references 4 .woff files that don't exist. Safari/older browser fallback broken. |
| P0-3 | **Missing JetBrains Mono Bold** | `/palette-two/fonts/` | @font-face at L29-35 references `jetbrains-mono-bold.woff2` which does not exist |
| P0-4 | **All 5 images still missing** | `/palette-one/images/` | HTML references 5 images that don't exist. Broken image icons will display. |
| P0-5 | **No README or docs** | `/palette/README.md`, `/palette/docs/customization.md` | Cannot install, customize, or deploy. |

### P1 - Critical (High Priority)

| # | Issue | Files Affected | Impact |
|---|-------|----------------|--------|
| P1-1 | **Palette Two fonts over budget (186KB)** | `/palette-two/fonts/` | Even woff2 only exceeds 100KB budget by 86KB |
| P1-2 | **Inconsistent CSS loading architecture** | `style.css` in both themes | Palette One uses HTML link, Palette Two uses @import. Should be consistent. |
| P1-3 | **LICENSE.txt doesn't list files accurately** | `/palette-two/fonts/LICENSE.txt` | Claims bold weight exists but file is missing |
| P1-4 | **Deploy buttons missing** | N/A | REQ-039 |
| P1-5 | **EmDash version not documented** | N/A | REQ-040 |

### P2 - Major Issues

| # | Issue | Impact |
|---|-------|--------|
| P2-1 | No image attribution file | Legal risk if images added |
| P2-2 | Palette Two footer links to non-existent anchors (#changelog, #docs, #about, etc.) | User experience |
| P2-3 | Palette One references multiple .woff fallbacks that are identical size to .woff2 | .woff should be larger - files may be corrupted or mislabeled |
| P2-4 | No shared pattern documentation between themes | Maintenance burden |
| P2-5 | Year mismatch in Palette One footer (2024 vs 2026) | Minor inconsistency |
| P2-6 | Terminal buttons in Palette Two are non-functional (no JS) | User may expect interaction |

---

## Integration Test Summary

```
Cross-File References:
  HTML-to-CSS:           4/4 PASS (100%)
  CSS-to-Variables:      ALL PASS (100%)
  CSS-to-Fonts:          4/16 PASS (25%) - CRITICAL FAILURES
  HTML-to-Images:        0/5 PASS (0%) - ALL MISSING

Architecture Consistency:
  CSS Loading Pattern:   INCONSISTENT (2 different approaches)
  Variable Naming:       CONSISTENT
  File Structure:        CONSISTENT
  Comment Patterns:      CONSISTENT

Size Budgets:
  Palette One Fonts:     FAIL (2.4MB vs 100KB limit)
  Palette Two Fonts:     FAIL (186KB vs 100KB limit)
```

---

## Required Actions to Unblock (Prioritized)

### Immediate (P0 - Must fix)

1. **Re-subset Palette One fonts**
   - Current: 2.4MB total
   - Required: <100KB total
   - Action: Properly subset to Latin characters only using fonttools/pyftsubset or glyphhanger
   - Files: All 10 font files in palette-one/fonts/

2. **Re-subset Palette Two fonts**
   - Current: 186KB (woff2 only)
   - Required: <100KB total
   - Action: Subset to Latin characters, consider dropping medium weight
   - Files: All font files in palette-two/fonts/

3. **Add missing Palette Two font files**
   - Missing: `jetbrains-mono-bold.woff2`, all .woff fallbacks
   - Either add them or remove @font-face declarations for them

4. **Add all 5 images for Palette One**
   - `hero-featured.jpg`, `about-kitchen.jpg`, `dish-1.jpg`, `dish-2.jpg`, `dish-3.jpg`
   - Source from Unsplash/Pexels
   - Add attribution file

5. **Create README.md and docs/customization.md**
   - Installation, customization, deployment instructions
   - CSS variable reference
   - Deploy buttons

### High Priority (P1)

6. **Standardize CSS loading architecture**
   - Choose: HTML `<link>` or CSS `@import`
   - Apply consistently to both themes

7. **Fix LICENSE.txt accuracy**
   - Remove references to non-existent files

### Should Fix (P2)

8. Fix Palette Two footer anchor links
9. Investigate Palette One .woff file sizes
10. Update Palette One footer year
11. Add documentation for shared patterns

---

## Verification Summary

```
STRUCTURE:    3/8 PASS (38%)
DESIGN:       8/12 PASS (67%)
PERFORMANCE:  4/6 PASS (67%)
ACCESSIBILITY: 4/4 PASS (100%)
CONTENT:      1/3 PASS (33%)
DOCUMENTATION: 2/8 PASS (25%)

TOTAL:        22/41 PASS (54%)
MUST-HAVE:    20/37 PASS (54%)
SHOULD-HAVE:  1/4 PASS (25%)

INTEGRATION:  CRITICAL FAILURES
```

---

## QA Director Assessment

**BLOCK SHIP.**

Pass 2 reveals that while font files were added since Pass 1, they create **new critical integration failures**:

1. **Fonts are not subsetted** - Palette One fonts are 24x over budget. The LICENSE.txt claims "subsetted to include Latin characters only" but file sizes prove otherwise. A properly subsetted Latin-only Inter Regular woff2 should be ~20-30KB, not 111KB. Libre Baskerville files at 300KB each are clearly full character sets.

2. **Missing font files create broken fallbacks** - Palette Two CSS references 6 font files that don't exist. In Safari or browsers that need .woff fallback, text will fall back to system fonts.

3. **Pass 1 P0 issues remain unresolved** - Images still missing, no README, no docs.

The delta between "files exist" and "files work correctly together" is the integration gap this pass was designed to find. The themes **will not render as designed** due to:
- Missing fonts (Palette Two bold + all .woff files)
- Missing images (all 5 Palette One images)
- Font size violations (both themes)

**Recommendation:** Do not proceed to Pass 3 until:
1. All fonts are properly subsetted (<100KB total per theme)
2. All CSS font references point to files that exist
3. All HTML image references point to files that exist
4. README and docs exist

---

*Signed: Margaret Hamilton, QA Director*
*"The sooner you fall behind, the more time you have to catch up."*
