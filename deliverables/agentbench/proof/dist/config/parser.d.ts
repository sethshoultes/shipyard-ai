/**
 * YAML config parser with validation
 *
 * Parses proof.yaml files and validates against expected schema.
 */
import { TestConfig } from './schema.js';
/**
 * Parse a YAML config file and return validated TestConfig
 */
export declare function parseConfig(filePath: string): Promise<TestConfig>;
//# sourceMappingURL=parser.d.ts.map