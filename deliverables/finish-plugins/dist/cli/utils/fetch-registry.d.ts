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
export declare function fetchThemesRegistry(): Promise<Theme[]>;
