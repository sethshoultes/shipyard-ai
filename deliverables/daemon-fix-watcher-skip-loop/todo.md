# To-Do List — Proof: Post-Deploy Domain Verification

**Slug:** `daemon-fix-watcher-skip-loop`
**Created:** 2026-05-02
**Spec:** `/home/agent/shipyard-ai/deliverables/daemon-fix-watcher-skip-loop/spec.md`

---

## Tasks

### Wave 1: Configuration + Verification Engine

- [ ] Create `domains.json` at repo root with domain configuration schema
- [ ] Create `scripts/proof.js` verification engine with DNS + HTTPS checks
- [ ] Verify `domains.json` is valid JSON (node parse test)
- [ ] Verify `proof.js` runs without syntax errors

### Wave 2: Workflow Integration

- [ ] Modify `.github/workflows/deploy-website.yml` to add Proof step after deploy
- [ ] Verify Proof step has correct guard (`if: github.ref == 'refs/heads/main'`)
- [ ] Verify workflow YAML is valid

### Wave 3: Local Verification

- [ ] Test success path with real domain
- [ ] Test failure path with nonsense domain
- [ ] Test origin validation with wrong-CNAME domain
- [ ] Verify elapsed time <10s (fail-fast guarantee)
- [ ] Verify failure output is ≤140 chars, one line, no stack trace

### Final Steps

- [ ] Run all verification shell scripts in `tests/`
- [ ] Update todo.md with completion marks
- [ ] Create execution report
- [ ] Commit on feature branch

---

## Summary

| Status | Count |
|--------|-------|
| Total Tasks | 14 |
| Estimated Time | ~45 minutes |
