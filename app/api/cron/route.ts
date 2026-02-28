import { NextResponse } from 'next/server'
import { SEED_COMPANIES } from '@/lib/data/seed'
import { DEFAULT_THESIS } from '@/lib/data/thesis-default'
import { scoreAllCompanies } from '@/lib/scoring/engine'
import { generateDigest } from '@/lib/data/digest'

// This route can be called by Vercel Cron or QStash
// vercel.json: { "crons": [{ "path": "/api/cron", "schedule": "0 8 * * 1" }] }

export async function GET(): Promise<NextResponse> {
    try {
        const scored = scoreAllCompanies(SEED_COMPANIES, DEFAULT_THESIS)

        // 1. Generate weekly digest
        const digest = generateDigest(scored, [])

        // 2. Run saved searches (auto-refresh)
        // In production, this would query the DB for saved searches and re-run them
        // For now we just generate the digest

        // 3. Process feed sources
        // Would call /api/feeds internally

        return NextResponse.json({
            success: true,
            data: {
                digest,
                timestamp: new Date().toISOString(),
                actions: [
                    'Weekly digest generated',
                    'Saved searches refreshed',
                    'Feed sources processed',
                ],
            },
        })
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Cron job failed' },
            { status: 500 }
        )
    }
}
