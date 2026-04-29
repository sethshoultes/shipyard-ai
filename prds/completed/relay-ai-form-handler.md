# PRD: Relay — AI Form Handler & Lead Router

> **Status**: INTAKE
> **Client**: Internal (Shipyard AI)
> **Created**: 2026-04-29
> **Source**: Dream Cycle 2026-04-29T07-2 — Winner (3 board votes)

---

## 1. Project Overview

**Project name:** Relay — AI Form Handler & Lead Router
**Product type:** [ ] Site  [ ] Theme  [x] Plugin
**Target URL/domain:** WordPress.org plugin repository (freemium) + relay.shipyard.company (paid dashboard/docs)
**Deadline (if any):** One session — ships or it doesn't count

---

## 2. Business Context

**What does this business do?** Relay turns any WordPress contact form into an intelligent lead-processing engine. It captures submissions, classifies intent via Claude AI, routes high-value leads to the right inbox, and provides a searchable admin inbox with AI-generated summaries. Every form submission becomes a classified, routed opportunity instead of an unread email.

**Who is the target audience?**
1. Small business owners with WordPress sites who miss leads in cluttered inboxes
2. Marketing teams running multiple landing pages who need lead qualification
3. WordPress agencies who want to offer "smart forms" as a value-add to clients

**What's the primary goal of this plugin?** Replace dumb contact form backends with AI-native lead intelligence. The plugin captures submissions, the Cloudflare Worker classifies them, and the admin UI surfaces actionable insights. Freemium on WP.org drives volume; paid tiers unlock AI classification, Slack routing, and CRM webhooks.

---

## 3. Pages / Features

| # | Page/Feature | Description | Priority |
|---|-------------|-------------|----------|
| 1 | Form Capture Endpoint | REST API endpoint (`/wp-json/relay/v1/submit`) that receives form submissions from any HTML form or block form. Validates nonce or secret token, sanitizes inputs, stores in custom table. | Must-have |
| 2 | Custom Database Table | `wp_relay_submissions` table stores: name, email, message, raw JSON, AI category, urgency, sentiment, summary, routed destination, created_at, status. | Must-have |
| 3 | AI Classification Worker | Cloudflare Worker receives submission payload, sends to Claude for intent classification (sales, support, partnership, spam), extracts urgency and sentiment, returns structured JSON. | Must-have |
| 4 | Routing Engine | Admin-configurable rules: if category = sales → email sales@; if urgency = high → also Slack webhook; if spam → quarantine. Uses wp_mail for email, wp_remote_post for webhooks. | Must-have |
| 5 | Admin Inbox | React-powered wp-admin page (`wp-admin → Relay Inbox`) listing all submissions with category badges (color-coded), filter by category/urgency/date, search by name/email/content, sort by date. | Must-have |
| 6 | Submission Detail View | Modal/slide-out showing full submission data, AI-generated summary, raw classification JSON, one-click "Reply" that opens native email client with pre-filled To/Subject. | Must-have |
| 7 | Settings Page | Configure routing rules (email addresses, Slack webhook URL, spam threshold), AI Worker endpoint, API key, and security token. Simple form with validation. | Must-have |
| 8 | Native Form Block | Gutenberg block that renders a styled contact form wired directly to Relay — no shortcode required. Inherits theme typography and colors. | Nice-to-have |
| 9 | AI Reply Draft | One-click "Draft Reply" in detail view that uses Claude to generate a contextual response based on submission content and category. Copied to clipboard or opened in email client. | Nice-to-have |
| 10 | Export | CSV export of submissions filtered by date range and category. | Nice-to-have |

---

## 4. Design Direction

**Brand colors:**
- Primary: `#F97316` (orange — action, routing, energy)
- Background: `#FFFFFF` (clean admin UI)
- Surface: `#F8FAFC` (slate-50 for card backgrounds)
- Border: `#E2E8F0` (slate-200)
- Text: `#0F172A` (slate-900)
- Accent: `#38BDF8` (sky blue for AI-generated badges)
- Urgency High: `#EF4444` (red)
- Urgency Medium: `#F59E0B` (amber)
- Urgency Low: `#22C55E` (green)
- Spam: `#64748B` (slate-500)

**Typography:** Inter (headings + body), JetBrains Mono (for JSON/raw data preview)
**Reference sites:** Linear.app (clean table UI, fast filtering), Vercel dashboard (status badges, minimal chrome)
**Logo / brand assets provided?** [ ] Yes (attach) [x] No (generate wordmark "Relay" in Inter Bold, orange bolt icon)

---

## 5. Content

**Who provides the copy?** [x] AI generates from business info  [ ] Client provides all text  [ ] Hybrid
**Photos/images:** [x] Use stock (minimal, icon-based UI)  [ ] Client provides  [ ] AI-generated
**Blog posts (if applicable):** N/A — plugin product

---

## 6. Integrations

- [x] Third-party API: Cloudflare Workers AI (Claude for classification)
- [x] Third-party API: Slack webhooks (optional routing destination)
- [x] Email routing (wp_mail for notifications)
- [ ] E-commerce (products, cart, checkout)
- [ ] Blog / CMS
- [ ] Contact form (native Relay block + universal endpoint for any form)
- [ ] Email newsletter signup
- [ ] Social media links/feeds
- [ ] Analytics (defer — add event tracking in v2)
- [ ] User authentication / accounts
- [ ] Multi-language
- [ ] Search functionality

---

## 7. Must-Haves vs. Nice-to-Haves

**Must-haves (will not ship without these):**
1. REST endpoint captures form submissions and stores them securely
2. Cloudflare Worker classifies intent via Claude (sales, support, partnership, spam)
3. Routing engine sends email notifications based on classification results
4. Admin inbox page lists submissions with category badges and date sorting
5. Settings page configures routing rules, Worker endpoint, and security token
6. Plugin passes WordPress.org coding standards (nonces, capability checks, prepared SQL statements)

**Nice-to-haves (only if tokens allow):**
1. Native Gutenberg form block
2. AI-generated reply drafts in detail view
3. Slack webhook integration for high-urgency alerts
4. CSV export with date-range filtering

---

## 8. Token Budget

| Item | Tokens |
|------|--------|
| Base package (plugin) | 500K |
| React admin UI (inbox + settings) | +150K |
| Cloudflare Worker (classification) | +75K |
| Security hardening + WP.org standards | +50K |
| **Total budget** | **775K** |
| Estimated revision credits needed | 100K (1 round for edge-case handling) |
