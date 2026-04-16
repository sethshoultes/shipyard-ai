# Build Validator Test Specification

## Overview

This document specifies comprehensive test cases for the build-time plugin validator. The validator must fail loudly and provide actionable error messages when plugin configurations are invalid, preventing silent failures in production.

**Requirement:** REQ-017: Test Build-Time Validation (Decisions line 220)
**Reference:** Error message specification in decisions.md (lines 98-109)

---

## Validator Requirements Summary

The build-time validator must:
- Detect invalid plugin configurations at build time (not runtime)
- Provide loud, non-negotiable failures (not warnings)
- Return actionable error messages with all required fields
- Use correct error codes (PLUGIN_ENTRYPOINT_NOT_RESOLVED, not INTERNAL_ERROR)
- Block deployment when plugins cannot be resolved
- Fail the entire build process, not just log warnings

---

## Test Case 1: Validator Throws Error for Missing Entrypoint File

**Description:** Validator detects when the entrypoint file specified in plugin descriptor does not exist.

**Setup:**
- Plugin descriptor references entrypoint: `"./plugins/missing-plugin/dist/sandbox-entry.js"`
- File does not exist in the filesystem

**Expected Behavior:**
- Validator throws an error (not warning) during build
- Build process exits with non-zero status code
- Error is catchable and halts build pipeline

**Verification Criteria:**
- Error is thrown (not just logged)
- Error type is Error or subclass
- Build fails before reaching deployment stage
- Error prevents file bundling and manifest generation

**Example:**
```typescript
describe('Test Case 1: Missing Entrypoint File', () => {
  it('should throw error when entrypoint file does not exist', async () => {
    const descriptor = {
      type: "standard",
      entrypoint: "./plugins/missing-plugin/dist/sandbox-entry.js",
      workerLoader: "esm"
    };

    expect(() => validatePluginExists(descriptor)).toThrow();
  });

  it('should fail build, not just warn', async () => {
    const buildResult = await runBuild(configWithMissingPlugin);
    expect(buildResult.exitCode).not.toBe(0);
    expect(buildResult.manifest).toBeUndefined();
  });
});
```

---

## Test Case 2: Error Message Includes All Required Fields

**Description:** When validation fails, the error object must contain all four required fields for actionable developer guidance.

**Required Fields:**
- `error`: Error code identifying the problem type
- `message`: Human-readable description of the problem
- `tried`: The path/alias that was attempted
- `suggestion`: Actionable fix or correct path

**Setup:**
- Plugin descriptor with invalid entrypoint
- Error thrown by validator

**Expected Behavior:**
- Error includes all four fields
- No field is null, undefined, or empty
- Message is complete sentence(s) explaining the problem
- Suggestion provides concrete next action

**Verification Criteria:**
- error: string, non-empty
- message: string, non-empty, complete sentence
- tried: string, non-empty, matches what was attempted
- suggestion: string, non-empty, actionable

**Example:**
```typescript
describe('Test Case 2: Error Message Field Completeness', () => {
  it('should include error, message, tried, suggestion fields', async () => {
    const descriptor = {
      entrypoint: "@shipyard/membership/sandbox",
      type: "standard",
      workerLoader: "esm"
    };

    try {
      validatePluginExists(descriptor);
      fail('Expected validation to throw');
    } catch (err) {
      expect(err).toHaveProperty('error');
      expect(err).toHaveProperty('message');
      expect(err).toHaveProperty('tried');
      expect(err).toHaveProperty('suggestion');

      expect(err.error).toBeTruthy();
      expect(err.message).toBeTruthy();
      expect(err.tried).toBeTruthy();
      expect(err.suggestion).toBeTruthy();
    }
  });

  it('should provide complete message text', async () => {
    const err = captureValidationError(invalidDescriptor);
    expect(err.message.length).toBeGreaterThan(20);
    expect(err.message).not.toMatch(/undefined|null|\[object/);
  });
});
```

---

## Test Case 3: Validator Passes for Valid Plugin with Existing Entrypoint

**Description:** Validator succeeds when plugin descriptor references an existing entrypoint file.

