/**
 * List Command
 * Displays all available themes with descriptions and personalities
 */
import { fetchRegistry } from '../utils/fetch-registry';
export async function listCommand(_args) {
    console.log('\nFetching themes...\n');
    const registry = await fetchRegistry();
    const availableThemes = registry.themes.filter(t => !t.comingSoon);
    const comingSoonThemes = registry.themes.filter(t => t.comingSoon);
    console.log('Available Themes');
    console.log('================\n');
    for (const theme of availableThemes) {
        printTheme(theme);
    }
    if (comingSoonThemes.length > 0) {
        console.log('\nComing Soon');
        console.log('===========\n');
        for (const theme of comingSoonThemes) {
            printComingSoonTheme(theme);
        }
    }
    console.log('\n---');
    console.log('Install a theme: npx wardrobe install <theme-name>');
    console.log('Preview a theme: npx wardrobe preview <theme-name>');
    console.log('');
}
function printTheme(theme) {
    const colors = theme.colors
        ? `${theme.colors.primary} / ${theme.colors.accent}`
        : '';
    console.log(`  ${theme.name} (v${theme.version})`);
    console.log(`  "${theme.tagline}"`);
    console.log(`  ${theme.personality} | ${colors}`);
    console.log(`  Install: npx wardrobe install ${theme.slug}`);
    console.log('');
}
function printComingSoonTheme(theme) {
    console.log(`  ${theme.name}`);
    console.log(`  "${theme.tagline}"`);
    console.log(`  ${theme.personality} | ${theme.estimatedRelease || 'TBD'}`);
    console.log('');
}
