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
- **D1 Database** for persistent storage (SQLite)
- **CF-IPCountry header** to detect geographic region (no extra API calls)

## Database Schema

```sql
CREATE TABLE installs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  theme TEXT NOT NULL,
  os TEXT,
  country TEXT,
  timestamp TEXT NOT NULL,
  cli_version TEXT
);

CREATE INDEX idx_theme ON installs(theme);
CREATE INDEX idx_timestamp ON installs(timestamp);
```

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

1. **Create D1 Database**
   ```bash
   wrangler d1 create wardrobe-analytics
   # Note the database_id from output
   ```

2. **Update wrangler.toml**
   Replace `your-database-id-here` with the actual database ID from step 1.

3. **Apply Schema Migration**
   ```bash
   wrangler d1 migrations create wardrobe-analytics 0001_schema
   # Copy the SQL from migrations/0001_schema.sql
   wrangler d1 migrations apply wardrobe-analytics
   ```

4. **Deploy Worker**
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

### View Database

```bash
wrangler d1 query wardrobe-analytics "SELECT * FROM installs LIMIT 10"
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
