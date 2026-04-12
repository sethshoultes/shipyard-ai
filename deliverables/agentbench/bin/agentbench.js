#!/usr/bin/env node

/**
 * AgentBench CLI - Test your AI agents in one command
 *
 * Features:
 * - Human-first output with test results and timing
 * - Structured JSON output for CI/CD integration (--json flag)
 * - Color support (green/red) with terminal detection
 * - Proper exit codes: 0 (all pass), 1 (any fail), 2 (config error)
 * - Help and version flags
 */

const fs = require('fs');
const path = require('path');
const { loadConfig } = require('../src/config');
const { executeAgent } = require('../src/executor');
const { evaluate, batchEvaluateSemantic } = require('../src/evaluators');

const VERSION = '1.0.0';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
  bold: '\x1b[1m'
};

// Check if terminal supports color
const supportsColor = process.stdout.isTTY && process.env.NO_COLOR === undefined;

// Helper function to colorize text
function colorize(text, colorCode) {
  if (!supportsColor) return text;
  return colorCode + text + colors.reset;
}

// Helper function to format timing
function formatTime(ms) {
  return `${ms}ms`;
}

// Helper function to pad text for indentation
function indent(text, spaces = 2) {
  const padding = ' '.repeat(spaces);
  return text.split('\n').map(line => padding + line).join('\n');
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    configFile: null,
    json: false,
    help: false,
    version: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--json') {
      result.json = true;
    } else if (arg === '--help' || arg === '-h') {
      result.help = true;
    } else if (arg === '--version' || arg === '-v') {
      result.version = true;
    } else if (!arg.startsWith('-')) {
      result.configFile = arg;
    }
  }

  return result;
}

// Display help message
function showHelp() {
  console.log(`AgentBench v${VERSION}
Test your AI agents in one command. Replace prayer with proof.

USAGE:
  agentbench [CONFIG_FILE] [OPTIONS]

ARGUMENTS:
  CONFIG_FILE              Path to YAML test configuration file

OPTIONS:
  --json                   Output results as JSON (for CI/CD)
  --help, -h              Show this help message
  --version, -v           Show version number

EXAMPLES:
  agentbench config.yaml
  agentbench config.yaml --json
`);
}

// Display version
function showVersion() {
  console.log(`AgentBench v${VERSION}`);
}

// Format failure details
function formatFailureDetails(expectation, errorMessage) {
  if (!errorMessage) return null;

  const lines = [];
  lines.push(`  ${colorize('└─', colors.dim)} ${errorMessage}`);

  // Add detailed information based on expectation type
  if (expectation.contains && Array.isArray(expectation.contains)) {
    const missing = expectation.contains.filter(term =>
      errorMessage.toLowerCase().includes('expected to contain')
    );
    if (missing.length > 0) {
      lines.push(`  ${colorize('└─', colors.dim)} Missing: "${missing.join('" or "')}"`);
    }
  }

  return lines.join('\n');
}

// Run all tests and collect results
async function runTests(config, jsonMode) {
  const results = {
    configFile: config.name,
    agentConfig: {
      type: config.agent.command ? 'command' : 'endpoint',
      value: config.agent.command || config.agent.endpoint
    },
    tests: [],
    summary: {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0,
      totalTime: 0
    }
  };

  const startTimeGlobal = Date.now();

  // Collect all semantic checks that need batching
  const semanticChecks = [];
  const semanticCheckMap = []; // Map back to test index and expectation

  // First pass: execute all agents
  for (let testIndex = 0; testIndex < config.tests.length; testIndex++) {
    const test = config.tests[testIndex];
    const testStartTime = Date.now();
    const execution = await executeAgent(config.agent, test.input);
    const executionTime = Date.now() - testStartTime;

    results.tests[testIndex] = {
      name: test.name,
      passed: false,
      failed: false,
      skipped: false,
      time: executionTime,
      expectations: []
    };

    // Handle execution error
    if (execution.error) {
      results.tests[testIndex].error = execution.error;
      results.tests[testIndex].failed = true;
      results.summary.failed++;
      results.summary.total++;
      continue;
    }

    // Evaluate each expectation
    for (let expIndex = 0; expIndex < test.expect.length; expIndex++) {
      const expectation = test.expect[expIndex];

      // Check if this is a semantic check that needs batching
      if (expectation.matches_intent) {
        semanticChecks.push({
          output: execution.output,
          expectation: expectation.matches_intent
        });
        semanticCheckMap.push({
          testIndex,
          expIndex,
          expectation
        });
      }

      results.tests[testIndex].expectations[expIndex] = {
        type: Object.keys(expectation)[0],
        passed: false,
        skipped: false,
        error: null
      };
    }
  }

  // Second pass: batch evaluate semantic checks if any
  if (semanticChecks.length > 0) {
    const semanticResults = await batchEvaluateSemantic(semanticChecks);
    for (let i = 0; i < semanticResults.length; i++) {
      const result = semanticResults[i];
      const { testIndex, expIndex, expectation } = semanticCheckMap[i];
      results.tests[testIndex].expectations[expIndex].passed = result.passed;
      results.tests[testIndex].expectations[expIndex].skipped = result.skipped;
      results.tests[testIndex].expectations[expIndex].error = result.error;
    }
  }

  // Third pass: evaluate string-based checks and finalize results
  for (let testIndex = 0; testIndex < config.tests.length; testIndex++) {
    const test = config.tests[testIndex];
    const testResult = results.tests[testIndex];

    if (testResult.error) {
      // Already handled in first pass
      continue;
    }

    const execution = await executeAgent(config.agent, test.input);

    let testPassed = true;
    let hasSkipped = false;

    for (let expIndex = 0; expIndex < test.expect.length; expIndex++) {
      const expectation = test.expect[expIndex];

      // Skip if already evaluated in semantic pass
      if (expectation.matches_intent) {
        const expResult = testResult.expectations[expIndex];
        if (!expResult.passed && !expResult.skipped) {
          testPassed = false;
        }
        if (expResult.skipped) {
          hasSkipped = true;
        }
        continue;
      }

      // Evaluate string-based checks
      const evalResult = evaluate(execution.output, expectation);
      testResult.expectations[expIndex].passed = evalResult.passed;
      testResult.expectations[expIndex].error = evalResult.error;

      if (!evalResult.passed) {
        testPassed = false;
      }
    }

    testResult.passed = testPassed && !hasSkipped;
    testResult.failed = !testPassed;
    testResult.skipped = hasSkipped && testPassed;

    if (testResult.passed) {
      results.summary.passed++;
    } else if (testResult.skipped) {
      results.summary.skipped++;
    } else {
      results.summary.failed++;
    }
    results.summary.total++;
  }

  results.summary.totalTime = Date.now() - startTimeGlobal;
  return results;
}

