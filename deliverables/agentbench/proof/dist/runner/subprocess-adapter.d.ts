/**
 * Subprocess agent adapter
 *
 * Executes agent commands and captures output.
 * Uses cross-spawn for cross-platform compatibility.
 * 60-second timeout per risk mitigation.
 */
export interface SubprocessResult {
    output: string;
    exitCode: number;
    timedOut: boolean;
}
/**
 * Run a subprocess command with input and return the output
 */
export declare function runSubprocess(command: string, input: string, timeoutMs?: number): Promise<SubprocessResult>;
/**
 * Validate subprocess result and throw if failed
 */
export declare function validateSubprocessResult(result: SubprocessResult): void;
//# sourceMappingURL=subprocess-adapter.d.ts.map