'use client'

import React, { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { getSavedSearches, deleteSavedSearch, updateSavedSearch } from '@/lib/persistence/saved-searches'
import { SEED_COMPANIES } from '@/lib/data/seed'
import { DEFAULT_THESIS } from '@/lib/data/thesis-default'
import { scoreAllCompanies } from '@/lib/scoring/engine'
import { filterCompanies } from '@/lib/search/index'
import { SavedSearch } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Search, Trash2, RefreshCw, ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

const SCORED = scoreAllCompanies(SEED_COMPANIES, DEFAULT_THESIS)

export default function SavedSearchesPage(): React.JSX.Element {
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [rerunning, setRerunning] = useState<string | null>(null)

  useEffect(() => {
    setSearches(getSavedSearches())
  }, [])

  function handleDelete(id: string): void {
    deleteSavedSearch(id)
    setSearches(getSavedSearches())
  }

  async function handleRerun(search: SavedSearch): Promise<void> {
    setRerunning(search.id)
    await new Promise((r) => setTimeout(r, 600)) // simulate async
    const results = filterCompanies(SCORED, search.filters)
    updateSavedSearch(search.id, results.map((c) => c.id))
    setSearches(getSavedSearches())
    setRerunning(null)
  }

  function buildSearchUrl(search: SavedSearch): string {
    const params = new URLSearchParams()
    if (search.filters.query) params.set('q', search.filters.query)
    return `/companies?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <TopBar title="Saved Searches" subtitle={`${searches.length} saved`} />

      <div className="p-6">
        {searches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Search className="w-12 h-12 text-zinc-800 mb-4" />
            <p className="text-zinc-400 text-sm mb-1">No saved searches yet</p>
            <p className="text-zinc-600 text-xs mb-4">
              Save a search from the Companies page to monitor it over time
            </p>
            <Link href="/companies">
              <Button className="bg-violet-600 hover:bg-violet-500 text-white text-xs">
                Go to Companies
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3 max-w-2xl">
            {searches.map((search) => {
              const currentResults = filterCompanies(SCORED, search.filters)
              const diff = currentResults.length - search.resultCount
              const isRerunning = rerunning === search.id

              return (
                <div
                  key={search.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                        <p className="text-sm font-medium text-zinc-200">{search.name}</p>
                        {diff !== 0 && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            diff > 0
                              ? 'bg-emerald-600/20 text-emerald-400'
                              : 'bg-amber-600/20 text-amber-400'
                          }`}>
                            {diff > 0 ? `+${diff}` : diff} since last run
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {search.filters.query && (
                          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                            &quot;{search.filters.query}&quot;
                          </span>
                        )}
                        {search.filters.sectors?.map((s) => (
                          <span key={s} className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                        {search.filters.stages?.map((s) => (
                          <span key={s} className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                        {search.filters.minScore && (
                          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                            Score ≥ {search.filters.minScore}
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-zinc-600 mt-2">
                        {search.resultCount} results · Last run{' '}
                        {formatDistanceToNow(new Date(search.lastRunAt), { addSuffix: true })}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRerun(search)}
                        disabled={isRerunning}
                        className="h-7 gap-1 border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-100 text-xs"
                      >
                        <RefreshCw className={`w-3 h-3 ${isRerunning ? 'animate-spin' : ''}`} />
                        {isRerunning ? 'Running...' : 'Re-run'}
                      </Button>
                      <Link href={buildSearchUrl(search)}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1 border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-100 text-xs"
                        >
                          View
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(search.id)}
                        className="h-7 w-7 p-0 text-zinc-600 hover:text-red-400 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
