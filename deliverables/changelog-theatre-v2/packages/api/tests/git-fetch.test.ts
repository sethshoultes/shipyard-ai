import { fetchCommits } from '../src/services/github.js';
import type { Commit } from '../src/types.js';

function createMockResponse(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

describe('fetchCommits', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('fetches commits with correct Authorization header', async () => {
    let capturedHeaders: Headers | null = null;

    globalThis.fetch = async (url, init) => {
      if (typeof url === 'string' && url.includes('api.github.com')) {
        capturedHeaders = init?.headers as Headers ?? null;
        return createMockResponse([
          {
            sha: 'abc123',
            commit: {
              message: 'Fix login bug',
              author: { name: 'Alice', date: '2026-04-25T12:00:00Z' },
            },
            author: { login: 'alice' },
          },
        ]);
      }
      return createMockResponse([]);
    };

    const commits = await fetchCommits(
      { GITHUB_TOKEN: 'test-token' },
      'owner/repo',
      '2026-04-21',
      '2026-04-28'
    );

    expect(commits).toHaveLength(1);
    expect(commits[0].sha).toBe('abc123');
    expect(commits[0].message).toBe('Fix login bug');
    expect(commits[0].author).toBe('alice');

    const authHeader = capturedHeaders
      ? (capturedHeaders as Record<string, string>)['Authorization']
      : undefined;
    expect(authHeader).toBe('Bearer test-token');
  });

  it('handles pagination across multiple pages', async () => {
    let pageCount = 0;

    globalThis.fetch = async (url) => {
      const u = new URL(typeof url === 'string' ? url : url.toString());
      const page = Number(u.searchParams.get('page'));
      pageCount++;

      if (page === 1) {
        return createMockResponse(
          Array.from({ length: 100 }, (_, i) => ({
            sha: `sha-${i}`,
            commit: {
              message: `Commit ${i}`,
              author: { name: 'Dev', date: '2026-04-25T12:00:00Z' },
            },
            author: { login: 'dev' },
          }))
        );
      }
      if (page === 2) {
        return createMockResponse([
          {
            sha: 'sha-100',
            commit: {
              message: 'Commit 100',
              author: { name: 'Dev', date: '2026-04-25T12:00:00Z' },
            },
            author: { login: 'dev' },
          },
        ]);
      }
      return createMockResponse([]);
    };

    const commits = await fetchCommits(
      { GITHUB_TOKEN: 't' },
      'o/r',
      '2026-04-21',
      '2026-04-28'
    );

    expect(commits.length).toBe(101);
    expect(pageCount).toBeGreaterThanOrEqual(2);
  });

  it('throws on rate limit', async () => {
    globalThis.fetch = async () =>
      createMockResponse({ message: 'rate limited' }, 403, {
        'X-RateLimit-Reset': '1714310400',
      });

    await expect(
      fetchCommits({ GITHUB_TOKEN: 't' }, 'o/r', '2026-04-21', '2026-04-28')
    ).rejects.toThrow('rate limit exceeded');
  });

  it('throws on 404 for missing repo', async () => {
    globalThis.fetch = async () => createMockResponse({ message: 'Not Found' }, 404);

    await expect(
      fetchCommits({ GITHUB_TOKEN: 't' }, 'missing/repo', '2026-04-21', '2026-04-28')
    ).rejects.toThrow('not found');
  });

  it('returns empty array for no commits', async () => {
    globalThis.fetch = async () => createMockResponse([]);

    const commits = await fetchCommits(
      { GITHUB_TOKEN: 't' },
      'o/r',
      '2026-04-21',
      '2026-04-28'
    );

    expect(commits).toEqual([]);
  });
});
