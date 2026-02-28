'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Company, EnrichmentPayload } from '@/lib/types'
import { cn } from '@/lib/utils'
import { MessageCircle, X, Send, Loader2, Sparkles, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

interface AskScoutProps {
    company: Company
    enrichment: EnrichmentPayload | null
}

const SUGGESTED_PROMPTS = [
    'Why did this company score low?',
    'Summarize risks in 3 bullets',
    'Is this more AI infra or AI app?',
    'What are the strongest signals?',
    'Should we pursue this deal?',
]

export function AskScout({ company, enrichment }: AskScoutProps): React.JSX.Element {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        if (isOpen) inputRef.current?.focus()
    }, [isOpen])

    async function handleSend(question?: string): Promise<void> {
        const q = question ?? input.trim()
        if (!q || loading) return

        const userMsg: Message = {
            id: `msg_${Date.now()}`,
            role: 'user',
            content: q,
            timestamp: new Date(),
        }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setLoading(true)

        try {
            const res = await fetch('/api/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: q,
                    companyId: company.id,
                    enrichment,
                }),
            })

            const data = await res.json() as { success: boolean; data?: { answer: string }; error?: string }

            const assistantMsg: Message = {
                id: `msg_${Date.now()}_a`,
                role: 'assistant',
                content: data.success && data.data?.answer
                    ? data.data.answer
                    : 'Sorry, I couldn\'t process that question. Try again.',
                timestamp: new Date(),
            }
            setMessages(prev => [...prev, assistantMsg])
        } catch {
            setMessages(prev => [...prev, {
                id: `msg_${Date.now()}_err`,
                role: 'assistant',
                content: 'Network error. Please try again.',
                timestamp: new Date(),
            }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Floating toggle button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all',
                    isOpen
                        ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        : 'bg-violet-600 text-white hover:bg-violet-500'
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                {isOpen ? <ChevronDown className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </motion.button>

            {/* Chat panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="fixed bottom-20 right-6 z-50 w-96 max-h-[500px] bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-violet-600 rounded-lg flex items-center justify-center">
                                    <Sparkles className="w-3.5 h-3.5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-zinc-200">Ask Scout</p>
                                    <p className="text-[9px] text-zinc-500">AI copilot · {company.name}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px]">
                            {messages.length === 0 && (
                                <div className="text-center py-4">
                                    <Sparkles className="w-6 h-6 text-zinc-700 mx-auto mb-2" />
                                    <p className="text-xs text-zinc-500 mb-3">Ask me anything about {company.name}</p>
                                    <div className="space-y-1.5">
                                        {SUGGESTED_PROMPTS.map(prompt => (
                                            <button
                                                key={prompt}
                                                onClick={() => handleSend(prompt)}
                                                className="block w-full text-left text-[11px] text-zinc-400 hover:text-violet-400 px-3 py-1.5 rounded-md hover:bg-zinc-800/60 transition-all"
                                            >
                                                → {prompt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        'flex',
                                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed',
                                            msg.role === 'user'
                                                ? 'bg-violet-600 text-white'
                                                : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                                        )}
                                    >
                                        {msg.content.split('\n').map((line, i) => (
                                            <p key={i} className={i > 0 ? 'mt-1' : ''}>
                                                {line}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 flex items-center gap-2">
                                        <Loader2 className="w-3 h-3 text-violet-400 animate-spin" />
                                        <span className="text-[10px] text-zinc-500">Thinking...</span>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="border-t border-zinc-800 p-3 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <input
                                    ref={inputRef}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask about this company..."
                                    className="flex-1 text-xs bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
                                    disabled={loading}
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || loading}
                                    className={cn(
                                        'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                                        input.trim() && !loading
                                            ? 'bg-violet-600 text-white hover:bg-violet-500'
                                            : 'bg-zinc-800 text-zinc-600'
                                    )}
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
