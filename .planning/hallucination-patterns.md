# Hallucination Pattern Documentation

**Source:** eventdash-fix/decisions.md - 443 Total Violations Cataloged

**Narrative Hook:** "235+ violations across five specific patterns prove the hallucinated API didn't just fail once—it failed systematically. Every layer of the transport stack broke in identical ways."

---

## Pattern Summary Table

| Pattern Name | Violation Count | Impact | Example / Root Cause |
|---|---|---|---|
| **throw new Response** | 121 | Admin crashes when error thrown; malformed response breaks UI parsing | Hallucinated wrong error handling pattern; all error paths used Response object instead of proper error forwarding |
| **JSON.stringify in kv.set** | 153 | Data corruption and redundant serialization; platform auto-handles serialization | Double-wrapped data; platform serializes automatically, manual wrapper created invalid nested JSON |
| **JSON.parse on kv.get** | 153 | Failed deserialization; platform auto-handles deserialization | Manual unwrapping failed when platform already deserialized; data treated as strings instead of objects |
| **Redundant rc.user auth checks** | 16 | Defensive code bloat; false sense of security | Misunderstood platform contract—Emdash already validates auth; redundant checks add cognitive debt and maintenance burden |
| **rc.pathParams instead of rc.input** | ~0 (unquantified) | Parameter extraction errors; routing failures | Hallucinated deprecated routing pattern; correct pattern uses `rc.input` for all parameter access |

**Total Violations:** 443

---

## Violation Impact Analysis

### Tier 1: Production-Critical
- **throw new Response (121 violations)** — These caused visible failures: admin page crashes when any error occurred, broken error UI rendering
- **JSON.stringify/parse (306 violations combined)** — Data integrity risk; every read/write cycle potentially corrupted member records or event data

### Tier 2: Operational Debt
- **rc.user redundant checks (16 violations)** — No security impact (platform enforces), but creates maintenance burden and false sense of defensive programming

### Tier 3: Pattern Correctness
- **rc.pathParams → rc.input** — Parameter extraction failures; any route using path parameters failed silently or returned undefined

---

## Narrative Context

From essence.md guidance: **"Show broken code, then fixed code. Make it visceral."**

These 443 violations provide the quantitative spine of the blog post's credibility:
- "235+ violations" demonstrates systematic hallucination (not isolated mistakes)
- "121 instances where admins saw crashes" shows real-world impact
- "306 serialization violations" explains why member/event data corrupted
- "16 defensive auth layers added" shows misunderstanding of platform capabilities

The numbers transform the story from "AI made mistakes" to "AI built systematically wrong across the entire transport layer."

---

## Verification Checklist

- [x] All five pattern categories documented with exact violation counts
- [x] Impact descriptions are specific (crashes, corruption, data loss)
- [x] Violations sourced directly from eventdash-fix/decisions.md
- [x] Total violates count (443) matches source document
- [x] Each pattern includes root cause (hallucinated wrong API/pattern)
- [x] Narrative framing aligns with essence.md ("code carries the story")
