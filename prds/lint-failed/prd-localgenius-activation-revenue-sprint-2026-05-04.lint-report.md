# Lint Report — prd-localgenius-activation-revenue-sprint-2026-05-04

PRD: `/home/agent/shipyard-ai/prds/prd-localgenius-activation-revenue-sprint-2026-05-04.md`
Size: 10349 bytes / 238 lines
Date: 2026-05-04T06:38:02Z

## ❌ HARD FAILS (2)

- Missing 'Acceptance Criteria' or 'Success Criteria' section. Build gate cannot verify the PRD without testable assertions.
- No Required Files / Required Output section and no explicit file paths. Builder will guess what to write. Add a section listing every file the build must produce.

## ⚠️ WARNINGS (3)

- No 'Test Commands' or 'Test Instructions' section. QA cannot verify the build.
- No 'Out of Scope' or 'Done When' section. Risk of scope creep during build.
- No rock mapping. EOS-CONTEXT.md requires PRDs to map to a quarterly rock.

## How to fix

Read `/home/agent/shipyard-ai/prds/CODE-TEMPLATE.md` for the expected structure.
Edit this PRD locally and re-deploy: `scp -i ~/.ssh/greatminds <prd> root@164.90.151.82:/home/agent/shipyard-ai/prds/`