// Format human-readable output
function formatHumanOutput(results) {
  const lines = [];

  // Header
  lines.push(colorize(`AgentBench v${VERSION}`, colors.bold));
  lines.push(`Running: ${results.configFile}\n`);

  // Test results
  for (const test of results.tests) {
    let statusSymbol;
    if (test.failed) {
      statusSymbol = colorize('✗', colors.red);
    } else if (test.skipped) {
      statusSymbol = colorize('⊘', colors.dim);
    } else {
      statusSymbol = colorize('✓', colors.green);
    }

    lines.push(`${statusSymbol} ${test.name} (${formatTime(test.time)})`);

    // Show failure details
    if (test.failed) {
      for (let i = 0; i < test.expectations.length; i++) {
        const exp = test.expectations[i];
        if (!exp.passed && exp.error) {
          lines.push(`  ${colorize('└─', colors.dim)} ${exp.error}`);
        }
      }
    }

    // Show execution error if any
    if (test.error) {
      lines.push(`  ${colorize('└─', colors.dim)} Execution error: ${test.error}`);
    }
  }

  lines.push('');

  // Summary
  const summaryStr = `Results: ${colorize(results.summary.passed + ' passed', colors.green)}, ${colorize(results.summary.failed + ' failed', colors.red)}`;
  if (results.summary.skipped > 0) {
    lines.push(`${summaryStr}, ${colorize(results.summary.skipped + ' skipped', colors.dim)}`);
  } else {
    lines.push(summaryStr);
  }

  lines.push(`Total time: ${formatTime(results.summary.totalTime)}`);

  return lines.join('\n');
}

// Format JSON output
function formatJsonOutput(results) {
  return JSON.stringify(results, null, 2);
}

// Determine exit code
function getExitCode(results) {
  if (results.summary.failed > 0) {
    return 1;
  }
  return 0;
}

// Main entry point
async function main() {
  const args = parseArgs();

  // Handle special flags
  if (args.help) {
    showHelp();
    process.exit(0);
  }

  if (args.version) {
    showVersion();
    process.exit(0);
  }

  // Validate config file argument
  if (!args.configFile) {
    console.error(colorize('Error: No configuration file specified', colors.red));
    console.error('Use --help for usage information');
    process.exit(2);
  }

  // Resolve config file path
  const configPath = path.resolve(args.configFile);

  // Load configuration
  let config;
  try {
    config = loadConfig(configPath);
  } catch (error) {
    if (args.json) {
      console.log(JSON.stringify({
        error: error.message,
        configFile: args.configFile
      }, null, 2));
    } else {
      console.error(colorize(`Error: ${error.message}`, colors.red));
    }
    process.exit(2);
  }

  // Run tests
  let results;
  try {
    results = await runTests(config, args.json);
  } catch (error) {
    if (args.json) {
      console.log(JSON.stringify({
        error: error.message,
        configFile: args.configFile
      }, null, 2));
    } else {
      console.error(colorize(`Error: ${error.message}`, colors.red));
    }
    process.exit(2);
  }

  // Output results
  if (args.json) {
    console.log(formatJsonOutput(results));
  } else {
    console.log(formatHumanOutput(results));
  }

  // Exit with appropriate code
  process.exit(getExitCode(results));
}

// Run main function
main().catch(error => {
  console.error(colorize(`Fatal error: ${error.message}`, colors.red));
  process.exit(2);
});
