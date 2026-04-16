# Homeport

**Shipyard's post-ship lifecycle emails.**

We don't ghost you after launch. Every ship needs a port to return to.

---

## What This Is

Homeport sends five automated emails to customers after their project ships:
- **Day 7:** "Your site is breathing on its own now"
- **Day 30:** "Does it feel like yours yet?"
- **Day 90:** "We're still here (most agencies aren't)"
- **Day 180:** "Time for a refresh?"
- **Day 365:** "Happy Anniversary"

Plain text. Human voice. No automation smell.

---

## Architecture

- **Cloudflare Workers** — Scheduled cron runs daily at 9 AM UTC
- **KV Store** — Project data (email, name, URL, ship date, unsubscribe status)
- **Resend API** — Email delivery
- **Plain text templates** — No HTML, no images, no screenshots

**Total code:** ~300 lines of TypeScript

---

## Voice Guidelines

### The Rule
**"Would I send this to a friend?"** If not, rewrite.

### Voice: Trusted Mechanic
Confident. Competent. Human. We know what we built. We stand behind it.

### What We Sound Like ✅
- Short sentences. No jargon.
- Honest, not cutesy.
- Personal without being fake casual.
- Clear CTAs that encourage replies.

**Example:**
> It's been 30 days. Your site is holding up beautifully. Page speed is solid. Uptime is 100%. You should be proud.

### What We DON'T Sound Like ❌

**Corporate:**
> We hope your deployment experience met expectations and that your digital presence is performing optimally.

**Fake Casual:**
> Hey there! Just checking in to see how things are going with your awesome new site! 😊

### Banned Words/Phrases
- "solutions"
- "leverage"
- "ecosystem"
- "digital presence"
- "synergy"
- "touch base"
- "circle back"
- "low-hanging fruit"
- "value-add"

### What We NEVER Do
- ❌ Upsell ("10% off next project")
- ❌ Generic check-ins ("How are things?")
- ❌ Corporate jargon
- ❌ "Built with Shipyard" footer badges
- ❌ Emojis (unless customer uses them first)
- ❌ HTML templates or images
- ❌ Screenshot attachments

### Voice Lock
Templates written in V1 never change unless data proves they're broken (<5% reply rate). This is a feature, not a bug.

---

## Setup & Deployment

### Prerequisites
- Cloudflare Workers account
- Resend account with verified domain
- Node.js 18+ installed
- Wrangler CLI installed

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Cloudflare KV
```bash
# Create KV namespace
wrangler kv:namespace create "PROJECTS"

# Update wrangler.toml with the namespace ID
# Replace "your-kv-namespace-id-here" with the ID from the command above
```

### 3. Set Up Resend
1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (`shipyard.ai`)
3. Add DNS records for SPF, DKIM, DMARC (see `resend-setup-guide.md`)
4. Get your API key

### 4. Add Secrets
```bash
# Set Resend API key
wrangler secret put RESEND_API_KEY
# Enter your Resend API key when prompted
```

### 5. Upload Project Data
```bash
# Prepare CSV with shipped projects
# Format: project_id,customer_email,customer_name,project_url,ship_date
# Example: proj_001,jane@example.com,Jane Doe,https://example.com,2024-01-15

# Upload to KV
npm run upload-csv
```

### 6. Deploy
```bash
# Deploy to production
npm run deploy

# Verify cron is active
wrangler deployments list
```

### 7. Test
```bash
# Run tests
npm test

# Send test email (manually trigger cron)
wrangler dev
```

---

## Project Data Schema

### CSV Format
```csv
project_id,customer_email,customer_name,project_url,ship_date
proj_001,jane@example.com,Jane Doe,https://example.com,2024-01-15
proj_002,john@example.com,John Smith,https://example.org,2024-02-01
```

### KV Storage
**Project key:** `project:{project_id}`

**Project value:**
```json
{
  "project_id": "proj_001",
  "customer_email": "jane@example.com",
  "customer_name": "Jane Doe",
  "project_url": "https://example.com",
  "ship_date": "2024-01-15",
  "emails_sent": {
    "day_007": true,
    "day_030": false
  },
  "unsubscribed": false
}
```

---

## Monitoring

### Resend Dashboard
- **Open rate:** Target 40-60%
- **Reply rate:** Target ≥10% (primary metric)
- **Unsubscribe rate:** Kill switch at >15%

### Cloudflare Logs
```bash
# View Worker logs
wrangler tail

# View KV operations
wrangler kv:key list --namespace-id=<your-namespace-id>
```

### Success Criteria
- **≥10% reply rate** → Continue, fund Phase 2
- **5-15% reply rate** → Iterate, measure another 90 days
- **<5% reply rate** → Kill Homeport, focus on acquisition

---

## Troubleshooting

### Emails Not Sending
1. Check Resend API key: `wrangler secret list`
2. Verify domain authentication in Resend dashboard
3. Check Worker logs: `wrangler tail`
4. Confirm cron is active: `wrangler deployments list`

