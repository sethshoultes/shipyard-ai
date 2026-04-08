/**
 * Fetch themes registry from CDN or local source
 */

export interface Theme {
  name: string;
  description: string;
  version: string;
  url?: string;
  tarballUrl?: string;
}

/**
 * Fetch themes.json registry from CDN
 * Falls back to hardcoded themes if network fails
 */
export async function fetchThemesRegistry(): Promise<Theme[]> {
  // Try to fetch from CDN (would be replaced with real URL in production)
  // For now, return hardcoded themes per decisions.md
  const themes: Theme[] = [
    {
      name: 'ember',
      description: 'Bold. Editorial. For people with something to say.',
      version: '1.0.0',
      tarballUrl: 'https://cdn.emdash.dev/themes/ember@1.0.0.tar.gz',
    },
    {
      name: 'forge',
      description: 'Dark. Technical. Aggressive, cutting-edge.',
      version: '1.0.0',
      tarballUrl: 'https://cdn.emdash.dev/themes/forge@1.0.0.tar.gz',
    },
    {
      name: 'slate',
      description: 'Clean. Corporate. Professional, trustworthy.',
      version: '1.0.0',
      tarballUrl: 'https://cdn.emdash.dev/themes/slate@1.0.0.tar.gz',
    },
    {
      name: 'drift',
      description: 'Minimal. Airy. Contemplative, calm.',
      version: '1.0.0',
      tarballUrl: 'https://cdn.emdash.dev/themes/drift@1.0.0.tar.gz',
    },
    {
      name: 'bloom',
      description: 'Warm. Organic. Optimistic, inviting.',
      version: '1.0.0',
      tarballUrl: 'https://cdn.emdash.dev/themes/bloom@1.0.0.tar.gz',
    },
  ];

  return themes;
}
