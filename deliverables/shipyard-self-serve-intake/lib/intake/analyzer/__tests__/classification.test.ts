/**
 * Classification Module Tests
 * Verifies request type classification and confidence scoring
 */

import { classifyRequest, RequestType } from "../classification";

describe("Request Type Classification", () => {
  describe("BUG_FIX Classification", () => {
    it("should classify 'bug in production' as BUG_FIX", () => {
      const result = classifyRequest("bug in production", "The application crashes when users login");
      expect(result.type).toBe(RequestType.BUG_FIX);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it("should classify 'error handling broken' as BUG_FIX", () => {
      const result = classifyRequest("error handling broken", "Error handling is not working");
      expect(result.type).toBe(RequestType.BUG_FIX);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it("should classify issue with multiple bug keywords as BUG_FIX", () => {
      const result = classifyRequest(
        "Fix critical bug in login flow",
        "The issue is broken and needs to be fixed immediately"
      );
      expect(result.type).toBe(RequestType.BUG_FIX);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it("should handle 'crash' keyword as BUG_FIX", () => {
      const result = classifyRequest("App crashes on startup", "The application is crashing");
      expect(result.type).toBe(RequestType.BUG_FIX);
    });

    it("should handle 'fail' keyword as BUG_FIX", () => {
      const result = classifyRequest("API calls fail silently", "Requests fail with no error message");
      expect(result.type).toBe(RequestType.BUG_FIX);
    });

    it("should handle 'problem' keyword as BUG_FIX", () => {
      const result = classifyRequest("Database query problem", "There is a problem with queries");
      expect(result.type).toBe(RequestType.BUG_FIX);
    });
  });

  describe("FEATURE Classification", () => {
    it("should classify 'add new feature' as FEATURE", () => {
      const result = classifyRequest("add new feature", "We need to implement a new feature");
      expect(result.type).toBe(RequestType.FEATURE);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it("should classify 'implement user authentication' as FEATURE", () => {
      const result = classifyRequest("implement user authentication", "Create a new authentication system");
      expect(result.type).toBe(RequestType.FEATURE);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it("should classify 'new dashboard' as FEATURE", () => {
      const result = classifyRequest("new dashboard", "We need to add a new analytics dashboard");
      expect(result.type).toBe(RequestType.FEATURE);
    });

    it("should classify 'create API endpoint' as FEATURE", () => {
      const result = classifyRequest("create API endpoint", "Create a new API endpoint for users");
      expect(result.type).toBe(RequestType.FEATURE);
    });
  });

  describe("ENHANCEMENT Classification", () => {
    it("should classify 'improve performance' as ENHANCEMENT", () => {
      const result = classifyRequest("improve performance", "Optimize the database queries");
      expect(result.type).toBe(RequestType.ENHANCEMENT);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it("should classify 'enhance user experience' as ENHANCEMENT", () => {
      const result = classifyRequest("enhance user experience", "Make the UI more intuitive");
      expect(result.type).toBe(RequestType.ENHANCEMENT);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it("should classify 'optimize query performance' as ENHANCEMENT", () => {
      const result = classifyRequest("optimize query performance", "Speed up slow database queries");
      expect(result.type).toBe(RequestType.ENHANCEMENT);
    });

    it("should classify 'refactor codebase' as ENHANCEMENT", () => {
      const result = classifyRequest("refactor codebase", "Improve code structure and maintainability");
      expect(result.type).toBe(RequestType.ENHANCEMENT);
    });

    it("should classify 'improve styling' as ENHANCEMENT", () => {
      const result = classifyRequest("improve styling", "Refresh the visual design");
      expect(result.type).toBe(RequestType.ENHANCEMENT);
    });
  });

  describe("DOCUMENTATION Classification", () => {
    it("should classify 'update docs' as DOCUMENTATION", () => {
      const result = classifyRequest("update docs", "The documentation needs to be updated");
      expect(result.type).toBe(RequestType.DOCUMENTATION);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it("should classify 'add API documentation' as DOCUMENTATION", () => {
      const result = classifyRequest("add API documentation", "Write comprehensive API docs");
      expect(result.type).toBe(RequestType.DOCUMENTATION);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it("should classify 'update readme guide' as DOCUMENTATION", () => {
      const result = classifyRequest("update readme guide", "Improve documentation");
      expect(result.type).toBe(RequestType.DOCUMENTATION);
    });

    it("should classify 'write guide' as DOCUMENTATION", () => {
      const result = classifyRequest("write guide", "Create a user guide for the feature");
      expect(result.type).toBe(RequestType.DOCUMENTATION);
    });

    it("should classify 'write tutorial' as DOCUMENTATION", () => {
      const result = classifyRequest("write tutorial", "Create step-by-step tutorial");
      expect(result.type).toBe(RequestType.DOCUMENTATION);
    });

    it("should classify 'document API' as DOCUMENTATION", () => {
      const result = classifyRequest("document API", "Add API documentation examples");
      expect(result.type).toBe(RequestType.DOCUMENTATION);
    });
  });

  describe("Default Classification", () => {
    it("should default to FEATURE when no keywords match", () => {
      const result = classifyRequest("random title", "This is just some random body text");
      expect(result.type).toBe(RequestType.FEATURE);
      expect(result.confidence).toBeLessThan(0.5);
    });

    it("should default to FEATURE when classification is unclear", () => {
      const result = classifyRequest("Something needs attention", "Please look at this");
      expect(result.type).toBe(RequestType.FEATURE);
    });
  });

  describe("Confidence Scoring", () => {
    it("should return high confidence for clear title matches", () => {
      const result = classifyRequest("bug in production", "Some body text");
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it("should return low confidence for unclear requests", () => {
      const result = classifyRequest("please review", "just some text");
      expect(result.confidence).toBeLessThan(0.5);
    });

    it("should return valid confidence between 0 and 1", () => {
      const result = classifyRequest("add new feature", "with some description");
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it("should have more confidence with multiple matching keywords", () => {
      const resultSingle = classifyRequest("bug", "some body");
      const resultMultiple = classifyRequest("bug error issue", "broken fix problem");
      expect(resultMultiple.confidence).toBeGreaterThanOrEqual(resultSingle.confidence);
    });
  });

  describe("Result Structure", () => {
    it("should return an object with type and confidence properties", () => {
      const result = classifyRequest("test", "test");
      expect(result).toHaveProperty("type");
      expect(result).toHaveProperty("confidence");
    });

    it("should have type as a valid RequestType", () => {
      const result = classifyRequest("bug fix", "body");
      expect(Object.values(RequestType)).toContain(result.type);
    });

    it("should have confidence as a number", () => {
      const result = classifyRequest("test", "test");
      expect(typeof result.confidence).toBe("number");
    });
  });

  describe("Case Insensitivity", () => {
    it("should handle uppercase titles", () => {
      const result = classifyRequest("BUG IN PRODUCTION", "body");
      expect(result.type).toBe(RequestType.BUG_FIX);
    });

    it("should handle mixed case titles", () => {
      const result = classifyRequest("Add New FEATURE", "body");
      expect(result.type).toBe(RequestType.FEATURE);
    });

    it("should handle lowercase titles", () => {
      const result = classifyRequest("improve performance", "body");
      expect(result.type).toBe(RequestType.ENHANCEMENT);
    });

    it("should handle uppercase body text", () => {
      const result = classifyRequest("title", "NEED TO FIX THIS BUG");
      expect(result.type).toBe(RequestType.BUG_FIX);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty title", () => {
      const result = classifyRequest("", "This is a bug in the system");
      expect(result.type).toBe(RequestType.BUG_FIX);
    });

    it("should handle empty body", () => {
      const result = classifyRequest("bug report", "");
      expect(result.type).toBe(RequestType.BUG_FIX);
    });

    it("should handle both empty", () => {
      const result = classifyRequest("", "");
      expect(result.type).toBe(RequestType.FEATURE); // Default
    });

    it("should handle very long text", () => {
      const longBody = "bug " + "word ".repeat(1000);
      const result = classifyRequest("title", longBody);
      expect(result.type).toBe(RequestType.BUG_FIX);
    });

    it("should handle special characters", () => {
      const result = classifyRequest("bug: urgent!!", "This needs to be fixed ASAP!!");
      expect(result.type).toBe(RequestType.BUG_FIX);
    });
  });

  describe("Title vs Body Weighting", () => {
    it("should prioritize title keywords over body keywords", () => {
      // Title says feature, body says bug
      const result = classifyRequest("new feature", "this bug needs fixing");
      // Feature keyword in title (2 points) vs bug in body (1 point)
      expect(result.type).toBe(RequestType.FEATURE);
    });

    it("should weight title keywords more heavily", () => {
      const result = classifyRequest(
        "bug fix required",
        "improve the system improve the code optimize"
      );
      // Title has "bug" (2) + "fix" (2) = 4, body has enhance-type keywords
      expect(result.type).toBe(RequestType.BUG_FIX);
    });
  });

  describe("Multiple Keyword Types in Request", () => {
    it("should classify correctly when body has mixed keywords", () => {
      const result = classifyRequest(
        "add new feature",
        "this will fix a bug and improve performance"
      );
      // Title clearly says feature
      expect(result.type).toBe(RequestType.FEATURE);
    });

    it("should break ties by picking first highest scored", () => {
      // Title has "add feature" and body has "improve"
      const result = classifyRequest("add new", "improve and enhance and optimize");
      // This should favor the clear type. If tied, the order in KEYWORD_MAPS determines it
      expect([RequestType.FEATURE, RequestType.ENHANCEMENT]).toContain(result.type);
    });
  });
});
