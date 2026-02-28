// lib/data/digest.ts
// Weekly digest generator

import { Company, SavedSearch, DigestReport, SignalType } from '@/lib/types'
import { filterCompanies } from '@/lib/search/index'

export function generateDigest(
    companies: Company[],
    savedSearches: SavedSearch[]
): DigestReport {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Recent signals
    const recentSignals = companies.flatMap(c =>
        c.signals
            .filter(s => new Date(s.timestamp) >= weekAgo)
            .map(s => ({
                company: c.name,
                signal: s.title,
                type: s.type as SignalType,
            }))
    ).sort((a, b) => a.company.localeCompare(b.company))

    // Companies by sector  
    const sectorCounts = new Map<string, number>()
    companies.forEach(c => {
        sectorCounts.set(c.sector, (sectorCounts.get(c.sector) ?? 0) + 1)
    })
    const newCompanies = [...sectorCounts.entries()]
        .map(([sector, count]) => ({ sector, count }))
        .sort((a, b) => b.count - a.count)

    // High scorers
    const highScorers = companies
        .filter(c => (c.thesisScore?.total ?? 0) >= 70)
        .map(c => ({
            name: c.name,
            score: c.thesisScore?.total ?? 0,
            sector: c.sector,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)

    // Average score
    const avgScore = companies.length > 0
        ? Math.round(companies.reduce((s, c) => s + (c.thesisScore?.total ?? 0), 0) / companies.length)
        : 0

    return {
        generatedAt: now.toISOString(),
        period: `${weekAgo.toLocaleDateString()} – ${now.toLocaleDateString()}`,
        newCompanies,
        highScorers,
        topSignals: recentSignals.slice(0, 15),
        totalSignals: recentSignals.length,
        avgScore,
    }
}
