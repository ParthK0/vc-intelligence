import { NextRequest, NextResponse } from 'next/server'
import { SEED_COMPANIES } from '@/lib/data/seed'
import { scoreCompany } from '@/lib/scoring/engine'
import { DEFAULT_THESIS } from '@/lib/data/thesis-default'
import { EnrichmentPayload } from '@/lib/types'

const SYSTEM_PROMPT = `You are Scout AI, an intelligent VC copilot for the fund "Apex Ventures".
You help analysts understand companies, scores, and signals.
Be concise, analytical, and data-driven. Use bullet points where helpful.
Always reference specific data from the company profile when answering.
If you don't have enough data, say so clearly.`

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body = await req.json() as {
            question: string
            companyId: string
            enrichment?: EnrichmentPayload | null
        }

        const company = SEED_COMPANIES.find(c => c.id === body.companyId)
        if (!company) {
            return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 })
        }

        const enrichment = body.enrichment ?? null
        const score = scoreCompany(company, DEFAULT_THESIS, enrichment ?? undefined)

        const apiKey = process.env.ANTHROPIC_API_KEY
        if (!apiKey) {
            // Fallback smart responses
            const answer = generateFallbackAnswer(body.question, company, score)
            return NextResponse.json({ success: true, data: { answer, modelUsed: 'fallback' } })
        }

        try {
            const Anthropic = (await import('@anthropic-ai/sdk')).default
            const client = new Anthropic({ apiKey })

            const context = `Company: ${company.name}
Tagline: ${company.tagline}
Description: ${company.description}
Sector: ${company.sector} | Stage: ${company.stage} | Geography: ${company.geography}
Founded: ${company.foundedYear} | Headcount: ${company.headcount ?? 'Unknown'}
Total Raised: ${company.totalRaised ? `$${(company.totalRaised / 1_000_000).toFixed(1)}M` : 'Undisclosed'}
Founders: ${company.founderNames.join(', ')}
Investors: ${company.investorNames.join(', ')}
Tags: ${company.tags.join(', ')}
Thesis Score: ${score.total}/100 (${score.grade}, ${score.confidence} confidence)
Dimensions: ${score.dimensions.map(d => `${d.label}: ${d.rawScore}/100 (${d.matched ? 'matched' : 'missed'})`).join(', ')}
${enrichment?.summary ? `Enrichment: ${enrichment.summary}` : ''}
${enrichment?.keywords?.length ? `Keywords: ${enrichment.keywords.join(', ')}` : ''}
Signals: ${company.signals.map(s => `${s.type}: ${s.title} (${s.confidence})`).join('; ')}`

            const message = await client.messages.create({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                system: SYSTEM_PROMPT + '\n\nCompany Context:\n' + context,
                messages: [{ role: 'user', content: body.question }],
            })

            const text = message.content[0].type === 'text' ? message.content[0].text : ''
            return NextResponse.json({ success: true, data: { answer: text, modelUsed: 'claude-sonnet-4-20250514' } })
        } catch (err) {
            console.error('Claude Ask failed:', err)
            const answer = generateFallbackAnswer(body.question, company, score)
            return NextResponse.json({ success: true, data: { answer, modelUsed: 'fallback' } })
        }
    } catch (err) {
        console.error('Ask API error:', err)
        return NextResponse.json(
            { success: false, error: 'Failed to process question' },
            { status: 500 }
        )
    }
}

function generateFallbackAnswer(
    question: string,
    company: ReturnType<typeof SEED_COMPANIES.find> & object,
    score: ReturnType<typeof scoreCompany>
): string {
    const q = question.toLowerCase()

    if (q.includes('score') && (q.includes('low') || q.includes('why'))) {
        const missed = score.dimensions.filter(d => !d.matched)
        return `${company.name} scored ${score.total}/100 (${score.grade}).\n\n` +
            `The score is affected by:\n` +
            missed.map(d => `• **${d.label}**: ${d.rawScore}/100 — ${d.missing[0] ?? 'Below threshold'}`).join('\n') +
            `\n\nConfidence: ${score.confidence}`
    }

    if (q.includes('risk')) {
        const missed = score.dimensions.filter(d => !d.matched)
        return `Key risks for ${company.name}:\n\n` +
            (missed.length > 0 ? `• **Thesis gaps**: ${missed.map(d => d.label).join(', ')}\n` : '') +
            `• **Stage risk**: ${company.stage} company — execution uncertainty\n` +
            `• **Market**: ${company.sector} is competitive\n` +
            `• **Confidence**: ${score.confidence} — ${score.confidence === 'Low' ? 'limited data' : 'moderate data coverage'}`
    }

    if (q.includes('similar') || q.includes('competitor')) {
        return `${company.name} operates in the **${company.sector}** space (${company.stage}), ` +
            `tagged as: ${company.tags.slice(0, 5).join(', ')}.\n\n` +
            `To find similar companies, use the "Similar Companies" section on the profile page.`
    }

    if (q.includes('summarize') || q.includes('summary')) {
        return `**${company.name}** — ${company.tagline}\n\n` +
            `${company.description}\n\n` +
            `• Sector: ${company.sector} | Stage: ${company.stage}\n` +
            `• Geography: ${company.geography} | Founded: ${company.foundedYear}\n` +
            `• Score: ${score.total}/100 (${score.grade}, ${score.confidence} confidence)\n` +
            `• Signals: ${company.signals.length} total, ${company.signals.filter(s => s.isNew).length} new`
    }

    return `Based on available data for **${company.name}**:\n\n` +
        `• Score: ${score.total}/100 (${score.grade})\n` +
        `• Sector: ${company.sector} | Stage: ${company.stage}\n` +
        `• ${company.signals.length} signals detected\n` +
        `• Confidence: ${score.confidence}\n\n` +
        `For more specific analysis, try asking about risks, scoring, or request a summary.`
}
