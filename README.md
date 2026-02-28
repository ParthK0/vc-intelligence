# Scout — VC Intelligence Platform

A precision AI sourcing tool for early-stage venture capital funds. Built with Next.js 16, featuring real-time enrichment, intelligent scoring, deal pipeline management, and AI-powered analysis.

**Live Demo:** [vc-intelligence-ruddy-seven.vercel.app](https://vc-intelligence-ruddy-seven.vercel.app)

## Features

### Core Intelligence
- **500 Companies** — Curated + programmatically generated startup database
- **Smart Search** — Fuzzy search + filters by sector, stage, geography, thesis score
- **Thesis Scoring** — Deterministic, explainable 5-dimension scoring engine
- **Live Enrichment** — Real website scraping via Firecrawl + Claude extraction
- **Signal Feed** — Timestamped, confidence-rated signal timeline per company

### Deal Management
- **Pipeline** — Kanban-style deal flow (Sourced → Screening → DD → IC → Closed)
- **Portfolio** — Track invested companies with investment dates
- **Lists** — Save companies to lists, export as CSV or JSON
- **Saved Searches** — Persist and re-run filter combinations

### AI Features
- **Ask Scout** — Per-company AI chat for scoring explanations, risk analysis, and deal insights
- **Investment Memos** — AI-generated memos with thesis alignment, risks, and recommendations
- **Weekly Digest** — Auto-generated intelligence summaries with top movers and signals

### UX
- **Framer Motion** — Card hover effects, page transitions, animated score gauges
- **Audit Log** — Track all actions across the platform
- **Visit Tracking** — Recently viewed companies

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router, Turbopack)
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Animations:** Framer Motion 12
- **State:** Zustand
- **Search:** Fuse.js (fuzzy search)
- **Validation:** Zod 4
- **AI:** Anthropic Claude (extraction + chat)
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
│   └── [id]/page.tsx     # Company profile + Ask Scout
├── pipeline/page.tsx     # Deal pipeline (Kanban)
├── portfolio/page.tsx    # Portfolio tracker
├── digest/page.tsx       # Weekly intelligence digest
├── lists/page.tsx        # Saved lists + export
├── saved/page.tsx        # Saved searches
├── signals/page.tsx      # Signal feed
├── thesis/page.tsx       # Thesis configuration
└── api/
    ├── enrich/route.ts   # Enrichment API
    ├── ask/route.ts      # Ask Scout AI API
    └── memo/route.ts     # Investment memo generation

lib/
├── data/
│   ├── seed.ts           # 500 companies (25 curated + 475 generated)
│   ├── generator.ts      # Company generator
│   ├── digest.ts         # Weekly digest generator
│   ├── heatmap.ts        # Sector/stage distribution
│   └── thesis-default.ts # Default thesis config
├── scoring/engine.ts     # 5-dimension scoring
├── enrichment/
│   ├── fetcher.ts        # Firecrawl integration
│   ├── extractor.ts      # Claude extraction + fallback
│   └── memo-generator.ts # AI memo generation
├── search/
│   ├── index.ts          # Fuse.js search + filters
│   └── similarity.ts     # Company similarity scoring
├── cache/index.ts        # localStorage cache
└── persistence/
    ├── lists.ts          # Company lists
    ├── saved-searches.ts # Saved filter combinations
    ├── pipeline.ts       # Deal pipeline state
    ├── portfolio.ts      # Portfolio companies
    ├── visit-tracker.ts  # Recently viewed
    └── audit.ts          # Action audit log

components/
├── layout/               # Sidebar, TopBar
└── ui/
    ├── ask-scout.tsx     # AI chat component
    └── ...               # shadcn + motion components
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

## Ask Scout AI

Per-company AI assistant that answers questions about:
- Why a company scored high/low on specific dimensions
- Risk analysis and competitive positioning
- Deal recommendations based on thesis fit
- Signal interpretation and trend analysis

```
User asks question on company profile
→ POST /api/ask (server-side)
→ Claude receives company data + enrichment + score breakdown
→ Returns contextual, data-driven response
```

## Deal Pipeline

Kanban-style pipeline with 5 stages:
1. **Sourced** — Initial discovery
2. **Screening** — Preliminary review
3. **Due Diligence** — Deep investigation
4. **Investment Committee** — Final decision
5. **Closed** — Deal closed (won/lost)

Drag-and-drop between stages with full audit logging.

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
