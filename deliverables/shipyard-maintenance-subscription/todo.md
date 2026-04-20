# Shipyard Care Subscription — Build To-Do List

**Status:** Ready for execution
**Build Time:** 8 hours
**Waves:** 4 (sequential by wave, parallel within wave)

---

## Wave 1: Foundation Layer (2 hours)

Database schema setup using Drizzle ORM on Neon PostgreSQL.

### Database Schema

- [ ] Read existing Drizzle schema pattern at `packages/db/schema/subscriptions.ts` — verify: file exists and shows ORM patterns
- [ ] Create `packages/db/schema/subscribers.ts` with subscribers table schema — verify: `npm run build` in packages/db succeeds
- [ ] Define `tierEnum` as pgEnum with values 'care' and 'care_pro' — verify: TypeScript types generated include enum
- [ ] Define `statusEnum` as pgEnum with values 'active', 'cancelled', 'paused' — verify: TypeScript types include enum
- [ ] Add 9 columns to subscribers table: id (serial), email (text unique), tier (enum), tokens_monthly (int), tokens_remaining (int), referral_code (text unique), referral_credits (int default 0), start_date (timestamp), status (enum) — verify: grep for all 9 column names in schema file
- [ ] Add NOT NULL constraints on email, tier, tokens_monthly, tokens_remaining, referral_code, start_date, status — verify: grep 'notNull()' shows 7 instances
- [ ] Create index on email column for fast lookups — verify: grep 'index.*email' in schema
- [ ] Create index on referral_code column for referral tracking — verify: grep 'index.*referral_code' in schema
- [ ] Export subscribers table schema at end of file — verify: grep 'export.*subscribers' in schema file
- [ ] Create `packages/db/schema/token-usage.ts` with token_usage table schema — verify: file exists and builds
- [ ] Add 5 columns to token_usage table: id (serial), subscriber_email (text), prd_id (text), tokens_used (int), timestamp (timestamp) — verify: grep for all 5 column names
- [ ] Add foreign key constraint subscriber_email → subscribers.email — verify: grep 'references.*subscribers' in schema
- [ ] Export token_usage table schema — verify: grep 'export.*token_usage' or 'export.*tokenUsage'
- [ ] Create `packages/db/schema/referrals.ts` with referrals table schema — verify: file exists and builds
- [ ] Add 5 columns to referrals table: id (serial), referrer_email (text), referred_email (text), credit_amount (int), converted_date (timestamp) — verify: grep for all 5 column names
- [ ] Add foreign key constraint referrer_email → subscribers.email — verify: grep 'references.*subscribers' in schema
- [ ] Export referrals table schema — verify: grep 'export.*referrals'
- [ ] Create `packages/db/config/pricing.ts` with tier definitions — verify: file exists
- [ ] Define PRICING_TIERS object with 'care' ($500, 100K tokens) and 'care_pro' ($1000, 250K tokens) — verify: grep shows both tier prices and token amounts
- [ ] Export PRICING_TIERS and helper function to get tier config — verify: grep 'export.*PRICING_TIERS'
- [ ] Update `packages/db/index.ts` to export new schemas (subscribers, tokenUsage, referrals) — verify: grep 'export.*from.*subscribers' in index.ts
- [ ] Update `packages/db/index.ts` to export pricing config — verify: grep 'export.*from.*pricing' in index.ts
- [ ] Run build in packages/db directory — verify: `cd packages/db && npm run build` exits with code 0
- [ ] Check TypeScript generates types for all new schemas — verify: `ls -la packages/db/dist` shows .d.ts files or grep dist output

---

## Wave 2: Business Logic & Templates (3 hours)

Scripts, Stripe client extension, and email templates.

### Subscriber Management Scripts

