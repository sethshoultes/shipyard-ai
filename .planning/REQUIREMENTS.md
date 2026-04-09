# WARDROBE - Atomic Requirements Specification

**Product:** Theme Marketplace for Emdash CMS
**Project Slug:** emdash-marketplace
**Generated:** April 9, 2026
**Sources:** PRD (emdash-marketplace.md), Decisions (decisions.md), Board Verdict

---

## The Essence

> **What is this product REALLY about?**
> One command transforms your site into something beautiful — your content stays, only the skin changes.

> **What's the feeling it should evoke?**
> "I can't believe I just did that."

> **What's the one thing that must be perfect?**
> Seeing YOUR content wearing a new theme.

> **Creative direction:**
> Instant dignity.

---

## Requirements Summary

| Priority | Count | Description |
|----------|-------|-------------|
| P0-Blocker | 3 | Board conditions - must complete before launch |
| P1-Must | 48 | Core MVP functionality |
| P2-Should | 10 | Strong recommendations |
| P3-Nice | 5 | Future phases (V2+) |
| **Total** | **66** | |

---

## Critical Overrides (Decisions.md > PRD)

| Topic | PRD Says | Decisions.md Says (LOCKED) |
|-------|----------|---------------------------|
| Product Name | emdash-themes | **Wardrobe** |
| CLI Command | npx emdash-themes install | **npx wardrobe install** |
| Preview Method | Live preview server | **Screenshots only (V1)** |
| Demo Sites | Live demo per theme | **CUT - Screenshots instead** |
| Architecture | Next.js marketplace | **Static HTML showcase** |
| Install Speed | Under 30 seconds | **Under 3 seconds** |
| Distribution | npm packages | **R2 tarballs (recommended)** |

---

## Locked Decisions Summary

| # | Decision | Winner | Build Implication |
|---|----------|--------|-------------------|
| 1 | Product Name: Wardrobe | Steve | CLI is `npx wardrobe install`, not emdash-themes |
| 2 | Theme Count: 5 | Steve | Ember, Forge, Slate, Drift, Bloom |
| 3 | Preview: Screenshots | Elon | No live preview infrastructure in V1 |
| 4 | Architecture: CLI-first | Elon | Static HTML showcase, CLI downloads tarballs |
| 5 | Install Speed: <3 seconds | Elon | Aggressive caching, small tarballs |
| 6 | Brand Voice | Steve | Confident friend, zero jargon |
| 7 | Distribution: Themes in Core | Elon | `emdash create --theme [name]` |
| 8 | Showcase: Static HTML | Compromise | Deploy to Cloudflare Pages |

---

## P0-BLOCKER (Board Conditions - Must Complete Before Launch)

### REQ-001: Marketplace Showcase Website (Deployed)
- **Category:** Board-Blocker
- **Priority:** P0
- **Source:** Board Verdict (Buffett, Rhimes)

**Description:**
Build and deploy a visual marketplace website displaying all 5 themes with screenshots, descriptions, personality taglines, and one-click copy buttons for install commands. Must be mobile-responsive and SEO-optimized.

**Acceptance Criteria:**
- [ ] Static HTML page deployed to Cloudflare Pages
- [ ] 5 theme cards with screenshots/GIFs
- [ ] One-click copy for install commands
- [ ] Mobile-responsive design
- [ ] SEO meta tags and Open Graph

---

### REQ-002: Basic Anonymous Install Analytics
- **Category:** Board-Blocker
- **Priority:** P0
- **Source:** Board Verdict (Buffett)

**Description:**
Implement telemetry to track which themes are installed, from what geographic regions, and frequency. No PII required. Data aggregated and anonymous.

**Acceptance Criteria:**
- [ ] CLI sends anonymous telemetry on install
- [ ] Theme name, timestamp, OS logged
- [ ] No user identity or PII collected
- [ ] Analytics endpoint operational
- [ ] Basic dashboard showing install counts

---

### REQ-003: Coming Soon Themes (3+ Teased)
- **Category:** Board-Blocker
- **Priority:** P0
- **Source:** Board Verdict (Rhimes)

**Description:**
Showcase at least 3 future themes in "Coming Soon" status within registry and marketplace. Create open loops to drive repeat visits and anticipation.

**Acceptance Criteria:**
- [ ] 3+ "Coming Soon" themes in registry
- [ ] Coming Soon section on showcase website
- [ ] Email capture for notifications
- [ ] Teased personalities and estimated dates

