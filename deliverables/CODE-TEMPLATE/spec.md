# CODE-TEMPLATE Build Specification

## Goals

From the PRD, the goal is to create a standardized PRD template and supporting infrastructure that improves agent build accuracy and reduces hallucination. The template enforces structured thinking and verbatim code blocks to prevent agents from inventing code.

From the plan, this specifically supports building the AgentPress WordPress plugin with a structured approach that includes:
- Enforced verbatim code blocks in PRDs
- Minimum acceptance criteria (5 for features, 3 for fixes)
- Deterministic validation
- Hollow-build gate checking

## Implementation Approach

Based on the phase-1-plan.md and debate decisions:

1. **Template Structure**: Create a markdown template (`codex.md`) with locked sections including frontmatter, background, acceptance criteria, verbatim contracts, risks, and deliverables

2. **Validation Engine**: Build a Node.js deterministic parser (`parser/validate.js`) that validates PRDs against the schema using strict regex and frontmatter validation

3. **Build Gate**: Implement a shell script (`gate/hollow-build.sh`) that validates minimum artifact requirements (≥3 source files, ≥1 test file)

4. **Naming Convention**: Use "Codex" as the product name per debate decision #1, with technical filename `codex.md`

5. **Directory Structure**: Follow the namespaced approach `deliverables/<version>/<slug>/` for version management

## Verification Criteria

### Template Verification
- **File exists**: `codex.md` contains all required sections from debate decisions
- **Section validation**: Template includes frontmatter with fields: slug, title, author, date, version, parent, dependencies
- **Content structure**: Background section max 200 words, acceptance criteria minimums enforced, verbatim contracts section present
- **Voice consistency**: Template uses master craftsman voice per decision #9

### Parser Verification
- **Schema validation**: `parser/validate.js` exists and validates all required sections
- **Exit codes**: Returns 0 for valid PRDs, non-zero for invalid ones
- **Error messages**: Provides literal, clear error messages using Elon's voice
- **Performance**: Validation completes in <100ms per spec

### Build Gate Verification
- **Artifact counting**: `gate/hollow-build.sh` checks for ≥3 source files and ≥1 test file
- **Exit behavior**: Returns non-zero when requirements not met
- **Path validation**: Correctly validates namespaced deliverables structure

### Integration Verification
- **Example PRD**: `examples/before-after.md` shows side-by-side comparison
- **README**: Clear installation and usage instructions
- **Package config**: `package.json` properly configured for Node.js tooling

## Files to be Created or Modified

### New Files
1. `/home/agent/shipyard-ai/deliverables/CODE-TEMPLATE/codex.md` - Main PRD template
2. `/home/agent/shipyard-ai/deliverables/CODE-TEMPLATE/parser/validate.js` - Validation engine
3. `/home/agent/shipyard-ai/deliverables/CODE-TEMPLATE/parser/schema.json` - Validation schema
4. `/home/agent/shipyard-ai/deliverables/CODE-TEMPLATE/parser/errors.js` - Error message definitions
5. `/home/agent/shipyard-ai/deliverables/CODE-TEMPLATE/gate/hollow-build.sh` - Build gate script
6. `/home/agent/shipyard-ai/deliverables/CODE-TEMPLATE/gate/hollow-build-ci.yml` - CI stub for v2
7. `/home/agent/shipyard-ai/deliverables/CODE-TEMPLATE/examples/with-codex/` - Example using template
8. `/home/agent/shipyard-ai/deliverables/CODE-TEMPLATE/examples/without-codex/` - Example without template
9. `/home/agent/shipyard-ai/deliverables/CODE-TEMPLATE/examples/before-after.md` - Comparison documentation
10. `/home/agent/shipyard-ai/deliverables/CODE-TEMPLATE/README.md` - Usage documentation
11. `/home/agent/shipyard-ai/deliverables/CODE-TEMPLATE/package.json` - Node.js configuration

### Test Files
1. `/home/agent/shipyard-ai/deliverables/CODE-TEMPLATE/tests/validate-template.sh` - Template validation test
2. `/home/agent/shipyard-ai/deliverables/CODE-TEMPLATE/tests/validate-parser.sh` - Parser functionality test
3. `/home/agent/shipyard-ai/deliverables/CODE-TEMPLATE/tests/validate-gate.sh` - Build gate test

### Directories Created
1. `/home/agent/shipyard-ai/deliverables/CODE-TEMPLATE/parser/` - Validation engine directory
2. `/home/agent/shipyard-ai/deliverables/CODE-TEMPLATE/gate/` - Build gate directory
3. `/home/agent/shipyard-ai/deliverables/CODE-TEMPLATE/examples/` - Example PRDs directory
4. `/home/agent/shipyard-ai/deliverables/CODE-TEMPLATE/tests/` - Test scripts directory

## Success Metrics

Per the PRD "Done When" section:
- All acceptance criteria pass with validation commands
- Template enforces required sections and verbatim code blocks
- Parser validates schema with <100ms performance
- Build gate enforces minimum artifact requirements
- Examples demonstrate before/after improvement in agent output
- README provides clear setup and usage instructions