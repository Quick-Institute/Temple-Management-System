/**
 * Routes for the temple admin area. `authRoutes` keeps the sign-in flow and the legal pages;
 * anything behind the rail lives here so the sidebar, the router and the pages share one list.
 */
export const adminRoutes = {
    dashboard: '/dashboard',

    /* Family-side rows */
    myFamily: '/my-family',
    profile: '/profile',

    /* Committee member portal (upstream co-admin screens) */
    coAdminDashboard: '/co-admin/dashboard',

    /* Temple Information */
    templeInformation: '/temple',
    templeAdd: '/temple/add',

    /* Modules - every rail row is a real route, even while the screen is still a placeholder. */
    dana: '/dana-management',
    danaBooking: '/dana-management/booking',
    myBookings: '/my-bookings',
    events: '/event-management',
    announcements: '/announcements',
    families: '/family-members',
    donations: '/donations',
    users: '/user-management',
    reports: '/reports',
    settings: '/settings',
} as const

/** The module ids the placeholder screens are keyed by. */
export type AdminModuleKey =
    | 'dana'
    | 'events'
    | 'announcements'
    | 'families'
    | 'donations'
    | 'users'
    | 'reports'
    | 'settings'