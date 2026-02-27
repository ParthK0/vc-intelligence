import Anthropic from '@anthropic-ai/sdk'
import { EnrichmentPayload, DerivedSignal, SourceRecord } from '@/lib/types'

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
