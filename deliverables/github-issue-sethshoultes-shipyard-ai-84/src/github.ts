export interface RepoMeta {
  owner: string;
  repo: string;
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  topLanguages: string[];
  ownerAvatarUrl: string;
  ownerName: string;
}

let cursor = 0;

function nextToken(pool: string): string | null {
  if (!pool) return null;
  const tokens = pool.split(",").map(t => t.trim()).filter(Boolean);
  if (tokens.length === 0) return null;
  const t = tokens[cursor % tokens.length];
  cursor = (cursor + 1) % tokens.length;
  return t;
}

async function gh(path: string, pool: string): Promise<any> {
  const token = nextToken(pool);
  if (!token) {
    throw Object.assign(new Error("no GitHub token configured"), { status: 500 });
  }
  const r = await fetch(`https://api.github.com${path}`, {
    headers: {
      "authorization": `Bearer ${token}`,
      "accept": "application/vnd.github+json",
      "user-agent": "poster-worker/1.0",
    },
  });
  if (r.status === 404) {
    throw Object.assign(new Error("repo not found"), { status: 404 });
  }
  if (!r.ok) {
    throw Object.assign(new Error(`GitHub ${r.status}`), { status: r.status });
  }
  return r.json();
}

export async function fetchRepoMeta(owner: string, repo: string, pool: string): Promise<RepoMeta> {
  const [data, langs] = await Promise.all([
    gh(`/repos/${owner}/${repo}`, pool),
    gh(`/repos/${owner}/${repo}/languages`, pool).catch(() => ({})),
  ]);
  const topLanguages = Object.keys(langs)
    .sort((a, b) => (langs[b] || 0) - (langs[a] || 0))
    .slice(0, 3);
  return {
    owner: data.owner?.login ?? owner,
    repo: data.name ?? repo,
    fullName: data.full_name ?? `${owner}/${repo}`,
    description: data.description ?? null,
    stars: data.stargazers_count ?? 0,
    forks: data.forks_count ?? 0,
    topLanguages,
    ownerAvatarUrl: data.owner?.avatar_url ?? "",
    ownerName: data.owner?.login ?? owner,
  };
}
