# SPARK ⚡

> Your website, instantly brilliant.

Add AI-powered chat to any website with one script tag. Zero configuration, instant intelligence.

## Quick Start

Add this to your HTML:

```html
<script src="https://cdn.usespark.com/spark.js"></script>
```

That's it! Your site now has an AI assistant.

## Features

- **⚡ Instant Setup** — One line of code, works anywhere
- **🧠 Smart Answers** — Powered by Claude 3.5 Haiku
- **🎨 Beautiful UI** — Clean design, adapts to any website
- **🚀 Blazing Fast** — First response in under 2 seconds
- **🔒 Privacy First** — No tracking, no cookies, no user data storage
- **📦 Tiny Bundle** — Under 10KB gzipped

## How It Works

1. **Paste the script tag** → SPARK initializes automatically
2. **AI reads your page** → Extracts content (title, main text, meta)
3. **Visitors ask questions** → Click widget, type anything
4. **Get instant answers** → Claude responds in 1-2 seconds

## Development

### Prerequisites

- Node.js 18+
- Cloudflare account (for Worker deployment)
- Anthropic API key

### Setup

```bash
# Install dependencies
npm install

# Set up Anthropic API key
cd spark/worker
wrangler secret put ANTHROPIC_API_KEY
# Paste your API key when prompted

# Run worker locally
npm run dev:worker

# In another terminal, run landing page
npm run dev:landing
```

### Build Widget

```bash
npm run build
```

Outputs:
- `dist/spark.min.js` — Minified bundle
- `dist/spark.min.js.gz` — Gzipped for CDN

### Deploy Worker

```bash
npm run deploy:worker
```

### Project Structure

```
spark/
├── widget/
│   ├── spark.js              # Main entry point
│   ├── components/
│   │   ├── Button.js         # Floating chat button
│   │   ├── Panel.js          # Chat panel UI
│   │   └── Message.js        # Message bubbles
│   ├── utils/
│   │   ├── api.js            # Worker API client
│   │   ├── scraper.js        # Page content extraction
│   │   └── storage.js        # localStorage helpers
│   └── styles/
│       └── spark.css         # Widget styles
├── worker/
│   ├── index.js              # Cloudflare Worker entry
│   ├── claude.js             # Claude API integration
│   ├── prompt.js             # System prompt template
│   ├── ratelimit.js          # Rate limiting logic
│   ├── errors.js             # Error handling
│   ├── analytics.js          # Usage logging
│   └── wrangler.jsonc        # Worker configuration
└── landing/
    ├── index.html            # Landing page
    └── styles.css            # Landing styles
```

## Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────┐
│  Website with   │────▶│  Cloudflare Worker   │────▶│  Claude API │
│  Embed Script   │◀────│  (spark-api)         │◀────│   (Haiku)   │
└─────────────────┘     └──────────────────────┘     └─────────────┘
        │
        ▼
┌─────────────────┐
│  Chat Widget    │
│  (Shadow DOM)   │
└─────────────────┘
```

## Technical Details

### Widget

- **Framework:** Vanilla JavaScript (no dependencies)
- **Isolation:** Shadow DOM with CSS reset
- **Size:** <10KB gzipped
- **Compatibility:** All modern browsers (Chrome, Firefox, Safari, Edge)

### Worker

- **Platform:** Cloudflare Workers
- **Runtime:** Node.js compat mode
- **AI Model:** Claude 3.5 Haiku
- **Rate Limits:**
  - 10 requests/min per site_id
  - 100 requests/hour per IP

### Content Scraping

The widget extracts:
1. `document.title`
2. `<meta name="description">` content
3. Text from `<main>`, fallback to `<article>`, fallback to `<body>`
4. Truncated to 10KB

### Streaming

Responses stream via Server-Sent Events (SSE):
- First token in <2 seconds
- Real-time display as Claude generates
- Typing indicator during generation

## Configuration

### Environment Variables

Worker requires:
- `ANTHROPIC_API_KEY` — Your Anthropic API key

Set via Wrangler:
```bash
wrangler secret put ANTHROPIC_API_KEY
```

## Deployment

### Widget (CDN)

1. Build: `npm run build`
2. Upload `dist/spark.min.js` to your CDN
3. Configure caching: `Cache-Control: public, max-age=3600`

### Worker

```bash
npm run deploy:worker
```

Worker deploys to: `https://spark-api.<subdomain>.workers.dev`

### Landing Page

Deploy `spark/landing/` to:
- Cloudflare Pages
- Netlify
- Vercel
- Any static host

## Testing

### Manual Testing

1. Open landing page: `npm run dev:landing`
2. Visit `http://localhost:8000`
3. Click purple widget button
4. Ask: "What is SPARK?"
5. Verify response appears in <2s

### Cross-Platform Testing

Tested on:
- ✅ WordPress (Astra, Divi themes)
- ✅ Shopify (Dawn theme)
- ✅ Wix
- ✅ Squarespace
- ✅ Webflow
- ✅ Static HTML sites
- ✅ React SPAs

### Browser Testing

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ iOS Safari
- ✅ Android Chrome

## Performance

- **Widget Load:** <500ms
- **First Token:** <2s (p95)
- **Bundle Size:** <10KB gzipped
- **Animation:** 60fps

## Security

- UUID validation prevents injection attacks
- Rate limiting prevents abuse
- CORS configured correctly
- No sensitive data logged
- No user tracking or analytics

## Privacy

SPARK is privacy-first:
- ✅ No cookies
- ✅ No tracking pixels
- ✅ No user data storage
- ✅ No conversation history
- ✅ Client-side site_id generation only

## Roadmap

### V1 (Current)
- ✅ Basic widget UI
- ✅ Claude integration
- ✅ Content scraping
- ✅ Rate limiting
- ✅ Landing page

### V2 (Future)
- [ ] Dashboard for site owners
- [ ] Custom branding/theming
- [ ] Conversation history
- [ ] Analytics dashboard
- [ ] Multi-page context (site-wide)
- [ ] Custom prompts

## License

MIT License - See LICENSE file for details

## Support

- Email: hello@usespark.com
- GitHub: [github.com/yourusername/spark](https://github.com/yourusername/spark)
- Website: [usespark.com](https://usespark.com)

## Credits

Built with:
- [Claude](https://anthropic.com) by Anthropic
- [Cloudflare Workers](https://workers.cloudflare.com)
- [esbuild](https://esbuild.github.io)

---

**"Fast AND great. No compromise."** — Phil Jackson
