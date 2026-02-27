'use client'

import React from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { SEED_COMPANIES } from '@/lib/data/seed'
import { Signal, Company } from '@/lib/types'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

export default function SignalsPage(): React.JSX.Element {
  const allSignals: Array<Signal & { company: Company }> = SEED_COMPANIES
    .flatMap((company) =>
      company.signals.map((signal) => ({ ...signal, company }))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const newSignals = allSignals.filter((s) => s.isNew)

  const signalTypeIcon: Record<string, string> = {
    funding: '💰',
    hiring: '👥',
    product: '🚀',
    press: '📰',
    github: '⭐',
    partnership: '🤝',
    leadership: '👤',
    other: '📌',
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <TopBar
        title="Signal Feed"
        subtitle={`${allSignals.length} signals · ${newSignals.length} new`}
      />

      <div className="p-6 max-w-3xl space-y-3">
        {newSignals.length > 0 && (
          <div className="bg-violet-600/10 border border-violet-500/20 rounded-xl p-4 mb-4">
            <p className="text-xs font-medium text-violet-400 mb-1">
              {newSignals.length} new signals since last visit
            </p>
            <p className="text-[11px] text-violet-400/60">
              Across {new Set(newSignals.map((s) => s.company.id)).size} companies
            </p>
          </div>
        )}

        {allSignals.map((signal) => (
          <Link
            key={signal.id}
            href={`/companies/${signal.company.id}`}
            className="flex gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all group"
          >
            <div className="text-xl flex-shrink-0 mt-0.5">
              {signalTypeIcon[signal.type] ?? '📌'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-medium text-zinc-200 group-hover:text-white">
                    {signal.company.name}
                  </span>
                  <span className="text-zinc-600 mx-1.5 text-xs">·</span>
                  <span className="text-xs text-zinc-400">{signal.title}</span>
                  {signal.isNew && (
                    <span className="ml-2 text-[9px] bg-violet-600/20 text-violet-400 px-1.5 py-0.5 rounded-full">
                      NEW
                    </span>
                  )}
                </div>
                <span className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded flex-shrink-0',
                  signal.confidence === 'high' ? 'bg-emerald-600/20 text-emerald-400' :
                  signal.confidence === 'medium' ? 'bg-amber-600/20 text-amber-400' :
                  'bg-zinc-800 text-zinc-500'
                )}>
                  {signal.confidence}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">{signal.description}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] text-zinc-600">{signal.source}</span>
                <span className="text-[10px] text-zinc-700">·</span>
                <span className="text-[10px] text-zinc-600">
                  {formatDistanceToNow(new Date(signal.timestamp), { addSuffix: true })}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