**Setup:**
- Plugin descriptor with entrypoint: `"./plugins/membership/dist/sandbox-entry.js"`
- File exists and is accessible
- All required fields present and valid

**Expected Behavior:**
- Validator returns success (no throw)
- No error is raised
- Build continues normally
- File is bundled and manifest is generated

**Verification Criteria:**
- No error thrown
- Function returns successfully
- Return value indicates success
- Subsequent build steps proceed normally

**Example:**
```typescript
describe('Test Case 3: Valid Plugin Passes Validation', () => {
  beforeEach(() => {
    // Create valid plugin file structure
    fs.writeFileSync(
      './plugins/membership/dist/sandbox-entry.js',
      'export default { /* valid code */ }'
    );
  });

  it('should pass validation for existing entrypoint', () => {
    const descriptor = {
      type: "standard",
      entrypoint: "./plugins/membership/dist/sandbox-entry.js",
      workerLoader: "esm"
    };

    expect(() => validatePluginExists(descriptor)).not.toThrow();
  });

  it('should continue build process for valid plugins', async () => {
    const buildResult = await runBuild(validConfig);
    expect(buildResult.exitCode).toBe(0);
    expect(buildResult.manifest).toBeDefined();
    expect(buildResult.manifest.plugins).toContain('membership');
  });
});
```

---

## Test Case 4: Validator Catches Missing Required Fields in PluginDescriptor

**Description:** Validator detects when PluginDescriptor is missing required configuration fields.

**Required Fields:**
- `type`: Plugin type (e.g., "standard")
- `entrypoint`: Path to or alias for entry file
- `workerLoader`: Worker loader configuration (e.g., "esm")

**Setup:**
- Plugin descriptor with one or more required fields missing
- Missing field variations:
  - Missing `type`
  - Missing `entrypoint`
  - Missing `workerLoader`
  - Multiple fields missing

**Expected Behavior:**
- Validator throws error for each missing field
- Error message identifies which field(s) are missing
- Build fails
- Developer knows exactly what to add

**Verification Criteria:**
- Error thrown for each missing field
- Error message mentions the field name
- Error code is appropriate (PLUGIN_DESCRIPTOR_INVALID or similar)
- Suggestion indicates how to fix

**Example:**
```typescript
describe('Test Case 4: Missing Required Fields', () => {
  it('should fail when type field is missing', () => {
    const descriptor = {
      entrypoint: "./plugins/membership/dist/sandbox-entry.js",
      workerLoader: "esm"
    };

    expect(() => validatePluginExists(descriptor)).toThrow();
  });

  it('should fail when entrypoint field is missing', () => {
    const descriptor = {
      type: "standard",
      workerLoader: "esm"
    };

    expect(() => validatePluginExists(descriptor)).toThrow();
  });

  it('should fail when workerLoader field is missing', () => {
    const descriptor = {
      type: "standard",
      entrypoint: "./plugins/membership/dist/sandbox-entry.js"
    };

    expect(() => validatePluginExists(descriptor)).toThrow();
  });

  it('should identify missing field in error message', () => {
    const descriptor = { /* missing entrypoint */ };
    const err = captureValidationError(descriptor);
    expect(err.message).toMatch(/entrypoint|required/i);
  });
});
```

---

## Test Case 5: Error Code is PLUGIN_ENTRYPOINT_NOT_RESOLVED (not INTERNAL_ERROR)

**Description:** When entrypoint resolution fails, the error code must be specific and actionable, not a generic INTERNAL_ERROR.

**Valid Error Codes:**
- `PLUGIN_ENTRYPOINT_NOT_RESOLVED`: Entrypoint cannot be found
- `PLUGIN_DESCRIPTOR_INVALID`: Descriptor structure is invalid
- `PLUGIN_LOAD_FAILED`: Plugin failed to load/parse

**Invalid Error Codes:**
- `INTERNAL_ERROR`: Too generic, not actionable
- `ERROR`: Too vague
- `UNKNOWN`: Doesn't indicate the problem

**Setup:**
- Plugin with unresolvable entrypoint
- Plugin with invalid descriptor
- Plugin that fails to parse

