# Scout — VC Intelligence Platform

A precision AI sourcing tool for early-stage venture capital funds. Built with Next.js 16, featuring real-time enrichment, intelligent scoring, and smooth animations.

**Live Demo:** [vc-intelligence-ruddy-seven.vercel.app](https://vc-intelligence-ruddy-seven.vercel.app)

## Features

- **500 Companies** — Curated + programmatically generated startup database
- **Smart Search** — Fuzzy search + filters by sector, stage, geography, thesis score
- **Thesis Scoring** — Deterministic, explainable 5-dimension scoring engine
- **Live Enrichment** — Real website scraping via Firecrawl + Claude extraction
- **Signal Feed** — Timestamped, confidence-rated signal timeline per company
- **Lists** — Save companies to lists, export as CSV or JSON
- **Saved Searches** — Persist and re-run filter combinations
- **Framer Motion** — Card hover effects, page transitions, animated score gauges

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router, Turbopack)
- **Styling:** Tailwind CSS + shadcn/ui
- **Animations:** Framer Motion
- **Search:** Fuse.js (fuzzy search)
- **Validation:** Zod schemas
- **AI:** Anthropic Claude (extraction)
- **Scraping:** Firecrawl API
- **Persistence:** localStorage (MVP)

## Setup

```bash
# Clone
git clone https://github.com/ParthK0/vc-intelligence.git
cd vc-intelligence

# Install
npm install

# Configure
cp .env.example .env.local
# Add your API keys to .env.local

# Run
npm run dev
```

## Environment Variables

```
ANTHROPIC_API_KEY=     # From console.anthropic.com
FIRECRAWL_API_KEY=     # From firecrawl.dev
```

## Project Structure

```
app/
├── page.tsx              # Dashboard
├── companies/
│   ├── page.tsx          # Company list with search/filters
│   └── [id]/page.tsx     # Company profile
├── lists/page.tsx        # Saved lists + export
├── saved/page.tsx        # Saved searches
├── signals/page.tsx      # Signal feed
├── thesis/page.tsx       # Thesis configuration
└── api/enrich/route.ts   # Enrichment API

lib/
├── data/
│   ├── seed.ts           # 500 companies (25 curated + 475 generated)
│   ├── generator.ts      # Company generator
│   └── thesis-default.ts # Default thesis config
├── scoring/engine.ts     # 5-dimension scoring
├── enrichment/
│   ├── fetcher.ts        # Firecrawl integration
│   └── extractor.ts      # Claude extraction + fallback
├── search/index.ts       # Fuse.js search + filters
├── cache/index.ts        # localStorage cache
└── persistence/          # Lists + saved searches

components/
├── layout/               # Sidebar, TopBar
└── ui/                   # shadcn + motion components
```

## Enrichment Pipeline

```
User clicks Enrich
→ POST /api/enrich (server-side)
→ Firecrawl fetches public pages (15s timeout)
→ Claude extracts structured fields
→ Returns summary, bullets, keywords, signals, sources
→ Cached in localStorage for 24hrs

Fallback: If scraping fails, generates enrichment from existing company data
```

## Scoring Engine

Five weighted dimensions per fund thesis:

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Sector Fit | 30% | Match to thesis sectors |
| Stage Fit | 25% | Match to thesis stages |
| Traction Signals | 20% | Recent positive signals |
| Geography Fit | 15% | Match to thesis geographies |
| Team Quality | 10% | Founder background indicators |

Every score includes dimension breakdown + evidence + explanation paragraph.

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ParthK0/vc-intelligence)

Set env vars in Vercel dashboard. Do not commit `.env.local`.

## License

MIT
