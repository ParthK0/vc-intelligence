// lib/persistence/visit-tracker.ts
// Tracks when user last visited each company profile

import { VisitRecord, VisitChanges } from '@/lib/types'

const VISITS_KEY = 'vc_scout_visits'

function getAllVisits(): Record<string, VisitRecord> {
    try {
        const raw = localStorage.getItem(VISITS_KEY)
        return raw ? (JSON.parse(raw) as Record<string, VisitRecord>) : {}
    } catch {
        return {}
    }
}

function saveAllVisits(visits: Record<string, VisitRecord>): void {
    try {
        localStorage.setItem(VISITS_KEY, JSON.stringify(visits))
    } catch {
        console.error('Failed to save visits')
    }
}

export function getLastVisit(companyId: string): VisitRecord | null {
    const visits = getAllVisits()
    return visits[companyId] ?? null
}

export function recordVisit(
    companyId: string,
    currentScore: number,
    currentSignalCount: number,
    currentEnrichmentAt?: string
): void {
    const visits = getAllVisits()
    visits[companyId] = {
        companyId,
        lastVisitAt: new Date().toISOString(),
        lastScore: currentScore,
        lastSignalCount: currentSignalCount,
        lastEnrichmentAt: currentEnrichmentAt,
    }
    saveAllVisits(visits)
}

export function getChanges(
    companyId: string,
    currentScore: number,
    currentSignalCount: number,
    currentEnrichmentAt?: string
): VisitChanges | null {
    const lastVisit = getLastVisit(companyId)
    if (!lastVisit) return null

    const daysSinceVisit = Math.floor(
        (Date.now() - new Date(lastVisit.lastVisitAt).getTime()) / (1000 * 60 * 60 * 24)
    )

    return {
        scoreDelta: currentScore - lastVisit.lastScore,
        newSignalCount: currentSignalCount - lastVisit.lastSignalCount,
        wasReEnriched: !!currentEnrichmentAt && currentEnrichmentAt !== lastVisit.lastEnrichmentAt,
        daysSinceVisit,
    }
}
