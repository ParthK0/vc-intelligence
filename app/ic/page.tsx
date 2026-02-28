'use client'

import React, { useState, useMemo } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { SEED_COMPANIES } from '@/lib/data/seed'
import { DEFAULT_THESIS } from '@/lib/data/thesis-default'
import { scoreAllCompanies } from '@/lib/scoring/engine'
import { calculateRisk, riskColor, riskBg } from '@/lib/scoring/risk'
import { calculateMomentum, getMomentumColor, getMomentumBg } from '@/lib/scoring/momentum'
import { Company } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Plus, X, BarChart3, Shield, Zap, TrendingUp, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { PageTransition, motion } from '@/components/ui/motion'

const SCORED = scoreAllCompanies(SEED_COMPANIES, DEFAULT_THESIS)

export default function ICPage(): React.JSX.Element {
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [showPicker, setShowPicker] = useState(false)
    const [searchQ, setSearchQ] = useState('')

    const selectedCompanies = selectedIds
        .map(id => SCORED.find(c => c.id === id))
        .filter(Boolean) as Company[]

    const filteredForPicker = SCORED.filter(
        c => !selectedIds.includes(c.id) &&
            (searchQ === '' || c.name.toLowerCase().includes(searchQ.toLowerCase()))
    ).slice(0, 15)

    function addCompany(id: string): void {
        if (selectedIds.length >= 3) return
        setSelectedIds(prev => [...prev, id])
        setShowPicker(false)
        setSearchQ('')
    }

    function removeCompany(id: string): void {
        setSelectedIds(prev => prev.filter(x => x !== id))
    }

    // Radar chart data as pure CSS
    const dimensions = DEFAULT_THESIS.dimensions

    return (
        <PageTransition className="min-h-screen bg-zinc-950">
            <TopBar title="Investment Committee" subtitle="Compare companies side-by-side" />

            <div className="p-6 space-y-6">

                {/* Company selector */}
                <div className="flex items-center gap-3 flex-wrap">
                    {selectedCompanies.map(company => (
                        <div
                            key={company.id}
                            className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2"
                        >
                            <div className="w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                                <span className="text-[9px] font-bold text-zinc-400">
                                    {company.name.slice(0, 2).toUpperCase()}
                                </span>
                            </div>
                            <span className="text-xs font-medium text-zinc-200">{company.name}</span>
                            <button onClick={() => removeCompany(company.id)} className="text-zinc-600 hover:text-red-400 ml-1">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}

                    {selectedIds.length < 3 && (
                        <div className="relative">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowPicker(!showPicker)}
                                className="h-9 gap-1.5 border-zinc-700 bg-zinc-900 text-zinc-400 border-dashed"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                {selectedIds.length === 0 ? 'Select companies to compare' : 'Add company'}
                            </Button>

                            {showPicker && (
                                <div className="absolute left-0 top-11 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl z-50 w-80 p-3">
                                    <input
                                        value={searchQ}
                                        onChange={e => setSearchQ(e.target.value)}
                                        placeholder="Search companies..."
                                        className="w-full text-xs bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 mb-2"
                                        autoFocus
                                    />
                                    <div className="max-h-60 overflow-y-auto space-y-0.5">
                                        {filteredForPicker.map(c => (
                                            <button
                                                key={c.id}
                                                onClick={() => addCompany(c.id)}
                                                className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-left hover:bg-zinc-800 transition-colors"
                                            >
                                                <div>
                                                    <p className="text-xs text-zinc-200">{c.name}</p>
                                                    <p className="text-[10px] text-zinc-500">{c.sector} · {c.stage}</p>
                                                </div>
                                                <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded',
                                                    (c.thesisScore?.total ?? 0) >= 75 ? 'bg-emerald-600/20 text-emerald-400' :
                                                        (c.thesisScore?.total ?? 0) >= 55 ? 'bg-amber-600/20 text-amber-400' : 'bg-zinc-800 text-zinc-400'
                                                )}>
                                                    {c.thesisScore?.total ?? 0}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {selectedCompanies.length === 0 && (
                    <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-xl p-16 text-center">
                        <BarChart3 className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                        <p className="text-sm text-zinc-400">Select up to 3 companies to compare</p>
                        <p className="text-xs text-zinc-600 mt-1">Thesis alignment, risk analysis, and momentum side-by-side</p>
                    </div>
                )}

                {selectedCompanies.length > 0 && (
                    <>
                        {/* Thesis Radar (CSS-based) */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                            <h2 className="text-sm font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-violet-400" />
                                Thesis Alignment Comparison
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-zinc-800">
                                            <th className="text-left text-zinc-500 font-medium py-2 pr-3 w-36">Dimension</th>
                                            {selectedCompanies.map(c => (
                                                <th key={c.id} className="text-center text-zinc-400 font-medium py-2 px-2">
                                                    {c.name}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dimensions.map(dim => (
                                            <tr key={dim.key} className="border-b border-zinc-800/50">
                                                <td className="text-zinc-400 py-2.5 pr-3">
                                                    {dim.label}
                                                    <span className="text-zinc-600 text-[10px] ml-1">({dim.weight}%)</span>
                                                </td>
                                                {selectedCompanies.map(c => {
                                                    const dimScore = c.thesisScore?.dimensions.find(d => d.key === dim.key)
                                                    const raw = dimScore?.rawScore ?? 0
                                                    return (
                                                        <td key={c.id} className="text-center py-2.5 px-2">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <div className="w-16 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={cn(
                                                                            'h-full rounded-full transition-all',
                                                                            raw >= 70 ? 'bg-emerald-500' :
                                                                                raw >= 40 ? 'bg-amber-500' : 'bg-red-500'
                                                                        )}
                                                                        style={{ width: `${raw}%` }}
                                                                    />
                                                                </div>
                                                                <span className={cn('font-bold text-[10px] w-6',
                                                                    raw >= 70 ? 'text-emerald-400' :
                                                                        raw >= 40 ? 'text-amber-400' : 'text-red-400'
                                                                )}>
                                                                    {raw}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    )
                                                })}
                                            </tr>
                                        ))}
                                        {/* Total row */}
                                        <tr className="border-t-2 border-zinc-700">
                                            <td className="text-zinc-200 font-semibold py-3 pr-3">TOTAL</td>
                                            {selectedCompanies.map(c => (
                                                <td key={c.id} className="text-center py-3 px-2">
                                                    <span className={cn('text-base font-bold',
                                                        (c.thesisScore?.total ?? 0) >= 75 ? 'text-emerald-400' :
                                                            (c.thesisScore?.total ?? 0) >= 55 ? 'text-amber-400' : 'text-zinc-400'
                                                    )}>
                                                        {c.thesisScore?.total ?? 0}
                                                    </span>
                                                    <span className="text-zinc-500 text-[10px]">/100</span>
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Risk Matrix */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {selectedCompanies.map(company => {
                                const risk = calculateRisk(company)
                                const momentum = calculateMomentum(company)
                                return (
                                    <motion.div
                                        key={company.id}
                                        className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <Link href={`/companies/${company.id}`}
                                                className="text-sm font-semibold text-zinc-100 hover:text-violet-400 transition-colors">
                                                {company.name}
                                            </Link>
                                            <span className={cn('text-xs font-bold px-2 py-0.5 rounded',
                                                (company.thesisScore?.total ?? 0) >= 75 ? 'bg-emerald-600/20 text-emerald-400' :
                                                    (company.thesisScore?.total ?? 0) >= 55 ? 'bg-amber-600/20 text-amber-400' : 'bg-zinc-800 text-zinc-400'
                                            )}>
                                                {company.thesisScore?.total ?? 0}/100
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            {/* Risk */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <Shield className="w-3.5 h-3.5 text-zinc-500" />
                                                    <span className="text-[11px] text-zinc-400">Risk Score</span>
                                                </div>
                                                <span className={cn('text-xs font-bold px-2 py-0.5 rounded', riskBg(risk.totalRisk), riskColor(risk.totalRisk))}>
                                                    {risk.totalRisk}/100
                                                </span>
                                            </div>

                                            {/* Risk factors */}
                                            <div className="space-y-1">
                                                {risk.factors.slice(0, 3).map(f => (
                                                    <div key={f.key} className="flex items-start gap-1.5">
                                                        <span className={cn('w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0',
                                                            f.severity === 'high' ? 'bg-red-400' :
                                                                f.severity === 'medium' ? 'bg-amber-400' : 'bg-zinc-500'
                                                        )} />
                                                        <span className="text-[10px] text-zinc-500">{f.label}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Momentum */}
                                            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                                                <div className="flex items-center gap-1.5">
                                                    <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
                                                    <span className="text-[11px] text-zinc-400">Momentum</span>
                                                </div>
                                                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded',
                                                    getMomentumBg(momentum.level), getMomentumColor(momentum.level)
                                                )}>
                                                    {momentum.label}
                                                </span>
                                            </div>

                                            {/* Key data */}
                                            <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-zinc-800">
                                                <div>
                                                    <span className="text-zinc-600">Stage</span>
                                                    <p className="text-zinc-300 font-medium">{company.stage}</p>
                                                </div>
                                                <div>
                                                    <span className="text-zinc-600">Sector</span>
                                                    <p className="text-zinc-300 font-medium">{company.sector}</p>
                                                </div>
                                                <div>
                                                    <span className="text-zinc-600">Signals</span>
                                                    <p className="text-zinc-300 font-medium">{company.signals.length}</p>
                                                </div>
                                                <div>
                                                    <span className="text-zinc-600">Confidence</span>
                                                    <p className={cn('font-medium',
                                                        company.thesisScore?.confidence === 'High' ? 'text-emerald-400' :
                                                            company.thesisScore?.confidence === 'Medium' ? 'text-amber-400' : 'text-zinc-500'
                                                    )}>
                                                        {company.thesisScore?.confidence ?? '—'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>

                        {/* Decision summary */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                            <h2 className="text-sm font-semibold text-zinc-100 mb-3 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                                IC Decision Matrix
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-zinc-800">
                                            <th className="text-left text-zinc-500 py-2">Metric</th>
                                            {selectedCompanies.map(c => (
                                                <th key={c.id} className="text-center text-zinc-400 py-2">{c.name}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { label: 'Thesis Score', get: (c: Company) => `${c.thesisScore?.total ?? 0}/100` },
                                            { label: 'Confidence', get: (c: Company) => c.thesisScore?.confidence ?? '—' },
                                            { label: 'Risk Score', get: (c: Company) => `${calculateRisk(c).totalRisk}/100` },
                                            { label: 'Risk Grade', get: (c: Company) => calculateRisk(c).grade },
                                            { label: 'Momentum', get: (c: Company) => calculateMomentum(c).label },
                                            { label: 'Signal Count', get: (c: Company) => String(c.signals.length) },
                                            { label: 'Stage', get: (c: Company) => c.stage },
                                            { label: 'Total Raised', get: (c: Company) => c.totalRaised ? `$${(c.totalRaised / 1_000_000).toFixed(1)}M` : '—' },
                                        ].map(row => (
                                            <tr key={row.label} className="border-b border-zinc-800/50">
                                                <td className="text-zinc-400 py-2">{row.label}</td>
                                                {selectedCompanies.map(c => (
                                                    <td key={c.id} className="text-center text-zinc-300 py-2">{row.get(c)}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </PageTransition>
    )
}
