/* ------------------------------------------------------------------
   Temple member directory - the people a Temple Information screen can list in User Management.

   Three categories, exactly as asked:
     templeAdmin  - the temple's administrators
     committee    - committee / donor representatives
     family       - family and community users

   Each member carries a small set of switchable permissions. The Temple Admin decides them; the
   committee sees the same list read-only for its own committee. Frontend only: the list lives in
   localStorage until the API exists, so a request survives the tab it was sent from.
   ------------------------------------------------------------------ */

import {useSyncExternalStore} from 'react'
import type {PermissionKey} from './permissions'

export type MemberCategory = 'templeAdmin' | 'committee' | 'family'

export const MEMBER_CATEGORY_LABELS: Record<MemberCategory, string> = {
    templeAdmin: 'Temple Admin',
    committee: 'Committee Member',
    family: 'Family User',
}

/** The switches a Temple Admin can flip for a member. Kept short on purpose - these are the daily ones. */
export const MEMBER_PERMISSION_CHOICES: { key: PermissionKey; label: string; hint: string }[] = [
    {key: 'manageTempleRecords', label: 'Temple records', hint: 'Events, notices and day-to-day records'},
    {key: 'manageAnnouncements', label: 'Announcements', hint: 'Publish announcements to the community'},
    {key: 'viewDanaSlots', label: 'View Dana schedule', hint: 'See the daily Dana slots'},
    {key: 'manageDanaBookings', label: 'Manage Dana bookings', hint: 'Approve or cancel bookings'},
    {key: 'viewDonations', label: 'View donations', hint: 'See online donation records'},
    {key: 'registerFamilyQr', label: 'Register families', hint: 'Add a family through the temple QR code'},
    {key: 'viewTempleAudit', label: 'Audit log', hint: 'Read the temple activity log'},
]

export type TempleMember = {
    id: string
    name: string
    /** Contact number, shown under the name. */
    phone: string
    email: string
    category: MemberCategory
    designation: string
    templeName: string
    /** A committee member belongs to one committee, e.g. "Dayaka Sabhawa". */
    committee?: string
    familyName?: string
    status: 'Active' | 'Invited' | 'Suspended'
    /** Only the switches that are on are listed. */
    permissions: PermissionKey[]
}

const TEMPLE = 'Sri Sambodhi Maha Viharaya'

