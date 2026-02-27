import Anthropic from '@anthropic-ai/sdk'
import { EnrichmentPayload, DerivedSignal, SourceRecord, Company } from '@/lib/types'

// Generate enrichment data from existing company data when scraping fails
export function generateFallbackEnrichment(company: Company): EnrichmentPayload {
  const enrichedAt = new Date().toISOString()

  // Generate summary from company data
  const summary = `${company.name} is a ${company.stage} ${company.sector} company based in ${company.geography}. ${company.tagline}`

  // Generate "what they do" from signals and sector
  const whatTheyDo: string[] = []
  if (company.sector === 'FinTech') {
    whatTheyDo.push('Develop financial technology solutions')
  } else if (company.sector === 'HealthTech') {
    whatTheyDo.push('Build healthcare technology products')
  } else if (company.sector === 'Climate') {
    whatTheyDo.push('Create climate and sustainability solutions')
  } else if (company.sector === 'AI/ML') {
    whatTheyDo.push('Develop artificial intelligence and machine learning products')
  } else if (company.sector === 'SaaS') {
    whatTheyDo.push('Provide software-as-a-service solutions')
  } else if (company.sector === 'Consumer') {
    whatTheyDo.push('Build consumer-facing products and services')
  } else if (company.sector === 'Security') {
    whatTheyDo.push('Develop security and data protection solutions')
  } else if (company.sector === 'DevTools') {
    whatTheyDo.push('Build developer tools and infrastructure')
  } else if (company.sector === 'Infrastructure') {
    whatTheyDo.push('Develop core infrastructure technology')
  } else if (company.sector === 'Marketplace') {
    whatTheyDo.push('Operate marketplace platforms')
  } else if (company.sector === 'DeepTech') {
    whatTheyDo.push('Develop advanced deep technology solutions')
  } else {
    whatTheyDo.push(`Operate in the ${company.sector} space`)
  }

  if (company.totalRaised) {
    const raisedM = (company.totalRaised / 1_000_000).toFixed(1)
    whatTheyDo.push(`Raised $${raisedM}M in funding to date`)
  }

  if (company.headcount) {
    whatTheyDo.push(`Team size in the ${company.headcount} range`)
  }

  if (company.founderNames.length > 0) {
    whatTheyDo.push(`Founded by ${company.founderNames.join(', ')}`)
  }

  // Generate keywords from sector and signals
  const keywords: string[] = [
    company.sector.toLowerCase(),
    company.stage.toLowerCase(),
    company.geography.toLowerCase(),
  ]
  
  company.signals.forEach((signal) => {
    if (signal.type === 'funding') keywords.push('funding', 'investors')
    if (signal.type === 'hiring') keywords.push('hiring', 'careers')
    if (signal.type === 'product') keywords.push('product', 'launch')
    if (signal.type === 'partnership') keywords.push('partnership', 'collaboration')
  })

  // Generate derived signals from company signals
  const derivedSignals: DerivedSignal[] = company.signals.slice(0, 3).map((signal) => ({
    signal: signal.title,
    confidence: 'medium' as const,
    evidence: `Based on ${signal.type} signal from ${new Date(signal.timestamp).toLocaleDateString()}`,
    sourceUrl: company.domain,
  }))

  return {
    companyId: company.id,
    status: 'partial',
    summary,
    whatTheyDo,
    keywords: [...new Set(keywords)].slice(0, 10),
    derivedSignals,
    sources: [{
      url: `https://${company.domain}`,
      fetchedAt: enrichedAt,
      statusCode: 0, // Indicates fallback data
    }],
    enrichedAt,
    modelUsed: 'fallback-generator',
  }
}

