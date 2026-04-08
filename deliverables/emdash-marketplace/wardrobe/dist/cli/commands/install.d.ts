/**
 * Install command - download theme and swap src/ directory
 *
 * Per Elon: "Unzipping a src/ directory should take less than 3 seconds."
 * Per Steve: "The moment that must be perfect: Seeing YOUR content wearing a new theme."
 */
interface InstallOptions {
    verbose?: boolean;
}
/**
 * Install a theme by name
 */
export declare function installTheme(themeName: string, options?: InstallOptions): Promise<void>;
export {};
