import { createInterface, Interface } from 'readline';

/**
 * Prompt user for text input with optional default value
 */
export function promptText(
  rl: Interface,
  question: string,
  defaultValue: string = ''
): Promise<string> {
  return new Promise((resolve) => {
    const prompt = defaultValue ? `${question} (${defaultValue}): ` : `${question}: `;
    rl.question(prompt, (answer) => {
      resolve(answer || defaultValue);
    });
  });
}

/**
 * Prompt user for yes/no question with optional default value
 * Returns true for 'y/yes', false for 'n/no'
 */
export function promptBoolean(
  rl: Interface,
  question: string,
  defaultValue: boolean = true
): Promise<boolean> {
  return new Promise((resolve) => {
    const defaultStr = defaultValue ? 'Y/n' : 'y/N';
    const prompt = `${question} [${defaultStr}] `;

    rl.question(prompt, (answer) => {
      const trimmed = answer.toLowerCase().trim();

      // Handle empty input (use default)
      if (!trimmed) {
        resolve(defaultValue);
        return;
      }

      // Explicit yes/no
      resolve(trimmed.startsWith('y'));
    });
  });
}

/**
 * Create readline interface
 */
export function createReadlineInterface(): Interface {
  return createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

/**
 * Close readline interface
 */
export function closeReadlineInterface(rl: Interface): void {
  rl.close();
}
