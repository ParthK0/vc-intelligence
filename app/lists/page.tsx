'use client'

import React, { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { getLists, saveList, deleteList, removeCompanyFromList } from '@/lib/persistence/lists'
import { SEED_COMPANIES } from '@/lib/data/seed'
import { CompanyList, Company } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BookMarked, Plus, Trash2, Download, X } from 'lucide-react'
import Link from 'next/link'

export default function ListsPage(): React.JSX.Element {
  const [lists, setLists] = useState<CompanyList[]>([])
  const [activeList, setActiveList] = useState<string | null>(null)

  useEffect(() => {
    const loaded = getLists()
    setLists(loaded)
    if (loaded.length > 0) setActiveList(loaded[0].id)
  }, [])

  function handleCreate(): void {
    const name = window.prompt('List name:')
    if (!name) return
    const list: CompanyList = {
      id: `list_${Date.now()}`,
      name,
      companyIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    saveList(list)
    setLists(getLists())
    setActiveList(list.id)
  }

  function handleDelete(listId: string): void {
    if (!window.confirm('Delete this list?')) return
    deleteList(listId)
    const updated = getLists()
    setLists(updated)
    setActiveList(updated[0]?.id ?? null)
  }

  function handleRemoveCompany(listId: string, companyId: string): void {
    removeCompanyFromList(listId, companyId)
    setLists(getLists())
  }

  function handleExportCSV(list: CompanyList): void {
    const companies = list.companyIds
      .map((id) => SEED_COMPANIES.find((c) => c.id === id))
      .filter(Boolean) as Company[]

    const headers = ['Name', 'Domain', 'Sector', 'Stage', 'Geography', 'Total Raised', 'Founders']
    const rows = companies.map((c) => [
      c.name,
      c.domain,
      c.sector,
      c.stage,
      c.geography,
      c.totalRaised?.toString() ?? '',
      c.founderNames.join('; '),
    ])

    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${list.name.replace(/\s+/g, '-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const currentList = lists.find((l) => l.id === activeList)
  const currentCompanies = (currentList?.companyIds ?? [])
    .map((id) => SEED_COMPANIES.find((c) => c.id === id))
    .filter(Boolean) as Company[]

  return (
    <div className="min-h-screen bg-zinc-950">
      <TopBar title="Lists" subtitle={`${lists.length} lists`} />

      <div className="p-6">
        {lists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <BookMarked className="w-12 h-12 text-zinc-800 mb-4" />
            <p className="text-zinc-400 text-sm mb-1">No lists yet</p>
            <p className="text-zinc-600 text-xs mb-6">
              Save companies to lists from their profile page
            </p>
            <Button
              onClick={handleCreate}
              className="bg-violet-600 hover:bg-violet-500 text-white text-xs gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Create First List
            </Button>
          </div>
        ) : (
          <div className="flex gap-5">
            {/* List sidebar */}
            <div className="w-56 flex-shrink-0 space-y-1">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-zinc-500">My Lists</p>
                <button
                  onClick={handleCreate}
                  className="text-violet-400 hover:text-violet-300"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {lists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => setActiveList(list.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-xs transition-all',
                    activeList === list.id
                      ? 'bg-violet-600/15 text-violet-300'
                      : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{list.name}</span>
                    <span className="text-zinc-600 flex-shrink-0 ml-1">
                      {list.companyIds.length}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* List content */}
            {currentList && (
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-zinc-100">
                      {currentList.name}
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {currentCompanies.length} companies
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportCSV(currentList)}
                      className="h-8 gap-1.5 border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-100 text-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export CSV
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(currentList.id)}
                      className="h-8 text-zinc-600 hover:text-red-400 hover:bg-red-900/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {currentCompanies.length === 0 ? (
                  <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-xl p-10 text-center">
                    <p className="text-zinc-500 text-sm">This list is empty</p>
                    <p className="text-zinc-600 text-xs mt-1">
                      Add companies from their profile page
                    </p>
                  </div>
                ) : (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    {currentCompanies.map((company, i) => (
                      <div
                        key={company.id}
                        className={cn(
                          'flex items-center justify-between px-4 py-3',
                          i < currentCompanies.length - 1 && 'border-b border-zinc-800/60'
                        )}
                      >
                        <Link
                          href={`/companies/${company.id}`}
                          className="flex items-center gap-3 flex-1 min-w-0 group"
                        >
                          <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-bold text-zinc-400">
                              {company.name.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-zinc-200 group-hover:text-white truncate">
                              {company.name}
                            </p>
                            <p className="text-[10px] text-zinc-500">
                              {company.sector} · {company.stage} · {company.geography}
                            </p>
                          </div>
                        </Link>
                        <button
                          onClick={() => handleRemoveCompany(currentList.id, company.id)}
                          className="text-zinc-700 hover:text-red-400 ml-3 flex-shrink-0 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
