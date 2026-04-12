/**
 * Evaluators module for AgentBench
 *
 * Implements two evaluation strategies:
 * 1. String-based evaluators: contains, does_not_contain (default, fast)
 * 2. Semantic evaluators: matches_intent via Claude API (opt-in, batched)
 *
 * Design decisions (per decisions.md #3, #6):
 * - String matching is default for speed (<100ms per test)
 * - LLM evaluation is opt-in via matches_intent
 * - All semantic checks batched into single API call for cost/latency
 * - Graceful degradation: LLM unavailable = skipped (not failed)
 * - Binary pass/fail only (no confidence scores in v1)
 */

const fetch = globalThis.fetch || require('node-fetch');

/**
 * contains - Case-insensitive substring match
 * @param {string} output - Agent output to check
 * @param {string|string[]} expected - Substring(s) to find
 * @returns {{ passed: boolean, error: string|null, skipped: false }}
 */
function contains(output, expected) {
  const searchTerms = Array.isArray(expected) ? expected : [expected];
  const found = searchTerms.some(term =>
    output.toLowerCase().includes(term.toLowerCase())
  );
  return {
    passed: found,
    error: found ? null : `Expected to contain: ${Array.isArray(expected) ? expected.join(' or ') : expected}`,
    skipped: false
  };
}

/**
 * doesNotContain - Substring exclusion check
 * @param {string} output - Agent output to check
 * @param {string|string[]} forbidden - Substring(s) that must not be present
 * @returns {{ passed: boolean, error: string|null, skipped: false }}
 */
function doesNotContain(output, forbidden) {
  const forbiddenTerms = Array.isArray(forbidden) ? forbidden : [forbidden];
  const found = forbiddenTerms.find(term =>
    output.toLowerCase().includes(term.toLowerCase())
  );
  return {
    passed: !found,
    error: found ? `Expected not to contain: ${found}` : null,
    skipped: false
  };
}

/**
 * Helper: Call Claude API via Anthropic SDK
 * @param {string} apiKey - Anthropic API key from ANTHROPIC_API_KEY env var
 * @param {string} prompt - Prompt to send to Claude
 * @param {number} maxTokens - Max tokens in response (default 500)
 * @returns {Promise<string>} - Claude's response text
 */
async function callClaude(apiKey, prompt, maxTokens = 500) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'content-type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5-20251101',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  if (!response.ok) throw new Error(`Claude API error: ${response.status}`);
  return (await response.json()).content[0].text;
}

/**
 * batchEvaluateSemantic - Batch all semantic checks into one Claude API call
 *
 * This is the core LLM evaluation function. It:
 * - Takes array of {output, expectation} pairs
 * - Sends all to Claude in one call (cost/latency optimization)
 * - Returns { passed, error, skipped } for each check
 * - Handles missing API key gracefully: marks as skipped
 * - Handles API errors gracefully: marks as skipped, not failed
 *
 * @param {Array<{output: string, expectation: string}>} checks - Intents to evaluate
 * @returns {Promise<Array<{passed: boolean, error: null, skipped: boolean}>>}
 */
async function batchEvaluateSemantic(checks) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return checks.map(() => ({ passed: false, error: null, skipped: true }));
  }

  const checksList = checks.map((c, i) =>
    `Check ${i + 1}:\nOutput: "${c.output}"\nIntent: "${c.expectation}"`
  ).join('\n\n');

  const prompt = `Evaluate whether agent outputs match intents. Respond with ONLY:
[{"check": 1, "match": true}, {"check": 2, "match": false}]

${checksList}`;

  try {
    const responseText = await callClaude(apiKey, prompt);
    let jsonText = responseText;
    if (responseText.includes('```')) {
      const m = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (m) jsonText = m[1].trim();
    }
    const results = JSON.parse(jsonText);
    return results.map(r => ({ passed: r.match === true, error: null, skipped: false }));
  } catch (error) {
    return checks.map(() => ({ passed: false, error: null, skipped: true }));
  }
}

/**
 * evaluate - Main evaluator dispatcher
 * Routes to appropriate evaluator based on expectation type
 * @param {string} output - Agent output to evaluate
 * @param {object} expectation - Evaluation expectation (contains, does_not_contain, or matches_intent)
 * @returns {{ passed: boolean, error: string|null, skipped: boolean }}
 */
function evaluate(output, expectation) {
  if (expectation.contains) return contains(output, expectation.contains);
  if (expectation.does_not_contain) return doesNotContain(output, expectation.does_not_contain);
  if (expectation.matches_intent) {
    return { passed: false, error: 'Use batchEvaluateSemantic for matches_intent', skipped: false };
  }
  return { passed: false, error: 'Unknown evaluator type', skipped: false };
}

/**
 * evaluateSingleIntent - Optional helper for evaluating a single intent
 * Not used in main batch path, but available for standalone usage
 * @param {string} output - Agent output
 * @param {string} intent - Intent to match against
 * @param {string} apiKey - Anthropic API key
 * @returns {Promise<{passed: boolean, intent: string, error?: string}>}
 */
async function evaluateSingleIntent(output, intent, apiKey) {
  const prompt = `Does this output match the intent "${intent}"? Respond with ONLY "yes" or "no".
Output: "${output}"`;
  try {
    const result = await callClaude(apiKey, prompt, 10);
    return { passed: result.toLowerCase().includes('yes'), intent };
  } catch {
    return { passed: false, intent, error: 'API error' };
  }
}

module.exports = {
  contains,
  doesNotContain,
  evaluate,
  batchEvaluateSemantic,
  evaluateSingleIntent
};
