# Todo — Pulse (Kimi Smoke Test)

## Wave 1 — Core Artifact

- [ ] Create `rounds/kimi-smoke-test/run.sh` with shebang and write command — verify: `head -1 rounds/kimi-smoke-test/run.sh | grep -q '#!/usr/bin/env bash'`
- [ ] Set executable bit on `run.sh` — verify: `test -x rounds/kimi-smoke-test/run.sh`
- [ ] Run `run.sh` and capture exit code — verify: `cd rounds/kimi-smoke-test && ./run.sh; test $? -eq 0`
- [ ] Confirm `pulse.txt` was created — verify: `test -f rounds/kimi-smoke-test/pulse.txt`
- [ ] Confirm `pulse.txt` contains exact locked sentence — verify: `grep -Fxq 'Kimi drove this.' rounds/kimi-smoke-test/pulse.txt`
- [ ] Confirm `pulse.txt` has no extra whitespace or trailing newlines — verify: `od -c rounds/kimi-smoke-test/pulse.txt | tail -1 | grep -v '\\r'` and byte count matches expected length
- [ ] Run `run.sh` a second time and confirm overwrite (not append) — verify: `test "$(cat rounds/kimi-smoke-test/pulse.txt | wc -l)" -eq 1 && grep -Fxq 'Kimi drove this.' rounds/kimi-smoke-test/pulse.txt`
- [ ] Audit `run.sh` for zero dependencies — verify: `grep -vE '^#|^echo |^printf |^cat |^>|^\./|^bash |^sh ' rounds/kimi-smoke-test/run.sh | grep -qvE '^$'` (manual review)

## Wave 2 — Pipeline Integration

- [ ] Create `.github/workflows/kimi-smoke-test.yml` — verify: `test -f .github/workflows/kimi-smoke-test.yml`
- [ ] Confirm YAML triggers on push to main and workflow_dispatch — verify: `grep -q 'workflow_dispatch' .github/workflows/kimi-smoke-test.yml && grep -q 'push:' .github/workflows/kimi-smoke-test.yml`
- [ ] Confirm job name is `pulse` and runs on `ubuntu-latest` — verify: `grep -q 'pulse:' .github/workflows/kimi-smoke-test.yml && grep -q 'ubuntu-latest' .github/workflows/kimi-smoke-test.yml`
- [ ] Confirm checkout uses `actions/checkout@v4` — verify: `grep -q 'actions/checkout@v4' .github/workflows/kimi-smoke-test.yml`
- [ ] Confirm workflow invokes `run.sh` — verify: `grep -q 'run.sh' .github/workflows/kimi-smoke-test.yml`
- [ ] Confirm run step does **not** set `continue-on-error: true` — verify: `grep -q 'continue-on-error' .github/workflows/kimi-smoke-test.yml && exit 1 || exit 0`
- [ ] Confirm workflow verifies `pulse.txt` exists and prints contents — verify: `grep -q 'pulse.txt' .github/workflows/kimi-smoke-test.yml`
- [ ] Validate YAML syntax — verify: `yamllint .github/workflows/kimi-smoke-test.yml` if available, otherwise `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/kimi-smoke-test.yml'))"`

## Wave 3 — Verification (Run Test Suite)

- [ ] Run `test-exit-code.sh` — verify: `cd deliverables/kimi-smoke-test/tests && ./test-exit-code.sh` exits 0
- [ ] Run `test-content.sh` — verify: `cd deliverables/kimi-smoke-test/tests && ./test-content.sh` exits 0
- [ ] Run `test-overwrite.sh` — verify: `cd deliverables/kimi-smoke-test/tests && ./test-overwrite.sh` exits 0
- [ ] Run `test-ci.sh` — verify: `cd deliverables/kimi-smoke-test/tests && ./test-ci.sh` exits 0
- [ ] Run `test-no-creep.sh` — verify: `cd deliverables/kimi-smoke-test/tests && ./test-no-creep.sh` exits 0
- [ ] Measure end-to-end wall-clock time — verify: `time rounds/kimi-smoke-test/run.sh` reports real < 5s

## Launch Gate

- [ ] All five test scripts pass — verify: `for t in deliverables/kimi-smoke-test/tests/*.sh; do "$t" || exit 1; done`
- [ ] Only one meaningful file exists in `rounds/kimi-smoke-test/` besides `decisions.md` and generated `pulse.txt` — verify: `ls rounds/kimi-smoke-test/ | grep -v decisions.md | grep -v pulse.txt | wc -l` == 1
- [ ] Seth can read `pulse.txt` and trust the system — verify: manual
