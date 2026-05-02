// Bootstrap Cloudflare Worker
// Replace this with your custom logic or run `npx anvil create --llm --stream`

export interface Env {
  AI: Ai;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return new Response("Worker is running! Deploy your AI worker with Anvil CLI.");
  },
};