- [ ] Create `packages/db/scripts/subscriber-add.ts` with add subscriber function — verify: file exists
- [ ] Import Drizzle client and subscribers schema — verify: grep 'import.*subscribers' in subscriber-add.ts
- [ ] Implement generateReferralCode() function (8 random alphanumeric chars) — verify: function returns 8-character string when tested
- [ ] Implement addSubscriber(email, tier) function that inserts record — verify: function signature includes both params
- [ ] Set tokens_monthly and tokens_remaining from PRICING_TIERS config — verify: grep 'PRICING_TIERS' in subscriber-add.ts
- [ ] Generate unique referral_code and handle collisions — verify: retry logic exists for duplicate codes
- [ ] Set start_date to current timestamp, status to 'active' — verify: grep 'new Date' and 'active' in insert logic
- [ ] Return created subscriber record — verify: function has return statement with subscriber data
- [ ] Add error handling for duplicate email (unique constraint violation) — verify: try/catch or error handling exists
- [ ] Export addSubscriber function — verify: grep 'export.*addSubscriber'
- [ ] Create `packages/db/scripts/subscriber-check.ts` with check subscriber function — verify: file exists
- [ ] Implement checkSubscriber(email) function that queries subscribers table — verify: function signature exists
- [ ] Return object with status ('active'|'cancelled'|'paused'|null) and token balance — verify: return type includes both fields
- [ ] Return null for non-existent email — verify: null check logic exists
- [ ] Export checkSubscriber function — verify: grep 'export.*checkSubscriber'
- [ ] Create `packages/db/scripts/token-deduct.ts` with deduct tokens function — verify: file exists
- [ ] Implement deductTokens(email, prdId, tokensUsed) function — verify: function signature has 3 params
- [ ] Decrement tokens_remaining in subscribers table using UPDATE — verify: SQL update or Drizzle update call exists
- [ ] Insert record into token_usage table with email, prd_id, tokens_used, timestamp — verify: insert into tokenUsage exists
- [ ] Check if new balance < 20000 tokens (20K threshold) — verify: conditional check for low balance
- [ ] If balance < 20K, call sendTokenWarningEmail() — verify: email send function called in conditional
- [ ] Return updated balance — verify: function returns number
- [ ] Add error handling for invalid email — verify: error handling exists
- [ ] Export deductTokens function — verify: grep 'export.*deductTokens'

### Stripe Integration

- [ ] Check if `packages/api/stripe/client.ts` exists — verify: ls shows file or need to create
- [ ] Extend Stripe API client or create new file with Stripe SDK import — verify: grep 'import.*stripe' in file
- [ ] Add createSubscription(email, priceId) function — verify: function signature exists
- [ ] Add cancelSubscription(subscriptionId) function — verify: function signature exists
- [ ] Add applyReferralCredit(customerId, amount) function — verify: function signature exists
- [ ] Export all Stripe functions — verify: grep 'export' shows at least 3 functions
- [ ] Create `packages/api/stripe/webhooks.ts` for webhook handlers — verify: file exists
- [ ] Import Stripe SDK and webhook signature verification — verify: grep 'import.*Stripe' and 'constructEvent'
- [ ] Implement verifyWebhookSignature(payload, signature, secret) — verify: function uses Stripe.webhooks.constructEvent
- [ ] Implement handleSubscriptionCreated(event) webhook handler — verify: function checks event.type === 'customer.subscription.created'
- [ ] In handleSubscriptionCreated: extract email, tier from metadata, call addSubscriber() — verify: function calls addSubscriber
- [ ] In handleSubscriptionCreated: send welcome email — verify: email send call exists
- [ ] Implement handleSubscriptionDeleted(event) webhook handler — verify: function checks event.type === 'customer.subscription.deleted'
- [ ] In handleSubscriptionDeleted: update subscriber status to 'cancelled' — verify: database update to status field
- [ ] Implement handleInvoicePaymentSucceeded(event) webhook handler — verify: function checks 'invoice.payment_succeeded'
- [ ] In handleInvoicePaymentSucceeded: reset tokens_remaining to tokens_monthly — verify: update query exists
- [ ] Implement handleInvoicePaymentFailed(event) webhook handler — verify: function checks 'invoice.payment_failed'
- [ ] In handleInvoicePaymentFailed: update status to 'paused', send alert email — verify: status update and email call exist
- [ ] Export main webhook handler function that routes events — verify: grep 'export.*handleWebhook' or similar
- [ ] Add idempotency check using event.id to prevent duplicate processing — verify: event ID check exists

### Email Templates

