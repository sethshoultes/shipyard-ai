# AgentBench Error Reference

This document provides a complete reference for all AgentBench errors. Our error system is designed following the principle: **"The moment of failure must teach - not punish."**

Every error includes:
- A clear error code and message
- An actionable suggestion for resolution
- Contextual details to aid debugging

## Error Categories

AgentBench errors are organized into six categories:

| Category | Description | Common Causes |
|----------|-------------|---------------|
| `AGENT_ERROR` | Agent failed to respond | Crashes, empty output, invalid format |
| `TIMEOUT_ERROR` | Agent exceeded time limit | Slow responses, connection delays |
| `VALIDATION_ERROR` | Response format issues | Missing fields, wrong types, bad JSON |
| `SCORING_ERROR` | Evaluation failures | Missing evaluators, API unavailable |
| `SETUP_ERROR` | Configuration problems | Invalid config, missing benchmarks |
| `NETWORK_ERROR` | Connectivity issues | Server down, DNS failures, SSL errors |

---

## Agent Errors

Errors that occur when your agent fails to produce valid output.

### AGENT_NO_RESPONSE

**Message:** Agent did not produce any response

**What it means:** Your agent process completed but didn't write anything to stdout.

**How to fix:**
- Verify your agent writes output to stdout (not stderr)
- Check that your agent doesn't exit before writing output
- Run your agent command manually to verify it produces output

**Example:**
```bash
# Test your agent manually
echo "Hello" | your-agent-command
# Should produce output on stdout
```

### AGENT_CRASHED

**Message:** Agent process terminated unexpectedly

**What it means:** Your agent process exited with a non-zero exit code.

**How to fix:**
- Check your agent's stderr output for error messages
- Look for unhandled exceptions in your code
- Verify all dependencies are installed
- Check for memory issues (out of memory)

**Common exit codes:**
- `1` - General error
- `137` - Out of memory (killed by OS)
- `139` - Segmentation fault

### AGENT_INVALID_OUTPUT

**Message:** Agent produced output that could not be parsed

**What it means:** Your agent wrote output, but AgentBench couldn't understand it.

**How to fix:**
- If JSON is expected, verify your output is valid JSON
- Remove any debug output or logging that might interfere
- Use `JSON.stringify()` or equivalent for structured output

**Example fix:**
```javascript
// Instead of:
console.log("Processing...");
console.log({ result: "done" });

// Do this:
console.log(JSON.stringify({ result: "done" }));
```

### AGENT_EXCEPTION

**Message:** Agent threw an unhandled exception

**What it means:** Your agent raised an exception that wasn't caught.

**How to fix:**
- Add try/catch blocks around your main logic
- Handle edge cases in input processing
- Log exceptions to stderr, not stdout

---

## Timeout Errors

Errors that occur when your agent takes too long.

### TIMEOUT_EXECUTION

**Message:** Agent exceeded the execution time limit

**What it means:** Your agent took longer than the configured timeout to respond.

**How to fix:**
- Reduce context size or prompt complexity
- Optimize expensive operations
- Increase timeout in benchmark config (if appropriate)

**Example config:**
```yaml
agent:
  command: "your-agent"
  timeout: 60000  # Increase to 60 seconds
```

### TIMEOUT_CONNECTION

**Message:** Connection to agent timed out before establishing

**What it means:** AgentBench couldn't connect to your HTTP agent endpoint.

**How to fix:**
- Verify your agent server is running
- Check the endpoint URL is correct
- Ensure no firewall is blocking the connection

### TIMEOUT_RESPONSE

**Message:** Agent connected but response timed out

**What it means:** Your agent accepted the request but took too long to respond.

**How to fix:**
- Your agent might be processing too long
- Consider streaming responses
- Increase timeout or simplify the task

---

## Validation Errors

Errors that occur when your agent's output format is incorrect.

### VALIDATION_MISSING_FIELD

