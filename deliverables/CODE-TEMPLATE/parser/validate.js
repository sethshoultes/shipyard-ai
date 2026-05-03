#!/usr/bin/env node

// Codex Template Validation Engine
// Deterministic parser for PRD template validation

const fs = require('fs');
const errors = require('./errors.js');
const schema = require('./schema.json');

/**
 * Validate a Codex PRD template against schema and rules
 * @param {string} content - The markdown content to validate
 * @returns {true|string} - Returns true if valid, error message if invalid
 */
function validate(content) {
    const startTime = Date.now();

    try {
        // Check if content is provided
        if (!content || typeof content !== 'string') {
            return errors.INVALID_TEMPLATE;
        }

        // Extract frontmatter
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (!frontmatterMatch) {
            return errors.MISSING_FRONTMATTER;
        }

        const frontmatterText = frontmatterMatch[1];
        const mainContent = content.slice(frontmatterMatch[0].length);

        // Validate frontmatter
        const frontmatterResult = validateFrontmatter(frontmatterText);
        if (frontmatterResult !== true) {
            return frontmatterResult;
        }

        // Validate sections
        const sectionsResult = validateSections(mainContent);
        if (sectionsResult !== true) {
            return sectionsResult;
        }

        // Check performance requirement
        const validationTime = Date.now() - startTime;
        if (validationTime > 100) {
            console.warn(errors.SLOW_VALIDATION);
        }

        return true;
    } catch (error) {
        return errors.PARSER_FAILURE;
    }
}

/**
 * Validate frontmatter section
 * @param {string} frontmatterText - YAML frontmatter content
 * @returns {true|string} - Validation result
 */
