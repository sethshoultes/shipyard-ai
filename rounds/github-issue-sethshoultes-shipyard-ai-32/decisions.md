# Chorus/ReviewPulse — Locked Decisions

*Consolidated by Phil Jackson, Zen Master*

---

## Essence (North Star)

> **Letting small business owners sleep at night by turning customer voices into peace of mind.**

- Feeling: Confidence without obsession
- Perfection point: The first 30 seconds — Connect. See. Done.
- Creative direction: Invisible. Warm. Immediate.

---

## Decision Log

### Decision 1: Product Name
| | |
|---|---|
| **Proposed by** | Steve ("Kill ReviewPulse, call it Chorus") |
| **Opposed by** | Elon ("Renaming delays ship by three weeks") |
| **Winner** | **Elon** |
| **Rationale** | Renaming touches every file, route, and test. Ship ReviewPulse in v1; rebrand to Chorus in v2 when product-market fit is proven and 1000+ users exist. Names are strategy, but working software beats poetry in development. |
| **Locked** | Ship as **ReviewPulse** for v1 |

### Decision 2: Design System
| | |
|---|---|
| **Proposed by** | Steve ("Zero chrome — the plugin should disappear") |
| **Opposed by** | Elon ("Beautiful philosophy, zero engineering guidance") |
| **Winner** | **Elon** |
| **Rationale** | "Zero chrome" is unspecified. Engineers will iterate endlessly chasing an aesthetic in Steve's head. Use Emdash's existing design system — if it looks like Emdash, it looks right. Shipping-ready beats conceptually elegant. |
| **Locked** | Use **Emdash's existing design system** |

### Decision 3: Response Templates
| | |
|---|---|
| **Proposed by** | Elon (Cut in Round 1) |
| **Agreed by** | Steve ("If I'm arguing for authentic voice, pre-written templates are hypocritical") |
| **Winner** | **Consensus** |
| **Rationale** | Both agree: if brand voice is the differentiator, canned responses undermine it. Manual replies work fine for v1 scale. |
| **Locked** | **Cut response templates** |

### Decision 4: Email Campaigns
| | |
|---|---|
| **Proposed by** | Elon (Cut — "this is a marketing tool, not review management") |
| **Agreed by** | Steve ("That's a different product") |
| **Winner** | **Consensus** |
| **Rationale** | Marketing automation has no place in v1. Focus on core loop: sync, display, respond. |
| **Locked** | **Cut email campaigns** |

### Decision 5: Manual Review Creation
| | |
|---|---|
| **Proposed by** | Elon (Cut — "focus on sync, not manual entry") |
| **Agreed by** | Steve (no objection) |
| **Winner** | **Elon** |
| **Rationale** | Manual entry is edge-case functionality. Sync from Google/Yelp is the primary flow. |
| **Locked** | **Cut manual review creation** |

### Decision 6: Notification Strategy
| | |
|---|---|
| **Proposed by** | Steve ("One daily digest. That's it. No settings page.") |
| **Opposed by** | Elon ("What if there's a 1-star review at 9 AM?") |
| **Winner** | **Contested — requires resolution** |
| **Steve's position** | Decisions are our job, not the user's burden. No notification config UI. |
| **Elon's position** | Immediate notification for negative reviews prevents 9 hours of reputation damage. |
| **Locked** | **OPEN QUESTION** — see below |

### Decision 7: Sentiment Analysis / Analytics Theater
| | |
|---|---|
| **Proposed by** | Steve ("NO to sentiment analysis graphs") |
| **Agreed by** | Elon ("A 1-star review doesn't need a confidence score") |
| **Winner** | **Consensus** |
| **Rationale** | You don't need a chart to know a 1-star review is bad. No analytics theater. |
| **Locked** | **No sentiment graphs, no confidence scores** |

### Decision 8: AI-Generated Response Suggestions
| | |
|---|---|
| **Proposed by** | Steve ("NO — your voice is your brand") |
| **Opposed by** | Elon ("80% of owners don't respond because they don't know what to say") |
| **Winner** | **Steve** (for v1) |
| **Rationale** | Steve's authenticity argument holds for MVP. However, Elon raises a valid point that silence kills reputation. Defer AI suggestions to v2 with "editable draft" framing. |
| **Locked** | **No AI suggestions in v1** |

### Decision 9: Brand Voice in UI Copy
| | |
|---|---|
| **Proposed by** | Steve ("'You've got 3 new reviews' not '3 reviews detected in sync cycle'") |
| **Agreed by** | Elon ("This costs nothing to implement. Do it.") |
| **Winner** | **Consensus** |
| **Rationale** | Warm, human copy is zero-cost differentiation. Professional, attentive, no jargon. |
| **Locked** | **Human-first UI copy throughout** |

### Decision 10: First-Run Experience
| | |
|---|---|
| **Proposed by** | Steve ("Connect → See → Respond in under 30 seconds") |
| **Agreed by** | Elon ("Sync-on-connect should be instant gratification") |
| **Winner** | **Consensus** |
| **Rationale** | The first 30 seconds define whether users stay. No loading spinners, no config screens. Reviews appear the moment OAuth completes. |
| **Locked** | **30-second first-run or we've failed** |

### Decision 11: O(n) KV Pattern
| | |
|---|---|
| **Proposed by** | Elon ("Fine for <1000 reviews, bottleneck at 10,000+") |
| **Agreed by** | Steve ("Premature optimization is the root of all evil") |
| **Winner** | **Consensus** |
| **Rationale** | No restaurant has 10,000 reviews on day one. Optimize for proven product-market fit, not theoretical scale. |
| **Locked** | **Keep current KV pattern for v1** |

