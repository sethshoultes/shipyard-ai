/**
 * Build-Time Plugin Validator Specification
 *
 * Validates plugin entrypoints at build time and fails loudly with actionable
 * error messages if a plugin cannot be loaded. This prevents silent failures
 * in production where plugins drop from the manifest without warning.
 *
 * Decision: REQ-014 (decisions.md line 209)
 * Error format spec: decisions.md lines 98-109
 *
 * Error Message Format:
 * - error: Machine-readable error code (e.g., PLUGIN_ENTRYPOINT_NOT_RESOLVED)
 * - message: Human-readable explanation of what went wrong
 * - tried: The path or value that failed
 * - suggestion: Actionable recommendation for fixing the problem
 *
 * Goal: If the build passes, the plugin WILL work in production.
 */

import type { PluginDescriptor } from "emdash";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Actionable error message format per decisions.md lines 98-109.
 * Contains all information needed to fix the problem without additional debugging.
 */
export interface ValidationError {
  error: string; // Machine-readable error code
  message: string; // Human-readable explanation
  tried: string; // The path or value that was attempted
  suggestion: string; // Specific fix recommendation
}

/**
 * Validation result: success or failure with actionable error details.
 */
export interface ValidationResult {
  success: boolean;
  error?: ValidationError;
}

/**
 * Required fields in a PluginDescriptor per EMDASH-GUIDE.md section 6.
 * All plugins must declare these fields for the system to load correctly.
 */
const REQUIRED_DESCRIPTOR_FIELDS = [
  "id",
  "version",
  "format",
  "entrypoint",
  "capabilities",
] as const;

/**
 * Validate that a plugin entrypoint path resolves to an actual file.
 *
 * This is the core validation function. It:
 * 1. Checks if the entrypoint path is resolvable
 * 2. Verifies the file exists on disk
 * 3. Throws a ValidationError with actionable suggestion if missing
 *
 * @param descriptor - The plugin descriptor to validate
 * @returns ValidationResult with success flag or detailed error
 *
 * @throws Error if validation fails (intentional for build-time loudness)
 */
export function validatePluginEntrypointExists(
  descriptor: PluginDescriptor
): ValidationResult {
  const entrypoint = descriptor.entrypoint;

  // Verify entrypoint field exists and is a string
  if (!entrypoint || typeof entrypoint !== "string") {
    return {
      success: false,
      error: {
        error: "PLUGIN_ENTRYPOINT_MISSING",
        message: "Plugin descriptor is missing the 'entrypoint' field",
        tried: descriptor.id || "(unnamed plugin)",
        suggestion:
          'Add an "entrypoint" field with a path to your plugin\'s entry file, e.g., "./plugins/membership/sandbox-entry.ts"',
      },
    };
  }

  // Check if the file exists
  try {
    const resolvedPath = path.resolve(entrypoint);
    const stats = fs.statSync(resolvedPath);

    if (!stats.isFile()) {
      return {
        success: false,
        error: {
          error: "PLUGIN_ENTRYPOINT_NOT_FILE",
          message: `Plugin entrypoint exists but is not a file (is a directory?)`,
          tried: entrypoint,
          suggestion: `Update entrypoint to point to a file: "${entrypoint}" should be a .ts, .js, or .mjs file`,
        },
      };
    }

    return { success: true };
  } catch (err) {
    // File does not exist or is not readable
    const errorMessage =
      err instanceof Error ? err.message : String(err);

    // Build a helpful suggestion showing the expected path structure
    const pluginId = descriptor.id || "(unnamed)";
    const suggestedPath = `./plugins/${pluginId}/dist/sandbox-entry.js`;

    return {
      success: false,
      error: {
        error: "PLUGIN_ENTRYPOINT_NOT_RESOLVED",
        message: `Could not find plugin entrypoint. File does not exist: ${errorMessage}`,
        tried: entrypoint,
        suggestion: `Use a real file path like "${suggestedPath}" instead of an npm alias. Bundler resolves file paths but not package aliases.`,
      },
    };
  }
}

