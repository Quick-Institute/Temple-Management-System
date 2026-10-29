/* ------------------------------------------------------------------
   Demo data - frontend only. No backend is called anywhere yet.
   ------------------------------------------------------------------ */

export const DEMO_TODAY = '2026-10-26'

/*
 * The temple this demo session belongs to. It is the same temple the registration screen offers
 * (SMB-VIH-0042 in src/data/temples.ts), so the Sinhala and English names, village and district
 * always agree — nothing here is translated twice.
 */
export const currentTemple = {
    id: 'TMP-2026-0042',
    name: 'Sri Sambodhi Maha Viharaya',
    nameSi: 'ශ්‍රී සම්බෝධි මහා විහාරය',
    registerCode: 'SMB-VIH-0042',
    village: 'Kadolkele',
    villageSi: 'කදොල්කැලේ',
    district: 'Gampaha',
    districtSi: 'ගම්පහ',
    province: 'Western',
    provinceSi: 'බස්නාහිර',
    postalCode: '11500',
    phone: '+94 31 223 4478',
    email: 'office@sambodhiviharaya.lk',
    domain: 'sambodhiviharaya.lk',
    families: 486,
}

export const currentUser = {
    id: '198512304567',
    name: 'Ven. Kamburugamuwa Dhammika Thero',
    shortName: 'Ven. Dhammika Thero',
    role: 'Temple Admin',
    designation: 'Chief Incumbent Monk',
    initials: 'DT',
    temple: currentTemple.name,
    templeSi: currentTemple.nameSi,
}

/**
 * The next full-moon Poya day after DEMO_TODAY. Vap Poya fell on 25 October 2026, so the
 * dashboard now counts down to Il Poya on Tuesday 24 November 2026 - 29 days from 26 October.
 */
export const nextPoya = {
    name: 'Il Poya',
    date: '2026-11-24',
    dayLabel: '24 November',
    days: 29,
    /** "Il Poya in 29 days - 24 November" (hero badge) */
    label: 'Il Poya in 29 days - 24 November',
    /** "Il Poya in 29 days · 24 Nov 2026" (sidebar footer) */
    short: 'Il Poya in 29 days · 24 Nov 2026',
}

/* ------------------------------- Dana ------------------------------ */

export type DanaSession = {
    key: 'morning' | 'afternoon'
    label: string
    time: string
    capacity: number
    families: { id: string; familyName: string; familiarName: string; guests: number }[]
}

const NAMES: [string, string][] = [
    ['FAM-1024', 'Nimal’s family'],
    ['FAM-1031', 'Mariya’s family'],
    ['FAM-1044', 'Chandrika’s family'],
    ['FAM-1052', 'Ranjith’s family'],
    ['FAM-1067', 'Anoma’s family'],
    ['FAM-1078', 'Sunil’s family'],
    ['FAM-1095', 'Deepika’s family'],
    ['FAM-1102', 'Ajith’s family'],
    ['FAM-1118', 'Kapila’s family'],
    ['FAM-1126', 'Sandya’s family'],
    ['FAM-1134', 'Wasantha’s family'],
    ['FAM-1141', 'Padma’s family'],
    ['FAM-1157', 'Sujatha’s family'],
    ['FAM-1163', 'Chaminda’s family'],
]

const FAMILY_NAMES: Record<string, string> = {
    'FAM-1024': 'Perera Family',
    'FAM-1031': 'Fernando Family',
    'FAM-1044': 'Silva Family',
    'FAM-1052': 'Jayasinghe Family',
    'FAM-1067': 'Wijesuriya Family',
    'FAM-1078': 'Bandara Family',
    'FAM-1095': 'Rathnayake Family',
    'FAM-1102': 'Kumara Family',
    'FAM-1118': 'Dissanayake Family',
    'FAM-1126': 'Herath Family',
    'FAM-1134': 'Ratnayake Family',
    'FAM-1141': 'Gunawardena Family',
    'FAM-1157': 'Wickramasinghe Family',
    'FAM-1163': 'Abeysekara Family',
}