**Message:** Required field missing from response

**What it means:** Your response is missing a field that the benchmark expects.

**How to fix:**
- Check the benchmark's expected output schema
- Ensure all required fields are present
- Verify field names match exactly (case-sensitive)

**Example:**
```json
// Benchmark expects:
{ "action": "string", "result": "object" }

// Your response is missing 'action':
{ "result": { "status": "ok" } }  // ERROR!

// Fixed:
{ "action": "complete", "result": { "status": "ok" } }
```

### VALIDATION_INVALID_TYPE

**Message:** Field has incorrect type

**What it means:** A field exists but has the wrong data type.

**How to fix:**
- Check expected types in the benchmark schema
- Ensure numbers are numbers, not strings
- Verify arrays are arrays, not single values

**Example:**
```json
// Expected: { "count": number }
{ "count": "5" }    // ERROR - string instead of number
{ "count": 5 }      // Correct
```

### VALIDATION_SCHEMA_MISMATCH

**Message:** Response does not match expected schema

**What it means:** Your response structure doesn't match what the benchmark expects.

**How to fix:**
- Review the benchmark's expected output specification
- Compare your output structure against the schema
- Adjust your agent's response format

### VALIDATION_FORMAT_ERROR

**Message:** Response format is invalid

**What it means:** The response couldn't be parsed at all (e.g., malformed JSON).

**How to fix:**
- Validate your output format before sending
- Check for trailing commas in JSON
- Ensure proper quoting and escaping

---

## Scoring Errors

Errors that occur during response evaluation.

### SCORING_EVALUATOR_FAILED

**Message:** Evaluator encountered an error while scoring

**What it means:** The scoring system itself encountered an error.

**How to fix:**
- This is usually a benchmark issue, not your agent
- Check if the evaluator requires special setup
- Report to benchmark maintainers if persistent

### SCORING_NO_MATCHER

**Message:** No matcher found for expected output type

**What it means:** The benchmark specifies an unsupported output type.

**How to fix:**
- Verify the benchmark's `expectedOutput.type` is valid
- Valid types: `exact`, `contains`, `regex`, `semantic`, `tool-call`, `custom`
- Report to benchmark maintainers if invalid

### SCORING_RUBRIC_ERROR

**Message:** Rubric scoring failed

**What it means:** The rubric-based scoring couldn't complete.

**How to fix:**
- Check the benchmark's rubric definition
- Each criterion needs at least two scoring levels
- Report to benchmark maintainers if the rubric is malformed

### SCORING_SEMANTIC_UNAVAILABLE

**Message:** Semantic evaluation is not available

**What it means:** Semantic scoring requires an API key that isn't configured.

**How to fix:**
```bash
# Set the API key for semantic evaluation
export ANTHROPIC_API_KEY="your-api-key"

# Or switch to a non-semantic scoring method in the benchmark
```

---

## Setup Errors

Errors that occur before tests run, during configuration.

### SETUP_INVALID_CONFIG

**Message:** Benchmark configuration is invalid

**What it means:** Your benchmark.yaml or config file has errors.

**How to fix:**
- Run `agentbench validate` to see specific errors
- Check YAML syntax (proper indentation, colons)
- Verify all required fields are present

**Common issues:**
- Missing required fields (`name`, `description`, `prompts`)
- Invalid YAML indentation
- Unsupported configuration options

### SETUP_MISSING_BENCHMARK

**Message:** Specified benchmark not found

**What it means:** The benchmark you requested doesn't exist.

**How to fix:**
```bash
# List available benchmarks
agentbench list

# Check the benchmark name spelling
agentbench run my-benchmark  # Is this spelled correctly?
```

### SETUP_INVALID_AGENT

**Message:** Agent configuration is invalid

**What it means:** Your agent configuration is incomplete or incorrect.

**How to fix:**
- Specify either `command` (for subprocess) OR `endpoint` (for HTTP)
- Don't specify both
- Ensure the command or URL is valid

