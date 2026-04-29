#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const CWD = process.cwd();

function findFiles(dir: string, pattern: RegExp, files: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return files;
  }

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const st = statSync(fullPath);
    if (st.isDirectory()) {
      findFiles(fullPath, pattern, files);
    } else if (st.isFile() && pattern.test(entry)) {
      files.push(fullPath);
    }
  }
  return files;
}

function hasStaticExport(): boolean {
  const configPaths = ['next.config.ts', 'next.config.js', 'next.config.mjs'];
  for (const configPath of configPaths) {
    try {
      const content = readFileSync(join(CWD, configPath), 'utf-8');
      if (/output\s*:\s*['"]export['"]/.test(content)) {
        return true;
      }
    } catch {
      // config file not found, try next
    }
  }
  return false;
}

function isEdgeRoute(filePath: string): boolean {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return /export\s+const\s+runtime\s*=\s*['"]edge['"]/.test(content);
  } catch {
    return false;
  }
}

function main() {
  if (!hasStaticExport()) {
    console.log('Ready.');
    process.exit(0);
  }

  const routeFiles = findFiles(join(CWD, 'app'), /route\.(ts|js)$/);

  for (const filePath of routeFiles) {
    if (isEdgeRoute(filePath)) {
      console.log(
        `Your Edge route cannot fly in static export. Move it or lose it. — ${filePath}`
      );
      process.exit(1);
    }
  }

  console.log('Ready.');
  process.exit(0);
}

main();
