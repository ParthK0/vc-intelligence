'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { SEED_COMPANIES } from '@/lib/data/seed'
import { DEFAULT_THESIS } from '@/lib/data/thesis-default'
import { scoreCompany } from '@/lib/scoring/engine'
import { cacheGet, cacheSet, getCachedAt } from '@/lib/cache/index'
import { getLists, saveList, addCompanyToList } from '@/lib/persistence/lists'
import {
  Company,
  EnrichmentPayload,
  ScoreResult,
  CompanyList,
  Note,
} from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  Zap,
  TrendingUp,
  ExternalLink,
  BookMarked,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle,
  Globe,
  Calendar,
  Users,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import {
  PageTransition,
  AnimatedScore,
  motion,
  SlideUp,
  FadeIn,
  StaggerList,
  StaggerItem,
  LoadingSpinner,
} from '@/components/ui/motion'

export default function CompanyProfilePage(): React.JSX.Element {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const company = SEED_COMPANIES.find((c) => c.id === id)

  const [enrichment, setEnrichment] = useState<EnrichmentPayload | null>(null)
  const [enriching, setEnriching] = useState(false)
  const [enrichError, setEnrichError] = useState<string | null>(null)
  const [cachedAt, setCachedAt] = useState<string | null>(null)
  const [score, setScore] = useState<ScoreResult | null>(null)
  const [notes, setNotes] = useState<Note[]>(company?.notes ?? [])
  const [newNote, setNewNote] = useState('')
  const [lists, setLists] = useState<CompanyList[]>([])
  const [showListMenu, setShowListMenu] = useState(false)
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'signals' | 'enrichment' | 'score'>('overview')

  useEffect(() => {
    if (!company) return
    // Load cached enrichment
    const cached = cacheGet<EnrichmentPayload>(`enrich_${id}`)
    if (cached) {
      setEnrichment(cached)
      setCachedAt(getCachedAt(`enrich_${id}`))
      const scored = scoreCompany(company, DEFAULT_THESIS, cached)
      setScore(scored)
    } else {
      const scored = scoreCompany(company, DEFAULT_THESIS)
      setScore(scored)
    }
    setLists(getLists())
  }, [id, company])

  if (!company) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400">Company not found</p>
          <Button
            variant="ghost"
            className="mt-4 text-violet-400"
            onClick={() => router.push('/companies')}
          >
            Back to Companies
          </Button>
        </div>
      </div>
    )
  }

  async function handleEnrich(): Promise<void> {
    setEnriching(true)
    setEnrichError(null)

    try {
      const res = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: company!.id,
          domain: company!.domain,
          companyName: company!.name,
        }),
      })

      const data = await res.json() as {
        success: boolean
        data?: EnrichmentPayload
        error?: string
      }

      if (!data.success || !data.data) {
        setEnrichError(data.error ?? 'Enrichment failed')
        return
      }

      cacheSet(`enrich_${id}`, data.data, 60 * 24) // cache 24hrs
      setCachedAt(new Date().toISOString())
      setEnrichment(data.data)
      setActiveTab('enrichment')

      const scored = scoreCompany(company!, DEFAULT_THESIS, data.data)
      setScore(scored)
    } catch {
      setEnrichError('Network error — check API keys and try again')
    } finally {
      setEnriching(false)
    }
  }

  function handleAddNote(): void {
    if (!newNote.trim()) return
    const note: Note = {
      id: `note_${Date.now()}`,
      content: newNote.trim(),
      authorLabel: 'Analyst',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setNotes((prev) => [note, ...prev])
    setNewNote('')
  }

  function handleAddToList(listId: string): void {
    addCompanyToList(listId, company!.id)
    setShowListMenu(false)
  }

  function handleCreateList(): void {
    const name = window.prompt('New list name:')
    if (!name) return
    const newList: CompanyList = {
      id: `list_${Date.now()}`,
      name,
      companyIds: [company!.id],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    saveList(newList)
    setLists(getLists())
  }

  function formatFunding(amount?: number): string {
    if (!amount) return 'Undisclosed'
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
    return `$${(amount / 1_000).toFixed(0)}K`
  }

  function scoreColor(score: number): string {
    if (score >= 75) return 'text-emerald-400'
    if (score >= 55) return 'text-amber-400'
    if (score >= 35) return 'text-zinc-300'
    return 'text-zinc-500'
  }

  function scoreBg(score: number): string {
    if (score >= 75) return 'bg-emerald-600/15'
    if (score >= 55) return 'bg-amber-600/15'
    return 'bg-zinc-800'
  }

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
    <PageTransition className="min-h-screen bg-zinc-950">
      <TopBar title={company.name} subtitle={company.tagline} />

      <div className="p-6 max-w-5xl">

        {/* Back */}
        <motion.button
          onClick={() => router.push('/companies')}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 mb-5 transition-colors"
          whileHover={{ x: -3 }}
          transition={{ duration: 0.15 }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Companies
        </motion.button>

        {/* Header */}
        <SlideUp>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <motion.div 
                  className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0"
                  whileHover={{ scale: 1.05, borderColor: 'rgb(139, 92, 246)' }}
                  transition={{ duration: 0.15 }}
                >
                  <span className="text-sm font-bold text-zinc-300">
                    {company.name.slice(0, 2).toUpperCase()}
                  </span>
                </motion.div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-lg font-bold text-zinc-100">{company.name}</h1>
                    {score && (
                      <AnimatedScore 
                        score={score.total} 
                        size="md" 
                        showLabel={true}
                      />
                    )}
                  </div>
                  <p className="text-sm text-zinc-400 mt-0.5">{company.tagline}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Badge variant="secondary" className="text-[10px] bg-zinc-800 text-zinc-400 border-0">
                        {company.stage}
                      </Badge>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Badge variant="secondary" className="text-[10px] bg-zinc-800 text-zinc-400 border-0">
                        {company.sector}
                      </Badge>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Badge variant="secondary" className="text-[10px] bg-zinc-800 text-zinc-400 border-0">
                        {company.geography}
                      </Badge>
                    </motion.div>
                    <span className="text-[10px] text-zinc-600">
                      Founded {company.foundedYear}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
              <a
                href={`https://${company.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-700 px-2.5 py-1.5 rounded-md hover:bg-zinc-800 transition-all"
              >
                <Globe className="w-3.5 h-3.5" />
                Website
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="relative">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowListMenu(!showListMenu)}
                  className="h-8 gap-1.5 border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-100 text-xs"
                >
                  <BookMarked className="w-3.5 h-3.5" />
                  Save to List
                </Button>
                {showListMenu && (
                  <div className="absolute right-0 top-9 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 min-w-48 py-1">
                    {lists.length === 0 ? (
                      <p className="text-xs text-zinc-500 px-3 py-2">No lists yet</p>
                    ) : (
                      lists.map((list) => (
                        <button
                          key={list.id}
                          onClick={() => handleAddToList(list.id)}
                          className="w-full text-left text-xs text-zinc-300 px-3 py-2 hover:bg-zinc-800 transition-colors"
                        >
                          {list.name}
                        </button>
                      ))
                    )}
                    <div className="border-t border-zinc-800 mt-1 pt-1">
                      <button
                        onClick={handleCreateList}
                        className="w-full text-left text-xs text-violet-400 px-3 py-2 hover:bg-zinc-800 flex items-center gap-1.5"
                      >
                        <Plus className="w-3 h-3" />
                        New List
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Button
                size="sm"
                onClick={handleEnrich}
                disabled={enriching}
                className="h-8 gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs"
              >
                {enriching ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5" />
                )}
                {enriching ? 'Enriching...' : enrichment ? 'Re-Enrich' : 'Enrich'}
              </Button>
            </div>
          </div>

          {/* Meta row */}
          <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-zinc-800">
            <div className="flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5 text-zinc-600" />
              <div>
                <p className="text-[10px] text-zinc-600">Total Raised</p>
                <p className="text-xs font-medium text-zinc-300">
                  {formatFunding(company.totalRaised)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-zinc-600" />
              <div>
                <p className="text-[10px] text-zinc-600">Last Round</p>
                <p className="text-xs font-medium text-zinc-300">
                  {company.lastFundingDate
                    ? formatDistanceToNow(new Date(company.lastFundingDate), { addSuffix: true })
                    : '—'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-zinc-600" />
              <div>
                <p className="text-[10px] text-zinc-600">Headcount</p>
                <p className="text-xs font-medium text-zinc-300">
                  {company.headcount ?? '—'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-zinc-600" />
              <div>
                <p className="text-[10px] text-zinc-600">Signals</p>
                <p className="text-xs font-medium text-zinc-300">
                  {company.signals.length} total
                </p>
              </div>
            </div>
          </div>
        </div>
        </SlideUp>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-4 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
          {(['overview', 'signals', 'enrichment', 'score'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize',
                activeTab === tab
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              {tab}
              {tab === 'enrichment' && enrichment && (
                <span className="ml-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                  About
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {company.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {company.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                  Notes
                </h3>
                <div className="flex gap-2 mb-3">
                  <input
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    placeholder="Add a note... (press Enter)"
                    className="flex-1 text-xs bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
                  />
                  <Button
                    size="sm"
                    onClick={handleAddNote}
                    className="h-8 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
                {notes.length === 0 ? (
                  <p className="text-xs text-zinc-600">No notes yet</p>
                ) : (
                  <div className="space-y-2">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="bg-zinc-800/60 rounded-lg px-3 py-2.5"
                      >
                        <p className="text-xs text-zinc-300">{note.content}</p>
                        <p className="text-[10px] text-zinc-600 mt-1">
                          {note.authorLabel} ·{' '}
                          {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                  Founders
                </h3>
                {company.founderNames.map((name) => (
                  <div key={name} className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-zinc-500">
                        {name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-300">{name}</span>
                  </div>
                ))}
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                  Investors
                </h3>
                {company.investorNames.map((name) => (
                  <div key={name} className="text-xs text-zinc-400 mb-1.5 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'signals' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
              Signal Timeline ({company.signals.length})
            </h3>
            <div className="space-y-3">
              {company.signals
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((signal) => (
                  <div
                    key={signal.id}
                    className="flex gap-4 p-3 rounded-lg bg-zinc-800/50 border border-zinc-800"
                  >
                    <div className="text-lg flex-shrink-0">
                      {signalTypeIcon[signal.type] ?? '📌'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-medium text-zinc-200">
                          {signal.title}
                          {signal.isNew && (
                            <span className="ml-2 text-[9px] bg-violet-600/20 text-violet-400 px-1.5 py-0.5 rounded-full">
                              NEW
                            </span>
                          )}
                        </p>
                        <span className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded flex-shrink-0',
                          signal.confidence === 'high' ? 'bg-emerald-600/20 text-emerald-400' :
                          signal.confidence === 'medium' ? 'bg-amber-600/20 text-amber-400' :
                          'bg-zinc-800 text-zinc-500'
                        )}>
                          {signal.confidence}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {signal.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-zinc-600">
                          {signal.source}
                        </span>
                        <span className="text-[10px] text-zinc-700">·</span>
                        <span className="text-[10px] text-zinc-600">
                          {formatDistanceToNow(new Date(signal.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'enrichment' && (
          <div className="space-y-4">
            {!enrichment && !enriching && (
              <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-xl p-10 text-center">
                <Zap className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                <p className="text-sm text-zinc-400 mb-1">No enrichment data yet</p>
                <p className="text-xs text-zinc-600 mb-4">
                  Click Enrich to fetch real website content via AI
                </p>
                <Button
                  onClick={handleEnrich}
                  className="bg-violet-600 hover:bg-violet-500 text-white text-xs"
                >
                  <Zap className="w-3.5 h-3.5 mr-1.5" />
                  Enrich Now
                </Button>
              </div>
            )}

            {enriching && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center">
                <Loader2 className="w-8 h-8 text-violet-400 mx-auto mb-3 animate-spin" />
                <p className="text-sm text-zinc-400">Fetching {company.domain}...</p>
                <p className="text-xs text-zinc-600 mt-1">
                  Scraping public pages and extracting intelligence
                </p>
              </div>
            )}

            {enrichError && (
              <div className="bg-red-900/20 border border-red-800/40 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-red-300">Enrichment failed</p>
                  <p className="text-xs text-red-400/70 mt-0.5">{enrichError}</p>
                </div>
              </div>
            )}

            {enrichment && !enriching && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-zinc-400">
                      Enriched {cachedAt ? formatDistanceToNow(new Date(cachedAt), { addSuffix: true }) : 'recently'}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-600">
                    via {enrichment.modelUsed}
                  </span>
                </div>

                {enrichment.summary && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                      Summary
                    </h3>
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      {enrichment.summary}
                    </p>
                  </div>
                )}

                {enrichment.whatTheyDo.length > 0 && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                      What They Do
                    </h3>
                    <ul className="space-y-1.5">
                      {enrichment.whatTheyDo.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                          <span className="text-violet-400 mt-0.5 flex-shrink-0">→</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {enrichment.keywords.length > 0 && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                      Keywords
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {enrichment.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="text-xs bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {enrichment.derivedSignals.length > 0 && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                      Derived Signals
                    </h3>
                    <div className="space-y-2">
                      {enrichment.derivedSignals.map((sig, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg"
                        >
                          <span className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0',
                            sig.confidence === 'high' ? 'bg-emerald-600/20 text-emerald-400' :
                            sig.confidence === 'medium' ? 'bg-amber-600/20 text-amber-400' :
                            'bg-zinc-700 text-zinc-400'
                          )}>
                            {sig.confidence}
                          </span>
                          <div>
                            <p className="text-xs font-medium text-zinc-200">{sig.signal}</p>
                            <p className="text-[11px] text-zinc-500 mt-0.5 italic">
                              &ldquo;{sig.evidence}&rdquo;
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sources */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                    Sources
                  </h3>
                  <div className="space-y-2">
                    {enrichment.sources.map((source, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs"
                      >
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-violet-400 hover:text-violet-300 flex items-center gap-1 truncate"
                        >
                          {source.url}
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                          <span className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded',
                            source.statusCode === 200
                              ? 'bg-emerald-600/20 text-emerald-400'
                              : 'bg-red-600/20 text-red-400'
                          )}>
                            {source.statusCode}
                          </span>
                          <span className="text-zinc-600">
                            {formatDistanceToNow(new Date(source.fetchedAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'score' && score && (
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Thesis Match Score
                </h3>
                <div className={cn(
                  'text-2xl font-bold',
                  scoreColor(score.total)
                )}>
                  {score.total}<span className="text-sm text-zinc-600">/100</span>
                </div>
              </div>

              <div className="h-2 bg-zinc-800 rounded-full mb-3">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    score.total >= 75 ? 'bg-emerald-500' :
                    score.total >= 55 ? 'bg-amber-500' : 'bg-zinc-600'
                  )}
                  style={{ width: `${score.total}%` }}
                />
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-800/50 rounded-lg p-3">
                {score.explanation}
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <button
                onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}
                className="flex items-center justify-between w-full"
              >
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Dimension Breakdown
                </h3>
                {showScoreBreakdown
                  ? <ChevronUp className="w-4 h-4 text-zinc-500" />
                  : <ChevronDown className="w-4 h-4 text-zinc-500" />
                }
              </button>

              <div className="space-y-4 mt-4">
                {score.dimensions.map((dim) => (
                  <div key={dim.key}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'w-1.5 h-1.5 rounded-full flex-shrink-0',
                          dim.matched ? 'bg-emerald-400' : 'bg-red-400'
                        )} />
                        <span className="text-xs font-medium text-zinc-300">
                          {dim.label}
                        </span>
                        <span className="text-[10px] text-zinc-600">
                          (weight: {dim.weight}%)
                        </span>
                      </div>
                      <span className={cn(
                        'text-xs font-bold',
                        dim.matched ? 'text-emerald-400' : 'text-zinc-500'
                      )}>
                        {dim.rawScore}/100
                      </span>
                    </div>

                    <div className="h-1.5 bg-zinc-800 rounded-full mb-2">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          dim.matched ? 'bg-emerald-500' : 'bg-zinc-600'
                        )}
                        style={{ width: `${dim.rawScore}%` }}
                      />
                    </div>

                    {showScoreBreakdown && (
                      <div className="ml-3.5 space-y-1">
                        {dim.evidence.map((e, i) => (
                          <p key={i} className="text-[10px] text-zinc-500 flex items-start gap-1.5">
                            <span className="text-emerald-600 flex-shrink-0">✓</span>
                            {e}
                          </p>
                        ))}
                        {dim.missing.map((m, i) => (
                          <p key={i} className="text-[10px] text-zinc-600 flex items-start gap-1.5">
                            <span className="text-red-600 flex-shrink-0">✗</span>
                            {m}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-[10px] text-zinc-600">
                Scored against <span className="text-zinc-400">{DEFAULT_THESIS.fundName}</span> thesis v{score.thesisVersion} ·
                Last scored {formatDistanceToNow(new Date(score.scoredAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