/** The same family names in Sinhala, so a family is never shown in two scripts at once. */
export const FAMILY_NAMES_SI: Record<string, string> = {
    'FAM-1024': 'පෙරේරා පවුල',
    'FAM-1031': 'ප්‍රනාන්දු පවුල',
    'FAM-1044': 'සිල්වා පවුල',
    'FAM-1052': 'ජයසිංහ පවුල',
    'FAM-1067': 'විජේසූරිය පවුල',
    'FAM-1078': 'බණ්ඩාර පවුල',
    'FAM-1095': 'රත්නායක පවුල',
    'FAM-1102': 'කුමාර පවුල',
    'FAM-1118': 'දිසානායක පවුල',
    'FAM-1126': 'හේරත් පවුල',
    'FAM-1134': 'රත්නායක පවුල',
    'FAM-1141': 'ගුණවර්ධන පවුල',
    'FAM-1157': 'වික්‍රමසිංහ පවුල',
    'FAM-1163': 'අබේසේකර පවුල',
}

const buildSession = (key: DanaSession['key'], count: number, capacity: number): DanaSession => ({
    key,
    label: key === 'morning' ? 'Morning Dana' : 'Afternoon Dana',
    time: key === 'morning' ? '6:00 AM – 9:00 AM' : '11:00 AM – 1:00 PM',
    capacity,
    families: Array.from({length: count}, (_, index) => {
        const [id, familiarName] = NAMES[index % NAMES.length]
        return {id, familyName: FAMILY_NAMES[id], familiarName, guests: 2 + (index % 5)}
    }),
})

export type DanaDay = {
    date: string
    note?: string
    sessions: DanaSession[]
}

const day = (date: string, morning: number, afternoon: number, note?: string): DanaDay => ({
    date,
    note,
    sessions: [buildSession('morning', morning, 10), buildSession('afternoon', afternoon, 12)],
})

/** Seven days from DEMO_TODAY - Mon 26 Oct to Sun 1 Nov 2026. Booked counts are per session. */
export const danaDays: DanaDay[] = [
    day(DEMO_TODAY, 4, 6),
    day('2026-10-27', 8, 11),
    day('2026-10-28', 10, 12, 'Both sessions full'),
    day('2026-10-29', 5, 8, 'Daham Pasal examination'),
    day('2026-10-30', 6, 9, 'Donor Council meeting'),
    day('2026-10-31', 2, 5),
    day('2026-11-01', 7, 4),
    day('2026-11-02', 3, 6),
    day('2026-11-03', 9, 10, 'Katina robe offering'),
    day('2026-11-04', 4, 7),
]

const bookedInWeek = danaDays.reduce((total, d) => total + d.sessions.reduce((n, s) => n + s.families.length, 0), 0)
const capacityInWeek = danaDays.reduce((total, d) => total + d.sessions.reduce((n, s) => n + s.capacity, 0), 0)

/** Everything below is derived from danaDays, so the numbers stay consistent when the dates move. */
export const danaStats = {
    bookedThisWeek: bookedInWeek,
    capacityUsed: Math.round((bookedInWeek / capacityInWeek) * 100),
    openSessions: danaDays.reduce(
        (total, d) => total + d.sessions.filter((s) => s.families.length < s.capacity).length, 0,
    ),
    fullSessions: danaDays.reduce(
        (total, d) => total + d.sessions.filter((s) => s.families.length >= s.capacity).length, 0,
    ),
}

/* --------------------------- Attention ----------------------------- */

export type AttentionItem = {
    id: string
    title: string
    detail: string
    action: string
    tone: 'dana' | 'transfer' | 'idea' | 'donation'
}

export const attentionItems: AttentionItem[] = [
    {
        id: 'AT-1',
        title: '3 Dana bookings awaiting approval',
        detail: 'Morning and afternoon sessions, 27–28 October',
        action: 'Review',
        tone: 'dana'
    },
    {
        id: 'AT-2',
        title: '2 village transfer requests',
        detail: 'Ajith’s family, Deepika’s family',
        action: 'Accept',
        tone: 'transfer'
    },
    {
        id: 'AT-3',
        title: '1 new community suggestion',
        detail: '“Start a Sunday evening meditation class for youth”',
        action: 'Open',
        tone: 'idea'
    },
    {
        id: 'AT-4',
        title: '1 donation needs verification',
        detail: 'DN-3307 · Rathnayake family · LKR 15,000',
        action: 'Verify',
        tone: 'donation'
    },
]

/* --------------------------- Donations ----------------------------- */

export type Donation = {
    id: string
    reference: string
    donor: string
    familyId: string
    purpose: string
    method: 'Card' | 'QR Payment' | 'Online Transfer' | 'Cash'
    amount: number
    status: 'Verified' | 'Pending' | 'Failed'
}