const SEED: TempleMember[] = [
    {
        id: 'MB-01', name: 'Ven. Kamburugamuwa Dhammika Thero', phone: '+94 31 223 4478',
        email: 'chief@sambodhiviharaya.lk', category: 'templeAdmin', designation: 'Chief Incumbent Monk',
        templeName: TEMPLE, status: 'Active',
        permissions: ['manageTempleRecords', 'manageAnnouncements', 'manageDanaBookings', 'viewDonations', 'viewTempleAudit'],
    },
    {
        id: 'MB-02',
        name: 'Sunil Fernando',
        phone: '+94 71 555 8899',
        email: 'sunil.f@sambodhiviharaya.lk',
        category: 'templeAdmin',
        designation: 'Co-Administrator (Village Representative)',
        templeName: TEMPLE,
        status: 'Active',
        permissions: ['manageTempleRecords', 'viewDanaSlots', 'registerFamilyQr'],
    },
    {
        id: 'MB-03',
        name: 'Ven. Ananda Thero',
        phone: '+94 71 909 1122',
        email: 'ananda@sambodhiviharaya.lk',
        category: 'templeAdmin',
        designation: 'Authorized Religious Representative',
        templeName: TEMPLE,
        status: 'Active',
        permissions: ['manageAnnouncements', 'viewDanaSlots'],
    },
    {
        id: 'MB-04', name: 'Kamala Silva', phone: '+94 76 220 3311',
        email: 'kamala.silva@gmail.com', category: 'committee', designation: 'Committee Member',
        committee: 'Dayaka Sabhawa', templeName: TEMPLE, status: 'Active',
        permissions: ['viewDanaSlots', 'viewDonations'],
    },
    {
        id: 'MB-05', name: 'Ranjith Wickramasinghe', phone: '+94 77 480 2210',
        email: 'ranjith.w@gmail.com', category: 'committee', designation: 'Treasurer',
        committee: 'Dayaka Sabhawa', templeName: TEMPLE, status: 'Active',
        permissions: ['viewDonations', 'viewTempleAudit'],
    },
    {
        id: 'MB-06', name: 'Priyanka Jayawardena', phone: '+94 71 220 8845',
        email: 'priyanka.j@gmail.com', category: 'committee', designation: 'Secretary',
        committee: 'Dayaka Sabhawa', templeName: TEMPLE, status: 'Active',
        permissions: ['manageAnnouncements'],
    },
    {
        id: 'MB-07', name: 'Anura Dissanayake', phone: '+94 76 553 7781',
        email: 'anura.d@gmail.com', category: 'committee', designation: 'Committee Member',
        committee: 'Event or Programme Committee', templeName: TEMPLE, status: 'Active',
        permissions: ['manageTempleRecords'],
    },
    {
        id: 'MB-08', name: 'Nimal Perera', phone: '+94 77 123 4567',
        email: 'family@temple.lk', category: 'family', designation: 'Family Member',
        familyName: 'Perera Family', templeName: TEMPLE, status: 'Active',
        permissions: ['viewDanaSlots'],
    },
    {
        id: 'MB-09', name: 'Chamari Fernando', phone: '+94 71 664 2280',
        email: 'chamari.f@gmail.com', category: 'family', designation: 'Family Member',
        familyName: 'Fernando Family', templeName: TEMPLE, status: 'Active',
        permissions: ['viewDanaSlots'],
    },
    {
        id: 'MB-10', name: 'Kumara Wijesuriya', phone: '+94 77 990 3312',
        email: 'kumara.w@gmail.com', category: 'family', designation: 'Family Member',
        familyName: 'Kumara Family', templeName: TEMPLE, status: 'Invited',
        permissions: [],
    },
    {
        id: 'MB-11', name: 'Samanthi Herath', phone: '+94 76 118 4477',
        email: 'samanthi.h@gmail.com', category: 'family', designation: 'Family Member',
        familyName: 'Herath Family', templeName: TEMPLE, status: 'Active',
        permissions: ['viewDanaSlots'],
    },
    {
        id: 'MB-12', name: 'Dayananda Rathnayake', phone: '+94 71 337 5590',
        email: 'dayananda.r@gmail.com', category: 'family', designation: 'Family Member',
        familyName: 'Rathnayake Family', templeName: TEMPLE, status: 'Suspended',
        permissions: [],
    },
]

const STORAGE_KEY = 'tms.members'

let members: TempleMember[] = load()
const listeners = new Set<() => void>()

function load(): TempleMember[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) return JSON.parse(raw) as TempleMember[]
    } catch {
        /* first visit, or storage blocked - fall back to the seed */
    }
    return SEED
}

const commit = (next: TempleMember[]) => {
    members = next
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
        /* best effort */
    }
    listeners.forEach((listener) => listener())
}

const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
}

export const toggleMemberPermission = (memberId: string, permission: PermissionKey) => {
    commit(members.map((member) => {
        if (member.id !== memberId) return member
        const on = member.permissions.includes(permission)
        return {
            ...member,
            permissions: on
                ? member.permissions.filter((item) => item !== permission)
                : [...member.permissions, permission],
        }
    }))
}

export const setMemberStatus = (memberId: string, status: TempleMember['status']) => {
    commit(members.map((member) => (member.id === memberId ? {...member, status} : member)))
}

/** Live member list. Re-renders every screen that uses it when a switch is flipped. */
export const useMembers = (): TempleMember[] =>
    useSyncExternalStore(subscribe, () => members, () => SEED)