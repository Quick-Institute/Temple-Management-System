/* ------------------------------------------------------------------
   Temple record types and the small helpers that read them.

   Kept apart from templeStore.tsx so that file exports the provider component only
   (React fast refresh), and so pages can import the status rules without pulling in the store.
   ------------------------------------------------------------------ */

export type TempleStatus =
/** Submitted, waiting for the Super Administrator. No registration ID yet. */
    | 'Pending approval'
    /** Approved and live, with a registration ID. */
    | 'Active'
    /** The Super Administrator sent it back for correction; editable, not live. */
    | 'Changes requested'
    /** Active, but a deletion request is waiting for system administrator approval. */
    | 'Deletion requested'

export type CapacityField = {
    id: string
    label: string
    seats: string
}

/**
 * A Co-Administrator appointed by the Temple Admin (proposal 10.2.3). A temple may appoint as
 * many as it needs; the proposal names two designations - an Authorized Religious Representative
 * and a Designated Technical Administrator - but the list is not capped and the designation is
 * free text. No appointment gives platform-level (Super Administrator) access.
 */
/** Any designation can be appointed; these two are the ones the proposal names. */
export type CoAdministratorRole = string

export type CoAdministrator = {
    id: string
    role: CoAdministratorRole
    name: string
    email: string
    phone: string
    /** NIC or staff/office reference the temple keeps on file. */
    reference: string
    appointedOn: string
    status: 'Active' | 'Invited' | 'Suspended'
}

export type CommitteeMember = {
    role: string
    name: string
    phone: string
}

export type TempleDocument = {
    name: string
    kind: string
    updated: string
}

export type TempleRecord = {
    /** Internal id used in the URL; never shown to users. */
    id: string
    /** Assigned by the system administrator on approval - null until then. */
    registrationId: string | null
    name: string
    type: string
    status: TempleStatus
    established: string
    chiefIncumbent: string
    description: string
    address: string
    village: string
    gnDivision: string
    dsDivision: string
    district: string
    province: string
    postalCode: string
    phone: string
    phoneAlt: string
    email: string
    website: string
    landExtent: string
    facilities: string[]
    capacity: CapacityField[]
    danaSessions: string[]
    banking: { bank: string; branch: string; accountName: string; accountNumber: string }
    coAdmins: CoAdministrator[]
    committee: CommitteeMember[]
    documents: TempleDocument[]
    submittedOn: string
    approvedOn: string | null
    deletionRequestedOn: string | null
    /** Set when the system administrator asks for a correction. */
    reviewNote: string | null
    /**
     * The Temple Admin (by sign-in email) who controls this temple. A chief incumbent may hold more
     * than one temple, which is why the temple admin can switch between them.
     */
    ownerEmail?: string
    /**
     * Further Temple Admin accounts that hold the same rights over this temple - a second incumbent,
     * or an assistant who administers the Dana and the register alongside the chief incumbent.
     */
    ownerEmails?: string[]
}

/** Short label for a designation badge; unknown designations show as typed. */
export const coAdminRoleShort = (role: string) => CO_ADMIN_SHORT[role] ?? role

const CO_ADMIN_SHORT: Record<string, string> = {
    'Authorized Religious Representative': 'Religious Representative',
    'Designated Technical Administrator': 'Technical Administrator',
}

/** An approved or pre-approval record can be edited; a deletion request is frozen. */
export const isEditable = (status: TempleStatus) =>
    status === 'Active' || status === 'Pending approval' || status === 'Changes requested'

/** Only a request that has not been approved may be dropped outright. */
export const canDrop = (status: TempleStatus) =>
    status === 'Pending approval' || status === 'Changes requested'

export const statusTone: Record<TempleStatus, string> = {
    Active: 'border-accent-green/30 bg-accent-green-50 text-accent-green',
    'Pending approval': 'border-accent-blue/30 bg-accent-blue-50 text-status-blue',
    'Changes requested': 'border-accent-purple/30 bg-accent-purple-50 text-accent-purple',
    'Deletion requested': 'border-status-rose/30 bg-lotus-50 text-status-rose',
}

/* Sinhala month names are spelled out rather than taken from Intl: a browser with a reduced
   locale set (and some headless builds) silently falls back to English for 'si-LK'. */
const SI_MONTHS = [
    'ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි',
    'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්',
]

export const prettyDate = (iso: string | null, language?: string) => {
    if (!iso) return '-'
    const date = new Date(`${iso}T00:00:00`)
    if (Number.isNaN(date.getTime())) return '-'
    if (language === 'si') {
        const day = String(date.getDate()).padStart(2, '0')
        return `${day} ${SI_MONTHS[date.getMonth()]} ${date.getFullYear()}`
    }
    return date.toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})
}