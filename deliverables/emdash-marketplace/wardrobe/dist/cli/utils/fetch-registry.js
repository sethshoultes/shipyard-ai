/**
 * Fetch themes registry from CDN or local source
 */
/**
 * Fetch themes.json registry from CDN
 * Falls back to hardcoded themes if network fails
 */
export async function fetchThemesRegistry() {
    // Try to fetch from CDN (would be replaced with real URL in production)
    // For now, return hardcoded themes per decisions.md
    const themes = [
        {
            name: 'ember',
            description: 'Bold. Editorial. For people with something to say.',
            version: '1.0.0',
        },
        {
            name: 'forge',
            description: 'Dark. Technical. Aggressive, cutting-edge.',
            version: '1.0.0',
        },
        {
            name: 'slate',
            description: 'Clean. Corporate. Professional, trustworthy.',
            version: '1.0.0',
        },
        {
            name: 'drift',
            description: 'Minimal. Airy. Contemplative, calm.',
            version: '1.0.0',
        },
        {
            name: 'bloom',
            description: 'Warm. Organic. Optimistic, inviting.',
            version: '1.0.0',
        },
    ];
    return themes;
}
