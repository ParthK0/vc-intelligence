import { SavedSearch, SearchFilters } from '@/lib/types'

const SAVED_KEY = 'vc_scout_saved_searches'

export function getSavedSearches(): SavedSearch[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY)
    return raw ? (JSON.parse(raw) as SavedSearch[]) : []
  } catch {
    return []
  }
}

export function saveSearch(
  name: string,
  filters: SearchFilters,
  resultIds: string[]
): SavedSearch {
  const search: SavedSearch = {
    id: `search_${Date.now()}`,
    name,
    filters,
    resultSnapshot: resultIds,
    lastRunAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    resultCount: resultIds.length,
  }
  try {
    const searches = getSavedSearches()
    searches.push(search)
    localStorage.setItem(SAVED_KEY, JSON.stringify(searches))
  } catch {
    console.error('Failed to save search')
  }
  return search
}

export function deleteSavedSearch(searchId: string): void {
  try {
    const searches = getSavedSearches().filter((s) => s.id !== searchId)
    localStorage.setItem(SAVED_KEY, JSON.stringify(searches))
  } catch {
    console.error('Failed to delete saved search')
  }
}

export function updateSavedSearch(
  searchId: string,
  resultIds: string[]
): void {
  try {
    const searches = getSavedSearches()
    const search = searches.find((s) => s.id === searchId)
    if (search) {
      search.resultSnapshot = resultIds
      search.lastRunAt = new Date().toISOString()
      search.resultCount = resultIds.length
      localStorage.setItem(SAVED_KEY, JSON.stringify(searches))
    }
  } catch {
    console.error('Failed to update saved search')
  }
}
