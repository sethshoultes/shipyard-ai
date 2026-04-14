# Board Review: intake-add-p2

**Reviewer:** Jensen Huang
**Role:** CEO, NVIDIA / Board Member, Great Minds Agency
**Date:** 2026-04-14

---

## Executive Summary

This is a **config change masquerading as a feature**. Adding "p2" to a label array is 30 seconds of work. The deliverables folder is empty because there's nothing to deliver—the code already supports p2 (check `health.ts:187-197` and `config.ts:93`).

This shouldn't be a PRD. This should be an environment variable change or a one-liner commit.

---

## Strategic Analysis

### What's the Moat? What Compounds Over Time?

**Nothing.** This is plumbing.

The *system* around this—automatic issue-to-PRD conversion—has moat potential, but this PRD doesn't touch it. The compounding asset would be:
- A corpus of well-structured PRDs that train future prioritization
- Feedback loops where issue resolution quality improves PRD generation
- Priority prediction models that auto-label based on content

None of that is being built here. We're just widening a filter.

### Where's the AI Leverage? Are We Using AI Where It 10x's the Outcome?

**Zero AI leverage.** This is a hardcoded label fetch.

The 10x opportunity is obvious: **AI-driven triage**. Instead of polling for human-assigned labels:
- LLM reads issue content → assigns priority
- LLM identifies duplicate/related issues → consolidates
- LLM extracts requirements → generates structured PRDs with acceptance criteria
- LLM predicts effort/complexity → aids sprint planning

We're doing `fetchByLabel("p2")` when we should be doing `inferPriorityFromContent(issue)`. The PRD explicitly says "do not refactor"—that's a flag that we're optimizing for velocity over leverage.

### What's the Unfair Advantage We're Not Building?

**The intelligence layer.** Right now:
- Humans label issues
- Daemon polls labels
- Daemon creates boilerplate PRDs

The unfair advantage would be:
1. **Semantic issue understanding**: Parse intent, extract requirements, identify stakeholders
2. **Cross-repo context**: "This issue relates to 3 others—here's the unified PRD"
3. **Priority inference**: Based on customer impact, code complexity, strategic alignment
4. **Auto-resolution routing**: "This is a typo fix → auto-PR without human PRD"

We have the infrastructure (daemon, GitHub integration, PRD generation). We're not using it.

### What Would Make This a Platform, Not Just a Product?

A platform enables others to build. Currently this is:
- **Internal tooling** for Great Minds Agency
- **Hardcoded repos** (`GITHUB_REPOS`)
- **Hardcoded labels** (`p0`, `p1`, `p2`)
- **Fixed PRD template**

Platform moves:
1. **Multi-tenant intake**: Any team can plug their repos, their labels, their templates
2. **Webhook-driven, not polling**: Real-time, event-sourced
3. **Plugin architecture**: Custom PRD generators, custom triage rules, custom destinations
4. **API-first**: Other tools can query intake state, trigger conversions, get analytics
5. **Marketplace**: Community-built intake rules, priority models, PRD templates

The daemon has daemon-shaped problems. It's batch, not streaming. It's configured, not programmable. It's internal, not extensible.

---

## Score: 2/10

**Justification:** Configuration tweak labeled as a deliverable—zero strategic value, zero AI leverage, zero platform thinking; the code already supports p2.

---

## Recommendations

1. **Kill this PRD.** Just set `INTAKE_PRIORITY_LABELS=p0,p1,p2` in env and move on.

2. **Next sprint, build the intelligence layer:**
   - Add LLM-based priority inference
   - Add issue deduplication/clustering
   - Add requirement extraction for PRD generation

3. **Start platform thinking:**
   - Move from polling to webhooks
   - Make repos/labels/templates configurable per-team
   - Expose intake as an API

4. **Measure what matters:**
   - PRD quality (are they actionable?)
   - Issue-to-resolution time (is intake accelerating delivery?)
   - False negative rate (are we missing important issues?)

---

*"The question isn't whether you can add p2 to the list. The question is why you're still using a list."*

— Jensen
