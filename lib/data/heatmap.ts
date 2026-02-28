// lib/data/heatmap.ts
// Signal heatmap data builder

import { Company, SectorTag, FundingStage } from '@/lib/types'

export interface HeatmapCell {
    sector: SectorTag
    stage: FundingStage
    signalCount: number
    companyCount: number
    intensity: number // 0-1
}

export interface SignalTimelinePoint {
    weekLabel: string
    count: number
    weekStart: Date
}

const ALL_SECTORS: SectorTag[] = [
    'AI/ML', 'DevTools', 'FinTech', 'HealthTech', 'Climate',
    'Security', 'Infrastructure', 'SaaS', 'Marketplace', 'Consumer', 'DeepTech',
]

const ALL_STAGES: FundingStage[] = [
    'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+',
]

export function buildHeatmapData(companies: Company[]): HeatmapCell[] {
    const cells: HeatmapCell[] = []
    let maxSignals = 0

    for (const sector of ALL_SECTORS) {
        for (const stage of ALL_STAGES) {
            const matching = companies.filter(c => c.sector === sector && c.stage === stage)
            const signalCount = matching.reduce((s, c) => s + c.signals.length, 0)
            if (signalCount > maxSignals) maxSignals = signalCount

            cells.push({
                sector,
                stage,
                signalCount,
                companyCount: matching.length,
                intensity: 0, // will normalize after
            })
        }
    }

    // Normalize intensity
    if (maxSignals > 0) {
        for (const cell of cells) {
            cell.intensity = cell.signalCount / maxSignals
        }
    }

    return cells
}

export function buildSignalTimeline(companies: Company[], weeks: number = 12): SignalTimelinePoint[] {
    const now = new Date()
    const points: SignalTimelinePoint[] = []

    for (let i = weeks - 1; i >= 0; i--) {
        const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)

        const count = companies.reduce((total, c) =>
            total + c.signals.filter(s => {
                const t = new Date(s.timestamp)
                return t >= weekStart && t < weekEnd
            }).length
            , 0)

        const month = weekStart.toLocaleDateString('en-US', { month: 'short' })
        const day = weekStart.getDate()
        points.push({
            weekLabel: `${month} ${day}`,
            count,
            weekStart,
        })
    }

    return points
}

export { ALL_SECTORS, ALL_STAGES }
