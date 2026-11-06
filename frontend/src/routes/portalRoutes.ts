/**
 * Portal screens (family / temple admin / co-admin / super admin) that render inside MainLayout.
 * Kept separate from authRoutes so the two route groups never collide.
 */
export const portalRoutes = {
    dashboard: '/dashboard',
    danaSchedule: '/dana-schedule',
    danaBooking: '/dana-schedule/booking',
    danaConfirmation: '/dana-schedule/confirmation',
    myBookings: '/my-bookings',
    templeAdmin: '/temple-admin',
    coAdmin: '/co-admin',
    superAdmin: '/super-admin',
} as const