### Decision 12: Testing Strategy
| | |
|---|---|
| **Proposed by** | Elon ("Fix patterns, test with mocks, defer live API testing to human QA") |
| **Agreed by** | Steve ("Mock data testing with human QA is the pragmatic path") |
| **Winner** | **Consensus** |
| **Rationale** | Agent can fix 72 banned patterns mechanically. Agent cannot test against live Google/Yelp APIs without credentials. |
| **Locked** | **Mock data testing; human QA for live APIs** |

---

## MVP Feature Set (What Ships in v1)

### IN
| Feature | Description |
|---------|-------------|
| **Google Sync** | OAuth connect, pull reviews from Google Business Profile |
| **Yelp Sync** | API integration, pull reviews from Yelp |
| **Display Widget** | Frontend component showing reviews on site |
| **Admin Dashboard** | View, filter, search reviews |
| **Featured Toggle** | Mark reviews as featured for prominent display |
| **Flagged Toggle** | Mark reviews for attention/follow-up |
| **30-Day Trends** | Basic trend line (tiny, useful, already built) |
| **Schema Markup** | JSON-LD for SEO (review rich snippets) |

### OUT (v2+)
| Feature | Reason |
|---------|--------|
| Response templates | Undermines authentic voice |
| Email campaigns | Different product (marketing automation) |
| Manual review creation | Edge case; focus on sync |
| Notification emails | Contested; resolve before v1 ship |
| AI response suggestions | v2 with "editable draft" framing |
| Sentiment analysis | Analytics theater |
| Competitive benchmarking | Focus on your customers, not rivals |

---

## File Structure (What Gets Built)

Based on Elon's analysis, the refactored plugin should be ~800 lines:

```
reviewpulse/
├── index.ts                 # Main entry, route registration
├── routes/
│   ├── admin.ts            # Admin dashboard routes
│   ├── api.ts              # CRUD API endpoints
│   ├── oauth.ts            # Google OAuth flow
│   └── widget.ts           # Frontend widget endpoint
├── sync/
│   ├── google.ts           # Google Places API sync
│   └── yelp.ts             # Yelp API sync
├── storage/
│   └── kv.ts               # KV operations (reviews:list pattern)
├── components/
│   ├── widget.tsx          # Review display widget
│   └── admin-panel.tsx     # Admin dashboard UI
├── types.ts                # Shared type definitions
└── utils.ts                # Helpers (date formatting, etc.)
```

### Required Fixes (Mechanical)
- 72 `throw new Response()` patterns → proper Emdash response handling
- 17 `rc.user` references → correct Emdash context access
- Align with Emdash design system components

---

## Open Questions (What Still Needs Resolution)

### 1. Notification Strategy
**The Conflict:**
- Steve: One daily digest, no configuration, decisions are our job
- Elon: Immediate notification for negative reviews prevents reputation damage

**Resolution Required Before Build:**
- Option A: Daily digest only (Steve's position)
- Option B: Daily digest + immediate for ≤2 stars (compromise)
- Option C: Smart defaults with hidden power-user config

**Recommendation:** Option B — daily digest default + immediate push for 1-2 star reviews. Respects Steve's "no config" stance while preventing Elon's 9-hour reputation gap.

### 2. Chorus Rebrand Trigger
**When do we rename ReviewPulse to Chorus?**
- At 1000 users?
- At proven product-market fit (what metric)?
- At v2 feature milestone?

**Recommendation:** Define rebrand trigger as "500 weekly active users + positive NPS" — not arbitrary version numbers.

### 3. Live API Credentials
**Who provides Google Places / Yelp API keys for testing?**
- Mock data only in agent build
- Human QA needs real credentials
- Bella's Bistro needs working API connection

**Recommendation:** Build with mocks, document exact credential requirements, hand off to human for API key provisioning.

---

## Risk Register (What Could Go Wrong)

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Google OAuth flow breaks** | Medium | Critical | Test against mock OAuth; human QA verifies live flow |
| **KV storage pattern fails at scale** | Low (v1) | Medium | Acceptable for v1; document pagination strategy for v2 |
| **Google Places API rate limits** | Low (v1) | Medium | Free tier is 50 req/day; sufficient for beta |
| **Design system mismatch** | Medium | Low | Use Emdash components exclusively; no custom CSS |
| **72 banned patterns not all fixed** | Low | High | Systematic grep; test each route |
| **Bella's Bistro API keys missing** | Medium | High | Document requirements; escalate to human before deploy |
| **First-run takes >30 seconds** | Medium | Medium | Measure OAuth→reviews-visible; optimize critical path |
| **Yelp API deprecation/changes** | Low | Medium | Abstract sync interface; Yelp is secondary to Google |
| **Review display breaks site layout** | Medium | Medium | Use Emdash grid system; test on Bella's Bistro template |
| **No mobile responsiveness** | Low | Medium | Emdash design system is mobile-first; inherit it |

---

## Final Directive

**Build ReviewPulse v1 with:**
1. Google + Yelp sync
2. Display widget (Emdash design system)
3. Admin dashboard (view, filter, feature, flag)
4. 30-second first-run experience
5. Human-first UI copy
6. ~800 lines of clean, tested code

**Do not build:**
- Response templates
- Email campaigns
- Manual review creation
- AI suggestions
- Sentiment analysis
- Notification system (pending resolution)

**Before shipping:**
- Fix all 72 banned patterns
- Test with mock data
- Document API credential requirements
- Hand off to human QA for live API verification

---

*The goal isn't to manage reviews. The goal is to make every customer feel heard—and to let business owners sleep at night.*

— Phil Jackson, consolidating Steve Jobs and Elon Musk
