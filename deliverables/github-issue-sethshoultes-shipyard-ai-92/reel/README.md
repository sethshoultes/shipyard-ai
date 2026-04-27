# Reel

Turn any blog post into a polished short-form video in a few minutes.

## Build & Deploy Instructions

### Prerequisites

- Node.js >= 18
- Docker + Docker Compose (for local Redis / MinIO)
- npm >= 9

### Local Development

```bash
# Install dependencies
npm install

# Start supporting services (Redis, MinIO)
docker compose -f infra/docker-compose.yml up -d

# Run the Next.js web app
npm run dev
```

### Environment Variables

Create a `.env.local` in `apps/web/`:

```bash
# OpenAI (extraction)
OPENAI_API_KEY=sk-...

# ElevenLabs (TTS)
ELEVENLABS_API_KEY=...

# S3 / MinIO
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=reel-output
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_REGION=us-east-1

# Redis
REDIS_URL=redis://localhost:6379
```

### Production Deploy

1. Provision Redis (Upstash, Elasticache, or self-hosted).
2. Provision S3-compatible storage (AWS S3, Cloudflare R2, or MinIO).
3. Set environment variables on the host.
4. `npm run build` then `npm start` inside `apps/web/`.

### Render Pipeline

- Remotion renders on headless Chrome → 1080×1920 MP4.
- Jobs are queued in Redis + Bull with a hard concurrency cap.
- Output is uploaded to S3 and served via pre-signed URL.

### Timing

Honest estimate: **a few minutes** per video. Render time depends on length and server load.

## Architecture

```
reel/
├── apps/web/          # Next.js web service
├── packages/remotion/ # Remotion composition + template
└── infra/             # Docker Compose (app + Redis + renderer)
```
