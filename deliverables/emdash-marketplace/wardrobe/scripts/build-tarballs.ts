import * as fs from "fs";
import * as path from "path";
import { createWriteStream } from "fs";
import { createGzip } from "zlib";
import * as tar from "tar";

interface Theme {
  name: string;
  version: string;
}

const THEMES: Theme[] = [
  { name: "ember", version: "1.0.0" },
  { name: "forge", version: "1.0.0" },
  { name: "slate", version: "1.0.0" },
  { name: "drift", version: "1.0.0" },
  { name: "bloom", version: "1.0.0" },
];

const WARDROBE_ROOT = path.resolve(
  path.dirname(import.meta.url).replace("file://", ""),
  ".."
);
const THEMES_DIR = path.join(WARDROBE_ROOT, "themes");
const DIST_THEMES_DIR = path.join(WARDROBE_ROOT, "dist", "themes");

async function ensureDistDirectory(): Promise<void> {
  if (!fs.existsSync(DIST_THEMES_DIR)) {
    fs.mkdirSync(DIST_THEMES_DIR, { recursive: true });
    console.log(`Created distribution directory: ${DIST_THEMES_DIR}`);
  }
}

async function buildTarball(theme: Theme): Promise<number> {
  const themePath = path.join(THEMES_DIR, theme.name);
  const srcPath = path.join(themePath, "src");
  const tarballPath = path.join(
    DIST_THEMES_DIR,
    `${theme.name}@${theme.version}.tar.gz`
  );

  if (!fs.existsSync(srcPath)) {
    throw new Error(
      `Theme source directory not found: ${srcPath} for theme "${theme.name}"`
    );
  }

  console.log(`Building tarball for ${theme.name}@${theme.version}...`);

  return new Promise((resolve, reject) => {
    const gzip = createGzip({ level: 9 }); // Maximum compression
    const output = createWriteStream(tarballPath);

    output.on("finish", () => {
      const stats = fs.statSync(tarballPath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`✓ ${theme.name}@${theme.version}: ${sizeKB} KB`);
      resolve(stats.size);
    });

    output.on("error", reject);
    gzip.on("error", reject);

    tar.c(
      {
        gzip: false, // We're using createGzip directly for better control
        cwd: themePath,
      },
      ["src"]
    )
      .pipe(gzip)
      .pipe(output);
  });
}

async function main(): Promise<void> {
  try {
    console.log("Building Wardrobe theme tarballs...\n");

    // Step 6: Create wardrobe/dist/themes/ directory
    await ensureDistDirectory();

    // Step 2-5: For each theme, package and compress
    const results: Array<{ name: string; size: number }> = [];
    for (const theme of THEMES) {
      const size = await buildTarball(theme);
      results.push({ name: theme.name, size });
    }

    console.log("\nTarball Summary:");
    console.log("================");

    let allUnder500KB = true;
    let allValid = true;

    for (const result of results) {
      const sizeKB = result.size / 1024;
      const status500 = sizeKB <= 500 ? "✓" : "⚠";
      const status5MB = sizeKB <= 5120 ? "✓" : "✗";

      console.log(
        `${result.name}: ${sizeKB.toFixed(2)} KB (${status500} <500KB, ${status5MB} <5MB)`
      );

      if (sizeKB > 500) allUnder500KB = false;
      if (sizeKB > 5120) allValid = false;
    }

    if (!allValid) {
      throw new Error("Some tarballs exceed 5MB limit!");
    }

    if (allUnder500KB) {
      console.log("\n✓ All tarballs under 500KB target");
    } else {
      console.log("\n⚠ Some tarballs exceed 500KB target (but under 5MB max)");
    }

    console.log("\nBuild complete!");
  } catch (error) {
    console.error("Error building tarballs:", error);
    process.exit(1);
  }
}

main();
