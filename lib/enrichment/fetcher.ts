import { SourceRecord } from '@/lib/types'

interface FetchResult {
  content: string
  source: SourceRecord
}

export async function fetchPageContent(url: string): Promise<FetchResult | null> {
  const fetchedAt = new Date().toISOString()

  try {
    // Use Firecrawl API for reliable scraping
    const apiKey = process.env.FIRECRAWL_API_KEY
    if (!apiKey) {
      console.warn('FIRECRAWL_API_KEY not set - scraping will be skipped')
      return null
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000) // 15s timeout

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
        timeout: 10000,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      console.warn(`Firecrawl returned ${response.status} for ${url}`)
      return {
        content: '',
        source: {
          url,
          fetchedAt,
          statusCode: response.status,
        },
      }
    }

    const data = await response.json() as {
      success: boolean
      data?: { markdown?: string; content?: string }
      error?: string
    }

    if (!data.success) {
      console.warn(`Firecrawl failed for ${url}: ${data.error}`)
      return null
    }

    const content = data.data?.markdown ?? data.data?.content ?? ''

    return {
      content: content.slice(0, 8000), // cap at 8k chars
      source: {
        url,
        fetchedAt,
        statusCode: 200,
        contentLength: content.length,
      },
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.warn(`Timeout fetching ${url}`)
    } else {
      console.error(`Fetch failed for ${url}:`, err)
    }
    return null
  }
}
