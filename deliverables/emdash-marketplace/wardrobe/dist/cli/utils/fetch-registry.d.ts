/**
 * Fetch themes registry from CDN or local source
 */
export interface Theme {
    name: string;
    description: string;
    version: string;
    url?: string;
}
/**
 * Fetch themes.json registry from CDN
 * Falls back to hardcoded themes if network fails
 */
export declare function fetchThemesRegistry(): Promise<Theme[]>;