- [ ] Create `packages/email/templates/welcome-subscriber.html` — verify: file exists
- [ ] Add subject line: "Welcome to Shipyard Care" — verify: grep 'Welcome to Shipyard Care' in file
- [ ] Add welcome message with calm "We've got this" voice — verify: email copy uses confident, reassuring tone
- [x] Add template variables for [NAME], [TOKENS], [REFERRAL_URL] — verify: grep '\[NAME\]' and '\[TOKENS\]' and '\[REFERRAL_URL\]'
- [ ] Include referral link with instruction: "Share this with colleagues — you'll earn $100/month credit" — verify: referral instruction text exists
- [ ] Display token balance: "[TOKENS]/month" — verify: token balance display exists
- [ ] End with "No dashboards. No anxiety. Just care." tagline — verify: grep for tagline text
- [ ] Create `packages/email/templates/incident-report.html` — verify: file exists
- [ ] Add subject line: "[Shipyard Care] Issue detected and resolved" — verify: grep 'Issue detected and resolved'
- [ ] Use 3-line format: "What broke", "How we fixed it", "Tokens used" — verify: all 3 sections exist as bullet points or lines
- [x] Add template variables: [DESCRIPTION], [ACTION_TAKEN], [TOKENS], [BALANCE], [MONTHLY_LIMIT] — verify: grep for all 5 variables
- [ ] Add current token balance display — verify: balance display exists
- [ ] End with "We've got this. — Shipyard Care" — verify: grep 'We've got this'
- [ ] Create `packages/email/templates/token-warning.html` — verify: file exists
- [ ] Add subject line: "[Shipyard Care] Token balance low" or similar — verify: subject mentions token balance
- [x] Display current balance and monthly limit — verify: template variables for balance and limit exist
- [ ] Explain usage: "You've used [X] of [Y] tokens this month" — verify: usage summary exists
- [ ] Provide options: upgrade tier or purchase overage — verify: both options mentioned
- [ ] Use reassuring voice, not alarm — verify: tone is helpful not panicky

---

## Wave 3: Stripe Webhook Integration (2 hours)

Complete webhook handlers and test idempotency.

### Webhook Handler Testing

- [ ] Create test script `packages/api/stripe/webhooks.test.ts` (optional but recommended) — verify: file exists or manual testing plan documented
- [ ] Test handleSubscriptionCreated with mock event — verify: subscriber record created in database
- [ ] Verify welcome email sent on subscription.created — verify: email send function called
- [ ] Test handleSubscriptionDeleted with mock event — verify: subscriber status updated to 'cancelled'
- [ ] Verify subscriber record not deleted, only status changed — verify: record still exists with cancelled status
- [ ] Test handleInvoicePaymentSucceeded with mock event — verify: tokens_remaining reset to tokens_monthly
- [ ] Verify token reset only happens on renewal, not initial invoice — verify: logic checks invoice billing_reason or similar
- [ ] Test handleInvoicePaymentFailed with mock event — verify: status updated to 'paused'
- [ ] Verify alert email sent on payment failure — verify: email send function called
- [ ] Test webhook signature verification rejects invalid signature — verify: verifyWebhookSignature throws error for bad signature
- [ ] Test idempotency: processing same event.id twice doesn't duplicate database records — verify: second processing is no-op
- [ ] Add event.id to processed_events table or cache to track duplicates — verify: duplicate detection mechanism exists
- [ ] Document webhook endpoint URL for Stripe dashboard configuration — verify: README or setup doc includes webhook URL

---

## Wave 4: Integration & Marketing (1 hour)

Marketing pages, referral landing page, and daemon integration.

### Marketing Pages

