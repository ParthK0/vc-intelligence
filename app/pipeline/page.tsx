'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { getPipeline, moveCompany, removeFromPipeline, addToPipeline, PIPELINE_STAGES } from '@/lib/persistence/pipeline'
import { SEED_COMPANIES } from '@/lib/data/seed'
import { scoreAllCompanies } from '@/lib/scoring/engine'
import { DEFAULT_THESIS } from '@/lib/data/thesis-default'
import { logAction } from '@/lib/persistence/audit'
import { PipelineData, PipelineStage, Company } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Plus, X, ArrowRight, GripVertical } from 'lucide-react'
import Link from 'next/link'
import { PageTransition, motion } from '@/components/ui/motion'

const SCORED = scoreAllCompanies(SEED_COMPANIES, DEFAULT_THESIS)

export default function PipelinePage(): React.JSX.Element {
    const [pipeline, setPipeline] = useState<PipelineData>(getPipeline())
    const [showAddDialog, setShowAddDialog] = useState<PipelineStage | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [dragOver, setDragOver] = useState<PipelineStage | null>(null)

    const refresh = useCallback(() => setPipeline(getPipeline()), [])

    const allPipelineIds = new Set(
        Object.values(pipeline).flat()
    )

    const availableCompanies = SCORED.filter(
        c => !allPipelineIds.has(c.id) &&
            (searchQuery === '' || c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 20)

    function handleAdd(companyId: string, stage: PipelineStage): void {
        addToPipeline(companyId, stage)
        const company = SCORED.find(c => c.id === companyId)
        logAction('pipeline_moved', 'pipeline', companyId, `Added to ${stage}`, company?.name)
        refresh()
        setShowAddDialog(null)
        setSearchQuery('')
    }

    function handleMove(companyId: string, toStage: PipelineStage): void {
        moveCompany(companyId, toStage)
        const company = SCORED.find(c => c.id === companyId)
        logAction('pipeline_moved', 'pipeline', companyId, `Moved to ${toStage}`, company?.name)
        refresh()
    }

    function handleRemove(companyId: string): void {
        removeFromPipeline(companyId)
        refresh()
    }

    function handleDragStart(e: React.DragEvent, companyId: string): void {
        e.dataTransfer.setData('text/plain', companyId)
        e.dataTransfer.effectAllowed = 'move'
    }

    function handleDragOver(e: React.DragEvent, stage: PipelineStage): void {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setDragOver(stage)
    }

    function handleDragLeave(): void {
        setDragOver(null)
    }

    function handleDrop(e: React.DragEvent, stage: PipelineStage): void {
        e.preventDefault()
        setDragOver(null)
        const companyId = e.dataTransfer.getData('text/plain')
        if (companyId) handleMove(companyId, stage)
    }

    const totalInPipeline = Object.values(pipeline).flat().length

    function scoreColor(score: number): string {
        if (score >= 75) return 'bg-emerald-600/20 text-emerald-400'
        if (score >= 55) return 'bg-amber-600/20 text-amber-400'
        return 'bg-zinc-800 text-zinc-400'
    }

    return (
        <PageTransition className="min-h-screen bg-zinc-950">
            <TopBar title="Deal Pipeline" subtitle={`${totalInPipeline} companies in pipeline`} />

            <div className="p-6">
                <div className="grid grid-cols-6 gap-3 min-h-[calc(100vh-160px)]">
                    {PIPELINE_STAGES.map(stage => {
                        const companyIds = pipeline[stage.key] ?? []
                        const companies = companyIds
                            .map(id => SCORED.find(c => c.id === id))
                            .filter(Boolean) as Company[]

                        return (
                            <div
                                key={stage.key}
                                className={cn(
                                    'flex flex-col rounded-xl border transition-all',
                                    dragOver === stage.key
                                        ? 'border-violet-500/50 bg-violet-600/5'
                                        : 'border-zinc-800 bg-zinc-900/50'
                                )}
                                onDragOver={(e) => handleDragOver(e, stage.key)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, stage.key)}
                            >
                                {/* Column Header */}
                                <div className="p-3 border-b border-zinc-800">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={cn('w-2 h-2 rounded-full', stage.color)} />
                                            <span className="text-xs font-semibold text-zinc-300">{stage.label}</span>
                                        </div>
                                        <span className="text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">
                                            {companies.length}
                                        </span>
                                    </div>
                                </div>

                                {/* Cards */}
                                <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-260px)]">
                                    {companies.map(company => (
                                        <div
                                            key={company.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, company.id)}
                                            className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 cursor-grab active:cursor-grabbing hover:border-zinc-700 hover:scale-[1.02] transition-all group"
                                        >
                                            <div className="flex items-start justify-between gap-1">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <GripVertical className="w-3 h-3 text-zinc-700 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <Link
                                                        href={`/companies/${company.id}`}
                                                        className="text-[11px] font-medium text-zinc-200 hover:text-violet-400 truncate transition-colors"
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        {company.name}
                                                    </Link>
                                                </div>
                                                <button
                                                    onClick={() => handleRemove(company.id)}
                                                    className="text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                <span className="text-[9px] text-zinc-600">{company.sector}</span>
                                                <span className="text-[9px] text-zinc-700">·</span>
                                                <span className={cn('text-[9px] font-bold px-1 py-0 rounded', scoreColor(company.thesisScore?.total ?? 0))}>
                                                    {company.thesisScore?.total ?? 0}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Add Button */}
                                <div className="p-2 border-t border-zinc-800/50">
                                    <button
                                        onClick={() => setShowAddDialog(stage.key)}
                                        className="w-full flex items-center justify-center gap-1 text-[10px] text-zinc-600 hover:text-violet-400 py-1.5 rounded-md hover:bg-zinc-800/50 transition-all"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Add
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Add Dialog */}
                {showAddDialog && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => { setShowAddDialog(null); setSearchQuery('') }}>
                        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 w-96 max-h-[60vh] flex flex-col" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-zinc-200">
                                    Add to {PIPELINE_STAGES.find(s => s.key === showAddDialog)?.label}
                                </h3>
                                <button onClick={() => { setShowAddDialog(null); setSearchQuery('') }} className="text-zinc-500 hover:text-zinc-300">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search companies..."
                                className="w-full text-xs bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 mb-3"
                                autoFocus
                            />
                            <div className="flex-1 overflow-y-auto space-y-1">
                                {availableCompanies.map(company => (
                                    <button
                                        key={company.id}
                                        onClick={() => handleAdd(company.id, showAddDialog)}
                                        className="w-full flex items-center justify-between px-3 py-2 rounded-md text-left hover:bg-zinc-800 transition-colors group"
                                    >
                                        <div>
                                            <p className="text-xs text-zinc-200 group-hover:text-white">{company.name}</p>
                                            <p className="text-[10px] text-zinc-500">{company.sector} · {company.stage}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded', scoreColor(company.thesisScore?.total ?? 0))}>
                                                {company.thesisScore?.total ?? 0}
                                            </span>
                                            <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-violet-400 transition-colors" />
                                        </div>
                                    </button>
                                ))}
                                {availableCompanies.length === 0 && (
                                    <p className="text-xs text-zinc-600 text-center py-4">
                                        {searchQuery ? 'No matching companies found' : 'All companies are in the pipeline'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    )
}