**Expected Behavior:**
- Error.error contains specific code (PLUGIN_ENTRYPOINT_NOT_RESOLVED, etc.)
- Never returns INTERNAL_ERROR for validation failures
- Error code matches the problem type

**Verification Criteria:**
- error.error === "PLUGIN_ENTRYPOINT_NOT_RESOLVED" for missing files
- error.error === "PLUGIN_DESCRIPTOR_INVALID" for missing fields
- error.error !== "INTERNAL_ERROR"
- Error code is in enum of valid codes

**Example:**
```typescript
describe('Test Case 5: Specific Error Codes', () => {
  it('should use PLUGIN_ENTRYPOINT_NOT_RESOLVED for missing files', () => {
    const descriptor = {
      type: "standard",
      entrypoint: "./nonexistent/file.js",
      workerLoader: "esm"
    };

    const err = captureValidationError(descriptor);
    expect(err.error).toBe('PLUGIN_ENTRYPOINT_NOT_RESOLVED');
    expect(err.error).not.toBe('INTERNAL_ERROR');
  });

  it('should use PLUGIN_DESCRIPTOR_INVALID for missing fields', () => {
    const descriptor = { /* missing required fields */ };
    const err = captureValidationError(descriptor);
    expect(err.error).toBe('PLUGIN_DESCRIPTOR_INVALID');
    expect(err.error).not.toBe('INTERNAL_ERROR');
  });

  it('should never use generic INTERNAL_ERROR', () => {
    const testCases = [
      descriptorWithMissingFile,
      descriptorWithMissingFields,
      descriptorWithInvalidFormat
    ];

    testCases.forEach(descriptor => {
      const err = captureValidationError(descriptor);
      expect(err.error).not.toBe('INTERNAL_ERROR');
    });
  });
});
```

---

## Test Case 6: Suggestion Field Provides Actionable Fix Path

**Description:** The `suggestion` field must contain a concrete, actionable next step that a developer can immediately use to fix the problem.

**Characteristics of Actionable Suggestions:**
- References real file paths or conventions
- Can be copy-pasted into configuration
- Doesn't require external documentation lookup
- Addresses root cause, not symptom

**Good Examples:**
- `"Use './plugins/membership/dist/sandbox-entry.js' instead"`
- `"Add missing field: 'entrypoint': './plugins/membership/dist/sandbox-entry.js'"`
- `"Convention: plugins/[plugin-name]/sandbox.ts"`

**Bad Examples:**
- `"Check documentation"` (requires external lookup)
- `"Fix entrypoint"` (vague, not actionable)
- `"See README.md"` (process theater)

**Setup:**
- Various validation failure scenarios
- Capture error from each

**Expected Behavior:**
- Suggestion field contains specific file path or code change
- Developer can act on suggestion without other resources
- Suggestion directly addresses the error

**Verification Criteria:**
- suggestion.length > 30 (must be detailed)
- suggestion does not contain URLs or file path placeholders
- suggestion is actionable immediately
- suggestion refers to concrete file paths or config changes

**Example:**
```typescript
describe('Test Case 6: Actionable Suggestions', () => {
  it('should suggest real file path for missing entrypoint', () => {
    const descriptor = {
      type: "standard",
      entrypoint: "@shipyard/membership/sandbox",
      workerLoader: "esm"
    };

    const err = captureValidationError(descriptor);
    expect(err.suggestion).toMatch(/\.\/plugins\//);
    expect(err.suggestion).toMatch(/\.js$/);
    // Should be copy-paste ready
    expect(err.suggestion).not.toMatch(/\[.*\]/); // No placeholders
  });

  it('should suggest specific field addition for missing fields', () => {
    const descriptor = {
      type: "standard",
      workerLoader: "esm"
      // missing entrypoint
    };

    const err = captureValidationError(descriptor);
    expect(err.suggestion).toMatch(/entrypoint/);
    expect(err.suggestion).toMatch(/\./); // Should have file path
  });

  it('should not reference external docs', () => {
    const allErrors = [
      captureValidationError(missingFileDescriptor),
      captureValidationError(missingFieldDescriptor),
      captureValidationError(invalidFormatDescriptor)
    ];

    allErrors.forEach(err => {
      expect(err.suggestion).not.toMatch(/readme|docs|documentation/i);
      expect(err.suggestion).not.toMatch(/http/);
    });
  });

  it('should be immediately actionable', () => {
    const descriptor = { /* invalid */ };
    const err = captureValidationError(descriptor);
    // Suggestion should be copy-paste into config
    expect(canApplyAsConfigChange(err.suggestion)).toBe(true);
  });
});
```

