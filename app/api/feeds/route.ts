import { NextRequest, NextResponse } from 'next/server'
import { fetchRSSFeed, feedItemsToSignals, saveFeedSignals, getFeedSources } from '@/lib/feeds/ingestor'

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body = await req.json() as {
            feedId?: string
            companyId?: string
            url?: string
            type?: string
        }

        // If specific URL provided, fetch it
        if (body.url && body.companyId) {
            const items = await fetchRSSFeed(body.url)
            const signals = feedItemsToSignals(items, body.companyId, body.url)
            saveFeedSignals(body.companyId, signals)
            return NextResponse.json({
                success: true,
                data: { itemsFound: items.length, signalsCreated: signals.length },
            })
        }

        // Otherwise run all enabled feeds
        const feeds = getFeedSources()
        const enabledFeeds = feeds.filter(f => f.enabled)
        const results: { feedId: string; itemsFound: number; signalsCreated: number }[] = []

        for (const feed of enabledFeeds) {
            try {
                if (feed.type === 'rss') {
                    const items = await fetchRSSFeed(feed.url)
                    const signals = feedItemsToSignals(items, feed.companyId, feed.name)
                    saveFeedSignals(feed.companyId, signals)
                    results.push({
                        feedId: feed.id,
                        itemsFound: items.length,
                        signalsCreated: signals.length,
                    })
                }
                // GitHub and jobs can be added later
            } catch {
                results.push({ feedId: feed.id, itemsFound: 0, signalsCreated: 0 })
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                feedsProcessed: results.length,
                totalSignals: results.reduce((s, r) => s + r.signalsCreated, 0),
                results,
            },
        })
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Feed processing failed' },
            { status: 500 }
        )
    }
}

export async function GET(): Promise<NextResponse> {
    const feeds = getFeedSources()
    return NextResponse.json({ success: true, data: feeds })
}
