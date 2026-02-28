// lib/enrichment/memo-generator.ts
// AI Deal Memo Generator — creates structured 1-page investment memos

import { Company, DealMemo, EnrichmentPayload, ScoreResult } from '@/lib/types'

export function generateFallbackMemo(
    company: Company,
    score: ScoreResult | null,
    enrichment: EnrichmentPayload | null
): DealMemo {
    const signals = company.signals
    const topSignals = signals
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5)

    const matchedDims = score?.dimensions.filter(d => d.matched) ?? []
    const missedDims = score?.dimensions.filter(d => !d.matched) ?? []

    return {
        companyId: company.id,
        companyName: company.name,
        generatedAt: new Date().toISOString(),
        investmentSummary:
            `${company.name} is a ${company.stage} ${company.sector} company based in ${company.geography}, ` +
            `building ${company.tagline.toLowerCase()}. ` +
            (company.totalRaised
                ? `The company has raised $${(company.totalRaised / 1_000_000).toFixed(1)}M to date. `
                : '') +
            (score
                ? `Thesis score: ${score.total}/100 (${score.grade}, ${score.confidence} confidence).`
                : ''),
        problem:
            enrichment?.summary
                ? `Based on enrichment data: ${enrichment.summary.split('.').slice(0, 2).join('.')}. ` +
                `The company targets a gap in the ${company.sector} market.`
                : `${company.name} addresses a significant gap in the ${company.sector} market. ` +
                `${company.description.split('.').slice(0, 2).join('.')}.`,
        solution:
            enrichment?.whatTheyDo && enrichment.whatTheyDo.length > 0
                ? enrichment.whatTheyDo.join('. ') + '.'
                : `${company.tagline}. ${company.description.split('.').slice(0, 2).join('.')}.`,
        market:
            `${company.sector} vertical targeting ${company.geography} market. ` +
            `Stage: ${company.stage}. ` +
            (company.headcount ? `Current team size: ${company.headcount}. ` : '') +
            `Founded in ${company.foundedYear}.`,
        tractionSignals:
            topSignals.length > 0
                ? topSignals
                    .map(
                        s =>
                            `• ${s.type.toUpperCase()}: ${s.title} (${s.confidence} confidence, ${s.source})`
                    )
                    .join('\n')
                : 'No significant traction signals detected yet.',
        thesisMatch:
            score
                ? `Overall: ${score.total}/100 — ${score.grade}.\n` +
                matchedDims
                    .map(d => `✅ ${d.label}: ${d.rawScore}/100 — ${d.evidence.slice(0, 2).join('; ')}`)
                    .join('\n') +
                (missedDims.length > 0
                    ? '\n' +
                    missedDims
                        .map(
                            d => `⚠️ ${d.label}: ${d.rawScore}/100 — ${d.missing.slice(0, 1).join('; ')}`
                        )
                        .join('\n')
                    : '')
                : 'Score not yet calculated.',
        risks:
            (missedDims.length > 0
                ? `Thesis gaps in: ${missedDims.map(d => d.label).join(', ')}. `
                : '') +
            (company.stage === 'Pre-Seed'
                ? 'Early stage — limited traction data available. '
                : '') +
            (!enrichment
                ? 'No enrichment data — limited insight into current operations. '
                : '') +
            (signals.filter(s => s.confidence === 'low').length > 0
                ? 'Some signals have low confidence ratings. '
                : '') +
            'Market competition and execution risk apply.',
        recommendedNextStep:
            score && score.total >= 75
                ? 'Schedule intro call. Company strongly fits thesis — move to partner review.'
                : score && score.total >= 55
                    ? 'Worth a deeper look. Request warm intro and gather more data before partner review.'
                    : score && score.total >= 35
                        ? 'Monitor for now. Watch for strengthening signals before pursuing further.'
                        : 'Pass or revisit if thesis evolves. Current fit is below minimum threshold.',
        modelUsed: 'fallback-deterministic',
    }
}

export const MEMO_SYSTEM_PROMPT = `You are a senior VC analyst writing a concise 1-page investment memo. 
Be direct, specific, and analytical. Use evidence from the provided data.
Write in professional but accessible language suitable for an investment committee.

Return ONLY valid JSON with these exact fields:
- investmentSummary (2-3 sentences)
- problem (2-3 sentences)
- solution (2-3 sentences)  
- market (2-3 sentences)
- tractionSignals (bullet points as single string with \\n separators)
- thesisMatch (analysis of thesis fit)
- risks (2-4 key risks)
- recommendedNextStep (1-2 sentences)`

export function buildMemoPrompt(
    company: Company,
    score: ScoreResult | null,
    enrichment: EnrichmentPayload | null
): string {
    return `Generate an investment memo for:

Company: ${company.name}
Tagline: ${company.tagline}
Description: ${company.description}
Sector: ${company.sector} | Stage: ${company.stage} | Geography: ${company.geography}
Founded: ${company.foundedYear} | Headcount: ${company.headcount ?? 'Unknown'}
Total Raised: ${company.totalRaised ? `$${(company.totalRaised / 1_000_000).toFixed(1)}M` : 'Undisclosed'}
Founders: ${company.founderNames.join(', ')}
Investors: ${company.investorNames.join(', ')}
Tags: ${company.tags.join(', ')}

${enrichment?.summary ? `Enrichment Summary: ${enrichment.summary}` : ''}
${enrichment?.whatTheyDo?.length ? `What They Do: ${enrichment.whatTheyDo.join('. ')}` : ''}
${enrichment?.keywords?.length ? `Keywords: ${enrichment.keywords.join(', ')}` : ''}

Signals:
${company.signals.map(s => `- ${s.type}: ${s.title} (${s.confidence} confidence)`).join('\n')}

${score ? `Thesis Score: ${score.total}/100 (${score.grade}, ${score.confidence} confidence)
Dimensions:
${score.dimensions.map(d => `- ${d.label}: ${d.rawScore}/100 (${d.matched ? 'matched' : 'missed'})`).join('\n')}
Explanation: ${score.explanation}` : 'No thesis score available.'}

Return valid JSON only.`
}