---

## P1-MUST (Critical MVP Features)

### CLI Requirements

#### REQ-004: Product Name: "Wardrobe"
- **Category:** CLI
- **Priority:** P1
- **Source:** Decisions #1

**Description:**
All references to the product, CLI, package names, and marketing materials must use "Wardrobe" (not "emdash-themes").

**Acceptance Criteria:**
- [ ] Package name is "wardrobe"
- [ ] All CLI output uses Wardrobe branding
- [ ] Documentation references Wardrobe

---

#### REQ-005: CLI Command: npx wardrobe list
- **Category:** CLI
- **Priority:** P1
- **Source:** Decisions MVP Feature Set

**Description:**
CLI command that fetches themes.json registry and displays all available themes with descriptions, personality tags, and version.

**Acceptance Criteria:**
- [ ] Fetches registry from CDN
- [ ] Displays theme name, description, personality
- [ ] Shows version and install command

---

#### REQ-006: CLI Command: npx wardrobe install [theme]
- **Category:** CLI
- **Priority:** P1
- **Source:** Decisions MVP Feature Set

**Description:**
CLI command that downloads a theme tarball, extracts it, backs up existing src/ directory, and swaps in the new theme's src/.

**Acceptance Criteria:**
- [ ] Downloads tarball from R2/CDN
- [ ] Creates backup of existing src/
- [ ] Extracts and validates theme
- [ ] Swaps src/ directory
- [ ] Success message: "Your site is now wearing [theme-name]."

---

#### REQ-007: CLI Command: npx wardrobe preview [theme]
- **Category:** CLI
- **Priority:** P1
- **Source:** Decisions MVP Feature Set

**Description:**
CLI command that opens a browser to display theme screenshots/GIFs and description.

**Acceptance Criteria:**
- [ ] Opens default browser
- [ ] Shows theme preview page or images
- [ ] Cross-platform support (Win/Mac/Linux)

---

#### REQ-008: Install Speed Target: Under 3 Seconds
- **Category:** CLI
- **Priority:** P1
- **Source:** Decisions #5

**Description:**
The wardrobe install command must complete (download + extract + swap) in under 3 seconds.

**Acceptance Criteria:**
- [ ] Benchmarked install time < 3 seconds
- [ ] Network latency minimized
- [ ] Tarball size optimized (<10KB each)

---

#### REQ-009: Content Preservation on Install
- **Category:** CLI
- **Priority:** P1
- **Source:** PRD, Decisions

**Description:**
When swapping theme's src/ directory, all user content in D1 database must remain untouched and accessible.

**Acceptance Criteria:**
- [ ] D1 data unchanged after install
- [ ] Only presentation layer changes
- [ ] Rollback available via backup

---

### Theme Requirements

#### REQ-010: Five Launch Themes
- **Category:** Themes
- **Priority:** P1
- **Source:** PRD, Decisions #2

**Description:**
Ship exactly 5 themes with distinct personalities: Ember, Forge, Slate, Drift, Bloom.

**Acceptance Criteria:**
- [ ] All 5 themes complete with full src/ directory
- [ ] Each theme has layouts, components, pages, CSS
- [ ] Each theme builds successfully with Astro

---

#### REQ-011: Theme: Ember (Bold, Editorial)
- **Category:** Themes
- **Priority:** P1
- **Source:** PRD

**Description:**
Magazine-style theme with serif headings, dark navy + burnt orange, asymmetric grids.

**Tagline:** "Ember is bold. Editorial. For people with something to say."
**Target Users:** Restaurants, creative studios, magazines

**Acceptance Criteria:**
- [ ] Serif typography
- [ ] Dark navy + burnt orange color palette
- [ ] Asymmetric grid layout
- [ ] Editorial magazine aesthetic

---

#### REQ-012: Theme: Forge (Dark, Technical)
- **Category:** Themes
- **Priority:** P1
- **Source:** PRD

**Description:**
Industrial theme with monospace fonts, neon green accents, terminal-inspired design.

**Tagline:** "Built for builders."
**Target Users:** SaaS, developer tools, tech companies

**Acceptance Criteria:**
- [ ] Monospace typography
- [ ] Dark mode with neon green accents
- [ ] Terminal-inspired aesthetic
- [ ] Data-dense layout

---

#### REQ-013: Theme: Slate (Clean, Professional)
- **Category:** Themes
- **Priority:** P1
- **Source:** PRD

