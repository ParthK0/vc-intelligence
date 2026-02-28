// lib/search/similarity.ts
// Hybrid similarity engine for finding similar companies

import { Company } from '@/lib/types'

export interface SimilarCompany {
    company: Company
    similarityScore: number
    matchReasons: string[]
}

function jaccardSimilarity(a: string[], b: string[]): number {
    const setA = new Set(a.map(s => s.toLowerCase()))
    const setB = new Set(b.map(s => s.toLowerCase()))
    const intersection = [...setA].filter(x => setB.has(x)).length
    const union = new Set([...setA, ...setB]).size
    return union === 0 ? 0 : intersection / union
}

const STAGE_ORDER = ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+']

function stageProximity(a: string, b: string): number {
    const idxA = STAGE_ORDER.indexOf(a)
    const idxB = STAGE_ORDER.indexOf(b)
    if (idxA === -1 || idxB === -1) return 0
    const distance = Math.abs(idxA - idxB)
    return Math.max(0, 1 - distance * 0.3)
}

export function findSimilarCompanies(
    target: Company,
    allCompanies: Company[],
    limit: number = 5
): SimilarCompany[] {
    const others = allCompanies.filter(c => c.id !== target.id)

    const scored: SimilarCompany[] = others.map(company => {
        const reasons: string[] = []
        let totalScore = 0

        // Sector match (40%)
        const sectorMatch = company.sector === target.sector ? 1 : 0
        if (sectorMatch) reasons.push(`Same sector: ${target.sector}`)
        totalScore += sectorMatch * 40

        // Tag overlap (30%)
        const tagSim = jaccardSimilarity(company.tags, target.tags)
        if (tagSim > 0) {
            const overlap = company.tags.filter(t =>
                target.tags.map(tt => tt.toLowerCase()).includes(t.toLowerCase())
            )
            if (overlap.length > 0) reasons.push(`Tags: ${overlap.slice(0, 3).join(', ')}`)
        }
        totalScore += tagSim * 30

        // Stage proximity (15%)
        const stageSim = stageProximity(company.stage, target.stage)
        if (stageSim >= 0.7) reasons.push(`Similar stage: ${company.stage}`)
        totalScore += stageSim * 15

        // Geography match (15%)
        const geoMatch = company.geography.toLowerCase().includes(
            target.geography.split(',')[0].trim().toLowerCase()
        ) ? 1 : 0
        if (geoMatch) reasons.push(`Same region`)
        totalScore += geoMatch * 15

        return {
            company,
            similarityScore: Math.round(totalScore),
            matchReasons: reasons,
        }
    })

    return scored
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, limit)
        .filter(s => s.similarityScore > 10)
}
