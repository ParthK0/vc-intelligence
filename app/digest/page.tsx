'use client'

import React, { useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { SEED_COMPANIES } from '@/lib/data/seed'
import { scoreAllCompanies } from '@/lib/scoring/engine'
import { DEFAULT_THESIS } from '@/lib/data/thesis-default'
import { getSavedSearches } from '@/lib/persistence/saved-searches'
import { generateDigest } from '@/lib/data/digest'
import { DigestReport } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FileText, Loader2, TrendingUp, Zap, Building2, BarChart3 } from 'lucide-react'
import { PageTransition, StaggerList, StaggerItem, motion } from '@/components/ui/motion'

const SCORED = scoreAllCompanies(SEED_COMPANIES, DEFAULT_THESIS)

export default function DigestPage(): React.JSX.Element {
    const [digest, setDigest] = useState<DigestReport | null>(null)
    const [generating, setGenerating] = useState(false)

    async function handleGenerate(): Promise<void> {
        setGenerating(true)
        await new Promise(r => setTimeout(r, 1200)) // Simulate processing
        const searches = getSavedSearches()
        const report = generateDigest(SCORED, searches)
        setDigest(report)
        setGenerating(false)
    }

    return (
        <PageTransition className="min-h-screen bg-zinc-950">
            <TopBar title="Weekly Digest" subtitle="Intelligence summary" />

            <div className="p-6 max-w-3xl">
                {!digest && !generating && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <FileText className="w-12 h-12 text-zinc-800 mb-4 mx-auto" />
                        </motion.div>
                        <p className="text-zinc-400 text-sm mb-1">Generate your weekly intelligence digest</p>
                        <p className="text-zinc-600 text-xs mb-6">
                            Summarizes new companies, top signals, and scoring insights
                        </p>
                        <Button
                            onClick={handleGenerate}
                            className="bg-violet-600 hover:bg-violet-500 text-white text-sm gap-2"
                        >
                            <Zap className="w-4 h-4" />
                            Generate Digest
                        </Button>
                    </div>
                )}

                {generating && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <Loader2 className="w-8 h-8 text-violet-400 animate-spin mb-4" />
                        <p className="text-zinc-400 text-sm">Analyzing pipeline data...</p>
                        <p className="text-zinc-600 text-xs mt-1">Running saved searches and aggregating signals</p>
                    </div>
                )}

                {digest && !generating && (
                    <StaggerList className="space-y-4">
                        {/* Header */}
                        <StaggerItem>
                            <div className="bg-gradient-to-r from-violet-600/10 to-purple-600/10 border border-violet-500/20 rounded-xl p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-sm font-bold text-zinc-100">Weekly Intelligence Digest</h2>
                                        <p className="text-xs text-zinc-500 mt-0.5">{digest.period}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleGenerate}
                                        className="h-7 text-xs border-violet-500/30 text-violet-400 hover:bg-violet-600/10"
                                    >
                                        Regenerate
                                    </Button>
                                </div>
                            </div>
                        </StaggerItem>

                        {/* Stats */}
                        <StaggerItem>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="bg-violet-600/10 p-1.5 rounded-lg">
                                            <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
                                        </div>
                                        <span className="text-[10px] text-zinc-500 uppercase tracking-wide font-medium">Signals</span>
                                    </div>
                                    <p className="text-xl font-bold text-zinc-100">{digest.totalSignals}</p>
                                    <p className="text-[10px] text-zinc-600">this week</p>
                                </div>
                                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="bg-emerald-600/10 p-1.5 rounded-lg">
                                            <Zap className="w-3.5 h-3.5 text-emerald-400" />
                                        </div>
                                        <span className="text-[10px] text-zinc-500 uppercase tracking-wide font-medium">High Scorers</span>
                                    </div>
                                    <p className="text-xl font-bold text-zinc-100">{digest.highScorers.length}</p>
                                    <p className="text-[10px] text-zinc-600">score ≥ 70</p>
                                </div>
                                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="bg-blue-600/10 p-1.5 rounded-lg">
                                            <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                                        </div>
                                        <span className="text-[10px] text-zinc-500 uppercase tracking-wide font-medium">Avg Score</span>
                                    </div>
                                    <p className="text-xl font-bold text-zinc-100">{digest.avgScore}</p>
                                    <p className="text-[10px] text-zinc-600">pipeline average</p>
                                </div>
                            </div>
                        </StaggerItem>

                        {/* High Scorers */}
                        {digest.highScorers.length > 0 && (
                            <StaggerItem>
                                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                                        Top Scoring Companies
                                    </h3>
                                    <div className="space-y-2">
                                        {digest.highScorers.map((company, i) => (
                                            <div key={i} className="flex items-center justify-between py-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-zinc-600 w-4">{i + 1}.</span>
                                                    <span className="text-xs text-zinc-200">{company.name}</span>
                                                    <span className="text-[10px] text-zinc-600">{company.sector}</span>
                                                </div>
                                                <span className={cn(
                                                    'text-xs font-bold px-2 py-0.5 rounded',
                                                    company.score >= 75 ? 'bg-emerald-600/20 text-emerald-400' : 'bg-amber-600/20 text-amber-400'
                                                )}>
                                                    {company.score}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </StaggerItem>
                        )}

                        {/* Sector Breakdown */}
                        <StaggerItem>
                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                                    Companies by Sector
                                </h3>
                                <div className="space-y-2">
                                    {digest.newCompanies.slice(0, 8).map((item, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <span className="text-xs text-zinc-300 w-24">{item.sector}</span>
                                            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-violet-500 rounded-full transition-all"
                                                    style={{ width: `${Math.min(100, (item.count / (digest.newCompanies[0]?.count || 1)) * 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] text-zinc-500 w-6 text-right">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </StaggerItem>

                        {/* Top Signals */}
                        {digest.topSignals.length > 0 && (
                            <StaggerItem>
                                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                                        Recent Signals
                                    </h3>
                                    <div className="space-y-2">
                                        {digest.topSignals.slice(0, 10).map((sig, i) => (
                                            <div key={i} className="flex items-start gap-2 text-xs">
                                                <span className="text-zinc-600 flex-shrink-0">{sig.type === 'funding' ? '💰' : sig.type === 'hiring' ? '👥' : sig.type === 'product' ? '🚀' : '📌'}</span>
                                                <div>
                                                    <span className="text-zinc-400">{sig.company}</span>
                                                    <span className="text-zinc-700 mx-1">·</span>
                                                    <span className="text-zinc-500">{sig.signal}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </StaggerItem>
                        )}
                    </StaggerList>
                )}
            </div>
        </PageTransition>
    )
}
