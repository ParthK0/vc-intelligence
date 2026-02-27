import { CompanyList } from '@/lib/types'

const LISTS_KEY = 'vc_scout_lists'

export function getLists(): CompanyList[] {
  try {
    const raw = localStorage.getItem(LISTS_KEY)
    return raw ? (JSON.parse(raw) as CompanyList[]) : []
  } catch {
    return []
  }
}

export function saveList(list: CompanyList): void {
  try {
    const lists = getLists()
    const idx = lists.findIndex((l) => l.id === list.id)
    if (idx >= 0) {
      lists[idx] = list
    } else {
      lists.push(list)
    }
    localStorage.setItem(LISTS_KEY, JSON.stringify(lists))
  } catch {
    console.error('Failed to save list')
  }
}

export function deleteList(listId: string): void {
  try {
    const lists = getLists().filter((l) => l.id !== listId)
    localStorage.setItem(LISTS_KEY, JSON.stringify(lists))
  } catch {
    console.error('Failed to delete list')
  }
}

export function addCompanyToList(listId: string, companyId: string): void {
  try {
    const lists = getLists()
    const list = lists.find((l) => l.id === listId)
    if (list && !list.companyIds.includes(companyId)) {
      list.companyIds.push(companyId)
      list.updatedAt = new Date().toISOString()
      localStorage.setItem(LISTS_KEY, JSON.stringify(lists))
    }
  } catch {
    console.error('Failed to add company to list')
  }
}

export function removeCompanyFromList(listId: string, companyId: string): void {
  try {
    const lists = getLists()
    const list = lists.find((l) => l.id === listId)
    if (list) {
      list.companyIds = list.companyIds.filter((id) => id !== companyId)
      list.updatedAt = new Date().toISOString()
      localStorage.setItem(LISTS_KEY, JSON.stringify(lists))
    }
  } catch {
    console.error('Failed to remove company from list')
  }
}
