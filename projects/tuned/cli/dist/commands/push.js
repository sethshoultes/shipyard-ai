import { Command } from 'commander';
import fs from 'fs';
import { loadConfig } from '../config.js';
import { createPrompt, createVersion, checkPromptExists, } from '../api.js';
/**
 * Read from stdin (for pipe support)
 */
function readStdin() {
    return new Promise((resolve, reject) => {
        let data = '';
        // Check if stdin is a TTY (interactive terminal)
        if (process.stdin.isTTY) {
            reject(new Error('No content provided. Use -c, -f, or pipe content via stdin.'));
            return;
        }
        process.stdin.setEncoding('utf-8');
        process.stdin.on('data', (chunk) => {
            data += chunk;
        });
        process.stdin.on('end', () => {
            resolve(data);
        });
        process.stdin.on('error', (error) => {
            reject(error);
        });
    });
}
export const pushCommand = new Command()
    .name('push')
    .description('Push a prompt to the registry with auto-versioning')
    .argument('<name>', 'Name of the prompt')
    .option('-c, --content <content>', 'Prompt content (inline)')
    .option('-f, --file <file>', 'Prompt content (from file)')
    .action(async (name, options) => {
    try {
        // Load config - error if not initialized
        const config = loadConfig();
        if (!config) {
            console.error('Not initialized. Run "tuned init" first to create .tuned.json');
            process.exit(1);
        }
        let content = '';
        // Determine content source: -c flag, -f flag, or stdin
        if (options.content) {
            // -c flag: use content directly
            content = options.content;
        }
        else if (options.file) {
            // -f flag: read from file
            try {
                content = fs.readFileSync(options.file, 'utf-8');
            }
            catch (error) {
                console.error('Failed to read file ' + options.file + ': ' +
                    (error instanceof Error ? error.message : String(error)));
                process.exit(1);
            }
        }
        else {
            // No flags: read from stdin
            content = await readStdin();
        }
        if (!content || content.trim().length === 0) {
            console.error('Content is empty. Please provide prompt content.');
            process.exit(1);
        }
        // Check if prompt exists
        const promptExists = await checkPromptExists(name, config);
        // Create prompt if it doesn't exist
        if (!promptExists) {
            await createPrompt(name, config);
        }
        // Create version
        const version = await createVersion(name, content, config);
        // Success message with brand voice
        console.log('Pushed ' + name + ' v' + version + '. Live at edge.');
    }
    catch (error) {
        // Error message with brand voice
        console.error('Push failed. Check your connection.');
        if (error instanceof Error) {
            console.error('Details: ' + error.message);
        }
        process.exit(1);
    }
});