function validateFrontmatter(frontmatterText) {
    const lines = frontmatterText.split('\n');
    const frontmatter = {};

    // Parse YAML manually for deterministic behavior
    for (const line of lines) {
        if (line.trim() && line.includes(':')) {
            const [key, ...valueParts] = line.split(':');
            const value = valueParts.join(':').trim();
            frontmatter[key.trim()] = value.replace(/^["']|["']$/g, '');
        }
    }

    // Check required fields
    const requiredFields = ['slug', 'title', 'author', 'date', 'version', 'parent', 'dependencies'];
    for (const field of requiredFields) {
        if (!frontmatter[field]) {
            return errors.MISSING_FIELD(field);
        }
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(frontmatter.slug)) {
        return errors.INVALID_SLUG;
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(frontmatter.date)) {
        return errors.INVALID_DATE;
    }

    // Validate version format
    if (!/^\d+\.\d+\.\d+$/.test(frontmatter.version)) {
        return errors.INVALID_VERSION;
    }

    return true;
}

/**
 * Validate main content sections
 * @param {string} content - Main markdown content
 * @returns {true|string} - Validation result
 */
function validateSections(content) {
    const requiredSections = ['Background', 'Acceptance Criteria', 'Verbatim Contracts', 'Risks', 'Deliverables'];

    // Check if all required sections exist
    for (const section of requiredSections) {
        const sectionPattern = new RegExp(`^##\\s*${section}\\s*$`, 'm');
        if (!sectionPattern.test(content)) {
            return errors.MISSING_SECTION(section);
        }
    }

    // Validate Background section
    const backgroundResult = validateBackground(content);
    if (backgroundResult !== true) {
        return backgroundResult;
    }

    // Validate Acceptance Criteria section
    const criteriaResult = validateAcceptanceCriteria(content);
    if (criteriaResult !== true) {
        return criteriaResult;
    }

    // Validate Verbatim Contracts section
    const contractsResult = validateVerbatimContracts(content);
    if (contractsResult !== true) {
        return contractsResult;
    }

    // Validate Risks section
    const risksResult = validateRisks(content);
    if (risksResult !== true) {
        return risksResult;
    }

    // Validate Deliverables section
    const deliverablesResult = validateDeliverables(content);
    if (deliverablesResult !== true) {
        return deliverablesResult;
    }

    return true;
}

/**
 * Validate Background section
 * @param {string} content - Full content
 * @returns {true|string} - Validation result
 */
function validateBackground(content) {
    const backgroundMatch = content.match(/## Background\s*\n([\s\S]*?)(?=\n##|$)/);
    if (!backgroundMatch) {
        return errors.BACKGROUND_MISSING;
    }

    const backgroundText = backgroundMatch[1].trim();
    if (!backgroundText) {
        return errors.EMPTY_SECTION('Background');
    }

    // Count words (simple split, should be sufficient)
    const wordCount = backgroundText.split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount > 200) {
        return errors.BACKGROUND_TOO_LONG(wordCount);
    }

    return true;
}

/**
 * Validate Acceptance Criteria section
 * @param {string} content - Full content
 * @returns {true|string} - Validation result
 */
function validateAcceptanceCriteria(content) {
    const criteriaMatch = content.match(/## Acceptance Criteria\s*\n([\s\S]*?)(?=\n##|$)/);
    if (!criteriaMatch) {
        return errors.MISSING_SECTION('Acceptance Criteria');
    }

    const criteriaText = criteriaMatch[1].trim();
    if (!criteriaText) {
        return errors.EMPTY_SECTION('Acceptance Criteria');
    }

    // Count acceptance criteria (lines starting with -)
    const criteriaLines = criteriaText.split('\n').filter(line => line.trim().startsWith('-'));
    const criteriaCount = criteriaLines.length;

    // Determine minimum based on content (feature vs fix)
    const isFeature = content.toLowerCase().includes('feature');
    const minimumRequired = isFeature ? 5 : 3;

    if (criteriaCount < minimumRequired) {
        return errors.INSUFFICIENT_CRITERIA(criteriaCount, minimumRequired);
    }

    // Check for testable language patterns
    const hasTestableLanguage = criteriaText.match(/verify|test|validate|check|ensure|confirm/i);
    if (!hasTestableLanguage) {
        return errors.NON_TESTABLE_CRITERIA;
    }

    return true;
}

/**
 * Validate Verbatim Contracts section
 * @param {string} content - Full content
 * @returns {true|string} - Validation result
 */
function validateVerbatimContracts(content) {
    const contractsMatch = content.match(/## Verbatim Contracts\s*\n([\s\S]*?)(?=\n##|$)/);
    if (!contractsMatch) {
        return errors.MISSING_SECTION('Verbatim Contracts');
    }

    const contractsText = contractsMatch[1].trim();
    if (!contractsText) {
        return errors.EMPTY_SECTION('Verbatim Contracts');
    }

    // Check for code blocks
    if (!contractsText.includes('```')) {
        return errors.MISSING_CODE_BLOCKS;
    }

    // Check for verbatim language guidance
    if (!contractsText.toLowerCase().includes('verbatim')) {
        return errors.MISSING_VERBATIM_LANGUAGE;
    }

    // Check for enforcement rules
    if (!contractsText.toLowerCase().includes('enforcement') && !contractsText.toLowerCase().includes('forbidden')) {
        return errors.ALLOWING_PLACEHOLDERS;
    }

    return true;
}

/**
 * Validate Risks section
 * @param {string} content - Full content
 * @returns {true|string} - Validation result
 */
function validateRisks(content) {
    const risksMatch = content.match(/## Risks\s*\n([\s\S]*?)(?=\n##|$)/);
    if (!risksMatch) {
        return errors.MISSING_SECTION('Risks');
    }

    const risksText = risksMatch[1].trim();
    if (!risksText) {
        return errors.EMPTY_SECTION('Risks');
    }

    // Check for risk identifications (look for "Risk:" pattern)
    if (!risksText.toLowerCase().includes('risk')) {
        return errors.MISSING_RISKS;
    }

    // Check for mitigation strategies
    if (!risksText.toLowerCase().includes('mitigation') && !risksText.toLowerCase().includes('solution')) {
        return errors.MISSING_MITIGATIONS;
    }

    return true;
}

/**
 * Validate Deliverables section
 * @param {string} content - Full content
 * @returns {true|string} - Validation result
 */
function validateDeliverables(content) {
    const deliverablesMatch = content.match(/## Deliverables\s*\n([\s\S]*?)(?=\n##|$)/);
    if (!deliverablesMatch) {
        return errors.MISSING_SECTION('Deliverables');
    }

    const deliverablesText = deliverablesMatch[1].trim();
    if (!deliverablesText) {
        return errors.EMPTY_SECTION('Deliverables');
    }

    // Count deliverables (numbered list items)
    const deliverableCount = (deliverablesText.match(/^\d+\./gm) || []).length;
    if (deliverableCount < 5) {
        return errors.INSUFFICIENT_DELIVERABLES(deliverableCount);
    }

    // Check for file specifications
    if (!deliverablesText.includes('.') && !deliverablesText.includes('file')) {
        return errors.MISSING_FILE_SPECS;
    }

    return true;
}

// CLI interface for direct execution
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('Usage: node validate.js <file-path>');
        process.exit(1);
    }

    const filePath = args[0];
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const result = validate(fileContent);

        if (result === true) {
            console.log('✓ Template validation passed');
            process.exit(0);
        } else {
            console.error('✗ Template validation failed:');
            console.error(result);
            process.exit(1);
        }
    } catch (error) {
        console.error('Error reading file:', error.message);
        process.exit(1);
    }
}

module.exports = { validate };