// lib/scoring/momentum.ts
// Company Momentum Index — measures signal velocity

import { Company } from '@/lib/types'

export type MomentumLevel = 'high' | 'emerging' | 'stale'

export interface MomentumResult {
    score: number          // 0–100
    level: MomentumLevel
    label: string          // emoji + text
    signalVelocity: number // signals per month
    trend: 'accelerating' | 'steady' | 'decelerating'
}

function daysSince(isoDate: string): number {
    return Math.floor(
        (Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24)
    )
}

function recencyDecay(days: number): number {
    if (days <= 7) return 1.0
    if (days <= 30) return 0.8
    if (days <= 90) return 0.5
    if (days <= 180) return 0.25
    return 0.1
}

const CONFIDENCE_WEIGHTS: Record<string, number> = {
    high: 1.0,
    medium: 0.6,
    low: 0.3,
}

const TYPE_WEIGHTS: Record<string, number> = {
    funding: 3.0,
    partnership: 2.5,
    product: 2.0,
    press: 1.5,
    hiring: 1.8,
    github: 1.2,
    leadership: 1.0,
    other: 0.5,
}

export function calculateMomentum(company: Company): MomentumResult {
    if (company.signals.length === 0) {
        return {
            score: 0,
            level: 'stale',
            label: '⚠ Stale',
            signalVelocity: 0,
            trend: 'decelerating',
        }
    }

    // Calculate weighted momentum score
    let momentumScore = 0
    for (const signal of company.signals) {
        const days = daysSince(signal.timestamp)
        const frequency = recencyDecay(days)
        const confidence = CONFIDENCE_WEIGHTS[signal.confidence] ?? 0.3
        const typeWeight = TYPE_WEIGHTS[signal.type] ?? 0.5
        momentumScore += frequency * confidence * typeWeight * 10
    }

    // Normalize to 0–100
    momentumScore = Math.min(100, Math.round(momentumScore))

    // Calculate signal velocity (signals per 30 days)
    const recentSignals = company.signals.filter(
        s => daysSince(s.timestamp) <= 30
    ).length
    const olderSignals = company.signals.filter(
        s => daysSince(s.timestamp) > 30 && daysSince(s.timestamp) <= 90
    ).length

    const signalVelocity = Math.round(recentSignals * 10) / 10
    const olderVelocity = Math.round((olderSignals / 2) * 10) / 10 // per month of 2 months

    // Trend
    let trend: 'accelerating' | 'steady' | 'decelerating'
    if (signalVelocity > olderVelocity * 1.3) {
        trend = 'accelerating'
    } else if (signalVelocity < olderVelocity * 0.7) {
        trend = 'decelerating'
    } else {
        trend = 'steady'
    }

    // Level
    let level: MomentumLevel
    let label: string
    if (momentumScore >= 60) {
        level = 'high'
        label = '🔥 High Momentum'
    } else if (momentumScore >= 30) {
        level = 'emerging'
        label = '📈 Emerging'
    } else {
        level = 'stale'
        label = '⚠ Stale'
    }

    return {
        score: momentumScore,
        level,
        label,
        signalVelocity,
        trend,
    }
}

export function getMomentumColor(level: MomentumLevel): string {
    switch (level) {
        case 'high':
            return 'text-orange-400'
        case 'emerging':
            return 'text-emerald-400'
        case 'stale':
            return 'text-zinc-500'
    }
}

export function getMomentumBg(level: MomentumLevel): string {
    switch (level) {
        case 'high':
            return 'bg-orange-600/15'
        case 'emerging':
            return 'bg-emerald-600/15'
        case 'stale':
            return 'bg-zinc-800'
    }
}
