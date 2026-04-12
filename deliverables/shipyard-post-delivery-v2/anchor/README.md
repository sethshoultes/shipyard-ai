# Anchor — Shipyard Post-Delivery System

**Version:** 1.0
**Created:** 2026-04-12
**Product Name:** Anchor (formerly "Maintenance Plans")

---

## What is Anchor?

Anchor is Shipyard AI's post-delivery relationship system. It transforms one-time site builds into ongoing partnerships through:

- **4 email touchpoints** at key milestones (Day 0, Day 7, Day 30, Month 6)
- **2 maintenance tiers** (Anchor Basic $79/mo, Anchor Pro $149/mo)
- **Notion-based tracking** with automated reminders

---

## Directory Structure

```
/anchor/
├── README.md                    # This file
├── SEND-PROCESS.md              # Step-by-step email send workflow
├── emails/
│   ├── 01-launch-day.md         # Day 0 - Celebration-first launch email
│   ├── 02-day-7-checkin.md      # Day 7 - Week 1 relationship building
│   ├── 03-day-30-refresh.md     # Day 30 - One month milestone
│   └── 04-month-6-review.md     # Month 6 - Anniversary and renewal
├── stripe/
│   ├── anchor-basic.md          # $79/month tier description
│   └── anchor-pro.md            # $149/month tier description
├── notion/
│   └── client-database-template.md  # Schema + reminder setup
└── brand/
    └── voice-guide.md           # "Confident, warm, slightly irreverent"
```

---

## Core Philosophy

> **"We don't disappear."**

Every freelancer, agency, and dev shop vanishes after launch. Anchor is the promise that Shipyard stays. This positioning appears in every email, drives every touchpoint, and defines the product.

---

## Quick Start

1. **New client?** Add them to the Notion database (see `/notion/client-database-template.md`)
2. **Project launching today?** Send `/emails/01-launch-day.md` with merge fields filled
3. **Daily check?** Open Notion's "Emails Due Today" view
4. **Need voice guidance?** Read `/brand/voice-guide.md` before writing anything custom

---

## Success Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| First maintenance contract | 1 | 14 days |
| Email open rate | 40% | 30 days |
| Maintenance attach rate | 20-25% | 60 days |
| MRR from maintenance | $400 | 60 days |

---

## The Essence

> **What is this product REALLY about?**
> The promise that someone stays after the work is done.

> **What feeling should it evoke?**
> Relief. The quiet comfort of knowing you're not alone with this thing you don't fully understand.

> **What's the one thing that must be perfect?**
> The first email. It sets everything. Open with awe, not administration.

---

*"Now we build."* — Phil Jackson
