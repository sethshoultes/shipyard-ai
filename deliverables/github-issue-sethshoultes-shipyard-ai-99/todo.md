# Todo — CF Pages Auto-Deploy (Issue #99)

- [ ] Create `.github/workflows/deploy-website.yml` with path-filtered push trigger — verify: `test -f .github/workflows/deploy-website.yml`
- [ ] Validate YAML syntax (no tabs, valid indentation, parsable by Python yaml) — verify: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy-website.yml'))"`
- [ ] Confirm workflow references `node-version: '22'` and `cache-dependency-path: website/package-lock.json` — verify: `grep "node-version: '22'" .github/workflows/deploy-website.yml`
- [ ] Confirm install, build, and deploy commands run inside `website/` directory — verify: `grep "cd website" .github/workflows/deploy-website.yml`
- [ ] Confirm deploy step targets `--project-name=shipyard-ai`, `--branch=main`, and `--commit-dirty=true` — verify: `grep -E "project-name=shipyard-ai|branch=main|commit-dirty=true" .github/workflows/deploy-website.yml`
- [ ] Confirm secrets reference `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` — verify: `grep -E "CLOUDFLARE_API_TOKEN|CLOUDFLARE_ACCOUNT_ID" .github/workflows/deploy-website.yml`
- [ ] Run local Next.js build to ensure `website/out/` is produced — verify: `cd website && npm run build && test -d out`
- [ ] Run deliverable test suite (all scripts exit 0) — verify: `bash deliverables/github-issue-sethshoultes-shipyard-ai-99/tests/run-all.sh`
