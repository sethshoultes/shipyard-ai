/**
 * Fetch Registry
 * Retrieves themes.json from CDN
 */

const REGISTRY_URL = 'https://wardrobe.shipyard.company/registry/themes.json';
const REGISTRY_FALLBACK = 'https://r2.wardrobe.shipyard.company/themes.json';

export interface ThemeColors {
  primary: string;
  accent: string;
}

export interface Theme {
  name: string;
  slug: string;
  description: string;
  personality: string;
  tagline: string;
  version: string;
  tarballUrl: string;
  previewUrl: string;
  comingSoon: boolean;
  estimatedRelease?: string;
  targetUsers: string[];
  colors?: ThemeColors;
  sha256?: string;
}

export interface Registry {
  version: string;
  themes: Theme[];
  analytics: {
    endpoint: string;
    enabled: boolean;
  };
  metadata: {
    lastUpdated: string;
    registryVersion: string;
  };
}

export async function fetchRegistry(): Promise<Registry> {
  let lastError: Error | null = null;

  // Try primary URL
  try {
    const response = await fetch(REGISTRY_URL);
    if (response.ok) {
      return await response.json() as Registry;
    }
  } catch (error) {
    lastError = error as Error;
  }

  // Try fallback URL
  try {
    const response = await fetch(REGISTRY_FALLBACK);
    if (response.ok) {
      return await response.json() as Registry;
    }
  } catch (error) {
    lastError = error as Error;
  }

  throw new Error(
    `Could not fetch theme registry. Check your internet connection.\n${lastError?.message || ''}`
  );
}
