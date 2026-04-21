import { fetchRepoMeta, RepoMeta } from "./github";
import { renderTemplate } from "./template";
import { rasterize } from "./renderer";
import { cacheGet, cachePut } from "./cache";

export interface Env {
  CACHE: R2Bucket;
  GITHUB_TOKEN_POOL: string;
}

const ALLOWED_PATH = /^\/([A-Za-z0-9](?:[A-Za-z0-9-]{0,38})?)\/([A-Za-z0-9_.-]{1,100})\/?$/;

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);

    if (url.pathname === "/" || url.pathname === "/health") {
      return new Response(
        "poster — GET /:owner/:repo for a PNG poster of any GitHub repo.\n",
        { headers: { "content-type": "text/plain; charset=utf-8" } }
      );
    }

    const m = url.pathname.match(ALLOWED_PATH);
    if (!m) {
      return new Response("Not found. Try /:owner/:repo\n", {
        status: 404,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
    const [, owner, repo] = m;
    const key = `v1/${owner.toLowerCase()}/${repo.toLowerCase()}.png`;

    const cached = await cacheGet(env.CACHE, key);
    if (cached) {
      return new Response(cached, {
        headers: {
          "content-type": "image/png",
          "cache-control": "public, max-age=86400",
          "x-poster-cache": "hit",
        },
      });
    }

    let meta: RepoMeta;
    try {
      meta = await fetchRepoMeta(owner, repo, env.GITHUB_TOKEN_POOL);
    } catch (e: any) {
      const status = e?.status === 404 ? 404 : 502;
      return new Response(`Couldn't load ${owner}/${repo} — ${e?.message || "upstream error"}\n`, {
        status,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    const svg = renderTemplate(meta);

    let png: Uint8Array;
    try {
      png = await rasterize(svg);
    } catch (e: any) {
      return new Response(`Render failed — ${e?.message || "unknown"}\n`, {
        status: 504,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    ctx.waitUntil(cachePut(env.CACHE, key, png));

    return new Response(png, {
      headers: {
        "content-type": "image/png",
        "cache-control": "public, max-age=86400",
        "x-poster-cache": "miss",
      },
    });
  },
};
