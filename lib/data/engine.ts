// lib/scoring/engine.ts
// Deterministic, explainable thesis scoring engine
// No embeddings. No black boxes. Every score is traceable.
// Pure TypeScript — no React or Next.js imports.

import {
  Company,
  ThesisConfig,
  ThesisDimension,
  DimensionScore,
  ScoreResult,
  ScoreGrade,
  ConfidenceIndex,
  EnrichmentPayload,
  SectorTag,
  FundingStage,
} from '@/lib/types'

function calculateConfidence(
  company: Company,
  enrichment?: EnrichmentPayload
): ConfidenceIndex {
  const highConfSignals = company.signals.filter(s => s.confidence === 'high').length
  const hasEnrichment = !!enrichment && enrichment.status === 'success'
  const totalSignals = company.signals.length
  if (highConfSignals >= 3 && hasEnrichment) return 'High'
  if (hasEnrichment || totalSignals >= 2) return 'Medium'
  return 'Low'
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function toGrade(total: number): ScoreGrade {
  if (total >= 75) return 'Strong Match'
  if (total >= 55) return 'Good Match'
  if (total >= 35) return 'Weak Match'
  return 'No Match'
}

function daysSince(isoDate: string): number {
  const ms = Date.now() - new Date(isoDate).getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

function recencyMultiplier(days: number): number {
  // Full credit under 60 days, decay to 40% at 365 days, floor at 20%
  if (days <= 60) return 1.0
  if (days <= 180) return 0.75
  if (days <= 365) return 0.5
  return 0.2
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
}

function keywordHits(
  keywords: string[],
  targets: string[]
): string[] {
  const normalized = targets.map(normalizeText)
  return keywords.filter((kw) =>
    normalized.some((t) => t.includes(kw.toLowerCase()))
  )
}

// ─── DIMENSION SCORERS ────────────────────────────────────────────────────────

function scoreSectorFit(
  company: Company,
  dimension: ThesisDimension,
  enrichment?: EnrichmentPayload
): DimensionScore {
  const evidence: string[] = []
  const missing: string[] = []
  let rawScore = 0

  const { criteria } = dimension

  // 1. Direct sector match — worth 60 points
  if (criteria.sectors?.includes(company.sector as SectorTag)) {
    rawScore += 60
    evidence.push(`Sector "${company.sector}" is in thesis target list`)
  } else {
    missing.push(
      `Sector "${company.sector}" not in target sectors: ${criteria.sectors?.join(', ')}`
    )
  }

  // 2. Keyword match in tags — worth up to 25 points
  const tagHits = keywordHits(criteria.keywords ?? [], company.tags)
  if (tagHits.length > 0) {
    const tagScore = Math.min(25, tagHits.length * 8)
    rawScore += tagScore
    evidence.push(`Tag matches: ${tagHits.join(', ')}`)
  }

  // 3. Keyword match in enrichment — worth up to 15 points
  if (enrichment?.keywords) {
    const enrichHits = keywordHits(
      criteria.keywords ?? [],
      enrichment.keywords
    )
    if (enrichHits.length > 0) {
      const enrichScore = Math.min(15, enrichHits.length * 5)
      rawScore += enrichScore
      evidence.push(`Enrichment keyword matches: ${enrichHits.join(', ')}`)
    }
  }

  // 4. Tagline/description keyword match — worth up to 10 points
  const descHits = keywordHits(criteria.keywords ?? [], [
    company.tagline,
    company.description,
  ])
  if (descHits.length > 0) {
    rawScore += Math.min(10, descHits.length * 3)
    evidence.push(`Description keyword matches: ${descHits.join(', ')}`)
  }

  rawScore = Math.min(100, rawScore)

  return {
    key: dimension.key,
    label: dimension.label,
    weight: dimension.weight,
    rawScore,
    weightedScore: parseFloat(((rawScore * dimension.weight) / 100).toFixed(2)),
    matched: rawScore >= 50,
    evidence,
    missing,
  }
}

function scoreStageFit(
  company: Company,
  dimension: ThesisDimension
): DimensionScore {
  const evidence: string[] = []
  const missing: string[] = []
  let rawScore = 0

  const { stages } = dimension.criteria

  if (!stages || stages.length === 0) {
    return {
      key: dimension.key,
      label: dimension.label,
      weight: dimension.weight,
      rawScore: 50,
      weightedScore: parseFloat(((50 * dimension.weight) / 100).toFixed(2)),
      matched: true,
      evidence: ['No stage criteria defined — neutral score'],
      missing: [],
    }
  }

  const stageIndex = (s: FundingStage): number => {
    const order: FundingStage[] = [
      'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+',
    ]
    return order.indexOf(s)
  }

  const companyIdx = stageIndex(company.stage)
  const targetIdxs = stages.map(stageIndex)
  const maxTargetIdx = Math.max(...targetIdxs)

  if (stages.includes(company.stage)) {
    // Perfect stage match
    rawScore = 100
    evidence.push(`Stage "${company.stage}" is an exact thesis match`)
  } else if (companyIdx === maxTargetIdx + 1) {
    // One stage above — partial credit
    rawScore = 40
    evidence.push(
      `Stage "${company.stage}" is one stage above thesis range — borderline`
    )
    missing.push(`Preferred stages: ${stages.join(', ')}`)
  } else {
    rawScore = 0
    missing.push(
      `Stage "${company.stage}" is outside thesis mandate. Preferred: ${stages.join(', ')}`
    )
  }

  return {
    key: dimension.key,
    label: dimension.label,
    weight: dimension.weight,
    rawScore,
    weightedScore: parseFloat(((rawScore * dimension.weight) / 100).toFixed(2)),
    matched: rawScore >= 50,
    evidence,
    missing,
  }
}

function scoreGeographyFit(
  company: Company,
  dimension: ThesisDimension
): DimensionScore {
  const evidence: string[] = []
  const missing: string[] = []
  let rawScore = 0

  const { geographies } = dimension.criteria

  if (!geographies || geographies.length === 0) {
    return {
      key: dimension.key,
      label: dimension.label,
      weight: dimension.weight,
      rawScore: 50,
      weightedScore: parseFloat(((50 * dimension.weight) / 100).toFixed(2)),
      matched: true,
      evidence: ['No geography criteria defined — neutral score'],
      missing: [],
    }
  }

  const geo = company.geography.toLowerCase()
  const matched = geographies.find((g) =>
    geo.includes(g.toLowerCase())
  )

  if (matched) {
    rawScore = 100
    evidence.push(`Geography "${company.geography}" matches thesis region "${matched}"`)
  } else if (geo.includes('remote')) {
    rawScore = 70
    evidence.push('Remote-first company — geography is flexible')
  } else {
    rawScore = 0
    missing.push(
      `Geography "${company.geography}" is outside thesis regions: ${geographies.join(', ')}`
    )
  }

  return {
    key: dimension.key,
    label: dimension.label,
    weight: dimension.weight,
    rawScore,
    weightedScore: parseFloat(((rawScore * dimension.weight) / 100).toFixed(2)),
    matched: rawScore >= 50,
    evidence,
    missing,
  }
}

function scoreTractionSignals(
  company: Company,
  dimension: ThesisDimension
): DimensionScore {
  const evidence: string[] = []
  const missing: string[] = []
  let rawScore = 0

  if (company.signals.length === 0) {
    missing.push('No signals detected for this company')
    return {
      key: dimension.key,
      label: dimension.label,
      weight: dimension.weight,
      rawScore: 0,
      weightedScore: 0,
      matched: false,
      evidence,
      missing,
    }
  }

  // Score each signal with recency decay
  let signalScore = 0
  const signalTypeValues: Record<string, number> = {
    funding: 25,
    partnership: 20,
    product: 18,
    press: 12,
    hiring: 15,
    github: 14,
    leadership: 10,
    other: 5,
  }

  for (const signal of company.signals) {
    const baseValue = signalTypeValues[signal.type] ?? 5
    const confidenceMultiplier =
      signal.confidence === 'high' ? 1.0
        : signal.confidence === 'medium' ? 0.7
          : 0.4
    const days = daysSince(signal.timestamp)
    const recency = recencyMultiplier(days)
    const score = baseValue * confidenceMultiplier * recency

    signalScore += score

    evidence.push(
      `${signal.type.toUpperCase()} — "${signal.title}" ` +
      `(${days}d ago, ${signal.confidence} confidence, +${score.toFixed(1)} pts)`
    )
  }

  rawScore = Math.min(100, signalScore)

  // Bonus for new signals
  const newSignals = company.signals.filter((s) => s.isNew)
  if (newSignals.length > 0) {
    rawScore = Math.min(100, rawScore + newSignals.length * 5)
    evidence.push(`${newSignals.length} new signal(s) detected since last check`)
  }

  if (rawScore < 30) {
    missing.push('Signal activity is low — limited recent momentum detected')
  }

  return {
    key: dimension.key,
    label: dimension.label,
    weight: dimension.weight,
    rawScore: parseFloat(rawScore.toFixed(2)),
    weightedScore: parseFloat(((rawScore * dimension.weight) / 100).toFixed(2)),
    matched: rawScore >= 40,
    evidence,
    missing,
  }
}

function scoreTeamQuality(
  company: Company,
  dimension: ThesisDimension,
  enrichment?: EnrichmentPayload
): DimensionScore {
  const evidence: string[] = []
  const missing: string[] = []
  let rawScore = 30 // baseline — we assume some quality by default

  const { keywords } = dimension.criteria
  if (!keywords) {
    return {
      key: dimension.key,
      label: dimension.label,
      weight: dimension.weight,
      rawScore,
      weightedScore: parseFloat(((rawScore * dimension.weight) / 100).toFixed(2)),
      matched: false,
      evidence: ['No team keyword criteria defined'],
      missing: [],
    }
  }

  // Check founder names for signals
  const founderText = company.founderNames.join(' ').toLowerCase()
  const founderHits = keywords.filter((kw) =>
    founderText.includes(kw.toLowerCase())
  )
  if (founderHits.length > 0) {
    rawScore += 30
    evidence.push(`Founder background signals: ${founderHits.join(', ')}`)
  }

  // Check enrichment summary for team signals
  if (enrichment?.summary) {
    const summaryHits = keywords.filter((kw) =>
      enrichment.summary!.toLowerCase().includes(kw.toLowerCase())
    )
    if (summaryHits.length > 0) {
      rawScore += 20
      evidence.push(`Enrichment team signals: ${summaryHits.join(', ')}`)
    }
  }

  // Multiple founders = slight positive
  if (company.founderNames.length >= 2) {
    rawScore += 10
    evidence.push(`${company.founderNames.length} co-founders detected`)
  }

  // "Dr." prefix = research background
  if (company.founderNames.some((n) => n.startsWith('Dr.'))) {
    rawScore += 10
    evidence.push('Research background detected (Dr. prefix)')
  }

  rawScore = Math.min(100, rawScore)

  if (rawScore < 50) {
    missing.push(
      'Limited founder background signals — consider manual research'
    )
  }

  return {
    key: dimension.key,
    label: dimension.label,
    weight: dimension.weight,
    rawScore,
    weightedScore: parseFloat(((rawScore * dimension.weight) / 100).toFixed(2)),
    matched: rawScore >= 50,
    evidence,
    missing,
  }
}

// ─── EXPLANATION GENERATOR ────────────────────────────────────────────────────

function generateExplanation(
  company: Company,
  dimensions: DimensionScore[],
  total: number,
  grade: ScoreGrade
): string {
  const matched = dimensions.filter((d) => d.matched)
  const missed = dimensions.filter((d) => !d.matched)

  const topEvidence = dimensions
    .filter((d) => d.evidence.length > 0)
    .flatMap((d) => d.evidence)
    .slice(0, 3)
    .join('; ')

  const missedLabels = missed.map((d) => d.label).join(', ')

  let explanation =
    `${company.name} scores ${total}/100 — ${grade}. `

  if (matched.length === dimensions.length) {
    explanation +=
      `All thesis dimensions matched. Key signals: ${topEvidence}. ` +
      `This company aligns strongly with the fund's mandate.`
  } else if (matched.length > missed.length) {
    explanation +=
      `Matched on ${matched.map((d) => d.label).join(', ')}. ` +
      `Key evidence: ${topEvidence}. ` +
      `Weaker on: ${missedLabels}. Consider whether gaps are deal-breakers.`
  } else if (matched.length > 0) {
    explanation +=
      `Partial match — strong on ${matched.map((d) => d.label).join(', ')} ` +
      `but missed on ${missedLabels}. ` +
      `Review whether thesis flexibility applies here.`
  } else {
    explanation +=
      `No thesis dimensions matched. ` +
      `Missed on: ${missedLabels}. ` +
      `This company falls outside the current fund mandate.`
  }

  return explanation
}

// ─── MAIN ENGINE ──────────────────────────────────────────────────────────────

export function scoreCompany(
  company: Company,
  thesis: ThesisConfig,
  enrichment?: EnrichmentPayload
): ScoreResult {
  const dimensionScores: DimensionScore[] = []

  for (const dimension of thesis.dimensions) {
    let score: DimensionScore

    switch (dimension.key) {
      case 'sector_fit':
        score = scoreSectorFit(company, dimension, enrichment)
        break
      case 'stage_fit':
        score = scoreStageFit(company, dimension)
        break
      case 'geography_fit':
        score = scoreGeographyFit(company, dimension)
        break
      case 'traction_signals':
        score = scoreTractionSignals(company, dimension)
        break
      case 'team_quality':
        score = scoreTeamQuality(company, dimension, enrichment)
        break
      default:
        // Generic fallback scorer for custom dimensions
        score = {
          key: dimension.key,
          label: dimension.label,
          weight: dimension.weight,
          rawScore: 50,
          weightedScore: parseFloat(
            ((50 * dimension.weight) / 100).toFixed(2)
          ),
          matched: true,
          evidence: ['Custom dimension — scored at neutral 50'],
          missing: [],
        }
    }

    dimensionScores.push(score)
  }

  const total = parseFloat(
    dimensionScores
      .reduce((sum, d) => sum + d.weightedScore, 0)
      .toFixed(1)
  )

  const grade = toGrade(total)

  const explanation = generateExplanation(
    company,
    dimensionScores,
    total,
    grade
  )

  return {
    total,
    grade,
    confidence: calculateConfidence(company, enrichment),
    dimensions: dimensionScores,
    explanation,
    scoredAt: new Date().toISOString(),
    thesisVersion: thesis.version,
  }
}

// ─── BATCH SCORER ─────────────────────────────────────────────────────────────

export function scoreAllCompanies(
  companies: Company[],
  thesis: ThesisConfig
): Company[] {
  return companies
    .map((company) => ({
      ...company,
      thesisScore: scoreCompany(company, thesis, company.enrichment),
    }))
    .sort((a, b) => (b.thesisScore?.total ?? 0) - (a.thesisScore?.total ?? 0))
}