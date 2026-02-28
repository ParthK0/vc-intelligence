// lib/persistence/portfolio.ts
// Portfolio management + conflict detection

import { PortfolioCompany, PortfolioConflict, Company } from '@/lib/types'

const PORTFOLIO_KEY = 'vc_scout_portfolio'

export function getPortfolio(): PortfolioCompany[] {
    try {
        const raw = localStorage.getItem(PORTFOLIO_KEY)
        return raw ? (JSON.parse(raw) as PortfolioCompany[]) : []
    } catch {
        return []
    }
}

export function addToPortfolio(companyId: string): void {
    try {
        const portfolio = getPortfolio()
        if (portfolio.some(p => p.companyId === companyId)) return
        portfolio.push({ companyId, addedAt: new Date().toISOString() })
        localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(portfolio))
    } catch {
        console.error('Failed to add to portfolio')
    }
}

export function removeFromPortfolio(companyId: string): void {
    try {
        const portfolio = getPortfolio().filter(p => p.companyId !== companyId)
        localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(portfolio))
    } catch {
        console.error('Failed to remove from portfolio')
    }
}

export function detectConflicts(
    targetCompany: Company,
    allCompanies: Company[],
    portfolioIds: string[]
): PortfolioConflict[] {
    if (portfolioIds.length === 0) return []
    if (portfolioIds.includes(targetCompany.id)) return []

    const conflicts: PortfolioConflict[] = []
    const targetKeywords = new Set([
        ...targetCompany.tags.map(t => t.toLowerCase()),
        targetCompany.sector.toLowerCase(),
        ...targetCompany.tagline.toLowerCase().split(/\s+/).filter(w => w.length > 3),
    ])

    for (const pId of portfolioIds) {
        const pCompany = allCompanies.find(c => c.id === pId)
        if (!pCompany) continue

        const pKeywords = new Set([
            ...pCompany.tags.map(t => t.toLowerCase()),
            pCompany.sector.toLowerCase(),
            ...pCompany.tagline.toLowerCase().split(/\s+/).filter(w => w.length > 3),
        ])

        const matching = [...targetKeywords].filter(k => pKeywords.has(k))
        const union = new Set([...targetKeywords, ...pKeywords]).size
        const overlapPercent = union > 0 ? Math.round((matching.length / union) * 100) : 0

        if (overlapPercent > 15) {
            conflicts.push({
                portfolioCompanyId: pId,
                portfolioCompanyName: pCompany.name,
                overlapPercent,
                matchingKeywords: matching.slice(0, 5),
                matchingSectors: pCompany.sector === targetCompany.sector,
            })
        }
    }

    return conflicts.sort((a, b) => b.overlapPercent - a.overlapPercent)
}
