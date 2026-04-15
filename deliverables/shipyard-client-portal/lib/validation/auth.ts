/**
 * Email/Password Signup Form Validation
 * Validation rules per REQ-AUTH-001 acceptance criteria
 */

export interface SignupFormErrors {
  email?: string;
  password?: string;
  passwordConfirm?: string;
}

export function validateSignupForm(
  email: string,
  password: string,
  passwordConfirm: string
): { valid: boolean; errors: SignupFormErrors } {
  const errors: SignupFormErrors = {};

  // Email validation (trim whitespace)
  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(trimmedEmail)) {
    errors.email = "Please enter a valid email address.";
  }

  // Password validation: minimum 8 characters
  if (!password || !password.trim()) {
    errors.password = "Password is required.";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters long.";
  }

  // Password confirmation match
  if (!passwordConfirm || !passwordConfirm.trim()) {
    errors.passwordConfirm = "Please confirm your password.";
  } else if (password !== passwordConfirm) {
    errors.passwordConfirm = "Passwords do not match.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

function isValidEmail(email: string): boolean {
  // Basic email regex from HTML5 spec
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
