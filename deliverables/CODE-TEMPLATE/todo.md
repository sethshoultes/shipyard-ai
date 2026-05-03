# CODE-TEMPLATE Todo List

## Core Template & Documentation
- [ ] Create codex.md template with locked sections — verify: file exists with all required frontmatter fields and sections
- [ ] Write comprehensive README.md with setup instructions — verify: README contains installation, usage, and contribution sections
- [ ] Create package.json for Node.js tooling — verify: npm install succeeds and scripts are defined
- [ ] Set up directory structure per debate decisions — verify: parser/, gate/, examples/, tests/ directories exist

## Validation Engine
- [ ] Create parser/schema.json with Codex schema rules — verify: schema validates JSON format and defines all required sections
- [ ] Implement parser/validate.js with deterministic validation — verify: returns exit code 0 for valid input, non-zero for invalid
- [ ] Write parser/errors.js with literal error messages — verify: error messages are clear and actionable
- [ ] Test parser performance <100ms validation target — verify: time command shows validation completes under 100ms

## Build Gate System
- [ ] Create gate/hollow-build.sh for minimum artifact validation — verify: script exits 0 when ≥3 source files and ≥1 test file present
- [ ] Create gate/hollow-build-ci.yml as v2 CI stub — verify: YAML is valid and contains GitHub Actions structure
- [ ] Test gate with insufficient files (should fail) — verify: script returns non-zero when requirements not met
- [ ] Test gate with sufficient files (should pass) — verify: script returns 0 when requirements met

## Examples & Documentation
- [ ] Create examples/with-codex/ example using template — verify: example follows codex.md structure exactly
- [ ] Create examples/without-codex/ example without template — verify: example shows typical unstructured PRD format
- [ ] Write examples/before-after.md comparison documentation — verify: shows side-by-side improvement in agent output
- [ ] Verify all examples are referenced in README — verify: README mentions examples directory

## Test Suite
- [ ] Create tests/validate-template.sh to test template compliance — verify: script exits 0 when template validates correctly
- [ ] Create tests/validate-parser.sh to test validation engine — verify: script tests various valid/invalid inputs
- [ ] Create tests/validate-gate.sh to test build gate functionality — verify: script tests both pass and fail scenarios
- [ ] Make all test scripts executable (chmod +x) — verify: ls -la shows executable permissions

## Final Integration & Polish
- [ ] Run complete test suite and ensure all pass — verify: all test scripts return exit code 0
- [ ] Validate codex.md template against its own schema — verify: parser/validate.js accepts codex.md as valid
- [ ] Test end-to-end workflow with example PRD — verify: template → validation → gate flow works
- [ ] Verify no forbidden patterns or excluded features — verify: grep searches return zero matches for excluded items
- [ ] Confirm all files are under 500KB total (no bloat) — verify: du -sh shows reasonable total size

## Quality Assurance
- [ ] Validate YAML syntax in all configuration files — verify: yamllint passes on all .yml files
- [ ] Check JSON syntax in schema and configuration files — verify: jq validates all .json files
- [ ] Verify shell scripts follow best practices — verify: shellcheck passes on all .sh files
- [ ] Test Node.js package installation and scripts — verify: npm ci and npm test succeed
- [ ] Confirm all executable scripts have proper shebang lines — verify: head -1 shows #!/bin/bash or #!/usr/bin/env node