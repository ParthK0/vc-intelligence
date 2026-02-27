# Scout — VC Intelligence Platform

A precision AI sourcing tool for early-stage venture capital funds.

## Features

- **Discovery** — Search + filter 25 companies by sector, stage, geography, thesis score
- **Thesis Scoring** — Deterministic, explainable 5-dimension scoring engine
- **Live Enrichment** — Real website scraping via Firecrawl + Claude extraction
- **Signal Feed** — Timestamped, confidence-rated signal timeline per company
- **Lists** — Save companies to lists, export as CSV
- **Saved Searches** — Persist and re-run filter combinations

## Setup

1. Clone the repo
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local`
4. Add your API keys to `.env.local`
5. Run: `npm run dev`

## Environment Variables

```
ANTHROPIC_API_KEY=     # From console.anthropic.com
FIRECRAWL_API_KEY=     # From firecrawl.dev
```

## Architecture

- **UI Layer**: Next.js 14 App Router, Tailwind, shadcn/ui
- **Intelligence Layer**: `/lib/scoring/`, `/lib/enrichment/`, `/lib/search/`
- **API Layer**: `/app/api/enrich/` — server-side only, keys never exposed
- **Storage**: localStorage (MVP) → Postgres + Redis (V2)
- **Search**: Fuse.js fuzzy search (MVP) → Typesense (V3)

## Enrichment Pipeline

```
User clicks Enrich
→ POST /api/enrich (server-side)
→ Firecrawl fetches public pages
→ Claude extracts structured fields
→ Returns summary, bullets, keywords, signals, sources
→ Cached in localStorage for 24hrs
```

## Scoring Engine

Five weighted dimensions per fund thesis:
- Sector Fit (30%)
- Stage Fit (25%)
- Traction Signals (20%)
- Geography Fit (15%)
- Team Quality (10%)

Every score includes dimension breakdown + evidence + explanation paragraph.

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Set env vars in Vercel dashboard. Do not commit `.env.local`.
