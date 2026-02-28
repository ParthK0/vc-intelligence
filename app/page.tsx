// app/page.tsx
'use client'

import React from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { scoreAllCompanies } from '@/lib/scoring/engine'
import { SEED_COMPANIES } from '@/lib/data/seed'
import { DEFAULT_THESIS } from '@/lib/data/thesis-default'
import { buildHeatmapData, buildSignalTimeline, ALL_STAGES } from '@/lib/data/heatmap'
import { calculateFundMetrics } from '@/lib/data/metrics'
import {
  Building2,
  TrendingUp,
  Zap,
  BookMarked,
  BarChart3,
  Shield,
} from 'lucide-react'
import Link from 'next/link'
import {
  PageTransition,
  StaggerList,
  StaggerItem,
  AnimatedScore,
  motion,
} from '@/components/ui/motion'
import { cn } from '@/lib/utils'

export default function DashboardPage(): React.JSX.Element {
  const scored = scoreAllCompanies(SEED_COMPANIES, DEFAULT_THESIS)
  const strongMatches = scored.filter(
    (c) => (c.thesisScore?.total ?? 0) >= 75
  )
  const newSignals = SEED_COMPANIES.flatMap((c) =>
    c.signals.filter((s) => s.isNew)
  )
  const recentCompanies = [...SEED_COMPANIES]
    .sort(
      (a, b) =>
        new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    )
    .slice(0, 5)

  const heatmapData = buildHeatmapData(SEED_COMPANIES)
  const signalTimeline = buildSignalTimeline(SEED_COMPANIES)
  const maxTimelineCount = Math.max(...signalTimeline.map(p => p.count), 1)

  // Unique sectors from heatmap
  const heatmapSectors = [...new Set(heatmapData.map(c => c.sector))]
  const fundMetrics = calculateFundMetrics(scored)

  const stats = [
    {
      label: 'Total Companies',
      value: SEED_COMPANIES.length,
      icon: Building2,
      sub: 'in pipeline',
      color: 'text-violet-400',
      bg: 'bg-violet-600/10',
    },
    {
      label: 'Strong Matches',
      value: strongMatches.length,
      icon: Zap,
      sub: 'score ≥ 75',
      color: 'text-emerald-400',
      bg: 'bg-emerald-600/10',
    },
    {
      label: 'New Signals',
      value: newSignals.length,
      icon: TrendingUp,
      sub: 'this week',
      color: 'text-amber-400',
      bg: 'bg-amber-600/10',
    },
    {
      label: 'Avg Thesis Score',
      value:
        Math.round(
          scored.reduce((s, c) => s + (c.thesisScore?.total ?? 0), 0) /
          scored.length
        ) + '/100',
      icon: BookMarked,
      sub: 'across pipeline',
      color: 'text-blue-400',
      bg: 'bg-blue-600/10',
    },
  ]

  function heatColor(intensity: number): string {
    if (intensity === 0) return 'bg-zinc-800/50'
    if (intensity < 0.2) return 'bg-violet-900/30'
    if (intensity < 0.4) return 'bg-violet-800/40'
    if (intensity < 0.6) return 'bg-violet-700/50'
    if (intensity < 0.8) return 'bg-violet-600/60'
    return 'bg-violet-500/70'
  }

  return (
    <PageTransition className="min-h-screen bg-zinc-950">
      <TopBar
        title="Dashboard"
        subtitle="Apex Ventures · Seed AI/ML Fund"
      />

      <div className="p-6 space-y-6">

        {/* Stats row */}
        <StaggerList className="grid grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <StaggerItem key={stat.label}>
                <motion.div
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all"
                  whileHover={{ scale: 1.02, borderColor: 'rgba(139, 92, 246, 0.3)' }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-zinc-500 font-medium">
                        {stat.label}
                      </p>
                      <motion.p
                        className="text-2xl font-bold text-zinc-100 mt-1"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                      >
                        {stat.value}
                      </motion.p>
                      <p className="text-[11px] text-zinc-600 mt-0.5">
                        {stat.sub}
                      </p>
                    </div>
                    <motion.div
                      className={`${stat.bg} p-2 rounded-lg`}
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </motion.div>
                  </div>
                </motion.div>
              </StaggerItem>
            )
          })}
        </StaggerList>

        <div className="grid grid-cols-2 gap-4">

          {/* Top thesis matches */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-zinc-100">
                Top Thesis Matches
              </h2>
              <Link
                href="/companies"
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="space-y-2">
              {scored.slice(0, 5).map((company) => (
                <Link
                  key={company.id}
                  href={`/companies/${company.id}`}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-zinc-400">
                        {company.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-200 group-hover:text-white transition-colors">
                        {company.name}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        {company.sector} · {company.stage}
                        {company.thesisScore?.confidence && (
                          <span className={cn(
                            'ml-1.5',
                            company.thesisScore.confidence === 'High' ? 'text-emerald-500' :
                              company.thesisScore.confidence === 'Medium' ? 'text-amber-500' : 'text-zinc-600'
                          )}>
                            · {company.thesisScore.confidence}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`text-xs font-bold px-2 py-0.5 rounded-md ${(company.thesisScore?.total ?? 0) >= 75
                        ? 'bg-emerald-600/20 text-emerald-400'
                        : (company.thesisScore?.total ?? 0) >= 55
                          ? 'bg-amber-600/20 text-amber-400'
                          : 'bg-zinc-800 text-zinc-400'
                        }`}
                    >
                      {company.thesisScore?.total ?? 0}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent signals */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-zinc-100">
                Recent Signals
              </h2>
              <span className="text-[10px] bg-violet-600/20 text-violet-400 px-2 py-0.5 rounded-full font-medium">
                {newSignals.length} new
              </span>
            </div>
            <div className="space-y-2">
              {newSignals.slice(0, 6).map((signal) => {
                const company = SEED_COMPANIES.find((c) =>
                  c.signals.some((s) => s.id === signal.id)
                )
                return (
                  <div
                    key={signal.id}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-zinc-800/60 transition-colors"
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${signal.confidence === 'high'
                        ? 'bg-emerald-400'
                        : signal.confidence === 'medium'
                          ? 'bg-amber-400'
                          : 'bg-zinc-500'
                        }`}
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-zinc-200 truncate">
                        {signal.title}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        {company?.name} ·{' '}
                        {signal.type.charAt(0).toUpperCase() +
                          signal.type.slice(1)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Signal Heatmap */}
        <motion.div
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-violet-400" />
              <h2 className="text-sm font-semibold text-zinc-100">
                Signal Strength Heatmap
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-600">Low</span>
              <div className="flex gap-0.5">
                {[0, 0.2, 0.4, 0.6, 0.8, 1].map((v, i) => (
                  <div key={i} className={cn('w-3 h-3 rounded-sm', heatColor(v))} />
                ))}
              </div>
              <span className="text-[10px] text-zinc-600">High</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[500px]">
              {/* Column headers */}
              <div className="flex mb-1">
                <div className="w-24 flex-shrink-0" />
                {ALL_STAGES.map(stage => (
                  <div key={stage} className="flex-1 text-center text-[10px] text-zinc-500 font-medium px-1">
                    {stage}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {heatmapSectors.map(sector => (
                <div key={sector} className="flex mb-0.5">
                  <div className="w-24 flex-shrink-0 text-[10px] text-zinc-400 py-1.5 pr-2 truncate text-right">
                    {sector}
                  </div>
                  {ALL_STAGES.map(stage => {
                    const cell = heatmapData.find(c => c.sector === sector && c.stage === stage)
                    return (
                      <div key={`${sector}-${stage}`} className="flex-1 px-0.5">
                        <div
                          className={cn(
                            'h-7 rounded-sm flex items-center justify-center transition-all hover:ring-1 hover:ring-violet-500/30 cursor-default',
                            heatColor(cell?.intensity ?? 0)
                          )}
                          title={`${sector} × ${stage}: ${cell?.signalCount ?? 0} signals, ${cell?.companyCount ?? 0} companies`}
                        >
                          {(cell?.signalCount ?? 0) > 0 && (
                            <span className="text-[9px] text-zinc-300 font-medium">
                              {cell?.signalCount}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Signal Volume Timeline */}
        <motion.div
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-zinc-100">
                Signal Volume (12 Weeks)
              </h2>
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-24">
            {signalTimeline.map((point, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  className="w-full bg-violet-600/40 rounded-t-sm hover:bg-violet-500/50 transition-colors cursor-default"
                  style={{ height: `${Math.max(4, (point.count / maxTimelineCount) * 80)}px` }}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(4, (point.count / maxTimelineCount) * 80)}px` }}
                  transition={{ delay: 0.5 + idx * 0.03, duration: 0.3 }}
                  title={`${point.weekLabel}: ${point.count} signals`}
                />
                <span className="text-[8px] text-zinc-600 whitespace-nowrap">
                  {idx % 2 === 0 ? point.weekLabel : ''}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recently added */}
        <motion.div
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Recently Added
            </h2>
            <Link
              href="/companies"
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {recentCompanies.map((company, idx) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + idx * 0.05 }}
                whileHover={{ scale: 1.03, y: -2 }}
              >
                <Link
                  href={`/companies/${company.id}`}
                  className="block p-3 rounded-lg border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-2">
                    <span className="text-[11px] font-bold text-zinc-400">
                      {company.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-zinc-200 group-hover:text-white truncate transition-colors">
                    {company.name}
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5 truncate">
                    {company.stage} · {company.sector}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Fund Metrics */}
        <motion.div
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-violet-400" />
              <h2 className="text-sm font-semibold text-zinc-100">
                Fund Metrics
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-[10px] text-zinc-500">Deal Flow</p>
              <div className="flex items-baseline gap-1">
                <p className="text-lg font-bold text-zinc-100">{fundMetrics.dealFlowThisWeek}</p>
                <span className="text-[10px] text-zinc-500">/week</span>
              </div>
              {fundMetrics.dealFlowDelta !== 0 && (
                <p className={cn('text-[10px]',
                  fundMetrics.dealFlowDelta > 0 ? 'text-emerald-400' : 'text-red-400'
                )}>
                  {fundMetrics.dealFlowDelta > 0 ? '↑' : '↓'} {Math.abs(fundMetrics.dealFlowDelta)} vs last week
                </p>
              )}
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-[10px] text-zinc-500">Pipeline</p>
              <p className="text-lg font-bold text-zinc-100">{fundMetrics.totalInPipeline}</p>
              <p className="text-[10px] text-zinc-500">companies tracked</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-[10px] text-zinc-500">Avg Score</p>
              <p className="text-lg font-bold text-zinc-100">{fundMetrics.avgThesisScore}</p>
              <p className="text-[10px] text-zinc-500">thesis alignment</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-[10px] text-zinc-500">Funnel Rate</p>
              <p className="text-lg font-bold text-zinc-100">{fundMetrics.conversionRates.overallFunnel}%</p>
              <p className="text-[10px] text-zinc-500">sourced → invested</p>
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <p className="text-[10px] text-zinc-500 mb-2">Pipeline Funnel</p>
            <div className="flex items-center gap-1">
              {fundMetrics.pipelineByStage.map((s, i) => (
                <React.Fragment key={s.stage}>
                  <div className="flex-1 text-center">
                    <div className={cn('h-6 rounded flex items-center justify-center text-[9px] font-medium text-white', s.color)}>
                      {s.count}
                    </div>
                    <p className="text-[8px] text-zinc-600 mt-0.5 truncate">{s.label}</p>
                  </div>
                  {i < fundMetrics.pipelineByStage.length - 1 && (
                    <span className="text-zinc-700 text-[10px]">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Sector Distribution */}
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <p className="text-[10px] text-zinc-500 mb-2">Sector Distribution</p>
            <div className="space-y-1.5">
              {fundMetrics.sectorDistribution.slice(0, 5).map(s => (
                <div key={s.sector} className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400 w-20 truncate">{s.sector}</span>
                  <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${s.percentage}%` }} />
                  </div>
                  <span className="text-[10px] text-zinc-500 w-8 text-right">{s.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  )
}