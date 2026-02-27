// Cache abstraction — swap localStorage for Redis in production
// by replacing only this file

const CACHE_PREFIX = 'vc_scout_cache_'

interface CacheEntry<T> {
  value: T
  cachedAt: string
  expiresAt: string | null
}

export function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry<T>
    if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
      localStorage.removeItem(CACHE_PREFIX + key)
      return null
    }
    return entry.value
  } catch {
    return null
  }
}

export function cacheSet<T>(key: string, value: T, ttlMinutes?: number): void {
  try {
    const entry: CacheEntry<T> = {
      value,
      cachedAt: new Date().toISOString(),
      expiresAt: ttlMinutes
        ? new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString()
        : null,
    }
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry))
  } catch {
    console.error('Cache set failed')
  }
}

export function cacheInvalidate(key: string): void {
  try {
    localStorage.removeItem(CACHE_PREFIX + key)
  } catch {
    console.error('Cache invalidate failed')
  }
}

export function getCachedAt(key: string): string | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry<unknown>
    return entry.cachedAt
  } catch {
    return null
  }
}
