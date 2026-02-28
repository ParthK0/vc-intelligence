// lib/persistence/audit.ts
// Audit log for tracking key actions

import { AuditEntry, AuditAction } from '@/lib/types'

const AUDIT_KEY = 'vc_scout_audit'
const MAX_ENTRIES = 200

export function getAuditLog(entityId?: string, limit: number = 50): AuditEntry[] {
    try {
        const raw = localStorage.getItem(AUDIT_KEY)
        const entries: AuditEntry[] = raw ? (JSON.parse(raw) as AuditEntry[]) : []
        const filtered = entityId
            ? entries.filter(e => e.entityId === entityId)
            : entries
        return filtered.slice(0, limit)
    } catch {
        return []
    }
}

export function logAction(
    action: AuditAction,
    entityType: AuditEntry['entityType'],
    entityId: string,
    details: string,
    entityName?: string
): void {
    try {
        const raw = localStorage.getItem(AUDIT_KEY)
        const entries: AuditEntry[] = raw ? (JSON.parse(raw) as AuditEntry[]) : []

        const entry: AuditEntry = {
            id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            action,
            entityType,
            entityId,
            entityName,
            details,
            timestamp: new Date().toISOString(),
        }

        entries.unshift(entry)

        // Keep only last MAX_ENTRIES
        if (entries.length > MAX_ENTRIES) {
            entries.splice(MAX_ENTRIES)
        }

        localStorage.setItem(AUDIT_KEY, JSON.stringify(entries))
    } catch {
        console.error('Failed to log audit action')
    }
}