- [ ] Check if `public/care.html` exists or needs to be created — verify: ls public/ shows file
- [ ] Update page title to "Shipyard Care" (not "Maintenance") — verify: grep '<title>.*Care' in HTML
- [ ] Add hero section with positioning: "Your site won't break. If it does, we'll fix it before you notice." — verify: hero copy includes this tagline
- [ ] Create pricing table with two tiers: Care ($500, 100K tokens) and Care Pro ($1,000, 250K tokens) — verify: both prices and token amounts visible
- [ ] Add "What's included" section: token budget, dedicated capacity, incident reports, referral credits — verify: all 4 features listed
- [ ] Add CTA button linking to Stripe checkout — verify: button href points to Stripe checkout URL
- [ ] Use calm, confident brand voice (Steve Jobs' "We've got this" philosophy) — verify: copy avoids jargon and anxiety language
- [ ] Add FAQ section addressing token pricing, overage handling, cancellation — verify: at least 3 FAQ items exist
- [ ] Create `public/refer/[code].html` template for referral landing page — verify: file exists (or dynamic route setup)
- [ ] Display referrer's name for social proof: "Invited by [REFERRER_NAME]" — verify: template variable for referrer name exists
- [ ] Explain referral credit: "$100 MRR credit for each new subscriber" — verify: credit amount and terms mentioned
- [ ] Link to standard Stripe checkout with referral code in metadata — verify: checkout link includes referral code param
- [ ] Track referral code through checkout session completion — verify: webhook can access referral code from metadata

### Daemon Integration

- [ ] Locate PRD intake processing file (likely `packages/pipeline/intake.ts` or similar) — verify: file identified
- [ ] Add import for checkSubscriber function — verify: grep 'import.*checkSubscriber' in intake file
- [ ] Before processing PRD, call checkSubscriber(email) — verify: function call exists in processing flow
- [ ] If subscriber is active, add `subscriber: true` to PRD metadata — verify: metadata flag set for subscribers
- [ ] Route subscriber PRDs to dedicated worker pool or flag for priority — verify: routing logic exists
- [ ] After PRD processing completes, log token usage — verify: deductTokens() called after processing
- [ ] Calculate tokens used (start with 15K estimate, or parse from API if available) — verify: token calculation logic exists
- [ ] If processing resulted in errors, trigger incident report email — verify: conditional email send on error
- [ ] For incident report: extract error description, action taken, tokens used — verify: email includes all 3 fields
- [ ] Test end-to-end: subscriber submits PRD → processed → tokens deducted → incident email if error — verify: manual test plan or automated test
- [ ] Verify non-subscribers still processed (not blocked) — verify: free tier continues to work
- [ ] Monitor that dedicated capacity doesn't starve free tier — verify: monitoring or logging in place

---

## Final Verification

- [ ] Run full TypeScript build across all packages — verify: `npm run build` in root succeeds
- [ ] Run linter and fix any errors — verify: `npm run lint` passes or warnings documented
- [ ] Test database migrations apply cleanly — verify: Drizzle push or migrate command succeeds
- [ ] Set up Stripe webhook endpoint in Stripe dashboard — verify: webhook secret added to .env
- [ ] Create 1 test subscriber manually via Stripe dashboard — verify: subscriber record appears in database
- [ ] Send welcome email to test subscriber — verify: email received with referral link
- [ ] Simulate PRD processing for test subscriber — verify: tokens deducted, usage logged
- [ ] Trigger incident report email manually — verify: email follows 3-line format
- [ ] Send token warning email at 80% threshold — verify: email sent when balance < 20K
- [ ] Test referral link with test code — verify: landing page loads and displays referrer name
- [ ] Verify Stripe checkout includes referral code in metadata — verify: metadata accessible in webhook
- [ ] Test monthly billing webhook (invoice.payment_succeeded) — verify: tokens reset to monthly amount
- [ ] Test failed payment webhook — verify: status updated to 'paused', alert sent
- [ ] Document setup process in README or setup guide — verify: onboarding doc exists with all env vars listed
- [ ] Review all email copy for brand voice (calm, confident, "We've got this") — verify: no anxiety language or jargon
- [ ] Create monitoring dashboard or logging for token usage trends — verify: logging exists for future analysis
- [ ] Tag release with version number — verify: git tag created

---

## Completion Criteria

**Definition of Done:**
- [ ] All 18 tasks from phase-1-plan.md completed
- [ ] All verification steps in this todo list pass
- [ ] 5 test subscribers created (manual Stripe setup acceptable for V1)
- [ ] Stripe automated billing working (0 manual invoices required)
- [ ] At least 1 incident report sent (proves system works end-to-end)
- [ ] Referral links generated for all test subscribers
- [ ] Free tier median wait time <3 days (proves scaling not broken)
- [ ] 0 TypeScript errors, 0 linting errors
- [ ] Documentation complete (README, setup guide, webhook configuration)

**Post-Launch (30 days):**
- [ ] Monitor subscriber token usage patterns
- [ ] Track referral conversion rate
- [ ] Collect customer feedback on token pricing clarity
- [ ] Review incident report frequency and content
- [ ] Measure free tier wait times weekly

---

**Status:** Ready for execution
**Next Action:** Start Wave 1 (Database Schema)
**Estimated Completion:** 8 hours from start