---

## Test Case 7: Integration Test - Validator Fails Build Process (Not Just Logs Warning)

**Description:** The validator must actually fail the build process, causing the entire build pipeline to halt. Warnings or logging alone are insufficient.

**Failure Requirements:**
- Build process exits with non-zero status code
- No artifact generation (no manifest, bundle, etc.)
- No deployment proceeds
- Error is not caught/swallowed silently

**Setup:**
- Full build pipeline with invalid plugin
- Monitor build exit code
- Check for artifact generation

**Expected Behavior:**
- Build exits with error status
- Build output shows error clearly
- No manifest file created
- Plugin not included in deployment package
- Subsequent build steps don't execute

**Verification Criteria:**
- Build process exits with code !== 0
- Manifest file not generated or is incomplete
- Deploy step is skipped or fails
- Error appears in build stdout/stderr
- No silent failure or warning-only behavior

**Example:**
```typescript
describe('Test Case 7: Build Process Failure Integration', () => {
  it('should fail entire build with non-zero exit code', async () => {
    const buildResult = await runBuild(configWithInvalidPlugin);
    expect(buildResult.exitCode).not.toBe(0);
  });

  it('should not generate manifest for invalid plugins', async () => {
    const buildResult = await runBuild(configWithInvalidPlugin);
    expect(fs.existsSync(buildResult.manifestPath)).toBe(false);
  });

  it('should prevent deployment when plugins invalid', async () => {
    const buildResult = await runBuild(configWithInvalidPlugin);
    expect(buildResult.deploymentBlocked).toBe(true);
    expect(buildResult.deploymentReason).toMatch(/validator|plugin/i);
  });

  it('should output error to build logs', async () => {
    const buildResult = await runBuild(configWithInvalidPlugin);
    expect(buildResult.stderr).toMatch(/PLUGIN_ENTRYPOINT_NOT_RESOLVED|error/i);
  });

  it('should not proceed with bundling after validation failure', async () => {
    const buildResult = await runBuild(configWithInvalidPlugin);
    expect(buildResult.bundleGenerated).toBe(false);
  });

  it('should be non-recoverable (not a warning)', async () => {
    const buildResult = await runBuild(configWithInvalidPlugin);
    const warningOnly = buildResult.exitCode === 0 && buildResult.stderr.length > 0;
    expect(warningOnly).toBe(false); // Must fail, not warn
  });
});
```

---

## Test Case 8: Validator Catches All Invalid Configuration Scenarios

**Description:** Comprehensive validation covering edge cases and all invalid configuration patterns.

**Scenarios Tested:**
1. Missing entrypoint file (absolute or relative path)
2. Npm alias that cannot be resolved (`@shipyard/membership/sandbox`)
3. Missing required descriptor fields
4. Empty entrypoint string
5. Null/undefined entrypoint
6. Invalid file extensions
7. Directory path instead of file path
8. Circular/recursive entrypoint references
9. Symlink to non-existent file
10. File with parse errors (malformed JavaScript)

**Setup:**
- Create descriptors for each scenario
- Attempt validation for each

**Expected Behavior:**
- All scenarios are caught
- Appropriate error codes for each
- Actionable suggestions for each

**Verification Criteria:**
- Every scenario throws error
- No silent failures
- Error codes are appropriate for each scenario
- Suggestions are specific to the problem

