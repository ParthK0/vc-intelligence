'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2,
  BookMarked,
  Search,
  LayoutDashboard,
  TrendingUp,
  Settings,
  Zap,
  Kanban,
  Shield,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    badge: null,
    badgeVariant: null,
  },
  {
    label: 'Companies',
    href: '/companies',
    icon: Building2,
    badge: '500',
    badgeVariant: 'secondary' as const,
  },
  {
    label: 'Pipeline',
    href: '/pipeline',
    icon: Kanban,
    badge: 'New',
    badgeVariant: 'default' as const,
  },
  {
    label: 'Lists',
    href: '/lists',
    icon: BookMarked,
    badge: null,
    badgeVariant: null,
  },
  {
    label: 'Saved Searches',
    href: '/saved',
    icon: Search,
    badge: null,
    badgeVariant: null,
  },
  {
    label: 'Signals',
    href: '/signals',
    icon: TrendingUp,
    badge: 'Live',
    badgeVariant: 'default' as const,
  },
  {
    label: 'Digest',
    href: '/digest',
    icon: FileText,
    badge: null,
    badgeVariant: null,
  },
  {
    label: 'Portfolio',
    href: '/portfolio',
    icon: Shield,
    badge: null,
    badgeVariant: null,
  },
]

export function Sidebar(): React.JSX.Element {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-zinc-950/95 backdrop-blur-xl border-r border-zinc-800/60 flex flex-col z-40">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-zinc-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-600/20">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none tracking-tight">
              Scout
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5 leading-none">
              VC Intelligence Platform
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider px-2 mb-3">
          Intelligence
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-200 group relative',
                isActive
                  ? 'bg-violet-600/15 text-violet-400'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-violet-500 rounded-r" />
              )}
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    'w-4 h-4 flex-shrink-0 transition-colors',
                    isActive
                      ? 'text-violet-400'
                      : 'text-zinc-500 group-hover:text-zinc-300'
                  )}
                />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <Badge
                  variant={item.badgeVariant === 'default' ? 'default' : 'secondary'}
                  className={cn(
                    'text-[10px] px-1.5 py-0 h-4',
                    item.badgeVariant === 'default'
                      ? 'bg-violet-600 text-white hover:bg-violet-600'
                      : 'bg-zinc-800 text-zinc-400'
                  )}
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          )
        })}

        <div className="pt-4 mt-4 border-t border-zinc-800/60">
          <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider px-2 mb-3">
            Settings
          </p>
          <Link
            href="/thesis"
            className={cn(
              'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-200 group relative',
              pathname === '/thesis'
                ? 'bg-violet-600/15 text-violet-400'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
            )}
          >
            {pathname === '/thesis' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-violet-500 rounded-r" />
            )}
            <Settings className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 flex-shrink-0" />
            <span className="font-medium">Thesis Config</span>
          </Link>
        </div>
      </nav>

      {/* Fund badge */}
      <div className="px-4 py-4 border-t border-zinc-800/60">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 rounded-xl px-3 py-3 border border-zinc-800/50">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
            Active Fund
          </p>
          <p className="text-xs text-zinc-200 font-semibold mt-0.5">
            Apex Ventures
          </p>
          <p className="text-[10px] text-zinc-500 mt-0.5">
            Seed · AI/ML · US + EU
          </p>
        </div>
      </div>
    </aside>
  )
}