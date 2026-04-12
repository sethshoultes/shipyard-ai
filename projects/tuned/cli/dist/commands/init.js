import { Command } from 'commander';
import { randomUUID } from 'crypto';
import { randomBytes } from 'crypto';
import { configExists, saveConfig } from '../config.js';
export const initCommand = new Command()
    .name('init')
    .description('Initialize a new Tuned project')
    .action(() => {
    // Check if config already exists
    if (configExists()) {
        console.warn('Warning: .tuned.json already exists in this directory.');
        console.warn('Overwriting existing configuration...\n');
    }
    // Generate projectId using UUID
    const projectId = randomUUID();
    // Generate API key: tuned_{random32chars}
    const randomPart = randomBytes(24).toString('hex');
    const apiKey = `tuned_${randomPart}`;
    // Set default backendUrl
    const backendUrl = 'https://tuned-api.workers.dev';
    // Create config object
    const config = {
        projectId,
        apiKey,
        backendUrl,
    };
    // Save config
    saveConfig(config);
    // Print success message with brand voice
    console.log('\nTuned. Ready to push prompts.\n');
    console.log(`Project initialized!`);
    console.log(`  Project ID: ${projectId}`);
    console.log(`  API Key: ${apiKey}`);
    console.log(`  Backend URL: ${backendUrl}`);
    console.log('\nConfiguration saved to .tuned.json');
});
