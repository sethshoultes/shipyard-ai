# Todo — CF Pages Auto-Deploy (Issue #99)

- [x] Create `.github/workflows/deploy-website.yml` with path-filtered push trigger — verify: `test -f .github/workflows/deploy-website.yml`
- [x] Validate YAML syntax (no tabs, valid indentation, parsable by Python yaml) — verify: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy-website.yml'))"`
- [x] Confirm workflow references `node-version: '22'` and `cache-dependency-path: website/package-lock.json` — verify: `grep "node-version: '22'" .github/workflows/deploy-website.yml`
- [x] Confirm install, build, and deploy commands run inside `website/` directory — verify: `grep "cd website" .github/workflows/deploy-website.yml`
- [x] Confirm deploy step targets `--project-name=shipyard-ai`, `--branch=main`, and `--commit-dirty=true` — verify: `grep -E "project-name=shipyard-ai|branch=main|commit-dirty=true" .github/workflows/deploy-website.yml`
- [x] Confirm secrets reference `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` — verify: `grep -E "CLOUDFLARE_API_TOKEN|CLOUDFLARE_ACCOUNT_ID" .github/workflows/deploy-website.yml`
- [x] Run local Next.js build to ensure `website/out/` is produced — verify: `cd website && npm run build && test -d out`
- [x] Run deliverable test suite (all scripts exit 0) — verify: `bash deliverables/github-issue-sethshoultes-shipyard-ai-99/tests/test_file_exists.sh`
