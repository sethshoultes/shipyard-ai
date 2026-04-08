/**
 * Preview command — opens theme preview in browser
 *
 * Usage:
 *   wardrobe preview [theme]
 *
 * Cross-platform browser opening:
 *   - macOS: 'open' command
 *   - Windows: 'start' command
 *   - Linux: 'xdg-open' command
 */
/**
 * Preview command action
 */
export declare function previewCommand(themeName?: string): Promise<void>;
