import Fuse from 'fuse.js'
import { Company, SearchFilters, SortConfig } from '@/lib/types'

export function filterCompanies(
  companies: Company[],
  filters: SearchFilters
): Company[] {
  let result = [...companies]

  if (filters.query && filters.query.trim()) {
    const fuse = new Fuse(result, {
      keys: ['name', 'tagline', 'description', 'sector', 'tags', 'founderNames'],
      threshold: 0.3,
      includeScore: true,
    })
    result = fuse.search(filters.query).map((r) => r.item)
  }

  if (filters.sectors && filters.sectors.length > 0) {
    result = result.filter((c) => filters.sectors.includes(c.sector))
  }

  if (filters.stages && filters.stages.length > 0) {
    result = result.filter((c) => filters.stages.includes(c.stage))
  }

  if (filters.geographies && filters.geographies.length > 0) {
    result = result.filter((c) =>
      filters.geographies.some((g) =>
        c.geography.toLowerCase().includes(g.toLowerCase())
      )
    )
  }

  if (filters.minScore !== undefined) {
    result = result.filter(
      (c) => (c.thesisScore?.total ?? 0) >= filters.minScore!
    )
  }

  if (filters.maxScore !== undefined) {
    result = result.filter(
      (c) => (c.thesisScore?.total ?? 0) <= filters.maxScore!
    )
  }

  if (filters.tags && filters.tags.length > 0) {
    result = result.filter((c) =>
      filters.tags!.some((t) => c.tags.includes(t))
    )
  }

  return result
}

export function sortCompanies(
  companies: Company[],
  sort: SortConfig
): Company[] {
  return [...companies].sort((a, b) => {
    let aVal: number | string = 0
    let bVal: number | string = 0

    if (sort.field === 'thesisScore.total') {
      aVal = a.thesisScore?.total ?? 0
      bVal = b.thesisScore?.total ?? 0
    } else if (sort.field === 'signals.length') {
      aVal = a.signals.length
      bVal = b.signals.length
    } else if (sort.field === 'name') {
      aVal = a.name
      bVal = b.name
    } else if (sort.field === 'lastFundingDate') {
      aVal = a.lastFundingDate ?? ''
      bVal = b.lastFundingDate ?? ''
    } else if (sort.field === 'addedAt') {
      aVal = a.addedAt
      bVal = b.addedAt
    } else if (sort.field === 'lastFundingAmount') {
      aVal = a.lastFundingAmount ?? 0
      bVal = b.lastFundingAmount ?? 0
    }

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sort.direction === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }

    return sort.direction === 'asc'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number)
  })
}

export function paginateCompanies(
  companies: Company[],
  page: number,
  limit: number
): { items: Company[]; total: number; pages: number } {
  const total = companies.length
  const pages = Math.ceil(total / limit)
  const start = (page - 1) * limit
  const items = companies.slice(start, start + limit)
  return { items, total, pages }
}
