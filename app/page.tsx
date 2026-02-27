// app/page.tsx
import React from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { scoreAllCompanies } from '@/lib/scoring/engine'
import { SEED_COMPANIES } from '@/lib/data/seed'
import { DEFAULT_THESIS } from '@/lib/data/thesis-default'
import {
  Building2,
  TrendingUp,
  Zap,
  BookMarked,
} from 'lucide-react'
import Link from 'next/link'

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

  return (
    <div className="min-h-screen bg-zinc-950">
      <TopBar
        title="Dashboard"
        subtitle="Apex Ventures · Seed AI/ML Fund"
      />

      <div className="p-6 space-y-6">

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 font-medium">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-zinc-100 mt-1">
                      {stat.value}
                    </p>
                    <p className="text-[11px] text-zinc-600 mt-0.5">
                      {stat.sub}
                    </p>
                  </div>
                  <div className={`${stat.bg} p-2 rounded-lg`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

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
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        (company.thesisScore?.total ?? 0) >= 75
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
                      className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                        signal.confidence === 'high'
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

        {/* Recently added */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
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
            {recentCompanies.map((company) => (
              <Link
                key={company.id}
                href={`/companies/${company.id}`}
                className="p-3 rounded-lg border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40 transition-all group"
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
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}