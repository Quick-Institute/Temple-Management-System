import {useSyncExternalStore} from 'react'

/*
 * Dana management store for the Temple Admin screens.
 *
 * Everything the admin screen reads and writes lives here: the two daily Dana offers (morning and
 * midday), their capacity, whether they are open, and the devotees assigned to them. The data is
 * kept in localStorage so a change survives a reload while the API is not wired up; when the backend
 * is ready, every exported function below swaps its body for a fetch - the screens do not change.
 *
 * What a devotee booking looks like to an admin is deliberately *limited*: name, village, number of
 * people, status and a masked contact number. Nothing else is exposed by `assigneesFor`.
 */

export type DanaKind = 'morning' | 'midday'
export type BookingStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'

export type DanaSlotRecord = {
    /** `date|kind`, so a day can only ever hold one morning and one midday offer. */
    id: string
    /** ISO date, "2026-11-17". */
    date: string
    kind: DanaKind
    /** How many families can be served. */
    capacity: number
    /** Closed days stay on the calendar but cannot be booked. */
    closed: boolean
    note: string
    updatedAt: string
}

/**
 * A family registered under one temple. Dana can only be assigned to the families of the temple the
 * admin is working on - the same rule the registration form applies when a family picks a temple.
 */
export type DanaFamily = {
    id: string
    /** Id of the temple record this family belongs to (`TempleRecord.id`). */
    templeRef: string
    name: string
    village: string
    contact: string
}

/** What the admin may see of a family while choosing one to assign. */
export type FamilyChoice = {
    id: string
    templeRef: string
    name: string
    village: string
    contactMasked: string
}

export type DanaBookingRecord = {
    id: string
    reference: string
    date: string
    kind: DanaKind
    /** The family record this assignment points at (empty for a temporary family). */
    familyId: string
    /**
     * A temporary place: a family from outside the temple, for a special Dana. Nothing is written to
     * the temple's family list, so the row is marked as temporary instead.
     */
    temporary: boolean
    familyName: string
    village: string
    /** Full number - only `assigneesFor` may expose it, and only masked. */
    contact: string
    participants: number
    status: BookingStatus
    createdAt: string
}

/** What the admin is allowed to see about one assigned devotee. */
export type LimitedAssignee = {
    id: string
    reference: string
    familyId: string
    temporary: boolean
    familyName: string
    village: string
    participants: number
    status: BookingStatus
    /** "077****567" - enough to recognise, never the whole number. */
    contactMasked: string
}

export type SlotSummary = {
    date: string
    kind: DanaKind
    capacity: number
    booked: number
    available: number
    closed: boolean
    slotId: string
}

export type Bucket = {
    /** Stable key, ISO date or week/month id. */
    key: string
    /** Two-line label for the chart axis. */
    label: string
    sublabel: string
    morning: SlackBucket
    midday: SlackBucket
    booked: number
    capacity: number
    available: number
}

type SlackBucket = { booked: number; capacity: number; available: number }

export type ChartGranularity = 'day' | 'week' | 'month'

export const DANA_KINDS: DanaKind[] = ['morning', 'midday']

export const KIND_META: Record<DanaKind, { startTime: string; endTime: string; defaultCapacity: number }> = {
    morning: {startTime: '06:30', endTime: '08:00', defaultCapacity: 10},
    midday: {startTime: '10:30', endTime: '12:00', defaultCapacity: 15},
}

const STORAGE_KEY = 'tms.dana.admin.v1'

/* ------------------------------------------------------------------ */
/* Dates - plain ISO strings, no timezone surprises                    */
/* ------------------------------------------------------------------ */

export const toIso = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export const fromIso = (iso: string): Date => {
    const [year, month, day] = iso.split('-').map(Number)
    return new Date(year, (month ?? 1) - 1, day ?? 1)
}

export const addDays = (iso: string, days: number): string => {
    const date = fromIso(iso)
    date.setDate(date.getDate() + days)
    return toIso(date)
}

export const today = (): string => toIso(new Date())

