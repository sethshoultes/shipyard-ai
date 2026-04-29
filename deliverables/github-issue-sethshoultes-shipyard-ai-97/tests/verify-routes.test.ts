import { describe, it } from 'node:test';
import assert from 'node:assert';
import { spawnSync } from 'child_process';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';

const SCRIPT = join(__dirname, '..', 'scripts', 'verify-routes.ts');
const TSX = 'tsx';

function runIn(dir: string): { stdout: string; stderr: string; status: number | null } {
  const result = spawnSync(TSX, [SCRIPT], { cwd: dir, encoding: 'utf-8' });
  return {
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
    status: result.status,
  };
}

function setupFixture(name: string, files: Record<string, string>): string {
  const dir = join(__dirname, 'fixtures', name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = join(dir, filePath);
    mkdirSync(join(fullPath, '..'), { recursive: true });
    writeFileSync(fullPath, content);
  }
  return dir;
}

function cleanupFixture(name: string): void {
  const dir = join(__dirname, 'fixtures', name);
  rmSync(dir, { recursive: true, force: true });
}

describe('verify-routes', () => {
  it('passes when no static export is configured', () => {
    const dir = setupFixture('no-export', {
      'next.config.ts': `export default { output: 'standalone' }`,
      'app/api/route.ts': `export const runtime = 'edge'`,
    });
    const result = runIn(dir);
    assert.strictEqual(result.status, 0);
    assert.strictEqual(result.stdout, 'Ready.');
    cleanupFixture('no-export');
  });

  it('passes when static export is on but no Edge routes exist', () => {
    const dir = setupFixture('static-no-edge', {
      'next.config.ts': `export default { output: 'export' }`,
      'app/api/route.ts': `export async function GET() {}`,
    });
    const result = runIn(dir);
    assert.strictEqual(result.status, 0);
    assert.strictEqual(result.stdout, 'Ready.');
    cleanupFixture('static-no-edge');
  });

  it('fails when an Edge route exists in static export mode', () => {
    const dir = setupFixture('static-with-edge', {
      'next.config.ts': `export default { output: 'export' }`,
      'app/api/route.ts': `export const runtime = 'edge'\nexport async function GET() {}`,
    });
    const result = runIn(dir);
    assert.strictEqual(result.status, 1);
    assert.ok(result.stdout.includes('Your Edge route cannot fly in static export'));
    assert.ok(result.stdout.includes('app/api/route.ts'));
    cleanupFixture('static-with-edge');
  });

  it('detects Edge routes in .js files', () => {
    const dir = setupFixture('static-edge-js', {
      'next.config.js': `module.exports = { output: 'export' }`,
      'app/api/route.js': `export const runtime = 'edge'`,
    });
    const result = runIn(dir);
    assert.strictEqual(result.status, 1);
    assert.ok(result.stdout.includes('Your Edge route cannot fly in static export'));
    cleanupFixture('static-edge-js');
  });

  it('detects Edge routes in nested app directories', () => {
    const dir = setupFixture('nested-edge', {
      'next.config.ts': `export default { output: "export" }`,
      'app/api/v1/users/route.ts': `export const runtime = "edge"`,
    });
    const result = runIn(dir);
    assert.strictEqual(result.status, 1);
    assert.ok(result.stdout.includes('app/api/v1/users/route.ts'));
    cleanupFixture('nested-edge');
  });

  it('passes when route contains edge in a comment but not as runtime', () => {
    const dir = setupFixture('comment-edge', {
      'next.config.ts': `export default { output: 'export' }`,
      'app/api/route.ts': `// export const runtime = 'edge'\nexport async function GET() {}`,
    });
    const result = runIn(dir);
    assert.strictEqual(result.status, 0);
    assert.strictEqual(result.stdout, 'Ready.');
    cleanupFixture('comment-edge');
  });

  it('reads next.config.mjs', () => {
    const dir = setupFixture('mjs-config', {
      'next.config.mjs': `export default { output: 'export' }`,
      'app/api/route.ts': `export const runtime = 'edge'`,
    });
    const result = runIn(dir);
    assert.strictEqual(result.status, 1);
    cleanupFixture('mjs-config');
  });
});