**Description:**
Corporate theme with gray palette, blue accents, system fonts, sidebar navigation.

**Tagline:** "Slate is for people who need to be trusted. Clean. Steady. The kind of design that lets the work speak first."
**Target Users:** Law firms, consulting, finance

**Acceptance Criteria:**
- [ ] Gray color palette with blue accents
- [ ] System fonts
- [ ] Sidebar navigation
- [ ] Structured hierarchy

---

#### REQ-014: Theme: Drift (Minimal, Airy)
- **Category:** Themes
- **Priority:** P1
- **Source:** PRD

**Description:**
Minimal theme with whitespace, thin sans-serif, sage green accents.

**Tagline:** "Let your content breathe."
**Target Users:** Spas, yoga studios, wellness brands

**Acceptance Criteria:**
- [ ] Abundant whitespace
- [ ] Thin sans-serif typography
- [ ] Sage green accent color
- [ ] Floating, airy layout

---

#### REQ-015: Theme: Bloom (Warm, Organic)
- **Category:** Themes
- **Priority:** P1
- **Source:** PRD

**Description:**
Warm theme with rounded corners, cream background, terracotta accents.

**Tagline:** "Where community feels at home."
**Target Users:** Bakeries, florists, local shops

**Acceptance Criteria:**
- [ ] Rounded corners
- [ ] Cream background
- [ ] Terracotta accents
- [ ] Playful typography

---

### Distribution Requirements

#### REQ-016: Theme Format: Tarball Distribution (R2)
- **Category:** Distribution
- **Priority:** P1
- **Source:** Decisions #4

**Description:**
Each theme distributed as compressed tarball (.tar.gz) stored on Cloudflare R2 bucket.

**Acceptance Criteria:**
- [ ] Tarballs hosted on R2
- [ ] CDN caching configured
- [ ] Public read access
- [ ] Tarball size < 10KB each

---

#### REQ-017: Theme Registry: themes.json on CDN
- **Category:** Distribution
- **Priority:** P1
- **Source:** Decisions #4

**Description:**
Centralized registry file (themes.json) on CDN containing metadata for all available themes.

**Schema:**
```json
{
  "name": "string",
  "slug": "string",
  "description": "string",
  "personality": "string",
  "version": "string",
  "tarballUrl": "string",
  "previewUrl": "string",
  "comingSoon": "boolean"
}
```

---

#### REQ-018: R2 Bucket Configuration
- **Category:** Distribution
- **Priority:** P1
- **Source:** Decisions

**Description:**
Set up Cloudflare R2 bucket for theme tarball hosting with CDN caching.

**Acceptance Criteria:**
- [ ] R2 bucket created
- [ ] Public read access configured
- [ ] CDN caching enabled
- [ ] Upload script for tarballs

---

#### REQ-019: NPM Package Publishing
- **Category:** Distribution
- **Priority:** P1
- **Source:** PRD, Decisions

**Description:**
Publish Wardrobe CLI as npm package. Must be installable via `npx wardrobe [command]`.

**Acceptance Criteria:**
- [ ] Package name "wardrobe" available (check first!)
- [ ] Published to npm registry
- [ ] `npx wardrobe` works without prior install

---

### Showcase Requirements

#### REQ-020: Static Showcase Page
- **Category:** Showcase
- **Priority:** P1
- **Source:** Decisions #8

**Description:**
Static HTML page with 5 theme cards showing screenshots, descriptions, and copy-paste install commands.

**Acceptance Criteria:**
- [ ] Single HTML page with embedded CSS/JS
- [ ] 5 theme cards visible
- [ ] Each card has screenshot, description, install command
- [ ] Responsive grid layout

---

#### REQ-021: Theme Preview Screenshots/GIFs
- **Category:** Showcase
- **Priority:** P1
- **Source:** PRD, Decisions

**Description:**
Each theme must have preview screenshot or GIF showing the design. GIFs preferred to capture transformation.

**Acceptance Criteria:**
- [ ] High-quality screenshot for each theme
- [ ] Consistent dimensions and format
- [ ] Shows actual theme with demo content
- [ ] GIFs showing transformation (optional but preferred)

---

#### REQ-022: One-Click Copy for Install Commands
- **Category:** Showcase
- **Priority:** P1
- **Source:** Decisions

**Description:**
Showcase page must include copy-to-clipboard buttons for each theme's install command.

