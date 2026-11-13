/* Rail definitions per role. An item appears only when the role holds its permission. */

import type {PermissionKey, RoleKey} from './permissions'

export type IconKey =
    | 'home'
    | 'family'
    | 'dana'
    | 'bookings'
    | 'events'
    | 'profile'
    | 'settings'
    | 'temple'
    | 'announcements'
    | 'donations'
    | 'users'
    | 'reports'
    | 'roles'
    | 'audit'
    | 'platform'

export type NavItemDef = {
    label: string
    icon: IconKey
    to: string
    /** Function this row needs. Rows without one are always visible (Dashboard, Profile). */
    permission?: PermissionKey
    /** Extra guard for roles the raw matrix would also allow (e.g. family "own records"). */
    roles?: RoleKey[]
}

export const TEMPLE_SUBNAV: NavItemDef[] = [
    {label: 'All Temples', icon: 'temple', to: '/temple', permission: 'manageTempleInformation'},
    {label: 'Add Temple', icon: 'temple', to: '/temple/add', permission: 'manageTempleInformation'},
]

export const DANA_SUBNAV: NavItemDef[] = [
    {label: 'Dana Schedule', icon: 'dana', to: '/dana-management', permission: 'viewDanaSlots'},
    {label: 'Book Dana', icon: 'bookings', to: '/dana-management/booking', permission: 'bookDanaSlot'},
    {label: 'Bookings', icon: 'bookings', to: '/my-bookings', permission: 'viewOwnBookings'},
]

const STAFF: RoleKey[] = ['templeAdmin', 'coAdmin', 'religiousRepresentative', 'committeeRepresentative']

export const NAV_BY_ROLE: Record<RoleKey, NavItemDef[]> = {
    /* The platform administrator holds every function, so the rail lists the whole system. */
    superAdmin: [
        {label: 'Dashboard', icon: 'home', to: '/super-admin/dashboard'},
        {label: 'Temples', icon: 'temple', to: '/temple', permission: 'registerApproveTemples'},
        {
            label: 'Registration Status',
            icon: 'platform',
            to: '/temple-registration',
            permission: 'manageRegistrationStatus'
        },
        {label: 'User Management', icon: 'users', to: '/user-management', permission: 'manageUserRoles'},
        {label: 'Family Members', icon: 'family', to: '/family-members', permission: 'registerFamilyQr'},
        {label: 'Dana Management', icon: 'dana', to: '/dana-management', permission: 'viewDanaSlots'},
        {label: 'Event Management', icon: 'events', to: '/event-management', permission: 'manageTempleRecords'},
        {label: 'Announcements', icon: 'announcements', to: '/announcements', permission: 'manageAnnouncements'},
        {label: 'Donations', icon: 'donations', to: '/donations', permission: 'viewDonations'},
        {label: 'Audit Logs', icon: 'audit', to: '/reports', permission: 'viewPlatformAudit'},
        {label: 'Platform Settings', icon: 'settings', to: '/settings', permission: 'managePlatformSettings'},
        {label: 'Profile', icon: 'profile', to: '/profile'},
    ],
    templeAdmin: [
        {label: 'Dashboard', icon: 'home', to: '/temple-admin/dashboard'},
        {label: 'Temple Information', icon: 'temple', to: '/temple', permission: 'manageTempleInformation'},
        {label: 'Dana Management', icon: 'dana', to: '/dana-management', permission: 'viewDanaSlots', roles: STAFF},
        {label: 'Event Management', icon: 'events', to: '/event-management', permission: 'manageTempleRecords'},
        {label: 'Announcements', icon: 'announcements', to: '/announcements', permission: 'manageAnnouncements'},
        {label: 'Family Members', icon: 'family', to: '/family-members', permission: 'registerFamilyQr', roles: STAFF},
        {label: 'Donations', icon: 'donations', to: '/donations', permission: 'viewDonations', roles: STAFF},
        {label: 'User Management', icon: 'users', to: '/user-management', permission: 'manageUserRoles'},
        {label: 'Reports', icon: 'reports', to: '/reports', permission: 'viewTempleAudit'},
        {label: 'Settings', icon: 'settings', to: '/settings', permission: 'manageOptionalModules'},
    ],
    coAdmin: [
        {label: 'Dashboard', icon: 'home', to: '/co-admin/dashboard'},
        {label: 'Temple Information', icon: 'temple', to: '/temple', permission: 'manageTempleInformation'},
        {label: 'Dana Management', icon: 'dana', to: '/dana-management', permission: 'viewDanaSlots', roles: STAFF},
        {label: 'Event Management', icon: 'events', to: '/event-management', permission: 'manageTempleRecords'},
        {label: 'Announcements', icon: 'announcements', to: '/announcements', permission: 'manageAnnouncements'},
        {label: 'Family Members', icon: 'family', to: '/family-members', permission: 'registerFamilyQr', roles: STAFF},
        {label: 'Donations', icon: 'donations', to: '/donations', permission: 'viewDonations', roles: STAFF},
        {label: 'User Management', icon: 'users', to: '/user-management', permission: 'manageUserRoles'},
        {label: 'Reports', icon: 'reports', to: '/reports', permission: 'viewTempleAudit'},
        {label: 'Profile', icon: 'profile', to: '/profile'},
        {label: 'Settings', icon: 'settings', to: '/settings', permission: 'manageOptionalModules'},
    ],
    religiousRepresentative: [
        {label: 'Dashboard', icon: 'home', to: '/co-admin/dashboard'},
        {label: 'Temple Information', icon: 'temple', to: '/temple', permission: 'manageTempleInformation'},
        {label: 'Dana Management', icon: 'dana', to: '/dana-management', permission: 'viewDanaSlots', roles: STAFF},
        {label: 'Events', icon: 'events', to: '/event-management', permission: 'manageTempleRecords'},
        {label: 'Announcements', icon: 'announcements', to: '/announcements', permission: 'manageAnnouncements'},
        {label: 'Donations', icon: 'donations', to: '/donations', permission: 'viewDonations', roles: STAFF},
        {label: 'Profile', icon: 'profile', to: '/profile'},
        {label: 'Settings', icon: 'settings', to: '/settings', permission: 'manageOptionalModules'},
    ],
    committeeRepresentative: [
        {label: 'Dashboard', icon: 'home', to: '/co-admin/dashboard'},
        {label: 'Temple Information', icon: 'temple', to: '/temple', permission: 'manageTempleInformation'},
        {label: 'Dana Management', icon: 'dana', to: '/dana-management', permission: 'viewDanaSlots', roles: STAFF},
        {label: 'Events', icon: 'events', to: '/event-management', permission: 'manageTempleRecords'},
        {label: 'Announcements', icon: 'announcements', to: '/announcements', permission: 'manageAnnouncements'},
        {label: 'Donations', icon: 'donations', to: '/donations', permission: 'viewDonations', roles: STAFF},
        // Committee members manage their own committee here; the screen is read-only for them.
        {label: 'User Management', icon: 'users', to: '/user-management', permission: 'manageUserRoles'},
        // No Reports row: the matrix gives committee/donor representatives no audit-log access.
        {label: 'Profile', icon: 'profile', to: '/profile'},
        {label: 'Settings', icon: 'settings', to: '/settings', permission: 'manageOptionalModules'},
    ],
    family: [
        {label: 'Dashboard', icon: 'home', to: '/dashboard'},
        {label: 'Temple Information', icon: 'temple', to: '/temple', permission: 'manageTempleInformation'},
        {label: 'My Family', icon: 'family', to: '/my-family', permission: 'changeRegisteredTemple'},
        {label: 'Dana Schedule', icon: 'dana', to: '/dana-management', permission: 'viewDanaSlots'},
        {label: 'My Bookings', icon: 'bookings', to: '/my-bookings', permission: 'viewOwnBookings'},
        {label: 'Events', icon: 'events', to: '/event-management', permission: 'manageTempleRecords'},
        {label: 'Profile', icon: 'profile', to: '/profile'},
        {label: 'Settings', icon: 'settings', to: '/settings', permission: 'manageOptionalModules'},
    ],
}

