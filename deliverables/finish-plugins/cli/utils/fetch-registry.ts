/**
 * Fetch themes registry from CDN or local source
 */

export interface Theme {
  name: string;
  description: string;
  version: string;
  url?: string;
  tarballUrl?: string;
  sha256?: string;
  previewUrl?: string;
}

/**
 * Fetch themes.json registry from CDN
 * Supports environment variable EMDASH_CDN_BASE_URL for custom CDN base URL
 * Falls back to default CDN if not specified
 */
export async function fetchThemesRegistry(): Promise<Theme[]> {
  // Get CDN base URL from environment variable or use default
  const cdnBase = process.env.EMDASH_CDN_BASE_URL || 'https://cdn.emdash.dev/themes';

  // Return hardcoded themes with URLs and hashes per registry
  const themes: Theme[] = [
    {
      name: 'ember',
      description: 'Bold. Editorial. For people with something to say.',
      version: '1.0.0',
      tarballUrl: `${cdnBase}/ember@1.0.0.tar.gz`,
      sha256: 'c1d24f686f79fb29a11c1312d3c70cf121410e54ef7465c8ccedd98a06bf2d49',
    },
    {
      name: 'forge',
      description: 'Dark. Technical. Aggressive, cutting-edge.',
      version: '1.0.0',
      tarballUrl: `${cdnBase}/forge@1.0.0.tar.gz`,
      sha256: '667dbd1a47d736f73e32c4f69a212bb1290f33445d993e637d5900cfcf84c995',
    },
    {
      name: 'slate',
      description: 'Clean. Corporate. Professional, trustworthy.',
      version: '1.0.0',
      tarballUrl: `${cdnBase}/slate@1.0.0.tar.gz`,
      sha256: '9500e5d7cb0f7e4691d540d8268722d5a210241bed869ccdad21985406058378',
    },
    {
      name: 'drift',
      description: 'Minimal. Airy. Contemplative, calm.',
      version: '1.0.0',
      tarballUrl: `${cdnBase}/drift@1.0.0.tar.gz`,
      sha256: '6bfa171b0c7b99a8804b8461e5238ed8fe7db78666a8e2c031df7bfc2970169a',
    },
    {
      name: 'bloom',
      description: 'Warm. Organic. Optimistic, inviting.',
      version: '1.0.0',
      tarballUrl: `${cdnBase}/bloom@1.0.0.tar.gz`,
      sha256: 'df7d4aad86417e75dc980cf427accf7f9306fefa956a37694f17a566792529e0',
    },
  ];

  return themes;
}