**Acceptance Criteria:**
- [ ] Copy button for each theme card
- [ ] Copies `npx wardrobe install [theme]`
- [ ] Visual feedback on copy success

---

#### REQ-023: Mobile-Responsive Showcase
- **Category:** Showcase
- **Priority:** P1
- **Source:** Board Verdict

**Description:**
Showcase website must be responsive on mobile devices.

**Acceptance Criteria:**
- [ ] Works on phones and tablets
- [ ] Touch-friendly interactions
- [ ] Readable at all screen sizes

---

#### REQ-024: SEO Optimization for Showcase
- **Category:** Showcase
- **Priority:** P1
- **Source:** Board Verdict

**Description:**
Showcase website must include proper meta tags, Open Graph tags, semantic HTML, fast load times (<2 seconds).

**Acceptance Criteria:**
- [ ] Title and description meta tags
- [ ] Open Graph tags for social sharing
- [ ] Semantic HTML structure
- [ ] Page load < 2 seconds

---

#### REQ-025: Cloudflare Pages Deployment
- **Category:** Showcase
- **Priority:** P1
- **Source:** PRD, Decisions

**Description:**
Deploy showcase website to Cloudflare Pages.

**Acceptance Criteria:**
- [ ] Deployed and accessible via public URL
- [ ] SSL certificate active
- [ ] Fast global CDN delivery

---

### Brand & Copy Requirements

#### REQ-026: Brand Voice & Copy Style
- **Category:** Copy
- **Priority:** P1
- **Source:** Decisions #6

**Description:**
All copy must use Steve Jobs' voice: confident friend, zero jargon, short sentences, active verbs.

**Acceptance Criteria:**
- [ ] No passive voice
- [ ] No technical jargon
- [ ] Short, punchy sentences
- [ ] Human and evocative

---

#### REQ-027: Ember Tagline
- **Category:** Copy
- **Priority:** P1
- **Source:** Decisions (Copy Review)

**Copy:** "Ember is bold. Editorial. For people with something to say."

---

#### REQ-028: Forge Tagline
- **Category:** Copy
- **Priority:** P1
- **Source:** Decisions

**Copy:** "Forge is dark, technical. Built for builders."

---

#### REQ-029: Slate Tagline
- **Category:** Copy
- **Priority:** P1
- **Source:** Decisions (Copy Review - Maya Angelou)

**Copy:** "Slate is for people who need to be trusted. Clean. Steady. The kind of design that lets the work speak first."

---

#### REQ-030: Drift Tagline
- **Category:** Copy
- **Priority:** P1
- **Source:** Decisions

**Copy:** "Let your content breathe."

---

#### REQ-031: Bloom Tagline
- **Category:** Copy
- **Priority:** P1
- **Source:** Decisions

**Copy:** "Where community feels at home."

---

#### REQ-032: Install Success Message
- **Category:** Copy
- **Priority:** P1
- **Source:** Decisions

**Description:**
When install completes, CLI must output branded success message.

**Copy:** "Your site is now wearing [theme-name]."

---

#### REQ-033: Core Value Proposition Copy
- **Category:** Copy
- **Priority:** P1
- **Source:** Decisions (Maya Angelou Review)

**Description:**
Lead with one of these approved value propositions:
- "Install in one command. Your content stays untouched."
- "Pick a theme. Watch your site remember what it was meant to be."
- "Copy the command. Paste it. You're done before you finish your coffee."

---

### Technical Requirements

#### REQ-034: Backup Strategy Before Install
- **Category:** Technical
- **Priority:** P1
- **Source:** Implied

**Description:**
CLI must create automatic backup of existing src/ directory before swap.

**Acceptance Criteria:**
- [ ] Backup created with timestamp
- [ ] Backup stored locally (e.g., src.backup.TIMESTAMP/)
- [ ] Restore possible if install fails

---

#### REQ-035: Error Handling & Rollback
- **Category:** Technical
- **Priority:** P1
- **Source:** Reliability

**Description:**
CLI must handle download failures, extraction errors gracefully. If any step fails, rollback to previous state.

**Acceptance Criteria:**
- [ ] Download errors caught and reported
- [ ] Extraction errors trigger rollback
- [ ] Original src/ restored on failure
- [ ] Clear error messages

---

