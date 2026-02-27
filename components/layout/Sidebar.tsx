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
    badge: '25',
    badgeVariant: 'secondary' as const,
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
    badge: 'New',
    badgeVariant: 'default' as const,
  },
]

export function Sidebar(): React.JSX.Element {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-zinc-950 border-r border-zinc-800 flex flex-col z-40">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-none">
              Scout
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5 leading-none">
              Apex Ventures
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
                'flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-md text-sm transition-all duration-150 group',
                isActive
                  ? 'bg-violet-600/15 text-violet-400'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
              )}
            >
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
              'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-all duration-150 group',
              pathname === '/thesis'
                ? 'bg-violet-600/15 text-violet-400'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
            )}
          >
            <Settings className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 flex-shrink-0" />
            <span className="font-medium">Thesis Config</span>
          </Link>
        </div>
      </nav>

      {/* Fund badge */}
      <div className="px-4 py-4 border-t border-zinc-800">
        <div className="bg-zinc-900 rounded-lg px-3 py-2.5">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
            Active Fund
          </p>
          <p className="text-xs text-zinc-200 font-medium mt-0.5">
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