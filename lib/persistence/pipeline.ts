// lib/persistence/pipeline.ts
// Deal pipeline (Kanban) persistence

import { PipelineData, PipelineStage } from '@/lib/types'

const PIPELINE_KEY = 'vc_scout_pipeline'

const EMPTY_PIPELINE: PipelineData = {
    sourced: [],
    intro: [],
    partner_review: [],
    ic: [],
    invested: [],
    passed: [],
}

export function getPipeline(): PipelineData {
    try {
        const raw = localStorage.getItem(PIPELINE_KEY)
        return raw ? { ...EMPTY_PIPELINE, ...(JSON.parse(raw) as PipelineData) } : { ...EMPTY_PIPELINE }
    } catch {
        return { ...EMPTY_PIPELINE }
    }
}

function savePipeline(pipeline: PipelineData): void {
    try {
        localStorage.setItem(PIPELINE_KEY, JSON.stringify(pipeline))
    } catch {
        console.error('Failed to save pipeline')
    }
}

export function addToPipeline(companyId: string, stage: PipelineStage = 'sourced'): void {
    const pipeline = getPipeline()
    // Remove from all stages first
    for (const key of Object.keys(pipeline) as PipelineStage[]) {
        pipeline[key] = pipeline[key].filter(id => id !== companyId)
    }
    pipeline[stage].push(companyId)
    savePipeline(pipeline)
}

export function moveCompany(companyId: string, toStage: PipelineStage): void {
    addToPipeline(companyId, toStage)
}

export function removeFromPipeline(companyId: string): void {
    const pipeline = getPipeline()
    for (const key of Object.keys(pipeline) as PipelineStage[]) {
        pipeline[key] = pipeline[key].filter(id => id !== companyId)
    }
    savePipeline(pipeline)
}

export function getCompanyStage(companyId: string): PipelineStage | null {
    const pipeline = getPipeline()
    for (const key of Object.keys(pipeline) as PipelineStage[]) {
        if (pipeline[key].includes(companyId)) return key
    }
    return null
}

export const PIPELINE_STAGES: { key: PipelineStage; label: string; color: string }[] = [
    { key: 'sourced', label: 'Sourced', color: 'bg-zinc-600' },
    { key: 'intro', label: 'Intro', color: 'bg-blue-600' },
    { key: 'partner_review', label: 'Partner Review', color: 'bg-violet-600' },
    { key: 'ic', label: 'IC', color: 'bg-amber-600' },
    { key: 'invested', label: 'Invested', color: 'bg-emerald-600' },
    { key: 'passed', label: 'Passed', color: 'bg-red-600' },
]
