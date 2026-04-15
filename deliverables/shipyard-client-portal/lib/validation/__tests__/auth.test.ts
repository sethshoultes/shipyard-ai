import { describe, it, expect } from "vitest";
import { validateSignupForm } from "../auth";

describe("validateSignupForm", () => {
  describe("Email validation", () => {
    it("should fail when email is empty", () => {
      const result = validateSignupForm("", "password123", "password123");
      expect(result.valid).toBe(false);
      expect(result.errors.email).toBeDefined();
      expect(result.errors.email).toContain("required");
    });

    it("should fail when email format is invalid", () => {
      const result = validateSignupForm(
        "not-an-email",
        "password123",
        "password123"
      );
      expect(result.valid).toBe(false);
      expect(result.errors.email).toBeDefined();
      expect(result.errors.email).toContain("valid email");
    });

    it("should pass with valid email format", () => {
      const result = validateSignupForm(
        "user@example.com",
        "password123",
        "password123"
      );
      expect(result.errors.email).toBeUndefined();
    });

    it("should trim whitespace from email", () => {
      const result = validateSignupForm(
        "  user@example.com  ",
        "password123",
        "password123"
      );
      expect(result.errors.email).toBeUndefined();
    });
  });

  describe("Password validation", () => {
    it("should fail when password is empty", () => {
      const result = validateSignupForm("user@example.com", "", "");
      expect(result.valid).toBe(false);
      expect(result.errors.password).toBeDefined();
      expect(result.errors.password).toContain("required");
    });

    it("should fail when password is less than 8 characters", () => {
      const result = validateSignupForm(
        "user@example.com",
        "short",
        "short"
      );
      expect(result.valid).toBe(false);
      expect(result.errors.password).toBeDefined();
      expect(result.errors.password).toContain("8 characters");
    });

    it("should pass with password of exactly 8 characters", () => {
      const result = validateSignupForm(
        "user@example.com",
        "12345678",
        "12345678"
      );
      expect(result.errors.password).toBeUndefined();
    });

    it("should pass with password longer than 8 characters", () => {
      const result = validateSignupForm(
        "user@example.com",
        "validpassword",
        "validpassword"
      );
      expect(result.errors.password).toBeUndefined();
    });
  });

  describe("Password confirmation validation", () => {
    it("should fail when confirmation password is empty", () => {
      const result = validateSignupForm(
        "user@example.com",
        "password123",
        ""
      );
      expect(result.valid).toBe(false);
      expect(result.errors.passwordConfirm).toBeDefined();
      expect(result.errors.passwordConfirm).toContain("confirm");
    });

    it("should fail when passwords do not match", () => {
      const result = validateSignupForm(
        "user@example.com",
        "password123",
        "password456"
      );
      expect(result.valid).toBe(false);
      expect(result.errors.passwordConfirm).toBeDefined();
      expect(result.errors.passwordConfirm).toContain("do not match");
    });

    it("should pass when passwords match", () => {
      const result = validateSignupForm(
        "user@example.com",
        "password123",
        "password123"
      );
      expect(result.errors.passwordConfirm).toBeUndefined();
    });
  });

  describe("Full form validation", () => {
    it("should return valid=true when all fields are correct", () => {
      const result = validateSignupForm(
        "user@example.com",
        "password123",
        "password123"
      );
      expect(result.valid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it("should return valid=false when any field is invalid", () => {
      const result = validateSignupForm(
        "invalid-email",
        "short",
        "different"
      );
      expect(result.valid).toBe(false);
      expect(result.errors.email).toBeDefined();
      expect(result.errors.password).toBeDefined();
      expect(result.errors.passwordConfirm).toBeDefined();
    });

    it("should accumulate multiple errors", () => {
      const result = validateSignupForm("", "short", "");
      expect(result.valid).toBe(false);
      expect(result.errors.email).toBeDefined();
      expect(result.errors.password).toBeDefined();
      expect(result.errors.passwordConfirm).toBeDefined();
    });
  });

  describe("Edge cases", () => {
    it("should handle whitespace-only email", () => {
      const result = validateSignupForm(
        "   ",
        "password123",
        "password123"
      );
      expect(result.valid).toBe(false);
      expect(result.errors.email).toBeDefined();
    });

    it("should handle email with special characters", () => {
      const result = validateSignupForm(
        "user+tag@example.co.uk",
        "password123",
        "password123"
      );
      expect(result.valid).toBe(true);
    });

    it("should handle long passwords", () => {
      const longPassword = "a".repeat(256);
      const result = validateSignupForm(
        "user@example.com",
        longPassword,
        longPassword
      );
      expect(result.valid).toBe(true);
    });
  });
});
