---
slug: codex-template-v1
title: Codex PRD Template v1.0
author: AgentPress
date: 2024-05-03
version: 1.0.0
parent: none
dependencies: []
---

## Codex Template - Master PRD Specification

## Background

The Codex template enforces structured product requirements documentation (PRDs) to eliminate agent hallucination and improve build accuracy. This template provides deterministic validation through verbatim code blocks and minimum acceptance criteria. Standardized structure ensures consistent agent output while maintaining flexibility for diverse requirements.

## Acceptance Criteria

- Minimum 5 acceptance criteria for feature work
- Minimum 3 acceptance criteria for fixes
- All acceptance criteria must be testable and verifiable
- Criteria must be written in deterministic format
- Each criterion includes clear verification method

## Verbatim Contracts

All code blocks must be verbatim (exact implementation) unless explicitly marked as pseudocode. Agents are forbidden from inventing code logic not specified in requirements.

### Required Code Block Format

```javascript
// Verbatim implementation - no agent interpretation allowed
function validateContract(prd) {
    // Exact code as specified
    return prd.meetsCriteria;
}
```

### Template Enforcement Rules

- Prohibit unfinished markers, deferred items, and provisional text
- No empty function bodies or stub implementations
- All code must be complete and functional
- Documentation must be accurate and current

## Risks

- Risk: Template rigidity may limit creative solutions
  Mitigation: Allow structured deviations with explicit justification
- Risk: Verbatim requirements may create over-specification
  Mitigation: Mark sections as "guideline" vs "mandatory"
- Risk: Validation overhead may slow development
  Mitigation: Automated validation with sub-100ms target

## Deliverables

1. **Template File**: `codex.md` - Master template specification
2. **Validation Engine**: `parser/validate.js` - Deterministic schema validation
3. **Schema Definition**: `parser/schema.json` - JSON schema for template validation
4. **Error Messages**: `parser/errors.js` - Standardized error responses
5. **Build Gate**: `gate/hollow-build.sh` - Minimum artifact validation
6. **CI Configuration**: `gate/hollow-build-ci.yml` - GitHub Actions workflow
7. **Example PRDs**: `examples/` directory with before/after comparisons
8. **Test Suite**: `tests/` directory with comprehensive validation
9. **Documentation**: `README.md` with setup and usage instructions
10. **Package Configuration**: `package.json` for Node.js tooling

## Verification Commands

```bash
# Template validation
./tests/validate-template.sh

# Parser validation
./tests/validate-parser.sh

# Build gate validation
./tests/validate-gate.sh

# Complete test suite
./tests/validate-structure.sh
```

## Integration Notes

- Template integrates with AgentPress WordPress plugin build pipeline
- Validation engine runs in CI/CD pipeline pre-commit hooks
- Build gate prevents deployment of insufficient artifacts
- Examples serve as training data for agent improvement

## Performance Requirements

- Template validation: <50ms
- Schema parsing: <20ms
- Complete validation: <100ms
- Memory usage: <10MB

## Maintenance

- Template versioning follows semantic versioning
- Backward compatibility maintained for minor versions
- Breaking changes require major version increment
- Documentation updated with each release