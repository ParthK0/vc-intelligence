import { NextRequest, NextResponse } from 'next/server'
import { SEED_COMPANIES } from '@/lib/data/seed'
import { scoreCompany } from '@/lib/scoring/engine'
import { DEFAULT_THESIS } from '@/lib/data/thesis-default'
import { generateFallbackMemo, MEMO_SYSTEM_PROMPT, buildMemoPrompt } from '@/lib/enrichment/memo-generator'
import { DealMemo, EnrichmentPayload } from '@/lib/types'

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body = await req.json() as {
            companyId: string
            enrichment?: EnrichmentPayload | null
        }

        const company = SEED_COMPANIES.find(c => c.id === body.companyId)
        if (!company) {
            return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 })
        }

        const enrichment = body.enrichment ?? null
        const score = scoreCompany(company, DEFAULT_THESIS, enrichment ?? undefined)

        // Try Claude first
        const apiKey = process.env.ANTHROPIC_API_KEY
        if (apiKey) {
            try {
                const Anthropic = (await import('@anthropic-ai/sdk')).default
                const client = new Anthropic({ apiKey })

                const message = await client.messages.create({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 2000,
                    system: MEMO_SYSTEM_PROMPT,
                    messages: [{ role: 'user', content: buildMemoPrompt(company, score, enrichment) }],
                })

                const text = message.content[0].type === 'text' ? message.content[0].text : ''
                const parsed = JSON.parse(text) as Partial<DealMemo>

                const memo: DealMemo = {
                    companyId: company.id,
                    companyName: company.name,
                    generatedAt: new Date().toISOString(),
                    investmentSummary: parsed.investmentSummary ?? '',
                    problem: parsed.problem ?? '',
                    solution: parsed.solution ?? '',
                    market: parsed.market ?? '',
                    tractionSignals: parsed.tractionSignals ?? '',
                    thesisMatch: parsed.thesisMatch ?? '',
                    risks: parsed.risks ?? '',
                    recommendedNextStep: parsed.recommendedNextStep ?? '',
                    modelUsed: 'claude-sonnet-4-20250514',
                }

                return NextResponse.json({ success: true, data: memo })
            } catch (err) {
                console.error('Claude memo generation failed, using fallback:', err)
            }
        }

        // Fallback
        const memo = generateFallbackMemo(company, score, enrichment)
        return NextResponse.json({ success: true, data: memo })
    } catch (err) {
        console.error('Memo API error:', err)
        return NextResponse.json(
            { success: false, error: 'Memo generation failed' },
            { status: 500 }
        )
    }
}
