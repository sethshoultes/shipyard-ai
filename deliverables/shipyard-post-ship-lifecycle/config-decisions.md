# Homeport Configuration Decisions
**Status:** Locked
**Date:** April 16, 2026
**Owner:** Phil Jackson

---

## Critical Configuration Decisions

These decisions drive Day 0 pre-build setup and operational workflow.

### Decision 1: From Email Address

**Chosen Address:** `homeport@shipyard.ai`

**Rationale:**
- Matches customer-facing product name ("Homeport")
- Distinct from `hello@shipyard.ai` (generic contact form address)
- Signals this is a key feature, not a generic system email
- Requires domain setup but delivers on brand promise
- Aligns with "Someone remembers your project" positioning

**Domain Setup Required:**
- SPF record configured for `homeport@shipyard.ai`
- DKIM signature enabled on domain
- DMARC policy set (p=none or p=quarantine)
- Domain reputation verified with Resend
- Warm-up period: Send to internal team first, then scale

**Implementation:**
- Set `FROM_EMAIL = "homeport@shipyard.ai"` in `wrangler.toml`
- Configure Resend API to use Bearer token + domain authentication
- Test deliverability with Mail-Tester before launch

**Reference:** decisions.md Section 4.2 (Email "From" Address and Reply-To)

---

### Decision 2: Reply Inbox Owner & SLA

**Chosen Approach:** Shared Inbox with Phil Jackson as Primary Owner

**Configuration:**
- **Inbox Address:** `homeport@shipyard.ai` (shared mailbox)
- **Primary Owner:** Phil Jackson
- **Team Access:** Available to core team for monitoring/backup
- **Response SLA:** <24 hours (aggressive, reflects care commitment)

**Operational Details:**
- All customer replies to `homeport@shipyard.ai` emails come to this shared inbox
- Phil monitors daily and responds personally
- Team alerts set up if no response in >12 hours
- Track all replies in shared document/channel for qualitative feedback

**Scaling Plan:**
- **If reply rate <5%:** Minimal burden, continue manual handling
- **If reply rate 5-15%:** Monitor closely, consider response templates
- **If reply rate >10%:** Evaluate ticketing system for V1.1 (Elon's warning)

**Trust Signal:**
- Replies get human response from Phil, not auto-reply
- Personal touch reinforces "Someone remembers your project" promise
- Opens door to revision requests and repeat business
- Qualitative feedback from replies informs email quality

**Reference:** decisions.md Section 4.5 (Reply Handling)

---

## Implementation Checklist

### Before Build Starts (Day 0)

- [ ] Domain authentication set up in Resend (SPF/DKIM/DMARC)
- [ ] `homeport@shipyard.ai` mailbox created and accessible
- [ ] Phil Jackson confirmed as primary inbox owner
- [ ] Team members granted access to shared inbox
- [ ] Reply monitoring SLA communicated (<24 hours)
- [ ] Warm-up sequence planned (internal team first, then customers)

### During Build (Day 1-2)

- [ ] FROM_EMAIL configured in `wrangler.toml` → `homeport@shipyard.ai`
- [ ] Resend API integration tested with new address
- [ ] Test emails sent to internal team (verify deliverability)
- [ ] Reply-to address hardcoded in Worker code
- [ ] Unsubscribe link tested (goes to appropriate handler)

### Before Go-Live (Day 2)

- [ ] Deliverability confirmed (Mail-Tester score >80)
- [ ] Test email fully received in `homeport@shipyard.ai` inbox
- [ ] Reply SLA documented in operational runbook
- [ ] Phil confirms readiness to monitor replies
- [ ] Escalation path defined if >15% response rate

---

## Delivery Timeline

**From Address Decision → Day 0 Action**
- Email address locked: `homeport@shipyard.ai`
- Domain setup begins immediately
- By end of Day 0: SPF/DKIM/DMARC verified, mailbox ready

**Reply Handling → Operational Launch**
- Day 1-2: Verify reply-to routing works
- Day 2: Go-live with <24h SLA
- Days 3-90: Phil monitors replies, tracks metrics

---

## Risk Mitigation

### Email Deliverability Risk
- **Mitigation:** Plain text emails only (highest deliverability)
- **Mitigation:** SPF/DKIM/DMARC properly configured before launch
- **Mitigation:** Domain warm-up with internal team first
- **Mitigation:** Monitor bounce rate daily (kill switch if >10% bounce)

### Reply Inbox Overwhelm Risk
- **Mitigation:** Start with manual CSV (small batch, low volume)
- **Mitigation:** SLA is <24h, not <2h (realistic for humans)
- **Mitigation:** Team backup available if Phil is unavailable
- **Mitigation:** Auto-escalation to V1.1 ticketing if >10% reply rate

### Brand Promise Risk
- **Mitigation:** Phil personally monitors (not a system)
- **Mitigation:** Human responses only (no auto-reply)
- **Mitigation:** Reply tracking ensures we respond to every message

---

## Related Decisions

These configuration choices depend on other locked decisions:

- **Email Format:** Plain text only (Decision 1.4 in decisions.md) → improves deliverability
- **Email Cadence:** Day 7, 30, 90, 180, 365 (Decision 1.3) → drives reply frequency
- **Personalization:** `{name}` and `{project_url}` only (Decision 1.5) → keeps emails human
- **Voice:** Trusted mechanic (Decision 1.6) → should encourage replies

---

## Success Metrics (90-Day Measurement)

These decisions will be validated by:

1. **Deliverability Rate:** % of emails reaching inbox (target >95%)
2. **Open Rate:** % of recipients who open (from Resend dashboard)
3. **Reply Rate:** % of recipients who reply (target >10% = success)
4. **Response Time:** Average time to reply (should be <24h)
5. **Unsubscribe Rate:** % who opt out (kill switch if >15% first week)

---

## Approval

**Decided by:** Phil Jackson (Data Owner, Reply Inbox Owner)
**Aligned with:** decisions.md (Section 4.2 & 4.5)
**Status:** LOCKED ✅

**Locked by:** Development Agent (executing phase-1-task-2)
**Date:** April 16, 2026

---

## Next Steps

1. **Phil Jackson:** Set up `homeport@shipyard.ai` mailbox + domain auth
2. **Elon Musk:** Configure FROM_EMAIL in wrangler.toml, verify with Resend
3. **Steve Jobs:** Ensure email templates encourage replies (voice check)
4. **Build Team:** Use these decisions in Day 1 Worker implementation

*"Simple. Reliable. Unforgettable."* — Steve Jobs
*"Ship now, iterate later."* — Elon Musk
*"One triangle offense. Execute."* — Phil Jackson