/**
 * Validate all required PluginDescriptor fields are present and correctly typed.
 *
 * Per EMDASH-GUIDE.md section 6, every plugin must declare:
 * - id: unique identifier for the plugin
 * - version: semantic version (used for updates and compatibility)
 * - format: plugin format string (currently "standard")
 * - entrypoint: resolvable path to plugin entry file
 * - capabilities: array of capabilities the plugin needs
 *
 * @param descriptor - The plugin descriptor to validate
 * @returns ValidationResult with success flag or detailed error
 */
export function validatePluginDescriptorFields(
  descriptor: PluginDescriptor
): ValidationResult {
  for (const field of REQUIRED_DESCRIPTOR_FIELDS) {
    if (!(field in descriptor)) {
      return {
        success: false,
        error: {
          error: "PLUGIN_DESCRIPTOR_INCOMPLETE",
          message: `Plugin is missing required field: "${field}"`,
          tried: descriptor.id || "(unnamed plugin)",
          suggestion: `Add the "${field}" field to your plugin descriptor. See EMDASH-GUIDE.md section 6 for example: ${
            field === "entrypoint"
              ? '"./plugins/membership/sandbox-entry.ts"'
              : field === "capabilities"
                ? '["email:send"]'
                : '"standard"'
          }`,
        },
      };
    }
  }

  // Validate field types
  if (typeof descriptor.id !== "string" || !descriptor.id.trim()) {
    return {
      success: false,
      error: {
        error: "PLUGIN_ID_INVALID",
        message: 'Plugin id must be a non-empty string',
        tried: String(descriptor.id),
        suggestion:
          'Set id to a unique identifier like "membership", "payments", "analytics"',
      },
    };
  }

  if (typeof descriptor.version !== "string" || !descriptor.version.trim()) {
    return {
      success: false,
      error: {
        error: "PLUGIN_VERSION_INVALID",
        message: 'Plugin version must be a non-empty string',
        tried: String(descriptor.version),
        suggestion: 'Use semantic versioning like "1.0.0"',
      },
    };
  }

  if (descriptor.format !== "standard") {
    return {
      success: false,
      error: {
        error: "PLUGIN_FORMAT_UNSUPPORTED",
        message: `Unsupported plugin format: "${descriptor.format}"`,
        tried: descriptor.format,
        suggestion: 'Set format to "standard" (the only format currently supported)',
      },
    };
  }

  if (!Array.isArray(descriptor.capabilities)) {
    return {
      success: false,
      error: {
        error: "PLUGIN_CAPABILITIES_INVALID",
        message: 'Plugin capabilities must be an array',
        tried: String(descriptor.capabilities),
        suggestion: 'Set capabilities to an array like ["email:send"] or []',
      },
    };
  }

  return { success: true };
}

/**
 * Comprehensive plugin validation: checks all required fields AND entrypoint resolution.
 *
 * This is the main entry point for build-time validation. It runs both
 * field validation and entrypoint validation, failing fast on first error.
 *
 * Per decision.md line 93: "Build fails LOUDLY if plugin won't work in production"
 * Per decision.md line 112: "If it builds, it ships. If it ships, it runs."
 *
 * @param descriptor - The plugin descriptor to validate
 * @returns ValidationResult with success flag or detailed error
 * @throws Error if validation fails (intentional loudness at build time)
 */
export function validatePlugin(descriptor: PluginDescriptor): ValidationResult {
  // First check required fields
  const fieldsResult = validatePluginDescriptorFields(descriptor);
  if (!fieldsResult.success) {
    return fieldsResult;
  }

  // Then check entrypoint resolution
  const entrypointResult = validatePluginEntrypointExists(descriptor);
  if (!entrypointResult.success) {
    return entrypointResult;
  }

  return { success: true };
}

/**
 * Throw a validation error with formatted message.
 *
 * This is used by build systems to fail the build loudly when a plugin
 * cannot be loaded. The error includes all context needed to fix the problem
 * without additional debugging steps.
 *
 * Format matches decisions.md lines 98-109:
 * - error: Code for programmatic handling
 * - message: Human explanation
 * - tried: What was attempted
 * - suggestion: How to fix it
 *
 * @param error - The validation error from validatePlugin()
 * @throws Error with JSON-formatted error details
 */
export function throwValidationError(error: ValidationError): never {
  const formatted = JSON.stringify(error, null, 2);
  throw new Error(
    `Plugin validation failed:\n${formatted}\n\nFix the above error and rebuild.`
  );
}
