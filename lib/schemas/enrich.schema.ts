import { z } from 'zod'

export const EnrichRequestSchema = z.object({
  companyId: z.string().min(1),
  domain: z.string().min(1),
  companyName: z.string().min(1),
})

export const DerivedSignalSchema = z.object({
  signal: z.string(),
  confidence: z.enum(['high', 'medium', 'low']),
  evidence: z.string(),
  sourceUrl: z.string(),
})

export const EnrichResponseSchema = z.object({
  companyId: z.string(),
  status: z.enum(['pending', 'success', 'partial', 'failed']),
  summary: z.string().nullable(),
  whatTheyDo: z.array(z.string()),
  keywords: z.array(z.string()),
  derivedSignals: z.array(DerivedSignalSchema),
  sources: z.array(
    z.object({
      url: z.string(),
      fetchedAt: z.string(),
      statusCode: z.number(),
      contentLength: z.number().optional(),
    })
  ),
  enrichedAt: z.string(),
  modelUsed: z.string(),
})

export type EnrichRequest = z.infer<typeof EnrichRequestSchema>
export type EnrichResponseData = z.infer<typeof EnrichResponseSchema>
