import { Command } from 'commander';
import { loadConfig } from '../config.js';
import { listPrompts, listVersions } from '../api.js';
/**
 * Format output as a table
 */
function formatPromptTable(prompts) {
    if (prompts.length === 0) {
        return "No prompts yet. Run tuned push to create one.";
    }
    // Calculate column widths
    const nameWidth = Math.max("NAME".length, ...prompts.map((p) => p.name.length));
    const versionWidth = Math.max("VERSION".length, 2); // version numbers are typically 1-2 digits
    const updatedWidth = Math.max("UPDATED".length, 19); // ISO date string
    // Format header
    const header = `${"NAME".padEnd(nameWidth)} | ${"VERSION".padEnd(versionWidth)} | UPDATED`;
    const separator = "-".repeat(header.length);
    // Format rows
    const rows = prompts.map((p) => {
        const version = `${p.active_version}`;
        const dateObj = new Date(p.updated_at);
        const updated = dateObj.toISOString().split("T")[0];
        return `${p.name.padEnd(nameWidth)} | ${version.padEnd(versionWidth)} | ${updated}`;
    });
    return `${header}\n${separator}\n${rows.join("\n")}`;
}
/**
 * Format output as a table for versions
 */
function formatVersionTable(versions) {
    if (versions.length === 0) {
        return 'No versions found.';
    }
    // Calculate column widths
    const versionWidth = Math.max('VERSION'.length, 3);
    const statusWidth = 'ACTIVE'.length;
    // Format header
    const header = `${'VERSION'.padEnd(versionWidth)} | STATUS`;
    const separator = '-'.repeat(header.length);
    // Format rows - sort by version descending (latest first)
    const sortedVersions = [...versions].sort((a, b) => b.version - a.version);
    const rows = sortedVersions.map((v) => {
        const versionNum = `${v.version}`;
        const status = v.is_active ? '* active' : '';
        return `${versionNum.padEnd(versionWidth)} | ${status}`;
    });
    return `${header}\n${separator}\n${rows.join('\n')}`;
}
export const listCommand = new Command()
    .name('list')
    .description('List all prompts or versions of a specific prompt')
    .argument('[name]', 'Optional: prompt name to list versions for')
    .option('-j, --json', 'Output as JSON (machine-readable)')
    .action(async (name, options) => {
    try {
        const config = loadConfig();
        if (!config) {
            console.error('Error: No .tuned.json configuration found. Run "tuned init" first.');
            process.exit(1);
        }
        // If name is provided, list versions for that prompt
        if (name) {
            const versions = await listVersions(name, config);
            if (options.json) {
                console.log(JSON.stringify({
                    prompt_name: name,
                    versions,
                }, null, 2));
            }
            else {
                console.log(`\nVersions for "${name}":\n`);
                console.log(formatVersionTable(versions));
                console.log('');
            }
        }
        else {
            // List all prompts
            const prompts = await listPrompts(config);
            if (options.json) {
                console.log(JSON.stringify({
                    prompts,
                }, null, 2));
            }
            else {
                console.log('\nPrompts:\n');
                console.log(formatPromptTable(prompts.map((p) => ({
                    name: p.name,
                    active_version: p.active_version,
                    updated_at: p.updated_at,
                }))));
                console.log('');
            }
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error: ${errorMessage}`);
        process.exit(1);
    }
});
