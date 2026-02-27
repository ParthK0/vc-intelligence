'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { SEED_COMPANIES } from '@/lib/data/seed'
import { DEFAULT_THESIS } from '@/lib/data/thesis-default'
import { scoreAllCompanies } from '@/lib/scoring/engine'
import { filterCompanies, sortCompanies, paginateCompanies } from '@/lib/search/index'
import {
  Company,
  SearchFilters,
  SortConfig,
  SectorTag,
  FundingStage,
} from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'

const ALL_SECTORS: SectorTag[] = [
  'AI/ML', 'DevTools', 'FinTech', 'HealthTech',
  'Climate', 'Security', 'Infrastructure', 'SaaS',
  'Marketplace', 'Consumer', 'DeepTech', 'Other',
]

const ALL_STAGES: FundingStage[] = [
  'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+',
]

const SCORED_COMPANIES = scoreAllCompanies(SEED_COMPANIES, DEFAULT_THESIS)

const PAGE_LIMIT = 10

function CompaniesContent(): React.JSX.Element {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [selectedSectors, setSelectedSectors] = useState<SectorTag[]>([])
  const [selectedStages, setSelectedStages] = useState<FundingStage[]>([])
  const [minScore, setMinScore] = useState<number | undefined>()
  const [sort, setSort] = useState<SortConfig>({
    field: 'thesisScore.total',
    direction: 'desc',
  })
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const filters: SearchFilters = {
    query,
    sectors: selectedSectors,
    stages: selectedStages,
    geographies: [],
    minScore,
  }

  const filtered = filterCompanies(SCORED_COMPANIES, filters)
  const sorted = sortCompanies(filtered, sort)
  const { items, total, pages } = paginateCompanies(sorted, page, PAGE_LIMIT)

  useEffect(() => {
    setPage(1)
  }, [query, selectedSectors, selectedStages, minScore])

  const toggleSector = useCallback((sector: SectorTag) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    )
  }, [])

  const toggleStage = useCallback((stage: FundingStage) => {
    setSelectedStages((prev) =>
      prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage]
    )
  }, [])

  function handleSort(field: SortConfig['field']): void {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc',
    }))
  }

  function SortIcon({ field }: { field: SortConfig['field'] }): React.JSX.Element {
    if (sort.field !== field) return <ArrowUpDown className="w-3 h-3 text-zinc-600" />
    return sort.direction === 'desc'
      ? <ArrowDown className="w-3 h-3 text-violet-400" />
      : <ArrowUp className="w-3 h-3 text-violet-400" />
  }

  function clearFilters(): void {
    setQuery('')
    setSelectedSectors([])
    setSelectedStages([])
    setMinScore(undefined)
  }

  const hasActiveFilters =
    query || selectedSectors.length > 0 || selectedStages.length > 0 || minScore

  function formatFunding(amount?: number): string {
    if (!amount) return '—'
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
    return `$${amount}`
  }

  function scoreColor(score: number): string {
    if (score >= 75) return 'bg-emerald-600/20 text-emerald-400'
    if (score >= 55) return 'bg-amber-600/20 text-amber-400'
    if (score >= 35) return 'bg-zinc-700 text-zinc-300'
    return 'bg-zinc-800 text-zinc-500'
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <TopBar
        title="Companies"
        subtitle={`${total} companies · ${SCORED_COMPANIES.filter(c => (c.thesisScore?.total ?? 0) >= 75).length} strong matches`}
      />

      <div className="p-6 space-y-4">

        {/* Search + Filter Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, sector, tag, founder..."
              className="pl-9 h-9 bg-zinc-900 border-zinc-700/60 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-violet-500/50"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'h-9 gap-2 border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800',
              showFilters && 'border-violet-500/50 text-violet-400'
            )}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            {(selectedSectors.length + selectedStages.length) > 0 && (
              <span className="bg-violet-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {selectedSectors.length + selectedStages.length}
              </span>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 text-zinc-500 hover:text-zinc-300 gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </Button>
          )}

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const name = window.prompt('Save search as:')
                if (name) {
                  import('@/lib/persistence/saved-searches').then(({ saveSearch }) => {
                    saveSearch(name, filters, items.map(c => c.id))
                    alert(`Search "${name}" saved!`)
                  })
                }
              }}
              className="h-9 border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-100 text-xs"
            >
              Save Search
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
            <div>
              <p className="text-xs font-medium text-zinc-400 mb-2">Sector</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_SECTORS.map((sector) => (
                  <button
                    key={sector}
                    onClick={() => toggleSector(sector)}
                    className={cn(
                      'text-xs px-2.5 py-1 rounded-full border transition-all',
                      selectedSectors.includes(sector)
                        ? 'bg-violet-600/20 border-violet-500/50 text-violet-300'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    )}
                  >
                    {sector}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-zinc-400 mb-2">Stage</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_STAGES.map((stage) => (
                  <button
                    key={stage}
                    onClick={() => toggleStage(stage)}
                    className={cn(
                      'text-xs px-2.5 py-1 rounded-full border transition-all',
                      selectedStages.includes(stage)
                        ? 'bg-violet-600/20 border-violet-500/50 text-violet-300'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    )}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-zinc-400 mb-2">
                Min Thesis Score: {minScore ?? 0}
              </p>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={minScore ?? 0}
                onChange={(e) => setMinScore(Number(e.target.value) || undefined)}
                className="w-48 accent-violet-500"
              />
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/50">
            <button
              onClick={() => handleSort('name')}
              className="col-span-3 flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-300 text-left"
            >
              Company <SortIcon field="name" />
            </button>
            <div className="col-span-1 text-[11px] font-medium text-zinc-500">Stage</div>
            <div className="col-span-2 text-[11px] font-medium text-zinc-500">Sector</div>
            <button
              onClick={() => handleSort('lastFundingAmount')}
              className="col-span-2 flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-300"
            >
              Raised <SortIcon field="lastFundingAmount" />
            </button>
            <button
              onClick={() => handleSort('signals.length')}
              className="col-span-1 flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-300"
            >
              Signals <SortIcon field="signals.length" />
            </button>
            <button
              onClick={() => handleSort('thesisScore.total')}
              className="col-span-2 flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-300"
            >
              Thesis Score <SortIcon field="thesisScore.total" />
            </button>
            <div className="col-span-1 text-[11px] font-medium text-zinc-500">Action</div>
          </div>

          {items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-zinc-500 text-sm">No companies match your filters</p>
              <button
                onClick={clearFilters}
                className="text-violet-400 text-xs mt-2 hover:text-violet-300"
              >
                Clear filters
              </button>
            </div>
          ) : (
            items.map((company: Company) => (
              <Link
                key={company.id}
                href={`/companies/${company.id}`}
                className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-zinc-800/60 hover:bg-zinc-800/40 transition-colors group"
              >
                <div className="col-span-3 flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-zinc-400">
                      {company.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-zinc-200 group-hover:text-white truncate">
                      {company.name}
                    </p>
                    <p className="text-[10px] text-zinc-500 truncate">
                      {company.domain}
                    </p>
                  </div>
                </div>

                <div className="col-span-1 flex items-center">
                  <Badge
                    variant="secondary"
                    className="text-[10px] bg-zinc-800 text-zinc-400 border-0 px-1.5"
                  >
                    {company.stage}
                  </Badge>
                </div>

                <div className="col-span-2 flex items-center">
                  <span className="text-xs text-zinc-400">{company.sector}</span>
                </div>

                <div className="col-span-2 flex items-center">
                  <span className="text-xs text-zinc-400">
                    {formatFunding(company.totalRaised)}
                  </span>
                </div>

                <div className="col-span-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-zinc-600" />
                  <span className="text-xs text-zinc-400">
                    {company.signals.length}
                  </span>
                  {company.signals.some((s) => s.isNew) && (
                    <span className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
                  )}
                </div>

                <div className="col-span-2 flex items-center">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={cn(
                          'text-xs font-bold px-1.5 py-0.5 rounded',
                          scoreColor(company.thesisScore?.total ?? 0)
                        )}
                      >
                        {company.thesisScore?.total ?? 0}
                      </span>
                      <span className="text-[10px] text-zinc-600">
                        {company.thesisScore?.grade}
                      </span>
                    </div>
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          (company.thesisScore?.total ?? 0) >= 75
                            ? 'bg-emerald-500'
                            : (company.thesisScore?.total ?? 0) >= 55
                            ? 'bg-amber-500'
                            : 'bg-zinc-600'
                        )}
                        style={{ width: `${company.thesisScore?.total ?? 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-span-1 flex items-center">
                  <span className="text-[10px] text-violet-400 group-hover:text-violet-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    View →
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">
              Showing {((page - 1) * PAGE_LIMIT) + 1}–{Math.min(page * PAGE_LIMIT, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-7 w-7 p-0 border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 disabled:opacity-30"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p)}
                  className={cn(
                    'h-7 w-7 p-0 text-xs border-zinc-700 bg-zinc-900',
                    p === page
                      ? 'border-violet-500/50 text-violet-400 bg-violet-600/10'
                      : 'text-zinc-400 hover:bg-zinc-800'
                  )}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="h-7 w-7 p-0 border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 disabled:opacity-30"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CompaniesPage(): React.JSX.Element {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950">
        <TopBar title="Companies" subtitle="Loading..." />
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-9 bg-zinc-800 rounded-lg w-96" />
            <div className="h-64 bg-zinc-800 rounded-xl" />
          </div>
        </div>
      </div>
    }>
      <CompaniesContent />
    </Suspense>
  )
}
