/* ------------------------------------------------------------------
   Demo accounts - one per role in the proposal (section 14).
   No backend is called yet, so the sign-in screen checks these records.
   ------------------------------------------------------------------ */

import type {RoleKey} from './permissions'

export type DemoRole = RoleKey

export type DemoUser = {
    /** What the person types into "Email Address" (the part before @ also works). */
    identifier: string
    password: string
    id: string
    name: string
    shortName: string
    role: DemoRole
    /** Shown under the avatar in the top bar. */
    roleLabel: string
    designation: string
    initials: string
    templeName: string
    familyName?: string
    contactNumber: string
}

const TEMPLE = 'Sri Sambodhi Maha Viharaya'

export const demoUsers: DemoUser[] = [
    {
        identifier: 'family@temple.lk',
        password: 'family@2026',
        id: 'fam-0001',
        name: 'Nimal Perera',
        shortName: 'Nimal Perera',
        role: 'family',
        roleLabel: 'Family Member',
        designation: 'Family Member',
        initials: 'NP',
        templeName: TEMPLE,
        familyName: 'Perera Family',
        contactNumber: '+94 77 123 4567',
    },
    {
        identifier: 'templeadmin@temple.lk',
        password: 'temple@2026',
        id: '198512304567',
        name: 'Ven. Kamburugamuwa Dhammika Thero',
        shortName: 'Ven. Dhammika Thero',
        role: 'templeAdmin',
        roleLabel: 'Temple Admin',
        designation: 'Chief Incumbent Monk',
        initials: 'DT',
        templeName: TEMPLE,
        contactNumber: '+94 31 223 4478',
    },
    {
        identifier: 'coadmin@temple.lk',
        password: 'coadmin@2026',
        id: '198512304568',
        name: 'Sunil Fernando',
        shortName: 'Sunil Fernando',
        role: 'coAdmin',
        roleLabel: 'Co-Administrator',
        designation: 'Co-Administrator (Village Representative)',
        initials: 'SF',
        templeName: TEMPLE,
        contactNumber: '+94 71 555 8899',
    },
    {
        identifier: 'committee@temple.lk',
        password: 'committee@2026',
        id: '198512304569',
        name: 'Kamala Silva',
        shortName: 'Kamala Silva',
        role: 'committeeRepresentative',
        roleLabel: 'Committee Representative',
        designation: 'Dayaka Sabha Committee Member',
        initials: 'KS',
        templeName: TEMPLE,
        contactNumber: '+94 76 220 3311',
    },
    {
        identifier: 'monk@temple.lk',
        password: 'monk@2026',
        id: '198512304570',
        name: 'Ven. Ananda Thero',
        shortName: 'Ven. Ananda Thero',
        role: 'religiousRepresentative',
        roleLabel: 'Religious Representative',
        designation: 'Authorized Religious Representative',
        initials: 'AT',
        templeName: TEMPLE,
        contactNumber: '+94 71 909 1122',
    },
    {
        identifier: 'superadmin@quicksolution.lk',
        password: 'super@2026',
        id: 'QS-SA-0001',
        name: 'Isuru Bandara',
        shortName: 'Isuru Bandara',
        role: 'superAdmin',
        roleLabel: 'Super Administrator',
        designation: 'Platform Administrator, Quick Solutions (PVT) Ltd.',
        initials: 'IB',
        templeName: 'All temples',
        contactNumber: '+94 11 727 5300',
    },
]

/** "family@temple.lk" or "family" both resolve to the same demo account. */
const normalise = (value: string) => value.trim().toLowerCase()

export const findDemoUser = (identifier: string, password: string): DemoUser | null => {
    const key = normalise(identifier)
    const match = demoUsers.find((user) =>
        normalise(user.identifier) === key || normalise(user.identifier.split('@')[0]) === key,
    )
    if (!match || match.password !== password) return null
    return match
}

/** Where each user type lands after signing in. */
export const homeFor = (role: DemoRole): string => {
    if (role === 'superAdmin') return '/super-admin/dashboard'
    if (role === 'coAdmin' || role === 'committeeRepresentative' || role === 'religiousRepresentative') {
        return '/co-admin/dashboard'
    }
    return '/dashboard'
}