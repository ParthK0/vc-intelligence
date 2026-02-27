import { NextRequest, NextResponse } from 'next/server'
import { EnrichRequestSchema } from '@/lib/schemas/enrich.schema'
import { getUrlsToScrape } from '@/lib/enrichment/url-router'
import { fetchPageContent } from '@/lib/enrichment/fetcher'
import { extractWithLLM, generateFallbackEnrichment } from '@/lib/enrichment/extractor'
import { SourceRecord } from '@/lib/types'
import { SEED_COMPANIES } from '@/lib/data/seed'

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

    // Find company for fallback data
    const company = SEED_COMPANIES.find((c) => c.id === companyId)

    // Get URLs to scrape
    const urls = getUrlsToScrape(domain)

    // Fetch pages — try homepage first, fallback to others
    const sources: SourceRecord[] = []
    let bestContent = ''
    let bestUrl = urls[0]

    for (const url of urls) {
      try {
        const result = await fetchPageContent(url)
        if (result) {
          sources.push(result.source)
          if (result.content.length > bestContent.length) {
            bestContent = result.content
            bestUrl = url
          }
        }
      } catch (fetchErr) {
        console.error(`Failed to fetch ${url}:`, fetchErr)
      }
      // Stop if we have good content
      if (bestContent.length > 2000) break
    }

    // If no content could be scraped, generate fallback enrichment from company data
    if (bestContent.length < 100 && company) {
      const fallbackEnrichment = generateFallbackEnrichment(company)
      return NextResponse.json({
        success: true,
        data: fallbackEnrichment,
        cached: false,
        source: 'fallback',
      })
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
      { success: false, error: 'Enrichment failed — website may be unreachable' },
      { status: 500 }
    )
  }
}
