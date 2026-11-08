/* ------------------------------------------------------------------
   Roles and permissions - taken from section 14 (Table 3) of the
   Temple Management System Development Proposal, Quick Solutions (PVT) Ltd.
   ------------------------------------------------------------------ */

export type RoleKey =
    | 'superAdmin'
    | 'templeAdmin'
    | 'coAdmin'
    | 'religiousRepresentative'
    | 'committeeRepresentative'
    | 'family'

/** The four access levels in 14.2 of the proposal. */
export type AccessLevel = 'full' | 'ownTemple' | 'limited' | 'none'

export type PermissionKey =
    | 'registerApproveTemples'
    | 'managePlatformSettings'
    | 'manageRegistrationStatus'
    | 'manageTempleInformation'
    | 'manageUserRoles'
    | 'appointCoAdmin'
    | 'manageTempleRecords'
    | 'manageAnnouncements'
    | 'viewPlatformAudit'
    | 'viewTempleAudit'
    | 'registerFamilyQr'
    | 'changeRegisteredTemple'
    | 'validateFamilyTempleChanges'
    | 'viewDonations'
    | 'submitSuggestions'
    | 'manageOptionalModules'
    | 'viewDanaSlots'
    | 'bookDanaSlot'
    | 'manageDanaSlots'
    | 'manageDanaBookings'
    | 'viewOwnBookings'

export type PermissionRow = {
    key: PermissionKey
    /** Row label exactly as printed in the proposal matrix. */
    label: string
    /** Where this permission shows up in the app, for the matrix screen. */
    area: string
    levels: Record<RoleKey, AccessLevel>
}

export const roleLabels: Record<RoleKey, string> = {
    superAdmin: 'Super Administrator',
    templeAdmin: 'Temple Admin',
    coAdmin: 'Co-Administrator',
    religiousRepresentative: 'Authorized Religious Representative',
    committeeRepresentative: 'Committee / Donor Representative',
    family: 'Family / Community User',
}

export const roleShortLabels: Record<RoleKey, string> = {
    superAdmin: 'Super Admin',
    templeAdmin: 'Temple Admin',
    coAdmin: 'Co-Administrator',
    religiousRepresentative: 'Religious Representative',
    committeeRepresentative: 'Committee / Donor Rep.',
    family: 'Family Member',
}

export const accessLabels: Record<AccessLevel, string> = {
    full: 'Full',
    ownTemple: 'Own temple',
    limited: 'Limited',
    none: 'No access',
}

const N = 'none' as const
const F = 'full' as const
const O = 'ownTemple' as const
const L = 'limited' as const

/*
 * Section 14.3 - Initial Permissions Matrix (Table 3), verbatim in structure. Dana rows are
 * added from FR-24 to FR-29, which the matrix does not repeat but the requirements define.
 */
