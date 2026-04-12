/**
 * Preview Command
 * Opens theme preview in the default browser
 */

import { fetchRegistry } from '../utils/fetch-registry';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function previewCommand(args: string[]): Promise<void> {
  const themeName = args[0];

  if (!themeName) {
    // No theme specified, open showcase
    console.log('\nOpening Wardrobe showcase...');
    await openBrowser('https://wardrobe.shipyard.company');
    return;
  }

  console.log(`\nFetching preview for ${themeName}...\n`);

  const registry = await fetchRegistry();
  const theme = registry.themes.find(
    t => t.slug.toLowerCase() === themeName.toLowerCase()
  );

  if (!theme) {
    console.error(`Theme "${themeName}" not found.`);
    console.log('Run "npx wardrobe list" to see available themes.');
    process.exit(1);
  }

  if (theme.comingSoon) {
    console.log(`"${theme.name}" is coming soon (${theme.estimatedRelease || 'TBD'}).`);
    console.log('\nOpening preview anyway...');
  }

  console.log(`Opening preview for ${theme.name}...`);
  console.log(`"${theme.tagline}"`);
  console.log('');

  await openBrowser(theme.previewUrl);
}

async function openBrowser(url: string): Promise<void> {
  const platform = process.platform;

  let command: string;

  switch (platform) {
    case 'darwin':
      command = `open "${url}"`;
      break;
    case 'win32':
      command = `start "" "${url}"`;
      break;
    default:
      // Linux and others
      command = `xdg-open "${url}"`;
      break;
  }

  try {
    await execAsync(command);
  } catch (error) {
    console.log(`Could not open browser automatically.`);
    console.log(`Visit: ${url}`);
  }
}
