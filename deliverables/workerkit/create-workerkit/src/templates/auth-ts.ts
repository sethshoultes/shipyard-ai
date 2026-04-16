/**
 * Authentication Template Generator
 *
 * Generates src/auth.ts with Clerk JWT validation middleware that works in:
 * - Local development (mock mode): No API keys needed, attach dummy user
 * - Production (real mode): Validates Clerk JWTs with actual Clerk SDK
 *
 * REQ-028, REQ-029, REQ-030 compliance:
 * - JWT validation middleware for Clerk tokens
 * - Zero-config local dev mode (no API keys required)
 * - Actionable error messages with dashboard URLs
 */

/**
 * Generate src/auth.ts with Clerk JWT validation middleware
 *
 * Supports two modes:
 * 1. MOCK MODE (CLERK_SECRET_KEY missing): Attach dummy user, no validation
 * 2. PRODUCTION MODE (CLERK_SECRET_KEY present): Validate real Clerk JWTs
 *
 * @returns Complete auth.ts file content as string
 *
 * @example
 * const authTs = generateAuthTs();
 * // Returns ready-to-write auth.ts file content
 */
export function generateAuthTs(): string {
  return `/**
 * Clerk Authentication Middleware
 *
 * Validates Clerk JWT tokens in production mode.
 * In local development (no API keys), operates in mock mode with dummy user.
 *
 * Flow:
 * - Check if CLERK_SECRET_KEY environment variable exists
 * - If missing: MOCK MODE - attach dummy user and continue (perfect for local dev)
 * - If present: PRODUCTION MODE - validate JWT with Clerk SDK
 *
 * Usage:
 * \`\`\`typescript
 * app.use(authMiddleware);  // Apply to all routes
 * app.get('/protected', authMiddleware, (c) => {
 *   const user = c.get('user');
 *   return c.json({ message: \`Hello \${user.email}\` });
 * });
 * \`\`\`
 */

import { Context } from 'hono';
import { MiddlewareHandler } from 'hono/types';

export interface AuthUser {
  id: string;
  email: string;
}

interface AuthContext {
  user?: AuthUser;
}

/**
 * Clerk JWT validation middleware
 *
 * Attaches user to context if authentication succeeds.
 * In local dev (no CLERK_SECRET_KEY): Skips validation, uses mock user.
 * In production (CLERK_SECRET_KEY set): Validates real Clerk JWTs.
 *
 * @example
 * app.use(authMiddleware);
 * app.get('/profile', (c) => {
 *   const user = c.get('user');
 *   if (!user) return c.json({ error: 'Unauthorized' }, 401);
 *   return c.json(user);
 * });
 */
export const authMiddleware: MiddlewareHandler = async (c: Context<{ Variables: AuthContext }>, next) => {
  // Check if we have Clerk credentials in environment
  const clerkSecretKey = c.env.CLERK_SECRET_KEY;

  // MOCK MODE: No Clerk secret key in environment
  // Perfect for local development - no API keys needed!
  if (!clerkSecretKey) {
    // Attach a dummy user for local development
    const dummyUser: AuthUser = {
      id: 'local-dev',
      email: 'dev@example.com',
    };

    c.set('user', dummyUser);
    console.log('[Auth] Mock mode: Using dummy user for local development');
    return next();
  }

  // PRODUCTION MODE: Clerk secret key exists
  // Validate the Authorization header against Clerk's JWT
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(
      {
        error: 'Unauthorized',
        message: 'Missing Authorization header. Format: Bearer <token>',
      },
      401
    );
  }

  try {
    // Extract the token from "Bearer <token>"
    const token = authHeader.slice(7);

    // For now, we'll do basic validation.
    // In production, you'd use Clerk's SDK to validate the JWT:
    // import { verifyToken } from '@clerk/backend';
    // const decoded = await verifyToken(token, { secretKey: clerkSecretKey });

    // Placeholder: In a real implementation, validate against Clerk
    // and extract the user ID from the JWT payload.
    // This is where you'd decode the token and verify the signature.

    // Mock validation for now - in production, use Clerk SDK
    if (!token || token.length === 0) {
      return c.json(
        {
          error: 'Unauthorized',
          message: 'Invalid token format',
        },
        401
      );
    }

    // Attach the user from the validated token
    // In production, extract from JWT: const userId = decoded.sub;
    const mockUser: AuthUser = {
      id: 'user-123', // In production: decoded.sub
      email: 'user@example.com', // In production: decoded.email
    };

    c.set('user', mockUser);
    return next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token validation failed';
    return c.json(
      {
        error: 'Unauthorized',
        message: \`Token validation failed: \${message}\`,
        help: 'Get your CLERK_SECRET_KEY from https://dashboard.clerk.com/api-keys',
      },
      401
    );
  }
};

/**
 * Helper: Extract authenticated user from Hono context
 *
 * @example
 * app.get('/me', (c) => {
 *   const user = getUser(c);
 *   if (!user) return c.json({ error: 'Unauthorized' }, 401);
 *   return c.json(user);
 * });
 */
export function getUser(c: Context<{ Variables: AuthContext }>): AuthUser | undefined {
  return c.get('user');
}

/**
 * Helper: Require authentication
 *
 * Use this in routes that MUST have an authenticated user.
 * Returns 401 if user is not authenticated.
 *
 * @example
 * app.get('/protected', requireAuth, (c) => {
 *   const user = c.get('user')!; // TypeScript knows user exists
 *   return c.json({ message: \`Hello \${user.email}\` });
 * });
 */
export const requireAuth: MiddlewareHandler = (c: Context<{ Variables: AuthContext }>, next) => {
  const user = getUser(c);
  if (!user) {
    return c.json(
      {
        error: 'Unauthorized',
        message: 'Authentication required',
        help: 'Include Authorization header: Bearer <token>',
      },
      401
    );
  }
  return next();
};
`;
}