/** Monday of the week that contains `iso`. */
export const startOfWeek = (iso: string): string => {
    const date = fromIso(iso)
    const shift = (date.getDay() + 6) % 7
    date.setDate(date.getDate() - shift)
    return toIso(date)
}

export const startOfMonth = (iso: string): string => `${iso.slice(0, 7)}-01`

export const daysInMonth = (iso: string): number =>
    new Date(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)), 0).getDate()

export const addMonths = (iso: string, months: number): string => {
    const date = fromIso(startOfMonth(iso))
    date.setMonth(date.getMonth() + months)
    return toIso(date)
}

export const monthLabel = (iso: string, locale: 'en' | 'si'): string => {
    const date = fromIso(iso)
    return date.toLocaleDateString(locale === 'si' ? 'si-LK' : 'en-GB', {month: 'long', year: 'numeric'})
}

export const dayLabel = (iso: string, locale: 'en' | 'si'): string =>
    fromIso(iso).toLocaleDateString(locale === 'si' ? 'si-LK' : 'en-GB', {
        weekday: 'short', day: 'numeric', month: 'short',
    })

export const weekdayShort = (iso: string, locale: 'en' | 'si'): string =>
    fromIso(iso).toLocaleDateString(locale === 'si' ? 'si-LK' : 'en-GB', {weekday: 'short'})

/* ------------------------------------------------------------------ */
/* Seed - a window of real-looking days around today                   */
/* ------------------------------------------------------------------ */

const FAMILY_NAMES = [
    'Perera Family', 'Fernando Family', 'Jayasuriya Family', 'Bandara Family', 'Silva Family',
    'Wickramasinghe Family', 'Rathnayake Family', 'Gunawardena Family', 'Dissanayake Family',
    'Herath Family', 'Karunaratne Family', 'Weerasinghe Family', 'Senanayake Family', 'Amarasinghe Family',
]

const VILLAGES = ['Hunupitiya', 'Kadolkele', 'Asgiriya', 'Mahiyanganaya', 'Nawala', 'Kelaniya', 'Gampaha']

/** Deterministic pseudo-random in [0, 1) so the demo data is the same on every machine. */
const seeded = (key: string): number => {
    let hash = 2166136261
    for (const char of key) {
        hash ^= char.charCodeAt(0)
        hash = Math.imul(hash, 16777619) >>> 0
    }
    return (hash % 1000) / 1000
}

const isoWeekday = (iso: string): number => fromIso(iso).getDay()

/**
 * The temple the demo Temple Admin opens first. Seeded families hang off the temple records of the
 * demo store (`t-rec-1` is "Sri Sambodhi Maha Viharaya"); the other two temples have a shorter list
 * so switching temple on the top bar visibly changes who can be assigned.
 */
const PRIMARY_TEMPLE_REF = 't-rec-1'
const TEMPLE_REFS = ['t-rec-1', 't-rec-2', 't-rec-3']

/**
 * The families each temple knows about. Twelve for the first temple is more than any single slot can
 * hold (capacity tops out at 15), so a big Dana day still needs the temporary option.
 */
const seedFamilies = (): DanaFamily[] => {
    const families: DanaFamily[] = []
    FAMILY_NAMES.forEach((name, index) => {
        const shifts = index < 6 ? [0, 3] : [0]
        for (const shift of shifts) {
            const serial = families.length + 1
            const templeRef = TEMPLE_REFS[Math.floor(families.length / 8) % TEMPLE_REFS.length]
            families.push({
                id: `fam-${String(serial).padStart(2, '0')}`,
                templeRef,
                name,
                village: VILLAGES[(index + shift) % VILLAGES.length],
                contact: `07${(index % 9) + 1}${String(1000000 + (serial * 137137) % 8999999).padStart(7, '0').slice(0, 7)}`,
            })
        }
    })
    return families
}

