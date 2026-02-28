# Scout — VC Intelligence Platform

A precision AI-powered sourcing and decision-support tool for early-stage venture capital funds. Built with Next.js 16, featuring real-time enrichment, intelligent multi-dimensional scoring, deal pipeline management, AI-powered analysis, and fund-level collaboration.

**Live Demo:** [vc-intelligence-ruddy-seven.vercel.app](https://vc-intelligence-ruddy-seven.vercel.app)

---

## Features

### Core Intelligence
- **500 Companies** — Curated + programmatically generated startup database
- **Smart Search** — Fuzzy search + filters by sector, stage, geography, thesis score
- **Thesis Scoring** — Deterministic, explainable 5-dimension scoring engine
- **Live Enrichment** — Real website scraping via Firecrawl + Claude extraction
- **Signal Feed** — Timestamped, confidence-rated signal timeline per company

### Advanced Scoring
- **Risk Engine** — Separate risk analysis (signal sparsity, funding staleness, team gaps)
- **Momentum Index** — Signal velocity tracking (🔥 High / 📈 Emerging / ⚠ Stale)
- **Score Drift** — Track score changes over time with weekly delta indicators
- **Weight Learner** — Semi-AI weight adjustment based on IC/investment decisions

### Deal Management
- **Pipeline** — Kanban-style deal flow (Sourced → Intro → Partner Review → IC → Invested)
- **Portfolio** — Track invested companies with conflict detection
- **Data Room** — DD checklist by category (legal, financial, commercial, technical, team)
- **IC Comparison** — Side-by-side company comparison with thesis alignment matrix
- **Lists** — Save companies to lists, export as CSV or JSON
- **Saved Searches** — Persist and re-run filter combinations

### AI Features
- **Ask Scout** — Per-company AI chat for scoring explanations and deal insights
- **Investment Memos** — AI-generated memos with thesis alignment, risks, and recommendations
- **Weekly Digest** — Auto-generated intelligence summaries with top movers and signals

### Live Data Feeds
- **Feed Ingestor** — RSS, GitHub stars, and job posting feeds per company
- **Auto-Signals** — Automatic signal creation from feed items
- **Cron Jobs** — Scheduled feed polling via Vercel Cron / Upstash QStash

### Fund Collaboration
- **Authentication** — Credentials provider with fund isolation
- **Multi-User** — Admin, Partner, Analyst roles per fund
- **Fund Metrics** — Deal flow analytics, conversion rates, sector distribution
- **Audit Log** — Track all actions across the platform

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16.1.6 (App Router, Turbopack) |
| Database | Prisma + PostgreSQL (Neon-ready) |
| Auth | NextAuth 4 (credentials provider) |
| Cache | Upstash Redis |
| Queue | Upstash QStash |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Animations | Framer Motion 12 |
| Charts | Recharts |
| State | Zustand |
| Search | Fuse.js (fuzzy search) |
| Validation | Zod 4 |
| AI | Anthropic Claude (extraction + chat) |
| Scraping | Firecrawl API |
| Persistence | localStorage (MVP) → Prisma (production) |

---

## UI & UX Architecture

### Design System

**Theme:** Dark mode with violet accents on zinc-950 base.

| Token | Value | Usage |
|-------|-------|-------|
| `bg-zinc-950` | `#09090b` | Page background |
| `bg-zinc-900` | `#18181b` | Card background |
| `border-zinc-800` | `#27272a` | Card borders |
| `text-zinc-100` | `#f4f4f5` | Primary text |
| `text-zinc-400` | `#a1a1aa` | Secondary text |
| `violet-600` | `#7c3aed` | Primary accent |
| `emerald-400` | `#34d399` | Positive / success |
| `amber-400` | `#fbbf24` | Warning / moderate |
| `red-400` | `#f87171` | Danger / high risk |

**Typography:** Inter (Google Fonts) — clean, modern sans-serif.

**Effects:**
- Glassmorphism: `backdrop-blur-xl` + `bg-*-950/95` on sidebar and floating elements
- Glow: `shadow-lg shadow-violet-600/20` on primary elements
- Gradient text: `bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text`
- Custom animations: `shimmer`, `float`, `pulse-glow` (defined in `globals.css`)

### Component Structure

```
components/
├── layout/
│   ├── Sidebar.tsx         # Fixed left nav — glassmorphism, gradient logo, active bar
│   └── TopBar.tsx          # Page header — title, subtitle, breadcrumbs
│
└── ui/
    ├── motion.tsx          # Framer Motion wrappers: PageTransition, StaggerList,
    │                       # AnimatedScore, SlideUp, FadeIn, LoadingSpinner
    ├── ask-scout.tsx       # Floating AI chat — bottom-right, message history, API calls
    ├── data-room.tsx       # DD checklist — 5 categories, collapsible, notes, progress bar
    ├── badge.tsx           # Status / label badges (shadcn)
    ├── button.tsx          # Primary / outline / ghost variants (shadcn)
    ├── card.tsx            # Card container (shadcn)
    ├── dialog.tsx          # Modal dialogs (shadcn)
    ├── input.tsx           # Text input (shadcn)
    ├── select.tsx          # Dropdown select (shadcn)
    ├── table.tsx           # Data table (shadcn)
    ├── tabs.tsx            # Tab switcher (shadcn)
    ├── progress.tsx        # Progress bar (shadcn)
    ├── separator.tsx       # Divider (shadcn)
    ├── skeleton.tsx        # Loading skeleton (shadcn)
    └── sheet.tsx           # Slide-out panel (shadcn)
```

### Page UX Flows

#### Dashboard (`/`)
```
┌────────────────────────────────────────────────┐
│  TopBar: "Command Center"                      │
├────────────────────────────────────────────────┤
│  [Stats Row]  Companies │ Matches │ Signals │  │
├────────────────────────────────────────────────┤
│  ┌─ Top Matches ──┐  ┌─ Recent Signals ─────┐ │
│  │ Ranked cards    │  │ Signal timeline feed │ │
│  │ w/ scores +     │  │ w/ type icons &      │ │
│  │ confidence      │  │ confidence badges    │ │
│  └─────────────────┘  └──────────────────────┘ │
├────────────────────────────────────────────────┤
│  ┌─ Signal Heatmap (sector × stage grid) ────┐ │
│  └───────────────────────────────────────────┘ │
│  ┌─ Signal Volume Timeline (12-week bars) ───┐ │
│  └───────────────────────────────────────────┘ │
├────────────────────────────────────────────────┤
│  ┌─ Fund Metrics ────────────────────────────┐ │
│  │ Deal Flow │ Pipeline │ Avg Score │ Funnel │ │
│  │ Pipeline Funnel: Sourced → IC → Invested  │ │
│  │ Sector Distribution: bar chart            │ │
│  └───────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

#### Company Profile (`/companies/[id]`)
```
┌────────────────────────────────────────────────┐
│  ← Back to Companies                           │
├────────────────────────────────────────────────┤
│  ⚠ Portfolio Conflict Warning (if detected)    │
│  📊 Visit Change Bar (score delta, new signals)│
├────────────────────────────────────────────────┤
│  ┌─ Header ──────────────────────────────────┐ │
│  │ [Logo] Company Name  [Score 82/100]       │ │
│  │ Tagline (badges: stage, sector, geo)      │ │
│  │ 🔥 High Momentum │ Risk: 32/100 │ ↑+9    │ │
│  │ [Website] [Save] [Pipeline] [Enrich] [Memo]│ │
│  │ ─────────────────────────────────────────  │ │
│  │ $3.2M raised │ 6mo ago │ 11-50 │ 8 signals│ │
│  └───────────────────────────────────────────┘ │
├────────────────────────────────────────────────┤
│  [Overview] [Signals] [Enrichment] [Score]     │
│  [Memo] [Data Room]                            │
├─────────────────────┬──────────────────────────┤
│  Tab Content        │  Similar Companies       │
│  (varies by tab)    │  (sidebar, 5 matches)    │
│                     │                          │
│  Overview:          │  ┌─ NeuralOps 88% ─────┐│
│  - Description      │  │ AI/ML · Seed         ││
│  - Founders         │  └─────────────────────┘│
│  - Tags / links     │  ┌─ DataForge 72% ─────┐│
│  - Notes            │  └─────────────────────┘│
│  - Audit Log        │                          │
├─────────────────────┴──────────────────────────┤
│  💬 Ask Scout (floating chat, bottom-right)    │
└────────────────────────────────────────────────┘
```

#### Pipeline (`/pipeline`)
```
┌────────────────────────────────────────────────┐
│  Sourced → Intro → Review → IC → Invest │ Pass │
│  ┌─────┐ ┌─────┐ ┌──────┐ ┌───┐ ┌─────┐┌────┐│
│  │ Co1 │ │ Co4 │ │ Co7  │ │Co9│ │Co10 ││Co12││
│  │ Co2 │ │ Co5 │ │      │ │   │ │     ││    ││
│  │ Co3 │ │ Co6 │ │      │ │   │ │     ││    ││
│  │[+]  │ │[+]  │ │ [+]  │ │[+]│ │ [+] ││ [+]││
│  └─────┘ └─────┘ └──────┘ └───┘ └─────┘└────┘│
│  Drag-and-drop between columns                │
└────────────────────────────────────────────────┘
```

#### IC Comparison (`/ic`)
```
┌────────────────────────────────────────────────┐
│  [Company A ×] [Company B ×] [+ Add company]  │
├────────────────────────────────────────────────┤
│  Thesis Alignment Comparison                   │
│  ┌────────────┬──────────┬──────────┬────────┐ │
│  │ Dimension  │ CompanyA │ CompanyB │ CompC  │ │
│  │ Sector Fit │ ███░ 72  │ ████ 85  │ ██░ 45 │ │
│  │ Stage Fit  │ ████ 90  │ ███░ 60  │ ████ 80│ │
│  │ TOTAL      │ 78/100   │ 71/100   │ 62/100 │ │
│  └────────────┴──────────┴──────────┴────────┘ │
├────────────────────────────────────────────────┤
│  Risk Matrix                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ CompanyA  │ │ CompanyB  │ │ CompanyC  │      │
│  │ Risk: 32  │ │ Risk: 55  │ │ Risk: 18  │      │
│  │ 🔥 High   │ │ 📈 Emerging│ │ 🔥 High   │     │
│  └──────────┘ └──────────┘ └──────────┘       │
├────────────────────────────────────────────────┤
│  IC Decision Matrix (comparison table)         │
└────────────────────────────────────────────────┘
```

### Navigation Map

```
Sidebar (fixed left, 240px)
├── Intelligence ─────────────
│   ├── Dashboard        /
│   ├── Companies        /companies
│   ├── Pipeline         /pipeline
│   ├── IC View (New)    /ic
│   ├── Lists            /lists
│   ├── Saved Searches   /saved
│   ├── Signals          /signals
│   ├── Digest           /digest
│   ├── Portfolio         /portfolio
│   └── Sign In          /auth/signin
└── Settings ─────────────────
    └── Thesis Config    /thesis
```

### Animation System

All animations use Framer Motion via `components/ui/motion.tsx`:

| Animation | Component | Description |
|-----------|-----------|-------------|
| `PageTransition` | Layout wrapper | Fade + slide on route change |
| `StaggerList` | List container | Children animate in sequence (50ms delay) |
| `StaggerItem` | List item | Fade-up entry |
| `AnimatedScore` | Score badge | Count-up animation on mount |
| `SlideUp` | Section wrapper | Slide from below on mount |
| `FadeIn` | Generic wrapper | Simple opacity transition |
| `LoadingSpinner` | Loading state | Rotating + pulsing spinner |
| `motion.div` | Inline | `whileHover={{ scale: 1.02 }}` on cards |

### Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Desktop (>1024px) | Full sidebar + main content |
| All pages | Fixed 240px sidebar, `ml-60` on main |
| Grids | `grid-cols-4` (stats), `grid-cols-6` (pipeline), `grid-cols-3` (IC cards) |

### Color Coding Conventions

| Element | Color Logic |
|---------|------------|
| Thesis Score ≥75 | `emerald-400` (Strong Match) |
| Thesis Score ≥55 | `amber-400` (Good Match) |
| Thesis Score <55 | `zinc-400` (Weak/No Match) |
| Risk ≥60 | `red-400` (Very High Risk) |
| Risk ≥40 | `orange-400` (High Risk) |
| Risk ≥20 | `amber-400` (Moderate Risk) |
| Risk <20 | `emerald-400` (Low Risk) |
| Momentum High | `orange-400` with 🔥 |
| Momentum Emerging | `emerald-400` with 📈 |
| Momentum Stale | `zinc-500` with ⚠ |
| Confidence High | `emerald-400` |
| Confidence Medium | `amber-400` |
| Confidence Low | `zinc-500` |
| Drift Up | `emerald-400` with ↑ |
| Drift Down | `red-400` with ↓ |

---

## Project Structure

```
app/
├── page.tsx              # Dashboard with heatmap, timeline, fund metrics
├── layout.tsx            # Root layout: Sidebar + main content wrapper
├── globals.css           # Design tokens, glassmorphism, animations
├── auth/signin/          # Sign-in / register page
├── companies/
│   ├── page.tsx          # Company list with search/filters/pagination
│   └── [id]/page.tsx     # Full company profile (6 tabs + Ask Scout)
├── pipeline/page.tsx     # Deal pipeline Kanban (drag-and-drop)
├── portfolio/page.tsx    # Portfolio tracker + conflict detection
├── ic/page.tsx           # IC comparison view (up to 3 companies)
├── digest/page.tsx       # Weekly intelligence digest
├── lists/page.tsx        # Saved lists + CSV/JSON export
├── saved/page.tsx        # Saved searches
├── signals/page.tsx      # Global signal feed
├── thesis/page.tsx       # Thesis configuration editor
└── api/
    ├── enrich/route.ts   # Firecrawl + Claude enrichment
    ├── ask/route.ts      # Ask Scout AI chat
    ├── memo/route.ts     # Investment memo generation
    ├── feeds/route.ts    # RSS feed ingestion
    └── cron/route.ts     # Scheduled jobs (digest, feeds, searches)

lib/
├── auth.ts               # Auth config + session management
├── utils.ts              # cn() class merge utility
├── types/index.ts        # Central type system (30+ interfaces)
├── data/
│   ├── seed.ts           # 500 company database
│   ├── generator.ts      # Programmatic company generation
│   ├── engine.ts         # Scoring engine (duplicate, legacy)
│   ├── digest.ts         # Weekly digest report generator
│   ├── heatmap.ts        # Sector × stage heatmap + signal timeline
│   ├── metrics.ts        # Fund dashboard metrics engine
│   └── thesis-default.ts # Default Apex Ventures thesis config
├── scoring/
│   ├── engine.ts         # 5-dimension deterministic thesis scoring
│   ├── risk.ts           # 7-factor risk analysis engine
│   ├── momentum.ts       # Signal velocity / momentum index
│   ├── drift.ts          # Score history tracking + drift detection
│   └── weight-learner.ts # Semi-AI thesis weight adjustment
├── enrichment/
│   ├── fetcher.ts        # Firecrawl web scraping integration
│   ├── extractor.ts      # Claude AI field extraction + fallback
│   ├── queue.ts          # Async enrichment queue (QStash-ready)
│   └── memo-generator.ts # AI investment memo prompt + fallback
├── feeds/
│   └── ingestor.ts       # RSS/GitHub/Jobs feed ingestion + signal classification
├── search/
│   ├── index.ts          # Fuse.js fuzzy search + multi-filter engine
│   └── similarity.ts     # Hybrid company similarity scoring
├── cache/index.ts        # Cache abstraction (localStorage → Redis)
├── schemas/
│   └── enrich.ts         # Zod validation schemas
└── persistence/
    ├── lists.ts          # Company list CRUD
    ├── saved-searches.ts # Saved filter CRUD
    ├── pipeline.ts       # Deal pipeline state (6 stages)
    ├── portfolio.ts      # Portfolio + conflict detection
    ├── data-room.ts      # DD checklist (19 items, 5 categories)
    ├── visit-tracker.ts  # Visit recording + change detection
    └── audit.ts          # Action audit log

components/
├── layout/
│   ├── Sidebar.tsx       # Fixed nav with glassmorphism + gradient logo
│   └── TopBar.tsx        # Page header with title + subtitle
└── ui/
    ├── motion.tsx        # 7 Framer Motion animation wrappers
    ├── ask-scout.tsx     # Floating AI chat panel
    ├── data-room.tsx     # DD checklist with categories + notes
    └── [shadcn]          # badge, button, card, dialog, input, select,
                          # table, tabs, progress, separator, skeleton, sheet

prisma/
└── schema.prisma         # 16 PostgreSQL models (Neon-ready)
```

---

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

```bash
# AI & Scraping (required for full functionality)
ANTHROPIC_API_KEY=     # From console.anthropic.com
FIRECRAWL_API_KEY=     # From firecrawl.dev

# Database (optional — enables real persistence)
DATABASE_URL=          # PostgreSQL connection string (e.g., Neon)

# Auth (optional — enables authentication)
NEXTAUTH_SECRET=       # Generate with: openssl rand -base64 32
NEXTAUTH_URL=          # http://localhost:3000 for dev

# Queue (optional — enables async enrichment)
UPSTASH_QSTASH_TOKEN=  # From upstash.com

# Caching (optional — enables Redis caching)
UPSTASH_REDIS_REST_URL=   # From upstash.com
UPSTASH_REDIS_REST_TOKEN= # From upstash.com
```

---

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

## Scoring Engines

### Thesis Score (0–100)

| Dimension | Default Weight | Description |
|-----------|----------------|-------------|
| Sector Fit | 30% | Match to thesis sectors + keyword analysis |
| Stage Fit | 25% | Exact stage match (100), adjacent (40), out-of-range (0) |
| Traction Signals | 20% | Signal value × confidence × recency decay |
| Geography Fit | 15% | Exact match (100), remote (70), mismatch (0) |
| Team Quality | 10% | Founder signals, co-founder count, Dr. prefix |

### Risk Score (0–100)

| Factor | Max Risk Points |
|--------|----------------|
| Signal Sparsity | 25 pts |
| Funding Staleness | 20 pts |
| Stage-Traction Mismatch | 15 pts |
| Unknown Founders | 15 pts |
| No Enrichment | 10 pts |
| No Hiring Signals | 8 pts |
| Small Team at Late Stage | 10 pts |

Grades: Low Risk (<20) → Moderate (20–39) → High (40–59) → Very High (60+)

### Momentum Index

```
Momentum = Σ(Signal × TypeWeight × ConfidenceMultiplier × RecencyDecay)
```

- **🔥 High Momentum** (≥60) — Active signals, accelerating trend
- **📈 Emerging** (30–59) — Moderate activity, steady trend
- **⚠ Stale** (<30) — No recent signals, decelerating

### Weight Learner

When a company moves to IC/Invested:
- Dimensions that scored ≥70 get +0.5% weight boost
- Dimensions that scored <30 get -0.5% weight reduction
- Max drift from original: ±10 percentage points
- Weights auto-renormalize to sum to 100%

---

## Deal Pipeline

6-stage Kanban with drag-and-drop:
1. **Sourced** — Initial discovery
2. **Intro** — First meeting scheduled
3. **Partner Review** — Internal evaluation
4. **IC** — Investment Committee presentation
5. **Invested** — Portfolio company
6. **Passed** — Declined

## Data Room

DD checklist organized by category (19 default items):
- **⚖️ Legal:** Cap table, articles, term sheet, IP assignments, contracts
- **💰 Financial:** P&L, revenue metrics, burn rate, projections
- **📊 Commercial:** Customer references, market sizing, competitive landscape, sales pipeline
- **⚙️ Technical:** Architecture review, security audit, code quality
- **👥 Team:** Background checks, reference calls, key hires plan

## Authentication

Credentials provider with fund isolation:
- Fund-level data scoping (each fund sees only their data)
- Three roles: Admin, Partner, Analyst
- Demo accounts: `analyst@apex.vc` / `demo123`

## Database Schema (Prisma)

16 models ready for PostgreSQL (Neon):

| Model | Purpose |
|-------|---------|
| `User` | Multi-user with fund + role |
| `Fund` | Fund-level isolation |
| `FundCompany` | Fund ↔ Company association |
| `ThesisConfig` | Per-fund thesis (JSON) |
| `PipelineEntry` | Pipeline stage per company |
| `Portfolio` | Invested companies |
| `Note` | Company notes with author |
| `AuditLog` | Full action history |
| `CompanyList` | Saved lists |
| `SavedSearch` | Saved filter combinations |
| `EnrichmentJob` | Async enrichment queue |
| `ScoreHistory` | Score drift tracking |
| `DataRoomItem` | DD checklist items |
| `FeedSource` | Live feed configurations |
| `WeightAdjustment` | Learned weight changes |

Initialize: `npx prisma generate && npx prisma db push`

---

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ParthK0/vc-intelligence)

Set env vars in Vercel dashboard. Do not commit `.env.local`.

For database: Connect a Neon PostgreSQL instance and add `DATABASE_URL`.

## License

MIT
