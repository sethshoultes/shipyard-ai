# Lint Report — github-issue-sethshoultes-shipyard-ai-98

PRD: `/home/agent/shipyard-ai/prds/github-issue-sethshoultes-shipyard-ai-98.md`
Size: 2725 bytes / 58 lines
Date: 2026-05-04T05:32:39Z

## ❌ HARD FAILS (2)

- No Required Files / Required Output section and no explicit file paths. Builder will guess what to write. Add a section listing every file the build must produce.
- PRD mentions no source-code file extensions (.ts/.tsx/.js/.php/.py/.go/.rs). Hollow-build gate will reject the build. If this is a docs-only PRD, add 'type: docs' to frontmatter.

## ⚠️ WARNINGS (3)

- No 'Test Commands' or 'Test Instructions' section. QA cannot verify the build.
- No 'Out of Scope' or 'Done When' section. Risk of scope creep during build.
- No rock mapping. EOS-CONTEXT.md requires PRDs to map to a quarterly rock.

## How to fix

Read `/home/agent/shipyard-ai/prds/CODE-TEMPLATE.md` for the expected structure.
Edit this PRD locally and re-deploy: `scp -i ~/.ssh/greatminds <prd> root@164.90.151.82:/home/agent/shipyard-ai/prds/`