const SYSTEM_PROMPT = `You are a precise data extraction engine for a venture capital intelligence platform.

Your job is to extract structured information from company website content.

CRITICAL RULES:
- Extract ONLY what is explicitly stated in the provided text
- NEVER infer, guess, or hallucinate information not present in the text
- If a field cannot be filled from the text, return null or an empty array
- Every derived signal MUST include a direct quote from the source text as evidence
- Keywords must be actual terms found in the text, not invented categories
- Return ONLY valid JSON — no markdown, no explanation, no preamble`

const USER_PROMPT_TEMPLATE = (
  companyName: string,
  content: string,
  sourceUrl: string
) => `Extract structured information about "${companyName}" from this website content.

SOURCE URL: ${sourceUrl}
---
${content}
---

Return a JSON object with EXACTLY this structure:
{
  "summary": "1-2 sentence description of what the company does. null if unclear.",
  "whatTheyDo": ["bullet 1", "bullet 2", "bullet 3"],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "derivedSignals": [
    {
      "signal": "Description of the signal (e.g. 'Careers page exists with 8 open roles')",
      "confidence": "high" | "medium" | "low",
      "evidence": "EXACT quote from the source text that supports this signal",
      "sourceUrl": "${sourceUrl}"
    }
  ]
}

RULES:
- summary: null if not determinable from text
- whatTheyDo: 3-6 bullets, each starting with a verb. Empty array if unclear.
- keywords: 5-10 terms actually present in the text. Empty array if none found.
- derivedSignals: 2-4 signals. Only include signals with real evidence quotes.
  Valid signal types: careers page exists, recent blog post, product changelog present,
  API/developer docs exist, customer logos visible, pricing page exists, open source repo linked
- evidence field MUST be a verbatim quote under 100 chars from the source text
- If you cannot find evidence for a signal, do not include that signal`

interface RawExtraction {
  summary?: string | null
  whatTheyDo?: string[]
  keywords?: string[]
  derivedSignals?: Array<{
    signal: string
    confidence: string
    evidence: string
    sourceUrl: string
  }>
}

export async function extractWithLLM(
  companyId: string,
  companyName: string,
  content: string,
  sourceUrl: string,
  sources: SourceRecord[]
): Promise<EnrichmentPayload> {
  const client = new Anthropic()

  const enrichedAt = new Date().toISOString()

  if (!content || content.trim().length < 100) {
    return {
      companyId,
      status: 'failed',
      summary: null,
      whatTheyDo: [],
      keywords: [],
      derivedSignals: [],
      sources,
      enrichedAt,
      modelUsed: 'claude-sonnet-4-20250514',
    }
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: USER_PROMPT_TEMPLATE(companyName, content, sourceUrl),
        },
      ],
    })

    const rawText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    // Strip markdown code fences if present
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()

    const parsed = JSON.parse(cleaned) as RawExtraction

    // Validate and clean derived signals
    const derivedSignals: DerivedSignal[] = (parsed.derivedSignals ?? [])
      .filter(
        (s) =>
          s.signal &&
          s.evidence &&
          s.sourceUrl &&
          ['high', 'medium', 'low'].includes(s.confidence)
      )
      .map((s) => ({
        signal: String(s.signal),
        confidence: s.confidence as 'high' | 'medium' | 'low',
        evidence: String(s.evidence).slice(0, 200),
        sourceUrl: String(s.sourceUrl),
      }))

    return {
      companyId,
      status: derivedSignals.length > 0 ? 'success' : 'partial',
      summary: parsed.summary ?? null,
      whatTheyDo: (parsed.whatTheyDo ?? []).slice(0, 6),
      keywords: (parsed.keywords ?? []).slice(0, 10),
      derivedSignals,
      sources,
      enrichedAt,
      modelUsed: 'claude-sonnet-4-20250514',
    }
  } catch (err) {
    console.error('LLM extraction failed:', err)
    return {
      companyId,
      status: 'failed',
      summary: null,
      whatTheyDo: [],
      keywords: [],
      derivedSignals: [],
      sources,
      enrichedAt,
      modelUsed: 'claude-sonnet-4-20250514',
    }
  }
}
