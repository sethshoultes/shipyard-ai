/**
 * Anonymous Telemetry
 * Sends install events for analytics (no PII collected)
 */
const TELEMETRY_ENDPOINT = 'https://api.wardrobe.shipyard.company/telemetry';
const TELEMETRY_TIMEOUT = 3000; // 3 seconds
/**
 * Sends anonymous telemetry event
 * Fails silently to not interrupt the install flow
 */
export async function sendTelemetry(event) {
    // Check for opt-out
    if (process.env.WARDROBE_TELEMETRY === 'false') {
        return;
    }
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), TELEMETRY_TIMEOUT);
        await fetch(TELEMETRY_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event: 'install',
                theme: event.theme,
                version: event.version,
                os: event.os,
                timestamp: event.timestamp,
                // Note: Country/region is derived from IP on the server side
                // No PII is collected by the client
            }),
            signal: controller.signal,
        });
        clearTimeout(timeout);
    }
    catch {
        // Silently ignore telemetry failures
        // User experience is more important than analytics
    }
}
