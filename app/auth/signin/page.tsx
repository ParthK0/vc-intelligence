'use client'

import React, { useState } from 'react'
import { authenticateUser, setSession, registerUser } from '@/lib/auth'
import { Zap, Mail, Lock, User, Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SignInPage(): React.JSX.Element {
    const router = useRouter()
    const [isRegister, setIsRegister] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [fundName, setFundName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent): Promise<void> {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (isRegister) {
                if (!name || !fundName) {
                    setError('Please fill in all fields')
                    setLoading(false)
                    return
                }
                const user = registerUser(email, password, name, fundName)
                setSession(user)
                router.push('/')
            } else {
                const user = authenticateUser(email, password)
                if (!user) {
                    setError('Invalid email or password')
                    setLoading(false)
                    return
                }
                setSession(user)
                router.push('/')
            }
        } catch {
            setError('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-600/20">
                        <Zap className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Scout</h1>
                    <p className="text-sm text-zinc-500 mt-1">VC Intelligence Platform</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
                    <div className="text-center mb-2">
                        <h2 className="text-sm font-semibold text-zinc-200">
                            {isRegister ? 'Create Account' : 'Sign In'}
                        </h2>
                        <p className="text-xs text-zinc-500 mt-1">
                            {isRegister ? 'Set up your fund workspace' : 'Demo: analyst@apex.vc / demo123'}
                        </p>
                    </div>

                    {isRegister && (
                        <>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Full name"
                                    className="w-full text-sm bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-3 py-2.5 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
                                />
                            </div>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                <input
                                    type="text"
                                    value={fundName}
                                    onChange={e => setFundName(e.target.value)}
                                    placeholder="Fund name"
                                    className="w-full text-sm bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-3 py-2.5 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
                                />
                            </div>
                        </>
                    )}

                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                            className="w-full text-sm bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-3 py-2.5 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                            className="w-full text-sm bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-3 py-2.5 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
                        />
                    </div>

                    {error && (
                        <p className="text-xs text-red-400 text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
                    </button>

                    <p className="text-center text-xs text-zinc-500">
                        {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                        <button
                            type="button"
                            onClick={() => { setIsRegister(!isRegister); setError('') }}
                            className="text-violet-400 hover:text-violet-300 transition-colors"
                        >
                            {isRegister ? 'Sign In' : 'Register'}
                        </button>
                    </p>
                </form>
            </div>
        </div>
    )
}
