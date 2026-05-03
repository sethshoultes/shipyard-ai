import { test, describe } from "node:test";
import assert from "node:assert";
import { apps, type AppEntry } from "../portfolio";

describe("Portfolio Data Validation", () => {
  test("should have exactly 3 app entries", () => {
    assert.strictEqual(apps.length, 3);
  });

  test("should have all required fields for each app", () => {
    const requiredFields: (keyof AppEntry)[] = [
      "slug",
      "name",
      "tagline",
      "status",
      "github",
      "features",
      "techStack",
      "accent"
    ];

    for (const app of apps) {
      for (const field of requiredFields) {
        assert.ok(field in app, `Missing field '${field}' in app '${app.slug}'`);
        assert.ok(app[field], `Field '${field}' is empty in app '${app.slug}'`);
      }
    }
  });

  test("should have valid GitHub URLs", () => {
    const githubPattern = /^https:\/\/github\.com\/sethshoultes\/shipyard-ai\/tree\/main\/projects\/[a-z-]+$/;

    for (const app of apps) {
      assert.ok(
        githubPattern.test(app.github),
        `Invalid GitHub URL for '${app.slug}': ${app.github}`
      );
    }
  });

  test("should have unique slugs", () => {
    const slugs = apps.map(app => app.slug);
    const uniqueSlugs = new Set(slugs);

    assert.strictEqual(
      slugs.length,
      uniqueSlugs.size,
      "Duplicate slugs found"
    );
  });

  test("should have taglines within length limit", () => {
    const maxLength = 140;

    for (const app of apps) {
      assert.ok(
        app.tagline.length <= maxLength,
        `Tagline for '${app.slug}' exceeds ${maxLength} characters: ${app.tagline.length}`
      );
    }
  });

  test("should have valid status values", () => {
    const validStatuses = ["SHIPPED", "BUILD", "SCAFFOLD"];

    for (const app of apps) {
      assert.ok(
        validStatuses.includes(app.status),
        `Invalid status '${app.status}' for app '${app.slug}'`
      );
    }
  });

  test("should have valid accent colors", () => {
    const validAccents = ["amber", "rose", "teal", "cyan", "lime", "fuchsia"];

    for (const app of apps) {
      assert.ok(
        validAccents.includes(app.accent),
        `Invalid accent '${app.accent}' for app '${app.slug}'`
      );
    }
  });

  test("should have feature arrays with 3-5 items", () => {
    for (const app of apps) {
      assert.ok(
        app.features.length >= 3 && app.features.length <= 5,
        `App '${app.slug}' should have 3-5 features, has ${app.features.length}`
      );
    }
  });

  test("should have non-empty tech stack arrays", () => {
    for (const app of apps) {
      assert.ok(
        app.techStack.length >= 1,
        `App '${app.slug}' should have at least 1 tech stack item`
      );

      for (const tech of app.techStack) {
        assert.ok(tech.trim().length > 0, `Empty tech stack item in '${app.slug}'`);
      }
    }
  });

  test("should contain expected app slugs", () => {
    const expectedSlugs = ["tuned", "promptfolio", "commandbar"];
    const actualSlugs = apps.map(app => app.slug).sort();

    assert.deepStrictEqual(
      actualSlugs,
      expectedSlugs.sort(),
      "App slugs do not match expected list"
    );
  });
});