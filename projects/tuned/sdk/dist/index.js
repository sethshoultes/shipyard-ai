import { getFromCache, setInCache } from './cache';
let defaultOptions = {
    baseUrl: 'https://tuned-api.workers.dev',
};
export function configure(options) {
    defaultOptions = { ...defaultOptions, ...options };
}
export async function getPrompt(name, options) {
    // Check cache first
    const cached = getFromCache(name);
    if (cached)
        return cached;
    // Fetch from /kv/prompt/:name endpoint
    const mergedOptions = { ...defaultOptions, ...options };
    const response = await fetch(`${mergedOptions.baseUrl}/kv/prompt/${name}`);
    if (!response.ok)
        return null;
    const data = (await response.json());
    setInCache(name, data.version, data.content);
    return data;
}
//# sourceMappingURL=index.js.map