#### REQ-036: Theme Structure Contract
- **Category:** Technical
- **Priority:** P1
- **Source:** Decisions (Open Question #4)

**Description:**
Define and document the exact structure of theme src/ directories.

**Required Files:**
- `live.config.ts` - Emdash collection configuration
- `pages/index.astro` - Home page
- `layouts/Base.astro` - Base layout wrapper

**Acceptance Criteria:**
- [ ] Contract documented in THEME_SPEC.md
- [ ] All 5 themes conform to contract
- [ ] Validation on install

---

#### REQ-037: Automated Screenshot Generation
- **Category:** Technical
- **Priority:** P1
- **Source:** Decisions (Recommended)

**Description:**
Use Playwright or Puppeteer to automatically generate screenshots of each theme with standardized demo content.

**Acceptance Criteria:**
- [ ] Screenshot script using Playwright
- [ ] Consistent demo content for all themes
- [ ] Multiple breakpoints (desktop, mobile)
- [ ] Reproducible generation

---

#### REQ-038: Documentation (README.md)
- **Category:** Technical
- **Priority:** P1
- **Source:** Decisions

**Description:**
Comprehensive README documenting: overview, CLI commands, install instructions, theme structure, troubleshooting.

**Acceptance Criteria:**
- [ ] Clear getting started section
- [ ] All CLI commands documented
- [ ] Theme structure explained
- [ ] Troubleshooting FAQ

---

#### REQ-039: CI/CD Pipeline
- **Category:** Technical
- **Priority:** P1
- **Source:** Risk mitigation

**Description:**
Automated testing that each theme's src/ compiles successfully with Astro build.

**Acceptance Criteria:**
- [ ] GitHub Actions workflow
- [ ] Each theme builds without errors
- [ ] Tests run on every push
- [ ] Build failures block merge

---

#### REQ-040: Version Strategy (V1)
- **Category:** Technical
- **Priority:** P1
- **Source:** Decisions (Open Question #5)

**Description:**
For V1, `wardrobe install` always fetches latest theme version. No lockfile required.

**Acceptance Criteria:**
- [ ] Always downloads latest
- [ ] Version displayed in list command
- [ ] No lockfile needed

---

#### REQ-041: Tarball Build System
- **Category:** Technical
- **Priority:** P1
- **Source:** PRD

**Description:**
Automated build pipeline to generate theme tarballs (src/ directory only).

**Acceptance Criteria:**
- [ ] Build script for all themes
- [ ] Tarballs include only src/ contents
- [ ] Compression level optimized
- [ ] Output to dist/themes/

---

#### REQ-042: Theme Validation on Install
- **Category:** Technical
- **Priority:** P1
- **Source:** Reliability

**Description:**
Verify critical files exist after extraction before swapping.

**Acceptance Criteria:**
- [ ] Check live.config.ts exists
- [ ] Check pages/index.astro exists
- [ ] Fail fast with clear error if missing

---

#### REQ-043: Tarball Integrity Verification
- **Category:** Technical
- **Priority:** P1
- **Source:** Security

**Description:**
Add sha256 hash to registry, verify downloaded tarball before extraction.

**Acceptance Criteria:**
- [ ] sha256 hash in themes.json
- [ ] Hash verified after download
- [ ] Mismatch fails with error

---

### Integration Requirements

#### REQ-044: Core Integration: emdash create --theme
- **Category:** Integration
- **Priority:** P1
- **Source:** Decisions #7

**Description:**
Emdash core CLI must support --theme flag to scaffold new sites with chosen theme.

**Acceptance Criteria:**
- [ ] Integration spec defined with Emdash team
- [ ] `emdash create --theme ember` works
- [ ] Theme pre-installed in new project

**Status:** Pending Emdash core team decision

---

### Analytics Requirements

#### REQ-045: Anonymous Telemetry (CLI)
- **Category:** Analytics
- **Priority:** P1
- **Source:** Board-Blocker

**Description:**
Log install events (theme name, timestamp, OS) to analytics endpoint. No PII.

**Acceptance Criteria:**
- [ ] POST to analytics endpoint on install
- [ ] Data: theme, timestamp, OS, country (from IP)
- [ ] No user identity
- [ ] Opt-out possible

---

#### REQ-046: Theme Popularity Metrics
- **Category:** Analytics
- **Priority:** P1
- **Source:** Analytics

**Description:**
Dashboard showing install count per theme, ranked by popularity.

**Acceptance Criteria:**
- [ ] Install counts per theme
- [ ] Weekly/monthly trends
- [ ] Internal dashboard or report

---

#### REQ-047: No PII Collection
- **Category:** Analytics
- **Priority:** P1
- **Source:** Board Verdict

**Description:**
Analytics must not collect personally identifiable information.

**Acceptance Criteria:**
- [ ] No email, username, or user identity
- [ ] Anonymous telemetry only
- [ ] Privacy policy compliant

---

### Success Metrics

#### REQ-048: Showcase Load Time Target
- **Category:** Metrics
- **Priority:** P1
- **Source:** PRD

**Description:**
Showcase page must load in under 2 seconds (first contentful paint).

**Acceptance Criteria:**
- [ ] FCP < 2 seconds on 3G
- [ ] Lighthouse Performance > 90

---

#### REQ-049: CLI Install Time Target
- **Category:** Metrics
- **Priority:** P1
- **Source:** PRD, Decisions

**Description:**
Install command must complete in under 3 seconds.

**Acceptance Criteria:**
- [ ] End-to-end install < 3 seconds
- [ ] Benchmarked before launch

---

#### REQ-050: Content Preservation Validation
- **Category:** Metrics
- **Priority:** P1
- **Source:** PRD

**Description:**
Test suite must verify content remains accessible after theme install.

**Acceptance Criteria:**
- [ ] Integration test with sample content
- [ ] D1 data unchanged
- [ ] Pages render correctly after swap

---

#### REQ-051: Theme Availability Target
- **Category:** Metrics
- **Priority:** P1
- **Source:** PRD

**Description:**
All 5 launch themes must be live and installable via CLI at launch.

**Acceptance Criteria:**
- [ ] All themes in registry
- [ ] All tarballs on R2
- [ ] All themes install successfully

---

## P2-SHOULD (Strong Recommendations)

#### REQ-052: Pricing Page / Premium Theme Rails
- **Category:** Monetization
- **Priority:** P2
- **Source:** Board (Buffett)

**Description:**
Build pricing page indicating premium themes coming Q3 2026. Establish payment infrastructure.

---

#### REQ-053: Theme Submission Intake Form
- **Category:** Growth
- **Priority:** P2
- **Source:** Board

**Description:**
Web form for third-party designers to submit themes for curation.

---

#### REQ-054: Email Capture Mechanism
- **Category:** Retention
- **Priority:** P2
- **Source:** Board (Shonda)

**Description:**
"Get notified when new themes drop" email signup form on showcase page.

---

#### REQ-055: Theme Update Notifications
- **Category:** Retention
- **Priority:** P2
- **Source:** Shonda's Retention Roadmap

**Description:**
Mechanism to notify users when installed themes have updates.

---

#### REQ-056: Geographic Install Distribution
- **Category:** Analytics
- **Priority:** P2
- **Source:** Analytics

**Description:**
Analytics showing which themes are popular in different regions.

---

#### REQ-057: Cost Monitoring
- **Category:** Operations
- **Priority:** P2
- **Source:** Unit economics

**Description:**
Track monthly costs for CDN, R2, hosting.

---

#### REQ-058: Monitoring & Alerts
- **Category:** Operations
- **Priority:** P2
- **Source:** Operations

**Description:**
Set up monitoring for showcase uptime, R2 availability, install success rates.

---

#### REQ-059: Domain Setup
- **Category:** Operations
- **Priority:** P2
- **Source:** PRD

**Description:**
Secure domain for showcase website (e.g., wardrobe.shipyard.company).

---

#### REQ-060: Privacy Compliance
- **Category:** Legal
- **Priority:** P2
- **Source:** Legal

**Description:**
Ensure analytics comply with GDPR, CCPA. Include privacy policy.

---

#### REQ-061: Install Confirmation Prompt
- **Category:** UX
- **Priority:** P2
- **Source:** UX

**Description:**
Add confirmation prompt before install: "This will replace src/. Continue?"

---

## P3-NICE-TO-HAVE (V2 / Future Phases)

#### REQ-062: Live Preview with User Content
- **Category:** V2
- **Priority:** P3
- **Source:** Decisions (Cut from V1)

**Description:**
Authenticated D1 access to render live previews with user's actual content.

---

#### REQ-063: User Accounts
- **Category:** V2
- **Priority:** P3
- **Source:** Decisions (Cut from V1)

**Description:**
User authentication, theme favoriting, installation history.

---

#### REQ-064: Theme Ratings & Reviews
- **Category:** V2
- **Priority:** P3
- **Source:** Decisions (Cut from V1)

**Description:**
User-submitted ratings, reviews, and comments on themes.

---

#### REQ-065: Search & Filtering
- **Category:** V2
- **Priority:** P3
- **Source:** Decisions (Cut from V1)

**Description:**
Search themes by name/keyword, filter by industry/personality/color.

---

#### REQ-066: Version Pinning
- **Category:** V2
- **Priority:** P3
- **Source:** Decisions

**Description:**
Optional version pinning: `wardrobe install ember@1.0.0` and wardrobe.lock file.

---

## Explicitly NOT in V1 (Scope Fence)

These features are explicitly CUT. Do NOT build:

| ID | Feature | Reason | Revisit At |
|----|---------|--------|------------|
| CUT-001 | Live preview server | 30 days engineering, 0 users | V2 with users |
| CUT-002 | Live demo sites per theme | 5x maintenance burden | V2 |
| CUT-003 | User accounts | Zero value for CLI install | V2 |
| CUT-004 | Theme ratings/reviews | Curation IS quality signal | V2 |
| CUT-005 | Search/filtering | 5 themes visible at glance | V2 |
| CUT-006 | Submit Your Theme | Curate ruthlessly first | V2 |
| CUT-007 | Pricing tiers | Free. Adoption is metric. | V2 |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| NPM name collision (wardrobe) | Low | Medium | Check availability before publish |
| CDN URLs hardcoded, no fallback | High | Critical | Deploy R2 before launch, add retry logic |
| Sub-3s install unverified | High | Medium | Add performance benchmarks |
| Theme contract not formalized | Medium | High | Document in THEME_SPEC.md |
| Tarball zip slip vulnerability | Low | Critical | Add path validation |
| Emdash core integration undefined | High | Critical | Define integration spec |
| R2 bucket not provisioned | High | Critical | Provision before launch |
| Showcase not deployed | Certain | Critical | Deploy to Cloudflare Pages |
| Screenshot automation missing | High | Medium | Implement Playwright script |
| 5 themes overreach | High | Medium | Phase rollout: Ember, Forge, Slate first |

---

## File Structure (Per Decisions.md)

```
wardrobe/
├── cli/
│   ├── index.ts              # CLI entry point
│   ├── commands/
│   │   ├── list.ts           # List available themes
│   │   ├── install.ts        # Download and swap src/
│   │   └── preview.ts        # Open theme preview
│   └── utils/
│       ├── fetch-registry.ts # Fetch themes.json
│       ├── download.ts       # Download tarball
│       ├── extract.ts        # Tarball extraction
│       └── fs-utils.ts       # Backup, restore, replace
│
├── themes/
│   ├── ember/src/            # Full src/ directory
│   ├── forge/src/
│   ├── slate/src/
│   ├── drift/src/
│   └── bloom/src/
│
├── registry/
│   └── themes.json           # Theme metadata, URLs, descriptions
│
├── showcase/
│   ├── index.html            # Static showcase page
│   ├── styles.css            # Showcase styling
│   └── screenshots/          # Theme preview images
│
├── scripts/
│   └── build-tarballs.ts     # Tarball builder
│
├── dist/themes/              # Built tarballs
│
└── README.md                 # Documentation
```

---

## Open Questions (Blocking Launch)

| # | Question | Owner | Deadline |
|---|----------|-------|----------|
| 1 | Where do themes live? R2 tarballs (recommended) or npm? | Engineering | Before launch |
| 2 | How does `emdash create --theme` integrate? | Emdash core team | Before launch |
| 3 | Screenshot generation: manual or automated? | Engineering | Week 1 |
| 4 | Theme structure contract definition | Engineering | Week 1 |
| 5 | Versioning strategy | Engineering | Week 2 |

---

## Board Conditions Timeline

| Milestone | Target | Status |
|-----------|--------|--------|
| Showcase website deployed | +2 weeks | NOT DONE |
| Analytics instrumented | +2 weeks | NOT DONE |
| Coming Soon themes added | +1 week | NOT DONE |
| Pricing page live | +3 weeks | NOT DONE |
| **Board re-review** | +3 weeks | PENDING |

---

## Ship Test

> Does the user run `npx wardrobe install ember` and feel "I can't believe I just did that"?
>
> **If yes, ship it.**

---

*Generated by Great Minds Agency — Phase Planning Skill*
*Source: rounds/emdash-marketplace/decisions.md, prds/emdash-marketplace.md*
*Project Slug: emdash-marketplace*