const seedData = (): { slots: DanaSlotRecord[]; bookings: DanaBookingRecord[]; families: DanaFamily[] } => {
    const slots: DanaSlotRecord[] = []
    const bookings: DanaBookingRecord[] = []
    const families = seedFamilies()
    /* The seeded Dana days belong to the primary temple, so they draw from that temple's families. */
    const templePool = families.filter((family) => family.templeRef === PRIMARY_TEMPLE_REF)
    const base = today()
    let reference = 140

    /* Four weeks back to eight weeks ahead: enough for day, week and month charts. */
    for (let offset = -28; offset <= 56; offset += 1) {
        const date = addDays(base, offset)
        const weekday = isoWeekday(date)

        for (const kind of DANA_KINDS) {
            const capacity = KIND_META[kind].defaultCapacity
            /* Full-moon (Poya) days are busy; Sunday midday is popular too. */
            const poya = seeded(`poya-${date}`) > 0.94
            const busy = poya || (weekday === 0 && kind === 'midday')
            const ratio = busy ? 0.75 + seeded(`r-${date}-${kind}`) * 0.25 : seeded(`r-${date}-${kind}`) * 0.7
            const booked = Math.min(capacity, Math.round(capacity * ratio))

            slots.push({
                id: `${date}|${kind}`,
                date,
                kind,
                capacity,
                closed: false,
                note: poya ? 'Poya day' : '',
                updatedAt: new Date().toISOString(),
            })

            /* A slot starts at a different point in the family list, so nobody is assigned twice
               to the same offering while the seed is built. */
            const firstFamily = Math.floor(seeded(`f-${date}-${kind}`) * templePool.length)

            for (let index = 0; index < booked; index += 1) {
                reference += 1
                const family = templePool[(firstFamily + index) % templePool.length]
                bookings.push({
                    id: `seed-${date}-${kind}-${index}`,
                    reference: `DANA-${date.slice(0, 4)}-${String(reference).padStart(5, '0')}`,
                    date,
                    kind,
                    familyId: family.id,
                    temporary: false,
                    familyName: family.name,
                    village: family.village,
                    contact: family.contact,
                    participants: 1 + Math.floor(seeded(`${date}${kind}${index}p`) * 5),
                    status: offset < 0 ? 'Approved' : seeded(`${date}${kind}${index}s`) > 0.25 ? 'Approved' : 'Pending',
                    createdAt: new Date().toISOString(),
                })
            }
        }
    }

    return {slots, bookings, families}
}

/* ------------------------------------------------------------------ */
/* Store                                                              */
/* ------------------------------------------------------------------ */

type State = { slots: DanaSlotRecord[]; bookings: DanaBookingRecord[]; families: DanaFamily[] }

const listeners = new Set<() => void>()
let state: State | null = null

const defaults = (): State => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
            const parsed = JSON.parse(raw) as State
            if (Array.isArray(parsed.slots) && Array.isArray(parsed.bookings)) {
                /* Data saved before the family directory existed still loads - it gets the seed list. */
                return {
                    ...parsed,
                    /* Rows saved before the temple scoping existed belong to the primary temple. */
                    families: Array.isArray(parsed.families) && parsed.families.length
                        ? parsed.families.map((family) => ({
                            ...family,
                            templeRef: family.templeRef ?? PRIMARY_TEMPLE_REF
                        }))
                        : seedFamilies(),
                    bookings: parsed.bookings.map((booking) => ({...booking, temporary: Boolean(booking.temporary)})),
                }
            }
        }
    } catch {
        /* private mode or a corrupt value - fall back to the seed */
    }
    const seededData = seedData()
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seededData))
    } catch {
        /* keep it in memory for this session */
    }
    return seededData
}

const snapshot = (): State => {
    if (state === null) state = defaults()
    return state
}

const commit = (next: State) => {
    state = next
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
        /* private mode */
    }
    listeners.forEach((listener) => listener())
}

const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}

/** Wipes local edits and rebuilds the demo data - used by the "Reset demo data" action. */
export const resetDanaData = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEY)
    } catch {
        /* ignore */
    }
    state = null
    listeners.forEach((listener) => listener())
}

/* ------------------------------------------------------------------ */
/* Reads                                                              */
/* ------------------------------------------------------------------ */

export const slotId = (date: string, kind: DanaKind): string => `${date}|${kind}`

