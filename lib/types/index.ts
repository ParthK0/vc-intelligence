// lib/types/index.ts
// Central type system — every entity in the platform lives here
// No React or Next.js imports — pure TypeScript

// ─── ENUMS ────────────────────────────────────────────────────────────────────

export type SectorTag =
  | 'AI/ML'
  | 'DevTools'
  | 'FinTech'
  | 'HealthTech'
  | 'Climate'
  | 'Security'
  | 'Infrastructure'
  | 'SaaS'
  | 'Marketplace'
  | 'Consumer'
  | 'DeepTech'
  | 'Other'

export type FundingStage =
  | 'Pre-Seed'
  | 'Seed'
  | 'Series A'
  | 'Series B'
  | 'Series C+'

export type HeadcountRange =
  | '1-10'
  | '11-50'
  | '51-200'
  | '201-500'
  | '500+'

export type SignalType =
  | 'funding'
  | 'hiring'
  | 'product'
  | 'press'
  | 'github'
  | 'partnership'
  | 'leadership'
  | 'other'

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export type EnrichmentStatus = 'pending' | 'success' | 'partial' | 'failed'

// ─── CORE ENTITIES ────────────────────────────────────────────────────────────

export interface Signal {
  id: string
  type: SignalType
  title: string
  description: string
  source: string
  sourceUrl?: string
  timestamp: string       // ISO 8601
  confidence: ConfidenceLevel
  isNew?: boolean         // surfaced since last visit
}

export interface Note {
  id: string
  content: string
  authorLabel: string     // "Analyst" in MVP, real name in V2
  createdAt: string
  updatedAt: string
}

export interface Company {
  id: string
  name: string
  domain: string
  logoUrl?: string
  tagline: string
  description: string
  sector: SectorTag
  stage: FundingStage
  geography: string
  foundedYear: number
  headcount?: HeadcountRange
  lastFundingAmount?: number    // in USD
  lastFundingDate?: string      // ISO 8601
  totalRaised?: number          // in USD
  investorNames: string[]
  founderNames: string[]
  linkedinUrl?: string
  twitterUrl?: string
  githubUrl?: string
  signals: Signal[]
  enrichment?: EnrichmentPayload
  thesisScore?: ScoreResult
  notes: Note[]
  tags: string[]
  lists: string[]         // list IDs this company belongs to
  addedAt: string
  updatedAt: string
}

// ─── ENRICHMENT ───────────────────────────────────────────────────────────────

export interface DerivedSignal {
  signal: string
  confidence: ConfidenceLevel
  evidence: string        // exact quote from scraped source
  sourceUrl: string
}

export interface SourceRecord {
  url: string
  fetchedAt: string
  statusCode: number
  contentLength?: number
}

export interface EnrichmentPayload {
  companyId: string
  status: EnrichmentStatus
  summary: string | null
  whatTheyDo: string[]
  keywords: string[]
  derivedSignals: DerivedSignal[]
  sources: SourceRecord[]
  enrichedAt: string
  modelUsed: string
}

// ─── THESIS + SCORING ─────────────────────────────────────────────────────────

export interface DimensionCriteria {
  sectors?: SectorTag[]
  stages?: FundingStage[]
  geographies?: string[]
  keywords?: string[]
  headcountMax?: number
  foundedAfter?: number
  requiresEnrichment?: boolean
}

export interface ThesisDimension {
  key: string
  label: string
  weight: number            // 0-100, all weights must sum to 100
  criteria: DimensionCriteria
  description: string       // shown in thesis panel UI
}

export interface ThesisConfig {
  fundId: string
  fundName: string
  dimensions: ThesisDimension[]
  minimumScore: number      // companies below this are filtered out
  description: string
  version: string
}

export interface DimensionScore {
  key: string
  label: string
  weight: number
  rawScore: number          // 0-100 before weighting
  weightedScore: number     // rawScore * (weight/100)
  matched: boolean
  evidence: string[]        // what triggered this score
  missing: string[]         // what was absent / why points lost
}

export interface ScoreResult {
  total: number             // 0-100, sum of all weightedScores
  grade: ScoreGrade
  dimensions: DimensionScore[]
  explanation: string       // human-readable paragraph for analysts
  scoredAt: string
  thesisVersion: string
}

export type ScoreGrade = 'Strong Match' | 'Good Match' | 'Weak Match' | 'No Match'

// ─── PERSISTENCE ──────────────────────────────────────────────────────────────

export interface CompanyList {
  id: string
  name: string
  description?: string
  companyIds: string[]
  createdAt: string
  updatedAt: string
  color?: string            // for visual differentiation in UI
}

export interface SearchFilters {
  query: string
  sectors: SectorTag[]
  stages: FundingStage[]
  geographies: string[]
  minScore?: number
  maxScore?: number
  signalTypes?: SignalType[]
  tags?: string[]
  foundedAfter?: number
  foundedBefore?: number
}

export interface SavedSearch {
  id: string
  name: string
  filters: SearchFilters
  resultSnapshot: string[]  // company IDs from last run
  lastRunAt: string
  createdAt: string
  resultCount: number
}

// ─── UI STATE ─────────────────────────────────────────────────────────────────

export interface SortConfig {
  field: keyof Company | 'thesisScore.total' | 'signals.length'
  direction: 'asc' | 'desc'
}

export interface PaginationConfig {
  page: number
  limit: number
  total: number
}

// ─── API CONTRACTS ────────────────────────────────────────────────────────────

export interface EnrichRequest {
  companyId: string
  domain: string
  companyName: string
}

export interface EnrichResponse {
  success: boolean
  data?: EnrichmentPayload
  error?: string
  cached: boolean
  cachedAt?: string
}

export interface ScoreRequest {
  company: Company
  enrichment?: EnrichmentPayload
  thesisConfig: ThesisConfig
}

export interface ScoreResponse {
  success: boolean
  data?: ScoreResult
  error?: string
}