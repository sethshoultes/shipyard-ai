#!/usr/bin/env node
/**
 * Proof - Test your AI agents with confidence
 *
 * CLI entry point
 */
import { main } from './cli/run.js';
main().catch((error) => {
    console.error(error);
    process.exit(2);
});
//# sourceMappingURL=index.js.map