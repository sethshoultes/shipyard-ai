# Wardrobe Analytics Worker

Cloudflare Worker for anonymous install telemetry tracking for the Shipyard Wardrobe CLI theme engine.

## Overview

This worker receives anonymous analytics data from Wardrobe CLI installs and stores them in Cloudflare D1 for later analysis. **No PII is collected** — only theme preferences, operating system, CLI version, and anonymous geographic data.

## Features

- **Anonymous Only**: No IP addresses, user IDs, or personal information stored
- **Geographic Data**: Country extracted from Cloudflare CF-IPCountry header
- **Rate Limiting**: 100 requests per minute per IP to prevent abuse
- **Fire-and-Forget**: Returns 200 OK immediately (async DB insertion)
- **Indexed Queries**: Pre-built indexes for common analytics queries

## Deployment

### Prerequisites

1. Cloudflare account with wrangler CLI installed
2. D1 database initialized
3. Node.js 18+

### Installation

```bash
cd workers/wardrobe-analytics
npm install
```

### Local Development

```bash
npm run dev
```

This starts a local Wrangler dev server on `http://localhost:8787`.

### Initialize D1 Database

```bash
wrangler d1 create wardrobe-analytics
```

This will output a database ID. Update `wrangler.toml` with the database ID.

### Apply Schema

```bash
wrangler d1 execute wardrobe-analytics --file=schema.sql
```

### Deploy to Production

```bash
npm run deploy
```

This deploys the worker to your Cloudflare account and associates it with the D1 database.

## API

### POST /track

Accepts install telemetry and stores it in D1.

**Request:**
```json
{
  "theme": "dracula",
  "os": "darwin",
  "timestamp": 1234567890,
  "cliVersion": "1.0.0"
}
```

**Response (200 OK):**
```json
{
  "success": true
}
```

**Parameters:**
- `theme` (string, required): Theme name (1-100 chars)
- `os` (string, required): Operating system (1-100 chars)
- `timestamp` (number, required): Unix timestamp of install
- `cliVersion` (string, required): CLI version (1-50 chars)

**Headers (automatic, from Cloudflare):**
- `CF-IPCountry`: Two-letter ISO country code (extracted anonymously)
- `CF-Connecting-IP`: Used for rate limiting only (not stored)

### Rate Limiting

- **Limit**: 100 requests per minute per IP
- **Status Code**: 429 if exceeded
- **Note**: Rate limiting is per-worker instance; for distributed limiting, use Durable Objects

## Database Schema

### Table: `installs`

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| theme | TEXT | Theme name (e.g., "dracula") |
| os | TEXT | Operating system (e.g., "darwin", "linux", "windows") |
| country | TEXT | ISO 3166-1 alpha-2 country code |
| timestamp | INTEGER | Unix timestamp of install |
| cli_version | TEXT | Wardrobe CLI version |
| created_at | DATETIME | Server-side timestamp (UTC) |

**Indexes:**
- `created_at`: For time-based aggregations
- `theme`: For theme popularity analysis
- `os`: For OS distribution analysis
- `country`: For geographic distribution
- `theme, created_at`: Composite for theme trends over time

## Security & Privacy

- **No PII**: Theme, OS, version, and country-level location only
- **No IP Logging**: IPs used for rate limiting only (not persisted)
- **Sanitized Input**: All string inputs are validated and sanitized
- **Fire-and-Forget**: Errors don't block CLI responses
- **CORS**: Not applicable (server-to-server)

## Example Usage (from CLI)

```bash
# Wardrobe CLI would call:
curl -X POST https://analytics.shipyard.company/track \
  -H "Content-Type: application/json" \
  -d '{
    "theme": "dracula",
    "os": "darwin",
    "timestamp": 1704067200,
    "cliVersion": "1.0.0"
  }'
```

## Analytics Queries

### Most Popular Themes

```sql
SELECT theme, COUNT(*) as installs
FROM installs
WHERE created_at >= datetime('now', '-30 days')
GROUP BY theme
ORDER BY installs DESC
LIMIT 10;
```

### OS Distribution

```sql
SELECT os, COUNT(*) as count
FROM installs
WHERE created_at >= datetime('now', '-30 days')
GROUP BY os;
```

### Geographic Distribution

```sql
SELECT country, COUNT(*) as installs
FROM installs
WHERE created_at >= datetime('now', '-7 days')
GROUP BY country
ORDER BY installs DESC
LIMIT 20;
```

### Version Adoption

```sql
SELECT cli_version, COUNT(*) as count
FROM installs
WHERE created_at >= datetime('now', '-30 days')
GROUP BY cli_version
ORDER BY count DESC;
```

## Troubleshooting

### D1 Database Not Found
- Ensure `database_id` in `wrangler.toml` matches your created database
- Run `wrangler d1 list` to see your databases

### Rate Limit Errors
- This is per-instance and in-memory
- For production, implement Durable Objects for distributed rate limiting

### Insert Failures
- Check that schema is applied: `wrangler d1 execute wardrobe-analytics --file=schema.sql`
- Verify D1 binding is correct in `wrangler.toml`

## Contributing

This worker is maintained as part of the Shipyard AI project. See the main repository for contribution guidelines.
