/**
 * Login Form Validation Tests
 * 
 * These tests verify the login form validation logic
 */

// Email validation test
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password validation test
function validatePassword(password: string): boolean {
  return password.length > 0;
}

// Run tests
const tests: Array<{ name: string; status: string; error?: any }> = [];

try {
  // Test valid emails
  ["user@example.com", "test.user@example.co.uk", "user+tag@example.com"].forEach(
    (email) => {
      if (!validateEmail(email)) {
        throw new Error(`Email ${email} should be valid`);
      }
    }
  );
  tests.push({ name: "Email validation - valid emails", status: "PASS" });
} catch (e) {
  tests.push({ name: "Email validation - valid emails", status: "FAIL", error: e });
}

try {
  // Test invalid emails
  ["notanemail", "@example.com", "user@", "user @example.com"].forEach(
    (email) => {
      if (validateEmail(email)) {
        throw new Error(`Email ${email} should be invalid`);
      }
    }
  );
  tests.push({ name: "Email validation - invalid emails", status: "PASS" });
} catch (e) {
  tests.push({ name: "Email validation - invalid emails", status: "FAIL", error: e });
}

try {
  // Test valid passwords
  ["password123", "P@ssw0rd", "secure"].forEach((password) => {
    if (!validatePassword(password)) {
      throw new Error(`Password should be valid`);
    }
  });
  tests.push({ name: "Password validation - valid passwords", status: "PASS" });
} catch (e) {
  tests.push({ name: "Password validation - valid passwords", status: "FAIL", error: e });
}

try {
  // Test empty password
  if (validatePassword("")) {
    throw new Error(`Empty password should be invalid`);
  }
  tests.push({ name: "Password validation - empty password", status: "PASS" });
} catch (e) {
  tests.push({ name: "Password validation - empty password", status: "FAIL", error: e });
}

// Export test results
export { tests as testResults };
export { validateEmail, validatePassword };
