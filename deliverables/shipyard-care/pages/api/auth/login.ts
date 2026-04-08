/**
 * Login API Endpoint
 * Requirement: REQ-009 - Create login/logout authentication endpoints
 *
 * POST /api/auth/login
 * Body: { email: string, password: string }
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { query } from '../../../lib/db';
import { createSession, setSessionCookie } from '../../../lib/auth';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  error?: string;
}

/**
 * Verify password using bcrypt
 * Security: Uses bcrypt for secure password hashing
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
): Promise<void> {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { email, password } = req.body as LoginRequest;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    // Look up user by email
    const userResult = await query<{
      id: string;
      email: string;
      name: string;
      password_hash: string;
      password_salt: string;
    }>(
      'SELECT id, email, name, password_hash, password_salt FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      // Use generic error to prevent email enumeration
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    const user = userResult.rows[0];

    // Verify password
    const passwordHash = hashPassword(password, user.password_salt);
    if (passwordHash !== user.password_hash) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Create session
    const sessionToken = await createSession(user.id);

    // Set httpOnly cookie
    setSessionCookie(res, sessionToken);

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred during login. Please try again.',
    });
  }
}
