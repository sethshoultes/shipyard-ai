/**
 * Subprocess agent adapter
 *
 * Executes agent commands and captures output.
 * Uses cross-spawn for cross-platform compatibility.
 * 60-second timeout per risk mitigation.
 */
import spawn from 'cross-spawn';
import { AgentExecutionError } from '../errors.js';
const DEFAULT_TIMEOUT_MS = 60000;
/**
 * Run a subprocess command with input and return the output
 */
export async function runSubprocess(command, input, timeoutMs = DEFAULT_TIMEOUT_MS) {
    return new Promise((resolve) => {
        const [cmd, ...args] = parseCommand(command);
        const child = spawn(cmd, args, {
            shell: true,
            stdio: ['pipe', 'pipe', 'pipe'],
        });
        let stdout = '';
        let stderr = '';
        let timedOut = false;
        let resolved = false;
        const timeout = setTimeout(() => {
            if (!resolved) {
                timedOut = true;
                child.kill('SIGKILL');
            }
        }, timeoutMs);
        if (child.stdout) {
            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });
        }
        if (child.stderr) {
            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });
        }
        if (child.stdin && input) {
            child.stdin.write(input);
            child.stdin.end();
        }
        child.on('error', (error) => {
            if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                resolve({
                    output: `Error: ${error.message}`,
                    exitCode: 1,
                    timedOut: false,
                });
            }
        });
        child.on('close', (code) => {
            if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                const output = stdout || stderr;
                const exitCode = code ?? 1;
                resolve({
                    output: output.trim(),
                    exitCode,
                    timedOut,
                });
            }
        });
    });
}
/**
 * Parse a command string into command and arguments
 */
function parseCommand(command) {
    const parts = [];
    let current = '';
    let inQuote = false;
    let quoteChar = '';
    for (const char of command) {
        if ((char === '"' || char === "'") && !inQuote) {
            inQuote = true;
            quoteChar = char;
        }
        else if (char === quoteChar && inQuote) {
            inQuote = false;
            quoteChar = '';
        }
        else if (char === ' ' && !inQuote) {
            if (current) {
                parts.push(current);
                current = '';
            }
        }
        else {
            current += char;
        }
    }
    if (current) {
        parts.push(current);
    }
    return parts.length > 0 ? parts : [command];
}
/**
 * Validate subprocess result and throw if failed
 */
export function validateSubprocessResult(result) {
    if (result.timedOut) {
        throw new AgentExecutionError('Agent timed out after 60 seconds', 'Ensure your agent responds within the timeout', true);
    }
    if (result.exitCode !== 0) {
        throw new AgentExecutionError(`Agent exited with code ${result.exitCode}`, result.output ? `Output: ${result.output.slice(0, 200)}` : 'No output captured');
    }
}
//# sourceMappingURL=subprocess-adapter.js.map