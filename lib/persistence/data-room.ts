// lib/persistence/data-room.ts
// Data Room checklist for due diligence stage

export interface DataRoomItem {
    id: string
    label: string
    category: 'legal' | 'financial' | 'commercial' | 'technical' | 'team'
    completed: boolean
    completedAt?: string
    note?: string
    requiredForStage: 'ic' | 'invested' | 'any'
}

export interface DataRoom {
    companyId: string
    items: DataRoomItem[]
    completionPercent: number
    updatedAt: string
}

const DATA_ROOM_KEY = 'vc_scout_data_room'

const DEFAULT_CHECKLIST: Omit<DataRoomItem, 'id' | 'completed'>[] = [
    // Legal
    { label: 'Cap table received', category: 'legal', requiredForStage: 'ic' },
    { label: 'Articles of incorporation', category: 'legal', requiredForStage: 'invested' },
    { label: 'Term sheet reviewed', category: 'legal', requiredForStage: 'invested' },
    { label: 'IP assignment agreements', category: 'legal', requiredForStage: 'invested' },
    { label: 'Material contracts review', category: 'legal', requiredForStage: 'invested' },
    // Financial
    { label: 'Financials reviewed (P&L, BS)', category: 'financial', requiredForStage: 'ic' },
    { label: 'Revenue metrics validated', category: 'financial', requiredForStage: 'ic' },
    { label: 'Burn rate / runway analysis', category: 'financial', requiredForStage: 'ic' },
    { label: 'Financial projections reviewed', category: 'financial', requiredForStage: 'invested' },
    // Commercial
    { label: 'Customer references contacted', category: 'commercial', requiredForStage: 'ic' },
    { label: 'Market sizing validated', category: 'commercial', requiredForStage: 'ic' },
    { label: 'Competitive landscape mapped', category: 'commercial', requiredForStage: 'ic' },
    { label: 'Sales pipeline reviewed', category: 'commercial', requiredForStage: 'invested' },
    // Technical
    { label: 'Technical architecture review', category: 'technical', requiredForStage: 'ic' },
    { label: 'Security audit / SOC2 status', category: 'technical', requiredForStage: 'invested' },
    { label: 'Code quality assessment', category: 'technical', requiredForStage: 'invested' },
    // Team
    { label: 'Founder background checks', category: 'team', requiredForStage: 'ic' },
    { label: 'Reference calls completed', category: 'team', requiredForStage: 'ic' },
    { label: 'Key hires plan reviewed', category: 'team', requiredForStage: 'invested' },
]

function getAllDataRooms(): Record<string, DataRoom> {
    try {
        const raw = localStorage.getItem(DATA_ROOM_KEY)
        return raw ? (JSON.parse(raw) as Record<string, DataRoom>) : {}
    } catch {
        return {}
    }
}

function saveAllDataRooms(rooms: Record<string, DataRoom>): void {
    try {
        localStorage.setItem(DATA_ROOM_KEY, JSON.stringify(rooms))
    } catch {
        console.error('Failed to save data rooms')
    }
}

export function getDataRoom(companyId: string): DataRoom {
    const rooms = getAllDataRooms()
    if (rooms[companyId]) return rooms[companyId]

    // Create default data room
    const items: DataRoomItem[] = DEFAULT_CHECKLIST.map((item, idx) => ({
        ...item,
        id: `dr_${idx}_${Date.now()}`,
        completed: false,
    }))

    const room: DataRoom = {
        companyId,
        items,
        completionPercent: 0,
        updatedAt: new Date().toISOString(),
    }

    rooms[companyId] = room
    saveAllDataRooms(rooms)
    return room
}

export function toggleDataRoomItem(
    companyId: string,
    itemId: string
): DataRoom {
    const rooms = getAllDataRooms()
    const room = rooms[companyId] ?? getDataRoom(companyId)

    const item = room.items.find(i => i.id === itemId)
    if (item) {
        item.completed = !item.completed
        item.completedAt = item.completed ? new Date().toISOString() : undefined
    }

    room.completionPercent = Math.round(
        (room.items.filter(i => i.completed).length / room.items.length) * 100
    )
    room.updatedAt = new Date().toISOString()

    rooms[companyId] = room
    saveAllDataRooms(rooms)
    return room
}

export function addDataRoomNote(
    companyId: string,
    itemId: string,
    note: string
): DataRoom {
    const rooms = getAllDataRooms()
    const room = rooms[companyId] ?? getDataRoom(companyId)

    const item = room.items.find(i => i.id === itemId)
    if (item) {
        item.note = note
    }

    room.updatedAt = new Date().toISOString()
    rooms[companyId] = room
    saveAllDataRooms(rooms)
    return room
}

export function addCustomDataRoomItem(
    companyId: string,
    label: string,
    category: DataRoomItem['category']
): DataRoom {
    const rooms = getAllDataRooms()
    const room = rooms[companyId] ?? getDataRoom(companyId)

    room.items.push({
        id: `dr_custom_${Date.now()}`,
        label,
        category,
        completed: false,
        requiredForStage: 'any',
    })

    room.completionPercent = Math.round(
        (room.items.filter(i => i.completed).length / room.items.length) * 100
    )
    room.updatedAt = new Date().toISOString()

    rooms[companyId] = room
    saveAllDataRooms(rooms)
    return room
}

export const CATEGORY_LABELS: Record<DataRoomItem['category'], { label: string; icon: string }> = {
    legal: { label: 'Legal', icon: '⚖️' },
    financial: { label: 'Financial', icon: '💰' },
    commercial: { label: 'Commercial', icon: '📊' },
    technical: { label: 'Technical', icon: '⚙️' },
    team: { label: 'Team', icon: '👥' },
}
