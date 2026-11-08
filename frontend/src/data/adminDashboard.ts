/* ------------------------------------------------------------------
   Temple admin dashboard fixtures - the numbers and rows shown on the
   dashboard wireframe (families, dana bookings, donations, schedule).
   Frontend only: nothing here is fetched yet.
   ------------------------------------------------------------------ */

export type StatTone = 'blue' | 'green' | 'gold' | 'purple'

export type DashboardStat = {
    key: 'families' | 'dana' | 'donations' | 'events'
    tone: StatTone
    value: number
    /** "+12 this month" - rendered under the value with a rising arrow. */
    delta: string
    money?: boolean
}

export const dashboardStats: DashboardStat[] = [
    {key: 'families', tone: 'blue', value: 248, delta: '12'},
    {key: 'dana', tone: 'green', value: 36, delta: '8'},
    {key: 'donations', tone: 'gold', value: 125000, delta: '15%', money: true},
    {key: 'events', tone: 'purple', value: 5, delta: '2'},
]

/* --------------------------- Today's schedule ---------------------- */

export type ScheduleEntry = {
    id: string
    time: string
    title: string
    venue: string
    /** Right-hand marker: a booking count or a plain "Event" chip. */
    marker: { kind: 'bookings'; count: number } | { kind: 'event' }
    dot: StatTone
}

export const todaySchedule: ScheduleEntry[] = [
    {
        id: 'TS-1',
        time: '08:00 AM',
        title: 'Morning Dana',
        venue: 'Main Hall',
        marker: {kind: 'bookings', count: 2},
        dot: 'green',
    },
    {
        id: 'TS-2',
        time: '10:00 AM',
        title: 'Lunch Dana',
        venue: 'Main Hall',
        marker: {kind: 'bookings', count: 3},
        dot: 'blue',
    },
    {
        id: 'TS-3',
        time: '11:00 AM',
        title: "Children's Dhamma Class",
        venue: 'Education Hall',
        marker: {kind: 'event'},
        dot: 'green',
    },
    {
        id: 'TS-4',
        time: '03:00 PM',
        title: 'Evening Dana',
        venue: 'Main Hall',
        marker: {kind: 'bookings', count: 1},
        dot: 'purple',
    },
]

/* ------------------------- Recent dana bookings -------------------- */

export type BookingStatus = 'Pending' | 'Approved' | 'Rejected'

export type RecentBooking = {
    id: string
    date: string
    family: string
    danaType: 'Morning Dana' | 'Lunch Dana' | 'Evening Dana'
    time: string
    status: BookingStatus
}

export const recentBookings: RecentBooking[] = [
    {
        id: 'BK-4821',
        date: '15 Oct 2026',
        family: 'Nimal Perera',
        danaType: 'Morning Dana',
        time: '8:00 AM',
        status: 'Pending'
    },
    {
        id: 'BK-4822',
        date: '16 Oct 2026',
        family: 'Saman Jayasundara',
        danaType: 'Lunch Dana',
        time: '11:00 AM',
        status: 'Approved'
    },
    {
        id: 'BK-4823',
        date: '18 Oct 2026',
        family: 'Chandima Silva',
        danaType: 'Evening Dana',
        time: '5:00 PM',
        status: 'Pending'
    },
    {
        id: 'BK-4824',
        date: '20 Oct 2026',
        family: 'Fernando Family',
        danaType: 'Morning Dana',
        time: '8:00 AM',
        status: 'Approved'
    },
    {
        id: 'BK-4825',
        date: '22 Oct 2026',
        family: 'Perera Family',
        danaType: 'Lunch Dana',
        time: '11:00 AM',
        status: 'Rejected'
    },
]

/* ----------------------------- Quick actions ----------------------- */

export type QuickAction = {
    key: 'dana' | 'event' | 'announcement' | 'users'
    tone: StatTone
    tint: 'green' | 'purple' | 'rose' | 'blue'
}

export const quickActions: QuickAction[] = [
    {key: 'dana', tone: 'green', tint: 'green'},
    {key: 'event', tone: 'purple', tint: 'purple'},
    {key: 'announcement', tone: 'gold', tint: 'rose'},
    {key: 'users', tone: 'blue', tint: 'blue'},
]

/* --------------------------- Notifications ------------------------- */

export type DashboardNotice = {
    id: string
    title: string
    detail: string
    time: string
    icon: 'booking' | 'event' | 'family' | 'donation'
}

export const dashboardNotices: DashboardNotice[] = [
    {
        id: 'DN-1',
        title: 'New dana booking request received.',
        detail: 'Nimal Perera · 15 Oct 2026 · Morning Dana',
        time: '10:15 AM',
        icon: 'booking',
    },
    {
        id: 'DN-2',
        title: 'New event added: Poson Programme.',
        detail: '22 Oct 2026 · Sri Sambodhi Maha Viharaya',
        time: '08:30 AM',
        icon: 'event',
    },
    {
        id: 'DN-3',
        title: 'New family registration request.',
        detail: 'Fernando Family',
        time: '08:30 AM',
        icon: 'family',
    },
    {
        id: 'DN-4',
        title: 'Donation of Rs. 5,000 received.',
        detail: 'Saman Jayasundara',
        time: '09:42 AM',
        icon: 'donation',
    },
]

/** Rupee amounts on the dashboard are shown the local way: "Rs. 125,000". */
export const rs = (value: number) => `Rs. ${value.toLocaleString('en-LK')}`