import type {ReactElement} from 'react'
import {Navigate, Outlet, useParams} from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import FamilyDashboard from '../pages/family/FamilyDashboard'
import TempleAdminDashboard from '../pages/temple/TempleAdminDashboard'
import CoAdminDashboard from '../pages/temple/CoAdminDashboard'
import {homeFor} from '../data/demoUsers'
import {authRoutes} from './authRoutes'
import SuperAdminDashboard from '../pages/admin/SuperAdminDashboard'
import {useAuth} from '../context/AuthContext'
import {usePortalContext, usePortalUser} from './portalContext'

/** Shared shell (our side menu + top bar) for every portal route. */
export const PortalLayout = () => {
    const {role} = usePortalContext()
    const {user} = useAuth()
    return (
        <MainLayout role={role} userName={user?.name}
                    avatarSrc={user && ['coAdmin', 'committeeRepresentative', 'religiousRepresentative'].includes(user.role) ? '/co-admin-avatar.svg' : undefined}>
            <Outlet/>
        </MainLayout>
    )
}

/** Family-only pages; other roles use their own Dana management routes. */
export const FamilyOnly = ({children}: { children: ReactElement }) => {
    const {role} = usePortalContext()
    return role === 'family' ? children : <Navigate to="/dashboard" replace/>
}

/** Temporary page for portal routes that have no screen yet. */
export const PlaceholderPage = () => {
    const {page} = useParams()
    const title = (page ?? 'Page')
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    return (
        <div className="mx-auto max-w-7xl">
            <div className="card p-6">
                <h1 className="font-temple text-[1.6rem] text-sage-900">{title}</h1>
                <p className="mt-2 text-[0.95rem] text-ink-soft">
                    This screen is not built yet. Everything in the side menu works - this one simply has
                    no content to show at the moment.
                </p>
            </div>
        </div>
    )
}

/**
 * /dashboard - the dashboard that belongs to the signed-in user type:
 *   family member  -> upstream family dashboard (Dana cards, family overview)
 *   temple admin   -> temple admin dashboard (stats, schedule, notices)
 *   committee      -> the co-admin view of the same dashboard
 */
export const DashboardRoute = ({dashboardRole}: {dashboardRole?: 'templeAdmin' | 'coAdmin'} = {}) => {
    const {role} = usePortalContext()
    const user = usePortalUser()
    // Restored dashboards use the authenticated role, including the existing staff mapping.
    if (dashboardRole) {
        if (!user) return <Navigate to={authRoutes.login} replace/>
        if (user.role !== dashboardRole) return <Navigate to={homeFor(user.role!)} replace/>
        return dashboardRole === 'templeAdmin'
            ? <TempleAdminDashboard user={user}/>
            : <CoAdminDashboard user={user}/>
    }
    if (role === 'superAdmin') return <SuperAdminDashboard user={user}/>
    if (role === 'templeAdmin' || role === 'coAdmin') {
        const dashboard = role === 'templeAdmin' ? '/temple-admin/dashboard' : '/co-admin/dashboard'
        return <Navigate to={dashboard} replace/>
    }
    return <FamilyDashboard user={user}/>
}