const maskContact = (value: string): string => {
    const digits = (value ?? '').replace(/\D/g, '')
    if (digits.length < 6) return '-'
    return `${digits.slice(0, 3)}${'*'.repeat(Math.max(2, digits.length - 6))}${digits.slice(-3)}`
}

const activeBookings = (bookings: DanaBookingRecord[]): DanaBookingRecord[] =>
    bookings.filter((booking) => booking.status === 'Approved' || booking.status === 'Pending')

export const slotsBetween = (fromDate: string, toDate: string): DanaSlotRecord[] =>
    snapshot().slots
        .filter((slot) => slot.date >= fromDate && slot.date <= toDate)
        .sort((a, b) => a.date.localeCompare(b.date) || (a.kind === 'morning' ? -1 : 1))

export const summarise = (fromDate: string, toDate: string): SlotSummary[] => {
    const {bookings} = snapshot()
    const booked = activeBookings(bookings)
    return slotsBetween(fromDate, toDate).map((slot) => {
        const count = booked.filter((booking) => booking.date === slot.date && booking.kind === slot.kind).length
        return {
            slotId: slot.id,
            date: slot.date,
            kind: slot.kind,
            capacity: slot.capacity,
            booked: count,
            available: slot.closed ? 0 : Math.max(0, slot.capacity - count),
            closed: slot.closed,
        }
    })
}

export const daySummary = (date: string): SlotSummary[] => summarise(date, date)

export const findSlot = (date: string, kind: DanaKind): DanaSlotRecord | undefined =>
    snapshot().slots.find((slot) => slot.id === slotId(date, kind))

/** Assigned devotees for one slot - limited details only. */
export const assigneesFor = (date: string, kind: DanaKind): LimitedAssignee[] => {
    const {bookings} = snapshot()
    return bookings
        .filter((booking) => booking.date === date && booking.kind === kind && booking.status !== 'Cancelled')
        .sort((a, b) => a.reference.localeCompare(b.reference))
        .map((booking) => ({
            id: booking.id,
            reference: booking.reference,
            familyId: booking.familyId ?? '',
            temporary: Boolean(booking.temporary),
            familyName: booking.familyName,
            village: booking.village,
            participants: booking.participants,
            status: booking.status,
            contactMasked: maskContact(booking.contact),
        }))
}

/* ------------------------------------------------------------------ */
/* Family directory - who the temple can assign Dana to                */
/* ------------------------------------------------------------------ */

/**
 * The temple's family list, A-Z. Passing a temple id narrows it to the families registered under that
 * temple - the assign screen always passes the temple from the top bar.
 */
export const listFamilies = (templeRef?: string): DanaFamily[] =>
    snapshot().families
        .filter((family) => !templeRef || family.templeRef === templeRef)
        .sort((a, b) => a.name.localeCompare(b.name) || a.village.localeCompare(b.village))

/** The directory as the assign screen shows it: contact numbers masked, same rule as the bookings. */
export const familyChoices = (templeRef?: string): FamilyChoice[] =>
    listFamilies(templeRef).map((family) => ({
        id: family.id,
        templeRef: family.templeRef,
        name: family.name,
        village: family.village,
        contactMasked: maskContact(family.contact),
    }))

export const findFamily = (familyId: string): DanaFamily | undefined =>
    snapshot().families.find((family) => family.id === familyId)

