/**
 * HTTP agent adapter
 *
 * Calls agent endpoints via POST requests.
 * Uses native fetch() with AbortController timeout.
 */
import { AgentExecutionError } from '../errors.js';
const DEFAULT_TIMEOUT_MS = 60000;
/**
 * Run an HTTP POST request to an agent endpoint
 */
export async function runHttp(endpoint, input, timeoutMs = DEFAULT_TIMEOUT_MS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ input }),
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const text = await response.text();
        return {
            output: text.trim(),
            statusCode: response.status,
            timedOut: false,
        };
    }
    catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            return {
                output: '',
                statusCode: 0,
                timedOut: true,
            };
        }
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
            output: `Error: ${errorMessage}`,
            statusCode: 0,
            timedOut: false,
        };
    }
}
/**
 * Validate HTTP result and throw if failed
 */
export function validateHttpResult(result) {
    if (result.timedOut) {
        throw new AgentExecutionError('Agent timed out after 60 seconds', 'Ensure your agent endpoint responds within the timeout', true);
    }
    if (result.statusCode === 0) {
        throw new AgentExecutionError('Failed to connect to agent endpoint', result.output || 'Check that the endpoint is running');
    }
    if (result.statusCode >= 400) {
        throw new AgentExecutionError(`Agent returned status ${result.statusCode}`, result.output.slice(0, 200) || 'No error message in response');
    }
}
//# sourceMappingURL=http-adapter.js.map