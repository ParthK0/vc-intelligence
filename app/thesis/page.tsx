'use client'

import React from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { DEFAULT_THESIS } from '@/lib/data/thesis-default'
import { cn } from '@/lib/utils'

export default function ThesisPage(): React.JSX.Element {
  const thesis = DEFAULT_THESIS
  const totalWeight = thesis.dimensions.reduce((s, d) => s + d.weight, 0)

  return (
    <div className="min-h-screen bg-zinc-950">
      <TopBar title="Thesis Configuration" subtitle={thesis.fundName} />

      <div className="p-6 max-w-2xl space-y-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">{thesis.fundName}</h2>
              <p className="text-xs text-zinc-500 mt-0.5">v{thesis.version}</p>
            </div>
            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded">
              Min Score: {thesis.minimumScore}
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">{thesis.description}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Scoring Dimensions
            </h3>
            <span className={cn(
              'text-xs font-medium px-2 py-0.5 rounded',
              totalWeight === 100 ? 'bg-emerald-600/20 text-emerald-400' : 'bg-red-600/20 text-red-400'
            )}>
              Total: {totalWeight}%
            </span>
          </div>

          <div className="space-y-4">
            {thesis.dimensions.map((dim) => (
              <div key={dim.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-zinc-200">{dim.label}</span>
                  <span className="text-xs text-violet-400 font-bold">{dim.weight}%</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full mb-2">
                  <div
                    className="h-full bg-violet-500 rounded-full"
                    style={{ width: `${dim.weight}%` }}
                  />
                </div>
                <p className="text-[11px] text-zinc-500">{dim.description}</p>
                {dim.criteria.sectors && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {dim.criteria.sectors.map((s) => (
                      <span key={s} className="text-[10px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                {dim.criteria.stages && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {dim.criteria.stages.map((s) => (
                      <span key={s} className="text-[10px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-zinc-600 text-center">
          Thesis config is read-only in MVP · Multi-fund config available in V2
        </p>
      </div>
    </div>
  )
}
