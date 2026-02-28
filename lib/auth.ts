// lib/auth.ts
// NextAuth configuration — credentials provider with fund isolation
// localStorage-based user store for MVP, swap to Prisma when DB is ready

export interface AppUser {
    id: string
    email: string
    name: string
    fundId: string
    fundName: string
    role: 'admin' | 'analyst' | 'partner'
    avatarUrl?: string
}

const USERS_KEY = 'vc_scout_users'
const SESSION_KEY = 'vc_scout_session'

// Default demo users
const DEFAULT_USERS: (AppUser & { passwordHash: string })[] = [
    {
        id: 'user_1',
        email: 'analyst@apex.vc',
        name: 'Alex Chen',
        fundId: 'fund_apex',
        fundName: 'Apex Ventures',
        role: 'analyst',
        passwordHash: 'demo123', // In production, use bcrypt
    },
    {
        id: 'user_2',
        email: 'partner@apex.vc',
        name: 'Sarah Kim',
        fundId: 'fund_apex',
        fundName: 'Apex Ventures',
        role: 'partner',
        passwordHash: 'demo123',
    },
]

function getUsers(): (AppUser & { passwordHash: string })[] {
    try {
        const raw = localStorage.getItem(USERS_KEY)
        if (raw) return JSON.parse(raw) as (AppUser & { passwordHash: string })[]
        // Seed defaults
        localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS))
        return DEFAULT_USERS
    } catch {
        return DEFAULT_USERS
    }
}

export function authenticateUser(
    email: string,
    password: string
): AppUser | null {
    const users = getUsers()
    const user = users.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === password
    )
    if (!user) return null
    const { passwordHash: _, ...userWithoutPassword } = user
    return userWithoutPassword
}

export function getSession(): AppUser | null {
    try {
        const raw = localStorage.getItem(SESSION_KEY)
        return raw ? (JSON.parse(raw) as AppUser) : null
    } catch {
        return null
    }
}

export function setSession(user: AppUser): void {
    try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    } catch {
        console.error('Failed to save session')
    }
}

export function clearSession(): void {
    try {
        localStorage.removeItem(SESSION_KEY)
    } catch {
        console.error('Failed to clear session')
    }
}

export function registerUser(
    email: string,
    password: string,
    name: string,
    fundName: string
): AppUser {
    const users = getUsers()
    const newUser: AppUser & { passwordHash: string } = {
        id: `user_${Date.now()}`,
        email,
        name,
        fundId: `fund_${fundName.toLowerCase().replace(/\s+/g, '_')}`,
        fundName,
        role: 'analyst',
        passwordHash: password,
    }
    users.push(newUser)
    try {
        localStorage.setItem(USERS_KEY, JSON.stringify(users))
    } catch {
        console.error('Failed to save users')
    }
    const { passwordHash: _, ...userWithoutPassword } = newUser
    return userWithoutPassword
}
