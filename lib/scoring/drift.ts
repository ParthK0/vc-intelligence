// lib/scoring/drift.ts
// Score drift detection — track score history and compute deltas

export interface ScoreSnapshot {
    companyId: string
    score: number
    timestamp: string
    dimensions: Record<string, number> // key → rawScore
}

export interface ScoreDrift {
    currentScore: number
    previousScore: number
    delta: number
    deltaPercent: number
    direction: 'up' | 'down' | 'stable'
    reasons: string[]
    period: string // e.g. "this week"
}

const HISTORY_KEY = 'vc_scout_score_history'

function getHistory(): Record<string, ScoreSnapshot[]> {
    try {
        const raw = localStorage.getItem(HISTORY_KEY)
        return raw ? (JSON.parse(raw) as Record<string, ScoreSnapshot[]>) : {}
    } catch {
        return {}
    }
}

function saveHistory(history: Record<string, ScoreSnapshot[]>): void {
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    } catch {
        console.error('Failed to save score history')
    }
}

export function recordScore(
    companyId: string,
    score: number,
    dimensions: Record<string, number>
): void {
    const history = getHistory()
    const snapshots = history[companyId] ?? []

    // Only record if score changed or it's been > 1 hour since last snapshot
    const latest = snapshots[snapshots.length - 1]
    if (latest) {
        const hoursSince =
            (Date.now() - new Date(latest.timestamp).getTime()) / (1000 * 60 * 60)
        if (latest.score === score && hoursSince < 1) return
    }

    snapshots.push({
        companyId,
        score,
        timestamp: new Date().toISOString(),
        dimensions,
    })

    // Keep max 50 snapshots per company
    if (snapshots.length > 50) {
        history[companyId] = snapshots.slice(-50)
    } else {
        history[companyId] = snapshots
    }

    saveHistory(history)
}

export function getScoreDrift(companyId: string): ScoreDrift | null {
    const history = getHistory()
    const snapshots = history[companyId] ?? []

    if (snapshots.length < 2) return null

    const current = snapshots[snapshots.length - 1]
    // Find the snapshot closest to 7 days ago
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const previous =
        snapshots.reduce((best, snap) => {
            const snapTime = new Date(snap.timestamp).getTime()
            const bestTime = new Date(best.timestamp).getTime()
            if (Math.abs(snapTime - weekAgo) < Math.abs(bestTime - weekAgo)) {
                return snap
            }
            return best
        }, snapshots[0])

    const delta = Math.round((current.score - previous.score) * 10) / 10
    const reasons: string[] = []

    // Identify which dimensions changed
    for (const [key, currentVal] of Object.entries(current.dimensions)) {
        const prevVal = previous.dimensions[key] ?? 0
        const dimDelta = currentVal - prevVal
        if (Math.abs(dimDelta) >= 5) {
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
            reasons.push(
                `${label} ${dimDelta > 0 ? '+' : ''}${Math.round(dimDelta)}`
            )
        }
    }

    const daysSince = Math.round(
        (Date.now() - new Date(previous.timestamp).getTime()) / (1000 * 60 * 60 * 24)
    )

    return {
        currentScore: current.score,
        previousScore: previous.score,
        delta,
        deltaPercent:
            previous.score > 0
                ? Math.round((delta / previous.score) * 100)
                : 0,
        direction: delta > 1 ? 'up' : delta < -1 ? 'down' : 'stable',
        reasons,
        period: daysSince <= 1 ? 'today' : daysSince <= 7 ? 'this week' : `${daysSince}d ago`,
    }
}

export function getScoreTimeline(
    companyId: string,
    limit = 20
): ScoreSnapshot[] {
    const history = getHistory()
    return (history[companyId] ?? []).slice(-limit)
}
