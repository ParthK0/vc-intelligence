'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bell, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TopBarProps {
  title: string
  subtitle?: string
}

export function TopBar({ title, subtitle }: TopBarProps): React.JSX.Element {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function handleSearch(e: React.FormEvent): void {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/companies?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">

      {/* Left: Page title */}
      <div>
        <h1 className="text-sm font-semibold text-zinc-100 leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[11px] text-zinc-500 mt-0.5 leading-none">
            {subtitle}
          </p>
        )}
      </div>

      {/* Center: Global search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-sm mx-8">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies, sectors, tags..."
            className={cn(
              'pl-8 h-8 text-xs bg-zinc-900 border-zinc-700/60',
              'placeholder:text-zinc-600 text-zinc-200',
              'focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50'
            )}
          />
        </div>
      </form>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="relative h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-violet-500 rounded-full" />
        </Button>

        <Button
          size="sm"
          className="h-8 text-xs bg-violet-600 hover:bg-violet-500 text-white gap-1.5 px-3"
          onClick={() => router.push('/companies')}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Company
        </Button>
      </div>
    </header>
  )
}