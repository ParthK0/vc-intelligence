import { NextRequest, NextResponse } from 'next/server'
import { EnrichRequestSchema } from '@/lib/schemas/enrich.schema'
import { getUrlsToScrape } from '@/lib/enrichment/url-router'
import { fetchPageContent } from '@/lib/enrichment/fetcher'
import { extractWithLLM } from '@/lib/enrichment/extractor'
import { SourceRecord } from '@/lib/types'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await req.json()
    const parsed = EnrichRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { companyId, domain, companyName } = parsed.data

    // Get URLs to scrape
    const urls = getUrlsToScrape(domain)

    // Fetch pages — try homepage first, fallback to others
    const sources: SourceRecord[] = []
    let bestContent = ''
    let bestUrl = urls[0]

    for (const url of urls) {
      const result = await fetchPageContent(url)
      if (result) {
        sources.push(result.source)
        if (result.content.length > bestContent.length) {
          bestContent = result.content
          bestUrl = url
        }
      }
      // Stop if we have good content
      if (bestContent.length > 2000) break
    }

    // Extract with LLM
    const enrichment = await extractWithLLM(
      companyId,
      companyName,
      bestContent,
      bestUrl,
      sources
    )

    return NextResponse.json({
      success: true,
      data: enrichment,
      cached: false,
    })
  } catch (err) {
    console.error('Enrich API error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
