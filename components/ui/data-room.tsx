'use client'

import React, { useState, useEffect } from 'react'
import {
    getDataRoom,
    toggleDataRoomItem,
    addDataRoomNote,
    addCustomDataRoomItem,
    CATEGORY_LABELS,
    DataRoom,
    DataRoomItem,
} from '@/lib/persistence/data-room'
import { cn } from '@/lib/utils'
import {
    CheckCircle2,
    Circle,
    Plus,
    FileCheck,
    ChevronDown,
    ChevronUp,
    MessageSquare,
} from 'lucide-react'
import { motion, AnimatePresence } from '@/components/ui/motion'

interface Props {
    companyId: string
    companyName: string
}

export function DataRoomChecklist({ companyId, companyName }: Props): React.JSX.Element {
    const [room, setRoom] = useState<DataRoom | null>(null)
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [newLabel, setNewLabel] = useState('')
    const [newCategory, setNewCategory] = useState<DataRoomItem['category']>('legal')
    const [editingNote, setEditingNote] = useState<string | null>(null)
    const [noteText, setNoteText] = useState('')

    useEffect(() => {
        setRoom(getDataRoom(companyId))
    }, [companyId])

    if (!room) return <div />

    function handleToggle(itemId: string): void {
        const updated = toggleDataRoomItem(companyId, itemId)
        setRoom(updated)
    }

    function handleAddItem(): void {
        if (!newLabel.trim()) return
        const updated = addCustomDataRoomItem(companyId, newLabel.trim(), newCategory)
        setRoom(updated)
        setNewLabel('')
        setShowAddForm(false)
    }

    function handleSaveNote(itemId: string): void {
        const updated = addDataRoomNote(companyId, itemId, noteText)
        setRoom(updated)
        setEditingNote(null)
        setNoteText('')
    }

    // Group items by category
    const categories = Object.keys(CATEGORY_LABELS) as DataRoomItem['category'][]
    const grouped = categories.map(cat => ({
        category: cat,
        ...CATEGORY_LABELS[cat],
        items: room.items.filter(i => i.category === cat),
        completed: room.items.filter(i => i.category === cat && i.completed).length,
        total: room.items.filter(i => i.category === cat).length,
    }))

    return (
        <div className="space-y-3">
            {/* Progress header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-violet-400" />
                    <span className="text-xs font-semibold text-zinc-200">Data Room Checklist</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-violet-500 rounded-full transition-all"
                                style={{ width: `${room.completionPercent}%` }}
                            />
                        </div>
                        <span className="text-[10px] text-zinc-500 font-medium">{room.completionPercent}%</span>
                    </div>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-1"
                    >
                        <Plus className="w-3 h-3" /> Add
                    </button>
                </div>
            </div>

            {/* Add custom item */}
            {showAddForm && (
                <div className="bg-zinc-800/50 rounded-lg p-3 flex items-center gap-2">
                    <input
                        value={newLabel}
                        onChange={e => setNewLabel(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddItem()}
                        placeholder="Checklist item..."
                        className="flex-1 text-xs bg-zinc-800 border border-zinc-700 rounded-md px-2.5 py-1.5 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
                        autoFocus
                    />
                    <select
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value as DataRoomItem['category'])}
                        className="text-xs bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1.5 text-zinc-300"
                    >
                        {categories.map(c => (
                            <option key={c} value={c}>{CATEGORY_LABELS[c].label}</option>
                        ))}
                    </select>
                    <button onClick={handleAddItem} className="text-xs text-violet-400 hover:text-violet-300 px-2">
                        Add
                    </button>
                </div>
            )}

            {/* Categories */}
            {grouped.map(group => (
                <div key={group.category} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                    <button
                        onClick={() => setExpandedCategory(
                            expandedCategory === group.category ? null : group.category
                        )}
                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-zinc-800/40 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm">{group.icon}</span>
                            <span className="text-xs font-medium text-zinc-300">{group.label}</span>
                            <span className="text-[10px] text-zinc-600">
                                {group.completed}/{group.total}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        'h-full rounded-full transition-all',
                                        group.completed === group.total ? 'bg-emerald-500' : 'bg-violet-500'
                                    )}
                                    style={{ width: `${group.total > 0 ? (group.completed / group.total) * 100 : 0}%` }}
                                />
                            </div>
                            {expandedCategory === group.category
                                ? <ChevronUp className="w-3 h-3 text-zinc-600" />
                                : <ChevronDown className="w-3 h-3 text-zinc-600" />
                            }
                        </div>
                    </button>

                    {expandedCategory === group.category && (
                        <div className="border-t border-zinc-800">
                            {group.items.map(item => (
                                <div key={item.id} className="px-3 py-2 border-b border-zinc-800/50 last:border-0">
                                    <div className="flex items-start gap-2">
                                        <button
                                            onClick={() => handleToggle(item.id)}
                                            className="mt-0.5 flex-shrink-0"
                                        >
                                            {item.completed ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            ) : (
                                                <Circle className="w-4 h-4 text-zinc-600 hover:text-zinc-400" />
                                            )}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <span className={cn(
                                                'text-xs',
                                                item.completed ? 'text-zinc-500 line-through' : 'text-zinc-300'
                                            )}>
                                                {item.label}
                                            </span>
                                            {item.note && (
                                                <p className="text-[10px] text-zinc-600 mt-0.5">💬 {item.note}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => {
                                                setEditingNote(editingNote === item.id ? null : item.id)
                                                setNoteText(item.note ?? '')
                                            }}
                                            className="text-zinc-700 hover:text-zinc-400 flex-shrink-0"
                                        >
                                            <MessageSquare className="w-3 h-3" />
                                        </button>
                                    </div>
                                    {editingNote === item.id && (
                                        <div className="mt-1.5 ml-6 flex gap-1.5">
                                            <input
                                                value={noteText}
                                                onChange={e => setNoteText(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleSaveNote(item.id)}
                                                placeholder="Add note..."
                                                className="flex-1 text-[10px] bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleSaveNote(item.id)}
                                                className="text-[10px] text-violet-400 px-1.5"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
