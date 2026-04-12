import yaml from 'js-yaml';
import fs from 'fs';

function loadConfig(filePath) {
  let fileContents;
  try {
    fileContents = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    throw new Error(`Failed to read config file: ${error.message}`);
  }

  let config;
  try {
    config = yaml.load(fileContents);
  } catch (error) {
    throw new Error(`Failed to parse YAML: ${error.message}`);
  }

  if (!config || typeof config !== 'object') {
    throw new Error('Configuration must be a valid YAML object');
  }

  if (!config.name || typeof config.name !== 'string') {
    throw new Error('Configuration missing or invalid required field: name (must be string)');
  }

  if (!config.agent || typeof config.agent !== 'object') {
    throw new Error('Configuration missing or invalid required field: agent (must be object)');
  }

  const hasCommand = config.agent.command !== undefined;
  const hasEndpoint = config.agent.endpoint !== undefined;

  if (!hasCommand && !hasEndpoint) {
    throw new Error('Agent must have either "command" or "endpoint" field');
  }

  if (hasCommand && typeof config.agent.command !== 'string') {
    throw new Error('Agent field "command" must be a string');
  }

  if (hasEndpoint && typeof config.agent.endpoint !== 'string') {
    throw new Error('Agent field "endpoint" must be a string');
  }

  if (!Array.isArray(config.tests) || config.tests.length === 0) {
    throw new Error('Configuration must have "tests" array with at least one test');
  }

  config.tests.forEach((test, index) => {
    if (!test || typeof test !== 'object') {
      throw new Error(`Test ${index} must be an object`);
    }

    if (!test.name || typeof test.name !== 'string') {
      throw new Error(`Test ${index} missing or invalid required field: name (must be string)`);
    }

    if (!test.input || typeof test.input !== 'string') {
      throw new Error(`Test ${index} (${test.name}) missing or invalid required field: input (must be string)`);
    }

    if (!Array.isArray(test.expect) || test.expect.length === 0) {
      throw new Error(`Test ${index} (${test.name}) must have "expect" array with at least one expectation`);
    }

    test.expect.forEach((expectation, expIndex) => {
      if (!expectation || typeof expectation !== 'object') {
        throw new Error(`Test ${index} expectation ${expIndex} must be an object`);
      }

      const hasContains = expectation.contains !== undefined;
      const hasDoesNotContain = expectation.does_not_contain !== undefined;
      const hasMatchesIntent = expectation.matches_intent !== undefined;

      if (!hasContains && !hasDoesNotContain && !hasMatchesIntent) {
        throw new Error(`Test ${index} expectation ${expIndex} must have "contains", "does_not_contain", or "matches_intent"`);
      }

      if (hasContains) {
        const c = expectation.contains;
        if (typeof c !== 'string' && !Array.isArray(c)) {
          throw new Error(`Test ${index} expectation ${expIndex} "contains" must be a string or array`);
        }
        if (Array.isArray(c) && !c.every(item => typeof item === 'string')) {
          throw new Error(`Test ${index} expectation ${expIndex} "contains" array items must be strings`);
        }
      }

      if (hasDoesNotContain) {
        const d = expectation.does_not_contain;
        if (typeof d !== 'string' && !Array.isArray(d)) {
          throw new Error(`Test ${index} expectation ${expIndex} "does_not_contain" must be a string or array`);
        }
        if (Array.isArray(d) && !d.every(item => typeof item === 'string')) {
          throw new Error(`Test ${index} expectation ${expIndex} "does_not_contain" array items must be strings`);
        }
      }

      if (hasMatchesIntent && typeof expectation.matches_intent !== 'string') {
        throw new Error(`Test ${index} expectation ${expIndex} "matches_intent" must be a string`);
      }
    });
  });

  if (config.version !== undefined && typeof config.version !== 'number') {
    throw new Error('Configuration field "version" must be a number');
  }

  return config;
}

export { loadConfig };