export const permissionMatrix: PermissionRow[] = [
    {
        key: 'registerApproveTemples',
        label: 'Register and approve temples',
        area: 'Temple registration',
        levels: {
            superAdmin: F,
            templeAdmin: N,
            coAdmin: N,
            religiousRepresentative: N,
            committeeRepresentative: N,
            family: N
        },
    },
    {
        key: 'managePlatformSettings',
        label: 'Manage platform-level settings',
        area: 'Platform settings',
        levels: {
            superAdmin: F,
            templeAdmin: N,
            coAdmin: N,
            religiousRepresentative: N,
            committeeRepresentative: N,
            family: N
        },
    },
    {
        key: 'manageRegistrationStatus',
        label: 'Manage temple registration status (Pending / Approved / Rejected / Suspended)',
        area: 'Temple registration',
        levels: {
            superAdmin: F,
            templeAdmin: L,
            coAdmin: N,
            religiousRepresentative: N,
            committeeRepresentative: N,
            family: N
        },
    },
    {
        key: 'manageTempleInformation',
        label: 'Manage temple information',
        area: 'Temple Information',
        levels: {
            superAdmin: F,
            templeAdmin: O,
            coAdmin: L,
            religiousRepresentative: L,
            committeeRepresentative: L,
            family: L
        },
    },
    {
        key: 'manageUserRoles',
        label: 'Manage temple user roles',
        area: 'User Management',
        levels: {
            superAdmin: F,
            templeAdmin: O,
            coAdmin: L,
            religiousRepresentative: N,
            committeeRepresentative: L,
            family: N
        },
    },
    {
        key: 'appointCoAdmin',
        label: 'Appoint or remove Co-Administrator',
        area: 'Temple Information',
        levels: {
            superAdmin: F,
            templeAdmin: O,
            coAdmin: N,
            religiousRepresentative: N,
            committeeRepresentative: N,
            family: N
        },
    },
    {
        key: 'manageTempleRecords',
        label: 'View and manage temple records',
        area: 'Temple records',
        levels: {
            superAdmin: F,
            templeAdmin: O,
            coAdmin: L,
            religiousRepresentative: L,
            committeeRepresentative: L,
            family: L
        },
    },
    {
        key: 'manageAnnouncements',
        label: 'Manage announcements and activities',
        area: 'Announcements',
        levels: {
            superAdmin: F,
            templeAdmin: O,
            coAdmin: L,
            religiousRepresentative: L,
            committeeRepresentative: L,
            family: L
        },
    },
    {
        key: 'viewPlatformAudit',
        label: 'View platform audit logs',
        area: 'Audit logs',
        levels: {
            superAdmin: F,
            templeAdmin: N,
            coAdmin: N,
            religiousRepresentative: N,
            committeeRepresentative: N,
            family: N
        },
    },
    {
        key: 'viewTempleAudit',
        label: 'View temple-specific audit logs',
        area: 'Audit logs',
        levels: {
            superAdmin: F,
            templeAdmin: O,
            coAdmin: L,
            religiousRepresentative: N,
            committeeRepresentative: N,
            family: N
        },
    },
    {
        key: 'registerFamilyQr',
        label: 'Register a family through the temple QR code',
        area: 'Family Members',
        levels: {
            superAdmin: F,
            templeAdmin: O,
            coAdmin: L,
            religiousRepresentative: N,
            committeeRepresentative: N,
            family: L
        },
    },
    {
        key: 'changeRegisteredTemple',
        label: 'Change registered temple through self-service',
        area: 'My Family',
        levels: {
            superAdmin: F,
            templeAdmin: N,
            coAdmin: N,
            religiousRepresentative: N,
            committeeRepresentative: N,
            family: L
        },
    },
    {
        key: 'validateFamilyTempleChanges',
        label: 'Validate and record family temple changes',
        area: 'Family Members',
        levels: {
            superAdmin: F,
            templeAdmin: L,
            coAdmin: L,
            religiousRepresentative: N,
            committeeRepresentative: N,
            family: L
        },
    },
    {
        key: 'viewDonations',
        label: 'View online donation records',
        area: 'Donations',
        levels: {
            superAdmin: F,
            templeAdmin: O,
            coAdmin: L,
            religiousRepresentative: L,
            committeeRepresentative: L,
            family: L
        },
    },
    {
        key: 'submitSuggestions',
        label: 'Submit community ideas and suggestions',
        area: 'Suggestions',
        levels: {
            superAdmin: F,
            templeAdmin: F,
            coAdmin: L,
            religiousRepresentative: L,
            committeeRepresentative: L,
            family: L
        },
    },
    {
        key: 'manageOptionalModules',
        label: 'Manage enabled optional modules',
        area: 'Settings',
        levels: {
            superAdmin: F,
            templeAdmin: O,
            coAdmin: L,
            religiousRepresentative: L,
            committeeRepresentative: L,
            family: L
        },
    },
    /* Dana rows, from FR-24 to FR-29. */
    {
        key: 'viewDanaSlots',
        label: 'View available Dana slots',
        area: 'Dana Management',
        levels: {
            superAdmin: F,
            templeAdmin: O,
            coAdmin: O,
            religiousRepresentative: L,
            committeeRepresentative: L,
            family: F
        },
    },
    {
        key: 'bookDanaSlot',
        label: 'Book a Dana slot',
        area: 'Dana Management',
        levels: {
            superAdmin: F,
            templeAdmin: N,
            coAdmin: N,
            religiousRepresentative: N,
            committeeRepresentative: N,
            family: F
        },
    },
    {
        key: 'manageDanaSlots',
        label: 'Create and manage Dana slots and capacity',
        area: 'Dana Management',
        levels: {
            superAdmin: F,
            templeAdmin: O,
            coAdmin: L,
            religiousRepresentative: N,
            committeeRepresentative: N,
            family: N
        },
    },
    {
        key: 'manageDanaBookings',
        label: 'View and manage Dana bookings',
        area: 'Dana Management',
        levels: {
            superAdmin: F,
            templeAdmin: O,
            coAdmin: L,
            religiousRepresentative: L,
            committeeRepresentative: L,
            family: N
        },
    },
    {
        key: 'viewOwnBookings',
        label: 'View and cancel own Dana bookings',
        area: 'My Bookings',
        levels: {
            superAdmin: F,
            templeAdmin: N,
            coAdmin: N,
            religiousRepresentative: N,
            committeeRepresentative: N,
            family: F
        },
    },
]

export const levelFor = (role: RoleKey, permission: PermissionKey): AccessLevel => {
    /* The platform administrator holds every function in the system, always. */
    if (role === 'superAdmin') return 'full'
    const row = permissionMatrix.find((item) => item.key === permission)
    return row ? row.levels[role] : 'none'
}

/** Anything above "No access" means the function is available in some form. */
export const isAllowed = (role: RoleKey, permission: PermissionKey): boolean =>
    levelFor(role, permission) !== 'none'

/** True when the role may change something, not only look at it. */
export const canEdit = (role: RoleKey, permission: PermissionKey): boolean => {
    const level = levelFor(role, permission)
    return level === 'full' || level === 'ownTemple'
}

/** Rows of the matrix a role can see at all - used by the Roles & Permissions screen. */
export const permissionsForRole = (role: RoleKey) =>
    permissionMatrix.filter((row) => row.levels[role] !== 'none')