**Example:**
```yaml
# Subprocess agent:
agent:
  command: "python my_agent.py"

# HTTP agent:
agent:
  endpoint: "http://localhost:3000/agent"
```

### SETUP_MISSING_DEPENDENCY

**Message:** Required dependency is not installed

**What it means:** A package or tool required by the benchmark is missing.

**How to fix:**
- Check the benchmark's requirements
- Install missing dependencies
- For Node.js: `npm install`
- For Python: `pip install -r requirements.txt`

---

## Network Errors

Errors that occur when connecting to HTTP agents.

### NETWORK_UNREACHABLE

**Message:** Agent endpoint is unreachable

**What it means:** Cannot establish any connection to your agent's endpoint.

**How to fix:**
- Verify your agent server is running
- Check the URL is correct (host, port, path)
- Ensure no firewall is blocking connections

### NETWORK_DNS_FAILURE

**Message:** DNS lookup failed for agent endpoint

**What it means:** The hostname in your agent URL couldn't be resolved.

**How to fix:**
- Check for typos in the hostname
- For local development, use `localhost` instead of custom domains
- Verify DNS configuration if using custom domains

### NETWORK_CONNECTION_REFUSED

**Message:** Connection to agent was refused

**What it means:** The server actively refused the connection.

**How to fix:**
- Your agent server isn't running on the expected port
- Start your agent server
- Verify the port number matches your server's configuration

**Debug steps:**
```bash
# Check if something is listening on the port
lsof -i :3000  # or your port number

# Start your agent server if not running
npm start  # or your start command
```

### NETWORK_SSL_ERROR

**Message:** SSL/TLS connection failed

**What it means:** Secure connection couldn't be established.

**How to fix:**
- For local development, use `http://` instead of `https://`
- If using SSL, ensure certificates are valid and not expired
- Check certificate chain is complete

---

## Working with Errors Programmatically

### Catching Specific Error Types

```typescript
import {
  AgentBenchError,
  isTimeoutError,
  isNetworkError,
  ErrorCategory
} from '@agentbench/core/errors';

try {
  await runBenchmark(config);
} catch (error) {
  if (isTimeoutError(error)) {
    console.log('Agent timed out:', error.details);
  } else if (isNetworkError(error)) {
    console.log('Network issue:', error.suggestion);
  } else if (error instanceof AgentBenchError) {
    console.log('AgentBench error:', error.format());
  }
}
```

### Getting Error Suggestions

```typescript
import { getErrorSuggestion, ErrorCode } from '@agentbench/core/errors';

const suggestion = getErrorSuggestion(ErrorCode.TIMEOUT_EXECUTION);
console.log(suggestion);
// "Your agent took too long to respond. Try: reduce context size, simplify prompts, or increase timeout in your config."
```

### Serializing Errors for Logging

```typescript
import { AgentBenchError } from '@agentbench/core/errors';

const error = TimeoutError.execution(45000, 30000);
const json = error.toJSON();
// {
//   name: 'TimeoutError',
//   code: 'TIMEOUT_EXECUTION',
//   category: 'TIMEOUT_ERROR',
//   message: 'Agent exceeded the execution time limit',
//   suggestion: 'Your agent took 45.0s, but the limit is 30.0s...',
//   details: { actualDurationMs: 45000, limitMs: 30000 },
//   recoverable: false,
//   timestamp: '2024-01-15T10:30:00.000Z'
// }
```

---

## Getting Help

If you encounter an error not covered here, or if an error message isn't helpful:

1. **Check the details:** Error details often contain specific information about what went wrong
2. **Run with verbose logging:** Use `--verbose` flag for more context
3. **Validate your config:** Run `agentbench validate` to check configuration
4. **Open an issue:** Report unhelpful errors so we can improve our suggestions

Remember: Every error is an opportunity to learn. Our goal is to help you succeed, not to frustrate you.