/** Sub-menus (Temple Information, Dana Management) per role. */
export const SUBNAV_BY_ROLE: Record<RoleKey, Record<string, NavItemDef[]>> = {
    superAdmin: {},
    templeAdmin: {
        'Temple Information': TEMPLE_SUBNAV,
        'Dana Management': DANA_SUBNAV.filter((i) => i.label === 'Dana Schedule')
    },
    /* A Co-Administrator serves one temple, so there is no list and no create row to offer. */
    coAdmin: {'Dana Management': DANA_SUBNAV.filter((i) => i.label === 'Dana Schedule')},
    religiousRepresentative: {},
    committeeRepresentative: {},
    family: {},
}

/*
 * The rail keeps its rows in English and this map turns them into a translation key, so a menu
 * row reads the same in both languages without the permission matrix having to know about i18n.
 */
const LABEL_KEYS: Record<string, string> = {
    'Dashboard': 'nav.dashboard',
    'Temples': 'nav.temples',
    'Registration Status': 'nav.registrationStatus',
    'User Management': 'nav.userManagement',
    'Family Members': 'nav.familyMembers',
    'Dana Management': 'nav.danaManagement',
    'Event Management': 'nav.eventManagement',
    'Events': 'nav.events',
    'Announcements': 'nav.announcements',
    'Donations': 'nav.donations',
    'Audit Logs': 'nav.auditLogs',
    'Platform Settings': 'nav.platformSettings',
    'Profile': 'nav.profile',
    'Temple Information': 'nav.templeInformation',
    'All Temples': 'nav.allTemples',
    'Add Temple': 'nav.addTemple',
    'Dana Schedule': 'nav.danaSchedule',
    'Book Dana': 'nav.bookDana',
    'Bookings': 'nav.bookings',
    'My Family': 'nav.myFamily',
    'My Bookings': 'nav.myBookings',
    'Reports': 'nav.reports',
    'Settings': 'nav.settings',
}

/** Translate a rail row for display; unknown rows stay as they are. */
export const navLabel = (label: string, t: (key: string) => string): string => {
    const key = LABEL_KEYS[label]
    return key ? t(key) : label
}