export const donations: Donation[] = [
    {
        id: 'DN-3310',
        reference: 'PAY-8H2K91LM',
        donor: 'Perera Family',
        familyId: 'FAM-1024',
        purpose: 'Katina Robe Offering',
        method: 'Card',
        amount: 25000,
        status: 'Verified'
    },
    {
        id: 'DN-3309',
        reference: 'PAY-7T4N22QA',
        donor: 'Anonymous Donor',
        familyId: '-',
        purpose: 'Temple Maintenance Fund',
        method: 'Online Transfer',
        amount: 100000,
        status: 'Verified'
    },
    {
        id: 'DN-3308',
        reference: 'PAY-3C9X77RB',
        donor: 'Silva Family',
        familyId: 'FAM-1044',
        purpose: 'Dana Offering',
        method: 'QR Payment',
        amount: 7500,
        status: 'Verified'
    },
    {
        id: 'DN-3307',
        reference: 'PAY-5M1P08ZD',
        donor: 'Rathnayake Family',
        familyId: 'FAM-1095',
        purpose: 'Daham Pasal Library',
        method: 'Card',
        amount: 15000,
        status: 'Pending'
    },
    {
        id: 'DN-3306',
        reference: 'PAY-2V6L44KC',
        donor: 'Fernando Family',
        familyId: 'FAM-1031',
        purpose: 'Dana Offering',
        method: 'Card',
        amount: 5000,
        status: 'Verified'
    },
]

export const donationTotals = {
    october: 146500,
    lastMonth: 126300,
}

/* ---------------------------- Events ------------------------------- */

export type TempleEvent = {
    id: string
    title: string
    date: string
    time: string
    venue: string
    category: 'Poya' | 'Daham Pasal' | 'Religious' | 'Community' | 'Meeting'
    status: 'Published' | 'Pending'
}

export const events: TempleEvent[] = [
    {
        id: 'EV-202',
        title: 'Daham Pasal Annual Examination',
        date: '2026-10-29',
        time: '8:00 AM – 12:00 PM',
        venue: 'Daham Pasal Hall',
        category: 'Daham Pasal',
        status: 'Published'
    },
    {
        id: 'EV-203',
        title: 'Donor Council Quarterly Meeting',
        date: '2026-10-30',
        time: '4:00 PM – 6:00 PM',
        venue: 'Chapter House',
        category: 'Meeting',
        status: 'Pending'
    },
    {
        id: 'EV-204',
        title: 'Katina Robe Offering Ceremony',
        date: '2026-11-08',
        time: '7:00 AM – 3:00 PM',
        venue: 'Main Shrine',
        category: 'Religious',
        status: 'Published'
    },
    {
        id: 'EV-201',
        title: 'Il Poya Observance Programme',
        date: '2026-11-24',
        time: '6:00 AM – 8:00 PM',
        venue: 'Main Shrine & Bodhiya',
        category: 'Poya',
        status: 'Published'
    },
]

/* ------------------------- Notifications --------------------------- */

export type Notification = {
    id: string
    title: string
    body: string
    time: string
    tone: 'success' | 'info' | 'warning'
    read: boolean
}

export const notifications: Notification[] = [
    {
        id: 'NT-01',
        title: 'Dana booking approved',
        body: 'Morning Dana booking for 27 October is confirmed.',
        time: '10:15 AM',
        tone: 'success',
        read: false
    },
    {
        id: 'NT-02',
        title: 'Daham Pasal examination on 29 October',
        body: 'The annual examination begins at 8.00 AM in the Daham Pasal Hall.',
        time: '08:30 AM',
        tone: 'info',
        read: false
    },
    {
        id: 'NT-03',
        title: 'Temple transfer request',
        body: 'Kumara family requested a temporary transfer to this temple.',
        time: 'Yesterday',
        tone: 'warning',
        read: false
    },
    {
        id: 'NT-04',
        title: 'New suggestion received',
        body: '“Start a Sunday evening meditation class for youth”.',
        time: 'Yesterday',
        tone: 'info',
        read: true
    },
]

/* ----------------------------- Helpers ----------------------------- */

export const lkr = (value: number) => `LKR ${value.toLocaleString('en-LK')}`

export const prettyDate = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {day: '2-digit', month: 'short'})

export const longDate = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {day: '2-digit', month: 'long', year: 'numeric'})

export const sessionStatus = (session: DanaSession) => {
    const booked = session.families.length
    if (booked === 0) return 'Not yet open'
    if (booked >= session.capacity) return 'Full'
    return 'Open'
}