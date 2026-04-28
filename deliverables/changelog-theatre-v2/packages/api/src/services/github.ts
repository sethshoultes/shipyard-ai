import type { Commit } from '../types.js';

export interface GitHubEnv {
  GITHUB_TOKEN: string;
}

export async function fetchCommits(
  env: GitHubEnv,
  repo: string,
  since: string,
  until: string
): Promise<Commit[]> {
  const commits: Commit[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const url = new URL(`https://api.github.com/repos/${repo}/commits`);
    url.searchParams.set('since', `${since}T00:00:00Z`);
    url.searchParams.set('until', `${until}T23:59:59Z`);
    url.searchParams.set('per_page', String(perPage));
    url.searchParams.set('page', String(page));

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (res.status === 403) {
      const reset = res.headers.get('X-RateLimit-Reset');
      throw new Error(`GitHub rate limit exceeded. Resets at ${reset}`);
    }

    if (res.status === 404) {
      throw new Error(`Repository ${repo} not found`);
    }

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as Array<{
      sha: string;
      commit: { message: string; author?: { name?: string; date?: string } };
      author?: { login?: string } | null;
    }>;

    if (data.length === 0) break;

    for (const item of data) {
      commits.push({
        sha: item.sha,
        message: item.commit.message.split('\n')[0],
        author: item.author?.login ?? item.commit.author?.name ?? 'unknown',
        date: item.commit.author?.date ?? since,
      });
    }

    if (data.length < perPage) break;
    page++;
  }

  return commits;
}
