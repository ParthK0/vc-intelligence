// lib/scoring/weight-learner.ts
// Semi-AI signal weight learning
// When user moves company to IC/Invested, strengthen dimensions that scored high

import { Company, ThesisConfig, DimensionScore } from '@/lib/types'

export interface WeightAdjustment {
    dimensionKey: string
    originalWeight: number
    adjustedWeight: number
    delta: number
    reason: string
}

export interface LearningEvent {
    companyId: string
    companyName: string
    action: 'ic' | 'invested' | 'passed'
    dimensions: Record<string, number> // key → rawScore
    timestamp: string
}

const ADJUSTMENTS_KEY = 'vc_scout_weight_adjustments'
const EVENTS_KEY = 'vc_scout_learning_events'
const LEARNING_RATE = 0.5 // How much to adjust per event (percentage points)
const MAX_DRIFT = 10      // Max weight change from original (percentage points)

function getAdjustments(): Record<string, number> {
    try {
        const raw = localStorage.getItem(ADJUSTMENTS_KEY)
        return raw ? (JSON.parse(raw) as Record<string, number>) : {}
    } catch {
        return {}
    }
}

function saveAdjustments(adj: Record<string, number>): void {
    try {
        localStorage.setItem(ADJUSTMENTS_KEY, JSON.stringify(adj))
    } catch {
        console.error('Failed to save weight adjustments')
    }
}

function getEvents(): LearningEvent[] {
    try {
        const raw = localStorage.getItem(EVENTS_KEY)
        return raw ? (JSON.parse(raw) as LearningEvent[]) : []
    } catch {
        return []
    }
}

function saveEvents(events: LearningEvent[]): void {
    try {
        localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
    } catch {
        console.error('Failed to save learning events')
    }
}

/**
 * Record an investment decision and learn from it
 */
export function recordDecision(
    company: Company,
    action: 'ic' | 'invested' | 'passed',
    dimensionScores: DimensionScore[]
): WeightAdjustment[] {
    const dimensions: Record<string, number> = {}
    for (const d of dimensionScores) {
        dimensions[d.key] = d.rawScore
    }

    // Save the learning event
    const events = getEvents()
    events.push({
        companyId: company.id,
        companyName: company.name,
        action,
        dimensions,
        timestamp: new Date().toISOString(),
    })
    if (events.length > 100) events.splice(0, events.length - 100)
    saveEvents(events)

    // Compute weight adjustments
    const adjustments = getAdjustments()
    const results: WeightAdjustment[] = []

    for (const dim of dimensionScores) {
        const currentAdj = adjustments[dim.key] ?? 0

        if (action === 'ic' || action === 'invested') {
            // Strengthen dimensions that scored high on positively-decided companies
            if (dim.rawScore >= 70) {
                const delta = Math.min(LEARNING_RATE, MAX_DRIFT - currentAdj)
                if (delta > 0) {
                    adjustments[dim.key] = currentAdj + delta
                    results.push({
                        dimensionKey: dim.key,
                        originalWeight: dim.weight,
                        adjustedWeight: dim.weight + currentAdj + delta,
                        delta,
                        reason: `High on ${action === 'invested' ? 'invested' : 'IC'} company "${company.name}" (score: ${dim.rawScore})`,
                    })
                }
            }
            // Weaken dimensions that scored low on positively-decided companies (they matter less)
            if (dim.rawScore < 30) {
                const delta = Math.max(-LEARNING_RATE, -MAX_DRIFT - currentAdj)
                if (delta < 0) {
                    adjustments[dim.key] = currentAdj + delta
                    results.push({
                        dimensionKey: dim.key,
                        originalWeight: dim.weight,
                        adjustedWeight: dim.weight + currentAdj + delta,
                        delta,
                        reason: `Low on ${action} company but still progressed — dimension may be less critical`,
                    })
                }
            }
        } else if (action === 'passed') {
            // Strengthen dimensions that scored low on passed companies (good filter)
            if (dim.rawScore < 40) {
                const delta = Math.min(LEARNING_RATE * 0.3, MAX_DRIFT - currentAdj)
                if (delta > 0) {
                    adjustments[dim.key] = currentAdj + delta
                    results.push({
                        dimensionKey: dim.key,
                        originalWeight: dim.weight,
                        adjustedWeight: dim.weight + currentAdj + delta,
                        delta,
                        reason: `Low on passed company — confirms dimension importance`,
                    })
                }
            }
        }
    }

    saveAdjustments(adjustments)
    return results
}

/**
 * Apply learned adjustments to a thesis config
 */
export function applyLearnedWeights(thesis: ThesisConfig): ThesisConfig {
    const adjustments = getAdjustments()
    if (Object.keys(adjustments).length === 0) return thesis

    const adjustedDimensions = thesis.dimensions.map(dim => {
        const adj = adjustments[dim.key] ?? 0
        return {
            ...dim,
            weight: Math.max(5, Math.min(50, dim.weight + adj)), // Clamp 5–50
        }
    })

    // Renormalize weights to sum to 100
    const totalWeight = adjustedDimensions.reduce((s, d) => s + d.weight, 0)
    const normalized = adjustedDimensions.map(d => ({
        ...d,
        weight: Math.round((d.weight / totalWeight) * 100),
    }))

    return { ...thesis, dimensions: normalized }
}

/**
 * Get learning stats 
 */
export function getLearningStats(): {
    totalEvents: number
    adjustments: Record<string, number>
    recentEvents: LearningEvent[]
} {
    return {
        totalEvents: getEvents().length,
        adjustments: getAdjustments(),
        recentEvents: getEvents().slice(-10),
    }
}
