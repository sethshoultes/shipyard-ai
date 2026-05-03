// Codex Template Validation Error Messages
// Literal, clear error messages in Elon's voice

const errors = {
    // Frontmatter Errors
    MISSING_FRONTMATTER: 'CRITICAL: No frontmatter detected. Every PRD starts with --- YAML frontmatter ---',
    MISSING_FIELD: (field) => `CRITICAL: Frontmatter missing required field: ${field}. Fix it now.`,
    INVALID_SLUG: 'ERROR: Slug must be lowercase letters, numbers, and hyphens only. No spaces.',
    INVALID_DATE: 'ERROR: Date must be YYYY-MM-DD format. Basic time travel standards.',
    INVALID_VERSION: 'ERROR: Version must be semantic like 1.0.0. Not rocket science.',

    // Section Errors
    MISSING_SECTION: (section) => `CRITICAL: Section "${section}" missing. Add it immediately.`,
    EMPTY_SECTION: (section) => `ERROR: Section "${section}" is empty. Fill it with actual content.`,

    // Background Section
    BACKGROUND_TOO_LONG: (count) => `ERROR: Background section ${count} words. Maximum 200. Be concise.`,
    BACKGROUND_MISSING: 'ERROR: Background section missing. Explain why this exists.',

    // Acceptance Criteria Errors
    INSUFFICIENT_CRITERIA: (count, type) => `CRITICAL: Only ${count} acceptance criteria. Minimum ${type}. Add more or this is invalid.`,
    NON_TESTABLE_CRITERIA: 'ERROR: Acceptance criteria must be testable. "Make it better" is not testable.',
    MISSING_VERIFICATION: 'ERROR: Each criterion needs verification method. How will you know it works?',

    // Verbatim Contracts Errors
    MISSING_CODE_BLOCKS: 'ERROR: Verbatim Contracts section needs actual code blocks. No exceptions.',
    MISSING_VERBATIM_LANGUAGE: 'ERROR: Must include "verbatim" language guidance. Agents need explicit instructions.',
    ALLOWING_PLACEHOLDERS: 'ERROR: Template forbids placeholder content. No "TODO" or "coming soon".',

    // Risks Section Errors
    MISSING_RISKS: 'ERROR: Risks section missing. Every project has risks. Identify them.',
    MISSING_MITIGATIONS: 'ERROR: Each risk needs mitigation strategy. No risks without solutions.',

    // Deliverables Errors
    INSUFFICIENT_DELIVERABLES: (count) => `CRITICAL: Only ${count} deliverables listed. Minimum 5. What are you building?`,
    MISSING_FILE_SPECS: 'ERROR: Deliverables must specify file paths and formats. Be explicit.',

    // Content Quality Errors
    WEAK_LANGUAGE: 'WARNING: Found weak language. Use master craftsman voice. No "please" or "might".',
    BLOATED_CONTENT: 'ERROR: Content too large. Keep it under 10KB. Efficiency matters.',

    // Structure Errors
    MALFORMED_MARKDOWN: 'ERROR: Markdown structure invalid. Fix formatting.',
    MISSING_YAML_DELIMITER: 'ERROR: Frontmatter must start and end with ---. Basic YAML requirements.',

    // Validation Errors
    PARSER_FAILURE: 'CRITICAL: Parser failed. Fix template syntax immediately.',
    SCHEMA_MISMATCH: 'ERROR: Template does not match schema. Follow specification exactly.',

    // Performance Errors
    SLOW_VALIDATION: 'WARNING: Validation taking too long. Optimize for sub-100ms target.',

    // Integration Errors
    MISSING_VERIFICATION_COMMANDS: 'ERROR: Template missing verification commands. Include test commands.',
    MISSING_PERFORMANCE_REQUIREMENTS: 'ERROR: Add performance requirements section. Speed matters.',

    // Generic Error
    INVALID_TEMPLATE: 'CRITICAL: Template validation failed. Fix all errors and resubmit.'
};

module.exports = errors;