/** A family that is not in the directory yet (a walk-in, or a new registration). */
export const createFamily = (input: {
    name: string
    village: string
    contact: string
    /** The temple the family is registered under. */
    templeRef: string
}): DanaFamily => {
    const current = snapshot()
    const name = input.name.trim()
    const village = input.village.trim()
    const contact = input.contact.replace(/\D/g, '')

    if (!name) throw new Error('Enter the family name.')
    if (!village) throw new Error('Enter the village.')
    if (contact.length < 9) throw new Error('Enter a valid contact number.')
    if (current.families.some((family) => family.contact === contact)) {
        throw new Error('A family with that contact number is already in the list.')
    }

    const family: DanaFamily = {
        id: `fam-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        templeRef: input.templeRef,
        name,
        village,
        contact,
    }
    commit({...current, families: [...current.families, family]})
    return family
}

/* ------------------------------------------------------------------ */
/* Chart buckets                                                      */
/* ------------------------------------------------------------------ */

const emptyBucket = (): SlackBucket => ({booked: 0, capacity: 0, available: 0})

const addTo = (bucket: SlackBucket, summary: SlotSummary) => {
    bucket.booked += summary.booked
    bucket.capacity += summary.capacity
    bucket.available += summary.available
}

/** Bars per day for the week that holds `iso` (Monday to Sunday). */
const dayBuckets = (iso: string, locale: 'en' | 'si'): Bucket[] => {
    const monday = startOfWeek(iso)
    const dates = Array.from({length: 7}, (_, index) => addDays(monday, index))
    const summaries = summarise(dates[0], dates[6])

    return dates.map((date) => {
        const bucket: Bucket = {
            key: date,
            label: locale === 'si' ? weekdayShort(date, locale) : weekdayShort(date, locale),
            sublabel: String(Number(date.slice(8, 10))),
            morning: emptyBucket(),
            midday: emptyBucket(),
            booked: 0,
            capacity: 0,
            available: 0,
        }
        for (const summary of summaries.filter((item) => item.date === date)) {
            addTo(summary.kind === 'morning' ? bucket.morning : bucket.midday, summary)
        }
        bucket.booked = bucket.morning.booked + bucket.midday.booked
        bucket.capacity = bucket.morning.capacity + bucket.midday.capacity
        bucket.available = bucket.morning.available + bucket.midday.available
        return bucket
    })
}

/** Bars per week for the month that holds `iso`. */
const weekBuckets = (iso: string, locale: 'en' | 'si'): Bucket[] => {
    const first = startOfMonth(iso)
    const total = daysInMonth(iso)
    const buckets: Bucket[] = []
    let cursor = startOfWeek(first)

    while (cursor <= addDays(first, total - 1)) {
        const weekEnd = addDays(cursor, 6)
        const bucket: Bucket = {
            key: cursor,
            label: locale === 'si'
                ? `${Number(cursor.slice(8, 10))}/${Number(cursor.slice(5, 7))}`
                : `${Number(cursor.slice(8, 10))}/${Number(cursor.slice(5, 7))}`,
            sublabel: locale === 'si'
                ? `– ${Number(weekEnd.slice(8, 10))}/${Number(weekEnd.slice(5, 7))}`
                : `– ${Number(weekEnd.slice(8, 10))}/${Number(weekEnd.slice(5, 7))}`,
            morning: emptyBucket(),
            midday: emptyBucket(),
            booked: 0,
            capacity: 0,
            available: 0,
        }
        for (const summary of summarise(cursor, weekEnd)) {
            addTo(summary.kind === 'morning' ? bucket.morning : bucket.midday, summary)
        }
        bucket.booked = bucket.morning.booked + bucket.midday.booked
        bucket.capacity = bucket.morning.capacity + bucket.midday.capacity
        bucket.available = bucket.morning.available + bucket.midday.available
        buckets.push(bucket)
        cursor = addDays(cursor, 7)
    }

    return buckets
}

/** Bars per month for the year that holds `iso`. */
const monthBuckets = (iso: string, locale: 'en' | 'si'): Bucket[] => {
    const year = Number(iso.slice(0, 4))
    return Array.from({length: 12}, (_, index) => {
        const monthStart = `${year}-${String(index + 1).padStart(2, '0')}-01`
        const monthEnd = `${year}-${String(index + 1).padStart(2, '0')}-${String(daysInMonth(monthStart)).padStart(2, '0')}`
        const bucket: Bucket = {
            key: monthStart,
            label: fromIso(monthStart).toLocaleDateString(locale === 'si' ? 'si-LK' : 'en-GB', {month: 'short'}),
            sublabel: String(year),
            morning: emptyBucket(),
            midday: emptyBucket(),
            booked: 0,
            capacity: 0,
            available: 0,
        }
        for (const summary of summarise(monthStart, monthEnd)) {
            addTo(summary.kind === 'morning' ? bucket.morning : bucket.midday, summary)
        }
        bucket.booked = bucket.morning.booked + bucket.midday.booked
        bucket.capacity = bucket.morning.capacity + bucket.midday.capacity
        bucket.available = bucket.morning.available + bucket.midday.available
        return bucket
    })
}

export const chartBuckets = (granularity: ChartGranularity, iso: string, locale: 'en' | 'si'): Bucket[] => {
    if (granularity === 'day') return dayBuckets(iso, locale)
    if (granularity === 'week') return weekBuckets(iso, locale)
    return monthBuckets(iso, locale)
}

/* ------------------------------------------------------------------ */
/* CRUD - slots                                                       */
/* ------------------------------------------------------------------ */

const nextReference = (state: State, date: string): string => {
    const numbers = state.bookings
        .map((booking) => Number(booking.reference.slice(-5)))
        .filter((value) => Number.isFinite(value))
    const highest = numbers.length ? Math.max(...numbers) : 0
    return `DANA-${date.slice(0, 4)}-${String(highest + 1).padStart(5, '0')}`
}

export const createSlot = (input: {
    date: string;
    kind: DanaKind;
    capacity: number;
    note?: string
}): DanaSlotRecord => {
    const current = snapshot()
    const id = slotId(input.date, input.kind)
    if (current.slots.some((slot) => slot.id === id)) {
        throw new Error(`${input.kind} Dana already exists on ${input.date}.`)
    }
    if (!Number.isFinite(input.capacity) || input.capacity < 1 || input.capacity > 200) {
        throw new Error('Capacity must be between 1 and 200.')
    }

    const slot: DanaSlotRecord = {
        id,
        date: input.date,
        kind: input.kind,
        capacity: Math.round(input.capacity),
        closed: false,
        note: input.note ?? '',
        updatedAt: new Date().toISOString(),
    }
    commit({...current, slots: [...current.slots, slot]})
    return slot
}

export const updateSlot = (id: string, patch: Partial<Pick<DanaSlotRecord, 'capacity' | 'closed' | 'note'>>): DanaSlotRecord => {
    const current = snapshot()
    const existing = current.slots.find((slot) => slot.id === id)
    if (!existing) throw new Error('That Dana slot no longer exists.')
    if (patch.capacity !== undefined && (!Number.isFinite(patch.capacity) || patch.capacity < 1 || patch.capacity > 200)) {
        throw new Error('Capacity must be between 1 and 200.')
    }

    const next: DanaSlotRecord = {
        ...existing,
        ...patch,
        capacity: patch.capacity === undefined ? existing.capacity : Math.round(patch.capacity),
        updatedAt: new Date().toISOString(),
    }
    commit({...current, slots: current.slots.map((slot) => (slot.id === id ? next : slot))})
    return next
}

/** Removing a day's slot also cancels the devotees assigned to it, as the API will. */
export const deleteSlot = (id: string): void => {
    const current = snapshot()
    const [date, kind] = id.split('|')
    commit({
        families: current.families,
        slots: current.slots.filter((slot) => slot.id !== id),
        bookings: current.bookings.map((booking) =>
            booking.date === date && booking.kind === kind && booking.status !== 'Cancelled'
                ? {...booking, status: 'Cancelled'}
                : booking),
    })
}

/* ------------------------------------------------------------------ */
/* CRUD - assigned devotees                                           */
/* ------------------------------------------------------------------ */

const clampParticipants = (value: number): number => Math.max(1, Math.min(20, Math.round(value) || 1))

/** Throws when the same family already holds a place in that offering. */
const guardFamilyOnce = (bookings: DanaBookingRecord[], familyId: string, date: string, kind: DanaKind, ignoreId?: string) => {
    const clash = bookings.some((booking) =>
        booking.id !== ignoreId &&
        booking.familyId === familyId &&
        booking.date === date &&
        booking.kind === kind &&
        booking.status !== 'Cancelled')
    if (clash) throw new Error('That family is already assigned to this slot.')
}

/**
 * Assigns one place in an offering.
 *
 * Either a family already registered under the temple (`familyId`), or - for a special Dana - a
 * temporary family from outside the temple area, typed in by the admin. A temporary family stays on
 * the booking only; the temple's family list is not touched.
 */
export const createBooking = (input: {
    date: string
    kind: DanaKind
    participants: number
    familyId?: string
    temporary?: { name: string; village: string; contact: string }
}): DanaBookingRecord => {
    const current = snapshot()
    const summary = daySummary(input.date).find((item) => item.kind === input.kind)
    if (!summary) throw new Error('Create the Dana slot first.')
    if (summary.closed) throw new Error('This slot is closed.')
    if (summary.available <= 0) throw new Error('This slot is already full.')

    let person: { familyId: string; temporary: boolean; name: string; village: string; contact: string }

    if (input.temporary) {
        const name = input.temporary.name.trim()
        const village = input.temporary.village.trim()
        const contact = input.temporary.contact.replace(/\D/g, '')
        if (!name) throw new Error('Enter the family name.')
        if (!village) throw new Error('Enter the village.')
        if (contact.length < 9) throw new Error('Enter a valid contact number.')
        person = {familyId: '', temporary: true, name, village, contact}
    } else {
        const family = findFamily(input.familyId ?? '')
        if (!family) throw new Error('Choose a family to assign.')
        guardFamilyOnce(current.bookings, family.id, input.date, input.kind)
        person = {
            familyId: family.id,
            temporary: false,
            name: family.name,
            village: family.village,
            contact: family.contact,
        }
    }

    const booking: DanaBookingRecord = {
        id: `dana-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        reference: nextReference(current, input.date),
        date: input.date,
        kind: input.kind,
        familyId: person.familyId,
        temporary: person.temporary,
        familyName: person.name,
        village: person.village,
        contact: person.contact,
        participants: clampParticipants(input.participants),
        status: 'Approved',
        createdAt: new Date().toISOString(),
    }
    commit({...current, bookings: [...current.bookings, booking]})
    return booking
}

