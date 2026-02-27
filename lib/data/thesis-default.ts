// lib/data/thesis-default.ts
// Default thesis config for demo fund: "Apex Ventures"
// Seed-stage, AI-native B2B, US/EU focus

import { ThesisConfig } from '@/lib/types'

export const DEFAULT_THESIS: ThesisConfig = {
  fundId: 'fund_apex_001',
  fundName: 'Apex Ventures',
  version: '1.0.0',
  description:
    'Seed-stage fund investing in AI-native B2B software companies in the US and EU. ' +
    'We look for technical founders building in AI/ML, DevTools, Security, and SaaS ' +
    'with evidence of early traction and defensible data or workflow moats.',
  minimumScore: 40,
  dimensions: [
    {
      key: 'sector_fit',
      label: 'Sector Fit',
      weight: 30,
      description:
        'Company operates in AI/ML, DevTools, Security, SaaS, or Infrastructure. ' +
        'FinTech and HealthTech acceptable if AI-native.',
      criteria: {
        sectors: ['AI/ML', 'DevTools', 'Security', 'SaaS', 'Infrastructure'],
        keywords: [
          'ai', 'machine learning', 'llm', 'developer tools',
          'security', 'saas', 'b2b', 'infrastructure', 'api',
          'automation', 'workflow', 'agentic', 'ai-native',
        ],
      },
    },
    {
      key: 'stage_fit',
      label: 'Stage Fit',
      weight: 25,
      description:
        'Pre-Seed or Seed stage preferred. Series A acceptable if thesis is strong. ' +
        'Series B+ is outside mandate.',
      criteria: {
        stages: ['Pre-Seed', 'Seed', 'Series A'],
      },
    },
    {
      key: 'geography_fit',
      label: 'Geography Fit',
      weight: 15,
      description: 'US or EU headquartered. Remote-first companies acceptable.',
      criteria: {
        geographies: [
          'US', 'UK', 'Germany', 'France', 'Netherlands',
          'Sweden', 'Israel', 'Remote', 'Europe',
        ],
      },
    },
    {
      key: 'traction_signals',
      label: 'Traction Signals',
      weight: 20,
      description:
        'Evidence of momentum: recent funding, hiring activity, product launches, ' +
        'press coverage, or GitHub traction. Recency matters.',
      criteria: {
        requiresEnrichment: false,
      },
    },
    {
      key: 'team_quality',
      label: 'Team & Founder Signal',
      weight: 10,
      description:
        'Technical founders preferred. Prior exits, research backgrounds, ' +
        'or top-tier employer backgrounds are positive signals.',
      criteria: {
        keywords: [
          'phd', 'research', 'mit', 'stanford', 'cmu',
          'google', 'meta', 'openai', 'deepmind', 'ex-',
        ],
      },
    },
  ],
}