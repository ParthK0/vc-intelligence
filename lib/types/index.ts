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

export type ConfidenceIndex = 'High' | 'Medium' | 'Low'

export type PipelineStage = 'sourced' | 'intro' | 'partner_review' | 'ic' | 'invested' | 'passed'

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

export interface Founder {
  name: string
  role: string
  previousCompany?: string
  exitHistory?: string
  linkedinUrl?: string
  isRepeatFounder: boolean
  background?: string
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
  founders?: Founder[]
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
  confidence: ConfidenceIndex
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

// ─── DEAL MEMO ────────────────────────────────────────────────────────────────

export interface DealMemo {
  companyId: string
  companyName: string
  generatedAt: string
  investmentSummary: string
  problem: string
  solution: string
  market: string
  tractionSignals: string
  thesisMatch: string
  risks: string
  recommendedNextStep: string
  modelUsed: string
}

// ─── PIPELINE ─────────────────────────────────────────────────────────────────

export interface PipelineData {
  sourced: string[]
  intro: string[]
  partner_review: string[]
  ic: string[]
  invested: string[]
  passed: string[]
}

// ─── PORTFOLIO ────────────────────────────────────────────────────────────────

export interface PortfolioCompany {
  companyId: string
  addedAt: string
}

export interface PortfolioConflict {
  portfolioCompanyId: string
  portfolioCompanyName: string
  overlapPercent: number
  matchingKeywords: string[]
  matchingSectors: boolean
}

// ─── VISIT TRACKING ───────────────────────────────────────────────────────────

export interface VisitRecord {
  companyId: string
  lastVisitAt: string
  lastScore: number
  lastSignalCount: number
  lastEnrichmentAt?: string
}

export interface VisitChanges {
  scoreDelta: number
  newSignalCount: number
  wasReEnriched: boolean
  daysSinceVisit: number
}

// ─── AUDIT LOG ────────────────────────────────────────────────────────────────

export type AuditAction =
  | 'score_calculated'
  | 'enrichment_run'
  | 'memo_generated'
  | 'list_modified'
  | 'pipeline_moved'
  | 'company_viewed'
  | 'search_saved'

export interface AuditEntry {
  id: string
  action: AuditAction
  entityType: 'company' | 'list' | 'search' | 'pipeline'
  entityId: string
  entityName?: string
  details: string
  timestamp: string
}

// ─── DIGEST ───────────────────────────────────────────────────────────────────

export interface DigestReport {
  generatedAt: string
  period: string
  newCompanies: { sector: string; count: number }[]
  highScorers: { name: string; score: number; sector: string }[]
  topSignals: { company: string; signal: string; type: SignalType }[]
  totalSignals: number
  avgScore: number
}