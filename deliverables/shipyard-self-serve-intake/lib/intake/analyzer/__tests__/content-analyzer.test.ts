/**
 * Content Analyzer Tests
 * Verifies extraction and formatting of issue content
 */

import { analyzeContent, ParsedEvent } from "../content-analyzer";

describe("ContentAnalyzer", () => {
  describe("Title Extraction", () => {
    it("should extract title correctly", () => {
      const event: ParsedEvent = {
        title: "Add dark mode support",
        body: "Please add dark mode to the application",
      };

      const result = analyzeContent(event);

      expect(result.title).toBe("Add dark mode support");
    });

    it("should trim title whitespace", () => {
      const event: ParsedEvent = {
        title: "  Add feature  ",
        body: "Some body content",
      };

      const result = analyzeContent(event);

      expect(result.title).toBe("Add feature");
    });

    it("should throw error if title is missing", () => {
      const event: ParsedEvent = {
        title: "",
        body: "Some body content",
      };

      expect(() => analyzeContent(event)).toThrow("parsedEvent.title is required");
    });
  });

  describe("Description Extraction", () => {
    it("should extract first paragraph if under 500 chars", () => {
      const event: ParsedEvent = {
        title: "Test Issue",
        body: "This is the first paragraph.\n\nThis is the second paragraph that should not be included.",
      };

      const result = analyzeContent(event);

      expect(result.description).toBe("This is the first paragraph.");
    });

    it("should truncate to 500 chars if first paragraph is longer", () => {
      const longParagraph = "A".repeat(600);
      const event: ParsedEvent = {
        title: "Test Issue",
        body: longParagraph + "\n\nSecond paragraph",
      };

      const result = analyzeContent(event);

      expect(result.description).toHaveLength(503); // 500 + "..."
      expect(result.description.endsWith("...")).toBe(true);
    });

    it("should handle empty body", () => {
      const event: ParsedEvent = {
        title: "Test Issue",
        body: "",
      };

      const result = analyzeContent(event);

      expect(result.description).toBe("");
    });

    it("should handle undefined body", () => {
      const event: ParsedEvent = {
        title: "Test Issue",
      };

      const result = analyzeContent(event);

      expect(result.description).toBe("");
    });

    it("should handle multiple paragraph breaks", () => {
      const event: ParsedEvent = {
        title: "Test Issue",
        body: "First paragraph.\n\n\n\nSecond paragraph with multiple breaks before it.",
      };

      const result = analyzeContent(event);

      expect(result.description).toBe("First paragraph.");
    });
  });

  describe("Raw Content Preservation", () => {
    it("should preserve raw_content from parsedEvent if provided", () => {
      const rawData = { custom: "metadata", timestamp: 123456 };
      const event: ParsedEvent = {
        title: "Test Issue",
        body: "Body content",
        raw_content: rawData,
      };

      const result = analyzeContent(event);

      expect(result.raw_content).toEqual(rawData);
    });

    it("should use entire parsedEvent as raw_content if not provided", () => {
      const event: ParsedEvent = {
        title: "Test Issue",
        body: "Body content",
        number: 42,
      };

      const result = analyzeContent(event);

      expect(result.raw_content.title).toBe("Test Issue");
      expect(result.raw_content.body).toBe("Body content");
      expect(result.raw_content.number).toBe(42);
    });
  });

  describe("Request Type Inference", () => {
    it("should infer 'bug' type from bug keywords", () => {
      const event: ParsedEvent = {
        title: "Bug: Application crashes on startup",
        body: "The application crashes when I try to start it.",
      };

      const result = analyzeContent(event);

      expect(result.request_type).toBe("bug");
    });

    it("should infer 'bug' type from error keywords", () => {
      const event: ParsedEvent = {
        title: "Error handling issue",
        body: "Getting an error when processing files.",
      };

      const result = analyzeContent(event);

      expect(result.request_type).toBe("bug");
    });

    it("should infer 'feature' type from feature keywords", () => {
      const event: ParsedEvent = {
        title: "Feature request: Add dark mode",
        body: "Please add support for dark mode in the UI.",
      };

      const result = analyzeContent(event);

      expect(result.request_type).toBe("feature");
    });

    it("should infer 'enhancement' type from enhance keywords", () => {
      const event: ParsedEvent = {
        title: "Enhance performance",
        body: "We should optimize the database queries.",
      };

      const result = analyzeContent(event);

      expect(result.request_type).toBe("enhancement");
    });

    it("should infer 'docs' type from documentation keywords", () => {
      const event: ParsedEvent = {
        title: "Documentation: Add API guide",
        body: "We need to document the REST API endpoints.",
      };

      const result = analyzeContent(event);

      expect(result.request_type).toBe("docs");
    });

    it("should return 'unknown' for unrecognized types", () => {
      const event: ParsedEvent = {
        title: "Some random issue",
        body: "This is just a random issue without clear type indicators.",
      };

      const result = analyzeContent(event);

      expect(result.request_type).toBe("unknown");
    });

    it("should prioritize bug over other types", () => {
      const event: ParsedEvent = {
        title: "Bug: Feature request has error",
        body: "There is a bug in the feature implementation.",
      };

      const result = analyzeContent(event);

      expect(result.request_type).toBe("bug");
    });
  });

  describe("Link Extraction", () => {
    it("should extract HTTP/HTTPS links from body", () => {
      const event: ParsedEvent = {
        title: "Test Issue",
        body: "Check this out: https://example.com and https://github.com/user/repo",
      };

      const result = analyzeContent(event);

      expect(result.extracted_links).toContain("https://example.com");
      expect(result.extracted_links).toContain("https://github.com/user/repo");
    });

    it("should extract unique links only", () => {
      const event: ParsedEvent = {
        title: "Test Issue",
        body: "Visit https://example.com and https://example.com again",
      };

      const result = analyzeContent(event);

      expect(result.extracted_links).toHaveLength(1);
      expect(result.extracted_links[0]).toBe("https://example.com");
    });

    it("should handle content without links", () => {
      const event: ParsedEvent = {
        title: "Test Issue",
        body: "This is content without any links.",
      };

      const result = analyzeContent(event);

      expect(result.extracted_links).toHaveLength(0);
    });

    it("should extract links with query parameters", () => {
      const event: ParsedEvent = {
        title: "Test Issue",
        body: "See https://example.com/path?key=value&foo=bar for details",
      };

      const result = analyzeContent(event);

      expect(result.extracted_links.length).toBeGreaterThan(0);
      expect(result.extracted_links[0]).toContain("https://example.com");
    });
  });

  describe("Code Block Extraction", () => {
    it("should extract code blocks with language specification", () => {
      const event: ParsedEvent = {
        title: "Test Issue",
        body: "Here is my code:\n\n```javascript\nconst x = 42;\nconsole.log(x);\n```",
      };

      const result = analyzeContent(event);

      expect(result.code_blocks).toHaveLength(1);
      expect(result.code_blocks[0].language).toBe("javascript");
      expect(result.code_blocks[0].content).toBe(
        "const x = 42;\nconsole.log(x);"
      );
    });

    it("should extract code blocks without language specification", () => {
      const event: ParsedEvent = {
        title: "Test Issue",
        body: "Here is my code:\n\n```\nplain text code\n```",
      };

      const result = analyzeContent(event);

      expect(result.code_blocks).toHaveLength(1);
      expect(result.code_blocks[0].language).toBe("text");
      expect(result.code_blocks[0].content).toBe("plain text code");
    });

    it("should extract multiple code blocks", () => {
      const event: ParsedEvent = {
        title: "Test Issue",
        body: "First:\n\n```python\nprint('hello')\n```\n\nSecond:\n\n```javascript\nconsole.log('hello');\n```",
      };

      const result = analyzeContent(event);

      expect(result.code_blocks).toHaveLength(2);
      expect(result.code_blocks[0].language).toBe("python");
      expect(result.code_blocks[1].language).toBe("javascript");
    });

    it("should handle content without code blocks", () => {
      const event: ParsedEvent = {
        title: "Test Issue",
        body: "This is just regular text without code blocks.",
      };

      const result = analyzeContent(event);

      expect(result.code_blocks).toHaveLength(0);
    });

    it("should trim whitespace in code blocks", () => {
      const event: ParsedEvent = {
        title: "Test Issue",
        body: "```javascript\n  const x = 42;\n  console.log(x);\n```",
      };

      const result = analyzeContent(event);

      expect(result.code_blocks[0].content).toBe(
        "const x = 42;\n  console.log(x);"
      );
    });
  });

  describe("Metadata Handling", () => {
    it("should include issue metadata when available", () => {
      const event: ParsedEvent = {
        title: "Test Issue",
        body: "Content",
        number: 42,
        user: { login: "testuser" },
        html_url: "https://github.com/test/repo/issues/42",
        labels: [{ name: "bug" }, { name: "critical" }],
      };

      const result = analyzeContent(event);

      expect(result.metadata.issue_number).toBe(42);
      expect(result.metadata.author).toBe("testuser");
      expect(result.metadata.issue_url).toBe(
        "https://github.com/test/repo/issues/42"
      );
      expect(result.metadata.label_count).toBe(2);
    });

    it("should handle missing metadata gracefully", () => {
      const event: ParsedEvent = {
        title: "Test Issue",
        body: "Content",
      };

      const result = analyzeContent(event);

      expect(result.metadata.issue_number).toBeUndefined();
      expect(result.metadata.author).toBeUndefined();
      expect(result.metadata.issue_url).toBeUndefined();
      expect(result.metadata.label_count).toBe(0);
    });

    it("should count labels correctly", () => {
      const event: ParsedEvent = {
        title: "Test Issue",
        body: "Content",
        labels: [
          { name: "bug" },
          { name: "critical" },
          { name: "ui" },
          { name: "backend" },
        ],
      };

      const result = analyzeContent(event);

      expect(result.metadata.label_count).toBe(4);
    });
  });

  describe("Integration Tests", () => {
    it("should analyze a complete realistic issue", () => {
      const event: ParsedEvent = {
        title: "Bug: Login form crashes on mobile",
        body: `The login form crashes when accessed on mobile devices.

## Steps to reproduce
1. Open the app on a mobile device
2. Click the login button
3. The form crashes

## Expected behavior
The form should display properly on mobile.

## Environment
- OS: iOS 16
- Browser: Safari
- Device: iPhone 13

See: https://github.com/user/repo/issues/123

\`\`\`javascript
const form = document.getElementById('login');
form.addEventListener('submit', handleLogin);
\`\`\``,
        number: 123,
        user: { login: "reporter" },
        html_url: "https://github.com/test/repo/issues/123",
        labels: [{ name: "bug" }, { name: "mobile" }, { name: "critical" }],
      };

      const result = analyzeContent(event);

      expect(result.title).toBe("Bug: Login form crashes on mobile");
      expect(result.request_type).toBe("bug");
      expect(result.description.length).toBeLessThanOrEqual(503);
      expect(result.extracted_links).toContain(
        "https://github.com/user/repo/issues/123"
      );
      expect(result.code_blocks).toHaveLength(1);
      expect(result.code_blocks[0].language).toBe("javascript");
      expect(result.metadata.issue_number).toBe(123);
      expect(result.metadata.author).toBe("reporter");
      expect(result.metadata.label_count).toBe(3);
    });

    it("should return structured AnalyzedContent object", () => {
      const event: ParsedEvent = {
        title: "Feature request",
        body: "Add new feature",
      };

      const result = analyzeContent(event);

      // Verify all required fields exist
      expect(result).toHaveProperty("title");
      expect(result).toHaveProperty("description");
      expect(result).toHaveProperty("raw_content");
      expect(result).toHaveProperty("request_type");
      expect(result).toHaveProperty("extracted_links");
      expect(result).toHaveProperty("code_blocks");
      expect(result).toHaveProperty("metadata");
    });
  });

  describe("Multi-line Content Handling", () => {
    it("should preserve formatting in description", () => {
      const event: ParsedEvent = {
        title: "Test Issue",
        body: `Line 1
Line 2
Line 3

Second paragraph`,
      };

      const result = analyzeContent(event);

      expect(result.description).toContain("Line 1");
      expect(result.description).toContain("Line 2");
      expect(result.description).toContain("Line 3");
    });

    it("should handle content with special characters", () => {
      const event: ParsedEvent = {
        title: "Test Issue",
        body: "Content with special chars: @#$%^&*() and émojis 🚀",
      };

      const result = analyzeContent(event);

      expect(result.description).toContain("special chars");
      expect(result.description).toContain("🚀");
    });
  });
});
