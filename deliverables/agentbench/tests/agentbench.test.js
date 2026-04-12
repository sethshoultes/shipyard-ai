import { describe, it, expect, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { loadConfig } = require('../src/config');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('YAML Config Loader', () => {
  const tempFile = path.join(__dirname, '../examples/invalid-test.yaml');

  afterAll(() => {
    // Cleanup temp file if it exists
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  });

  it('should load a valid config file successfully', () => {
    const config = loadConfig(path.join(__dirname, '../examples/test-config.yaml'));

    expect(config).toBeDefined();
    expect(config.name).toBeDefined();
    expect(config.agent).toBeDefined();
    expect(config.agent.command).toBeDefined();
    expect(config.version).toBeDefined();
    expect(config.tests).toBeInstanceOf(Array);
    expect(config.tests.length).toBeGreaterThan(0);
  });

  it('should have valid test structure in config', () => {
    const config = loadConfig(path.join(__dirname, '../examples/test-config.yaml'));

    config.tests.forEach((test, i) => {
      expect(test.name).toBeDefined();
      expect(test.expect).toBeInstanceOf(Array);
      expect(test.expect.length).toBeGreaterThan(0);
    });
  });

  it('should throw error for missing file', () => {
    expect(() => {
      loadConfig(path.join(__dirname, '../examples/nonexistent.yaml'));
    }).toThrow();
  });

  it('should throw error for invalid YAML', () => {
    fs.writeFileSync(tempFile, 'invalid: yaml: content: [');

    expect(() => {
      loadConfig(tempFile);
    }).toThrow();
  });
});
