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
    if (!apiKey) throw new Error('FIRECRAWL_API_KEY not set')

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
      }),
    })

    if (!response.ok) {
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
    console.error(`Fetch failed for ${url}:`, err)
    return null
  }
}