**Example:**
```typescript
describe('Test Case 8: Comprehensive Invalid Scenarios', () => {
  const scenarios = [
    {
      name: 'missing entrypoint file',
      descriptor: { type: "standard", entrypoint: "./missing.js", workerLoader: "esm" },
      expectedCode: 'PLUGIN_ENTRYPOINT_NOT_RESOLVED'
    },
    {
      name: 'npm alias without resolution',
      descriptor: { type: "standard", entrypoint: "@shipyard/membership/sandbox", workerLoader: "esm" },
      expectedCode: 'PLUGIN_ENTRYPOINT_NOT_RESOLVED'
    },
    {
      name: 'missing type field',
      descriptor: { entrypoint: "./file.js", workerLoader: "esm" },
      expectedCode: 'PLUGIN_DESCRIPTOR_INVALID'
    },
    {
      name: 'empty entrypoint string',
      descriptor: { type: "standard", entrypoint: "", workerLoader: "esm" },
      expectedCode: 'PLUGIN_DESCRIPTOR_INVALID'
    },
    {
      name: 'null entrypoint',
      descriptor: { type: "standard", entrypoint: null, workerLoader: "esm" },
      expectedCode: 'PLUGIN_DESCRIPTOR_INVALID'
    },
    {
      name: 'directory instead of file',
      descriptor: { type: "standard", entrypoint: "./plugins/membership/", workerLoader: "esm" },
      expectedCode: 'PLUGIN_ENTRYPOINT_NOT_RESOLVED'
    }
  ];

  scenarios.forEach(scenario => {
    it(`should catch: ${scenario.name}`, () => {
      const err = captureValidationError(scenario.descriptor);
      expect(err).toBeDefined();
      expect(err.error).toBe(scenario.expectedCode);
      expect(err.message).toBeTruthy();
      expect(err.suggestion).toBeTruthy();
    });
  });
});
```

---

## Test Execution Framework

**Framework:** Jest (or equivalent testing framework)

**Test Command:**
```bash
npm run test:validator
# or
jest build-validator.test.ts
```

**Coverage Requirements:**
- All 8 test cases must pass
- 100% code coverage of validator logic
- All error paths tested
- All success paths tested

**Running the Tests:**

```bash
# Run all validator tests
npm run test:validator

# Run with coverage report
npm run test:validator -- --coverage

# Run specific test case
npm run test:validator -- --testNamePattern="Test Case 5"

# Watch mode for development
npm run test:validator -- --watch
```

---

## Success Criteria

All of the following must be true for the test specification to be considered complete:

1. **Test Case 1:** Error is thrown (not warned) for missing entrypoint files
2. **Test Case 2:** All four error fields present (error, message, tried, suggestion)
3. **Test Case 3:** Valid plugins pass validation without throwing
4. **Test Case 4:** Missing required fields are caught
5. **Test Case 5:** Error codes are specific (PLUGIN_ENTRYPOINT_NOT_RESOLVED, not INTERNAL_ERROR)
6. **Test Case 6:** Suggestions are actionable without external documentation
7. **Test Case 7:** Build process exits with failure code and prevents deployment
8. **Test Case 8:** All invalid configuration scenarios are caught

---

## Edge Cases and Notes

### Local vs Production Parity
- Validator must fail identically in local dev and production
- No divergence in error behavior between environments
- Same file paths, same error codes, same suggestions

### Performance Considerations
- Validation must not significantly slow build process
- File existence checks should be cached where appropriate
- Error generation should be synchronous (no async surprises)

### Future Extensibility
- Test structure should support additional plugins
- Error codes should be extensible for future plugin types
- Validator should support multi-plugin configurations

---

## Related Files and References

**Implementation File:** `/home/agent/shipyard-ai/shipyard-core/build-validator.ts`
**Plugin Resolver:** `/home/agent/shipyard-ai/shipyard-core/plugin-resolver.ts`
**Configuration:** `/home/agent/shipyard-ai/emdash.config.ts`
**Decisions Reference:** `/home/agent/shipyard-ai/rounds/membership-production-fix/decisions.md` (lines 98-109, 220)

---

## Test Specification Version

- **Version:** 1.0
- **Date:** 2026-04-16
- **Status:** Complete
- **Requirement:** REQ-017 (Build-Time Validation)
