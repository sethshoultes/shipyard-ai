/**
 * Unit tests for GitHub webhook event parser
 * Tests validation logic, edge cases, and error handling
 */

import {
  parseGitHubWebhook,
  ValidationError,
  isValidWebhookPayload,
} from "../event-parser";

describe("GitHub Webhook Event Parser", () => {
  // Helper function to create a minimal valid payload
  function createValidPayload(overrides: any = {}): any {
    const basePayload = {
      action: "opened",
      issue: {
        number: 123,
        title: "Test Issue",
        body: "This is a test issue",
        labels: [{ name: "intake-request" }],
        user: { login: "test-user" },
        html_url: "https://github.com/test/repo/issues/123",
      },
      repository: {
        name: "repo",
        full_name: "test/repo",
      },
    };

    // Deep merge overrides
    const result = { ...basePayload, ...overrides };
    if (overrides.issue) {
      result.issue = { ...basePayload.issue, ...overrides.issue };
    }
    if (overrides.repository) {
      result.repository = { ...basePayload.repository, ...overrides.repository };
    }

    return result;
  }

  describe("parseGitHubWebhook - Valid Payloads", () => {
    it("should parse a valid payload with all fields", () => {
      const payload = createValidPayload();
      const result = parseGitHubWebhook(payload);

      expect(result).toEqual({
        issue_id: 123,
        title: "Test Issue",
        body: "This is a test issue",
        labels: ["intake-request"],
        created_by: "test-user",
        repo_name: "test/repo",
        raw_content: expect.any(String),
        issue_url: "https://github.com/test/repo/issues/123",
        html_url: "https://github.com/test/repo/issues/123",
      });
    });

    it("should parse payload without body (undefined)", () => {
      const payload = createValidPayload({ issue: { body: undefined } });
      const result = parseGitHubWebhook(payload);

      expect(result.body).toBe("");
    });

    it("should parse payload with empty body", () => {
      const payload = createValidPayload({ issue: { body: "" } });
      const result = parseGitHubWebhook(payload);

      expect(result.body).toBe("");
    });

    it("should parse payload with only whitespace body", () => {
      const payload = createValidPayload({ issue: { body: "   \n\n  " } });
      const result = parseGitHubWebhook(payload);

      expect(result.body).toBe("");
    });

    it("should handle missing labels", () => {
      const payload = createValidPayload({ issue: { labels: undefined } });
      const result = parseGitHubWebhook(payload);

      expect(result.labels).toEqual([]);
    });

    it("should handle empty labels array", () => {
      const payload = createValidPayload({ issue: { labels: [] } });
      const result = parseGitHubWebhook(payload);

      expect(result.labels).toEqual([]);
    });

    it("should extract multiple labels", () => {
      const payload = createValidPayload({
        issue: {
          labels: [
            { name: "intake-request" },
            { name: "bug" },
            { name: "p0" },
          ],
        },
      });
      const result = parseGitHubWebhook(payload);

      expect(result.labels).toEqual(["intake-request", "bug", "p0"]);
    });

    it("should handle missing user field", () => {
      const payload = createValidPayload({ issue: { user: undefined } });
      const result = parseGitHubWebhook(payload);

      expect(result.created_by).toBe("unknown");
    });

    it("should handle missing html_url", () => {
      const payload = createValidPayload({ issue: { html_url: undefined } });
      const result = parseGitHubWebhook(payload);

      expect(result.issue_url).toBeUndefined();
      expect(result.html_url).toBeUndefined();
    });

    it("should store raw_content unchanged", () => {
      const payload = createValidPayload();
      const result = parseGitHubWebhook(payload);

      // raw_content should be JSON string of the issue object
      expect(result.raw_content).toBe(JSON.stringify(payload.issue));
    });
  });

  describe("parseGitHubWebhook - Edge Cases", () => {
    it("should handle emoji-only body gracefully", () => {
      // This test will trigger the emoji-only edge case warning
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      const payload = createValidPayload({ issue: { body: "😀🎉🚀" } });
      const result = parseGitHubWebhook(payload);

      expect(result.body).toBe("");
      expect(consoleSpy).toHaveBeenCalledWith(
        "Edge case detected: issue body contains only emoji",
        expect.objectContaining({
          issue_title: "Test Issue",
        })
      );

      consoleSpy.mockRestore();
    });

    it("should extract text from markdown links in body", () => {
      const payload = createValidPayload({
        issue: {
          body: "Check out [this documentation](https://example.com/docs) for details",
        },
      });
      const result = parseGitHubWebhook(payload);

      expect(result.body).toBe(
        "Check out this documentation for details"
      );
    });

    it("should extract text from HTML links in body", () => {
      const payload = createValidPayload({
        issue: {
          body: 'See <a href="https://example.com">the guide</a> for info',
        },
      });
      const result = parseGitHubWebhook(payload);

      expect(result.body).toBe("See the guide for info");
    });

    it("should handle mixed markdown and HTML links", () => {
      const payload = createValidPayload({
        issue: {
          body: 'Read [guide](https://example.com) and <a href="https://example.com/docs">docs</a>',
        },
      });
      const result = parseGitHubWebhook(payload);

      expect(result.body).toBe("Read guide and docs");
    });

    it("should handle body with multiple emoji-like patterns", () => {
      const payload = createValidPayload({
        issue: {
          body: "Important feature 🚀 Check: ✅ Status: 🔄",
        },
      });
      const result = parseGitHubWebhook(payload);

      // This should NOT be treated as emoji-only since it has text
      expect(result.body).toContain("Important feature");
    });
  });

  describe("parseGitHubWebhook - Validation Errors", () => {
    it("should throw ValidationError when payload is not an object", () => {
      expect(() => parseGitHubWebhook(null)).toThrow(ValidationError);
      expect(() => parseGitHubWebhook("invalid")).toThrow(ValidationError);
      expect(() => parseGitHubWebhook(123)).toThrow(ValidationError);
    });

    it("should throw ValidationError when issue is missing", () => {
      const payload = { repository: { full_name: "test/repo" } };

      expect(() => parseGitHubWebhook(payload)).toThrow(ValidationError);
    });

    it("should throw ValidationError when issue is not an object", () => {
      const payload = {
        issue: "invalid",
        repository: { full_name: "test/repo" },
      };

      expect(() => parseGitHubWebhook(payload)).toThrow(ValidationError);
    });

    it("should throw ValidationError when repository is missing", () => {
      const payload = {
        issue: { number: 123, title: "Test" },
      };

      expect(() => parseGitHubWebhook(payload)).toThrow(ValidationError);
    });

    it("should throw ValidationError when title is missing", () => {
      const payload = createValidPayload({ issue: { title: undefined } });

      expect(() => parseGitHubWebhook(payload)).toThrow(ValidationError);
    });

    it("should throw ValidationError when title is empty string", () => {
      const payload = createValidPayload({ issue: { title: "" } });

      expect(() => parseGitHubWebhook(payload)).toThrow(ValidationError);
    });

    it("should throw ValidationError when title is only whitespace", () => {
      const payload = createValidPayload({ issue: { title: "   " } });

      expect(() => parseGitHubWebhook(payload)).toThrow(ValidationError);
    });

    it("should throw ValidationError when repo_name is missing", () => {
      const payload = createValidPayload({ repository: { full_name: "" } });

      expect(() => parseGitHubWebhook(payload)).toThrow(ValidationError);
    });

    it("should throw ValidationError when repo_name is only whitespace", () => {
      const payload = createValidPayload({
        repository: { full_name: "   " },
      });

      expect(() => parseGitHubWebhook(payload)).toThrow(ValidationError);
    });
  });

  describe("ValidationError", () => {
    it("should have correct error properties", () => {
      const error = new ValidationError(
        "Title is missing",
        "title",
        "title field is empty"
      );

      expect(error.message).toBe("Title is missing");
      expect(error.field).toBe("title");
      expect(error.reason).toBe("title field is empty");
      expect(error.name).toBe("ValidationError");
    });

    it("should be an instance of Error", () => {
      const error = new ValidationError("test", "field", "reason");

      expect(error instanceof Error).toBe(true);
      expect(error instanceof ValidationError).toBe(true);
    });
  });

  describe("isValidWebhookPayload", () => {
    it("should return true for valid payload", () => {
      const payload = createValidPayload();

      expect(isValidWebhookPayload(payload)).toBe(true);
    });

    it("should return false for null payload", () => {
      expect(isValidWebhookPayload(null)).toBe(false);
    });

    it("should return false for non-object payload", () => {
      expect(isValidWebhookPayload("invalid")).toBe(false);
      expect(isValidWebhookPayload(123)).toBe(false);
      expect(isValidWebhookPayload([])).toBe(false);
    });

    it("should return false when issue is missing", () => {
      const payload = {
        repository: { full_name: "test/repo" },
      };

      expect(isValidWebhookPayload(payload)).toBe(false);
    });

    it("should return false when issue.number is missing", () => {
      const payload = {
        issue: { title: "Test" },
        repository: { full_name: "test/repo" },
      };

      expect(isValidWebhookPayload(payload)).toBe(false);
    });

    it("should return false when issue.title is missing", () => {
      const payload = {
        issue: { number: 123 },
        repository: { full_name: "test/repo" },
      };

      expect(isValidWebhookPayload(payload)).toBe(false);
    });

    it("should return false when repository is missing", () => {
      const payload = {
        issue: { number: 123, title: "Test" },
      };

      expect(isValidWebhookPayload(payload)).toBe(false);
    });

    it("should return false when repository.full_name is missing", () => {
      const payload = {
        issue: { number: 123, title: "Test" },
        repository: {},
      };

      expect(isValidWebhookPayload(payload)).toBe(false);
    });

    it("should allow optional fields to be missing", () => {
      const payload = {
        issue: { number: 123, title: "Test" },
        repository: { full_name: "test/repo" },
      };

      expect(isValidWebhookPayload(payload)).toBe(true);
    });
  });

  describe("Integration Tests", () => {
    it("should handle a realistic GitHub issue payload", () => {
      const payload = {
        action: "opened",
        issue: {
          url: "https://api.github.com/repos/test/repo/issues/456",
          number: 456,
          title: "Implement dark mode feature",
          body: "We need a dark mode theme. See [Figma designs](https://figma.com/dark-mode) for details. Priority: high",
          labels: [{ name: "feature" }, { name: "intake-request" }],
          user: { login: "jane-doe" },
          html_url: "https://github.com/test/repo/issues/456",
        },
        repository: {
          name: "repo",
          full_name: "test/repo",
        },
      };

      const result = parseGitHubWebhook(payload);

      expect(result.issue_id).toBe(456);
      expect(result.title).toBe("Implement dark mode feature");
      expect(result.body).toBe(
        "We need a dark mode theme. See Figma designs for details. Priority: high"
      );
      expect(result.labels).toContain("feature");
      expect(result.labels).toContain("intake-request");
      expect(result.created_by).toBe("jane-doe");
      expect(result.repo_name).toBe("test/repo");
    });

    it("should handle minimal required GitHub issue payload", () => {
      const payload = {
        issue: {
          number: 789,
          title: "Minimal issue",
          labels: [],
          user: { login: "minimal-user" },
        },
        repository: {
          full_name: "org/minimal-repo",
        },
      };

      const result = parseGitHubWebhook(payload);

      expect(result.issue_id).toBe(789);
      expect(result.title).toBe("Minimal issue");
      expect(result.body).toBe("");
      expect(result.labels).toEqual([]);
      expect(result.created_by).toBe("minimal-user");
      expect(result.repo_name).toBe("org/minimal-repo");
    });
  });
});
