import { getFromCache, setInCache } from './cache';
import type { TunedOptions, PromptResult } from './types';

let defaultOptions: TunedOptions = {
  baseUrl: 'https://tuned-api.workers.dev',
};

export function configure(options: TunedOptions): void {
  defaultOptions = { ...defaultOptions, ...options };
}

export async function getPrompt(name: string, options?: TunedOptions): Promise<PromptResult | null> {
  // Check cache first
  const cached = getFromCache(name);
  if (cached) return cached;

  // Fetch from /kv/prompt/:name endpoint
  const mergedOptions = { ...defaultOptions, ...options };
  const response = await fetch(`${mergedOptions.baseUrl}/kv/prompt/${name}`);

  if (!response.ok) return null;

  const data = (await response.json()) as PromptResult;
  setInCache(name, data.version, data.content);
  return data;
}
