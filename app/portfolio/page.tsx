'use client'

import React, { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { getPortfolio, addToPortfolio, removeFromPortfolio } from '@/lib/persistence/portfolio'
import { SEED_COMPANIES } from '@/lib/data/seed'
import { scoreAllCompanies } from '@/lib/scoring/engine'
import { DEFAULT_THESIS } from '@/lib/data/thesis-default'
import { PortfolioCompany, Company } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Shield, Plus, Trash2, Search, X } from 'lucide-react'
import Link from 'next/link'
import { PageTransition, StaggerList, StaggerItem, motion } from '@/components/ui/motion'

const SCORED = scoreAllCompanies(SEED_COMPANIES, DEFAULT_THESIS)

export default function PortfolioPage(): React.JSX.Element {
    const [portfolio, setPortfolio] = useState<PortfolioCompany[]>([])
    const [showAdd, setShowAdd] = useState(false)
    const [search, setSearch] = useState('')

    useEffect(() => {
        setPortfolio(getPortfolio())
    }, [])

    function handleAdd(companyId: string): void {
        addToPortfolio(companyId)
        setPortfolio(getPortfolio())
        setShowAdd(false)
        setSearch('')
    }

    function handleRemove(companyId: string): void {
        removeFromPortfolio(companyId)
        setPortfolio(getPortfolio())
    }

    const portfolioCompanies = portfolio
        .map(p => SCORED.find(c => c.id === p.companyId))
        .filter(Boolean) as Company[]

    const availableCompanies = SCORED.filter(
        c => !portfolio.some(p => p.companyId === c.id) &&
            (search === '' || c.name.toLowerCase().includes(search.toLowerCase()))
    ).slice(0, 20)

    return (
        <PageTransition className="min-h-screen bg-zinc-950">
            <TopBar title="Portfolio" subtitle={`${portfolio.length} companies`} />

            <div className="p-6 max-w-3xl">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs text-zinc-500">
                        Define your portfolio companies to detect conflicts when evaluating new deals.
                    </p>
                    <Button
                        size="sm"
                        onClick={() => setShowAdd(true)}
                        className="h-8 gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Company
                    </Button>
                </div>

                {portfolioCompanies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <Shield className="w-12 h-12 text-zinc-800 mb-4" />
                        <p className="text-zinc-400 text-sm mb-1">No portfolio companies yet</p>
                        <p className="text-zinc-600 text-xs mb-4">
                            Add your fund&apos;s portfolio companies to enable conflict detection
                        </p>
                        <Button
                            onClick={() => setShowAdd(true)}
                            className="bg-violet-600 hover:bg-violet-500 text-white text-xs"
                        >
                            <Plus className="w-3.5 h-3.5 mr-1.5" />
                            Add First Company
                        </Button>
                    </div>
                ) : (
                    <StaggerList className="space-y-2">
                        {portfolioCompanies.map(company => (
                            <StaggerItem key={company.id}>
                                <motion.div
                                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between group hover:border-zinc-700 transition-all"
                                    whileHover={{ scale: 1.005 }}
                                >
                                    <Link href={`/companies/${company.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                                            <span className="text-[10px] font-bold text-zinc-400">
                                                {company.name.slice(0, 2).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-zinc-200 group-hover:text-white truncate transition-colors">
                                                {company.name}
                                            </p>
                                            <p className="text-[10px] text-zinc-500">
                                                {company.sector} · {company.stage} · {company.geography}
                                            </p>
                                        </div>
                                    </Link>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-zinc-600">
                                            {company.tags.slice(0, 3).join(', ')}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemove(company.id)}
                                            className="h-7 w-7 p-0 text-zinc-600 hover:text-red-400 hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </motion.div>
                            </StaggerItem>
                        ))}
                    </StaggerList>
                )}

                {/* Add Dialog */}
                {showAdd && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => { setShowAdd(false); setSearch('') }}>
                        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 w-96 max-h-[60vh] flex flex-col" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-zinc-200">Add Portfolio Company</h3>
                                <button onClick={() => { setShowAdd(false); setSearch('') }} className="text-zinc-500 hover:text-zinc-300">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="relative mb-3">
                                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-zinc-600" />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search companies..."
                                    className="w-full text-xs bg-zinc-800 border border-zinc-700 rounded-md pl-8 pr-3 py-2 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
                                    autoFocus
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-1">
                                {availableCompanies.map(company => (
                                    <button
                                        key={company.id}
                                        onClick={() => handleAdd(company.id)}
                                        className="w-full flex items-center justify-between px-3 py-2 rounded-md text-left hover:bg-zinc-800 transition-colors"
                                    >
                                        <div>
                                            <p className="text-xs text-zinc-200">{company.name}</p>
                                            <p className="text-[10px] text-zinc-500">{company.sector} · {company.stage}</p>
                                        </div>
                                        <Plus className="w-3.5 h-3.5 text-zinc-600" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    )
}