### Emails Landing in Spam
1. Verify SPF/DKIM/DMARC records in DNS
2. Test with [Mail-Tester](https://www.mail-tester.com)
3. Review email content for spam triggers
4. Warm up domain with internal sends first

### Duplicate Emails
- KV has eventual consistency
- Check `emails_sent` tracking in KV
- Review Worker logs for duplicate processing

### Customer Replies Not Arriving
1. Verify `homeport@shipyard.ai` inbox exists
2. Check reply-to header in sent emails
3. Test by replying to a sent email

---

## Reply Management

### Owner
Phil Jackson monitors `homeport@shipyard.ai` personally.

### SLA
<24 hours response time.

### Process
1. Customer replies to lifecycle email
2. Reply arrives at `homeport@shipyard.ai`
3. Phil responds personally (no auto-reply)
4. Log reply in tracking (for metrics)

**Note:** If reply rate >10%, implement workflow for team response management.

---

## Unsubscribe Flow

### How It Works
1. Customer clicks unsubscribe link in email
2. Link format: `https://homeport.shipyard.ai/unsub?token={email}`
3. Worker sets `unsubscribed: true` in KV
4. Confirmation page shown
5. No future emails sent to that customer

### Compliance
CAN-SPAM compliant. One-click unsubscribe. No login required.

---

## Development

### Local Development
```bash
# Run Worker locally
npm run dev

# Run tests in watch mode
npm run test:watch
```

### File Structure
```
/homeport
├── /worker
│   ├── index.ts           # Main Worker entry point
│   ├── scheduler.ts       # Cron job logic
│   ├── emails.ts          # Email template rendering
│   ├── resend.ts          # Resend API client
│   ├── kv.ts              # KV store operations
│   └── unsubscribe.ts     # Unsubscribe handler
├── /templates
│   ├── day-007.txt        # Plain text templates
│   ├── day-030.txt
│   ├── day-090.txt
│   ├── day-180.txt
│   └── day-365.txt
├── /scripts
│   └── csv-to-kv.ts       # CSV upload script
├── /tests
│   ├── emails.test.ts     # Email rendering tests
│   └── scheduler.test.ts  # Cron logic tests
├── wrangler.toml          # Cloudflare config
├── package.json
├── tsconfig.json
└── README.md
```

### Adding a New Template
**DON'T.** Templates are locked for 90 days post-launch.

If you absolutely must (data shows <5% reply rate):
1. Update `/templates/day-XXX.txt`
2. Update `worker/emails.ts` rendering function
3. Add tests in `tests/emails.test.ts`
4. Get approval from Steve Jobs (voice) + Phil Jackson (data)
5. Deploy and measure for another 90 days

---

## Feature Freeze

### The Lock
**Test once. Ship. Never touch for 90 days.**

### Why
1. Let one full lifecycle complete (Day 365) before changing
2. Data needs time to prove what works
3. Prevents "optimization" that kills voice

### Exceptions
- **Critical bugs:** Emails not sending, spam issues, deliverability failures
- **Legal/compliance:** CAN-SPAM violations, unsubscribe not working
- **Security:** API key leaks, data exposure

### Everything Else
Wait 90 days. Measure. Then decide.

---

## Success Metrics

### Primary (Action-Based)
- **Reply rate:** % of recipients who reply
- **Revision request rate:** % who book follow-up work
- **Target:** ≥10% conversion

### Secondary (Engagement)
- **Open rate:** 40-60% (via Resend)
- **Unsubscribe rate:** <5% acceptable, <15% tolerable, >15% kill switch

### Qualitative
- Mental real estate — customer remembers us 6 months later
- "Did this email make them feel something?"

### Kill Switch Triggers
- Unsubscribe rate >15% in first week → pause, review copy
- Reply rate <1% after 50 emails → consider rewrite
- Emails landing in spam (>10% bounce) → fix deliverability immediately

---

## Phase 2 (The Moat)

### Why Phase 2 Is Critical
Current moat is weak. Competitors can copy templates in 48 hours.

**Durable advantage:** Data compounding.

### Phase 2 Features (6-Month Timeline)
1. **Project Telemetry** — Time/token tracking, revision reasons
2. **Build Intelligence** — Pattern analysis across projects
3. **Customer-Facing Data** — Peer comparison, benchmarks, insights
4. **Data Flywheel** — Every project teaches the system

### Commitment
If Homeport hits >10% reply rate, Phase 2 ships within 6 months.

---

## Team Roles

### Steve Jobs — Voice Guardian
- Writes all copy
- Veto power on tone changes
- Enforces voice guidelines

### Elon Musk — Speed Enforcer
- Builds infrastructure
- Veto power on scope creep
- Maintains <72 hour ship timeline

### Phil Jackson — Tie-Breaker
- Data owner
- Kill switch authority
- Reply inbox monitor

---

## License

UNLICENSED — Internal Shipyard tool

---

## The Deal

**Steve writes. Elon ships. Phil decides. Data judges.**

Speed without soul = noise.
Soul without speed = vaporware.
Ship both in 3 days.

---

*"Simple. Reliable. Unforgettable."* — Steve Jobs
*"Ship now, iterate later."* — Elon Musk
*"One triangle offense. Execute."* — Phil Jackson
