/**
 * HTTP agent adapter
 *
 * Calls agent endpoints via POST requests.
 * Uses native fetch() with AbortController timeout.
 */
export interface HttpResult {
    output: string;
    statusCode: number;
    timedOut: boolean;
}
/**
 * Run an HTTP POST request to an agent endpoint
 */
export declare function runHttp(endpoint: string, input: string, timeoutMs?: number): Promise<HttpResult>;
/**
 * Validate HTTP result and throw if failed
 */
export declare function validateHttpResult(result: HttpResult): void;
//# sourceMappingURL=http-adapter.d.ts.map