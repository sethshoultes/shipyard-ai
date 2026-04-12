# Wardrobe Analytics Worker

Cloudflare Worker for collecting anonymous install telemetry for Wardrobe themes.

## Overview

This Worker provides three simple endpoints for analytics:

- **POST /api/install** — Record an install event (theme + metadata)
- **GET /api/counts** — Get aggregated install counts per theme (cached 5 min)
- **GET /api/stats** — Get detailed statistics including OS and geographic data

### Privacy & Security

- **No PII collected** — Only theme name, OS, country (from Cloudflare headers), timestamp, and CLI version
- **Anonymous** — No user tracking, device IDs, or personal identifiers
- **CORS enabled** — Accepts requests from showcase domain and other origins
- **Rate limiting** — Cloudflare enforces per-IP limits; comments in code for future improvements

## Architecture

The Worker uses:
- **Cloudflare Workers** for serverless computation
- **KV Storage** for persistent key-value storage
- **CF-IPCountry header** to detect geographic region (no extra API calls)

## Data Model

Analytics events are stored in KV with the following key patterns:
- `install:{timestamp}:{uuid}` — Individual install events
- `count:{theme}` — Aggregated install counts per theme
- `stats` — Cached statistics blob (refreshed every 5 minutes)

No PII fields. Only aggregation-friendly data.

## API Endpoints

### POST /api/install

Record a new install event.

**Request:**
```json
{
  "theme": "ember",
  "os": "darwin",
  "cliVersion": "1.0.0"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "id": 42,
  "timestamp": "2026-04-09T20:30:00.000Z"
}
```

**Note:** Country is extracted automatically from the `CF-IPCountry` header (set by Cloudflare). No client-side geolocation needed.

### GET /api/counts

Get aggregated install counts grouped by theme.

**Response:**
```json
{
  "ember": 1234,
  "forge": 987,
  "slate": 456,
  "drift": 234,
  "bloom": 189
}
```

**Caching:** Cached for 5 minutes (`Cache-Control: public, max-age=300`)

### GET /api/stats

Get detailed statistics including OS and geographic breakdown.

**Response:**
```json
{
  "total": 3100,
  "themes": {
    "ember": {
      "count": 1234,
      "percentage": 39.8,
      "byOS": {
        "darwin": 800,
        "linux": 300,
        "win32": 134
      },
      "byCountry": {
        "US": 600,
        "GB": 200,
        "DE": 150,
        ...
      }
    },
    ...
  },
  "timestamp": "2026-04-09T20:30:00.000Z"
}
```

**Note:** This endpoint is currently unprotected. In production, add authentication:

```typescript
const apiKey = request.headers.get("Authorization");
if (!apiKey || !isValidApiKey(apiKey)) {
  return new Response("Unauthorized", { status: 401 });
}
```

## Deployment

### Prerequisites

1. Cloudflare account (free tier works, $5/mo for paid features)
2. Wrangler CLI installed:
   ```bash
   npm install -g wrangler
   wrangler login
   ```

### Setup Steps

1. **Create KV Namespace**
   ```bash
   wrangler kv:namespace create ANALYTICS
   # Note the namespace ID from output
   ```

2. **Update wrangler.toml**
   The wrangler.toml has been pre-configured with KV namespace IDs:
   - Production: `501ca8a74075b6eb1ccde44b6a7826d5`
   - Preview: `b0d7a870e649ed51ec9af992278c30b8`

3. **Deploy Worker**
   ```bash
   wrangler deploy
   ```

   Your Worker is now live at: `https://wardrobe-analytics.<subdomain>.workers.dev`

### Local Development

```bash
npm install
npm run dev
# Opens at http://localhost:8787
```

Test the endpoints:
```bash
# POST an install
curl -X POST http://localhost:8787/api/install \
  -H "Content-Type: application/json" \
  -d '{"theme":"ember","os":"darwin","cliVersion":"1.0.0"}'

# GET counts
curl http://localhost:8787/api/counts

# GET stats
curl http://localhost:8787/api/stats
```

## Integration with Wardrobe CLI

The CLI (`wardrobe install`) should make a POST request to your Worker when installing a theme:

```typescript
// In wardrobe CLI install command
const response = await fetch(`${ANALYTICS_URL}/api/install`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    theme: selectedTheme,
    os: process.platform,
    cliVersion: version,
  }),
  // Non-blocking: don't fail install if analytics fails
}).catch(() => {});
```

## Monitoring

### View KV Data

```bash
wrangler kv:key list --namespace-id=501ca8a74075b6eb1ccde44b6a7826d5
```

### Check Recent Installs

```bash
curl https://your-worker.workers.dev/api/counts
```

### Get Detailed Stats

```bash
curl https://your-worker.workers.dev/api/stats
```

## Future Enhancements

- Add authentication to `/api/stats` endpoint
- Add rate limiting with stricter per-IP limits
- Add webhook notifications for milestone events (e.g., "1000 installs")
- Add time-series aggregation (hourly/daily/weekly) for trending
- Add geographic heat maps
- Integrate with dashboard visualization

## References

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Documentation](https://developers.cloudflare.com/d1/)
- [Wrangler CLI](https://developers.cloudflare.com/wrangler/)
- Task reference: `phase-1-task-4` (Wardrobe Analytics)
