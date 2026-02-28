// lib/feeds/ingestor.ts
// Live data feed ingestion — RSS, GitHub stars, job postings
// Creates auto-signals from external data sources

import { Signal, SignalType, ConfidenceLevel } from '@/lib/types'

export interface FeedSource {
    id: string
    name: string
    type: 'rss' | 'github' | 'jobs'
    url: string
    companyId: string
    enabled: boolean
    lastCheckedAt?: string
}

export interface FeedItem {
    title: string
    description: string
    url: string
    publishedAt: string
    source: string
}

const FEEDS_KEY = 'vc_scout_feeds'
const FEED_SIGNALS_KEY = 'vc_scout_feed_signals'

function getFeeds(): FeedSource[] {
    try {
        const raw = localStorage.getItem(FEEDS_KEY)
        return raw ? (JSON.parse(raw) as FeedSource[]) : []
    } catch {
        return []
    }
}

function saveFeeds(feeds: FeedSource[]): void {
    try {
        localStorage.setItem(FEEDS_KEY, JSON.stringify(feeds))
    } catch {
        console.error('Failed to save feeds')
    }
}

export function addFeedSource(feed: Omit<FeedSource, 'id'>): FeedSource {
    const feeds = getFeeds()
    const newFeed: FeedSource = {
        ...feed,
        id: `feed_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    }
    feeds.push(newFeed)
    saveFeeds(feeds)
    return newFeed
}

export function removeFeedSource(id: string): void {
    saveFeeds(getFeeds().filter(f => f.id !== id))
}

export function getFeedSources(companyId?: string): FeedSource[] {
    const feeds = getFeeds()
    return companyId ? feeds.filter(f => f.companyId === companyId) : feeds
}

export function toggleFeedSource(id: string): void {
    const feeds = getFeeds()
    const idx = feeds.findIndex(f => f.id === id)
    if (idx >= 0) {
        feeds[idx].enabled = !feeds[idx].enabled
        saveFeeds(feeds)
    }
}

/**
 * Classify a feed item into a signal type 
 */
function classifyFeedItem(item: FeedItem): { type: SignalType; confidence: ConfidenceLevel } {
    const text = `${item.title} ${item.description}`.toLowerCase()

    if (/funding|raised|round|investment|series|seed|valuation/i.test(text)) {
        return { type: 'funding', confidence: 'high' }
    }
    if (/hiring|job|engineer|recruit|open position|team|talent/i.test(text)) {
        return { type: 'hiring', confidence: 'medium' }
    }
    if (/launch|product|feature|release|update|beta|v\d/i.test(text)) {
        return { type: 'product', confidence: 'medium' }
    }
    if (/partner|integration|collaboration|alliance/i.test(text)) {
        return { type: 'partnership', confidence: 'medium' }
    }
    if (/star|fork|contributor|open.source|github/i.test(text)) {
        return { type: 'github', confidence: 'low' }
    }
    if (/ceo|cto|vp|appoint|board|leader/i.test(text)) {
        return { type: 'leadership', confidence: 'medium' }
    }
    if (/press|news|feature|media|coverage|announce/i.test(text)) {
        return { type: 'press', confidence: 'low' }
    }

    return { type: 'other', confidence: 'low' }
}

/**
 * Convert feed items into signals
 */
export function feedItemsToSignals(
    items: FeedItem[],
    companyId: string,
    sourceName: string
): Signal[] {
    return items.map(item => {
        const { type, confidence } = classifyFeedItem(item)
        return {
            id: `feed_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            type,
            title: item.title.slice(0, 100),
            description: item.description.slice(0, 300),
            source: sourceName,
            sourceUrl: item.url,
            timestamp: item.publishedAt || new Date().toISOString(),
            confidence,
            isNew: true,
        }
    })
}

/**
 * Store auto-generated feed signals
 */
export function saveFeedSignals(companyId: string, signals: Signal[]): void {
    try {
        const raw = localStorage.getItem(FEED_SIGNALS_KEY)
        const all = raw ? (JSON.parse(raw) as Record<string, Signal[]>) : {}
        const existing = all[companyId] ?? []
        all[companyId] = [...signals, ...existing].slice(0, 50) // cap at 50
        localStorage.setItem(FEED_SIGNALS_KEY, JSON.stringify(all))
    } catch {
        console.error('Failed to save feed signals')
    }
}

export function getFeedSignals(companyId: string): Signal[] {
    try {
        const raw = localStorage.getItem(FEED_SIGNALS_KEY)
        const all = raw ? (JSON.parse(raw) as Record<string, Signal[]>) : {}
        return all[companyId] ?? []
    } catch {
        return []
    }
}

/**
 * Fetch RSS feed (server-side only)
 */
export async function fetchRSSFeed(url: string): Promise<FeedItem[]> {
    try {
        const res = await fetch(url)
        const text = await res.text()
        // Simple RSS XML parser
        const items: FeedItem[] = []
        const itemRegex = /<item>([\s\S]*?)<\/item>/gi
        let match
        while ((match = itemRegex.exec(text)) !== null) {
            const itemXml = match[1]
            const title = itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim() ?? ''
            const desc = itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').trim() ?? ''
            const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? ''
            const pubDate = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() ?? ''

            if (title) {
                items.push({
                    title,
                    description: desc.slice(0, 300),
                    url: link,
                    publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
                    source: 'RSS',
                })
            }
        }
        return items.slice(0, 20) // max 20 items
    } catch {
        return []
    }
}
