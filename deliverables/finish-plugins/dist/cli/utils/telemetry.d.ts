/**
 * Anonymous Telemetry
 * Sends install events for analytics (no PII collected)
 */
export interface TelemetryEvent {
    theme: string;
    version: string;
    os: string;
    timestamp: string;
}
/**
 * Sends anonymous telemetry event
 * Fails silently to not interrupt the install flow
 */
export declare function sendTelemetry(event: TelemetryEvent): Promise<void>;
