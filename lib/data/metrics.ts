// lib/data/metrics.ts
// Fund dashboard metrics engine

import { Company, PipelineStage } from '@/lib/types'
import { getPipeline, PIPELINE_STAGES } from '@/lib/persistence/pipeline'
import { getAuditLog } from '@/lib/persistence/audit'

export interface FundMetrics {
    dealFlowThisWeek: number
    dealFlowLastWeek: number
    dealFlowDelta: number
    avgThesisScore: number
    avgRiskScore: number
    totalInPipeline: number
    pipelineByStage: { stage: string; label: string; count: number; color: string }[]
    conversionRates: {
        sourcedToIntro: number
        introToPartnerReview: number
        partnerReviewToIC: number
        icToInvested: number
        overallFunnel: number
    }
    sectorDistribution: { sector: string; count: number; percentage: number }[]
    topSectors: string[]
    weeklyActivity: { week: string; companies: number; signals: number }[]
}

function daysSince(isoDate: string): number {
    return Math.floor(
        (Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24)
    )
}

export function calculateFundMetrics(companies: Company[]): FundMetrics {
    const pipeline = getPipeline()
    const audit = getAuditLog(undefined, 500)

    // Deal flow
    const thisWeek = companies.filter(c => daysSince(c.addedAt) <= 7).length
    const lastWeek = companies.filter(
        c => daysSince(c.addedAt) > 7 && daysSince(c.addedAt) <= 14
    ).length

    // Average thesis score
    const scores = companies
        .map(c => c.thesisScore?.total ?? 0)
        .filter(s => s > 0)
    const avgScore =
        scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0

    // Pipeline breakdown
    const pipelineByStage = PIPELINE_STAGES.map(stage => ({
        stage: stage.key,
        label: stage.label,
        count: (pipeline[stage.key] ?? []).length,
        color: stage.color,
    }))

    const totalInPipeline = pipelineByStage.reduce((s, p) => s + p.count, 0)

    // Conversion rates (approximate based on current pipeline)
    const stageCounts: Record<PipelineStage, number> = {
        sourced: (pipeline.sourced ?? []).length,
        intro: (pipeline.intro ?? []).length,
        partner_review: (pipeline.partner_review ?? []).length,
        ic: (pipeline.ic ?? []).length,
        invested: (pipeline.invested ?? []).length,
        passed: (pipeline.passed ?? []).length,
    }

    const totalSourced = Object.values(stageCounts).reduce((s, v) => s + v, 0)
    const pastIntro = stageCounts.intro + stageCounts.partner_review + stageCounts.ic + stageCounts.invested
    const pastPartner = stageCounts.partner_review + stageCounts.ic + stageCounts.invested
    const pastIC = stageCounts.ic + stageCounts.invested

    const conversionRates = {
        sourcedToIntro: totalSourced > 0 ? Math.round((pastIntro / totalSourced) * 100) : 0,
        introToPartnerReview: pastIntro > 0 ? Math.round((pastPartner / pastIntro) * 100) : 0,
        partnerReviewToIC: pastPartner > 0 ? Math.round((pastIC / pastPartner) * 100) : 0,
        icToInvested: pastIC > 0 ? Math.round((stageCounts.invested / pastIC) * 100) : 0,
        overallFunnel: totalSourced > 0 ? Math.round((stageCounts.invested / totalSourced) * 100) : 0,
    }

    // Sector distribution
    const sectorMap = new Map<string, number>()
    companies.forEach(c => {
        sectorMap.set(c.sector, (sectorMap.get(c.sector) ?? 0) + 1)
    })
    const sectorDistribution = [...sectorMap.entries()]
        .map(([sector, count]) => ({
            sector,
            count,
            percentage: Math.round((count / companies.length) * 100),
        }))
        .sort((a, b) => b.count - a.count)

    const topSectors = sectorDistribution.slice(0, 3).map(s => s.sector)

    // Weekly activity (last 8 weeks)
    const weeklyActivity: { week: string; companies: number; signals: number }[] = []
    for (let i = 7; i >= 0; i--) {
        const weekStart = i * 7
        const weekEnd = (i - 1) * 7
        const label = i === 0 ? 'This week' : i === 1 ? 'Last week' : `${i}w ago`
        const companiesInWeek = companies.filter(
            c => daysSince(c.addedAt) >= (weekEnd < 0 ? 0 : weekEnd) && daysSince(c.addedAt) < weekStart + 7
        ).length
        const signalsInWeek = companies.flatMap(c => c.signals).filter(
            s => daysSince(s.timestamp) >= (weekEnd < 0 ? 0 : weekEnd) && daysSince(s.timestamp) < weekStart + 7
        ).length
        weeklyActivity.push({ week: label, companies: companiesInWeek, signals: signalsInWeek })
    }

    return {
        dealFlowThisWeek: thisWeek,
        dealFlowLastWeek: lastWeek,
        dealFlowDelta: thisWeek - lastWeek,
        avgThesisScore: avgScore,
        avgRiskScore: 0, // populated when risk scoring runs
        totalInPipeline,
        pipelineByStage,
        conversionRates,
        sectorDistribution,
        topSectors,
        weeklyActivity,
    }
}
