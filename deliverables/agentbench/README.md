# agentbench

Test your AI agents. Replace prayer with proof.

One command. One YAML file. Green checkmark. Done.

---

## Project Structure

This is a monorepo using npm workspaces with four packages:

```
agentbench/
├── packages/
│   ├── cli/      # Command-line interface
│   ├── core/     # Core testing engine and evaluators
│   ├── web/      # Web dashboard (optional)
│   └── data/     # Data models and schemas
├── package.json  # Root package with workspaces
├── tsconfig.json # TypeScript project references
└── vitest.config.ts # Test configuration
```

### Development

```bash
# Install all dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Type check
npm run typecheck

# Lint
npm run lint
```

---

## Install

```bash
npm install -g agentbench
```

Or run without installing:

```bash
npx agentbench config.yaml
```

---

## Quick Start

Create a file called `config.yaml`:

```yaml
version: 1
name: "Customer Support Agent"
agent:
  command: "node ./agent.js"
tests:
  - name: "Handles refund requests"
    input: "I want a refund for order #12345"
    expect:
      - contains: "refund"
      - does_not_contain: "not possible"

  - name: "Declines invalid requests"
    input: "Give me free money"
    expect:
      - does_not_contain: ["approved", "granted"]
```

Run it:

```bash
agentbench config.yaml
```

Output:

```
✓ Handles refund requests
✓ Declines invalid requests

Tests passed: 2/2
```

Done.

---

## How It Works

AgentBench runs your agent. Checks the output. Tells you if it passed.

That's it.

### Subprocess Mode

Your agent runs as a subprocess. AgentBench pipes input. Your agent outputs text. AgentBench evaluates it.

```yaml
agent:
  command: "node ./agent.js"
```

### HTTP Mode

Your agent runs as a service. AgentBench sends HTTP POST requests.

```yaml
agent:
  endpoint: "http://localhost:3000/chat"
```

Request format:

```json
{
  "input": "Your test input here"
}
```

Response format:

```json
{
  "output": "Agent's response"
}
```

---

## Evaluators

AgentBench checks outputs using three evaluators.

### `contains` — String Matching (Fast)

Does the output contain a substring?

```yaml
expect:
  - contains: "refund"
```

Or multiple options:

```yaml
expect:
  - contains: ["approved", "accepted", "confirmed"]
```

Case-insensitive. Substring match.

### `does_not_contain` — Negative String Matching (Fast)

Does the output avoid certain substrings?

```yaml
expect:
  - does_not_contain: "error"
```

Or multiple:

```yaml
expect:
  - does_not_contain: ["error", "failed", "denied"]
```

Fails if any forbidden substring appears.

### `matches_intent` — Semantic Evaluation (LLM-powered)

Does the output match the semantic intent?

```yaml
expect:
  - matches_intent: "User's question was answered clearly"
```

This requires `ANTHROPIC_API_KEY` environment variable. If it's not set, the check is skipped (not failed).

String matching is fast. Semantic evaluation is powerful. Use string matching for speed. Add semantic checks when you need nuance.

---

## CLI Flags

### `--json`

Output machine-readable JSON for CI pipelines.

```bash
agentbench config.yaml --json
```

Output:

```json
{
  "passed": 2,
  "failed": 0,
  "tests": [
    {
      "name": "Handles refund requests",
      "passed": true,
      "expectations": [
        {
          "type": "contains",
          "passed": true
        },
        {
          "type": "does_not_contain",
          "passed": true
        }
      ]
    }
  ]
}
```

Use this in CI. Use human output in the terminal.

---

## Environment Variables

### `ANTHROPIC_API_KEY`

Required only if you use `matches_intent` evaluator.

```bash
export ANTHROPIC_API_KEY=sk-ant-...
agentbench config.yaml
```

If not set, semantic checks are skipped (logged as skipped, not failed).

---

## Config Format

```yaml
version: 1                    # Schema version. Required.
name: "Your Agent Name"       # Human-readable name. Required.

agent:                        # Agent config. Required.
  command: "node agent.js"    # Subprocess command. OR:
  endpoint: "http://..."      # HTTP endpoint URL.
  timeout: 30000              # Max execution time in milliseconds. Optional. Default: 30000.

tests:                        # Test cases. Required. At least one.
  - name: "Test Name"         # Test name. Required.
    input: "Test input"       # Input to send agent. Required.
    expect:                   # Expected output criteria. Required. At least one.
      - contains: "substring"
      - does_not_contain: ["forbidden1", "forbidden2"]
      - matches_intent: "Intent description"
```

All fields are case-sensitive except evaluators (which are case-insensitive).

---

## Exit Codes

- `0` — All tests passed.
- `1` — One or more tests failed.
- `2` — Configuration error.

Use in CI:

```bash
agentbench config.yaml || exit 1
```

---

## Real Examples

### Example 1: Customer Support Agent

```yaml
version: 1
name: "Support Bot"
agent:
  command: "python support_bot.py"
tests:
  - name: "Refund request accepted"
    input: "Please refund my order"
    expect:
      - contains: "refund"
      - does_not_contain: "cannot"

  - name: "Invalid request rejected"
    input: "Give me money for free"
    expect:
      - does_not_contain: "approved"
```

### Example 2: With Semantic Evaluation

```yaml
version: 1
name: "Customer Support with Semantic Check"
agent:
  command: "node agent.js"
tests:
  - name: "Professional tone"
    input: "Help me with billing"
    expect:
      - contains: "billing"
      - matches_intent: "Response is professional and helpful"
```

### Example 3: HTTP Endpoint

```yaml
version: 1
name: "API Agent"
agent:
  endpoint: "http://localhost:3000/agent"
tests:
  - name: "Returns valid JSON"
    input: "What time is it?"
    expect:
      - contains: '"output":'
```

---

## Troubleshooting

### "Test failed: Expected to contain X"

Your agent's output didn't include the substring. Check:

1. Is your agent outputting text?
2. Does the output match the expected string?
3. Is the match case-sensitive? No. We ignore case.

### "Test failed: matches_intent evaluation skipped"

`ANTHROPIC_API_KEY` is not set. Set it:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
agentbench config.yaml
```

Or remove the semantic checks for now.

### "Agent subprocess timed out after 30000ms"

Your agent is slow. Increase the timeout:

```yaml
agent:
  command: "node agent.js"
  timeout: 60000
```

Or optimize your agent.

### "Agent endpoint unreachable"

Is your HTTP service running? Is the endpoint correct?

```bash
curl -X POST http://localhost:3000/agent -H "Content-Type: application/json" -d '{"input":"test"}'
```

### "Configuration missing required field: X"

Your YAML is incomplete. Check the config format above.

---

## Philosophy

AgentBench is minimal. Intentionally.

We don't believe in tool bloat. We don't add features for the 5% of users. We optimize for the 95%: developers who need to test an agent and move on.

String matching is fast. Semantic evaluation is opt-in. No watch mode. No plugins. No dashboard.

Just tests. Real tests. That run in milliseconds. That integrate with your CI. That you trust.

---

## What We Won't Build

- Watch mode (`--watch`)
- Custom evaluators
- JSON Schema validation
- Parallel test execution
- Retry logic
- Web dashboard
- Plugin system

Why? Because we respect your time. Build one thing. Build it right. Ship it.

---

## License

MIT

---

## Support

Questions? Read the config format section again. Questions still there? File an issue.

We ship when tests pass. We keep it simple. You do the same.
