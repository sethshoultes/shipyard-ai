interface Context {
  params: { slug: string[] };
  request: Request;
}

export const onRequest = async ({ params, request }: Context) => {
  const parts = Array.isArray(params.slug) ? params.slug : [params.slug];
  const path = parts.map(encodeURIComponent).join("/");
  const upstream = `https://poster.seth-a02.workers.dev/${path}`;
  const init: RequestInit = {
    method: request.method,
    headers: { "user-agent": "shipyard-poster-proxy/1.0" },
  };
  const res = await fetch(upstream, init);
  return new Response(res.body, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") || "image/png",
      "cache-control": res.headers.get("cache-control") || "public, max-age=86400",
      "x-poster-upstream": "poster.seth-a02.workers.dev",
    },
  });
};
