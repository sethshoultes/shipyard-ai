/**
 * Preview command — opens theme preview in browser
 *
 * Usage:
 *   wardrobe preview [theme]
 *
 * Cross-platform browser opening:
 *   - macOS: 'open' command
 *   - Windows: 'start' command
 *   - Linux: 'xdg-open' command
 */
import { execSync } from 'child_process';
import { fetchThemesRegistry } from '../utils/fetch-registry.js';
/**
 * Open preview URL in browser (cross-platform)
 */
function openBrowserUrl(url) {
    const platform = process.platform;
    try {
        if (platform === 'darwin') {
            // macOS
            execSync(`open "${url}"`);
        }
        else if (platform === 'win32') {
            // Windows
            execSync(`start "${url}"`);
        }
        else {
            // Linux and other Unix-like systems
            execSync(`xdg-open "${url}"`);
        }
    }
    catch (error) {
        // If browser open fails, print URL as fallback
        console.log(`\nCouldn't open browser automatically.`);
        console.log(`Open this URL in your browser:\n  ${url}\n`);
    }
}
/**
 * Preview command action
 */
export async function previewCommand(themeName) {
    // Validate that a theme name was provided
    if (!themeName) {
        console.error('Error: Please specify a theme name.');
        console.error('Usage: wardrobe preview [theme]');
        console.error('\nExample: wardrobe preview ember');
        process.exit(1);
    }
    try {
        // Fetch the themes registry
        const themes = (await fetchThemesRegistry());
        // Validate theme name against registry
        const theme = themes.find((t) => t.name.toLowerCase() === themeName.toLowerCase());
        if (!theme) {
            console.error(`Error: Theme "${themeName}" not found.`);
            console.error(`Available themes: ${themes.map((t) => t.name).join(', ')}`);
            process.exit(1);
        }
        // Get preview URL from registry
        const previewUrl = theme.previewUrl;
        if (!previewUrl) {
            console.error(`Error: No preview URL available for theme "${themeName}".`);
            process.exit(1);
        }
        // Display success message
        console.log(`Opening preview for ${theme.name}...`);
        // Open browser
        openBrowserUrl(previewUrl);
    }
    catch (error) {
        console.error('Failed to fetch themes. Please check your internet connection and try again.');
        process.exit(1);
    }
}
