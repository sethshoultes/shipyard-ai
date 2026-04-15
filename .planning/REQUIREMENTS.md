# REQUIREMENTS TRACEABILITY — MEMBERSHIP-V2 (HARBOR)

**Generated**: 2026-04-15
**Project Slug**: membership-v2
**Source Documents**:
- `/home/agent/shipyard-ai/prds/membership-v2.md`
- `/home/agent/shipyard-ai/rounds/membership-v2/decisions.md`

---

## CRITICAL CONSTRAINTS

1. **Do NOT rewrite, refactor, or optimize working code** - Copy the clean deliverable file only
2. **30-day code freeze** - No modifications after deployment for 30 days (proves stability before automation)
3. **Manual tests first** - Automation deferred until stability proven
4. **Ship scope strictly** - Zero new features beyond binary membership checks
5. **Product naming** - Internal reference "Harbor" only; keep "MemberShip" in file paths for now

---

## ATOMIC REQUIREMENTS BY PHASE

### PHASE 1: FIX REMAINING VIOLATIONS

**R1.1** - Verify source and target files exist
- Source: `deliverables/membership-fix/sandbox-entry.ts` (3,441 lines, 0 violations)
- Target: `plugins/membership/src/sandbox-entry.ts` (3,600 lines, 4 violations)

**R1.2** - Remove `rc.user` guard block from `approve` route (lines ~1233-1239)
- Delete 4-line block: admin user check + throw new Response
- Emdash handles auth before route execution

**R1.3** - Remove `rc.user` guard block from `revoke` route (lines ~1285-1291)
- Delete identical 4-line block

**R1.4** - Verify all banned patterns eliminated
- Run: `grep -c "throw new Response\|rc\.user\|rc\.pathParams" plugins/membership/src/sandbox-entry.ts`
- Expected result: 0

### PHASE 2: REGISTER IN SUNRISE YOGA

**R2.1** - Read Sunrise Yoga configuration
- File: `examples/sunrise-yoga/astro.config.mjs`
- Understand existing plugin registration pattern

**R2.2** - Locate membership plugin descriptor
- Check: `plugins/membership/src/index.ts` (descriptor)
- Verify export: `membershipPlugin()` function

**R2.3** - Add plugin import to astro.config.mjs
- Import from `@shipyard/membership` or local path
- Follow existing plugin pattern

**R2.4** - Register plugin in emdash configuration
- Add to `plugins` array in emdash integration
- Validate syntax with `npm run build`

**R2.5** - Verify KV namespace binding
- Check wrangler.jsonc or astro.config.mjs for KV binding
- Document binding configuration

### PHASE 3: EXECUTE SMOKE TESTS

**R3.1** - Test: Admin page loads
**R3.2** - Test: Member registration
**R3.3** - Test: Member status lookup
**R3.4** - Test: Verify no double-encoding
**R3.5** - Test: Admin Block Kit actions
**R3.6** - Test: Final banned patterns check

### PHASE 4: DOCUMENT & DEPLOY

**R4.1** - Create test results documentation
**R4.2** - Commit changes
**R4.3** - Deploy to Cloudflare (if applicable)
**R4.4** - Verify post-deployment

---

## SUCCESS CRITERIA

- ✅ 0 banned pattern violations (verified by grep)
- ✅ All 6 smoke tests PASS (100% success rate)
- ✅ Plugin registered in Sunrise Yoga config
- ✅ Test documentation complete
- ✅ Code committed
- ✅ Deployed and verified working
