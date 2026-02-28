// lib/scoring/risk.ts
// Risk Scoring Engine — separate from thesis score

import { Company, EnrichmentPayload } from '@/lib/types'

export interface RiskFactor {
    key: string
    label: string
    severity: 'high' | 'medium' | 'low'
    score: number  // 0–100 contribution to risk
    reason: string
}

export interface RiskResult {
    totalRisk: number    // 0–100
    grade: 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Very High Risk'
    factors: RiskFactor[]
    summary: string
}

function daysSince(isoDate: string): number {
    return Math.floor(
        (Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24)
    )
}

export function calculateRisk(
    company: Company,
    enrichment?: EnrichmentPayload | null
): RiskResult {
    const factors: RiskFactor[] = []

    // 1. Signal sparsity (0–25 risk points)
    const signalCount = company.signals.length
    if (signalCount === 0) {
        factors.push({
            key: 'signal_sparsity',
            label: 'Signal Sparsity',
            severity: 'high',
            score: 25,
            reason: 'No signals detected — limited visibility into company activity',
        })
    } else if (signalCount < 3) {
        factors.push({
            key: 'signal_sparsity',
            label: 'Signal Sparsity',
            severity: 'medium',
            score: 12,
            reason: `Only ${signalCount} signal(s) — limited coverage`,
        })
    }

    // 2. Funding staleness (0–20 risk points)
    if (company.lastFundingDate) {
        const days = daysSince(company.lastFundingDate)
        if (days > 365) {
            factors.push({
                key: 'funding_stale',
                label: 'Stale Funding',
                severity: 'high',
                score: 20,
                reason: `Last funding was ${Math.round(days / 30)} months ago — runway concerns`,
            })
        } else if (days > 180) {
            factors.push({
                key: 'funding_stale',
                label: 'Aging Funding',
                severity: 'medium',
                score: 10,
                reason: `Last funding was ${Math.round(days / 30)} months ago`,
            })
        }
    } else {
        factors.push({
            key: 'funding_unknown',
            label: 'Unknown Funding',
            severity: 'medium',
            score: 15,
            reason: 'No funding data available',
        })
    }

    // 3. Stage mismatch to traction (0–15 risk points)
    const highConfSignals = company.signals.filter(
        s => s.confidence === 'high'
    ).length
    if (
        (company.stage === 'Series A' || company.stage === 'Series B') &&
        highConfSignals < 2
    ) {
        factors.push({
            key: 'stage_traction_mismatch',
            label: 'Stage-Traction Gap',
            severity: 'medium',
            score: 15,
            reason: `${company.stage} stage but only ${highConfSignals} high-confidence signals`,
        })
    }

    // 4. Unknown founders (0–15 risk points)
    if (
        company.founderNames.length === 0 ||
        (company.founderNames.length === 1 &&
            company.founderNames[0] === 'Unknown')
    ) {
        factors.push({
            key: 'founder_unknown',
            label: 'Unknown Founders',
            severity: 'high',
            score: 15,
            reason: 'No founder information available — no way to assess team quality',
        })
    }

    // 5. No enrichment (0–10 risk points)
    if (!enrichment || enrichment.status !== 'success') {
        factors.push({
            key: 'no_enrichment',
            label: 'Not Enriched',
            severity: 'low',
            score: 10,
            reason: 'Company has not been enriched — limited AI-derived intelligence',
        })
    }

    // 6. Lack of hiring signals (0–10 risk points)
    const hiringSignals = company.signals.filter(
        s => s.type === 'hiring'
    ).length
    if (hiringSignals === 0) {
        factors.push({
            key: 'no_hiring',
            label: 'No Hiring Activity',
            severity: 'low',
            score: 8,
            reason: 'No hiring signals detected — may indicate slow growth',
        })
    }

    // 7. Small team at late stage (0–10 risk points)
    if (
        company.headcount &&
        ['1-10', '11-50'].includes(company.headcount) &&
        ['Series A', 'Series B', 'Series C+'].includes(company.stage)
    ) {
        factors.push({
            key: 'small_team_late_stage',
            label: 'Team Size Concern',
            severity: 'medium',
            score: 10,
            reason: `Headcount ${company.headcount} seems low for ${company.stage}`,
        })
    }

    // Calculate total risk
    const totalRisk = Math.min(
        100,
        factors.reduce((sum, f) => sum + f.score, 0)
    )

    // Grade
    let grade: RiskResult['grade']
    if (totalRisk >= 60) grade = 'Very High Risk'
    else if (totalRisk >= 40) grade = 'High Risk'
    else if (totalRisk >= 20) grade = 'Moderate Risk'
    else grade = 'Low Risk'

    // Summary
    const highFactors = factors
        .filter(f => f.severity === 'high')
        .map(f => f.label)
    const summary =
        totalRisk < 20
            ? `${company.name} shows minimal risk indicators. Data coverage is adequate.`
            : `${company.name} has risk score ${totalRisk}/100 (${grade}). ` +
            (highFactors.length > 0
                ? `Key concerns: ${highFactors.join(', ')}. `
                : '') +
            `${factors.length} risk factor(s) identified.`

    return { totalRisk, grade, factors, summary }
}

export function riskColor(risk: number): string {
    if (risk >= 60) return 'text-red-400'
    if (risk >= 40) return 'text-orange-400'
    if (risk >= 20) return 'text-amber-400'
    return 'text-emerald-400'
}

export function riskBg(risk: number): string {
    if (risk >= 60) return 'bg-red-600/15'
    if (risk >= 40) return 'bg-orange-600/15'
    if (risk >= 20) return 'bg-amber-600/15'
    return 'bg-emerald-600/15'
}
