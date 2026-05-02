# PRD: [dream] WorkerForge

> Auto-generated from GitHub issue sethshoultes/shipyard-ai#86
> https://github.com/sethshoultes/shipyard-ai/issues/86

## Metadata
- **Repo:** sethshoultes/shipyard-ai
- **Issue:** #86
- **Author:** sethshoultes
- **Labels:** dream-candidate, p2
- **Created:** 2026-04-30T11:25:07Z
- **Priority:** p2

## Problem
Developers building AI features on Cloudflare Workers need production-ready scaffolding but current templates are bare-bones. Setting up rate limiting, caching, streaming, and monitoring from scratch takes hours and is error-prone.

## Success Criteria
- CLI tool `npx workerforge create` scaffolds a working CF Workers AI project
- Supports model types: LLM, image (Stable Diffusion), audio (Whisper)
- Built-in rate limiting (Cloudflare KV or Durable Objects)
- Built-in caching layer
- Streaming responses for LLM
- Monitoring dashboard (optional, defaults to simple logging)
- Deployed in < 60 seconds from CLI

## Technical Approach
- CLI built with Node.js + Commander.js
- Template engine: copies pre-built templates from GitHub repo
- CF Workers AI bindings pre-configured
- Optional Wrangler.toml auto-generation
- TypeScript-first templates

## Acceptance Criteria
- [ ] `npx workerforge create --llm --stream` produces deployable project
- [ ] `npx workerforge create --image` produces deployable project
- [ ] `npx workerforge create --audio` produces deployable project
- [ ] All templates include rate limiting
- [ ] All templates include caching
- [ ] LLM template supports streaming
- [ ] README with deployment instructions
