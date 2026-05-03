# Codex Template - Deterministic PRD Validation

A standardized PRD template and validation system that eliminates agent hallucination and improves build accuracy through deterministic validation and verbatim code blocks.

## Overview

Codex Template provides:

- **Structured PRD Template** (`codex.md`) with enforced sections and verbatim contracts
- **Deterministic Validation Engine** (`parser/validate.js`) with sub-100ms performance
- **Build Gate System** (`gate/hollow-build.sh`) for minimum artifact validation
- **Comprehensive Examples** showing before/after improvements in agent output
- **Automated Testing** with full validation suite

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/agentpress/codex-template.git
cd codex-template

# No dependencies required - pure Node.js and shell scripts
npm install  # Creates package entries but no external deps
```

### Basic Usage

```bash
# Validate a PRD template
node parser/validate.js your-prd.md

# Run build gate validation
./gate/hollow-build.sh

# Run complete test suite
./tests/validate-structure.sh

# Individual test components
./tests/validate-template.sh
./tests/validate-parser.sh
./tests/validate-gate.sh
```

## Template Structure

### Required Frontmatter

```yaml
---
slug: your-prd-slug
title: Your PRD Title
author: Your Name
date: 2024-05-03
version: 1.0.0
parent: none  # or: feature, fix, refactor, docs
dependencies: []  # optional dependencies
---
```

### Required Sections

1. **Background** - Project context (max 200 words)
2. **Acceptance Criteria** - Minimum 5 for features, 3 for fixes
3. **Verbatim Contracts** - Code blocks with explicit implementation requirements
4. **Risks** - Risk identification with mitigation strategies
5. **Deliverables** - Specific file specifications and requirements

### Verbatim Code Blocks

All code must be verbatim (exact implementation) unless explicitly marked as pseudocode:

```javascript
// Verbatim implementation - no agent interpretation allowed
function validateContract(prd) {
    // Exact code as specified
    return prd.meetsCriteria;
}
```

## Validation System

### Parser Validation

The validation engine checks:

- Frontmatter completeness and format
- Required sections presence
- Content length limits (Background ≤ 200 words)
- Acceptance criteria minimums
- Verbatim code block requirements
- Risk mitigation completeness

### Build Gate Validation

Ensures minimum project artifacts:

- **≥ 3 source files** (js, ts, py, java, etc.)
- **≥ 1 test file** (matching *test*, *spec*, test_* patterns)
- Proper project structure
- No bloated files (>1MB)
- No empty files

### Performance Requirements

- Template validation: <50ms
- Schema parsing: <20ms
- Complete validation: <100ms
- Memory usage: <10MB

## Examples

The `examples/` directory contains:

- `examples/with-codex/` - PRD following Codex template
- `examples/without-codex/` - Traditional unstructured PRD
- `examples/before-after.md` - Side-by-side comparison

### Example Validation

```bash
# Validate template-compliant example
node parser/validate.js examples/with-codex/example.md

# Should show improvement over non-compliant example
diff examples/without-codex/old-prd.md examples/with-codex/example.md
```

## Integration

### CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Validate Codex Template
  run: |
    ./tests/validate-template.sh
    ./tests/validate-parser.sh
    ./tests/validate-gate.sh

- name: Run Build Gate
  run: ./gate/hollow-build.sh
```

### Pre-commit Hooks

```bash
# Add to .git/hooks/pre-commit
#!/bin/bash
./tests/validate-structure.sh
```

### AgentPress Integration

Codex Template integrates with AgentPress WordPress plugin build pipeline:

- Template validation runs pre-commit
- Build gate prevents insufficient artifact deployment
- Examples serve as training data for agent improvement

## Development

### Project Structure

```
codex-template/
├── codex.md                    # Master template
├── parser/                     # Validation engine
│   ├── validate.js            # Main validator
│   ├── schema.json            # JSON schema
│   └── errors.js              # Error messages
├── gate/                       # Build system
│   ├── hollow-build.sh        # Artifact validation
│   └── hollow-build-ci.yml    # CI configuration
├── examples/                   # Example PRDs
│   ├── with-codex/            # Template compliant
│   └── without-codex/         # Traditional format
├── tests/                      # Test suite
│   ├── validate-template.sh   # Template tests
│   ├── validate-parser.sh     # Parser tests
│   ├── validate-gate.sh       # Build gate tests
│   └── validate-structure.sh  # Integration tests
└── README.md                  # This file
```

### Running Tests

```bash
# Complete test suite
npm test

# Individual tests
npm run test-template
npm run test-parser
npm run test-gate

# Validation commands
npm run validate codex.md
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

### Code Quality Standards

- Prohibit unfinished markers, deferred items, and provisional text
- All code must be complete and functional
- Follow master craftsman voice in documentation
- Maintain sub-100ms validation performance
- Keep total project size under 500KB

## Troubleshooting

### Common Issues

**Template validation fails:**
- Check all required frontmatter fields exist
- Verify section headers use exact `## Section Name` format
- Ensure Background section ≤ 200 words

**Build gate fails:**
- Add more source files (minimum 3)
- Add test files matching patterns (*test*, *spec*, test_*)
- Check file permissions on shell scripts

**Performance issues:**
- Validation should complete <100ms
- Check for large files causing slowdown
- Monitor memory usage (<10MB target)

### Error Messages

The validation engine uses literal error messages for clarity:

```
CRITICAL: Frontmatter missing required field: slug. Fix it now.
ERROR: Section "Acceptance Criteria" missing. Add it immediately.
WARNING: Found weak language. Use master craftsman voice.
```

## License

MIT License - see LICENSE file for details.

## Support

- Issues: [GitHub Issues](https://github.com/agentpress/codex-template/issues)
- Documentation: [Wiki](https://github.com/agentpress/codex-template/wiki)
- Discussions: [GitHub Discussions](https://github.com/agentpress/codex-template/discussions)

---

**Codex Template** - Building better PRDs through deterministic validation and verbatim contracts.