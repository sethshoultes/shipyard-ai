/**
 * Authentication utilities for Tuned Worker
 *
 * Validates API keys from Authorization headers.
 * API keys follow the format: tuned_sk_live_* or tuned_sk_test_*
 *
 * Middleware pattern:
 * - Check Authorization header (Bearer token format)
 * - Return 401 if no key/header provided
 * - Return 403 if key is invalid
 *
 * Future enhancement:
 * - Validate against projects table api_key column in database
 * - Cache validation results for performance
 */

export interface AuthValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate API key from Authorization header
 *
 * @param authHeader - The Authorization header value (e.g., "Bearer tuned_sk_live_abc123")
 * @returns AuthValidationResult with valid flag and optional error message
 *
 * MVP Implementation:
 * - Checks for Bearer token format
 * - Validates key prefix (tuned_sk_live_ or tuned_sk_test_)
 * - Checks minimum key length
 *
 * Future: Will validate against projects table api_key column
 */
export function validateApiKey(
  authHeader: string | null
): AuthValidationResult {
  // Check if header exists
  if (!authHeader) {
    return {
      valid: false,
      error: "Missing Authorization header",
    };
  }

  // Check Bearer token format
  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!bearerMatch) {
    return {
      valid: false,
      error: "Invalid Authorization header format. Expected: Bearer <token>",
    };
  }

  const token = bearerMatch[1];

  // Validate API key format and prefix
  const apiKeyPattern = /^tuned_sk_(live|test)_[a-zA-Z0-9_]{32,}$/;
  if (!apiKeyPattern.test(token)) {
    return {
      valid: false,
      error: "Invalid API key format",
    };
  }

  // MVP: If we got here, the key format is valid
  // Future: This is where we'd check against the projects table
  return {
    valid: true,
  };
}

/**
 * Express/middleware compatible auth middleware
 * Use this to protect routes requiring authentication
 *
 * Example usage:
 * app.get("/api/protected", (req, res, next) => {
 *   const authHeader = req.headers.authorization;
 *   const validation = validateApiKey(authHeader);
 *
 *   if (!validation.valid) {
 *     const statusCode = !authHeader ? 401 : 403;
 *     return res.status(statusCode).json({ error: validation.error });
 *   }
 *
 *   next();
 * });
 */