/** Edits an assignment: the number of people, or the family itself. */
export const updateBooking = (
    bookingId: string,
    patch: { participants?: number; familyId?: string },
): DanaBookingRecord => {
    const current = snapshot()
    const existing = current.bookings.find((booking) => booking.id === bookingId)
    if (!existing) throw new Error('That booking no longer exists.')

    let next: DanaBookingRecord = {
        ...existing,
        participants: patch.participants === undefined ? existing.participants : clampParticipants(patch.participants),
    }

    if (patch.familyId && patch.familyId !== existing.familyId) {
        const family = findFamily(patch.familyId)
        if (!family) throw new Error('Choose a family to assign.')
        guardFamilyOnce(current.bookings, family.id, existing.date, existing.kind, bookingId)
        next = {
            ...next,
            familyId: family.id,
            temporary: false,
            familyName: family.name,
            village: family.village,
            contact: family.contact,
        }
    }

    commit({...current, bookings: current.bookings.map((booking) => (booking.id === bookingId ? next : booking))})
    return next
}

export const updateBookingStatus = (bookingId: string, status: BookingStatus): DanaBookingRecord => {
    const current = snapshot()
    const existing = current.bookings.find((booking) => booking.id === bookingId)
    if (!existing) throw new Error('That booking no longer exists.')
    const next = {...existing, status}
    commit({...current, bookings: current.bookings.map((booking) => (booking.id === bookingId ? next : booking))})
    return next
}

/** Cancels rather than erases, so the reference stays auditable. */
export const removeBooking = (bookingId: string): void => {
    updateBookingStatus(bookingId, 'Cancelled')
}

/* ------------------------------------------------------------------ */
/* Hook                                                               */
/* ------------------------------------------------------------------ */

export type DanaAdminApi = {
    slots: DanaSlotRecord[]
    bookings: DanaBookingRecord[]
    families: DanaFamily[]
    reset: () => void
}

export const useDanaAdmin = (): DanaAdminApi => {
    const data = useSyncExternalStore(subscribe, snapshot, snapshot)
    return {slots: data.slots, bookings: data.bookings, families: data.families, reset: resetDanaData}
}