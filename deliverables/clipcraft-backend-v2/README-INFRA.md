# ClipCraft Backend v2 — Infrastructure Setup

## Provisioning Commands

Run these once per Cloudflare account to create the required resources.

### 1. Queues

```bash
npx wrangler queues create RENDER_QUEUE
```

### 2. R2 Buckets

```bash
npx wrangler r2 bucket create RENDER_OUTPUT
npx wrangler r2 bucket create RENDER_CACHE
```

### 3. D1 Database

```bash
npx wrangler d1 create RENDER_DB
```

After creation, update `wrangler.toml` with the real `database_id` from the output above.

Apply the migration:

```bash
npx wrangler d1 migrations apply RENDER_DB --local
npx wrangler d1 migrations apply RENDER_DB --remote
```

### 4. Secrets

```bash
npx wrangler secret put OPENAI_API_KEY
```

Enter your OpenAI API key when prompted.

### 5. Deploy

```bash
npm run deploy
```

## Known Gaps

- **Remotion video rendering** is out of scope. The pipeline currently returns TTS audio wrapped in a placeholder MP4 container. Replace `muxAudioAndPlaceholder` in `src/render.ts` with a real Remotion render step when ready.
